import { Router } from "express";
import axios from "axios";
import PHC from "../models/PHC";
import MedicineStock from "../models/MedicineStock";
import Attendance from "../models/Attendance";
import { calculateDepletion, calculateRiskScore } from "../utils/forecast";
import { generateRiskExplanation } from "../utils/gemini";
import { requireAuth } from "../middleware/auth";

const router = Router();

const CACHE_TTL_MS = 60_000;
let cache: { at: number; data: unknown[] } | null = null;

const getRiskScore = async (minDaysRemaining: number, attendanceRate: number) => {
  try {
    const url = `${process.env.PYTHON_SERVICE_URL || "http://localhost:8001"}/risk-score`;
    const { data } = await axios.post(url, { minDaysRemaining, attendanceRate }, { timeout: 5000 });
    return { score: data.score as number, level: data.level as "critical" | "elevated" | "stable" };
  } catch (err) {
    console.error("Python risk service failed, computing locally:", err);
    return calculateRiskScore(minDaysRemaining, attendanceRate);
  }
};

router.get("/", requireAuth, async (_req, res) => {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) {
    return res.json(cache.data);
  }

  const phcs = (await PHC.find().populate("country")).filter((p: any) => p.country);

  const scored = await Promise.all(
    phcs.map(async (phc: any) => {
      const [stock, attendanceRecords] = await Promise.all([
        MedicineStock.find({ phc: phc._id }),
        Attendance.find({ phc: phc._id }).sort({ date: -1 }).limit(10),
      ]);

      const finiteDays = stock
        .map((s) => calculateDepletion(s.quantity, s.dailyConsumptionRate).daysRemaining)
        .filter(Number.isFinite);
      const days = finiteDays.length ? Math.min(...finiteDays) : 30;

      const attendanceRate = attendanceRecords.length
        ? attendanceRecords.filter((a) => a.present).length / attendanceRecords.length
        : 1;

      const { score, level } = await getRiskScore(days, attendanceRate);
      return { phc, days, attendanceRate, score, level };
    })
  );

  const top = scored.sort((a, b) => b.score - a.score).slice(0, 6);

  const results = [];
  for (const { phc, days, attendanceRate, score, level } of top) {
    const countryName = phc.country.name;
    let explanation = `Risk score ${score}/100 based on stock and staffing levels.`;
    try {
      explanation = await generateRiskExplanation(phc.name, countryName, score, days, attendanceRate);
    } catch (err) {
      console.error("Gemini risk explanation failed, using fallback:", err);
    }
    results.push({ phcId: phc._id, phcName: phc.name, countryName, score, level, explanation });
  }

  cache = { at: Date.now(), data: results };
  res.json(results);
});

export default router;