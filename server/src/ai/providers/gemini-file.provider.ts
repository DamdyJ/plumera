import { GoogleGenAI } from "@google/genai";

export const getGeminiFileModel = (): string =>
  process.env.GEMINI_FILE_MODEL ?? "gemini-2.5-flash";

export const createGeminiFileClient = (): GoogleGenAI => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  return new GoogleGenAI({ apiKey });
};
