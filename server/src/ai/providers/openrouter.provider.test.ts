import { afterEach, describe, expect, it } from "bun:test";
import { createOpenRouterClient, getMiniMaxModel } from "./openrouter.provider";

const originalApiKey = process.env.OPENROUTER_API_KEY;
const originalModel = process.env.OPENROUTER_MODEL;

afterEach(() => {
  process.env.OPENROUTER_API_KEY = originalApiKey;
  process.env.OPENROUTER_MODEL = originalModel;
});

describe("openrouter provider", () => {
  it("uses MiniMax M2.5 as the default model", () => {
    delete process.env.OPENROUTER_MODEL;
    expect(getMiniMaxModel()).toBe("minimax/minimax-m2.5");
  });

  it("allows overriding the model from env", () => {
    process.env.OPENROUTER_MODEL = "custom/model";
    expect(getMiniMaxModel()).toBe("custom/model");
  });

  it("requires OPENROUTER_API_KEY", () => {
    delete process.env.OPENROUTER_API_KEY;
    expect(() => createOpenRouterClient()).toThrow(
      "OPENROUTER_API_KEY is not configured",
    );
  });
});
