## Summary

This PR centralizes Notion identifiers into a runtime registry, removes hard-coded Notion IDs from the shipped extension, and adds safe onboarding and migration tooling.

## Changes

- Sanitized `config/databases.json` (no real Notion IDs shipped).
- Schemas now prefer runtime registry values and provide placeholders for missing IDs.
- Added `scripts/*` migration tools to scan, propose, and apply ID replacements (non-destructive; backups created).
- Added safe onboarding command `notionista.init` (dry-run -> preview -> confirm -> apply) and guard settings (`notionista.allowWrites`, `notionista.autoApplyWrites`).
- ESLint/TS config consolidation and many lint/type fixes.
- CI workflow to run lint/type-check/tests.

## How to test

1. Open the extension folder in VS Code.
2. Run `pnpm install`.
3. Run `pnpm run lint` and `pnpm run check:ts` and `pnpm run test:unit`.

## Migration

See `scripts/docs-replacement-map.json` for proposed doc replacements and `.bak` backups in the repository root for any modified files.
