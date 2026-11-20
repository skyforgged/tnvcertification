# Toolchain policy

This document records the development runtime and package-version policy.

## Runtime and package manager

- Node.js: 26.13.1 (Node 26 line; pinned in `.node-version` and `.nvmrc`)
- pnpm: 12.21.0 (pinned in `package.json` via `packageManager`)
- Node engine range: `>=26.13.1 <27`

## Framework and CSS

- Astro: keep the repository's current 7.4.13 version while validating the toolchain.
- Tailwind CSS and `@tailwindcss/vite`: both pinned to 4.3.5.

## TypeScript compatibility decision

- **TypeScript 6.0.2 is explicitly prohibited.**
- Do not adopt TypeScript 7.0.2 for the Astro check/lint stack yet: the current `astro check` and `typescript-eslint` toolchain reported incompatibilities.
- Do not maintain multiple TypeScript compiler majors as an accidental side effect of package aliases.
- Revisit TypeScript separately after the Astro language tooling compatibility path is verified. This is intentionally deferred rather than papered over by disabling checks.

## Validation requirement

After dependency installation on Node 26.13.1 with pnpm 12.21.0, run `check`, `typecheck`, `lint`, `test`, and `build`. This GitHub-side toolchain edit has not been validated by executing these scripts in a local repository checkout.
