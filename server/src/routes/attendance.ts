import { Router } from "express";
import Attendance from "../models/Attendance";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  const phc = req.query.phc as string | undefined;
  const records = await Attendance.find(phc ? { phc } : {})
    .populate("phc")
    .sort({ date: -1 });
  res.json(records.filter((r) => r.phc));
});

router.post("/", requireAuth, requireRole("regional_admin"), async (req, res) => {
  const { phc, staffName, role, date, present, patientFootfall } = req.body;
  if (!phc || !staffName || !role) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const record = await Attendance.create({ phc, staffName, role, date, present, patientFootfall });
  res.status(201).json(record);
});

export default router;