import { Router } from "express";
import MedicineStock from "../models/MedicineStock";
import { calculateDepletion } from "../utils/forecast";
import { findRedistributionMatches } from "../utils/redistribution";
import { findStockWithPhc, toStockItems } from "../utils/stock";
import { generateAlertText, generateRedistributionText, parseLang } from "../utils/gemini";
import { isNonNegativeNumber } from "../utils/validate";
import { requireAuth, requireRole } from "../middleware/auth";
import { aiLimiter } from "../middleware/ratelimit";

const router = Router();

const MAX_ALERTS = 3;
const MAX_SUGGESTIONS = 3;
const TREND_DAYS = 14;

const alertMessageCache = new Map<string, { daysRemaining: number; message: string }>();
const redistributionMessageCache = new Map<string, string>();

router.get("/", requireAuth, async (req, res) => {
  res.json(await findStockWithPhc(req.query.phc as string | undefined));
});

router.post("/", requireAuth, requireRole("regional_admin"), async (req, res) => {
  const { phc, medicineName, quantity, unit, dailyConsumptionRate } = req.body;
  if (!phc || !medicineName || quantity === undefined || !unit) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  if (
    !isNonNegativeNumber(quantity) ||
    (dailyConsumptionRate !== undefined && !isNonNegativeNumber(dailyConsumptionRate))
  ) {
    return res.status(400).json({ error: "Quantity and daily consumption must be non-negative numbers" });
  }
  const stock = await MedicineStock.create({ phc, medicineName, quantity, unit, dailyConsumptionRate });
  res.status(201).json(stock);
});

router.patch("/:id", requireAuth, requireRole("regional_admin"), async (req, res) => {
  const { quantity } = req.body;
  if (!isNonNegativeNumber(quantity)) {
    return res.status(400).json({ error: "quantity must be a non-negative number" });
  }
  const stock = await MedicineStock.findByIdAndUpdate(
    req.params.id,
    { quantity, lastRestockedAt: Date.now() },
    { new: true },
  );
  if (!stock) {
    return res.status(404).json({ error: "Stock record not found" });
  }
  res.json(stock);
});

router.get("/alerts", requireAuth, aiLimiter, async (req, res) => {
  const state = req.query.state as string | undefined;
  const lang = parseLang(req.query.lang);
  const stock = (await findStockWithPhc()).filter((s) => !state || s.phc.state === state);

  const risky = stock
    .map((item) => ({ item, ...calculateDepletion(item.quantity, item.dailyConsumptionRate) }))
    .filter((a) => a.status !== "healthy")
    .sort((a, b) => a.daysRemaining - b.daysRemaining)
    .slice(0, MAX_ALERTS);

  const alerts = [];
  for (const { item, daysRemaining, status } of risky) {
    const cacheKey = `${item._id.toString()}-${lang}`;
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
          lang,
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

router.get("/redistribution", requireAuth, aiLimiter, async (req, res) => {
  const lang = parseLang(req.query.lang);
  const matches = findRedistributionMatches(toStockItems(await findStockWithPhc()));

  const suggestions = [];
  for (const match of matches.slice(0, MAX_SUGGESTIONS)) {
    const cacheKey = `${match.fromPhcName}-${match.toPhcName}-${match.medicineName}-${match.suggestedTransferAmount}-${lang}`;

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
          lang,
        );
        redistributionMessageCache.set(cacheKey, message);
      } catch (err) {
        console.error("Gemini redistribution call failed, using fallback:", err);
      }
    }

    suggestions.push({ ...match, message });
  }

  res.json(suggestions);
});

router.get("/:id/trend", requireAuth, async (req, res) => {
  const stock = await MedicineStock.findById(req.params.id);
  if (!stock) {
    return res.status(404).json({ error: "Stock record not found" });
  }

  const trend = Array.from({ length: TREND_DAYS + 1 }, (_, day) => ({
    day,
    quantity: Math.max(0, Math.round(stock.quantity - stock.dailyConsumptionRate * day)),
  }));

  res.json({
    medicineName: stock.medicineName,
    unit: stock.unit,
    dailyConsumptionRate: stock.dailyConsumptionRate,
    trend,
  });
});

export default router;