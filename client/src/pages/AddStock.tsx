import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAllPHCs, createStock } from "../lib/stockApi";
import type { PHC } from "../lib/stockApi";

export default function AddStock() {
  const navigate = useNavigate();

  const [phcs, setPhcs] = useState<PHC[]>([]);
  const [phc, setPhc] = useState("");
  const [medicineName, setMedicineName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [dailyConsumptionRate, setDailyConsumptionRate] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadPHCs = async () => {
      try {
        const data = await fetchAllPHCs();
        setPhcs(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load PHCs");
      }
    };

    loadPHCs();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!phc || !medicineName || !quantity || !unit) {
      setError("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);

      await createStock({
        phc,
        medicineName,
        quantity: Number(quantity),
        unit,
        dailyConsumptionRate: Number(dailyConsumptionRate || 0),
      });

      setSuccess("Stock added successfully");

      setMedicineName("");
      setQuantity("");
      setUnit("");
      setDailyConsumptionRate("");

      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (err) {
      console.error(err);
      setError("Failed to add stock");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-xl">
        <h1 className="mb-2 text-2xl font-bold">
          Add Medicine Stock
        </h1>

        <p className="mb-6 text-gray-600">
          Add medicine stock for a Primary Health Centre.
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-xl border p-6 shadow-sm"
        >
          <div>
            <label className="mb-1 block font-medium">
              PHC
            </label>

            <select
              value={phc}
              onChange={(e) => setPhc(e.target.value)}
              className="w-full rounded-lg border p-3"
              required
            >
              <option value="">Select PHC</option>

              {phcs.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block font-medium">
              Medicine Name
            </label>

            <input
              type="text"
              value={medicineName}
              onChange={(e) => setMedicineName(e.target.value)}
              placeholder="e.g. Paracetamol"
              className="w-full rounded-lg border p-3"
              required
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">
              Quantity
            </label>

            <input
              type="number"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="e.g. 500"
              className="w-full rounded-lg border p-3"
              required
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">
              Unit
            </label>

            <input
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="e.g. tablets, bottles"
              className="w-full rounded-lg border p-3"
              required
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">
              Daily Consumption Rate
            </label>

            <input
              type="number"
              min="0"
              value={dailyConsumptionRate}
              onChange={(e) => setDailyConsumptionRate(e.target.value)}
              placeholder="e.g. 25"
              className="w-full rounded-lg border p-3"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 p-3 text-red-600">
              {error}
            </p>
          )}

          {success && (
            <p className="rounded-lg bg-green-50 p-3 text-green-600">
              {success}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="rounded-lg border px-5 py-3"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-black px-5 py-3 text-white disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Stock"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}