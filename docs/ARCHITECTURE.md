# Architecture: Plumera V2

## 1. Core Philosophy
Plumera V2 shifts from a standard "RAG Chatbot" to an interactive, AI-driven resume editor — the "Grammarly for Resumes". We eliminate the V1 complexity (Pinecone chunking, embeddings, vector search) by leveraging modern LLMs with large context windows and a purpose-built LangGraph agentic pipeline.

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
BullMQ Job Queue (non-blocking, returns jobId to frontend)
    ↓
Background Worker picks up job
    ↓
LangGraph State Machine (3 nodes):
  ├── Node A: Structure Analysis   → MiniMax M2.5 (OpenRouter)
  ├── Node B: Impact Analysis      → MiniMax M2.5 (OpenRouter)
  └── Node C: Grammar & Tone       → MiniMax M2.5 (OpenRouter)
    ↓
Output: Structured JSON { suggestions[], highlights[], scores{} }
    ↓
Save to Supabase (resumes, analysis_jobs, suggestions tables)
    ↓
Frontend polls for completion → Tiptap renders inline highlights
```

## 3. LangGraph State Machine

### State Interface
```typescript
interface ResumeAnalysisState {
  resumeId: string;
  jobDescription: string;
  extractedMarkdown: string;       // from Gemini File API
  structureSuggestions: Suggestion[];
  impactSuggestions: Suggestion[];
  toneSuggestions: Suggestion[];
  overallScore: number;
  status: 'pending' | 'analyzing' | 'complete' | 'error';
}

interface Suggestion {
  id: string;
  type: 'structure' | 'impact' | 'grammar' | 'tone';
  originalText: string;            // text to highlight in Tiptap
  suggestedText: string;
  explanation: string;
  severity: 'critical' | 'moderate' | 'minor';
}
```

### Node Design
- **Node A (Structure):** Checks if resume has required sections (Summary, Experience, Education, Skills). Flags missing sections with `critical` severity.
- **Node B (Impact):** Evaluates each bullet point for action verbs, quantifiable outcomes, and relevance to the provided Job Description.
- **Node C (Grammar & Tone):** Flags typos, passive voice overuse, and suggests tone matching the target job's industry.

### Best Practices (from LangGraph.js research)
- Keep state typed and minimal — do not dump transient values into state
- Nodes do the work; edges control flow only
- Always set max iteration limits on any cyclical graph to prevent infinite loops
- Use Zod schemas to validate all LLM outputs before saving to state

## 4. LLM Provider Strategy

### Primary: MiniMax M2.5 via OpenRouter
- **Why:** 200K token context window (entire resume + job desc fits easily), strong text analysis, free trial credits
- **Access:** OpenRouter API key (`OPENROUTER_API_KEY`) — compatible with OpenAI SDK interface
- **Model string:** `minimax/minimax-m2` or equivalent on OpenRouter

### PDF Parsing: Gemini File API
- **Why:** Only free multimodal option that reads PDF layout natively without any local parsing library
- **Rate limit:** Subject to project quota (10 RPM free tier) — acceptable since 1 upload = 1 API call
- **Model:** `gemini-2.5-flash` for file processing

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

### Interaction Flow
1. User clicks a highlighted section → suggestion card expands (Framer Motion animation)
2. User can Accept (applies `suggestion.suggestedText`) or Dismiss
3. Accepted changes are saved back to Supabase

### Animation Rules (Apple-style)
- Suggestion card expand: `duration: 0.25s, ease: [0.25, 0.1, 0.25, 1]`
- Highlight pulse: subtle opacity animation, no color flash
- No spring/bounce physics — linear or ease-in-out curves only

## 6. Database Schema (V2 Target)

The following tables are needed in addition to the current `chat` and `message` tables:

```sql
-- Resume uploads
resumes (id, user_id, title, file_url, created_at, last_viewed_at)

-- Background job tracking
analysis_jobs (id, resume_id, status, job_description, created_at, completed_at)

-- LangGraph output
suggestions (id, job_id, type, original_text, suggested_text, explanation, severity, accepted)
```

Migration must be handled via Drizzle ORM (`bun run db:generate && bun run db:migrate`).

## 7. Target Folder Structure

```
server/src/
  ├── ai/
  │   ├── graph.ts           # LangGraph state machine definition
  │   ├── nodes/
  │   │   ├── structureNode.ts
  │   │   ├── impactNode.ts
  │   │   └── toneNode.ts
  │   ├── providers/
  │   │   ├── minimax.ts     # OpenRouter client for MiniMax
  │   │   └── gemini.ts      # Gemini File API client
  │   └── prompts/
  │       ├── structure.ts
  │       ├── impact.ts
  │       └── tone.ts
  ├── workers/
  │   └── analysisWorker.ts  # BullMQ worker
  ├── queues/
  │   └── analysisQueue.ts   # BullMQ queue definition
  ├── modules/               # existing Express route modules
  ├── db/
  └── middleware/

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
  │   │   ├── ResumeEditor.tsx   # Tiptap instance
  │   │   └── SuggestionCard.tsx
  │   └── dashboard/
  │       ├── ResumeCard.tsx
  │       └── UploadDropzone.tsx
  └── hooks/
      ├── useAnalysisJob.ts  # polls for job completion
      └── useSuggestions.ts
```
