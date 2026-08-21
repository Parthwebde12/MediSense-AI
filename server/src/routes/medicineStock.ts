import { Router } from "express";
import MedicineStock from "../models/MedicineStock";
import { calculateDepletion } from "../utils/forecast";
import { generateAlertText } from "../utils/gemini";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const phc = req.query.phc as string | undefined;
    const filter = phc ? { phc } : {};
    const stock = await MedicineStock.find(filter).populate("phc");
    res.json(stock);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stock" });
  }
});

router.post("/", async (req, res) => {
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

router.patch("/:id", async (req, res) => {
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

router.get("/alerts", async (req, res) => {
  try {
    const country = req.query.country as string | undefined;

    const stock = await MedicineStock.find().populate({
      path: "phc",
      populate: { path: "country" },
    });

    const filtered = country
      ? stock.filter((s: any) => s.phc?.country?._id?.toString() === country)
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
      .slice(0, 5); // limit Gemini calls to top 5 most urgent

    const alerts = await Promise.all(
      risky.map(async ({ item, daysRemaining, status }) => {
        let message = `${item.medicineName} at ${item.phc?.name} will run out in ${daysRemaining} days.`;
        try {
          message = await generateAlertText(
            item.phc?.name,
            item.phc?.country?.name,
            item.medicineName,
            daysRemaining
          );
        } catch (err) {
          console.error("Gemini call failed, using fallback message:", err);
        }
        return {
          id: item._id,
          phcName: item.phc?.name,
          countryName: item.phc?.country?.name,
          medicineName: item.medicineName,
          quantity: item.quantity,
          daysRemaining,
          status,
          message,
        };
      })
    );

    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: "Failed to compute stock alerts" });
  }
});

export default router;