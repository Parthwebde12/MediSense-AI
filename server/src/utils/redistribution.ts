import { calculateDepletion } from "./forecast";

export interface RedistributionSuggestion {
  medicineName: string;
  fromPhcName: string;
  fromState: string;
  fromQuantity: number;
  toPhcName: string;
  toState: string;
  toQuantity: number;
  suggestedTransferAmount: number;
}

interface StockItem {
  phcId: string;
  phcName: string;
  state: string;
  medicineName: string;
  quantity: number;
  dailyConsumptionRate: number;
}

export const findRedistributionMatches = (
  stockItems: StockItem[]
): RedistributionSuggestion[] => {
  const suggestions: RedistributionSuggestion[] = [];
  const byMedicine = new Map<string, StockItem[]>();

  for (const item of stockItems) {
    const key = item.medicineName.trim().toLowerCase();
    const list = byMedicine.get(key) || [];
    list.push(item);
    byMedicine.set(key, list);
  }

  for (const items of byMedicine.values()) {
    const first = items[0];
    if (!first) continue;
    const medicineName = first.medicineName;
    const withDays = items.map((i) => ({
      ...i,
      days: calculateDepletion(i.quantity, i.dailyConsumptionRate).daysRemaining,
    }));

    const low = withDays.filter((i) => i.days <= 7).sort((a, b) => a.quantity - b.quantity);
    const surplus = withDays.filter((i) => i.days > 30).sort((a, b) => b.quantity - a.quantity);

    const available = new Map(surplus.map((s) => [s.phcId, s.quantity]));

    for (const lowItem of low) {
      const match = surplus.find(
        (s) =>
          s.state !== lowItem.state &&
          s.phcId !== lowItem.phcId &&
          (available.get(s.phcId) ?? 0) > 0
      );
      if (!match) continue;

      const left = available.get(match.phcId) ?? 0;
      const transferAmount = Math.floor(Math.min(left, lowItem.dailyConsumptionRate * 14));
      if (transferAmount <= 0) continue;

      available.set(match.phcId, left - transferAmount);
      suggestions.push({
        medicineName,
        fromPhcName: match.phcName,
        fromState: match.state,
        fromQuantity: match.quantity,
        toPhcName: lowItem.phcName,
        toState: lowItem.state,
        toQuantity: lowItem.quantity,
        suggestedTransferAmount: transferAmount,
      });
    }
  }

  return suggestions;
};