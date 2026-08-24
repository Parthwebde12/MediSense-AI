import mongoose from "mongoose";
import dotenv from "dotenv";
import PHC from "./models/PHC";
import MedicineStock from "./models/MedicineStock";
import Attendance from "./models/Attendance";

dotenv.config({ path: ".env.local" });

const cleanup = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI is not set in .env.local");
  }

  await mongoose.connect(uri);
  console.log("Connected for cleanup...");

  const validPhcIds = new Set(
    (await PHC.find({}, "_id")).map((p) => p._id.toString())
  );

  const allStock = await MedicineStock.find({}, "_id phc");
  const orphanedStockIds = allStock
    .filter((s) => !s.phc || !validPhcIds.has(s.phc.toString()))
    .map((s) => s._id);

  const allAttendance = await Attendance.find({}, "_id phc");
  const orphanedAttendanceIds = allAttendance
    .filter((a) => !a.phc || !validPhcIds.has(a.phc.toString()))
    .map((a) => a._id);

  console.log(`Found ${orphanedStockIds.length} orphaned MedicineStock records.`);
  console.log(`Found ${orphanedAttendanceIds.length} orphaned Attendance records.`);

  if (orphanedStockIds.length) {
    const res = await MedicineStock.deleteMany({ _id: { $in: orphanedStockIds } });
    console.log(`Deleted ${res.deletedCount} orphaned MedicineStock records.`);
  }

  if (orphanedAttendanceIds.length) {
    const res = await Attendance.deleteMany({ _id: { $in: orphanedAttendanceIds } });
    console.log(`Deleted ${res.deletedCount} orphaned Attendance records.`);
  }

  console.log("Cleanup complete.");
  await mongoose.disconnect();
  process.exit(0);
};

cleanup().catch((err) => {
  console.error("Cleanup failed:", err);
  process.exit(1);
});