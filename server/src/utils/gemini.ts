import { GoogleGenerativeAI } from "@google/generative-ai";

const getModel = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set in .env");
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: "gemini-3.6-flash" });
};

export const generateAlertText = async (
  phcName: string,
  countryName: string,
  medicineName: string,
  daysRemaining: number
): Promise<string> => {
  const model = getModel();
  const prompt = `Write a short, urgent one-sentence alert under 25 words for a hospital admin dashboard. ${medicineName} stock at ${phcName} in ${countryName} will run out in ${daysRemaining} days. Be direct and actionable.`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
};
export const generateRedistributionText = async (
  medicineName: string,
  fromPhc: string,
  fromCountry: string,
  toPhc: string,
  toCountry: string,
  amount: number
): Promise<string> => {
  const model = getModel();
  const prompt = `Write a short, actionable one-sentence recommendation (under 30 words) for a hospital admin dashboard. Suggest transferring ${amount} units of ${medicineName} from ${fromPhc} in ${fromCountry} to ${toPhc} in ${toCountry}, which is critically low. Be direct.`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
};