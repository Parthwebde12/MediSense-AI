import { GoogleGenerativeAI } from "@google/generative-ai";

const getModel = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set in .env");
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: "gemini-3.6-flash" });
};

export const generateAlertText = async (
  phcName: string,
  stateName: string,
  medicineName: string,
  daysRemaining: number
): Promise<string> => {
  const model = getModel();
  const prompt = `Write a short, urgent one-sentence alert under 25 words for a hospital admin dashboard. ${medicineName} stock at ${phcName} in ${stateName}, India will run out in ${daysRemaining} days. Be direct and actionable.`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
};
export const generateRedistributionText = async (
  medicineName: string,
  fromPhc: string,
  fromState: string,
  toPhc: string,
  toState: string,
  amount: number
): Promise<string> => {
  const model = getModel();
  const prompt = `Write a short, actionable one-sentence recommendation (under 30 words) for a hospital admin dashboard. Suggest transferring ${amount} units of ${medicineName} from ${fromPhc} in ${fromState} to ${toPhc} in ${toState}, which is critically low. Be direct.`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
};
export const generateRiskExplanation = async (
  phcName: string,
  countryName: string,
  score: number,
  minDaysRemaining: number,
  attendanceRate: number
): Promise<string> => {
  const model = getModel();
  const prompt = `Write one short sentence (under 25 words) explaining why ${phcName} in ${countryName} has a risk score of ${score}/100. Lowest stock has ${minDaysRemaining} days remaining. Staff attendance is ${Math.round(attendanceRate * 100)}%. Be direct and specific.`;
  const result = await model.generateContent(prompt);
  return result.response.text().trim();
};