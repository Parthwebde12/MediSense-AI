import { Router } from "express";
import PHC from "../models/PHC";
import { requireAuth, requireRole } from "../middleware/auth";
import MedicineStock from "../models/MedicineStock";
import Attendance from "../models/Attendance";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  const country = req.query.country as string | undefined;
  res.json(await PHC.find(country ? { country } : {}).populate("country"));
});

router.post("/", requireAuth, requireRole("regional_admin"), async (req, res) => {
  const { name, country, state, district, city } = req.body;
  if (!name || !country || !state || !district || !city) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const phc = await PHC.create({ name, country, state, district, city });
  res.status(201).json(phc);
});

router.delete("/:id", requireAuth, requireRole("regional_admin"), async (req, res) => {
  const phc = await PHC.findByIdAndDelete(req.params.id);
  if (!phc) {
    return res.status(404).json({ error: "PHC not found" });
  }
  const [stockResult, attendanceResult] = await Promise.all([
    MedicineStock.deleteMany({ phc: phc._id }),
    Attendance.deleteMany({ phc: phc._id }),
  ]);
  res.json({
    message: "PHC deleted",
    deletedStockRecords: stockResult.deletedCount,
    deletedAttendanceRecords: attendanceResult.deletedCount,
  });
});

export default router;