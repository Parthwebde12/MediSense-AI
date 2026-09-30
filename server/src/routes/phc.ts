import { Router } from "express";
import PHC from "../models/PHC";
import MedicineStock from "../models/MedicineStock";
import Attendance from "../models/Attendance";
import { requireAuth, requireRole } from "../middleware/auth";
import { isNonNegativeNumber } from "../utils/validate";

const router = Router();

/** Returns an error message, or null when the bed counts are valid. */
const validateBeds = (totalBeds: unknown, occupiedBeds: unknown): string | null => {
  if (!isNonNegativeNumber(totalBeds) || !isNonNegativeNumber(occupiedBeds)) {
    return "Beds must be non-negative numbers";
  }
  if (occupiedBeds > totalBeds) {
    return "Occupied beds cannot exceed total beds";
  }
  return null;
};

router.get("/", requireAuth, async (_req, res) => {
  res.json(await PHC.find());
});

router.post("/", requireAuth, requireRole("regional_admin"), async (req, res) => {
  const { name, state, district, city, totalBeds = 0, occupiedBeds = 0 } = req.body;
  if (!name || !state || !district || !city) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const bedsError = validateBeds(totalBeds, occupiedBeds);
  if (bedsError) {
    return res.status(400).json({ error: bedsError });
  }
  const phc = await PHC.create({ name, state, district, city, totalBeds, occupiedBeds });
  res.status(201).json(phc);
});

router.patch("/:id/beds", requireAuth, requireRole("regional_admin"), async (req, res) => {
  const { totalBeds, occupiedBeds } = req.body;
  if (totalBeds === undefined && occupiedBeds === undefined) {
    return res.status(400).json({ error: "Provide totalBeds and/or occupiedBeds" });
  }
  const phc = await PHC.findById(req.params.id);
  if (!phc) return res.status(404).json({ error: "PHC not found" });

  const nextTotal = totalBeds ?? phc.totalBeds;
  const nextOccupied = occupiedBeds ?? phc.occupiedBeds;
  const bedsError = validateBeds(nextTotal, nextOccupied);
  if (bedsError) {
    return res.status(400).json({ error: bedsError });
  }

  phc.totalBeds = nextTotal;
  phc.occupiedBeds = nextOccupied;
  await phc.save();
  res.json(phc);
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