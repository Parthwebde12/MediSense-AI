import mongoose, { Schema, Document } from "mongoose";

export interface ICountry extends Document {
  name: string;
  code: string;
}

const CountrySchema = new Schema<ICountry>({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
});

export default mongoose.model<ICountry>("Country", CountrySchema);