import { Router } from "express";
import axios from "axios";
import PHC from "../models/PHC";
import MedicineStock from "../models/MedicineStock";
import Attendance from "../models/Attendance";
import { calculateDepletion } from "../utils/forecast";
import { generateRiskExplanation } from "../utils/gemini";
import "../models/Country";

const router = Router();

router.get("/", async (_req, res) => {
  try {
        const phcs = await PHC.find().populate("country");
    const results = [];

    for (const phc of phcs.filter((p: any) => p.country).slice(0, 6)) {
      const stock = await MedicineStock.find({ phc: phc._id });
      const attendanceRecords = await Attendance.find({ phc: phc._id })
        .sort({ date: -1 })
        .limit(10);

      const minDaysRemaining = stock.length
        ? Math.min(
            ...stock.map(
              (s) => calculateDepletion(s.quantity, s.dailyConsumptionRate).daysRemaining
            )
          )
        : 999;

      const attendanceRate = attendanceRecords.length
        ? attendanceRecords.filter((a) => a.present).length / attendanceRecords.length
        : 1;

      let score = 50;
      let level: "critical" | "elevated" | "stable" = "elevated";
      try {
       const pyRes = await axios.post(`${process.env.PYTHON_SERVICE_URL || "http://localhost:8001"}/risk-score`, {
          minDaysRemaining: minDaysRemaining === 999 ? 30 : minDaysRemaining,
          attendanceRate,
        });
        score = pyRes.data.score;
        level = pyRes.data.level;
      } catch (err) {
        console.error("Python risk service call failed, using fallback:", err);
      }

      let explanation = `Risk score ${score}/100 based on stock and staffing levels.`;
      try {
        explanation = await generateRiskExplanation(
          phc.name,
          (phc as any).country?.name ?? "Unknown",
          score,
          minDaysRemaining === 999 ? 30 : minDaysRemaining,
          attendanceRate
        );
      } catch (err) {
        console.error("Gemini risk explanation failed, using fallback:", err);
      }

      results.push({
        phcId: phc._id,
        phcName: phc.name,
        countryName: (phc as any).country?.name ?? "Unknown",
        score,
        level,
        explanation,
      });

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    results.sort((a, b) => b.score - a.score);
    res.json(results);
  } catch (err) {
    console.error("Risk route error:", err);
    res.status(500).json({ error: "Failed to compute risk scores" });
  }
});

export default router;