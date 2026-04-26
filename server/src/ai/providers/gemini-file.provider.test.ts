import { afterEach, describe, expect, it } from "bun:test";
import { createGeminiFileClient, getGeminiFileModel } from "./gemini-file.provider";

const originalApiKey = process.env.GEMINI_API_KEY;
const originalModel = process.env.GEMINI_FILE_MODEL;

afterEach(() => {
  process.env.GEMINI_API_KEY = originalApiKey;
  process.env.GEMINI_FILE_MODEL = originalModel;
});

describe("gemini file provider", () => {
  it("uses Gemini Flash as the default file model", () => {
    delete process.env.GEMINI_FILE_MODEL;
    expect(getGeminiFileModel()).toBe("gemini-2.5-flash");
  });

  it("allows overriding the file model from env", () => {
    process.env.GEMINI_FILE_MODEL = "gemini-test-model";
    expect(getGeminiFileModel()).toBe("gemini-test-model");
  });

  it("requires GEMINI_API_KEY", () => {
    delete process.env.GEMINI_API_KEY;
    expect(() => createGeminiFileClient()).toThrow(
      "GEMINI_API_KEY is not configured",
    );
  });
});
