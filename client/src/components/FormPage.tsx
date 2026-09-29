import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Navbar from "./Navbar";

interface FormPageProps {
  icon: LucideIcon;
  /** Full Tailwind classes for the icon tile, e.g. "bg-amber-100 text-amber-600". */
  iconClassName: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}

export default function FormPage({
  icon: Icon,
  iconClassName,
  title,
  subtitle,
  children,
}: FormPageProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-md mx-auto p-6">
        <Link
          to="/dashboard"
          className="text-sm text-slate-500 hover:text-slate-900 transition-colors mb-6 inline-flex items-center gap-1.5"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        <div className="mb-6">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${iconClassName}`}>
            <Icon size={20} />
          </div>
          <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
          <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
        </div>

        {children}
      </div>
    </div>
  );
}