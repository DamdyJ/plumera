# Architecture: Plumera V2

## 1. Core Philosophy
Plumera V2 shifts from a standard "RAG Chatbot" to an interactive, AI-driven resume editor — the "Grammarly for Resumes". We eliminate the V1 complexity (Pinecone chunking, embeddings, vector search) by leveraging modern LLMs with large context windows and a purpose-built LangGraph agentic pipeline.

**Key Product Differentiators:**
- **Multi-job targeting** — one resume analyzed against 1+ job targets simultaneously
- **Job-specific suggestions** — each suggestion knows which job(s) it applies to (strength/improvement/neutral)
- **Cross-job intelligence** — AI identifies resume alignment across jobs, recommends focus
- **Task-based progress** — suggestions as actionable tasks (pending/accepted/dismissed)
- **Contextual chatbot** — in-editor Q&A that knows resume content + all job targets + analysis results
- **Re-analysis cycle** — user edits resume, triggers re-analysis, compares scores across runs

## 2. The Document Pipeline

### V1 (Deprecated — Do Not Use)
```
Upload PDF → pdf-parse (text chunks) → LangChain embed → Pinecone DB → RAG retrieval → Gemini chat
```
Problems: Context loss from chunking, hallucination from incomplete retrieval, no structured output, expensive.

### V2 (Current Architecture)
```
Upload PDF
    ↓
Supabase Storage (store original file)
    ↓
Gemini File API (parse PDF natively — no local library needed)
    ↓
Store extracted_markdown on `resumes` table (cached for re-analysis)
    ↓
User adds 1+ target jobs via wizard → stored in `target_jobs` table
    ↓
User triggers analysis → creates `analysis_runs` record
    ↓
BullMQ Job Queue (non-blocking, returns runId to frontend)
    ↓
Background Worker picks up job
    ↓
LangGraph State Machine (4 nodes, multi-job aware):
  ├── Node A: Structure Analysis   → MiniMax M2.5 (OpenRouter)
  ├── Node B: Impact Analysis      → MiniMax M2.5 (OpenRouter)
  ├── Node C: Grammar & Tone       → MiniMax M2.5 (OpenRouter)
  └── Node D: Scoring              → Compute overall_score
    ↓
Output: Structured JSON { suggestions[] with per-job relevance tags }
    ↓
Save to Supabase (suggestions + suggestion_job_relevance tables)
    ↓
Frontend polls for completion → Tiptap renders inline highlights per job
    ↓
User edits based on suggestions → marks tasks as accepted/dismissed
    ↓
User triggers re-analysis → new analysis_run with incremented run_number
```

## 3. LangGraph State Machine

### State Interface
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

### Node Design
- **Node A (Structure):** Checks if resume has required sections (Summary, Experience, Education, Skills). Flags missing sections with `critical` severity. Tags relevance per target job.
- **Node B (Impact):** Evaluates each bullet point for action verbs, quantifiable outcomes, and relevance to each target job's requirements.
- **Node C (Grammar & Tone):** Flags typos, passive voice overuse, and suggests tone matching each target job's industry.
- **Node D (Scoring):** Computes `overall_score` (0-100) based on suggestion severity distribution and task completion status.

### Multi-Job Prompt Strategy
Instead of running N separate LLM calls per job, all jobs are batched into a single prompt per node:

```
You are analyzing a resume against {N} target positions:
- Job 1: {title} — {description}
- Job 2: {title} — {description}

For each suggestion, indicate which job(s) it applies to
and whether it's a strength or improvement area for that job.
```

This is efficient because MiniMax M2.5 has a 200K token context window — one resume + multiple job descriptions fit easily.

### Best Practices (from LangGraph.js research)
- Keep state typed and minimal — do not dump transient values into state
- Nodes do the work; edges control flow only
- Always set max iteration limits on any cyclical graph to prevent infinite loops
- Use Zod schemas to validate all LLM outputs before saving to state

## 4. LLM Provider Strategy

### Primary: MiniMax M2.5 via OpenRouter
- **Why:** 200K token context window (entire resume + multiple job descriptions fit easily), strong text analysis, free trial credits
- **Access:** OpenRouter API key (`OPENROUTER_API_KEY`) — compatible with OpenAI SDK interface
- **Client:** `openai` npm package pointed at OpenRouter base URL

### PDF Parsing: Gemini File API
- **Why:** Only free multimodal option that reads PDF layout natively without any local parsing library
- **Rate limit:** Subject to project quota (10 RPM free tier) — acceptable since 1 upload = 1 API call
- **Model:** `gemini-2.5-flash` for file processing
- **Client:** `@google/genai` native SDK (NOT via LangChain)

### Fallback: Gemini 2.5 Flash-Lite
- **When:** MiniMax OpenRouter credits exhausted or API unavailable
- **Rate limit:** 15 RPM / 1,000 RPD — implement exponential backoff with jitter on 429 errors
- **Implementation:** LangGraph nodes should check provider health before calling

## 5. Frontend Editor Experience

### The Editor Room
- Split-view or overlay layout: Resume document on the left, Suggestion panel on the right
- **Tiptap** renders the extracted resume content as a rich text document
- AI suggestions are mapped to specific text ranges using Tiptap's `Decoration` / `Mark` system
- Highlighted text corresponds to `suggestion.originalText` from the LangGraph output
- **Highlights are per-job tagged** — user can filter by job to see job-specific feedback
- **Chatbot panel** — contextual Q&A about the resume, integrated into the editor view

### Suggestion Interaction Flow
1. User clicks a highlighted section → suggestion card expands (Framer Motion animation)
2. Suggestion card shows: category, severity, explanation, which job(s) it applies to
3. User can Accept (applies `suggestion.suggestedText`) or Dismiss
4. Accepted/dismissed suggestions tracked as tasks (progress bar: X/Y completed)
5. After addressing all suggestions, user triggers re-analysis for final score

### Chatbot Interaction Flow
1. Chatbot panel is accessible from the editor view
2. AI has full context: resume content + all target jobs + latest analysis results
3. User can ask: "Is my resume strong enough for Job 2?", "What skills am I missing?"
4. Chatbot uses task detection logic (migrated from V1) to route questions appropriately

### Animation Rules (Apple-style)
- Suggestion card expand: `duration: 0.25s, ease: [0.25, 0.1, 0.25, 1]`
- Highlight pulse: subtle opacity animation, no color flash
- No spring/bounce physics — linear or ease-in-out curves only

## 6. Database Schema (V2 — 8 Tables)

```sql
-- Resume uploads
resumes (id, user_id, title, file_url, extracted_markdown, created_at, updated_at)

-- Job targets per resume (1 resume → N jobs)
target_jobs (id, resume_id, job_title, job_description, sort_order, created_at)

-- Analysis executions (supports re-analysis)
analysis_runs (id, resume_id, status, overall_score, run_number, error_message, started_at, completed_at, created_at)

-- AI-generated suggestions
suggestions (id, analysis_run_id, category, severity, original_text, suggested_text, explanation, status, created_at)

-- Per-job relevance tags for suggestions
suggestion_job_relevance (id, suggestion_id, target_job_id, relevance_type)

-- Contextual chatbot sessions
chat_sessions (id, resume_id, analysis_run_id, created_at)

-- Chat messages
chat_messages (id, session_id, role, content, created_at)
```

Migration must be handled via Drizzle ORM (`bun run db:generate && bun run db:migrate`).

Full schema details including constraints, indexes, and relationships: see `docs/superpowers/specs/2026-04-25-backend-foundation-design.md`.

## 7. API Contract

### Resume Management
```
POST   /api/resumes              Upload resume PDF
GET    /api/resumes              List user's resumes
GET    /api/resumes/:id          Get resume detail + target jobs
DELETE /api/resumes/:id          Delete resume + cascade
```

### Target Jobs
```
POST   /api/resumes/:id/jobs           Add target job(s) — supports bulk
PUT    /api/resumes/:id/jobs/:jobId    Update a target job
DELETE /api/resumes/:id/jobs/:jobId    Remove a target job
```

### Analysis
```
POST   /api/resumes/:id/analyze                       Trigger new analysis run
GET    /api/resumes/:id/analysis                       Get latest run + summary
GET    /api/resumes/:id/analysis/:runId                Get specific run
GET    /api/resumes/:id/analysis/:runId/suggestions    Get suggestions (filterable by job, category)
PATCH  /api/suggestions/:id                            Update suggestion status
```

### Chatbot
```
POST   /api/resumes/:id/chat          Send message, get AI response
GET    /api/resumes/:id/chat/history   Get chat message history
```

### System
```
GET    /health                   Health check (no auth)
```

## 8. Target Folder Structure

```
server/src/
  ├── ai/
  │   ├── graph.ts
  │   ├── state.ts
  │   ├── nodes/
  │   │   ├── structure.node.ts
  │   │   ├── impact.node.ts
  │   │   ├── tone.node.ts
  │   │   └── scoring.node.ts
  │   ├── providers/
  │   │   ├── minimax.provider.ts
  │   │   └── gemini.provider.ts
  │   ├── prompts/
  │   │   ├── structure.prompt.ts
  │   │   ├── impact.prompt.ts
  │   │   ├── tone.prompt.ts
  │   │   └── chat.prompt.ts
  │   └── intent/
  │       └── task-detector.ts
  ├── workers/
  │   └── analysis.worker.ts
  ├── queues/
  │   └── analysis.queue.ts
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
  │   ├── cors.config.ts
  │   ├── supabase.client.ts
  │   └── redis.client.ts
  ├── middleware/
  │   ├── error-handler.middleware.ts
  │   ├── trace-id.middleware.ts
  │   └── zod-validation.middleware.ts
  ├── utils/
  │   ├── async-handler.util.ts
  │   ├── http-error.util.ts
  │   ├── sanitize-filename.util.ts
  │   └── format-markdown.util.ts
  ├── types/
  │   └── analysis.d.ts
  ├── app.ts
  └── index.ts

client/src/
  ├── pages/
  │   ├── LandingPage.tsx
  │   ├── app/
  │   │   ├── DashboardPage.tsx
  │   │   ├── OnboardingPage.tsx
  │   │   └── editor/
  │   │       └── EditorPage.tsx
  ├── components/
  │   ├── editor/
  │   │   ├── ResumeEditor.tsx
  │   │   ├── SuggestionCard.tsx
  │   │   └── ChatPanel.tsx
  │   └── dashboard/
  │       ├── ResumeCard.tsx
  │       └── UploadDropzone.tsx
  └── hooks/
      ├── useAnalysisJob.ts
      ├── useSuggestions.ts
      └── useChatbot.ts
```
