export default function Dashboard() {
  const countries = [
    { name: "India", phcs: 2, alerts: 1, health: 70, color: "bg-green-500" },
    { name: "Brazil", phcs: 2, alerts: 2, health: 45, color: "bg-amber-500" },
    { name: "South Africa", phcs: 2, alerts: 1, health: 80, color: "bg-green-500" },
  ];

  const alerts = [
    {
      type: "danger",
      text: "PHC Recife Central (Brazil) — Insulin will deplete in 3 days at current rate.",
    },
    {
      type: "warning",
      text: "Suggested transfer — PHC Pune North (India) has surplus Paracetamol for PHC Bahia Rural (Brazil).",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-semibold text-slate-800">
              Smart Health & Supply Chain Resilience
            </h1>
            <p className="text-sm text-slate-500">Regional overview — 3 countries</p>
          </div>
          <div className="text-sm text-slate-500">Regional admin</div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-sm text-slate-500 mb-1">Total PHCs</div>
            <div className="text-2xl font-semibold text-slate-800">6</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-sm text-slate-500 mb-1">Low-stock alerts</div>
            <div className="text-2xl font-semibold text-red-500">4</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-sm text-slate-500 mb-1">Avg staff attendance</div>
            <div className="text-2xl font-semibold text-slate-800">87%</div>
          </div>
        </div>

        {/* Country cards */}
        <div className="mb-6">
          <h2 className="text-sm font-medium text-slate-700 mb-2">Countries</h2>
          <div className="grid grid-cols-3 gap-3">
            {countries.map((c) => (
              <div key={c.name} className="bg-white border border-slate-200 rounded-lg p-4">
                <div className="text-sm font-medium text-slate-800 mb-2">{c.name}</div>
                <div className="flex justify-between text-xs text-slate-500 mb-2">
                  <span>{c.phcs} PHCs</span>
                  <span className="text-red-500">{c.alerts} alert{c.alerts !== 1 ? "s" : ""}</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${c.color}`}
                    style={{ width: `${c.health}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div>
          <h2 className="text-sm font-medium text-slate-700 mb-2">Recent AI alerts</h2>
          <div className="flex flex-col gap-2">
            {alerts.map((a, i) => (
              <div
                key={i}
                className={`flex gap-3 items-start rounded-lg px-3 py-2 text-sm ${
                  a.type === "danger"
                    ? "bg-red-50 text-red-700"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                <span>{a.type === "danger" ? "⚠" : "⇄"}</span>
                <span>{a.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}