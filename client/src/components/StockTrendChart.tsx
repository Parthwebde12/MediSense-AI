import type { StockTrendPoint } from "../lib/stockApi";

export default function StockTrendChart({
  trend,
  unit,
}: {
  trend: StockTrendPoint[];
  unit: string;
}) {
  const width = 480;
  const height = 120;
  const padding = 24;
  const maxQty = Math.max(...trend.map((t) => t.quantity), 1);

  const points = trend
    .map((t, i) => {
      const x = padding + (i / (trend.length - 1)) * (width - padding * 2);
      const y = height - padding - (t.quantity / maxQty) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");

  const zeroDay = trend.find((t) => t.quantity === 0);

  return (
    <div className="bg-slate-50 rounded-xl border border-slate-100 p-4">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-28">
        <polyline
          points={points}
          fill="none"
          stroke="#f59e0b"
          strokeWidth="2"
        />
        {trend.map((t, i) => {
          const x = padding + (i / (trend.length - 1)) * (width - padding * 2);
          const y = height - padding - (t.quantity / maxQty) * (height - padding * 2);
          return <circle key={i} cx={x} cy={y} r="2.5" fill="#f59e0b" />;
        })}
      </svg>
      <p className="text-xs text-slate-500 mt-1">
        Projected over next 14 days, {unit}/day usage.
        {zeroDay && (
          <span className="text-red-500 font-medium"> Runs out around day {zeroDay.day}.</span>
        )}
      </p>
    </div>
  );
}