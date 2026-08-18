import mongoose, { Schema, Document, Types } from "mongoose";

export interface IPHC extends Document {
  name: string;
  country: Types.ObjectId;
  district: string;
  location?: {
    lat: number;
    lng: number;
  };
}

const PHCSchema = new Schema<IPHC>({
  name: { type: String, required: true },
  country: { type: Schema.Types.ObjectId, ref: "Country", required: true },
  district: { type: String, required: true },
  location: {
    lat: { type: Number },
    lng: { type: Number },
  },
});

export default mongoose.model<IPHC>("PHC", PHCSchema);