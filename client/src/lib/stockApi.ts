import api from "./api";

export type Lang = "en" | "hi";

const get = async <T>(url: string, params?: object): Promise<T> =>
  (await api.get<T>(url, { params })).data;
const post = async <T = unknown>(url: string, body: object): Promise<T> =>
  (await api.post<T>(url, body)).data;
const remove = async <T = unknown>(url: string): Promise<T> =>
  (await api.delete<T>(url)).data;

// ---- PHCs ----

export interface PHC {
  _id: string;
  name: string;
  state?: string;
  district?: string;
  city?: string;
  totalBeds?: number;
  occupiedBeds?: number;
}

export interface NewPHCPayload {
  name: string;
  state: string;
  district: string;
  city: string;
  totalBeds?: number;
  occupiedBeds?: number;
}

export const fetchAllPHCs = () => get<PHC[]>("/phc");
export const createPHC = (payload: NewPHCPayload) => post("/phc", payload);
export const deletePHC = (id: string) => remove(`/phc/${id}`);

// ---- Stock ----

export interface StockItem {
  _id: string;
  medicineName: string;
  quantity: number;
  unit: string;
  dailyConsumptionRate: number;
  phc?: PHC;
}

export interface NewStockPayload {
  phc: string;
  medicineName: string;
  quantity: number;
  unit: string;
  dailyConsumptionRate: number;
}

export interface StockTrendPoint {
  day: number;
  quantity: number;
}

export interface StockTrendResponse {
  medicineName: string;
  unit: string;
  dailyConsumptionRate: number;
  trend: StockTrendPoint[];
}

export const fetchAllStock = () => get<StockItem[]>("/stock");
export const createStock = (payload: NewStockPayload) => post("/stock", payload);
export const fetchStockTrend = (id: string) =>
  get<StockTrendResponse>(`/stock/${id}/trend`);

// ---- Alerts & redistribution ----

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

export const fetchAlerts = (lang: Lang = "en") =>
  get<Alert[]>("/stock/alerts", { lang });
export const fetchRedistribution = (lang: Lang = "en") =>
  get<RedistributionSuggestion[]>("/stock/redistribution", { lang });

// ---- Attendance ----

export interface AttendanceRecord {
  _id: string;
  staffName: string;
  role: string;
  date: string;
  present: boolean;
  patientFootfall: number;
  phc?: PHC;
}

export interface NewAttendancePayload {
  phc: string;
  staffName: string;
  role: string;
  date?: string;
  present: boolean;
  patientFootfall: number;
}

export const fetchAllAttendance = () => get<AttendanceRecord[]>("/attendance");
export const createAttendance = (payload: NewAttendancePayload) =>
  post("/attendance", payload);

// ---- Risk scores ----

export interface RiskScore {
  phcId: string;
  phcName: string;
  stateName: string;
  score: number;
  level: "critical" | "elevated" | "stable";
  explanation: string;
}

export const fetchRiskScores = (lang: Lang = "en") =>
  get<RiskScore[]>("/risk", { lang });

// ---- Chat ----

export const sendChatMessage = async (message: string, lang: Lang = "en") =>
  (await post<{ reply: string }>("/chat", { message, lang })).reply;