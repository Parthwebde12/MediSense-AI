import { Router } from "express";
import axios from "axios";
import PHC from "../models/PHC";
import MedicineStock from "../models/MedicineStock";
import Attendance from "../models/Attendance";
import { calculateDepletion, calculateRiskScore } from "../utils/forecast";
import type { RiskLevel } from "../utils/forecast";
import { generateRiskExplanation, parseLang } from "../utils/gemini";
import type { Lang } from "../utils/gemini";
import { requireAuth } from "../middleware/auth";
import { aiLimiter } from "../middleware/ratelimit";

const router = Router();

const CACHE_TTL_MS = 60_000;
const MAX_RESULTS = 6;
const RECENT_ATTENDANCE_RECORDS = 10;
const DEFAULT_DAYS_REMAINING = 30; // used when a PHC has no stock consumption to forecast
let cache: { at: number; lang: Lang; data: unknown[] } | null = null;

const getRiskScore = async (minDaysRemaining: number, attendanceRate: number) => {
  try {
    const url = `${process.env.PYTHON_SERVICE_URL || "http://localhost:8001"}/risk-score`;
    const { data } = await axios.post(url, { minDaysRemaining, attendanceRate }, { timeout: 5000 });
    return { score: data.score as number, level: data.level as RiskLevel };
  } catch (err) {
    console.error("Python risk service failed, computing locally:", err);
    return calculateRiskScore(minDaysRemaining, attendanceRate);
  }
};

router.get("/", requireAuth, aiLimiter, async (req, res) => {
  const lang = parseLang(req.query.lang);

  if (cache && cache.lang === lang && Date.now() - cache.at < CACHE_TTL_MS) {
    return res.json(cache.data);
  }

  const phcs = await PHC.find();

  const scored = await Promise.all(
    phcs.map(async (phc) => {
      const [stock, attendanceRecords] = await Promise.all([
        MedicineStock.find({ phc: phc._id }),
        Attendance.find({ phc: phc._id }).sort({ date: -1 }).limit(RECENT_ATTENDANCE_RECORDS),
      ]);

      const finiteDays = stock
        .map((s) => calculateDepletion(s.quantity, s.dailyConsumptionRate).daysRemaining)
        .filter(Number.isFinite);
      const days = finiteDays.length ? Math.min(...finiteDays) : DEFAULT_DAYS_REMAINING;

      const attendanceRate = attendanceRecords.length
        ? attendanceRecords.filter((a) => a.present).length / attendanceRecords.length
        : 1;

      const { score, level } = await getRiskScore(days, attendanceRate);
      return { phc, days, attendanceRate, score, level };
    })
  );

  const top = scored.sort((a, b) => b.score - a.score).slice(0, MAX_RESULTS);

  const results = [];
  for (const { phc, days, attendanceRate, score, level } of top) {
    let explanation = `Risk score ${score}/100 based on stock and staffing levels.`;
    try {
      explanation = await generateRiskExplanation(phc.name, phc.state, score, days, attendanceRate, lang);
    } catch (err) {
      console.error("Gemini risk explanation failed, using fallback:", err);
    }
    results.push({ phcId: phc._id, phcName: phc.name, stateName: phc.state, score, level, explanation });
  }

  cache = { at: Date.now(), lang, data: results };
  res.json(results);
});

export default router;