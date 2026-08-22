import api from "./api";

export interface Alert {
  id: string;
  phcName: string;
  countryName: string;
  medicineName: string;
  quantity: number;
  daysRemaining: number;
  status: "critical" | "warning";
  message: string;
}

export interface RedistributionSuggestion {
  medicineName: string;
  fromPhcName: string;
  fromCountryName: string;
  toPhcName: string;
  toCountryName: string;
  suggestedTransferAmount: number;
  message: string;
}

export const fetchAlerts = async (): Promise<Alert[]> => {
  const res = await api.get("/stock/alerts");
  return res.data;
};

export const fetchRedistribution = async (): Promise<RedistributionSuggestion[]> => {
  const res = await api.get("/stock/redistribution");
  return res.data;
};

export interface StockItem {
  _id: string;
  medicineName: string;
  quantity: number;
  unit: string;
  dailyConsumptionRate: number;
  phc?: { _id: string; name: string; country?: { name: string } };
}

export const fetchAllStock = async (): Promise<StockItem[]> => {
  const res = await api.get("/stock");
  return res.data;
};

export const fetchAllPHCs = async () => {
  const res = await api.get("/phc");
  return res.data;
};
export interface NewStockPayload {
  phc: string;
  medicineName: string;
  quantity: number;
  unit: string;
  dailyConsumptionRate: number;
}

export const createStock = async (payload: NewStockPayload) => {
  const res = await api.post("/stock", payload);
  return res.data;
};
export interface NewPHCPayload {
  name: string;
  country: string;
  district: string;
}

export const createPHC = async (payload: NewPHCPayload) => {
  const res = await api.post("/phc", payload);
  return res.data;
};

export interface Country {
  _id: string;
  name: string;
  code: string;
}

export const fetchAllCountries = async (): Promise<Country[]> => {
  const res = await api.get("/country");
  return res.data;
};