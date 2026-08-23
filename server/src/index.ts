import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import authRoutes from "./routes/auth";
import phcRoutes from "./routes/phc";
import medicineStockRoutes from "./routes/medicineStock";
import attendance from "./routes/attendance";
import { startConsumptionSimulation } from "./utils/simulateConsumption";
import countryRoutes from "./routes/country";
import riskRoutes from "./routes/risk";

dotenv.config({ path: ".env.local" });
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://smart-health-brics.vercel.app",
  ],
}));app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "smart-health-brics-server" });
});

app.use("/api/auth", authRoutes);
app.use("/api/phc", phcRoutes);
app.use("/api/stock", medicineStockRoutes);
app.use("/api/attendance", attendance);
app.use("/api/country", countryRoutes);
app.use("/api/risk", riskRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startConsumptionSimulation(30000); 
});