import { Router } from "express";
import PHC from "../models/PHC";

const router = Router();

router.get("/", async (req, res) => {
  try {
   const country = req.query.country as string | undefined;
const filter = country ? { country } : {};
    const phcs = await PHC.find(filter).populate("country");
    res.json(phcs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch PHCs" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, country, district, location } = req.body;
    if (!name || !country || !district) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const phc = await PHC.create({ name, country, district, location });
    res.status(201).json(phc);
  } catch (err) {
    res.status(500).json({ error: "Failed to create PHC" });
  }
});

export default router;