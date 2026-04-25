# CONTEXT.md — Living Project State

> ⚠️ This file MUST be updated after every significant work session.
> It is the first file an agent should read to understand the *current* state of the project.
> Do NOT treat this as a static document — it becomes stale quickly.

---

## Current Status
**Date:** 2026-04-25
**Active Phase:** Phase 0 Complete → Phase 1 Ready to Start
**Overall Progress:** Architecture corrected for multi-job support. Design spec written. No V2 code written yet.

---

## What Was Just Completed
- Finalized the full V2 architecture and documented it in `docs/ARCHITECTURE.md`
- Rewrote `AGENTS.md` with corrected tech stack (Bun runtime, Tiptap, MiniMax, Gemini File API, Clerk)
- Created `docs/CONTEXT.md` as a living project state tracker
- Created `docs/TESTING.md` with TDD workflow, `bun test` as test runner, coverage targets
- Updated `docs/ROADMAP.md` with Phase 0 marked as complete and all future phases defined
- Decided on Supabase CLI (`supabase start`) for local PostgreSQL — identical to production
- **Business analysis & gap audit** — identified 7 critical gaps between docs and product requirements
- **Corrected ARCHITECTURE.md** — added multi-job targeting, contextual chatbot, re-analysis flow, 8-table schema
- **Corrected ROADMAP.md** — restructured phases with sub-phases, added chatbot and multi-job tasks
- **Design spec written** — `docs/superpowers/specs/2026-04-25-backend-foundation-design.md`

---

## What Is Next (Phase 1)
The immediate next tasks for the next agent session:

### 1A — V1 Cleanup
1. Remove V1 packages from `server/package.json` (Pinecone, LangChain embeddings, pdf-parse, langchain)
2. Delete V1 files: `pinecone.client.ts`, `gemini.client.ts` (V1 version), empty dirs
3. Delete V1 modules: `chat/`, `message/`, `document/` — after migrating salvageable logic
4. Delete V1 schema files: `chat.ts`, `message.ts`, `score.d.ts`
5. Migrate valuable business logic from `document.service.ts` to V2 locations

### 1B — New Dependencies
6. Install: `@google/genai`, `@langchain/langgraph`, `bullmq`, `ioredis`, `openai`

### 1C — LLM Provider Setup
7. Create Gemini File API provider (`ai/providers/gemini.provider.ts`)
8. Create OpenRouter/MiniMax provider (`ai/providers/minimax.provider.ts`)
9. Create Redis client (`lib/redis.client.ts`)

### 1D — Database Schema
10. Write Drizzle schemas for 7 new tables (resume, target-job, analysis-run, suggestion, suggestion-job-relevance, chat-session, chat-message)
11. Run `bun run db:generate && bun run db:migrate`

### 1E — API Module Stubs
12. Create Resume module with full CRUD
13. Create Analysis, Suggestion, Chat module stubs
14. Update `app.ts` with new route registrations

---

## Key Decisions Made (Do Not Revisit Without User Approval)
| Decision | Chosen | Reason |
|---|---|---|
| Runtime | **Bun** (not Node.js) | Faster, native TypeScript, use `bun` CLI for all commands |
| Local Database | **Supabase CLI** (`supabase start`) | Local Postgres identical to production, zero migration risk |
| PDF Parsing | Gemini File API | Only free multimodal PDF reader, no local library |
| LLM Primary | MiniMax M2.5 (OpenRouter) | 200K context, free trial credits |
| LLM Fallback | Gemini 2.5 Flash-Lite | Free tier backup |
| Rich Text Editor | Tiptap | Best ecosystem for AI inline annotations |
| Background Jobs | BullMQ (works with Bun) | Prevent Bun thread blocking |
| Auth | Clerk (already installed) | Already in codebase |
| Test Runner | `bun test` | Built-in, Jest-compatible API |
| Vector DB | ❌ Removed (was Pinecone) | Not needed with large context LLMs |
| Schema Approach | **Normalized (8 tables)** | Multi-job targeting is core feature, needs clean relational model |
| Multi-Job | 1 resume → N target_jobs | User can apply to multiple positions from one resume |
| Suggestions | Task-based (pending/accepted/dismissed) | Not live score counter — re-analysis for final score |
| Chatbot | Contextual, in-editor | Knows resume + all target jobs + analysis results |
| Re-analysis | New `analysis_run` with incremented `run_number` | Preserves history, allows score comparison |

---

## Current Codebase State (V1 artifacts still present — to be cleaned in Phase 1)
- `server/src/lib/pinecone.client.ts` — **DELETE in Phase 1**
- `server/src/lib/gemini.client.ts` — **DELETE and REWRITE in Phase 1** (V1 uses LangChain embeddings)
- `server/src/modules/chat/` — **DELETE in Phase 1** (V1 chat CRUD)
- `server/src/modules/message/` — **DELETE in Phase 1** (V1 message CRUD with RAG)
- `server/src/modules/document/` — **MIGRATE then DELETE in Phase 1** (has valuable prompt engineering)
- `server/src/modules/analyze/` — **DELETE in Phase 1** (empty directory)
- `server/src/modules/annotation/` — **DELETE in Phase 1** (empty directory)
- `server/src/modules/job/` — **DELETE in Phase 1** (empty directory)
- `server/src/db/schema/chat.ts` — **DELETE in Phase 1** (V1 schema)
- `server/src/db/schema/message.ts` — **DELETE in Phase 1** (V1 schema)
- `server/src/types/score.d.ts` — **DELETE in Phase 1** (V1 types)
- `client/src/pages/chat/` — V1 chat UI, will be replaced in Phase 3
- `client/src/router.tsx` — only has chat routes, needs full redesign in Phase 3

---

## Environment Variables Required
```
# server/.env
GEMINI_API_KEY=           # Google AI Studio free key (for Gemini File API)
OPENROUTER_API_KEY=       # OpenRouter key (for MiniMax M2.5 access)
SUPABASE_URL=             # Use local URL during dev: http://localhost:54321
SUPABASE_SERVICE_KEY=     # Use local service key from `supabase start` output
CLERK_SECRET_KEY=
DATABASE_URL=             # Local: postgresql://postgres:postgres@localhost:54322/postgres
REDIS_URL=                # Local: redis://localhost:6379 | Prod: Upstash Redis free tier

# client/.env
VITE_API_BASE_URL=http://localhost:4000
VITE_SUPABASE_URL=        # Local: http://localhost:54321
VITE_SUPABASE_ANON_KEY=   # From `supabase start` output
VITE_CLERK_PUBLISHABLE_KEY=
```

---

## Known Issues / Blockers
- MiniMax M2.5 free credits via OpenRouter are **trial-based, not unlimited** — must implement fallback to Gemini Flash-Lite
- Gemini free tier: **10 RPM for Flash, 15 RPM for Flash-Lite** — must implement exponential backoff on 429 errors
- Redis is required for BullMQ — use **Upstash Redis** free tier (no self-hosting needed)

---

## Key Reference Documents
- **Design Spec:** `docs/superpowers/specs/2026-04-25-backend-foundation-design.md`
- **Architecture:** `docs/ARCHITECTURE.md`
- **Roadmap:** `docs/ROADMAP.md`
- **Testing:** `docs/TESTING.md`
- **Design System:** `DESIGN.md`

---

## Agent Instructions for This File
- **After completing a phase:** Update "Current Status", "What Was Just Completed", and "What Is Next"
- **After a key decision:** Add it to the "Key Decisions Made" table
- **After fixing a major bug:** Add a note under "Known Issues" and mark it resolved
- **Before making changes:** Read this file FIRST to understand current state before touching code
