import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/Authcontext";

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
        <span className="text-sm font-semibold text-slate-900">
          Smart Health & Supply Chain Resilience
        </span>
      </div>
      <div className="flex items-center gap-4">
        {user?.role === "regional_admin" && (
          <>
            <a href="/add-stock" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
              Add stock
            </a>
            <a href="/add-phc" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
              Add PHC
            </a>
            <a href="/add-attendance" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
              Add attendance
            </a>
          </>
        )}
        {user && (
          <span className="text-sm text-slate-500">
            {user.name} <span className="text-slate-300">·</span>{" "}
            <span className="capitalize">{user.role.replace("_", " ")}</span>
          </span>
        )}
        <button
          onClick={handleLogout}
          className="text-sm text-slate-500 hover:text-slate-900 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-50"
        >
          Log out
        </button>
      </div>
    </div>
  );
}