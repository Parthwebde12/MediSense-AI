import type { PHC } from "../lib/stockApi";
import { labelClass, selectClass } from "../lib/styles";

export default function PhcSelect({
  value,
  onChange,
  phcs,
}: {
  value: string;
  onChange: (id: string) => void;
  phcs?: PHC[];
}) {
  return (
    <div>
      <label className={labelClass}>PHC</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={selectClass}
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
  );
}