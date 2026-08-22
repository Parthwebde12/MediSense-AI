import { Router } from "express";
import Attendance from "../models/Attendance";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const phc = req.query.phc as string | undefined;
    const filter = phc ? { phc } : {};
    const records = await Attendance.find(filter).populate("phc").sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch attendance" });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const { phc, staffName, role, date, present, patientFootfall } = req.body;
    if (!phc || !staffName || !role) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const record = await Attendance.create({
      phc,
      staffName,
      role,
      date,
      present,
      patientFootfall,
    });
    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ error: "Failed to create attendance record" });
  }
});

export default router;