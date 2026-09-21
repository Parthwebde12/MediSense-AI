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

export const calculateRiskScore = (minDaysRemaining: number, attendanceRate: number) => {
  const stockRisk = minDaysRemaining <= 0 ? 100 : Math.max(0, 100 - minDaysRemaining * 8);
  const staffRisk = Math.max(0, 100 - attendanceRate * 100);
  const score = Math.round(stockRisk * 0.65 + staffRisk * 0.35);
  const level = score >= 65 ? "critical" : score >= 35 ? "elevated" : "stable";
  return { score, level } as { score: number; level: "critical" | "elevated" | "stable" };
};