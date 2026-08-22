import { Router } from "express";
import PHC from "../models/PHC";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const country = req.query.country as string | undefined;
    const filter = country ? { country } : {};
    const phcs = await PHC.find(filter).populate("country");
    res.json(phcs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch PHCs" });
  }
});

router.post("/", requireAuth, requireRole("regional_admin"), async (req, res) => {
  try {
    const { name, country, state, district, city, location } = req.body;
    if (!name || !country || !state || !district || !city) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const phc = await PHC.create({ name, country, state, district, city, location });
    res.status(201).json(phc);
  } catch (err) {
    res.status(500).json({ error: "Failed to create PHC" });
  }
});

router.delete("/:id", requireAuth, requireRole("regional_admin"), async (req, res) => {
  try {
    const phc = await PHC.findByIdAndDelete(req.params.id);
    if (!phc) {
      return res.status(404).json({ error: "PHC not found" });
    }
    res.json({ message: "PHC deleted" });
  } catch (err) {
    console.error("PHC delete error:", err);
    res.status(500).json({ error: "Failed to delete PHC" });
  }
});

export default router;