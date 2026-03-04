# AGENTS.md - Development Guidelines for Plumera

This document provides guidelines for AI agents working on the Plumera codebase.

## Project Overview

Plumera is a Resume AI Advisor SaaS that analyzes resumes/CVs against job descriptions using LLM + RAG.
- **Frontend**: Vite + React + TypeScript + shadcn/ui
- **Backend**: Express + TypeScript + LangChain + Gemini + Pinecone + Supabase
- **Repository Structure**: Monorepo with `/client` and `/server` directories

---

## Build Commands

### Root (Monorepo)
```bash
npm run dev                    # Run both client and server concurrently
npm run client:dev             # Run only frontend
npm run server:dev            # Run only backend
npm run client:build          # Build frontend for production
npm run server:build          # Build backend for production
```

### Client (Vite + React)
```bash
cd client
npm run dev                    # Start dev server (http://localhost:5173)
npm run build                  # Build for production (tsc -b && vite build)
npm run lint                   # Run ESLint
npm run preview                # Preview production build
```

### Server (Express + TypeScript)
```bash
cd server
npm run dev                    # Start dev server with tsx watch (port 3000)
npm run build                  # Compile TypeScript to ./dist
npm run start                  # Run production build (node ./dist/src/index.js)
npm run lint                   # Run ESLint with --fix
npm run format                 # Format with Prettier

# Database
npm run db:generate            # Generate Drizzle migrations
npm run db:migrate             # Run Drizzle migrations
```

### Running a Single Test
**Note**: No tests currently exist in this codebase. When adding tests:
```bash
# Client - add Vitest or Jest, then run:
npm run test                   # Run all tests
npm run test -- --run <test-file>  # Run single test file

# Server - add Vitest or Jest, then run:
npm run test                   # Run all tests
npm run test <test-file>       # Run single test file
```

---

## Code Style Guidelines

### TypeScript Configuration

**Server** (`server/tsconfig.json`):
- Strict mode enabled
- ES2023 target
- Experimental decorators enabled
- `strictNullChecks: true`
- `noImplicitAny: true`

**Client** (`client/tsconfig.json`):
- Path alias: `@/*` maps to `./src/*`
- `noUnusedLocals: true`
- `noUnusedParameters: true`

### Linting & Formatting

**Server**:
- ESLint with TypeScript support
- Prettier integration (trailingComma: "all")
- Config: `server/eslint.config.mjs`

**Client**:
- ESLint with React hooks plugin
- Prettier with tailwindcss plugin
- Config: `client/eslint.config.js`

**Run linting**:
```bash
cd server && npm run lint
cd client && npm run lint
```

### Import Conventions

**Client** (use path aliases):
```typescript } from "@/lib/axios";

import { apiimport ChatForm from "./components/ChatForm";
import type { CreateChatType } from "../types/chat";
```

**Server** (use relative imports with `.js` extension for ESM):
```typescript
import { asyncHandler } from "../../utils/async-handler.util.js";
import { HttpError } from "../../utils/http-error.util.js";
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files | kebab-case | `chat-route.ts`, `use-create-chat.ts` |
| Components (React) | PascalCase | `ChatPage.tsx`, `ChatForm.tsx` |
| Hooks | camelCase with `use` prefix | `useCreateChat.ts`, `useChats.ts` |
| Services | camelCase | `chat.service.ts`, `document.service.ts` |
| Controllers | camelCase | `chat.controller.ts` |
| Routes | camelCase | `chat.route.ts` |
| DTOs/Schemas | camelCase | `chat.dto.ts`, `message.dto.ts` |
| Utilities | camelCase | `http-error.util.ts`, `async-handler.util.ts` |

### Error Handling

**Server**:
- Use custom `HttpError` class for HTTP errors
- Use `asyncHandler` wrapper for all route handlers
- Validate with Zod schemas (throw ZodError for validation failures)

```typescript
import { HttpError } from "../../utils/http-error.util.js";
import { asyncHandler } from "../../utils/async-handler.util.js";

// Example route
export const getChat = asyncHandler(async (req: Request, res: Response) => {
  const userId = getAuth(req).userId;
  if (!userId) throw new HttpError(401, "Unauthorized user");
  
  const data = await findChatById(id, userId);
  if (!data) throw new HttpError(404, "Chat not found");
  
  return res.status(200).json(data);
});
```

**Client**:
- Use axios for API calls
- Handle errors with try/catch in mutations
- Show errors with `sonner` toast

```typescript
try {
  const response = await api.post("/chats", formData);
} catch (error: unknown) {
  if (axios.isAxiosError(error)) {
    throw new Error(error.response?.data.error.message);
  }
}
```

### Validation

**Server**: Zod schemas in `.dto.ts` files
```typescript
import { z } from "zod";

export const createChatSchema = z.object({
  jobTitle: z.string().min(1),
  jobDescription: z.string().min(1),
});
```

**Client**: React Hook Form + Zod
```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createChatSchema } from "../validation";
```

### Authentication

- **Server**: Clerk middleware with `@clerk/express`
- **Client**: `@clerk/clerk-react` hooks (`useAuth`, `useUser`)

### Component Structure (Client)

Follow this pattern for pages and components:
```
src/pages/chat/
├── ChatPage.tsx              # Main page component
├── types/
│   └── chat.ts               # TypeScript types
├── hooks/
│   ├── useCreateChat.ts      # TanStack Query hooks
│   └── useChats.ts
├── components/
│   ├── ChatForm.tsx          # Component files
│   └── ui/                   # shadcn/ui components
└── validation.ts             # Zod schemas
```

### Database (Server)

- ORM: Drizzle
- Use `.dto.ts` files for input validation
- Schema files in `server/src/db/schema/`

### UI Components

- Use shadcn/ui components from `client/src/components/ui/`
- Components are built on Radix UI primitives
- Styling: Tailwind CSS v4
- Animations: `motion` library (Framer Motion)

---

## Environment Variables

### Server (`server/.env`)
```
PORT=4000
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
PINECONE_API_KEY=
PINECONE_ENVIRONMENT=
PINECONE_INDEX=
GENAI_API_KEY=
GENAI_PROJECT_ID=
GENAI_LOCATION=
CLERK_SECRET=
DATABASE_URL=
```

### Client (`client/.env`)
```
VITE_API_BASE_URL=http://localhost:4000
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_CLERK_PUBLISHABLE_KEY=
```

---

## Common Tasks

### Adding a new API endpoint
1. Create/update DTO schema in `server/src/modules/<feature>/<feature>.dto.ts`
2. Add route handler in `server/src/modules/<feature>/<feature>.controller.ts`
3. Add route in `server/src/modules/<feature>/<feature>.route.ts`
4. Register route in `server/src/app.ts`

### Adding a new client page
1. Create component in `client/src/pages/<feature>/`
2. Add route in `client/src/router.tsx`
3. Add API client function in `client/src/api/<feature>.ts`
4. Create TanStack Query hook in `client/src/pages/<feature>/hooks/`

### Adding a new shadcn component
```bash
cd client
npx shadcn@latest add <component-name>
```

---

## Deployment Notes

**Frontend**: Deploy to Vercel - Vite builds to static files
**Backend**: Currently requires separate deployment (Render/Railway/etc.) - Express server not yet adapted for Vercel API routes

---

## Agent System

Plumera uses an AI agent system to help with code review, quality assurance, and development tasks. See `docs/AGENT_SYSTEM.md` for the full overview.

### Available Agents

| Agent | Purpose |
|-------|---------|
| Chief Coordinator | Routes tasks to appropriate agents |
| CI Guardian | Runs lint/build on every PR |
| Code Reviewer | Deep code analysis |
| Frontend Specialist | React/shadcn/Tailwind expertise |
| Backend Specialist | Express/LangChain/RAG expertise |
| Business Logic | Validates core features work |
| UX/Product | User experience guidance |
| Cost Optimizer | Maximizes free tier usage |
| Performance | Bundle size, caching |
| SEO | Search optimization |
| Security | Vulnerability scanning |
| Bug Hunter | Issue investigation |

### Agent Prompts
Individual agent prompts are located in `docs/agent-prompts/`:
- `COORDINATOR.md`
- `CODE_REVIEWER.md`
- `CI_GUARDIAN.md`
- `FRONTEND_SPECIALIST.md`
- `BACKEND_SPECIALIST.md`
- `BUSINESS_LOGIC.md`
- `COST_OPTIMIZER.md`
- `UX_PRODUCT.md`
- `PERFORMANCE.md`
- `SEO.md`
- `SECURITY.md`
- `BUG_HUNTER.md`

### Running Agents

**Automatic (GitHub Actions)**:
- CI Guardian runs on every PR/commit
- Code Reviewer runs on PRs

**Manual**:
- Ask me to act as any specific agent
- Use GitHub Actions workflow_dispatch

### Model Assignments

**Google/Gemini API** (require API key):
- `gemini-3-flash`: Code Reviewer, Performance

**OpenRouter Models** (require API key):
- `nemotron-3-nano-30b-a3b`: Backend Specialist, Security
- `trinity-large-preview`: Business Logic, SEO

**OpenCode Models** (built-in, free):
- `opencode/big-pickle`: CI Guardian, Cost Optimizer
- `opencode/minimax-m2.5-free`: Coordinator, Frontend Specialist, UX/Product
- `opencode/gpt-5-nano`: Bug Hunter

| Agent | Primary Model | Provider |
|-------|---------------|----------|
| Coordinator | opencode/minimax-m2.5-free | OpenCode |
| Code Reviewer | gemini-3-flash | Google/Gemini API |
| CI Guardian | opencode/big-pickle | OpenCode |
| Frontend Specialist | opencode/minimax-m2.5-free | OpenCode |
| Backend Specialist | nemotron-3-nano-30b-a3b | OpenRouter |
| Business Logic | trinity-large-preview | OpenRouter |
| Cost Optimizer | opencode/big-pickle | OpenCode |
| UX/Product | opencode/minimax-m2.5-free | OpenCode |
| Performance | gemini-3-flash | Google/Gemini API |
| SEO | trinity-large-preview | OpenRouter |
| Security | nemotron-3-nano-30b-a3b | OpenRouter |
| Bug Hunter | opencode/gpt-5-nano | OpenCode |

---

## Tech Stack Summary

| Layer | Technology |
|-------|------------|
| Frontend Framework | React 19 + Vite |
| UI Library | shadcn/ui + Radix UI |
| Styling | Tailwind CSS v4 |
| State/Fetching | TanStack Query |
| Routing | React Router v7 |
| Forms | React Hook Form + Zod |
| Backend | Express + TypeScript |
| LLM | LangChain + Google Gemini |
| Vector DB | Pinecone |
| Database | PostgreSQL + Drizzle ORM |
| Storage | Supabase |
| Auth | Clerk |
