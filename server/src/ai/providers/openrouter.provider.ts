import OpenAI from "openai";

export const getMiniMaxModel = (): string =>
  process.env.OPENROUTER_MODEL ?? "minimax/minimax-m2.5";

export const createOpenRouterClient = (): OpenAI => {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  return new OpenAI({
    apiKey,
    baseURL: "https://openrouter.ai/api/v1",
  });
};
