import mongoose, { Schema, Document, Types } from "mongoose";

export interface IAttendance extends Document {
  phc: Types.ObjectId;
  staffName: string;
  role: string;
  date: Date;
  present: boolean;
  patientFootfall: number;
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    phc: { type: Schema.Types.ObjectId, ref: "PHC", required: true },
    staffName: { type: String, required: true },
    role: { type: String, required: true },
    date: { type: Date, required: true, default: Date.now },
    present: { type: Boolean, required: true, default: true },
    patientFootfall: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<IAttendance>("Attendance", AttendanceSchema);