import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../context/Authcontext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"regional_admin" | "phc_staff">("phc_staff");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  setLoading(true);
  try {
    const res = await api.post("/auth/login", { email, password, role });
    login(res.data.token, res.data.user);
    navigate("/dashboard");
  } catch (err: any) {
    setError(err?.response?.data?.error ?? "Invalid email or password");
  } finally {
    setLoading(false);
  }
};

  return (
  <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
    <form
      onSubmit={handleSubmit}
      className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm border border-slate-100"
    >
      <div className="mb-6">
        <div className="w-10 h-10 bg-slate-900 rounded-lg mb-4 flex items-center justify-center text-white text-sm font-semibold">
          SH
        </div>
        <h1 className="text-xl font-semibold text-slate-900">
          Sign in
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Smart Health & Supply Chain Resilience
        </p>
      </div>
      {error && (
        <p className="text-red-600 text-sm mb-4 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}
      <label className="block text-xs font-medium text-slate-600 mb-1.5">Signing in as</label>
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          type="button"
          onClick={() => setRole("phc_staff")}
          className={`py-2 rounded-lg text-sm font-medium border transition-colors ${
            role === "phc_staff"
              ? "bg-slate-900 text-white border-slate-900"
              : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
          }`}
        >
          Staff
        </button>
        <button
          type="button"
          onClick={() => setRole("regional_admin")}
          className={`py-2 rounded-lg text-sm font-medium border transition-colors ${
            role === "regional_admin"
              ? "bg-slate-900 text-white border-slate-900"
              : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
          }`}
        >
          Admin
        </button>
      </div>
      <label className="block text-xs font-medium text-slate-600 mb-1.5">Email</label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full border border-slate-200 rounded-lg px-3 py-2.5 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300"
        required
      />
      <label className="block text-xs font-medium text-slate-600 mb-1.5">Password</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full border border-slate-200 rounded-lg px-3 py-2.5 mb-6 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300"
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-slate-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </form>
    <div className="mt-4 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs text-slate-500">
  <p className="font-medium text-slate-600 mb-1">Demo credentials</p>
  <p>Email: <span className="font-mono text-slate-700">demo@smarthealth.com</span></p>
  <p>Password: <span className="font-mono text-slate-700">demo1234</span></p>
</div>
  </div>
)
}