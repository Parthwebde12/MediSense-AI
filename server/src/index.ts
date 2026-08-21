import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import authRoutes from "./routes/auth";
import phcRoutes from "./routes/phc";
import medicineStockRoutes from "./routes/medicineStock";
import attendance from "./routes/attendance";

dotenv.config({ path: ".env.local" });
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "smart-health-brics-server" });
});

app.use("/api/auth", authRoutes);
app.use("/api/phc", phcRoutes);
app.use("/api/stock", medicineStockRoutes);
app.use("/api/attendance", attendance);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});