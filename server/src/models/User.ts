import mongoose, { Schema, Document, Types } from "mongoose";

export type UserRole = "phc_staff" | "regional_admin";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  phc?: Types.ObjectId; 
  country?: Types.ObjectId; 
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["phc_staff", "regional_admin"], required: true },
    phc: { type: Schema.Types.ObjectId, ref: "PHC" },
    country: { type: Schema.Types.ObjectId, ref: "Country" },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", UserSchema);