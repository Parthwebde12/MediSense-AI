import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../context/Authcontext";

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

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm"
      >
        <h1 className="text-xl font-semibold text-slate-800 mb-6">
          Sign in
        </h1>
        {error && (
          <p className="text-red-500 text-sm mb-4">{error}</p>
        )}
        <label className="block text-sm text-slate-600 mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-slate-300 rounded px-3 py-2 mb-4 text-sm"
          required
        />
        <label className="block text-sm text-slate-600 mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-slate-300 rounded px-3 py-2 mb-6 text-sm"
          required/>
        <button
  type="submit"
  disabled={loading}
  className="w-full bg-slate-800 text-white py-2 rounded text-sm font-medium hover:bg-slate-700 disabled:opacity-50"
>
  {loading ? "Signing in…" : "Sign in"}
</button>
      </form>
    </div>
  );
}