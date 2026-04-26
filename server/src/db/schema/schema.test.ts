import { describe, expect, it } from "bun:test";
import { getTableName } from "drizzle-orm";
import {
  analysisRuns,
  chatMessages,
  chatSessions,
  resumes,
  suggestionJobRelevance,
  suggestions,
  targetJobs,
} from "./index";

describe("V2 Drizzle schema exports", () => {
  it("exports all seven V2 tables", () => {
    expect(resumes).toBeDefined();
    expect(targetJobs).toBeDefined();
    expect(analysisRuns).toBeDefined();
    expect(suggestions).toBeDefined();
    expect(suggestionJobRelevance).toBeDefined();
    expect(chatSessions).toBeDefined();
    expect(chatMessages).toBeDefined();
  });

  it("uses the expected table names", () => {
    expect(getTableName(resumes)).toBe("resumes");
    expect(getTableName(targetJobs)).toBe("target_jobs");
    expect(getTableName(analysisRuns)).toBe("analysis_runs");
    expect(getTableName(suggestions)).toBe("suggestions");
    expect(getTableName(suggestionJobRelevance)).toBe("suggestion_job_relevance");
    expect(getTableName(chatSessions)).toBe("chat_sessions");
    expect(getTableName(chatMessages)).toBe("chat_messages");
  });
});
