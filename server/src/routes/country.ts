import { Router } from "express";
import Country from "../models/Country";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/", requireAuth, async (_req, res) => {
  res.json(await Country.find());
});

export default router;