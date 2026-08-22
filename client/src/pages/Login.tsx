import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../context/Authcontext";
import { HeartPulse, Globe2, Sparkles } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      login(res.data.token, res.data.user);
      navigate("/dashboard");
    } catch {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setEmail("demo@smarthealth.com");
    setPassword("demo1234");
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-blue-500 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-emerald-500 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-16">
            <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center">
              <HeartPulse size={18} className="text-slate-900" />
            </div>
            <span className="font-semibold text-lg">Smart Health</span>
          </div>

          <h1 className="text-4xl font-semibold leading-tight mb-4">
            Predicting shortages
            <br />
            before they happen.
          </h1>
          <p className="text-slate-400 text-base max-w-md">
            An AI-powered platform that forecasts medicine stock-outs and
            recommends cross-border redistribution across health centres.
          </p>
        </div>

        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3 text-sm text-slate-300">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
              <Sparkles size={15} />
            </div>
            Gemini-powered early-warning alerts
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-300">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
              <Globe2 size={15} />
            </div>
            Cross-country redistribution matching
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 bg-slate-900 rounded-lg flex items-center justify-center">
              <HeartPulse size={18} className="text-white" />
            </div>
            <span className="font-semibold text-lg text-slate-900">Smart Health</span>
          </div>

          <h2 className="text-xl font-semibold text-slate-900 mb-1">Welcome back</h2>
          <p className="text-sm text-slate-500 mb-6">Sign in to your regional dashboard</p>

          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            {error && (
              <p className="text-red-600 text-sm mb-4 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}

            <label className="block text-xs font-medium text-slate-600 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 transition-shadow"
              required
            />

            <label className="block text-xs font-medium text-slate-600 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 mb-6 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 transition-shadow"
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

          <button
            type="button"
            onClick={fillDemo}
            className="mt-4 w-full text-left bg-white border border-slate-100 rounded-2xl px-4 py-3 text-xs text-slate-500 hover:border-slate-200 hover:shadow-sm transition-all"
          >
            <p className="font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Sparkles size={13} /> Try the demo account
            </p>
            <p>Email: <span className="font-mono text-slate-700">demo@smarthealth.com</span></p>
            <p>Password: <span className="font-mono text-slate-700">demo1234</span></p>
          </button>
        </div>
      </div>
    </div>
  );
}