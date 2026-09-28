import { Router } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import MedicineStock from "../models/MedicineStock";
import { calculateDepletion } from "../utils/forecast";
import { findRedistributionMatches } from "../utils/redistribution";
import { requireAuth } from "../middleware/auth";
import { chatLimiter } from "../middleware/ratelimit";

const router = Router();

router.post("/", requireAuth, chatLimiter, async (req, res) => {
  const { message } = req.body;
  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "message is required" });
  }
  if (message.length > 500) {
    return res.status(400).json({ error: "message too long (max 500 chars)" });
  }

  const stock = (await MedicineStock.find().populate("phc")).filter(
    (item: any) => item.phc,
  );

  const alertLines = stock
    .map((item: any) => ({
      item,
      ...calculateDepletion(item.quantity, item.dailyConsumptionRate),
    }))
    .filter((a) => a.status !== "healthy")
    .sort((a, b) => a.daysRemaining - b.daysRemaining)
    .slice(0, 10)
    .map(
      (a) =>
        `${a.item.medicineName} at ${a.item.phc.name} (${a.item.phc.state}): ${a.daysRemaining} days left, status ${a.status}`,
    );

  const stockItems = stock.map((item: any) => ({
    phcId: item.phc._id.toString(),
    phcName: item.phc.name,
    state: item.phc.state,
    medicineName: item.medicineName,
    quantity: item.quantity,
    dailyConsumptionRate: item.dailyConsumptionRate,
  }));

  const redistLines = findRedistributionMatches(stockItems)
    .slice(0, 5)
    .map(
      (m) =>
        `Transfer ${m.suggestedTransferAmount} units of ${m.medicineName} from ${m.fromPhcName} (${m.fromState}) to ${m.toPhcName} (${m.toState})`,
    );

  const context = `Current low-stock alerts:
${alertLines.length ? alertLines.join("\n") : "None."}

Current redistribution suggestions:
${redistLines.length ? redistLines.join("\n") : "None."}`;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY is not set" });
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash-lite" });

  const prompt = `You are an assistant embedded in a hospital supply-chain dashboard called MediSense AI. Answer the admin's question using ONLY the data below. Be concise (under 80 words), direct, and specific. If the data doesn't cover the question, say so plainly.

${context}

Admin's question: ${message}`;

  try {
    const result = await model.generateContent(prompt);
    res.json({ reply: result.response.text().trim() });
  } catch (err) {
    console.error("Chat Gemini call failed:", err);
    res.status(500).json({ error: "AI assistant is unavailable right now." });
  }
});

export default router;