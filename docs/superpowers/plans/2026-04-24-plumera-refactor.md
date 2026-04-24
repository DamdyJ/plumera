# Plumera Codebase Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the Plumera codebase for strict type safety, consistent naming, and unified formatting using ESLint and Prettier.

**Architecture:** 
- Centralized strict linting rules (`any` and `unused-vars` as errors).
- Standardized naming conventions (React PascalCase for components, kebab-case for server).
- Modernized TypeScript imports (extensionless) on the server.

**Tech Stack:** TypeScript, ESLint 9+, Prettier, Vite (Client), Express (Server).

---

### Task 1: Initialize Unified Prettier Configuration

**Files:**
- Modify: `client/.prettierrc`
- Modify: `server/.prettierrc`

- [ ] **Step 1: Standardize Client Prettier Config**
```json
{
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 80,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

- [ ] **Step 2: Standardize Server Prettier Config**
```json
{
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 80
}
```

- [ ] **Step 3: Commit**
```bash
git add client/.prettierrc server/.prettierrc
git commit -m "style: standardize prettier configuration"
```

---

### Task 2: Configure Strict ESLint Rules (Client)

**Files:**
- Modify: `client/package.json`
- Modify: `client/eslint.config.js`

- [ ] **Step 1: Install Prettier ESLint Plugin in Client**
Run: `npm install --save-dev eslint-plugin-prettier eslint-config-prettier --prefix client`

- [ ] **Step 2: Update Client ESLint Config**
```javascript
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-plugin-prettier'
import prettierConfig from 'eslint-config-prettier'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
      prettierConfig,
    ],
    plugins: {
      'prettier': prettier,
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      'prettier/prettier': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': 'warn',
      'prefer-const': 'error',
    },
  },
])
```

- [ ] **Step 3: Commit**
```bash
git add client/package.json client/eslint.config.js
git commit -m "config: enable strict eslint rules and prettier for client"
```

---

### Task 3: Configure Strict ESLint Rules & TS Imports (Server)

**Files:**
- Modify: `server/package.json`
- Modify: `server/eslint.config.mjs`
- Modify: `server/tsconfig.json`

- [ ] **Step 1: Update Server TSConfig for Extensionless Imports**
Modify `server/tsconfig.json`:
```json
{
  "compilerOptions": {
    "moduleResolution": "NodeNext",
    "module": "NodeNext",
    "allowImportingTsExtensions": false,
    // ... other existing options
  }
}
```

- [ ] **Step 2: Update Server ESLint Config**
```javascript
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs', 'dist'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',
      "no-console": "warn",
      "prefer-const": "error",
      "prettier/prettier": ["error", { endOfLine: "auto" }],
    },
  },
);
```

- [ ] **Step 3: Commit**
```bash
git add server/package.json server/eslint.config.mjs server/tsconfig.json
git commit -m "config: enable strict eslint rules and node-compatible ts imports for server"
```

---

### Task 4: Refactor Client Component Naming (PascalCase)

**Files:**
- Rename: `client/src/components/file-upload.tsx` → `FileUpload.tsx`
- Rename: `client/src/components/pdf-upload.tsx` → `PdfUpload.tsx`
- Rename: `client/src/components/header.tsx` → `Header.tsx`
- Rename: `client/src/components/logo.tsx` → `Logo.tsx`
- Update all imports of these files.

- [ ] **Step 1: Rename files**
(Use `mv` commands or tool equivalent)

- [ ] **Step 2: Update imports in App.tsx, router.tsx, etc.**

- [ ] **Step 3: Commit**
```bash
git add client/src
git commit -m "refactor: rename components to PascalCase"
```

---

### Task 5: Eliminate 'any' in Client

**Files:**
- Modify: `client/src/pages/chat/types/chat.ts`
- Modify: `client/src/hooks/use-file-upload.ts`

- [ ] **Step 1: Fix chat types**
In `client/src/pages/chat/types/chat.ts`:
```typescript
export type CreateChatResponseType = {
  data: unknown; // Change from any to unknown or specific interface
  id: string;
  fileUrl: string;
};
```

- [ ] **Step 2: Fix use-file-upload hook**
(Identify any usage and replace with specific types)

- [ ] **Step 3: Commit**
```bash
git add client/src
git commit -m "refactor: eliminate any types in client"
```

---

### Task 6: Eliminate 'any' and Fix Imports in Server

**Files:**
- Modify: `server/src/modules/document/document.service.ts`
- Modify: `server/src/utils/async-handler.util.ts`
- Modify all server files to remove `.js` from imports.

- [ ] **Step 1: Fix async-handler.util.ts**
```typescript
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>, // Change from any to void
): RequestHandler => { ... }
```

- [ ] **Step 2: Batch remove .js extensions**
Use a regex search and replace across `server/src/**/*.ts`.
Search: `from "(.*)\.js"`
Replace: `from "$1"`

- [ ] **Step 3: Fix document.service.ts types**
Replace `Array<any>` with specific Pinecone/Langchain document types.

- [ ] **Step 4: Commit**
```bash
git add server/src
git commit -m "refactor: eliminate any types and standardize imports in server"
```

---

### Task 7: Final Cleanup and Lint Verification

- [ ] **Step 1: Run client lint**
Run: `npm run lint --prefix client`
Fix any remaining issues.

- [ ] **Step 2: Run server lint**
Run: `npm run lint --prefix server`
Fix any remaining issues.

- [ ] **Step 3: Final Commit**
```bash
git commit -m "chore: final linting and cleanup"
```
