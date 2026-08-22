import api from "./api";

export interface Alert {
  id: string;
  phcName: string;
  stateName: string;
  medicineName: string;
  quantity: number;
  daysRemaining: number;
  status: "critical" | "warning";
  message: string;
}

export interface RedistributionSuggestion {
  medicineName: string;
  fromPhcName: string;
  fromState: string;
  toPhcName: string;
  toState: string;
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
  phc?: { _id: string; name: string; state?: string; district?: string; city?: string };
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
  state: string;
  district: string;
  city: string;
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
export const deleteCountry = async (id: string) => {
  const res = await api.delete(`/country/${id}`);
  return res.data;
};

export const createCountry = async (payload: { name: string; code: string }) => {
  const res = await api.post("/country", payload);
  return res.data;
};

export const deletePHC = async (id: string) => {
  const res = await api.delete(`/phc/${id}`);
  return res.data;
};