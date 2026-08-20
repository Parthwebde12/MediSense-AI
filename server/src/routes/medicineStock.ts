import { Router } from "express";
import MedicineStock from "../models/MedicineStock";

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

export default router;