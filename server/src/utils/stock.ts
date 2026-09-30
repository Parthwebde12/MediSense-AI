import MedicineStock from "../models/MedicineStock";
import type { IPHC } from "../models/PHC";

/** Stock records with their PHC populated, skipping records whose PHC no longer exists. */
export const findStockWithPhc = async (phc?: string) =>
  (await MedicineStock.find(phc ? { phc } : {}).populate<{ phc: IPHC }>("phc")).filter(
    (item) => item.phc,
  );

export type StockWithPhc = Awaited<ReturnType<typeof findStockWithPhc>>[number];

/** Flat shape used by the redistribution matcher. */
export const toStockItems = (stock: StockWithPhc[]) =>
  stock.map((item) => ({
    phcId: item.phc._id.toString(),
    phcName: item.phc.name,
    state: item.phc.state,
    medicineName: item.medicineName,
    quantity: item.quantity,
    dailyConsumptionRate: item.dailyConsumptionRate,
  }));