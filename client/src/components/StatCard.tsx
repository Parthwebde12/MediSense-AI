import type { LucideIcon } from "lucide-react";

const TONES = {
  slate: { blob: "bg-slate-50", chip: "bg-slate-100", icon: "text-slate-600", value: "text-slate-900" },
  red: { blob: "bg-red-50", chip: "bg-red-50", icon: "text-red-500", value: "text-red-500" },
  amber: { blob: "bg-amber-50", chip: "bg-amber-50", icon: "text-amber-500", value: "text-amber-500" },
  blue: { blob: "bg-blue-50", chip: "bg-blue-50", icon: "text-blue-500", value: "text-blue-500" },
} as const;

export default function StatCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  tone: keyof typeof TONES;
}) {
  const t = TONES[tone];
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-20 h-20 rounded-full -mr-8 -mt-8 ${t.blob}`} />
      <div className="relative">
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${t.chip}`}>
            <Icon size={14} className={t.icon} />
          </div>
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</span>
        </div>
        <div className={`text-3xl font-semibold ${t.value}`}>{value}</div>
      </div>
    </div>
  );
}