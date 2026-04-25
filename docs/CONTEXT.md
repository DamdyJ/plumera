# CONTEXT.md — Living Project State

> ⚠️ This file MUST be updated after every significant work session.
> It is the first file an agent should read to understand the *current* state of the project.
> Do NOT treat this as a static document — it becomes stale quickly.

---

## Current Status
**Date:** 2026-04-25
**Active Phase:** Phase 0 Complete → Starting Phase 1
**Overall Progress:** Architecture and documentation finalized. No V2 code written yet.

---

## What Was Just Completed
- Finalized the full V2 architecture and documented it in `docs/ARCHITECTURE.md`
- Rewrote `AGENTS.md` with corrected tech stack (Bun runtime, Tiptap, MiniMax, Gemini File API, Clerk)
- Created `docs/CONTEXT.md` as a living project state tracker
- Created `docs/TESTING.md` with TDD workflow, `bun test` as test runner, coverage targets
- Updated `docs/ROADMAP.md` with Phase 0 marked as complete and all future phases defined
- Decided on Supabase CLI (`supabase start`) for local PostgreSQL — identical to production

---

## What Is Next (Phase 1)
The immediate next tasks for the next agent session:
1. Remove Pinecone from `server/package.json` and delete `pinecone.client.ts`
2. Set up OpenRouter client for MiniMax M2.5
3. Set up Gemini File API client (for PDF parsing)
4. Install BullMQ (confirmed compatible with Bun runtime)
5. Set up Supabase CLI locally: `bunx supabase start`
6. Write Drizzle schema for `resumes`, `analysis_jobs`, `suggestions` tables and run migration

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

---

## Current Codebase State (V1 artifacts still present)
- `server/src/lib/pinecone.client.ts` — **MUST BE DELETED in Phase 1**
- `server/src/lib/gemini.client.ts` — **KEEP, will be updated for File API**
- `server/src/modules/` — contains V1 chat/analyze logic, will be refactored in Phase 2
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

## Agent Instructions for This File
- **After completing a phase:** Update "Current Status", "What Was Just Completed", and "What Is Next"
- **After a key decision:** Add it to the "Key Decisions Made" table
- **After fixing a major bug:** Add a note under "Known Issues" and mark it resolved
- **Before making changes:** Read this file FIRST to understand current state before touching code
