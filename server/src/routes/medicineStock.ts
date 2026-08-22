import { Router } from "express";
import MedicineStock from "../models/MedicineStock";
import { calculateDepletion } from "../utils/forecast";
import "../models/Country";
import { findRedistributionMatches } from "../utils/redistribution";
import { generateAlertText, generateRedistributionText } from "../utils/gemini";
import { requireAuth } from "../middleware/auth";
const router = Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const phc = req.query.phc as string | undefined;
    const filter = phc ? { phc } : {};
    const stock = await MedicineStock.find(filter).populate("phc");
    res.json(stock);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stock" });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const { phc, medicineName, quantity, unit, dailyConsumptionRate } = req.body;
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
  } catch (err) {
    res.status(500).json({ error: "Failed to create stock record" });
  }
});

router.patch("/:id", requireAuth, async (req, res) => {
  try {
    const { quantity } = req.body;
    const stock = await MedicineStock.findByIdAndUpdate(
      req.params.id,
      { quantity, lastRestockedAt: Date.now() },
      { new: true }
    );
    if (!stock) {
      return res.status(404).json({ error: "Stock record not found" });
    }
    res.json(stock);
  } catch (err) {
    res.status(500).json({ error: "Failed to update stock" });
  }
});

router.get("/alerts", requireAuth, async (req, res) => {
  try {
    const state = req.query.state as string | undefined;

    const stock = await MedicineStock.find().populate("phc");

    const filtered = state
      ? stock.filter((s: any) => s.phc?.state === state)
      : stock;

    const risky = filtered
      .map((item: any) => {
        const { daysRemaining, status } = calculateDepletion(
          item.quantity,
          item.dailyConsumptionRate
        );
        return { item, daysRemaining, status };
      })
      .filter((a) => a.status !== "healthy")
      .sort((a, b) => a.daysRemaining - b.daysRemaining)
      .slice(0, 3);

    const alerts = [];
    for (const { item, daysRemaining, status } of risky) {
      let message = `${item.medicineName} at ${item.phc?.name} will run out in ${daysRemaining} days.`;
      try {
        message = await generateAlertText(
          item.phc?.name,
          item.phc?.state,
          item.medicineName,
          daysRemaining
        );
      } catch (err) {
        console.error("Gemini call failed, using fallback message:", err);
      }
      alerts.push({
        id: item._id,
        phcName: item.phc?.name,
        stateName: item.phc?.state,
        medicineName: item.medicineName,
        quantity: item.quantity,
        daysRemaining,
        status,
        message,
      });
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    res.json(alerts);
  } catch (err) {
    console.error("Alerts route error:", err);
    res.status(500).json({ error: "Failed to compute stock alerts" });
  }
});
router.get("/redistribution", requireAuth, async (_req, res) => {
  try {
    const stock = await MedicineStock.find().populate("phc");

    const stockItems = stock.map((item: any) => ({
      phcId: item.phc?._id?.toString(),
      phcName: item.phc?.name,
      state: item.phc?.state,
      medicineName: item.medicineName,
      quantity: item.quantity,
      dailyConsumptionRate: item.dailyConsumptionRate,
    }));

    const matches = findRedistributionMatches(stockItems).slice(0, 3);

    const suggestions = [];
    for (const match of matches) {
      let message = `Transfer ${match.suggestedTransferAmount} units of ${match.medicineName} from ${match.fromPhcName} (${match.fromState}) to ${match.toPhcName} (${match.toState}).`;
      try {
        message = await generateRedistributionText(
          match.medicineName,
          match.fromPhcName,
          match.fromState,
          match.toPhcName,
          match.toState,
          match.suggestedTransferAmount
        );
      } catch (err) {
        console.error("Gemini redistribution call failed, using fallback:", err);
      }
      suggestions.push({ ...match, message });
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    res.json(suggestions);
  } catch (err) {
    console.error("Redistribution route error:", err);
    res.status(500).json({ error: "Failed to compute redistribution suggestions" });
  }
});

export default router;