# CONTEXT.md — Living Project State

> ⚠️ This file MUST be updated after every significant work session.
> It is the first file an agent should read to understand the *current* state of the project.
> Do NOT treat this as a static document — it becomes stale quickly.

---

## Current Status
**Date:** 2026-04-26
**Active Phase:** Phase 1 Complete → Phase 2 Ready to Start
**Overall Progress:** Backend foundation has been rebuilt from rollback commit `db9b5eb`. Server tests, build, dev smoke test, and start smoke test pass. V2 schema migration is generated and transaction-verified; applying it locally requires a clean/reset Supabase database because the current local database still has stale V1 migration history.

---

## What Was Just Completed
- **Rollback foundation restored** — implementation work continued from commit `db9b5eb` on branch `rollback/db9b5eb-20260426-183929`
- **Phase 1A V1 cleanup** — removed Pinecone/RAG dependencies, V1 clients, V1 modules, V1 schemas, V1 score types, and stale generated `dist/`
- **Salvaged useful V1 behavior** — moved resume PDF storage into `modules/resume/resume.storage.ts` and prompt/task utilities into `modules/chat/chat.prompt.ts`
- **Phase 1B dependencies** — added `@google/genai`, `@langchain/langgraph`, `bullmq`, `ioredis`, `openai`, and `zod`; retained `@langchain/core`
- **Runtime scripts corrected** — server scripts now use Bun for `dev`, `test`, `build`, and `start`; root workspace scripts now call Bun instead of npm
- **Phase 1C providers/queues** — added Gemini File API provider, OpenRouter/MiniMax provider, Redis client, BullMQ queue factory, and worker factory without import-time network connections
- **Phase 1D schema** — replaced V1 schema with 7 V2 Drizzle tables: `resumes`, `target_jobs`, `analysis_runs`, `suggestions`, `suggestion_job_relevance`, `chat_sessions`, `chat_messages`
- **V2 migration generated** — `server/drizzle/0000_phase_1_v2_schema.sql` creates enums, tables, foreign keys, indexes, check constraints, and RLS enablement
- **Phase 1E API stubs** — mounted Resume, Analysis, Suggestion, and Chat route/controller shells under `/api/resumes` and `/api/suggestions`
- **Verification passed** — `bun test`, `bun run build`, `bun run dev` + `/health`, and `bun run start` + `/health`

---

## What Is Next (Phase 2)
The immediate next tasks for the next agent session:

### 2A — Analysis State & Prompts
1. Define `ResumeAnalysisState` and Zod validation for LangGraph state
2. Add prompt modules for structure, impact, grammar/tone, scoring, and contextual chat
3. Move chat task detection from `modules/chat/chat.prompt.ts` to the final AI prompt/intent location if needed

### 2B — LangGraph Pipeline
4. Implement Structure, Impact, Grammar/Tone, and Scoring nodes with multi-job awareness
5. Wire nodes into `server/src/ai/graph.ts`
6. Add MiniMax primary + Gemini Flash-Lite fallback with retry/backoff for quota failures

### 2C — Queue & API Execution
7. Connect analysis API endpoints to `analysis_runs` creation and BullMQ enqueueing
8. Implement the analysis worker to execute LangGraph and persist suggestions
9. Implement suggestion status updates and contextual chat responses

### 2D — Local Database Reset Before Migration
10. Reset or recreate the local Supabase database before applying `server/drizzle/0000_phase_1_v2_schema.sql`, because the current local database still has V1 migration rows and leftover tables from previous branches

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
| Schema Approach | **Normalized (7 V2 tables)** | Multi-job targeting is core feature, needs clean relational model; Phase 1 corrected the earlier docs mismatch that said 8 tables while enumerating 7 |
| Multi-Job | 1 resume → N target_jobs | User can apply to multiple positions from one resume |
| Suggestions | Task-based (pending/accepted/dismissed) | Not live score counter — re-analysis for final score |
| Chatbot | Contextual, in-editor | Knows resume + all target jobs + analysis results |
| Re-analysis | New `analysis_run` with incremented `run_number` | Preserves history, allows score comparison |

---

## Current Codebase State
- `server/src/lib/pinecone.client.ts` and V1 `server/src/lib/gemini.client.ts` are removed
- V1 `server/src/modules/message/` and `server/src/modules/document/` are removed
- `server/src/modules/chat/` now contains V2 prompt utilities and chat route/controller stubs
- `server/src/modules/resume/` contains resume PDF storage utility and route/controller stubs
- `server/src/modules/analysis/` contains Phase 1 analysis route/controller stubs
- `server/src/modules/suggestion/` contains Phase 1 suggestion route/controller stubs
- `server/src/db/schema/` contains only V2 schema exports and table files
- `server/drizzle/0000_phase_1_v2_schema.sql` is the clean V2 baseline migration
- `server/src/types/analysis.d.ts` defines V2 analysis/suggestion shared types
- `client/src/pages/chat/` remains V1 UI and will be replaced in Phase 3
- `client/src/router.tsx` still only has chat routes and needs full redesign in Phase 3

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
- Local database migration history is stale from V1/previous branches. `bun run db:migrate` was attempted and reached Postgres, but a clean local Supabase reset or recreated database is required before applying the new V2 baseline migration. The migration SQL itself was verified inside a rollback transaction.

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
