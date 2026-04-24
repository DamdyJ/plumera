# Design Document: Plumera Codebase Refactor & Type Safety Enforcement

## 1. Overview
The goal of this refactor is to improve the maintainability, readability, and reliability of the Plumera codebase. We will enforce strict TypeScript rules, standardize naming conventions according to industry best practices (React for frontend, Node.js for backend), and eliminate technical debt like `any` types and unused variables.

## 2. Goals
- **Strict Type Safety**: Zero usage of `any` across the codebase.
- **Code Cleanliness**: No unused variables, imports, or functions.
- **Consistency**: Standardized naming conventions for files and folders.
- **Modern Standards**: Transition to extensionless TypeScript imports in the server.

## 3. Proposed Changes

### 3.1 ESLint & Prettier Configuration
- **ESLint Rule Changes**:
    - `@typescript-eslint/no-explicit-any`: Set to `error`.
    - `@typescript-eslint/no-unused-vars`: Set to `error`.
    - `no-console`: Set to `warn` (to keep production logs clean).
    - `prefer-const`: Set to `error`.
- **Prettier Configuration**:
    - **Standardized Config**:
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
    - Apply this config consistently to both `client` and `server`.
- **Integration**: Ensure Prettier runs as an ESLint plugin (`eslint-plugin-prettier`) to catch formatting issues during linting.
- **Server Setup**: Update `tsconfig.json` and `eslint.config.mjs` to support extensionless imports and strict typing.
- **Client Setup**: Update `eslint.config.js` to align with the new strictness levels and Prettier integration.

### 3.2 Naming Conventions
#### Client (React Standard)
- **Components**: `src/components/**/*.tsx` and `src/pages/**/components/*.tsx` will use `PascalCase`.
    - *Example*: `file-upload.tsx` → `FileUpload.tsx`.
- **Hooks**: `src/hooks/*.ts` will use `camelCase` starting with `use`.
    - *Example*: `use-file-upload.ts` → `useFileUpload.ts`.
- **General Files**: Utils, constants, and types will use `kebab-case`.

#### Server (Node.js Standard)
- **Files & Folders**: All files and folders will use `kebab-case`.
    - *Example*: `document.service.ts` (already kebab) will remain or be refined if needed.

### 3.3 Refactoring Work
- **Type Definitions**: Create robust interfaces for:
    - Supabase storage responses.
    - Pinecone vector metadata.
    - API request/response payloads (Zod schemas will be used to derive types).
    - AI service (Gemini) interactions.
- **Import Cleanup**: Batch update all server-side imports to remove `.js` extensions.
- **Dead Code Elimination**: Remove all variables and imports flagged by the new ESLint rules.

## 4. Risks & Mitigations
- **Breaking Imports**: Removing `.js` extensions might cause issues if the build tool (Vite/Node) isn't configured correctly.
    - *Mitigation*: Verify `tsconfig.json` (moduleResolution) and `package.json` (type: module) settings.
- **Complex Types**: Some third-party library objects might be hard to type.
    - *Mitigation*: Use `unknown` with type guards or specialized types from the library's `@types` package instead of `any`.

## 5. Success Criteria
- `npm run lint` passes with 0 errors and 0 warnings in both client and server.
- The application builds and runs successfully.
- All file names follow the new convention.
- No `any` keywords remain in the source code (except for valid edge cases like `JSON.parse` return types if immediately cast).
