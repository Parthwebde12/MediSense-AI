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

export const fetchAllStock = async () => {
  const res = await api.get("/stock");
  return res.data;
};

export const fetchAllPHCs = async () => {
  const res = await api.get("/phc");
  return res.data;
};