import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { CacheBackedEmbeddings } from "@langchain/classic/embeddings/cache_backed";
import { InMemoryStore } from "@langchain/core/stores";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

export const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "text-embedding-004",
  apiKey: process.env.GEMINI_API_KEY,
});

const inMemoryStore = new InMemoryStore();

export const cachedEmbeddings = CacheBackedEmbeddings.fromBytesStore(
  embeddings,
  inMemoryStore,
  {
    namespace: embeddings.model,
  },
);

export const gemini = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-lite",
  maxOutputTokens: 2048,
});
