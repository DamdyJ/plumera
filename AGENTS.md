# AGENTS.md

## 1. Identity & Core Vision
You are an AI Agent working on **Plumera V2**, an AI-powered SaaS Resume Advisor.
**Core Vision:** Plumera is the "Grammarly for Resumes". It is not just a chatbot. It extracts resumes, evaluates them using an agentic AI workflow (LangGraph), and provides a rich-text editing experience where users receive inline suggestions, tone adjustments, and grammar corrections directly on their document.

## 0. Before You Start (Read First)
- **Check Skills:** Before starting ANY task, look in `.agents/skills/` for a relevant skill file (e.g., `brainstorming`, `systematic-debugging`, `test-driven-development`). Read and follow the skill's `SKILL.md` if it applies to your current task.
- **Read Context:** Always read `docs/CONTEXT.md` first to understand the current project state before writing any code.

## 2. Global Directives (Read Carefully Before Coding)
- **Strict Adherence:** Always prioritize the rules in this file.
- **Design System First:** Always refer to `DESIGN.md`. UI must be Apple-inspired (pure neutrals, `#0071e3` blue accents, minimal depth, specific border radii). DO NOT use generic Tailwind color classes (e.g. `blue-500`, `slate-800`) — always use hex values from `DESIGN.md`.
- **Micro-animations:** Always use GSAP or Framer Motion for interactions. Animations must be Apple-esque: subtle, fluid, purposeful. No bouncy, flashy, or exaggerated effects.
- **TypeScript Strictness:** DO NOT use `any`. Define all interfaces and types explicitly. Prefer Drizzle schema types or Zod-inferred types over manual definitions.
- **Test-Driven Development (TDD):** Write tests BEFORE writing implementation code. Use `bun test` as the test runner. Read `docs/TESTING.md` for full testing strategy and requirements.
- **Systematic Debugging:** If you encounter an error, read the logs first. Do not guess. Check database constraints and types before proposing a fix. Use the `systematic-debugging` skill if available.
- **Asynchronous First:** Do not block the Bun main thread. Any heavy AI or PDF processing MUST be handled in a background job queue (BullMQ).
- **No Pinecone, No RAG Chunking:** The V1 approach of chunking + embedding + vector search is deprecated. DO NOT reintroduce it.

## 3. Tech Stack (Strict — Do Not Deviate)

### Frontend (`client/`)
- **Framework:** Vite + React 19 + TypeScript
- **Styling:** TailwindCSS v4 — use hex values from `DESIGN.md`, not Tailwind color aliases
- **Components:** Shadcn/UI + Radix UI
- **Rich Text Editor:** Tiptap (ProseMirror-based) — for inline AI annotation and suggestion highlighting
- **Animations:** Framer Motion or GSAP — Apple-style micro-animations only
- **State & Routing:** React Router 7 + TanStack Query v5
- **Auth (Client):** Clerk React (`@clerk/clerk-react`)
- **Testing:** `bun test` (Vitest-compatible API)

### Backend (`server/`)
- **Runtime:** Bun (replaces Node.js — use `bun` CLI for all commands, not `node` or `npx`)
- **Framework:** Express 5 + TypeScript
- **Auth (Server):** Clerk Express (`@clerk/express`)
- **Database:** Supabase (PostgreSQL) via `@supabase/supabase-js` + Drizzle ORM. **Local dev:** use `supabase start` (Supabase CLI) for a local Postgres instance identical to production.
- **AI Orchestration:** LangGraph.js — Node-based agentic state machine. DO NOT use standard LangChain linear chains.
- **PDF Parsing:** Gemini File API (`@google/genai`) — upload PDF directly, no local parsing library needed
- **Background Jobs:** BullMQ + Redis (Upstash free tier for production) — confirmed working with Bun runtime
- **LLM Primary:** MiniMax M2.5 via OpenRouter (`OPENROUTER_API_KEY`) — for LangGraph analysis nodes
- **LLM Fallback:** Gemini 2.5 Flash-Lite (free tier, `GEMINI_API_KEY`) — if MiniMax quota is exhausted
- **Testing:** `bun test`

### LLM Provider Strategy (100% Free Tier)
| Task | Provider | Reason |
|---|---|---|
| PDF Parsing & Extraction | Gemini File API (Flash) | Only multimodal option that reads PDF natively |
| Structure / Grammar / Tone Analysis | MiniMax M2.5 (OpenRouter) | 200K context, free trial credits, strong text analysis |
| Fallback (if MiniMax unavailable) | Gemini 2.5 Flash-Lite | Free tier (15 RPM / 1,000 RPD) |

> ⚠️ MiniMax "free" = trial credits via OpenRouter, not unlimited. Implement graceful fallback logic.

## 4. Architecture Overview
For full technical detail, read `docs/ARCHITECTURE.md`.

**Pipeline Summary:**
1. User uploads PDF → stored in Supabase Storage
2. Backend calls Gemini File API to extract document content
3. Extracted content + Job Description pushed to BullMQ background job
4. LangGraph state machine runs 3 nodes in sequence (Structure → Impact → Grammar/Tone)
5. All nodes call MiniMax M2.5 via OpenRouter
6. Structured JSON output saved to Supabase (`suggestions` table)
7. Frontend polls for job completion → Tiptap editor renders inline highlights

## 5. Authentication
- Auth provider: **Clerk** (already installed in both `client/` and `server/`)
- Client: wrap protected routes with `<Protect fallback={<RedirectToSignIn />}>` from `@clerk/clerk-react`
- Server: use `clerkMiddleware()` from `@clerk/express` on all protected endpoints
- DO NOT introduce any other auth system or custom JWT implementation

## 6. Documentation & Roadmap Maintenance
- **Proposing Doc Changes:** If you find the architecture or workflow has changed, you MUST propose updates to the relevant doc file. **Ask for USER'S APPROVAL before writing changes to `AGENTS.md` or `docs/ARCHITECTURE.md`.**
- **Roadmap Tracking:** When you complete a task, update `docs/ROADMAP.md` by changing `[ ]` to `[x]` for the completed item.
- **Context Updates:** After significant work sessions, update `docs/CONTEXT.md` with current project state, what was completed, and what is next.

## 7. Extended Memory & Guidelines
Read these files for deeper context before working on specific areas:
- AI pipeline, LangGraph, and data flow → `docs/ARCHITECTURE.md`
- Current project state and active phase → `docs/CONTEXT.md`
- Sprint tasks and overall progress → `docs/ROADMAP.md`
- UI/UX principles, colors, typography → `DESIGN.md`
- Testing strategy, TDD workflow, coverage requirements → `docs/TESTING.md`
