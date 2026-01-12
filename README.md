# Notionista VSCode Extension

This repository contains a personal developer VS Code extension scaffold called Notionista. The extension is a local chat participant that can index the workspace, surface context snippets, and provide a conversational UI inside VS Code.

Important notes

- This is a personal development tool and is distributed under the MIT license.
- I am not accepting pull requests — this is a private/dev-first project.

What is included

- Extension source in `src/` (activation, secure webview chat, context indexing).
- Unit tests (Vitest) and e2e scaffolding (Playwright).
- ESLint (flat config), Prettier, Husky pre-commit hook, and lint-staged skeleton.

Developer quickstart

1. Install dependencies (pnpm recommended):

```powershell
pnpm install
pnpm run prepare
```

2. Build and type-check:

```powershell
pnpm run compile
pnpm run check:ts
```

3. Run unit tests:

```powershell
pnpm run test:unit
```

4. Run e2e tests (Playwright):

```powershell
pnpm run test:e2e
```

Notes on security and privacy

- The extension indexes local files and produces short sanitized snippets. The default implementation is local-only and does not send workspace files off-host. Any external network/LLM integrations must be explicitly opt-in.

If you want me to wire CI (GitHub Actions) and add more comprehensive tests, I can add that next.
