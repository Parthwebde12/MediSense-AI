import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2, Trash2 } from "lucide-react";
import { fetchAllCountries, createPHC, fetchAllPHCs, deletePHC } from "../lib/stockApi";
import { formCardClass, inputClass, labelClass, selectClass, submitClass } from "../lib/styles";
import { useFlash } from "../lib/useFlash";
import indiaStatesDistricts from "../data/indiaStatesDistricts.json";
import Banner from "../components/Banner";
import FormPage from "../components/FormPage";

// Queries that depend on PHCs and must refresh when one is removed.
const PHC_DEPENDENT_KEYS = ["phcs", "stock", "attendance", "alerts", "redistribution", "risk"];

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
  const [saved, flashSaved] = useFlash();

  const districtOptions = indiaStatesDistricts.find((s) => s.name === state)?.districts ?? [];

  const mutation = useMutation({
    mutationFn: createPHC,
    onSuccess: () => {
      setName("");
      setState("");
      setDistrict("");
      setCity("");
      setTotalBeds("");
      setOccupiedBeds("");
      queryClient.invalidateQueries({ queryKey: ["phcs"] });
      flashSaved();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePHC,
    onSuccess: () => {
      PHC_DEPENDENT_KEYS.forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));
    },
  });

  const handleDelete = (id: string, phcName: string) => {
    if (window.confirm(`Delete "${phcName}" and all its stock and attendance records?`)) {
      deleteMutation.mutate(id);
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
      totalBeds: Number(totalBeds) || 0,
      occupiedBeds: Number(occupiedBeds) || 0,
    });
  };

  return (
    <FormPage
      icon={Building2}
      iconClassName="bg-blue-100 text-blue-600"
      title="Add PHC"
      subtitle="Register a new Primary Health Centre."
    >
      {saved && <Banner variant="success">PHC added successfully.</Banner>}

      <form onSubmit={handleSubmit} className={formCardClass}>
        <div>
          <label className={labelClass}>PHC name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
            placeholder="e.g. PHC Lagos North"
            required
          />
        </div>

        <div>
          <label className={labelClass}>State</label>
          <select
            value={state}
            onChange={(e) => {
              setState(e.target.value);
              setDistrict("");
            }}
            className={selectClass}
            required
          >
            <option value="">Select a state</option>
            {indiaStatesDistricts.map((s) => (
              <option key={s.name} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>District</label>
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className={`${selectClass} disabled:bg-slate-50 disabled:text-slate-400`}
            required
            disabled={!state}
          >
            <option value="">{state ? "Select a district" : "Select a state first"}</option>
            {districtOptions.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>City / Town</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className={inputClass}
            placeholder="e.g. Nagpur"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Total beds</label>
            <input
              type="number"
              min={0}
              value={totalBeds}
              onChange={(e) => setTotalBeds(e.target.value)}
              className={inputClass}
              placeholder="0"
            />
          </div>
          <div>
            <label className={labelClass}>Occupied beds</label>
            <input
              type="number"
              min={0}
              value={occupiedBeds}
              onChange={(e) => setOccupiedBeds(e.target.value)}
              className={inputClass}
              placeholder="0"
            />
          </div>
        </div>

        <button type="submit" disabled={mutation.isPending} className={submitClass}>
          {mutation.isPending ? "Adding…" : "Add PHC"}
        </button>
      </form>

      <div className="mt-8">
        <h2 className="text-sm font-semibold text-slate-800 mb-3">Manage PHCs</h2>
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm divide-y divide-slate-50">
          {phcs?.length ? (
            phcs.map((p) => (
              <div key={p._id} className="flex items-center justify-between px-4 py-3">
                <span className="text-sm text-slate-700">
                  {p.name}{" "}
                  <span className="text-slate-400">
                    — {p.city ?? "—"}, {p.district ?? "—"}, {p.state ?? "Unknown"}
                    {p.totalBeds !== undefined && (
                      <>
                        {" "}
                        · {p.occupiedBeds ?? 0}/{p.totalBeds} beds
                      </>
                    )}
                  </span>
                </span>
                <button
                  onClick={() => handleDelete(p._id, p.name)}
                  disabled={deleteMutation.isPending}
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
    </FormPage>
  );
}