# Testing Strategy: Plumera V2

> All agents MUST follow Test-Driven Development (TDD). Write the test first, see it fail, then write the minimum code to make it pass.

## 1. Test Runner
- **Runtime:** Bun — use `bun test` for all tests
- **API:** Bun's built-in test API is compatible with Jest/Vitest syntax (`describe`, `it`, `expect`, `mock`)
- No additional test framework installation required

## 2. TDD Workflow (Mandatory for All Agents)

```
1. Understand the requirement
2. Write a failing test that describes the expected behavior
3. Run `bun test` → confirm it fails (red)
4. Write the minimum implementation to make the test pass
5. Run `bun test` → confirm it passes (green)
6. Refactor if needed → run `bun test` again to confirm still green
```

**DO NOT write implementation code before writing a test.** If a task seems "too small to test", write a test anyway. The test is your specification.

## 3. What to Test

### Backend (`server/`)
| Area | What to Test | Priority |
|---|---|---|
| LangGraph Nodes | Input/output shape validation, Zod schema checks | 🔴 Critical |
| API Endpoints | Request validation, response shape, auth guard | 🔴 Critical |
| Queue Workers | Job enqueue, job processing, error handling | 🟡 High |
| Database (Drizzle) | Schema constraints, query correctness | 🟡 High |
| LLM Providers | Mock calls — test prompt construction, not actual API | 🟡 High |
| Utilities | Pure functions, formatters, validators | 🟢 Medium |

### Frontend (`client/`)
| Area | What to Test | Priority |
|---|---|---|
| Tiptap Integration | Suggestion marks are applied correctly | 🔴 Critical |
| API Hooks | `useAnalysisJob` polling logic, error states | 🟡 High |
| Form Validation | Upload form, job description input | 🟡 High |
| Components | Render tests for `SuggestionCard`, `ResumeCard` | 🟢 Medium |

## 4. What NOT to Test
- External API calls (Gemini, MiniMax, Supabase) — always mock these
- Third-party library internals (Tiptap rendering engine, Drizzle ORM queries)
- Style/visual details — use visual review, not tests

## 5. Test File Conventions

```
server/src/
  ├── ai/nodes/
  │   ├── structureNode.ts
  │   └── structureNode.test.ts    ← co-located test file
  ├── modules/
  │   ├── resume/resume.controller.ts
  │   └── resume/resume.controller.test.ts

client/src/
  ├── hooks/
  │   ├── useAnalysisJob.ts
  │   └── useAnalysisJob.test.ts
  ├── components/editor/
  │   ├── SuggestionCard.tsx
  │   └── SuggestionCard.test.tsx
```

- Test files are **co-located** with their source files (not in a separate `__tests__` folder)
- Naming: `<filename>.test.ts` or `<filename>.test.tsx`

## 6. Running Tests

```bash
# Run all tests
bun test

# Run tests in watch mode (during development)
bun test --watch

# Run tests for a specific file
bun test src/ai/nodes/structureNode.test.ts

# Run tests with coverage
bun test --coverage
```

## 7. Mocking External Services

Always mock LLM calls, Supabase, and Clerk in tests:

```typescript
// Example: Mocking OpenRouter/MiniMax in a LangGraph node test
import { mock } from "bun:test";

mock.module("../providers/minimax", () => ({
  callMiniMax: mock(() => Promise.resolve({
    suggestions: [
      { type: "structure", originalText: "Work Experience", ... }
    ]
  }))
}));
```

## 8. Coverage Targets
- **LangGraph Nodes:** 90%+ line coverage (core business logic)
- **API Controllers:** 80%+ line coverage
- **Frontend Hooks:** 80%+ line coverage
- **UI Components:** 60%+ (render + critical interaction paths)

## 9. Verification Before Completion
Before claiming any task is "done", an agent MUST:
1. Run `bun test` — all tests must pass with 0 failures
2. Run `bun run build` (or `bun run typecheck`) — 0 TypeScript errors
3. Run `bun run lint` — 0 ESLint errors
4. Only after all three pass: mark the roadmap item as `[x]`
