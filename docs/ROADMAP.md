# Plumera V2 Roadmap

This roadmap tracks the full transition from the V1 chatbot architecture to the V2 Agentic Resume Editor.
Update checkboxes `[x]` as tasks are completed. Ask for user approval before adding new phases.

---

## Phase 0: Documentation & Architecture (Current)
- [x] Write `AGENTS.md` with full directives and tech stack rules
- [x] Write `docs/ARCHITECTURE.md` with V2 pipeline and LangGraph state design
- [x] Write `docs/ROADMAP.md` (this file)
- [x] Write `docs/CONTEXT.md` as living project state document
- [x] Write `docs/TESTING.md` with TDD workflow, `bun test` runner, coverage targets
- [x] Decide on LLM strategy: MiniMax M2.5 (primary) + Gemini File API (PDF parsing) + Gemini Flash-Lite (fallback)
- [x] Decide on Rich Text Editor: Tiptap (ProseMirror-based)
- [x] Decide on runtime: Bun (not Node.js)
- [x] Decide on local database strategy: Supabase CLI (`supabase start`)

---

## Phase 1: Backend Cleanup & Foundation
- [ ] Remove Pinecone dependencies (`@pinecone-database/pinecone`, `@langchain/pinecone`) from `server/package.json`
- [ ] Remove `server/src/lib/pinecone.client.ts`
- [ ] Set up OpenRouter client for MiniMax M2.5 (`server/src/ai/providers/minimax.ts`)
- [ ] Set up Gemini File API client (`server/src/ai/providers/gemini.ts`)
- [ ] Install and configure BullMQ for background job processing
- [ ] Set up DB schema for V2: `resumes`, `analysis_jobs`, `suggestions` tables (Drizzle migration)
- [ ] Run `bun run db:generate && bun run db:migrate`

---

## Phase 2: LangGraph AI Pipeline
- [ ] Define `ResumeAnalysisState` TypeScript interface (`server/src/ai/graph.ts`)
- [ ] Implement Structure Analysis Node (`server/src/ai/nodes/structureNode.ts`)
- [ ] Implement Impact Analysis Node (`server/src/ai/nodes/impactNode.ts`)
- [ ] Implement Grammar & Tone Node (`server/src/ai/nodes/toneNode.ts`)
- [ ] Wire nodes into LangGraph state machine with proper edges
- [ ] Add fallback logic: if MiniMax fails → retry with Gemini Flash-Lite
- [ ] Implement BullMQ worker that triggers LangGraph (`server/src/workers/analysisWorker.ts`)
- [ ] Create API endpoint: `POST /api/resumes` (upload + enqueue job)
- [ ] Create API endpoint: `GET /api/jobs/:jobId` (poll job status)
- [ ] Save LangGraph output to `suggestions` table in Supabase

---

## Phase 3: Apple-Inspired Frontend Redesign
- [ ] Redesign Landing Page (cinematic dark hero + feature sections per `DESIGN.md`)
- [ ] Build Onboarding Wizard (Step 1: Upload → Step 2: Add Job Description → Step 3: View Analysis)
- [ ] Build Dashboard Page (resume cards with PDF thumbnail, title, last viewed date)
- [ ] Build Upload Dropzone component with Framer Motion drag feedback
- [ ] Standardize all client route names (kebab-case, RESTful)
- [ ] Add `useAnalysisJob` hook for polling job completion via TanStack Query
- [ ] Add Framer Motion page transitions and micro-animations throughout

---

## Phase 4: Tiptap Editor & Inline Suggestions
- [ ] Install and configure Tiptap in `client/`
- [ ] Render extracted resume content in Tiptap editor
- [ ] Map `suggestions[].originalText` to Tiptap text ranges as custom Marks (highlights)
- [ ] Build `SuggestionCard` component with Accept / Dismiss actions
- [ ] Animate suggestion card expand/collapse (Framer Motion, Apple-style easing)
- [ ] Persist accepted changes back to Supabase

---

## Phase 5: Security & Performance
- [ ] Validate file uploads: MIME type check (PDF only), max file size limit (5MB)
- [ ] Add rate limiting middleware to AI endpoints (prevent abuse)
- [ ] Implement exponential backoff with jitter for Gemini 429 errors
- [ ] Add Clerk auth middleware protection to all `/api/resumes` and `/api/jobs` routes
- [ ] Optimize Tiptap rendering for large documents
- [ ] Add error boundaries on all major frontend pages
