import { useQuery } from "@tanstack/react-query";
import { fetchAlerts, fetchRedistribution, fetchAllPHCs } from "../lib/stockApi";

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

  const isLoading = phcsLoading || alertsLoading || redistLoading;
  const hasError = phcsError || alertsError || redistError;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-semibold text-slate-800">
              Smart Health & Supply Chain Resilience
            </h1>
            <p className="text-sm text-slate-500">
              Regional overview — {countryMap.size} countries
            </p>
          </div>
          <div className="text-sm text-slate-500">Regional admin</div>
        </div>

        {isLoading && (
          <div className="text-sm text-slate-400 mb-6">Loading live data…</div>
        )}
        {hasError && (
          <div className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2 mb-6">
            Couldn't load some data from the server. Check that the backend is running and try refreshing.
          </div>
        )}

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-sm text-slate-500 mb-1">Total PHCs</div>
            <div className="text-2xl font-semibold text-slate-800">
              {phcs?.length ?? "—"}
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-sm text-slate-500 mb-1">Low-stock alerts</div>
            <div className="text-2xl font-semibold text-red-500">
              {alerts?.length ?? "—"}
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-sm text-slate-500 mb-1">Redistribution suggestions</div>
            <div className="text-2xl font-semibold text-amber-500">
              {redistribution?.length ?? "—"}
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-sm font-medium text-slate-700 mb-2">Countries</h2>
          <div className="grid grid-cols-3 gap-3">
            {Array.from(countryMap.values()).map((c) => (
              <div key={c.name} className="bg-white border border-slate-200 rounded-lg p-4">
                <div className="text-sm font-medium text-slate-800 mb-2">{c.name}</div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>{c.phcCount} PHCs</span>
                  <span className="text-red-500">
                    {alertsByCountry.get(c.name) || 0} alert
                    {(alertsByCountry.get(c.name) || 0) !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-sm font-medium text-slate-700 mb-2">Recent AI alerts</h2>
          <div className="flex flex-col gap-2">
            {alerts?.length ? (
              alerts.map((a) => (
                <div
                  key={a.id}
                  className={`flex gap-3 items-start rounded-lg px-3 py-2 text-sm ${
                    a.status === "critical"
                      ? "bg-red-50 text-red-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  <span>{a.status === "critical" ? "⚠" : "!"}</span>
                  <span>{a.message}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">No active alerts.</p>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-medium text-slate-700 mb-2">
            Cross-border redistribution suggestions
          </h2>
          <div className="flex flex-col gap-2">
            {redistribution?.length ? (
              redistribution.map((r, i) => (
                <div
                  key={i}
                  className="flex gap-3 items-start rounded-lg px-3 py-2 text-sm bg-blue-50 text-blue-700"
                >
                  <span>⇄</span>
                  <span>{r.message}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">No suggestions at this time.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}