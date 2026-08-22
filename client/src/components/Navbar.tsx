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
    <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
      <span className="text-sm font-medium text-slate-800">
        Smart Health & Supply Chain Resilience
      </span>
      <div className="flex items-center gap-4">
        {user && (
          <span className="text-sm text-slate-500">
            {user.name} · {user.role.replace("_", " ")}
          </span>
        )}
        <button
          onClick={handleLogout}
          className="text-sm text-slate-500 hover:text-slate-800"
        >
          Log out
        </button>
      </div>
    </div>
  );
}