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