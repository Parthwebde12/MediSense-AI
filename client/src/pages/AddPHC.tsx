import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAllCountries, createPHC } from "../lib/stockApi";
import Navbar from "../components/Navbar";

export default function AddPHC() {
  const queryClient = useQueryClient();
  const { data: countries } = useQuery({ queryKey: ["countries"], queryFn: fetchAllCountries });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !country || !district) return;
    mutation.mutate({ name, country, district });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-md mx-auto p-6">
        <h1 className="text-lg font-semibold text-slate-900 mb-1">Add PHC</h1>
        <p className="text-sm text-slate-500 mb-6">Register a new Primary Health Centre.</p>

        {success && (
          <div className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-xl px-4 py-3 mb-4">
            PHC added successfully.
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <label className="block text-xs font-medium text-slate-600 mb-1.5">PHC name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 mb-4 text-sm"
            placeholder="e.g. PHC Lagos North"
            required
          />

          <label className="block text-xs font-medium text-slate-600 mb-1.5">Country</label>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 mb-4 text-sm"
            required
          >
            <option value="">Select a country</option>
            {countries?.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>

          <label className="block text-xs font-medium text-slate-600 mb-1.5">District</label>
          <input
            type="text"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 mb-6 text-sm"
            required
          />

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-slate-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            {mutation.isPending ? "Adding…" : "Add PHC"}
          </button>
        </form>
      </div>
    </div>
  );
}