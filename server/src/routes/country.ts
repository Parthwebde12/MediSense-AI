import { Router } from "express";
import Country from "../models/Country";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const countries = await Country.find();
    res.json(countries);
  } catch (err) {
    console.error("Country route error:", err);
    res.status(500).json({ error: "Failed to fetch countries" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, code } = req.body;
    if (!name || !code) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const country = await Country.create({ name, code });
    res.status(201).json(country);
  } catch (err) {
    console.error("Country create error:", err);
    res.status(500).json({ error: "Failed to create country" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const country = await Country.findByIdAndDelete(req.params.id);
    if (!country) {
      return res.status(404).json({ error: "Country not found" });
    }
    res.json({ message: "Country deleted" });
  } catch (err) {
    console.error("Country delete error:", err);
    res.status(500).json({ error: "Failed to delete country" });
  }
});

export default router;