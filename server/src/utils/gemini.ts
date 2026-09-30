import { GoogleGenerativeAI } from "@google/generative-ai";

export type Lang = "en" | "hi";

const MODEL_NAME = "gemini-3.5-flash-lite";

export const parseLang = (v: unknown): Lang => (v === "hi" ? "hi" : "en");

const langLine = (lang: Lang) =>
  lang === "hi" ? "Respond in Hindi (Devanagari script)." : "Respond in English.";

const plainTextRule =
  "Output only plain text, no JSON, markdown, or bullet points.";

// Serialize all Gemini calls app-wide, spaced out, to stay under the
// free-tier per-minute burst limit (15/min on gemini-3.5-flash-lite).
// 15/min = 1 every 4s; use 4.5s for safety margin.
const MIN_GAP_MS = 4500;
let queueTail: Promise<unknown> = Promise.resolve();

const throttledCall = <T>(fn: () => Promise<T>): Promise<T> => {
  const run = queueTail.then(async () => {
    const result = await fn();
    await new Promise((r) => setTimeout(r, MIN_GAP_MS));
    return result;
  });
  // Swallow errors in the tail so one failed call doesn't jam the queue forever
  queueTail = run.catch(() => undefined);
  return run;
};

export const generateText = async (prompt: string): Promise<string> => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set in .env");
  const model = new GoogleGenerativeAI(apiKey).getGenerativeModel({ model: MODEL_NAME });

  return throttledCall(async () => {
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  });
};

export const generateAlertText = (
  phcName: string,
  stateName: string,
  medicineName: string,
  daysRemaining: number,
  lang: Lang = "en",
) =>
  generateText(
    `Write a short, urgent one-sentence alert under 25 words for a hospital admin dashboard. ${medicineName} stock at ${phcName} in ${stateName}, India will run out in ${daysRemaining} days. Be direct and actionable. ${plainTextRule} ${langLine(lang)}`,
  );

export const generateRedistributionText = (
  medicineName: string,
  fromPhc: string,
  fromState: string,
  toPhc: string,
  toState: string,
  amount: number,
  lang: Lang = "en",
) =>
  generateText(
    `Write a short, actionable one-sentence recommendation (under 30 words) for a hospital admin dashboard. Suggest transferring ${amount} units of ${medicineName} from ${fromPhc} in ${fromState} to ${toPhc} in ${toState}, which is critically low. Be direct. ${plainTextRule} ${langLine(lang)}`,
  );

export const generateRiskExplanation = (
  phcName: string,
  stateName: string,
  score: number,
  minDaysRemaining: number,
  attendanceRate: number,
  lang: Lang = "en",
) =>
  generateText(
    `Write one short sentence (under 25 words) explaining why ${phcName} in ${stateName}, India has a risk score of ${score}/100. Lowest stock has ${minDaysRemaining} days remaining. Staff attendance is ${Math.round(attendanceRate * 100)}%. Be direct and specific. ${plainTextRule} ${langLine(lang)}`,
  );