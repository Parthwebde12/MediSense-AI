import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchAllCountries,
  createPHC,
  deleteCountry,
  fetchAllPHCs,
  deletePHC,
} from "../lib/stockApi";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import { Building2, ArrowLeft, Check, Trash2 } from "lucide-react";

export default function AddPHC() {
  const queryClient = useQueryClient();
  const { data: countries } = useQuery({ queryKey: ["countries"], queryFn: fetchAllCountries });
  const { data: phcs } = useQuery({ queryKey: ["phcs"], queryFn: fetchAllPHCs });

  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [district, setDistrict] = useState("");
  const [success, setSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: createPHC,
    onSuccess: () => {
      setSuccess(true);
      setName("");
      setDistrict("");
      queryClient.invalidateQueries({ queryKey: ["phcs"] });
      setTimeout(() => setSuccess(false), 3000);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCountry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["countries"] });
    },
  });

  const deletePhcMutation = useMutation({
    mutationFn: deletePHC,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["phcs"] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !country || !district) return;
    mutation.mutate({ name, country, district });
  };

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
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
            <Building2 size={20} className="text-blue-600" />
          </div>
          <h1 className="text-xl font-semibold text-slate-900">Add PHC</h1>
          <p className="text-sm text-slate-500 mt-1">
            Register a new Primary Health Centre.
          </p>
        </div>

        {success && (
          <div className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-xl px-4 py-3 mb-4 flex items-center gap-2">
            <Check size={16} /> PHC added successfully.
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">PHC name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 transition-shadow"
              placeholder="e.g. PHC Lagos North"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Country</label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 transition-shadow"
              required
            >
              <option value="">Select a country</option>
              {countries?.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">District</label>
            <input
              type="text"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 transition-shadow"
              required
            />
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-slate-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 mt-2"
          >
            {mutation.isPending ? "Adding…" : "Add PHC"}
          </button>
        </form>

        <div className="mt-8">
          <h2 className="text-sm font-semibold text-slate-800 mb-3">Manage Countries</h2>
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm divide-y divide-slate-50">
            {countries?.length ? (
              countries.map((c) => (
                <div key={c._id} className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-slate-700">{c.name} ({c.code})</span>
                  <button
                    onClick={() => deleteMutation.mutate(c._id)}
                    disabled={deleteMutation.isPending}
                    className="text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400 px-4 py-3">No countries yet.</p>
            )}
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-sm font-semibold text-slate-800 mb-3">Manage PHCs</h2>
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm divide-y divide-slate-50">
            {phcs?.length ? (
              phcs.map((p:any) => (
                <div key={p._id} className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-slate-700">
                    {p.name} <span className="text-slate-400">— {p.country?.name ?? "Unknown"}</span>
                  </span>
                  <button
                    onClick={() => deletePhcMutation.mutate(p._id)}
                    disabled={deletePhcMutation.isPending}
                    className="text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400 px-4 py-3">No PHCs yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}