# Design Spec: Backend Foundation & Architecture Correction

> **Date:** 2026-04-25
> **Scope:** Phase 1 Backend Foundation — correcting all 7 gaps identified in the business analysis
> **Status:** Draft → Pending User Review

---

## 1. Problem Statement

The current V2 documentation (`ARCHITECTURE.md`, `ROADMAP.md`) was written assuming a single-job analysis model. After product requirement refinement, we now know Plumera V2 requires:

1. **Multi-job targeting** — one resume analyzed against 1+ job targets simultaneously
2. **Contextual chatbot** — in-editor Q&A that knows the resume + all job targets
3. **Re-analysis cycle** — user edits resume, re-triggers analysis, compares scores
4. **Task-based progress** — suggestions as a task list (pending/accepted/dismissed), not a live score counter

These four requirements fundamentally change the database schema, API contract, LangGraph state machine, and implementation phases.

---

## 2. Database Schema (V2 — 8 Tables)

### 2.1 `resumes` — User's uploaded documents

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK, default `gen_random_uuid()` | |
| `user_id` | TEXT | NOT NULL | Clerk user ID |
| `title` | TEXT | NOT NULL | Display name (derived from filename) |
| `file_url` | TEXT | NOT NULL | Supabase Storage path |
| `extracted_markdown` | TEXT | nullable | Cached Gemini File API output |
| `created_at` | TIMESTAMPTZ | NOT NULL, default NOW() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL, default NOW() | |

Indexes: `idx_resumes_user_id` on `user_id`

### 2.2 `target_jobs` — Job targets per resume

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK, default `gen_random_uuid()` | |
| `resume_id` | UUID | FK → resumes(id) ON DELETE CASCADE | |
| `job_title` | TEXT | NOT NULL | |
| `job_description` | TEXT | NOT NULL | Company scope, requirements, benefits |
| `sort_order` | INTEGER | NOT NULL, default 0 | Wizard step ordering |
| `created_at` | TIMESTAMPTZ | NOT NULL, default NOW() | |

Indexes: `idx_target_jobs_resume_id` on `resume_id`

### 2.3 `analysis_runs` — Each analysis execution

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK, default `gen_random_uuid()` | |
| `resume_id` | UUID | FK → resumes(id) ON DELETE CASCADE | |
| `status` | TEXT | NOT NULL, CHECK IN ('pending','processing','completed','failed') | |
| `overall_score` | INTEGER | nullable | 0-100, computed after analysis |
| `run_number` | INTEGER | NOT NULL, default 1 | Increments per resume |
| `error_message` | TEXT | nullable | If status = 'failed' |
| `started_at` | TIMESTAMPTZ | nullable | |
| `completed_at` | TIMESTAMPTZ | nullable | |
| `created_at` | TIMESTAMPTZ | NOT NULL, default NOW() | |

Indexes: `idx_analysis_runs_resume_id` on `resume_id`

### 2.4 `suggestions` — AI-generated suggestions

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK, default `gen_random_uuid()` | |
| `analysis_run_id` | UUID | FK → analysis_runs(id) ON DELETE CASCADE | |
| `category` | TEXT | NOT NULL, CHECK IN ('structure','impact','grammar','tone') | |
| `severity` | TEXT | NOT NULL, CHECK IN ('critical','moderate','minor') | |
| `original_text` | TEXT | NOT NULL | Text to highlight in Tiptap |
| `suggested_text` | TEXT | NOT NULL | Recommended replacement |
| `explanation` | TEXT | NOT NULL | Why this change matters |
| `status` | TEXT | NOT NULL, default 'pending', CHECK IN ('pending','accepted','dismissed') | Task-based tracking |
| `created_at` | TIMESTAMPTZ | NOT NULL, default NOW() | |

Indexes: `idx_suggestions_run_id` on `analysis_run_id`

### 2.5 `suggestion_job_relevance` — Which jobs a suggestion applies to

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK, default `gen_random_uuid()` | |
| `suggestion_id` | UUID | FK → suggestions(id) ON DELETE CASCADE | |
| `target_job_id` | UUID | FK → target_jobs(id) ON DELETE CASCADE | |
| `relevance_type` | TEXT | NOT NULL, CHECK IN ('strength','improvement','neutral') | |

Unique constraint: `(suggestion_id, target_job_id)`
Indexes: `idx_sjr_suggestion_id`, `idx_sjr_target_job_id`

### 2.6 `chat_sessions` — Contextual chat sessions

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK, default `gen_random_uuid()` | |
| `resume_id` | UUID | FK → resumes(id) ON DELETE CASCADE | |
| `analysis_run_id` | UUID | FK → analysis_runs(id) ON DELETE SET NULL | Nullable — chat can exist before analysis |
| `created_at` | TIMESTAMPTZ | NOT NULL, default NOW() | |

Indexes: `idx_chat_sessions_resume_id` on `resume_id`

### 2.7 `chat_messages` — Individual chat messages

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK, default `gen_random_uuid()` | |
| `session_id` | UUID | FK → chat_sessions(id) ON DELETE CASCADE | |
| `role` | TEXT | NOT NULL, CHECK IN ('user','assistant') | |
| `content` | TEXT | NOT NULL | |
| `created_at` | TIMESTAMPTZ | NOT NULL, default NOW() | |

Indexes: `idx_chat_messages_session_id` on `session_id`

### 2.8 Entity Relationship

```
resumes (1) ──→ (N) target_jobs
resumes (1) ──→ (N) analysis_runs
resumes (1) ──→ (N) chat_sessions

analysis_runs (1) ──→ (N) suggestions
suggestions (1) ──→ (N) suggestion_job_relevance ←── (1) target_jobs

chat_sessions (1) ──→ (N) chat_messages
chat_sessions (N) ──→ (1) analysis_runs  (optional context link)
```

---

## 3. API Endpoints

All endpoints are prefixed with `/api` and require Clerk auth (`requireAuth()`) unless noted.

### 3.1 Resume Management

```
POST   /api/resumes              Upload resume PDF + create record
GET    /api/resumes              List user's resumes
GET    /api/resumes/:id          Get resume detail (includes target_jobs)
DELETE /api/resumes/:id          Delete resume + cascade all related data
```

**POST /api/resumes**
- Content-Type: `multipart/form-data`
- Body: `pdf` (file, required)
- Response: `{ id, title, fileUrl, createdAt }`
- Side effect: Triggers Gemini File API extraction, stores result in `extracted_markdown`

### 3.2 Target Jobs

```
POST   /api/resumes/:id/jobs           Add one or more target jobs
PUT    /api/resumes/:id/jobs/:jobId    Update a target job
DELETE /api/resumes/:id/jobs/:jobId    Remove a target job
```

**POST /api/resumes/:id/jobs**
- Body: `{ jobs: [{ jobTitle, jobDescription }] }` (array — supports bulk add from wizard)
- Response: `{ jobs: [{ id, jobTitle, sortOrder }] }`

### 3.3 Analysis

```
POST   /api/resumes/:id/analyze                       Trigger new analysis run
GET    /api/resumes/:id/analysis                       Get latest analysis run + summary
GET    /api/resumes/:id/analysis/:runId                Get specific analysis run
GET    /api/resumes/:id/analysis/:runId/suggestions    Get suggestions (filterable)
PATCH  /api/suggestions/:id                            Update suggestion status
```

**POST /api/resumes/:id/analyze**
- Body: `{}` (empty — uses existing target_jobs and extracted_markdown)
- Response: `{ runId, status: 'pending', runNumber }`
- Side effect: Enqueues BullMQ job

**GET /api/resumes/:id/analysis/:runId/suggestions**
- Query params: `?jobId=xxx` (filter by target job), `?category=structure` (filter by category)
- Response: `{ suggestions: [...], progress: { total, accepted, dismissed, pending } }`

**PATCH /api/suggestions/:id**
- Body: `{ status: 'accepted' | 'dismissed' }`

### 3.4 Chatbot

```
POST   /api/resumes/:id/chat          Send message, get AI response
GET    /api/resumes/:id/chat/history   Get chat message history
```

**POST /api/resumes/:id/chat**
- Body: `{ message: string }`
- Response: `{ id, role: 'assistant', content: string }`
- Context: AI automatically receives resume content + all target jobs + latest analysis results

### 3.5 System

```
GET    /health                   Health check (no auth required)
```

---

## 4. LangGraph State Machine (Multi-Job)

### 4.1 State Interface

```typescript
interface TargetJob {
  id: string;
  jobTitle: string;
  jobDescription: string;
}

interface SuggestionOutput {
  category: 'structure' | 'impact' | 'grammar' | 'tone';
  severity: 'critical' | 'moderate' | 'minor';
  originalText: string;
  suggestedText: string;
  explanation: string;
  jobRelevance: Array<{
    targetJobId: string;
    relevanceType: 'strength' | 'improvement' | 'neutral';
  }>;
}

interface ResumeAnalysisState {
  // Input (set before graph execution)
  resumeId: string;
  analysisRunId: string;
  targetJobs: TargetJob[];
  extractedMarkdown: string;

  // Progressive output (each node appends to this array)
  suggestions: SuggestionOutput[];

  // Scoring (set by final scoring step)
  overallScore: number | null;

  // Control flow
  status: 'extracting' | 'analyzing_structure' | 'analyzing_impact'
        | 'analyzing_tone' | 'scoring' | 'completed' | 'failed';
  errorMessage: string | null;
}
```

### 4.2 Graph Flow

```
START
  → structureNode (analyzes resume sections against all target jobs)
  → impactNode (evaluates bullet points, action verbs, quantified results per job)
  → toneNode (grammar, tone, language match per job industry)
  → scoringNode (computes overall_score based on all suggestions)
  → SAVE (persist to database)
END
```

Each node receives the full `targetJobs` array and outputs suggestions with per-job `jobRelevance` tags.

### 4.3 Multi-Job Prompt Strategy

Instead of running N separate LLM calls per job, we batch all jobs into a single prompt:

```
You are analyzing a resume against {N} target positions:
- Job 1: {title} — {description}
- Job 2: {title} — {description}

For each suggestion, indicate which job(s) it applies to and whether it's a strength or improvement area.
```

This is efficient because MiniMax M2.5 has a 200K token context window — one resume + multiple job descriptions fit easily.

---

## 5. Server Folder Structure

```
server/src/
  ├── ai/
  │   ├── graph.ts                       # LangGraph state machine definition
  │   ├── state.ts                       # ResumeAnalysisState interface + Zod schema
  │   ├── nodes/
  │   │   ├── structure.node.ts
  │   │   ├── impact.node.ts
  │   │   ├── tone.node.ts
  │   │   └── scoring.node.ts
  │   ├── providers/
  │   │   ├── minimax.provider.ts        # OpenRouter client (OpenAI SDK)
  │   │   └── gemini.provider.ts         # @google/genai File API client
  │   ├── prompts/
  │   │   ├── structure.prompt.ts
  │   │   ├── impact.prompt.ts
  │   │   ├── tone.prompt.ts
  │   │   └── chat.prompt.ts             # Chatbot system prompt
  │   └── intent/
  │       └── task-detector.ts           # Migrated from V1 detectTask()
  ├── workers/
  │   └── analysis.worker.ts             # BullMQ worker
  ├── queues/
  │   └── analysis.queue.ts              # BullMQ queue definition
  ├── modules/
  │   ├── resume/
  │   │   ├── resume.route.ts
  │   │   ├── resume.controller.ts
  │   │   ├── resume.service.ts
  │   │   └── resume.dto.ts
  │   ├── analysis/
  │   │   ├── analysis.route.ts
  │   │   ├── analysis.controller.ts
  │   │   ├── analysis.service.ts
  │   │   └── analysis.dto.ts
  │   ├── suggestion/
  │   │   ├── suggestion.route.ts
  │   │   ├── suggestion.controller.ts
  │   │   ├── suggestion.service.ts
  │   │   └── suggestion.dto.ts
  │   └── chat/
  │       ├── chat.route.ts
  │       ├── chat.controller.ts
  │       ├── chat.service.ts
  │       └── chat.dto.ts
  ├── db/
  │   ├── db.ts
  │   └── schema/
  │       ├── index.ts
  │       ├── resume.ts
  │       ├── target-job.ts
  │       ├── analysis-run.ts
  │       ├── suggestion.ts
  │       ├── suggestion-job-relevance.ts
  │       ├── chat-session.ts
  │       └── chat-message.ts
  ├── lib/
  │   ├── cors.config.ts                 # KEEP
  │   ├── supabase.client.ts             # KEEP
  │   └── redis.client.ts               # NEW: ioredis connection
  ├── middleware/                         # ALL KEEP as-is
  │   ├── error-handler.middleware.ts
  │   ├── trace-id.middleware.ts
  │   └── zod-validation.middleware.ts
  ├── utils/                             # ALL KEEP as-is
  │   ├── async-handler.util.ts
  │   ├── http-error.util.ts
  │   └── sanitize-filename.util.ts
  ├── types/
  │   └── analysis.d.ts                  # Replaces score.d.ts
  ├── app.ts
  └── index.ts
```

---

## 6. Dependency Changes

### Remove from `server/package.json`:
- `@langchain/community` — V1 PDF loader
- `@langchain/google-genai` — V1 LangChain Gemini wrapper
- `@langchain/pinecone` — V1 Pinecone integration
- `@langchain/textsplitters` — V1 text chunking
- `@pinecone-database/pinecone` — V1 vector DB
- `langchain` — V1 main package (replaced by LangGraph only)
- `pdf-parse` — V1 local PDF parsing

### Add to `server/package.json`:
- `@google/genai` — Native Gemini SDK (File API for PDF parsing)
- `@langchain/langgraph` — LangGraph.js state machine
- `bullmq` — Background job queue
- `ioredis` — Redis client for BullMQ
- `openai` — OpenAI SDK (OpenRouter/MiniMax compatible)
- `zod` — Schema validation (if not already)

### Keep in `server/package.json`:
- `@langchain/core` — Required by LangGraph.js
- `@clerk/express` — Auth
- `@supabase/supabase-js` — Storage
- `cors`, `dotenv`, `drizzle-orm`, `drizzle-zod`, `express`, `helmet`, `multer`, `postgres`

---

## 7. V1 Business Logic Migration Plan

### From `document.service.ts` (378 lines):

| V1 Function | V2 Destination | Action |
|---|---|---|
| `savePdf()` | `modules/resume/resume.service.ts` | Move as-is |
| `storeEmbedding()` | DELETE | Replaced by Gemini File API |
| `queryDocument()` | DELETE | Replaced by chatbot service |
| `detectTask()` | `ai/intent/task-detector.ts` | Migrate logic |
| `shouldUseContext()` | `ai/intent/task-detector.ts` | Migrate logic |
| `validateResumeContent()` | `modules/resume/resume.service.ts` | Migrate as upload validation |
| `buildSeparatedContextPrompt()` | `ai/prompts/chat.prompt.ts` | Adapt for V2 chatbot |
| `buildSeparatedUserMessage()` | `ai/prompts/chat.prompt.ts` | Adapt for V2 chatbot |
| `formatResponseAsMarkdown()` | `utils/format-markdown.util.ts` | Move as utility |

### From `score.d.ts`:
- DELETE entirely — replaced by `types/analysis.d.ts` with V2 interfaces

---

## 8. Updated Phase Plan

### Phase 1: Backend Foundation
- [ ] Remove V1 dead code (Pinecone, pdf-parse, LangChain embeddings, empty dirs)
- [ ] Remove V1 modules (chat, message, document — after migrating salvageable logic)
- [ ] Remove V1 schema files (chat.ts, message.ts)
- [ ] Update `server/package.json` (remove 7 deps, add 5 deps)
- [ ] Setup Gemini File API provider (`ai/providers/gemini.provider.ts`)
- [ ] Setup OpenRouter/MiniMax provider (`ai/providers/minimax.provider.ts`)
- [ ] Setup BullMQ + Redis (`lib/redis.client.ts`, `queues/`, `workers/`)
- [ ] Write full V2 Drizzle schema (8 files in `db/schema/`)
- [ ] Run `bun run db:generate && bun run db:migrate`
- [ ] Create Resume module (route, controller, service, dto)
- [ ] Create Analysis module stubs (route + controller shells, no AI logic yet)
- [ ] Create Suggestion module stubs
- [ ] Create Chat module stubs
- [ ] Update `app.ts` with new routes
- [ ] Migrate V1 business logic to V2 locations

### Phase 2: AI Pipeline
- [ ] Define `ResumeAnalysisState` with Zod validation
- [ ] Implement structure node (multi-job aware)
- [ ] Implement impact node (multi-job aware)
- [ ] Implement tone node (multi-job aware)
- [ ] Implement scoring node
- [ ] Wire LangGraph state machine
- [ ] Implement BullMQ worker
- [ ] Implement analysis API endpoints (trigger, poll, get results)
- [ ] Implement suggestion endpoints (list with filters, status update)
- [ ] Implement chatbot backend (contextual Q&A)
- [ ] Add fallback logic (MiniMax → Gemini Flash-Lite)
- [ ] Add re-analysis flow

### Phase 3: Frontend Core
- [ ] Landing page redesign
- [ ] Dashboard (resume cards)
- [ ] Upload + multi-job wizard
- [ ] Routing overhaul
- [ ] API hooks (TanStack Query)

### Phase 4: Editor Experience
- [ ] Tiptap editor setup
- [ ] Suggestion highlights (per-job tagging)
- [ ] Suggestion cards (accept/dismiss)
- [ ] Chatbot panel in editor
- [ ] Task-based progress tracking
- [ ] Re-analysis trigger UI

### Phase 5: Polish & Security
- [ ] File validation, rate limiting
- [ ] Error boundaries
- [ ] Performance optimization
- [ ] Auth hardening

---

## 9. Naming Conventions

| Category | Convention | Example |
|---|---|---|
| DB tables | `snake_case`, plural | `target_jobs`, `analysis_runs` |
| DB columns | `snake_case` | `resume_id`, `job_title` |
| Schema files | `kebab-case.ts` | `target-job.ts`, `analysis-run.ts` |
| Module files | `domain.role.ts` | `resume.route.ts`, `resume.service.ts` |
| AI node files | `purpose.node.ts` | `structure.node.ts`, `impact.node.ts` |
| AI provider files | `name.provider.ts` | `minimax.provider.ts`, `gemini.provider.ts` |
| AI prompt files | `purpose.prompt.ts` | `structure.prompt.ts`, `chat.prompt.ts` |
| API routes | kebab-case, RESTful | `/api/resumes/:id/analysis/:runId/suggestions` |
| TypeScript interfaces | PascalCase | `ResumeAnalysisState`, `SuggestionOutput` |
| Zod schemas | camelCase + Schema suffix | `createResumeSchema`, `updateSuggestionSchema` |
