export interface DepletionResult {
  daysRemaining: number;
  status: "critical" | "warning" | "healthy";
}
export const calculateDepletion = (
  quantity: number,
  dailyConsumptionRate: number
): DepletionResult => {
  if (dailyConsumptionRate <= 0) {
    return { daysRemaining: Infinity, status: "healthy" };
  }

  const daysRemaining = Math.floor(quantity / dailyConsumptionRate);

  let status: DepletionResult["status"] = "healthy";
  if (daysRemaining <= 3) {
    status = "critical";
  } else if (daysRemaining <= 7) {
    status = "warning";
  }

  return { daysRemaining, status };
};

// Local fallback for the Python risk service. Keep these in sync with python-service/main.py.
const STOCK_WEIGHT = 0.65;
const STAFF_WEIGHT = 0.35;
const RISK_PER_DAY_LEFT = 8;
const CRITICAL_THRESHOLD = 65;
const ELEVATED_THRESHOLD = 35;

export type RiskLevel = "critical" | "elevated" | "stable";

export const calculateRiskScore = (
  minDaysRemaining: number,
  attendanceRate: number
): { score: number; level: RiskLevel } => {
  const stockRisk =
    minDaysRemaining <= 0 ? 100 : Math.max(0, 100 - minDaysRemaining * RISK_PER_DAY_LEFT);
  const staffRisk = Math.max(0, 100 - attendanceRate * 100);
  const score = Math.round(stockRisk * STOCK_WEIGHT + staffRisk * STAFF_WEIGHT);
  const level =
    score >= CRITICAL_THRESHOLD ? "critical" : score >= ELEVATED_THRESHOLD ? "elevated" : "stable";
  return { score, level };
};