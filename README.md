# PT. Intiprima Sertifikasi

Content-driven Astro site for PT. Intiprima Sertifikasi.

## Requirements

- Node.js `26.13.1` (see `.nvmrc` and `.node-version`)
- pnpm `12.21.0` via Corepack

## Setup

```bash
corepack enable
corepack pnpm install
```

## Scripts

- `pnpm dev` — start Astro dev server
- `pnpm build` — build the site and run editorial validation
- `pnpm check` — Astro content sync and TypeScript diagnostics (`.astro` templates are not type-checked)
- `pnpm typecheck` — TypeScript only
- `pnpm lint` — ESLint
- `pnpm test` — content validation tests
- `pnpm format` — Prettier

See `AGENTS.md` and `docs/` for architecture, content rules, and workflow.
