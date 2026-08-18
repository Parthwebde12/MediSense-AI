import mongoose from "mongoose";
import dotenv from "dotenv";
import Country from "./models/Country";
import PHC from "./models/PHC";
import MedicineStock from "./models/MedicineStock";
import Attendance from "./models/Attendance";

dotenv.config();

const seed = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI is not set in .env");
  }

  await mongoose.connect(uri);
  console.log("Connected for seeding...");

  
  await Country.deleteMany({});
  await PHC.deleteMany({});
  await MedicineStock.deleteMany({});
  await Attendance.deleteMany({});
  console.log("Old data cleared.");

 
const countries = await Country.create([
  { name: "India", code: "IN" },
  { name: "Brazil", code: "BR" },
  { name: "South Africa", code: "ZA" },
]);
const india = countries[0]!;
const brazil = countries[1]!;
const southAfrica = countries[2]!;

 
  const phcs = await PHC.create([
    { name: "PHC Nagpur East", country: india._id, district: "Nagpur", location: { lat: 21.15, lng: 79.09 } },
    { name: "PHC Pune North", country: india._id, district: "Pune", location: { lat: 18.52, lng: 73.85 } },
    { name: "PHC Recife Central", country: brazil._id, district: "Recife", location: { lat: -8.05, lng: -34.9 } },
    { name: "PHC Bahia Rural", country: brazil._id, district: "Bahia", location: { lat: -12.97, lng: -38.5 } },
    { name: "PHC Cape Town South", country: southAfrica._id, district: "Cape Town", location: { lat: -33.92, lng: 18.42 } },
    { name: "PHC Durban East", country: southAfrica._id, district: "Durban", location: { lat: -29.85, lng: 31.02 } },
  ]);

  const medicines = ["Paracetamol", "Amoxicillin", "ORS Sachets", "Insulin", "Iron Tablets"];

  const stockDocs = [];
  for (const phc of phcs) {
    for (const med of medicines) {
      const isLow = Math.random() < 0.35; 
      stockDocs.push({
        phc: phc._id,
        medicineName: med,
        quantity: isLow ? Math.floor(Math.random() * 20) + 5 : Math.floor(Math.random() * 300) + 200,
        unit: med === "ORS Sachets" ? "sachets" : med === "Insulin" ? "vials" : "tablets",
        dailyConsumptionRate: Math.floor(Math.random() * 15) + 5,
        lastRestockedAt: new Date(Date.now() - Math.floor(Math.random() * 20) * 86400000),
      });
    }
  }
  await MedicineStock.create(stockDocs);

 
  const roles = ["doctor", "nurse", "pharmacist"];
  const attendanceDocs = [];
  for (const phc of phcs) {
    for (let d = 0; d < 5; d++) {
      const date = new Date(Date.now() - d * 86400000);
      for (const role of roles) {
        attendanceDocs.push({
          phc: phc._id,
          staffName: `${role.charAt(0).toUpperCase() + role.slice(1)} ${phc.name.split(" ")[1]}`,
          role,
          date,
          present: Math.random() > 0.15,
          patientFootfall: Math.floor(Math.random() * 40) + 10,
        });
      }
    }
  }
  await Attendance.create(attendanceDocs);

  console.log("Seed complete:");
  console.log(`- ${await Country.countDocuments()} countries`);
  console.log(`- ${await PHC.countDocuments()} PHCs`);
  console.log(`- ${await MedicineStock.countDocuments()} stock records`);
  console.log(`- ${await Attendance.countDocuments()} attendance records`);

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});