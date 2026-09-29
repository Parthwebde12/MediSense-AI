import type { StockTrendPoint } from "../lib/stockApi";

const WIDTH = 480;
const HEIGHT = 120;
const PADDING = 24;

export default function StockTrendChart({
  trend,
  unit,
}: {
  trend: StockTrendPoint[];
  unit: string;
}) {
  const maxQty = Math.max(...trend.map((t) => t.quantity), 1);
  const lastIndex = Math.max(trend.length - 1, 1);

  const coords = trend.map((t, i) => ({
    x: PADDING + (i / lastIndex) * (WIDTH - PADDING * 2),
    y: HEIGHT - PADDING - (t.quantity / maxQty) * (HEIGHT - PADDING * 2),
  }));

  const zeroDay = trend.find((t) => t.quantity === 0);

  return (
    <div className="bg-slate-50 rounded-xl border border-slate-100 p-4">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-28">
        <polyline
          points={coords.map(({ x, y }) => `${x},${y}`).join(" ")}
          fill="none"
          stroke="#f59e0b"
          strokeWidth="2"
        />
        {coords.map(({ x, y }, i) => (
          <circle key={trend[i].day} cx={x} cy={y} r="2.5" fill="#f59e0b" />
        ))}
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