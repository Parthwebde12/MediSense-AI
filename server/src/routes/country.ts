import { Router } from "express";
import Country from "../models/Country";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

router.get("/", requireAuth, async (_req, res) => {
  try {
    const countries = await Country.find();
    res.json(countries);
  } catch (err) {
    console.error("Country route error:", err);
    res.status(500).json({ error: "Failed to fetch countries" });
  }
});

router.post("/", requireAuth, requireRole("regional_admin"), async (req, res) => {
  try {
    const { name, code } = req.body;
    if (!name || !code) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    if (code.toUpperCase() !== "IN" || name.trim().toLowerCase() !== "india") {
      return res.status(400).json({ error: "This deployment only supports India" });
    }
    const country = await Country.create({ name, code });
    res.status(201).json(country);
  } catch (err) {
    console.error("Country create error:", err);
    res.status(500).json({ error: "Failed to create country" });
  }
});

router.delete("/:id", requireAuth, requireRole("regional_admin"), async (req, res) => {
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