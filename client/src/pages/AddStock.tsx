import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAllPHCs, createStock } from "../lib/stockApi";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import { Pill, ArrowLeft,Check } from "lucide-react";

export default function AddStock() {
  const queryClient = useQueryClient();
  const { data: phcs } = useQuery({ queryKey: ["phcs"], queryFn: fetchAllPHCs });

  const [phc, setPhc] = useState("");
  const [medicineName, setMedicineName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("tablets");
  const [dailyConsumptionRate, setDailyConsumptionRate] = useState("");
  const [success, setSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: createStock,
    onSuccess: () => {
      setSuccess(true);
      setMedicineName("");
      setQuantity("");
      setDailyConsumptionRate("");
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      queryClient.invalidateQueries({ queryKey: ["redistribution"] });
      setTimeout(() => setSuccess(false), 3000);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phc || !medicineName || !quantity || !dailyConsumptionRate) return;
    mutation.mutate({
      phc,
      medicineName,
      quantity: Number(quantity),
      unit,
      dailyConsumptionRate: Number(dailyConsumptionRate),
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
  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center mb-3">
    <Pill size={20} className="text-amber-600" />
  </div>
        <h1 className="text-xl font-semibold text-slate-900">Add Stock Entry</h1>
        <p className="text-sm text-slate-500 mt-1">
          Log new or updated medicine stock for a PHC.
        </p>
      </div>

     {success && (
  <div className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-xl px-4 py-3 mb-4 flex items-center gap-2">
    <Check size={16} /> Stock entry added successfully.
  </div>
)}
      {mutation.isError && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">
          Failed to add stock entry. Please try again.
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">PHC</label>
          <select
            value={phc}
            onChange={(e) => setPhc(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 transition-shadow"
            required
          >
            <option value="">Select a PHC</option>
            {phcs?.map((p:any) => (
              <option key={p._id} value={p._id}>
                {p.name} {p.country ? `(${p.country.name})` : ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Medicine name</label>
          <input
            type="text"
            value={medicineName}
            onChange={(e) => setMedicineName(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 transition-shadow"
            placeholder="e.g. Paracetamol"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Quantity</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 transition-shadow"
              min="0"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Unit</label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 transition-shadow"
            >
              <option value="tablets">tablets</option>
              <option value="vials">vials</option>
              <option value="sachets">sachets</option>
              <option value="boxes">boxes</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">
            Daily consumption rate
          </label>
          <input
            type="number"
            value={dailyConsumptionRate}
            onChange={(e) => setDailyConsumptionRate(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 transition-shadow"
            min="0"
            placeholder="units used per day"
            required
          />
        </div>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full bg-slate-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 mt-2"
        >
          {mutation.isPending ? "Adding…" : "Add stock entry"}
        </button>
      </form>
    </div>
  </div>
);
}