import { Router } from "express";
import axios from "axios";
import PHC from "../models/PHC";
import MedicineStock from "../models/MedicineStock";
import Attendance from "../models/Attendance";
import { calculateDepletion } from "../utils/forecast";
import { generateRiskExplanation } from "../utils/gemini";

const router = Router();

router.get("/", async (_req, res) => {
  const phcs = await PHC.find().populate("country");
  const results = [];

  for (const phc of phcs.filter((p: any) => p.country).slice(0, 6)) {
    const countryName = (phc as any).country.name;
    const stock = await MedicineStock.find({ phc: phc._id });
    const attendanceRecords = await Attendance.find({ phc: phc._id })
      .sort({ date: -1 })
      .limit(10);

    const minDaysRemaining = stock.length
      ? Math.min(...stock.map((s) => calculateDepletion(s.quantity, s.dailyConsumptionRate).daysRemaining))
      : 999;
    const days = minDaysRemaining === 999 ? 30 : minDaysRemaining;

    const attendanceRate = attendanceRecords.length
      ? attendanceRecords.filter((a) => a.present).length / attendanceRecords.length
      : 1;

    let score = 50;
    let level: "critical" | "elevated" | "stable" = "elevated";
    try {
      const pyRes = await axios.post(
        `${process.env.PYTHON_SERVICE_URL || "http://localhost:8001"}/risk-score`,
        { minDaysRemaining: days, attendanceRate }
      );
      score = pyRes.data.score;
      level = pyRes.data.level;
    } catch (err) {
      console.error("Python risk service call failed, using fallback:", err);
    }

    let explanation = `Risk score ${score}/100 based on stock and staffing levels.`;
    try {
      explanation = await generateRiskExplanation(phc.name, countryName, score, days, attendanceRate);
    } catch (err) {
      console.error("Gemini risk explanation failed, using fallback:", err);
    }

    results.push({ phcId: phc._id, phcName: phc.name, countryName, score, level, explanation });

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  results.sort((a, b) => b.score - a.score);
  res.json(results);
});

export default router;