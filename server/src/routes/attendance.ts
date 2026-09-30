import { Router } from "express";
import { calculateDepletion } from "../utils/forecast";
import { findRedistributionMatches } from "../utils/redistribution";
import { findStockWithPhc, toStockItems } from "../utils/stock";
import { generateText, parseLang } from "../utils/gemini";
import { requireAuth } from "../middleware/auth";
import { chatLimiter } from "../middleware/ratelimit";

const router = Router();

const MAX_MESSAGE_LENGTH = 500;

router.post("/", requireAuth, chatLimiter, async (req, res) => {
  const { message, lang } = req.body;
  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "message is required" });
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return res.status(400).json({ error: `message too long (max ${MAX_MESSAGE_LENGTH} chars)` });
  }

  const stock = await findStockWithPhc();

  const alertLines = stock
    .map((item) => ({ item, ...calculateDepletion(item.quantity, item.dailyConsumptionRate) }))
    .filter((a) => a.status !== "healthy")
    .sort((a, b) => a.daysRemaining - b.daysRemaining)
    .slice(0, 10)
    .map(
      (a) =>
        `${a.item.medicineName} at ${a.item.phc.name} (${a.item.phc.state}): ${a.daysRemaining} days left, status ${a.status}`,
    );

  const redistLines = findRedistributionMatches(toStockItems(stock))
    .slice(0, 5)
    .map(
      (m) =>
        `Transfer ${m.suggestedTransferAmount} units of ${m.medicineName} from ${m.fromPhcName} (${m.fromState}) to ${m.toPhcName} (${m.toState})`,
    );

  const context = `Current low-stock alerts:
${alertLines.length ? alertLines.join("\n") : "None."}

Current redistribution suggestions:
${redistLines.length ? redistLines.join("\n") : "None."}`;

  const languageInstruction =
    parseLang(lang) === "hi" ? "Respond in Hindi (Devanagari script)." : "Respond in English.";

  const prompt = `You are an assistant embedded in a hospital supply-chain dashboard called MediSense AI. Answer the admin's question using ONLY the data below. Be concise (under 80 words), direct, and specific. If the data doesn't cover the question, say so plainly. ${languageInstruction}

${context}

Admin's question: ${message}`;

  try {
    res.json({ reply: await generateText(prompt) });
  } catch (err) {
    console.error("Chat Gemini call failed:", err);
    res.status(500).json({ error: "AI assistant is unavailable right now." });
  }
});

export default router;