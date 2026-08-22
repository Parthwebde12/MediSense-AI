import mongoose from "mongoose";
import dotenv from "dotenv";
import Country from "./models/Country";
import PHC from "./models/PHC";
import MedicineStock from "./models/MedicineStock";
import Attendance from "./models/Attendance";

dotenv.config({ path: ".env.local" });

const seed = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI is not set in .env.local");
  }

  await mongoose.connect(uri);
  console.log("Connected for seeding...");

  await Country.deleteMany({});
  await PHC.deleteMany({});
  await MedicineStock.deleteMany({});
  await Attendance.deleteMany({});
  console.log("Old data cleared.");

  await Country.create([
    { name: "India", code: "IN" },
    { name: "Brazil", code: "BR" },
    { name: "South Africa", code: "ZA" },
  ]);

  console.log("Seed complete:");
  console.log(`- ${await Country.countDocuments()} countries`);
  console.log("PHCs, stock, and attendance are empty — add them manually via the app.");

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});