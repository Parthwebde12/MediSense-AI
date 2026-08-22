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
    const list = byMedicine.get(item.medicineName) || [];
    list.push(item);
    byMedicine.set(item.medicineName, list);
  }

  for (const [medicineName, items] of byMedicine) {
    const low = items
      .filter((i) => i.quantity / Math.max(i.dailyConsumptionRate, 1) <= 7)
      .sort((a, b) => a.quantity - b.quantity);

    const surplus = items
      .filter((i) => i.quantity / Math.max(i.dailyConsumptionRate, 1) > 30)
      .sort((a, b) => b.quantity - a.quantity);

    for (const lowItem of low) {
      const match = surplus.find(
        (s) => s.state !== lowItem.state && s.phcId !== lowItem.phcId
      );
      if (match) {
        const transferAmount = Math.min(
          Math.floor(match.quantity * 0.3),
          (lowItem.dailyConsumptionRate || 1) * 14
        );
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
  }

  return suggestions;
};