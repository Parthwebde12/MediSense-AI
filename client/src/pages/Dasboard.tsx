import { useQuery } from "@tanstack/react-query";
import { fetchAlerts, fetchRedistribution, fetchAllPHCs, fetchAllStock } from "../lib/stockApi";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  const { data: phcs, isLoading: phcsLoading, isError: phcsError } = useQuery({
    queryKey: ["phcs"],
    queryFn: fetchAllPHCs,
  });

  const { data: alerts, isLoading: alertsLoading, isError: alertsError } = useQuery({
    queryKey: ["alerts"],
    queryFn: fetchAlerts,
  });

  const { data: redistribution, isLoading: redistLoading, isError: redistError } = useQuery({
    queryKey: ["redistribution"],
    queryFn: fetchRedistribution,
  });

  const { data: stock, isLoading: stockLoading } = useQuery({
    queryKey: ["stock"],
    queryFn: fetchAllStock,
  });

  const countryMap = new Map<string, { name: string; phcCount: number }>();
  phcs?.forEach((phc) => {
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
      <div className="max-w-5xl mx-auto p-6">
        <div className="mb-6">
          <p className="text-sm text-slate-500">
            Regional overview <span className="text-slate-300">·</span> {countryMap.size} countries
          </p>
        </div>

        {isLoading && (
          <div className="text-sm text-slate-400 mb-6 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-pulse"></span>
            Loading live data…
          </div>
        )}
        {hasError && (
          <div className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3 mb-6 border border-red-100">
            Couldn't load some data from the server. Check that the backend is running and try refreshing.
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">Total PHCs</div>
            <div className="text-3xl font-semibold text-slate-900">
              {phcs?.length ?? "—"}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">Low-stock Alerts</div>
            <div className="text-3xl font-semibold text-red-500">
              {alerts?.length ?? "—"}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">Redistribution</div>
            <div className="text-3xl font-semibold text-amber-500">
              {redistribution?.length ?? "—"}
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-sm font-semibold text-slate-800 mb-3">Countries</h2>
          <div className="grid grid-cols-3 gap-4">
            {Array.from(countryMap.values()).map((c) => (
              <div key={c.name} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-sm font-semibold text-slate-900 mb-3">{c.name}</div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">{c.phcCount} PHCs</span>
                  <span className={`px-2 py-0.5 rounded-full font-medium ${
                    (alertsByCountry.get(c.name) || 0) > 0
                      ? "bg-red-50 text-red-600"
                      : "bg-green-50 text-green-600"
                  }`}>
                    {alertsByCountry.get(c.name) || 0} alert
                    {(alertsByCountry.get(c.name) || 0) !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8">
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
                  <span className="mt-0.5">{a.status === "critical" ? "⚠" : "!"}</span>
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

        <div className="mb-8">
          <h2 className="text-sm font-semibold text-slate-800 mb-3">
            Cross-border Redistribution Suggestions
          </h2>
          <div className="flex flex-col gap-2">
            {redistribution?.length ? (
              redistribution.map((r, i) => (
                <div
                  key={i}
                  className="flex gap-3 items-start rounded-xl px-4 py-3 text-sm bg-blue-50 text-blue-700 border border-blue-100"
                >
                  <span className="mt-0.5">⇄</span>
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

        <div>
          <h2 className="text-sm font-semibold text-slate-800 mb-3">All Stock Entries</h2>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs text-slate-500 uppercase tracking-wide">
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
                    <tr key={s._id} className="border-b border-slate-50 last:border-0">
                      <td className="px-4 py-3 text-slate-800">{s.medicineName}</td>
                      <td className="px-4 py-3 text-slate-600">{s.phc?.name ?? "—"}</td>
                      <td className="px-4 py-3 text-slate-600">{s.phc?.country?.name ?? "—"}</td>
                      <td className="px-4 py-3 text-slate-800">
                        {s.quantity} {s.unit}
                      </td>
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
      </div>
    </div>
  );
}