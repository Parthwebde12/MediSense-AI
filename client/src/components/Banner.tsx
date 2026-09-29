import type { ReactNode } from "react";
import { Check } from "lucide-react";

const STYLES = {
  success: "text-green-700 bg-green-50 border-green-100",
  error: "text-red-700 bg-red-50 border-red-100",
} as const;

export default function Banner({
  variant,
  children,
}: {
  variant: keyof typeof STYLES;
  children: ReactNode;
}) {
  return (
    <div className={`text-sm border rounded-xl px-4 py-3 mb-4 flex items-center gap-2 ${STYLES[variant]}`}>
      {variant === "success" && <Check size={16} />}
      {children}
    </div>
  );
}