import { useQuery } from "@tanstack/react-query";
import {
  fetchAlerts,
  fetchRedistribution,
  fetchAllPHCs,
  fetchAllStock,
  fetchAllAttendance,
} from "../lib/stockApi";
import Navbar from "../components/Navbar";
import { Building2, AlertTriangle, ArrowLeftRight, Pill, Globe2, Users } from "lucide-react";

export default function Dashboard() {
  const { data: phcs, isLoading: phcsLoading, isError: phcsError } = useQuery({
    queryKey: ["phcs"],
    queryFn: fetchAllPHCs,
    refetchInterval: 15000,
  });

  const { data: alerts, isLoading: alertsLoading, isError: alertsError } = useQuery({
    queryKey: ["alerts"],
    queryFn: fetchAlerts,
    refetchInterval: 15000,
  });

  const { data: redistribution, isLoading: redistLoading, isError: redistError } = useQuery({
    queryKey: ["redistribution"],
    queryFn: fetchRedistribution,
    refetchInterval: 15000,
  });

  const { data: stock, isLoading: stockLoading } = useQuery({
    queryKey: ["stock"],
    queryFn: fetchAllStock,
    refetchInterval: 15000,
  });

  const { data: attendance } = useQuery({
    queryKey: ["attendance"],
    queryFn: fetchAllAttendance,
    refetchInterval: 15000,
  });

  const countryMap = new Map<string, { name: string; phcCount: number }>();
  phcs?.forEach((phc:any) => {
    const countryName = phc.country?.name;
    if (!countryName) return;
    const existing = countryMap.get(countryName) || { name: countryName, phcCount: 0 };
    existing.phcCount += 1;
    countryMap.set(countryName, existing);
  });

  const alertsByCountry = new Map<string, number>();
  alerts?.forEach((a) => {
    alertsByCountry.set(a.countryName, (alertsByCountry.get(a.countryName) || 0) + 1);
  });

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
            <p className="text-sm text-slate-500 mt-0.5">
              Live across {countryMap.size} countries
            </p>
          </div>
          {isLoading && (
            <span className="flex items-center gap-2 text-xs text-slate-400">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              Live
            </span>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6">
        {hasError && (
          <div className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3 mb-6 border border-red-100">
            Couldn't load some data from the server. Check that the backend is running and try refreshing.
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-slate-50 rounded-full -mr-8 -mt-8" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center">
                  <Building2 size={14} className="text-slate-600" />
                </div>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total PHCs</span>
              </div>
              <div className="text-3xl font-semibold text-slate-900">{phcs?.length ?? "—"}</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-red-50 rounded-full -mr-8 -mt-8" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 bg-red-50 rounded-lg flex items-center justify-center">
                  <AlertTriangle size={14} className="text-red-500" />
                </div>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Low-stock Alerts</span>
              </div>
              <div className="text-3xl font-semibold text-red-500">{alerts?.length ?? "—"}</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-amber-50 rounded-full -mr-8 -mt-8" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 bg-amber-50 rounded-lg flex items-center justify-center">
                  <ArrowLeftRight size={14} className="text-amber-500" />
                </div>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Redistribution</span>
              </div>
              <div className="text-3xl font-semibold text-amber-500">{redistribution?.length ?? "—"}</div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-sm font-semibold text-slate-800 mb-3">Countries</h2>
          <div className="grid grid-cols-3 gap-4">
            {Array.from(countryMap.values()).map((c) => {
              const alertCount = alertsByCountry.get(c.name) || 0;
              const healthy = alertCount === 0;
              return (
                <div
                  key={c.name}
                  className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-slate-900">{c.name}</span>
                    <span
                      className={`w-2 h-2 rounded-full ${healthy ? "bg-emerald-400" : "bg-red-400"}`}
                    />
                  </div>
                  <div className="flex justify-between items-center text-xs mb-3">
                    <span className="text-slate-500">{c.phcCount} PHCs</span>
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
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <h2 className="text-sm font-semibold text-slate-800 mb-3">Recent AI Alerts</h2>
            <div className="flex flex-col gap-2">
              {alerts?.length ? (
                alerts.map((a) => (
                  <div
                    key={a.id}
                    className={`flex gap-3 items-start rounded-xl px-4 py-3 text-sm border ${
                      a.status === "critical"
                        ? "bg-red-50 text-red-700 border-red-100"
                        : "bg-amber-50 text-amber-700 border-amber-100"
                    }`}
                  >
                    <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                    <span>{a.message}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400 bg-white rounded-xl px-4 py-3 border border-slate-100">
                  No active alerts.
                </p>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-800 mb-3">Redistribution Suggestions</h2>
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
                <p className="text-sm text-slate-400 bg-white rounded-xl px-4 py-3 border border-slate-100">
                  No suggestions at this time.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <Pill size={14} className="text-slate-400" /> All Stock Entries
          </h2>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs text-slate-500 uppercase tracking-wide bg-slate-50/50">
                  <th className="px-4 py-3">Medicine</th>
                  <th className="px-4 py-3">PHC</th>
                  <th className="px-4 py-3">Country</th>
                  <th className="px-4 py-3">Quantity</th>
                  <th className="px-4 py-3">Daily Use</th>
                </tr>
              </thead>
              <tbody>
                {stock?.length ? (
                  stock.map((s) => (
                    <tr key={s._id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 text-slate-800 font-medium">{s.medicineName}</td>
                      <td className="px-4 py-3 text-slate-600">{s.phc?.name ?? "—"}</td>
                      <td className="px-4 py-3 text-slate-600">{s.phc?.country?.name ?? "—"}</td>
                      <td className="px-4 py-3 text-slate-800">{s.quantity} {s.unit}</td>
                      <td className="px-4 py-3 text-slate-600">{s.dailyConsumptionRate}/day</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                      No stock entries yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <Users size={14} className="text-slate-400" /> Staff Attendance
          </h2>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs text-slate-500 uppercase tracking-wide bg-slate-50/50">
                  <th className="px-4 py-3">Staff</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">PHC</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Footfall</th>
                </tr>
              </thead>
              <tbody>
                {attendance?.length ? (
                  attendance.slice(0, 15).map((a) => (
                    <tr key={a._id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 text-slate-800 font-medium">{a.staffName}</td>
                      <td className="px-4 py-3 text-slate-600 capitalize">{a.role}</td>
                      <td className="px-4 py-3 text-slate-600">{a.phc?.name ?? "—"}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {new Date(a.date).toLocaleDateString()}
                      </td>
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
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                      No attendance records yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}