import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAllPHCs, createAttendance } from "../lib/stockApi";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import { Users, ArrowLeft, Check } from "lucide-react";

export default function AddAttendance() {
  const queryClient = useQueryClient();
  const { data: phcs } = useQuery({ queryKey: ["phcs"], queryFn: fetchAllPHCs });

  const [phc, setPhc] = useState("");
  const [staffName, setStaffName] = useState("");
  const [role, setRole] = useState("doctor");
  const [present, setPresent] = useState(true);
  const [patientFootfall, setPatientFootfall] = useState("");
  const [success, setSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: createAttendance,
    onSuccess: () => {
      setSuccess(true);
      setStaffName("");
      setPatientFootfall("");
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      setTimeout(() => setSuccess(false), 3000);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phc || !staffName) return;
    mutation.mutate({
      phc,
      staffName,
      role,
      present,
      patientFootfall: Number(patientFootfall) || 0,
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
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mb-3">
            <Users size={20} className="text-purple-600" />
          </div>
          <h1 className="text-xl font-semibold text-slate-900">Add Attendance</h1>
          <p className="text-sm text-slate-500 mt-1">
            Log staff attendance and patient footfall for a PHC.
          </p>
        </div>

        {success && (
          <div className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-xl px-4 py-3 mb-4 flex items-center gap-2">
            <Check size={16} /> Attendance record added successfully.
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
              {phcs?.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} {p.state ? `(${p.state})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Staff name</label>
            <input
              type="text"
              value={staffName}
              onChange={(e) => setStaffName(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 transition-shadow"
              placeholder="e.g. Dr. Amara Okafor"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 transition-shadow"
              >
                <option value="doctor">doctor</option>
                <option value="nurse">nurse</option>
                <option value="pharmacist">pharmacist</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Status</label>
              <select
                value={present ? "present" : "absent"}
                onChange={(e) => setPresent(e.target.value === "present")}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 transition-shadow"
              >
                <option value="present">Present</option>
                <option value="absent">Absent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              Patient footfall (today)
            </label>
            <input
              type="number"
              value={patientFootfall}
              onChange={(e) => setPatientFootfall(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 transition-shadow"
              min="0"
              placeholder="e.g. 24"
            />
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-slate-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 mt-2"
          >
            {mutation.isPending ? "Adding…" : "Add attendance record"}
          </button>
        </form>
      </div>
    </div>
  );
}