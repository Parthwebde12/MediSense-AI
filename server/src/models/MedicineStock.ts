import mongoose, { Schema, Document, Types } from "mongoose";

export interface IMedicineStock extends Document {
  phc: Types.ObjectId;
  medicineName: string;
  quantity: number;
  unit: string; 
  dailyConsumptionRate: number;
  lastRestockedAt: Date;
}

const MedicineStockSchema = new Schema<IMedicineStock>(
  {
    phc: { type: Schema.Types.ObjectId, ref: "PHC", required: true },
    medicineName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true },
    dailyConsumptionRate: { type: Number, required: true, default: 0 },
    lastRestockedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model<IMedicineStock>("MedicineStock", MedicineStockSchema);