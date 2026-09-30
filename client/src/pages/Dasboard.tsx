import { Fragment, useState } from "react";
import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowLeftRight,
  BedDouble,
  Building2,
  Gauge,
  Globe2,
  Pill,
  Users,
} from "lucide-react";
import {
  fetchAlerts,
  fetchAllAttendance,
  fetchAllPHCs,
  fetchAllStock,
  fetchRedistribution,
  fetchRiskScores,
  fetchStockTrend,
} from "../lib/stockApi";
import type { Alert, AttendanceRecord, Lang, RiskScore, StockItem } from "../lib/stockApi";
import Navbar from "../components/Navbar";
import StatCard from "../components/StatCard";
import StockTrendChart from "../components/StockTrendChart";
import ChatWidget from "../components/ChatWidget";
import PHCMap from "../components/PHCMap";

 const POLL_MS = 60_000; 
const MAX_ATTENDANCE_ROWS = 15;

const LANGS: { value: Lang; label: string }[] = [
  { value: "en", label: "EN" },
  { value: "hi", label: "हिं" },
];

const ALERT_STYLES = {
  critical: { box: "bg-red-50 text-red-700 border-red-100", label: "text-red-600" },
  warning: { box: "bg-amber-50 text-amber-700 border-amber-100", label: "text-amber-600" },
} as const;

const RISK_STYLES = {
  critical: { badge: "bg-red-50 text-red-700 border-red-100", bar: "bg-red-400" },
  elevated: { badge: "bg-amber-50 text-amber-700 border-amber-100", bar: "bg-amber-400" },
  stable: { badge: "bg-emerald-50 text-emerald-700 border-emerald-100", bar: "bg-emerald-400" },
} as const;

function formatDaysLeft(daysRemaining: number): string {
  if (daysRemaining <= 0) return "No stock left";
  if (daysRemaining === 1) return "1 day left";
  if (daysRemaining <= 3) return `${daysRemaining} days stock left`;
  return `${daysRemaining} days left`;
}

function countBy<T>(items: T[] | undefined, key: (item: T) => string | undefined) {
  const counts = new Map<string, number>();
  items?.forEach((item) => {
    const k = key(item);
    if (k) counts.set(k, (counts.get(k) ?? 0) + 1);
  });
  return counts;
}

function SectionTitle({ icon, children }: { icon?: ReactNode; children: ReactNode }) {
  return (
    <h2 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
      {icon}
      {children}
    </h2>
  );
}

function EmptyState({ children }: { children: ReactNode }) {
  return (
    <p className="text-sm text-slate-400 bg-white rounded-xl px-4 py-3 border border-slate-100">
      {children}
    </p>
  );
}

function DataTable({ headers, children }: { headers: string[]; children: ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-left text-xs text-slate-500 uppercase tracking-wide bg-slate-50/50">
            {headers.map((h) => (
              <th key={h} className="px-4 py-3">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function EmptyRow({ colSpan, children }: { colSpan: number; children: ReactNode }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-6 text-center text-slate-400">
        {children}
      </td>
    </tr>
  );
}

function AlertCard({ alert }: { alert: Alert }) {
  const styles = ALERT_STYLES[alert.status];
  return (
    <div className={`flex gap-3 items-start rounded-xl px-4 py-3 text-sm border ${styles.box}`}>
      <AlertTriangle size={16} className="mt-0.5 shrink-0" />
      <div className="flex flex-col gap-1">
        <span className={`text-xs font-semibold uppercase tracking-wide ${styles.label}`}>
          {formatDaysLeft(alert.daysRemaining)}
        </span>
        <span>{alert.message}</span>
      </div>
    </div>
  );
}

function RiskCard({ risk }: { risk: RiskScore }) {
  const styles = RISK_STYLES[risk.level];
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-900">{risk.phcName}</span>
          <span className="text-xs text-slate-400">{risk.stateName}</span>
        </div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${styles.badge}`}>
          {risk.level} · {risk.score}/100
        </span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-2">
        <div className={`h-full ${styles.bar}`} style={{ width: `${risk.score}%` }} />
      </div>
      <p className="text-xs text-slate-500">{risk.explanation}</p>
    </div>
  );
}

function StockTable({ stock }: { stock?: StockItem[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: trend, isLoading } = useQuery({
    queryKey: ["stockTrend", expandedId],
    queryFn: () => fetchStockTrend(expandedId as string),
    enabled: !!expandedId,
  });

  return (
    <DataTable headers={["Medicine", "PHC", "State", "Quantity", "Daily Use"]}>
      {stock?.length ? (
        stock.map((s) => {
          const isExpanded = expandedId === s._id;
          return (
            <Fragment key={s._id}>
              <tr
                onClick={() => setExpandedId(isExpanded ? null : s._id)}
                className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors cursor-pointer"
              >
                <td className="px-4 py-3 text-slate-800 font-medium">{s.medicineName}</td>
                <td className="px-4 py-3 text-slate-600">{s.phc?.name ?? "—"}</td>
                <td className="px-4 py-3 text-slate-600">{s.phc?.state ?? "—"}</td>
                <td className="px-4 py-3 text-slate-800">
                  {s.quantity} {s.unit}
                </td>
                <td className="px-4 py-3 text-slate-600">{s.dailyConsumptionRate}/day</td>
              </tr>
              {isExpanded && (
                <tr>
                  <td colSpan={5} className="px-4 py-3 bg-white">
                    {isLoading ? (
                      <p className="text-xs text-slate-400">Loading trend…</p>
                    ) : trend ? (
                      <StockTrendChart trend={trend.trend} unit={trend.unit} />
                    ) : null}
                  </td>
                </tr>
              )}
            </Fragment>
          );
        })
      ) : (
        <EmptyRow colSpan={5}>No stock entries yet.</EmptyRow>
      )}
    </DataTable>
  );
}

function AttendanceTable({ attendance }: { attendance?: AttendanceRecord[] }) {
  return (
    <DataTable headers={["Staff", "Role", "PHC", "Date", "Status", "Footfall"]}>
      {attendance?.length ? (
        attendance.slice(0, MAX_ATTENDANCE_ROWS).map((a) => (
          <tr
            key={a._id}
            className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors"
          >
            <td className="px-4 py-3 text-slate-800 font-medium">{a.staffName}</td>
            <td className="px-4 py-3 text-slate-600 capitalize">{a.role}</td>
            <td className="px-4 py-3 text-slate-600">{a.phc?.name ?? "—"}</td>
            <td className="px-4 py-3 text-slate-600">{new Date(a.date).toLocaleDateString()}</td>
            <td className="px-4 py-3">
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  a.present ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                }`}
              >
                {a.present ? "Present" : "Absent"}
              </span>
            </td>
            <td className="px-4 py-3 text-slate-600">{a.patientFootfall}</td>
          </tr>
        ))
      ) : (
        <EmptyRow colSpan={6}>No attendance records yet.</EmptyRow>
      )}
    </DataTable>
  );
}

export default function Dashboard() {
  const [lang, setLang] = useState<Lang>("en");
  const poll = { refetchInterval: POLL_MS };

  const { data: phcs, isLoading: phcsLoading, isError: phcsError } = useQuery({
    queryKey: ["phcs"],
    queryFn: fetchAllPHCs,
    ...poll,
  });
  const { data: alerts, isLoading: alertsLoading, isError: alertsError } = useQuery({
    queryKey: ["alerts", lang],
    queryFn: () => fetchAlerts(lang),
    ...poll,
  });
  const { data: redistribution, isLoading: redistLoading, isError: redistError } = useQuery({
    queryKey: ["redistribution", lang],
    queryFn: () => fetchRedistribution(lang),
    ...poll,
  });
  const { data: stock, isLoading: stockLoading } = useQuery({
    queryKey: ["stock"],
    queryFn: fetchAllStock,
    ...poll,
  });
  const { data: attendance } = useQuery({
    queryKey: ["attendance"],
    queryFn: fetchAllAttendance,
    ...poll,
  });
  const { data: riskScores, isLoading: riskLoading } = useQuery({
    queryKey: ["risk", lang],
    queryFn: () => fetchRiskScores(lang),
    ...poll,
  });

  const phcCountByState = countBy(phcs, (p) => p.state);
  const alertCountByState = countBy(alerts, (a) => a.stateName);
  const states = Array.from(phcCountByState, ([name, phcCount]) => ({
    name,
    phcCount,
    alertCount: alertCountByState.get(name) ?? 0,
  }));

  const beds = (phcs ?? []).reduce(
    (acc, p) => ({
      total: acc.total + (p.totalBeds ?? 0),
      occupied: acc.occupied + (p.occupiedBeds ?? 0),
    }),
    { total: 0, occupied: 0 },
  );

  const isLoading = phcsLoading || alertsLoading || redistLoading || stockLoading;
  const hasError = phcsError || alertsError || redistError;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Globe2 size={18} className="text-slate-400" />
              Regional Overview
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">Live across {states.length} states</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-slate-100 rounded-lg p-1">
              {LANGS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setLang(value)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    lang === value ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {isLoading && (
              <span className="flex items-center gap-2 text-xs text-slate-400">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                Live
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6">
        {hasError && (
          <div className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3 mb-6 border border-red-100">
            Couldn't load some data from the server. Check that the backend is running and try
            refreshing.
          </div>
        )}

        <div className="grid grid-cols-4 gap-4 mb-8">
          <StatCard icon={Building2} label="Total PHCs" value={phcs?.length ?? "—"} tone="slate" />
          <StatCard icon={AlertTriangle} label="Low-stock Alerts" value={alerts?.length ?? "—"} tone="red" />
          <StatCard icon={ArrowLeftRight} label="Redistribution" value={redistribution?.length ?? "—"} tone="amber" />
          <StatCard
            icon={BedDouble}
            label="Bed Occupancy"
            value={beds.total > 0 ? `${beds.occupied}/${beds.total}` : "—"}
            tone="blue"
          />
        </div>

        <section className="mb-8">
          <SectionTitle>States</SectionTitle>
          <div className="grid grid-cols-3 gap-4">
            {states.map(({ name, phcCount, alertCount }) => {
              const healthy = alertCount === 0;
              return (
                <div
                  key={name}
                  className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-slate-900">{name}</span>
                    <span className={`w-2 h-2 rounded-full ${healthy ? "bg-emerald-400" : "bg-red-400"}`} />
                  </div>
                  <div className="flex justify-between items-center text-xs mb-3">
                    <span className="text-slate-500">{phcCount} PHCs</span>
                    <span
                      className={`px-2 py-0.5 rounded-full font-medium ${
                        healthy ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                      }`}
                    >
                      {alertCount} alert{alertCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${healthy ? "bg-emerald-400" : "bg-red-400"}`}
                      style={{ width: healthy ? "100%" : "45%" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mb-8">
          <SectionTitle>State Map</SectionTitle>
          <PHCMap states={states} />
        </section>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <section>
            <SectionTitle>Recent AI Alerts</SectionTitle>
            <div className="flex flex-col gap-2">
              {alerts?.length ? (
                alerts.map((a) => <AlertCard key={a.id} alert={a} />)
              ) : (
                <EmptyState>No active alerts.</EmptyState>
              )}
            </div>
          </section>

          <section>
            <SectionTitle>Redistribution Suggestions</SectionTitle>
            <div className="flex flex-col gap-2">
              {redistribution?.length ? (
                redistribution.map((r, i) => (
                  <div
                    key={i}
                    className="flex gap-3 items-start rounded-xl px-4 py-3 text-sm bg-blue-50 text-blue-700 border border-blue-100"
                  >
                    <ArrowLeftRight size={16} className="mt-0.5 shrink-0" />
                    <span>{r.message}</span>
                  </div>
                ))
              ) : (
                <EmptyState>No suggestions at this time.</EmptyState>
              )}
            </div>
          </section>
        </div>

        <section className="mb-8">
          <SectionTitle icon={<Gauge size={14} className="text-slate-400" />}>PHC Risk Scores</SectionTitle>
          <div className="grid grid-cols-1 gap-3">
            {riskLoading ? (
              <EmptyState>Calculating risk scores…</EmptyState>
            ) : riskScores?.length ? (
              riskScores.map((r) => <RiskCard key={r.phcId} risk={r} />)
            ) : (
              <EmptyState>No risk scores available yet.</EmptyState>
            )}
          </div>
        </section>

        <section className="mb-8">
          <SectionTitle icon={<Pill size={14} className="text-slate-400" />}>All Stock Entries</SectionTitle>
          <p className="text-xs text-slate-400 mb-2">Click a row to see its projected depletion trend.</p>
          <StockTable stock={stock} />
        </section>

        <section>
          <SectionTitle icon={<Users size={14} className="text-slate-400" />}>Staff Attendance</SectionTitle>
          <AttendanceTable attendance={attendance} />
        </section>
      </div>

      <ChatWidget lang={lang} />
    </div>
  );
}