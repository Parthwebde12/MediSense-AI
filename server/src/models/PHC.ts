import mongoose, { Schema, Document } from "mongoose";

export interface IPHC extends Document {
  name: string;
  state: string;
  district: string;
  city: string;
  totalBeds: number;
  occupiedBeds: number;
}

const PHCSchema = new Schema<IPHC>({
  name: { type: String, required: true },
  state: { type: String, required: true },
  district: { type: String, required: true },
  city: { type: String, required: true },
  totalBeds: { type: Number, default: 0, min: 0 },
  occupiedBeds: { type: Number, default: 0, min: 0 },
});

export default mongoose.model<IPHC>("PHC", PHCSchema);