# Toolchain policy

This document records the development runtime and package-version policy.

## Runtime and package manager

- Node.js: 26.13.1 (Node 26 line; pinned in `.node-version` and `.nvmrc`)
- pnpm: 12.21.0 (pinned in `package.json` via `packageManager`)
- Node engine range: `>=26.13.1 <27`

## Framework and CSS

- Astro: keep the repository's current 7.4.13 version while validating the toolchain.
- Tailwind CSS and `@tailwindcss/vite`: both pinned to 4.3.5.

## TypeScript policy

- TypeScript: `7.0.2` only.
- TypeScript 6.x is prohibited.
- `@astrojs/check` is intentionally removed. It rejects TypeScript 7.0.
- `check` runs `astro sync && tsc --noEmit`.
- `.astro` templates are not fully type-checked by this setup. Full Astro-aware checking needs a stable TypeScript 7.1+ path, which is not used here.
- Do not add package aliases that install multiple TypeScript compiler majors.

## Validation requirement

After dependency installation on Node 26.13.1 with pnpm 12.21.0, run `check`, `typecheck`, `lint`, `test`, and `build` locally.
