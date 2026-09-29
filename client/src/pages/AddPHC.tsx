import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {fetchAllCountries,createPHC,fetchAllPHCs,deletePHC,updatePHCBeds} from "../lib/stockApi";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import { Building2, ArrowLeft, Check, Trash2, Pencil } from "lucide-react";
import indiaStatesDistricts from "../data/indiaStatesDistricts.json";

export default function AddPHC() {
  const queryClient = useQueryClient();
  const { data: countries } = useQuery({ queryKey: ["countries"], queryFn: fetchAllCountries });
  const { data: phcs } = useQuery({ queryKey: ["phcs"], queryFn: fetchAllPHCs });

  const india = countries?.find((c) => c.code === "IN");

  const [name, setName] = useState("");
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("");
  const [totalBeds, setTotalBeds] = useState("");
  const [occupiedBeds, setOccupiedBeds] = useState("");
  const [success, setSuccess] = useState(false);

  const [editingBedsId, setEditingBedsId] = useState<string | null>(null);
  const [bedForm, setBedForm] = useState({ total: "", occupied: "" });

  const districtOptions = useMemo(() => {
    return indiaStatesDistricts.find((s) => s.name === state)?.districts ?? [];
  }, [state]);

  const mutation = useMutation({
    mutationFn: createPHC,
    onSuccess: () => {
      setSuccess(true);
      setName("");
      setState("");
      setDistrict("");
      setCity("");
      setTotalBeds("");
      setOccupiedBeds("");
      queryClient.invalidateQueries({ queryKey: ["phcs"] });
      setTimeout(() => setSuccess(false), 3000);
    },
  });

  const deletePhcMutation = useMutation({
    mutationFn: deletePHC,
    onSuccess: () => {
      for (const key of ["phcs", "stock", "attendance", "alerts", "redistribution", "risk"]) {
        queryClient.invalidateQueries({ queryKey: [key] });
      }
    },
  });

  const bedsMutation = useMutation({
    mutationFn: ({ id, total, occupied }: { id: string; total: number; occupied: number }) =>
      updatePHCBeds(id, total, occupied),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["phcs"] });
      setEditingBedsId(null);
    },
  });

  const handleDelete = (id: string, phcName: string) => {
    if (window.confirm(`Delete "${phcName}" and all its stock and attendance records?`)) {
      deletePhcMutation.mutate(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !india || !state || !district || !city) return;
    mutation.mutate({
      name,
      country: india._id,
      state,
      district,
      city,
      totalBeds: totalBeds ? Number(totalBeds) : 0,
      occupiedBeds: occupiedBeds ? Number(occupiedBeds) : 0,
    });
  };

  const startEditingBeds = (p: { _id: string; totalBeds?: number; occupiedBeds?: number }) => {
    setEditingBedsId(p._id);
    setBedForm({
      total: String(p.totalBeds ?? 0),
      occupied: String(p.occupiedBeds ?? 0),
    });
  };

  const saveBeds = (id: string) => {
    bedsMutation.mutate({
      id,
      total: Number(bedForm.total) || 0,
      occupied: Number(bedForm.occupied) || 0,
    });
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
            <label className="block text-xs font-medium text-slate-600 mb-1.5">State</label>
            <select
              value={state}
              onChange={(e) => {
                setState(e.target.value);
                setDistrict("");
              }}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 transition-shadow"
              required
            >
              <option value="">Select a state</option>
              {indiaStatesDistricts.map((s) => (
                <option key={s.name} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">District</label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 transition-shadow disabled:bg-slate-50 disabled:text-slate-400"
              required
              disabled={!state}
            >
              <option value="">{state ? "Select a district" : "Select a state first"}</option>
              {districtOptions.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">City / Town</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 transition-shadow"
              placeholder="e.g. Nagpur"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Total beds</label>
              <input
                type="number"
                min={0}
                value={totalBeds}
                onChange={(e) => setTotalBeds(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 transition-shadow"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Occupied beds</label>
              <input
                type="number"
                min={0}
                value={occupiedBeds}
                onChange={(e) => setOccupiedBeds(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 transition-shadow"
                placeholder="0"
              />
            </div>
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
          <h2 className="text-sm font-semibold text-slate-800 mb-3">Manage PHCs</h2>
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm divide-y divide-slate-50">
            {phcs?.length ? (
              phcs.map((p) => (
                <div key={p._id} className="px-4 py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-700">
                      {p.name}{" "}
                      <span className="text-slate-400">
                        — {p.city ?? "—"}, {p.district ?? "—"}, {p.state ?? "Unknown"}
                        {p.totalBeds !== undefined && (
                          <> · {p.occupiedBeds ?? 0}/{p.totalBeds} beds</>
                        )}
                      </span>
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => startEditingBeds(p)}
                        className="text-slate-400 hover:text-slate-700 transition-colors"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(p._id, p.name)}
                        disabled={deletePhcMutation.isPending}
                        className="text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {editingBedsId === p._id && (
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        value={bedForm.total}
                        onChange={(e) => setBedForm((f) => ({ ...f, total: e.target.value }))}
                        placeholder="Total beds"
                        className="w-24 border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                      />
                      <input
                        type="number"
                        min={0}
                        value={bedForm.occupied}
                        onChange={(e) => setBedForm((f) => ({ ...f, occupied: e.target.value }))}
                        placeholder="Occupied"
                        className="w-24 border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                      />
                      <button
                        onClick={() => saveBeds(p._id)}
                        disabled={bedsMutation.isPending}
                        className="text-xs bg-slate-900 text-white px-3 py-1.5 rounded-lg disabled:opacity-50"
                      >
                        {bedsMutation.isPending ? "Saving…" : "Save"}
                      </button>
                      <button
                        onClick={() => setEditingBedsId(null)}
                        className="text-xs text-slate-400 hover:text-slate-600"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
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