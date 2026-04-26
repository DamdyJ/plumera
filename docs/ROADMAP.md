# Plumera V2 Roadmap

This roadmap tracks the full transition from the V1 chatbot architecture to the V2 Agentic Resume Editor.
Update checkboxes `[x]` as tasks are completed. Ask for user approval before adding new phases.

---

## Phase 0: Documentation & Architecture ✅
- [x] Write `AGENTS.md` with full directives and tech stack rules
- [x] Write `docs/ARCHITECTURE.md` with V2 pipeline and LangGraph state design
- [x] Write `docs/ROADMAP.md` (this file)
- [x] Write `docs/CONTEXT.md` as living project state document
- [x] Write `docs/TESTING.md` with TDD workflow, `bun test` runner, coverage targets
- [x] Decide on LLM strategy: MiniMax M2.5 (primary) + Gemini File API (PDF parsing) + Gemini Flash-Lite (fallback)
- [x] Decide on Rich Text Editor: Tiptap (ProseMirror-based)
- [x] Decide on runtime: Bun (not Node.js)
- [x] Decide on local database strategy: Supabase CLI (`supabase start`)
- [x] Business analysis & gap audit (multi-job, chatbot, re-analysis, task-based progress)
- [x] Write corrected ARCHITECTURE.md with multi-job support
- [x] Write design spec: `docs/superpowers/specs/2026-04-25-backend-foundation-design.md`

---

## Phase 1: Backend Foundation ✅

### 1A — V1 Cleanup
- [x] Remove Pinecone dependencies (`@pinecone-database/pinecone`, `@langchain/pinecone`) from `server/package.json`
- [x] Remove V1 LangChain packages (`langchain`, `@langchain/community`, `@langchain/google-genai`, `@langchain/textsplitters`)
- [x] Remove `pdf-parse` from `server/package.json`
- [x] Delete `server/src/lib/pinecone.client.ts`
- [x] Delete `server/src/lib/gemini.client.ts` (V1 embedding client)
- [x] Delete V1 module implementations under `server/src/modules/chat/`, `server/src/modules/message/`, `server/src/modules/document/`
- [x] Delete V1 schema: `server/src/db/schema/chat.ts`, `server/src/db/schema/message.ts`
- [x] Confirm empty V1 directories (`server/src/modules/analyze/`, `server/src/modules/annotation/`, `server/src/modules/job/`) are absent
- [x] Delete V1 types: `server/src/types/score.d.ts`
- [x] Migrate salvageable business logic from `document.service.ts`:
  - `savePdf()` → `modules/resume/resume.storage.ts`
  - `detectTask()` + `shouldUseContext()` → `modules/chat/chat.prompt.ts`
  - `validateResumeContent()` → `modules/chat/chat.prompt.ts`
  - `buildSeparatedContextPrompt()` + `buildSeparatedUserMessage()` → `modules/chat/chat.prompt.ts`
  - `formatResponseAsMarkdown()` → `modules/chat/chat.prompt.ts`

### 1B — New Dependencies
- [x] Add `@google/genai` (Gemini File API — native SDK)
- [x] Add `@langchain/langgraph` (LangGraph.js state machine)
- [x] Add `bullmq` + `ioredis` (background job queue)
- [x] Add `openai` (OpenRouter/MiniMax compatible client)
- [x] Add `zod` to server
- [x] Keep `@langchain/core` (required by LangGraph)

### 1C — LLM Provider Setup
- [x] Set up Gemini File API provider (`server/src/ai/providers/gemini-file.provider.ts`)
- [x] Set up OpenRouter/MiniMax provider (`server/src/ai/providers/openrouter.provider.ts`)
- [x] Set up Redis client (`server/src/lib/redis.client.ts`)
- [x] Set up BullMQ queue and worker factories (`server/src/queues/analysis.queue.ts`, `server/src/workers/analysis.worker.ts`)

### 1D — Database Schema (V2 — 7 Tables)
- [x] Write Drizzle schema: `db/schema/resume.ts`
- [x] Write Drizzle schema: `db/schema/target-job.ts`
- [x] Write Drizzle schema: `db/schema/analysis-run.ts`
- [x] Write Drizzle schema: `db/schema/suggestion.ts`
- [x] Write Drizzle schema: `db/schema/suggestion-job-relevance.ts`
- [x] Write Drizzle schema: `db/schema/chat-session.ts`
- [x] Write Drizzle schema: `db/schema/chat-message.ts`
- [x] Update `db/schema/index.ts` to export all new schemas
- [x] Generate clean V2 Drizzle migration (`drizzle/0000_phase_1_v2_schema.sql`)
- [x] Verify migration SQL in a rollback transaction against local Postgres
- [x] Attempt `bun run db:migrate`; local database has stale V1 migration history and must be reset before applying the clean V2 baseline migration

### 1E — API Module Stubs
- [x] Create Resume module route/controller stubs for CRUD endpoints
- [x] Create Analysis module stubs (route + controller shells)
- [x] Create Suggestion module stubs (route + controller shells)
- [x] Create Chat module stubs (route + controller shells)
- [x] Update `app.ts` with new route registrations
- [x] Write V2 type definitions (`types/analysis.d.ts`)

---

## Phase 2: AI Pipeline
- [ ] Define `ResumeAnalysisState` interface + Zod schema (`server/src/ai/state.ts`)
- [ ] Implement Structure Analysis Node — multi-job aware (`server/src/ai/nodes/structure.node.ts`)
- [ ] Implement Impact Analysis Node — multi-job aware (`server/src/ai/nodes/impact.node.ts`)
- [ ] Implement Grammar & Tone Node — multi-job aware (`server/src/ai/nodes/tone.node.ts`)
- [ ] Implement Scoring Node (`server/src/ai/nodes/scoring.node.ts`)
- [ ] Wire nodes into LangGraph state machine (`server/src/ai/graph.ts`)
- [ ] Write analysis prompts: structure, impact, tone (`server/src/ai/prompts/`)
- [ ] Implement BullMQ queue definition (`server/src/queues/analysis.queue.ts`)
- [ ] Implement BullMQ worker (`server/src/workers/analysis.worker.ts`)
- [ ] Implement analysis API endpoints: trigger, poll, get results
- [ ] Implement suggestion endpoints: list with filters, status update (accept/dismiss)
- [ ] Implement chatbot backend: contextual Q&A with resume + job context
- [ ] Write chatbot prompt system (`server/src/ai/prompts/chat.prompt.ts`)
- [ ] Migrate task detector logic (`server/src/ai/intent/task-detector.ts`)
- [ ] Add fallback logic: if MiniMax fails → retry with Gemini Flash-Lite
- [ ] Implement re-analysis flow: new run with incremented run_number
- [ ] Save LangGraph output to `suggestions` + `suggestion_job_relevance` tables

---

## Phase 3: Frontend Core
- [ ] Redesign Landing Page (cinematic dark hero + feature sections per `DESIGN.md`)
- [ ] Build Dashboard Page (resume cards with title, status, last viewed date)
- [ ] Build Onboarding Wizard:
  - Step 1: Upload PDF resume
  - Step 2: Add 1+ job targets (title + description) — supports multiple
  - Step 3: Review & trigger analysis
- [ ] Build Upload Dropzone component with Framer Motion drag feedback
- [ ] Redesign client routing (remove V1 `/chat` routes, add `/dashboard`, `/resume/:id/editor`, `/onboarding`)
- [ ] Create API hooks with TanStack Query:
  - `useResumes` — list resumes
  - `useResume` — single resume detail
  - `useAnalysisRun` — poll for analysis completion
  - `useSuggestions` — get suggestions with job filter
  - `useChatbot` — send/receive chat messages
- [ ] Add Framer Motion page transitions and micro-animations

---

## Phase 4: Editor Experience
- [ ] Install and configure Tiptap in `client/`
- [ ] Render extracted resume content in Tiptap editor
- [ ] Map `suggestions[].originalText` to Tiptap text ranges as custom Marks (highlights)
- [ ] Implement per-job highlight filtering (color-coded per target job)
- [ ] Build `SuggestionCard` component with Accept / Dismiss actions + job tags
- [ ] Animate suggestion card expand/collapse (Framer Motion, Apple-style easing)
- [ ] Build `ChatPanel` component — in-editor contextual chatbot
- [ ] Build task-based progress tracking (X/Y suggestions addressed, per-job breakdown)
- [ ] Build re-analysis trigger UI (button to submit for new analysis run)
- [ ] Persist accepted changes back to Supabase (update suggestion status)

---

## Phase 5: Security & Performance
- [ ] Validate file uploads: MIME type check (PDF only), max file size limit (5MB)
- [ ] Add rate limiting middleware to AI endpoints (prevent abuse)
- [ ] Implement exponential backoff with jitter for Gemini 429 errors
- [ ] Add Clerk auth middleware protection to all protected routes
- [ ] Optimize Tiptap rendering for large documents
- [ ] Add error boundaries on all major frontend pages
- [ ] Security audit: RLS policies, input sanitization, auth token validation
