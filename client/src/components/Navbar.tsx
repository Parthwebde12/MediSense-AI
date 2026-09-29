import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const ADMIN_LINKS = [
  { to: "/add-stock", label: "Add stock" },
  { to: "/add-phc", label: "Add PHC" },
  { to: "/add-attendance", label: "Add attendance" },
];

const linkClass = "text-sm text-slate-500 hover:text-slate-900 transition-colors";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white text-xs font-semibold">
          SH
        </div>
        <span className="text-sm font-semibold text-slate-900">MediSense AI</span>
      </div>

      <div className="flex items-center gap-4">
        {user?.role === "regional_admin" &&
          ADMIN_LINKS.map(({ to, label }) => (
            <Link key={to} to={to} className={linkClass}>
              {label}
            </Link>
          ))}
        {user && (
          <span className="text-sm text-slate-500">
            {user.name} <span className="text-slate-300">·</span>{" "}
            <span className="capitalize">{user.role.replace("_", " ")}</span>
          </span>
        )}
        <button
          onClick={handleLogout}
          className={`${linkClass} px-3 py-1.5 rounded-lg hover:bg-slate-50`}
        >
          Log out
        </button>
      </div>
    </div>
  );
}