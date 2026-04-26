# Phase 1 Backend Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild Plumera V2 Phase 1 backend foundation from commit `db9b5eb` one checkpoint at a time, with tests and server verification before moving to the next phase.

**Architecture:** Remove V1 RAG/Pinecone chat code, replace it with V2-focused modules for resumes, target jobs, analyses, suggestions, and contextual chat. Keep Phase 1 intentionally shallow: database schemas, API contracts, provider clients, and route/controller/service shells that compile and are testable without running external LLM calls.

**Tech Stack:** Bun, Express 5, TypeScript, Drizzle ORM, Supabase, Clerk, BullMQ, ioredis, OpenRouter via `openai`, Gemini File API via `@google/genai`, `bun test`.

**Execution Constraint:** Do not create git commits unless the user explicitly asks. Each task still has a checkpoint verification step.

---

## Phase Gate

Phase 1 is complete only when all commands pass from `server/`:

```bash
bun test
bun run build
bun run dev
bun run start
```

`bun run dev` and `bun run start` must be smoke-tested by starting the server, confirming `/health` returns a healthy response, then stopping the process.

---

## File Structure

- Delete: `server/src/lib/pinecone.client.ts` because V2 must not use Pinecone.
- Delete: `server/src/lib/gemini.client.ts` because the LangChain Gemini chat/embedding client is V1-only.
- Delete: `server/src/modules/document/*` after salvaging storage and prompt utility logic.
- Delete: `server/src/modules/chat/*` V1 files and recreate V2 chat files.
- Delete: `server/src/modules/message/*` because V2 uses `chat_messages` under the chat module.
- Delete: `server/src/db/schema/chat.ts` and `server/src/db/schema/message.ts` because V2 schemas replace them.
- Delete: `server/src/types/score.d.ts` because V2 analysis types live in `server/src/types/analysis.d.ts`.
- Create: `server/src/modules/resume/resume.storage.ts` for Supabase PDF upload helper.
- Create: `server/src/modules/resume/resume.service.ts` for resume CRUD and target-job helpers.
- Create: `server/src/modules/resume/resume.controller.ts` for V2 resume handlers.
- Create: `server/src/modules/resume/resume.route.ts` for `/api/resumes` routes.
- Create: `server/src/modules/resume/resume.dto.ts` for Zod DTOs.
- Create: `server/src/modules/resume/resume.storage.test.ts` for storage helper behavior.
- Create: `server/src/modules/chat/chat.prompt.ts` for salvaged context-separation prompt helpers.
- Create: `server/src/modules/chat/chat.prompt.test.ts` for prompt utility behavior.
- Create: `server/src/modules/chat/chat.service.ts` for contextual chat session/message service stubs.
- Create: `server/src/modules/chat/chat.controller.ts` for chat handlers.
- Create: `server/src/modules/chat/chat.route.ts` for `/api/resumes/:resumeId/chat` routes.
- Create: `server/src/modules/analysis/analysis.service.ts` for analysis-run enqueue stub.
- Create: `server/src/modules/analysis/analysis.controller.ts` for analysis handlers.
- Create: `server/src/modules/analysis/analysis.route.ts` for `/api/resumes/:resumeId/analyze` and `/api/resumes/:resumeId/analyses` routes.
- Create: `server/src/modules/suggestion/suggestion.service.ts` for suggestion status update stubs.
- Create: `server/src/modules/suggestion/suggestion.controller.ts` for suggestion handlers.
- Create: `server/src/modules/suggestion/suggestion.route.ts` for `/api/suggestions/:id` routes.
- Create: `server/src/ai/providers/gemini-file.provider.ts` for Gemini File API extraction client.
- Create: `server/src/ai/providers/openrouter.provider.ts` for MiniMax/OpenRouter text generation client.
- Create: `server/src/lib/redis.client.ts` for BullMQ/ioredis connection creation.
- Create: `server/src/queues/analysis.queue.ts` for analysis queue construction.
- Create: `server/src/workers/analysis.worker.ts` as a Phase 1 placeholder worker export, not auto-started.
- Create: `server/src/db/schema/resume.ts`.
- Create: `server/src/db/schema/target-job.ts`.
- Create: `server/src/db/schema/analysis-run.ts`.
- Create: `server/src/db/schema/suggestion.ts`.
- Create: `server/src/db/schema/suggestion-job-relevance.ts`.
- Create: `server/src/db/schema/chat-session.ts`.
- Create: `server/src/db/schema/chat-message.ts`.
- Modify: `server/src/db/schema/index.ts` to export V2 schemas.
- Modify: `server/src/app.ts` to mount V2 routes and remove V1 routes.
- Modify: `server/src/index.ts` to use a Bun-friendly `PORT` default.
- Modify: `server/package.json` to use Bun scripts and Phase 1 dependencies.
- Modify: root `package.json` to call Bun instead of npm for workspace scripts.
- Modify: `docs/ROADMAP.md` after each completed Phase 1 section.
- Modify: `docs/CONTEXT.md` after Phase 1 verification.

---

## Task 1: Baseline Test Harness

**Files:**
- Modify: `server/package.json`
- Create: `server/src/modules/chat/chat.prompt.test.ts`
- Create: `server/src/modules/resume/resume.storage.test.ts`

- [ ] **Step 1: Add Bun test script**

Update `server/package.json` scripts so tests can run consistently:

```json
{
  "scripts": {
    "dev": "bun --watch src/index.ts",
    "build": "tsc -p tsconfig.json",
    "start": "bun dist/src/index.js",
    "test": "bun test",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "lint": "eslint \"{src,apps,libs}/**/*.ts\" --fix",
    "format": "prettier --write \"src/**/*.ts\" "
  }
}
```

- [ ] **Step 2: Write failing prompt utility tests**

Create `server/src/modules/chat/chat.prompt.test.ts`:

```ts
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
    expect(detectChatTask("Can you summarize my resume?")) .toBe("SUMMARIZE");
    expect(detectChatTask("What skills are missing?")) .toBe("GAP_ANALYSIS");
    expect(detectChatTask("Tailor this for the role")) .toBe("TAILOR");
    expect(detectChatTask("What do you think?")) .toBe("GENERAL_ADVICE");
  });

  it("skips resume context for greetings", () => {
    expect(shouldUseResumeContext("hello")) .toBe(false);
    expect(shouldUseResumeContext("how should I improve this bullet?")) .toBe(true);
  });

  it("validates resume-like markdown", () => {
    expect(validateResumeMarkdown("random text only")) .toBe("unrelated");
    expect(validateResumeMarkdown("Experience Skills Education")) .toBe("partial");
    expect(
      validateResumeMarkdown("Experience Skills Education Work Company Project University Degree"),
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
    expect(formatResponseAsMarkdown("Intro\n- item\n### Next")) .toBe("Intro\n\n- item\n\n### Next");
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
```

- [ ] **Step 3: Run tests and confirm the expected failure**

Run from `server/`:

```bash
bun test src/modules/chat/chat.prompt.test.ts
```

Expected: FAIL because `server/src/modules/chat/chat.prompt.ts` does not exist yet.

---

## Task 2: V1 Cleanup And Salvaged Utilities

**Files:**
- Create: `server/src/modules/chat/chat.prompt.ts`
- Create: `server/src/modules/resume/resume.storage.ts`
- Delete: V1 modules and clients listed in File Structure

- [ ] **Step 1: Implement salvaged prompt helpers without LangChain**

Create `server/src/modules/chat/chat.prompt.ts` with exported pure functions:

```ts
export type ChatTask =
  | "SUMMARIZE"
  | "IMPROVE"
  | "JOB_FIT"
  | "GAP_ANALYSIS"
  | "TAILOR"
  | "GENERAL_ADVICE";

export type ResumeQuality = "unrelated" | "valid" | "partial";

export interface BuildContextPromptInput {
  task: ChatTask;
  jobTitle: string;
  resumeQuality: ResumeQuality;
}

export interface BuildUserMessageInput {
  question: string;
  jobDescription: string;
  resumeMarkdown?: string;
}

export const detectChatTask = (question: string): ChatTask => {
  const lower = question.toLowerCase();
  if (lower.includes("summarize") || lower.includes("summary")) return "SUMMARIZE";
  if (lower.includes("improve") || lower.includes("enhance") || lower.includes("better")) return "IMPROVE";
  if (lower.includes("match") || lower.includes("fit") || lower.includes("chance")) return "JOB_FIT";
  if (lower.includes("gap") || lower.includes("missing") || lower.includes("lack")) return "GAP_ANALYSIS";
  if (lower.includes("tailor") || lower.includes("customize") || lower.includes("rewrite")) return "TAILOR";
  return "GENERAL_ADVICE";
};

export const shouldUseResumeContext = (question: string): boolean => {
  const lower = question.toLowerCase().trim();
  const noContextQuestions = ["hello", "hi", "hey", "how are you", "who are you", "what can you do", "introduce yourself"];
  return !noContextQuestions.some((value) => lower.includes(value));
};

export const validateResumeMarkdown = (markdown: string): ResumeQuality => {
  const lower = markdown.toLowerCase();
  const keywords = ["experience", "skills", "education", "employment", "work", "qualifications", "degree", "university", "company", "project"];
  const matches = keywords.filter((keyword) => lower.includes(keyword)).length;
  if (matches < 3) return "unrelated";
  if (matches < 6) return "partial";
  return "valid";
};

export const buildSeparatedContextPrompt = ({ task, jobTitle, resumeQuality }: BuildContextPromptInput): string => {
  const baseRole = `You are Plumera, an expert resume coach and recruiter.

**YOUR ROLE:**
- Analyze resumes for a specific job target
- Compare candidate skills to job requirements
- Provide actionable improvement advice

**CRITICAL INSTRUCTION - CONTEXT SEPARATION:**
The user will provide job description, candidate resume, and question as separate labeled sections.
Do not blend employer requirements with candidate experience.`;

  if (resumeQuality === "unrelated") return `${baseRole}\n\nThe uploaded file is not a resume. Ask for a valid resume/CV file.`;
  if (resumeQuality === "partial") return `${baseRole}\n\nThe resume appears incomplete. Work with what is available.`;

  const taskInstructions: Record<ChatTask, string> = {
    SUMMARIZE: `Summarize the candidate background for the "${jobTitle}" role without inventing facts.`,
    IMPROVE: "Suggest specific resume improvements with before/after examples.",
    JOB_FIT: `Assess candidate fit for the "${jobTitle}" role by separating job needs from resume evidence.`,
    GAP_ANALYSIS: "Identify missing skills and explain how important each gap is.",
    TAILOR: "Suggest accurate wording that better matches the job description.",
    GENERAL_ADVICE: "Answer the user's question with concrete resume and job evidence.",
  };

  return `${baseRole}\n\n${taskInstructions[task]}`;
};

export const buildSeparatedUserMessage = ({ question, jobDescription, resumeMarkdown }: BuildUserMessageInput): string => {
  const resumeSection = resumeMarkdown ? `\n\n=== CANDIDATE RESUME ===\n${resumeMarkdown}` : "";
  return `=== JOB DESCRIPTION ===\n${jobDescription}${resumeSection}\n\n=== QUESTION ===\n${question}`;
};

export const formatResponseAsMarkdown = (response: string): string => {
  let formatted = response.replace(/([^\n])\n- /g, "$1\n\n- ");
  formatted = formatted.replace(/([^\n])\n## /g, "$1\n\n## ");
  formatted = formatted.replace(/([^\n])\n### /g, "$1\n\n### ");
  return formatted.replace(/\n{3,}/g, "\n\n");
};
```

- [ ] **Step 2: Implement storage helper with injected Supabase client**

Create `server/src/modules/resume/resume.storage.ts`:

```ts
import { supabase } from "../../lib/supabase.client";
import { HttpError } from "../../utils/http-error.util";
import { sanitizeFilename } from "../../utils/sanitize-filename.util";

interface SupabaseStorageClient {
  storage: {
    from(bucket: string): {
      upload(path: string, body: Buffer, options: { contentType: string; upsert: boolean }): Promise<{
        data: { path?: string; fullPath?: string } | null;
        error: { message?: string } | null;
      }>;
    };
  };
}

export interface StoredResumeFile {
  path: string;
  fullPath: string;
}

export const saveResumePdf = async (
  file: Express.Multer.File,
  client: SupabaseStorageClient = supabase,
): Promise<StoredResumeFile> => {
  const bucket = process.env.BUCKET_NAME;
  if (!bucket) throw new HttpError(500, "BUCKET_NAME is not configured");

  const safeFilename = sanitizeFilename(file.originalname);
  const filePath = `resumes/${crypto.randomUUID()}-${safeFilename}`;

  const { data, error } = await client.storage.from(bucket).upload(filePath, file.buffer, {
    contentType: file.mimetype,
    upsert: false,
  });

  if (error) throw new HttpError(500, `Supabase upload failed: ${error.message ?? "unknown error"}`);
  if (!data) throw new HttpError(500, "Supabase returned no upload data");

  return { path: data.path ?? filePath, fullPath: data.fullPath ?? filePath };
};
```

- [ ] **Step 3: Delete V1 RAG files**

Delete V1-only files and directories:

```text
server/src/lib/pinecone.client.ts
server/src/lib/gemini.client.ts
server/src/modules/document/document.service.ts
server/src/modules/document/document.dto.ts
server/src/modules/message/message.service.ts
server/src/modules/message/message.route.ts
server/src/modules/message/message.dto.ts
server/src/modules/message/message.controller.ts
server/src/types/score.d.ts
```

- [ ] **Step 4: Run focused tests**

Run from `server/`:

```bash
bun test src/modules/chat/chat.prompt.test.ts
```

Expected: PASS.

---

## Task 3: Dependencies And Runtime Scripts

**Files:**
- Modify: `server/package.json`
- Modify: `server/bun.lock`
- Modify: root `package.json`
- Modify: root `bun.lock`

- [ ] **Step 1: Remove V1 dependencies**

Run from `server/`:

```bash
bun remove @pinecone-database/pinecone @langchain/pinecone langchain @langchain/community @langchain/google-genai @langchain/textsplitters pdf-parse
```

Expected: package manifest no longer contains V1 RAG/vector/PDF parsing packages.

- [ ] **Step 2: Add V2 dependencies**

Run from `server/`:

```bash
bun add @google/genai @langchain/langgraph bullmq ioredis openai zod
```

Expected: package manifest includes V2 provider, queue, Redis, OpenRouter, and Zod dependencies.

- [ ] **Step 3: Update root scripts to Bun**

Root `package.json` scripts should call Bun:

```json
{
  "scripts": {
    "dev": "concurrently \"bun run server:dev\" \"bun run client:dev\"",
    "server:dev": "bun run --cwd server dev",
    "client:dev": "bun run --cwd client dev",
    "server:build": "bun run --cwd server build",
    "client:build": "bun run --cwd client build"
  }
}
```

- [ ] **Step 4: Verify dependency cleanup**

Run from `server/`:

```bash
bun test
bun run build
```

Expected: tests and TypeScript build pass without deleted V1 imports.

---

## Task 4: Provider And Queue Foundation

**Files:**
- Create: `server/src/ai/providers/gemini-file.provider.ts`
- Create: `server/src/ai/providers/openrouter.provider.ts`
- Create: `server/src/ai/providers/openrouter.provider.test.ts`
- Create: `server/src/lib/redis.client.ts`
- Create: `server/src/lib/redis.client.test.ts`
- Create: `server/src/queues/analysis.queue.ts`
- Create: `server/src/workers/analysis.worker.ts`

- [ ] **Step 1: Write provider tests first**

Create tests that verify missing env handling and injectable clients:

```ts
import { describe, expect, it } from "bun:test";
import { createOpenRouterClient, getMiniMaxModel } from "./openrouter.provider";

describe("openrouter provider", () => {
  it("uses MiniMax as the default model", () => {
    expect(getMiniMaxModel()).toBe("minimax/minimax-m2.5");
  });

  it("requires OPENROUTER_API_KEY", () => {
    const previous = process.env.OPENROUTER_API_KEY;
    delete process.env.OPENROUTER_API_KEY;
    expect(() => createOpenRouterClient()).toThrow("OPENROUTER_API_KEY is not configured");
    process.env.OPENROUTER_API_KEY = previous;
  });
});
```

- [ ] **Step 2: Implement OpenRouter provider**

Create `server/src/ai/providers/openrouter.provider.ts`:

```ts
import OpenAI from "openai";

export const getMiniMaxModel = (): string => process.env.OPENROUTER_MODEL ?? "minimax/minimax-m2.5";

export const createOpenRouterClient = (): OpenAI => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is not configured");
  return new OpenAI({ apiKey, baseURL: "https://openrouter.ai/api/v1" });
};
```

- [ ] **Step 3: Implement Gemini File provider**

Create `server/src/ai/providers/gemini-file.provider.ts`:

```ts
import { GoogleGenAI } from "@google/genai";

export const createGeminiFileClient = (): GoogleGenAI => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");
  return new GoogleGenAI({ apiKey });
};
```

- [ ] **Step 4: Implement Redis and queue construction**

Create `server/src/lib/redis.client.ts` and `server/src/queues/analysis.queue.ts` with lazy factory functions so importing the app does not require Redis:

```ts
import IORedis from "ioredis";

export const createRedisConnection = (): IORedis => {
  const url = process.env.REDIS_URL;
  if (!url) throw new Error("REDIS_URL is not configured");
  return new IORedis(url, { maxRetriesPerRequest: null });
};
```

```ts
import { Queue } from "bullmq";
import { createRedisConnection } from "../lib/redis.client";

export const ANALYSIS_QUEUE_NAME = "analysis";

export const createAnalysisQueue = (): Queue => {
  return new Queue(ANALYSIS_QUEUE_NAME, { connection: createRedisConnection() });
};
```

- [ ] **Step 5: Verify provider foundation**

Run from `server/`:

```bash
bun test
bun run build
```

Expected: PASS.

---

## Task 5: Drizzle V2 Schema

**Files:**
- Create all V2 schema files listed in File Structure
- Modify: `server/src/db/schema/index.ts`
- Delete: `server/src/db/schema/chat.ts`
- Delete: `server/src/db/schema/message.ts`

- [ ] **Step 1: Write schema shape test**

Create `server/src/db/schema/schema.test.ts`:

```ts
import { describe, expect, it } from "bun:test";
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
});
```

- [ ] **Step 2: Implement schema files**

Use Drizzle `pgTable`, `uuid`, `text`, `timestamp`, `integer`, `boolean`, `jsonb`, and `pgEnum`. All primary ids use `defaultRandom()`. User ownership is stored as Clerk user id text. Timestamps use `defaultNow()`.

- [ ] **Step 3: Generate migration**

Run from `server/` after schema compiles:

```bash
bun run db:generate
```

Expected: a new SQL migration under `server/drizzle/` for V2 tables.

- [ ] **Step 4: Verify schema**

Run from `server/`:

```bash
bun test src/db/schema/schema.test.ts
bun run build
```

Expected: PASS.

---

## Task 6: V2 API Module Stubs

**Files:**
- Create/modify resume, analysis, suggestion, and chat modules listed in File Structure
- Modify: `server/src/app.ts`
- Modify: `server/src/types/analysis.d.ts`

- [ ] **Step 1: Write route smoke tests**

Create `server/src/app.test.ts`:

```ts
import { describe, expect, it } from "bun:test";
import app from "./app";

describe("app routes", () => {
  it("serves health", async () => {
    const response = await app.request("/health");
    expect(response.status).toBe(200);
  });
});
```

If Express request helper is unavailable, replace this with a focused controller/service test instead of adding a new HTTP framework.

- [ ] **Step 2: Implement DTOs and controllers with typed stubs**

Controllers should return `501 Not Implemented` only for Phase 2 behavior, while Phase 1 CRUD/service functions compile and validate inputs. Do not call Gemini, OpenRouter, or Redis during route import.

- [ ] **Step 3: Mount routes**

`server/src/app.ts` should mount:

```ts
app.use("/api/resumes", ResumeRouter);
app.use("/api/resumes", AnalysisRouter);
app.use("/api/resumes", ChatRouter);
app.use("/api/suggestions", SuggestionRouter);
```

- [ ] **Step 4: Verify API foundation**

Run from `server/`:

```bash
bun test
bun run build
```

Expected: PASS.

---

## Task 7: Documentation And Final Verification

**Files:**
- Modify: `docs/ROADMAP.md`
- Modify: `docs/CONTEXT.md`

- [ ] **Step 1: Update roadmap**

Mark Phase 1A-1E items complete only after their implementation and verification have passed.

- [ ] **Step 2: Update context**

Update `docs/CONTEXT.md` with:

```text
Active Phase: Phase 1 Complete -> Phase 2 Ready to Start
Current branch: rollback/db9b5eb-20260426-183929
Completed: V1 cleanup, V2 dependencies, provider clients, Redis/queue foundation, Drizzle schema, API module stubs.
Verification: bun test, bun run build, bun run dev smoke test, bun run start smoke test.
Next: Phase 2 AI analysis pipeline with LangGraph nodes and BullMQ worker execution.
```

- [ ] **Step 3: Final command verification**

Run from `server/`:

```bash
bun test
bun run build
bun run dev
bun run start
```

Expected: tests and build pass; both dev and start servers boot and `/health` returns status `ok`.

- [ ] **Step 4: Report completion**

Final response must include:

```text
Branch:
Files changed:
Tests:
Build:
Dev smoke test:
Start smoke test:
Docs updated:
Known gaps or next phase:
```

---

## Self-Review

- Spec coverage: Phase 1A cleanup, Phase 1B dependencies, Phase 1C providers/Redis, Phase 1D schema, Phase 1E API stubs, docs updates, and verification are represented.
- Scope check: This plan intentionally excludes Phase 2 LangGraph node implementation and actual LLM/BullMQ processing.
- Type consistency: Table names use plural Drizzle exports; API modules use singular folder names; V2 chat uses `chatSessions` and `chatMessages`, not V1 `chat` and `message`.
- Ambiguity resolved: The docs say “8 tables” in places, but enumerate seven V2 tables. Phase 1 implements the seven enumerated V2 tables and should later correct documentation wording if the user approves editing `docs/ARCHITECTURE.md`.
