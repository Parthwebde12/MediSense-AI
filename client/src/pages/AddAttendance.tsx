import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users } from "lucide-react";
import { fetchAllPHCs, createAttendance } from "../lib/stockApi";
import { formCardClass, inputClass, labelClass, selectClass, submitClass } from "../lib/styles";
import { useFlash } from "../lib/useFlash";
import Banner from "../components/Banner";
import FormPage from "../components/FormPage";
import PhcSelect from "../components/PhcSelect";

const ROLES = ["doctor", "nurse", "pharmacist"];

export default function AddAttendance() {
  const queryClient = useQueryClient();
  const { data: phcs } = useQuery({ queryKey: ["phcs"], queryFn: fetchAllPHCs });

  const [phc, setPhc] = useState("");
  const [staffName, setStaffName] = useState("");
  const [role, setRole] = useState(ROLES[0]);
  const [present, setPresent] = useState(true);
  const [patientFootfall, setPatientFootfall] = useState("");
  const [saved, flashSaved] = useFlash();

  const mutation = useMutation({
    mutationFn: createAttendance,
    onSuccess: () => {
      setStaffName("");
      setPatientFootfall("");
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      flashSaved();
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
    <FormPage
      icon={Users}
      iconClassName="bg-purple-100 text-purple-600"
      title="Add Attendance"
      subtitle="Log staff attendance and patient footfall for a PHC."
    >
      {saved && <Banner variant="success">Attendance record added successfully.</Banner>}

      <form onSubmit={handleSubmit} className={formCardClass}>
        <PhcSelect value={phc} onChange={setPhc} phcs={phcs} />

        <div>
          <label className={labelClass}>Staff name</label>
          <input
            type="text"
            value={staffName}
            onChange={(e) => setStaffName(e.target.value)}
            className={inputClass}
            placeholder="e.g. Dr. Amara Okafor"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} className={selectClass}>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Status</label>
            <select
              value={present ? "present" : "absent"}
              onChange={(e) => setPresent(e.target.value === "present")}
              className={selectClass}
            >
              <option value="present">Present</option>
              <option value="absent">Absent</option>
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass}>Patient footfall (today)</label>
          <input
            type="number"
            value={patientFootfall}
            onChange={(e) => setPatientFootfall(e.target.value)}
            className={inputClass}
            min="0"
            placeholder="e.g. 24"
          />
        </div>

        <button type="submit" disabled={mutation.isPending} className={submitClass}>
          {mutation.isPending ? "Adding…" : "Add attendance record"}
        </button>
      </form>
    </FormPage>
  );
}