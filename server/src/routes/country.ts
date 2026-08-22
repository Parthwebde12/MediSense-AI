import { Router } from "express";
import Country from "../models/Country";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const countries = await Country.find();
    res.json(countries);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch countries" });
  }
});

export default router;