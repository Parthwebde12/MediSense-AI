import mongoose, { Schema, Document, Types } from "mongoose";

export interface IPHC extends Document {
  name: string;
  country: Types.ObjectId;
  state: string;
  district: string;
  city: string;
}

const PHCSchema = new Schema<IPHC>({
  name: { type: String, required: true },
  country: { type: Schema.Types.ObjectId, ref: "Country", required: true },
  state: { type: String, required: true },
  district: { type: String, required: true },
  city: { type: String, required: true },
});

export default mongoose.model<IPHC>("PHC", PHCSchema);