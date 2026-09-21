import { Router } from "express";
import MedicineStock from "../models/MedicineStock";
import { calculateDepletion } from "../utils/forecast";
import { findRedistributionMatches } from "../utils/redistribution";
import { generateAlertText, generateRedistributionText } from "../utils/gemini";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

const alertMessageCache = new Map<
  string,
  { daysRemaining: number; message: string }
>();
const redistributionMessageCache = new Map<string, string>();

router.get("/", requireAuth, async (req, res) => {
  const phc = req.query.phc as string | undefined;
  const stock = await MedicineStock.find(phc ? { phc } : {}).populate("phc");
  res.json(stock.filter((item) => item.phc));
});

router.post(
  "/",
  requireAuth,
  requireRole("regional_admin"),
  async (req, res) => {
    const { phc, medicineName, quantity, unit, dailyConsumptionRate } =
      req.body;
    if (!phc || !medicineName || quantity === undefined || !unit) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const stock = await MedicineStock.create({
      phc,
      medicineName,
      quantity,
      unit,
      dailyConsumptionRate,
    });
    res.status(201).json(stock);
  },
);

router.patch(
  "/:id",
  requireAuth,
  requireRole("regional_admin"),
  async (req, res) => {
    const { quantity } = req.body;
    const stock = await MedicineStock.findByIdAndUpdate(
      req.params.id,
      { quantity, lastRestockedAt: Date.now() },
      { new: true },
    );
    if (!stock) {
      return res.status(404).json({ error: "Stock record not found" });
    }
    res.json(stock);
  },
);

router.get("/alerts", requireAuth, async (req, res) => {
  const state = req.query.state as string | undefined;
  const stock = (await MedicineStock.find().populate("phc")).filter(
    (s: any) => s.phc,
  );
  const filtered = state
    ? stock.filter((s: any) => s.phc.state === state)
    : stock;

  const risky = filtered
    .map((item: any) => ({
      item,
      ...calculateDepletion(item.quantity, item.dailyConsumptionRate),
    }))
    .filter((a) => a.status !== "healthy")
    .sort((a, b) => a.daysRemaining - b.daysRemaining)
    .slice(0, 3);

  const alerts = [];
  for (const { item, daysRemaining, status } of risky) {
    const cacheKey = item._id.toString();
    const cached = alertMessageCache.get(cacheKey);

    let message = `${item.medicineName} at ${item.phc.name} will run out in ${daysRemaining} days.`;
    if (cached && cached.daysRemaining === daysRemaining) {
      message = cached.message;
    } else {
      try {
        message = await generateAlertText(
          item.phc.name,
          item.phc.state,
          item.medicineName,
          daysRemaining,
        );
        alertMessageCache.set(cacheKey, { daysRemaining, message });
      } catch (err) {
        console.error("Gemini call failed, using fallback message:", err);
      }
    }

    alerts.push({
      id: item._id,
      phcName: item.phc.name,
      stateName: item.phc.state,
      medicineName: item.medicineName,
      quantity: item.quantity,
      daysRemaining,
      status,
      message,
    });
  }

  res.json(alerts);
});

router.get("/redistribution", requireAuth, async (_req, res) => {
  const stock = (await MedicineStock.find().populate("phc")).filter(
    (item: any) => item.phc,
  );

  const stockItems = stock.map((item: any) => ({
    phcId: item.phc._id.toString(),
    phcName: item.phc.name,
    state: item.phc.state,
    medicineName: item.medicineName,
    quantity: item.quantity,
    dailyConsumptionRate: item.dailyConsumptionRate,
  }));

  const suggestions = [];
  for (const match of findRedistributionMatches(stockItems).slice(0, 3)) {
    const cacheKey = `${match.fromPhcName}-${match.toPhcName}-${match.medicineName}-${match.suggestedTransferAmount}`;

    let message =
      redistributionMessageCache.get(cacheKey) ??
      `Transfer ${match.suggestedTransferAmount} units of ${match.medicineName} from ${match.fromPhcName} (${match.fromState}) to ${match.toPhcName} (${match.toState}).`;

    if (!redistributionMessageCache.has(cacheKey)) {
      try {
        message = await generateRedistributionText(
          match.medicineName,
          match.fromPhcName,
          match.fromState,
          match.toPhcName,
          match.toState,
          match.suggestedTransferAmount,
        );
        redistributionMessageCache.set(cacheKey, message);
      } catch (err) {
        console.error(
          "Gemini redistribution call failed, using fallback:",
          err,
        );
      }
    }

    suggestions.push({ ...match, message });
  }

  res.json(suggestions);
});

export default router;
