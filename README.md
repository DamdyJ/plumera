# Plumera — Resume AI Advisor (SaaS)

**Plumera** is a simple SaaS that analyzes a candidate’s resume/CV against a provided job title & description and returns suggestions and insights using an LLM + RAG pipeline.
Frontend is built with Vite + React + TypeScript (shadcn/ui). Backend is Express + TypeScript and uses LangChain + Google Gemini for LLM calls. Storage and vector search are handled with Supabase (SQL + file storage) and Pinecone (vectors).

---

## Demo thumbnails

![Hero screenshot](./docs/assets/hero.jpg)  
*Hero / marketing section screenshot*

![Dashboard screenshot](./docs/assets/dashboard.jpg)  
*Chatbot / dashboard screenshot*

---

## Key features

* Upload resume PDF or paste CV text
* Provide job title + job description
* RAG pipeline: extract resume context → embed → search → assemble prompt
* LLM-driven suggestions and bullet-pointed improvements
* User auth via Clerk
* File storage in Supabase (PDFs, images)
* Vector store in Pinecone for contextual retrieval
* Admin-friendly: simple API for ingest, search, and inference

---

## Tech stack

**Frontend**

* Vite + React + TypeScript
* shadcn/ui (Radix + shadcn components)
* TanStack Query, React Router, React Hook Form, Zod, React Error Boundary

**Backend**

* Node + Express + TypeScript
* LangChain, `@langchain/google-genai` (Gemini adapter)
* Pinecone (vector DB), Supabase (SQL + Storage)
* PDF parsing (pdf-parse), multer for uploads

**Dev / Tooling**

* ESLint / Prettier / TypeScript
* Drizzle ORM (migrations)
* Deployment candidates: Vercel (frontend), Render/Heroku/Railway (backend)

---

## Repo layout (summary)

```
/client      # frontend (Vite + React)
  package.json
/server      # backend (Express + TS)
  package.json
/docs
README.md
```

---

## Quick start (local)

### Prerequisites

* Node 18+ (LTS recommended)
* npm / yarn / pnpm
* Supabase project (URL + anon/service key)
* Pinecone API key + environment + index name
* Google GenAI / Gemini API key (or Google Cloud credentials)
* Clerk credentials (if using Clerk auth)

### 1) Clone

```bash
git clone https://github.com/DamdyJ/plumera.git
cd plumera
```

### 2) Frontend

```bash
cd client
npm install
# dev
npm run dev
# build
npm run build
```

### 3) Backend

```bash
cd server
npm install
# start dev server (uses tsx)
npm run dev
# compile
npm run build
```

---

## Environment variables

Create `.env` files for both `client` and `server`. Example variables below:

### `server/.env` (example)

```
PORT=4000

# Supabase
SUPABASE_URL=https://your-supabase-url.supabase.co
SUPABASE_SERVICE_KEY=your-supabase-service-key

# Pinecone
PINECONE_API_KEY=your-pinecone-key
PINECONE_ENVIRONMENT=your-pinecone-environment
PINECONE_INDEX=plumera-index

# Google / Gemini (via LangChain Google GenAI adapter)
GENAI_API_KEY=your-google-genai-key
GENAI_PROJECT_ID=your-gcp-project-id
GENAI_LOCATION=us-central1

# Clerk (optional auth)
CLERK_SECRET=your-clerk-secret

# Drizzle / Postgres
DATABASE_URL=postgres://user:pass@host:port/dbname
```

### `client/.env` (example)

```
VITE_API_BASE_URL=http://localhost:4000
VITE_SUPABASE_URL=https://your-supabase-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_CLERK_PUBLISHABLE_KEY=pk_...
```

**Notes**

* Use Supabase service key only on server side. Expose only anon keys to the client.
* Ensure commit email and authorship are configured so commits show on your profile.

---

## How it works (high level)

1. User uploads resume PDF or pastes text.
2. Backend parses PDF → extracts text chunks.
3. Text is embedded (OpenAI / Gemini embeddings or LangChain adapter) and stored in Pinecone.
4. On request, system retrieves relevant chunks for given job description (RAG).
5. LLM (Gemini via LangChain) generates targeted suggestions and structured bullets.
6. Results are returned to frontend chat interface and stored for analytics.

---

## API (examples)

> These are example routes — adapt to your actual server code.

* `POST /api/upload` — upload resume PDF (multipart/form-data) → returns file id
* `POST /api/ingest` — ingest a file into vector DB (fileId)
* `POST /api/analyze` — { jobTitle, jobDescription, resumeId } → returns suggestions
* `GET /api/status` — health check

---

## Deployment tips

* Frontend: deploy to Vercel or Netlify. Set `VITE_API_BASE_URL` to your server URL.
* Backend: deploy to Render / Railway / Heroku / Fly. Use secret environment variables for Supabase/Pinecone/GenAI.
* Database: use managed Postgres or Supabase.
* For production LLM usage, ensure request/response streaming and cost controls, and log usage per user.

---

## Troubleshooting / common issues

* **Contributions not appearing on GitHub**: ensure commits are merged into the repository **default branch** (GitHub counts contributions only on the default branch or branches merged into it). If your team uses a dev branch, set that branch as the repo default or merge periodically.
* **Embeddings mismatch**: confirm the same embedding model is used for indexing and querying.
* **Large PDF parsing**: chunk size and overlap matter for retrieval quality — tune `textSplitter` settings.
* **Auth**: Clerk tokens and Supabase service keys must be kept server-side.

---

## Development notes & TODOs (recommended)

* Add automated tests (unit + integration for analysis pipeline).
* Add CI that runs lint/tsc and unit tests.
* Add role-based access and rate limits for inference endpoints.
* Improve prompt templates and add output schema validation (Zod) for safer downstream parsing.
* Add instrumentation for cost tracking of LLM calls.

---

## Contributing

1. Fork the repo.
2. Create a branch: `feature/your-change`.
3. Open a PR with a clear description and related issue.
4. Use clear commit messages; avoid squash if you want per-commit credit preserved.

---

## License

MIT — see `LICENSE` file.

---

## Contact / Author

Repository: [https://github.com/DamdyJ/plumera](https://github.com/DamdyJ/plumera)
If you want this README tailored to a hosting target (Vercel/Render) or a specific deployment guide, indicate which provider and I will add step-by-step deployment instructions.
