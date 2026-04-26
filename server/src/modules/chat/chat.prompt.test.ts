import { describe, expect, it } from "bun:test";
import {
  buildSeparatedContextPrompt,
  buildSeparatedUserMessage,
  detectChatTask,
  formatResponseAsMarkdown,
  shouldUseResumeContext,
  validateResumeMarkdown,
} from "./chat.prompt";

describe("chat prompt utilities", () => {
  it("detects common resume coaching tasks", () => {
    expect(detectChatTask("Can you summarize my resume?")).toBe("SUMMARIZE");
    expect(detectChatTask("What skills are missing?")).toBe("GAP_ANALYSIS");
    expect(detectChatTask("Tailor this for the role")).toBe("TAILOR");
    expect(detectChatTask("What do you think?")).toBe("GENERAL_ADVICE");
  });

  it("skips resume context for greetings", () => {
    expect(shouldUseResumeContext("hello")).toBe(false);
    expect(shouldUseResumeContext("how should I improve this bullet?")).toBe(true);
  });

  it("validates resume-like markdown", () => {
    expect(validateResumeMarkdown("random text only")).toBe("unrelated");
    expect(validateResumeMarkdown("Experience Skills Education")).toBe("partial");
    expect(
      validateResumeMarkdown(
        "Experience Skills Education Work Company Project University Degree",
      ),
    ).toBe("valid");
  });

  it("keeps job, resume, and question in separate sections", () => {
    const message = buildSeparatedUserMessage({
      question: "Where are my gaps?",
      jobDescription: "Needs TypeScript",
      resumeMarkdown: "Built React apps",
    });

    expect(message).toContain("=== JOB DESCRIPTION ===");
    expect(message).toContain("=== CANDIDATE RESUME ===");
    expect(message).toContain("=== QUESTION ===");
  });

  it("formats dense markdown into readable blocks", () => {
    expect(formatResponseAsMarkdown("Intro\n- item\n### Next")).toBe(
      "Intro\n\n- item\n\n### Next",
    );
  });

  it("builds a context prompt for a target role", () => {
    const prompt = buildSeparatedContextPrompt({
      task: "JOB_FIT",
      jobTitle: "Frontend Engineer",
      resumeQuality: "valid",
    });

    expect(prompt).toContain("Plumera");
    expect(prompt).toContain("Frontend Engineer");
    expect(prompt).toContain("CONTEXT SEPARATION");
  });
});
