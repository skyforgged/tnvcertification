# TypeScript single-version design

## Intent

Remove the TypeScript major-version split. Use TypeScript `7.0.2` as the only
compiler. Make `package.json`, `docs/toolchain-policy.md`, validation scripts,
and lockfile agree.

## Goals

- Remove `@typescript/typescript6@6.0.2` from the dependency graph.
- Remove `@astrojs/check`, which rejects TypeScript `7.0`.
- Keep `check`, `build`, `typecheck`, `lint`, and `test` runnable on Node
  `26.13.1` and pnpm `12.21.0`.
- Fix the known prerender crash so `build` can complete.
- Record the final state in `docs/build-report.txt`.

## Non-goals

- Do not use TypeScript `7.1.0-beta` or `@astrojs/ts-content-mapper`.
- Do not claim full Astro-aware TypeScript checking. `tsc` will check `.ts`
  files; `.astro` templates will not be type-checked by this setup.
- Do not change application content or visual design.

## Constraints

- Astro stays at `7.4.13`.
- Tailwind CSS and `@tailwindcss/vite` stay at `4.3.5`.
- Node stays pinned to `26.13.1`; pnpm stays pinned to `12.21.0`.
- TypeScript must be stable. Only `7.0.2` is stable at this time.

## Approaches considered

### A. Reference-repo style: single TypeScript 7.0.2

Use `astro sync && tsc --noEmit` for `check`. Remove `@astrojs/check` and
TypeScript 6. Simplify lint so it no longer loads `typescript-eslint`, which
rejects TypeScript 7.0.

Tradeoff: no Astro-aware template type-checking. Chosen because it uses only
stable versions and removes the version split.

### B. TypeScript 7.1 beta with `@astrojs/ts-content-mapper`

Keep Astro-aware checking through `tsc --runExternalCode`.

Tradeoff: requires a beta compiler and still leaves `typescript-eslint`
incompatible. Rejected.

### C. Rewrite policy to allow TypeScript 6 temporarily

Tradeoff: documents the conflict but does not remove the split. Rejected.

## Design

### Package and scripts

- Set `typescript` to `7.0.2`.
- Remove `@astrojs/check`, `@typescript/native`, and `typescript-eslint`.
- Add `vite` `8.3.8` as a direct dev dependency because `vite.config.mjs`
  imports it directly.
- Change `check` to `astro sync && tsc --noEmit`.
- Keep `build` as `astro build`.

### Lint

- Remove `typescript-eslint` from `eslint.config.js`.
- Keep JS lint rules and Astro plugin rules.
- If `eslint-plugin-astro` cannot run without `typescript-eslint`, remove it
  and report the reduced lint coverage.

### pnpm configuration

- Add `pnpm-workspace.yaml` with:
  - `minimumReleaseAge: 0` because the lockfile contains a recently published
    `source-map-js@1.2.4`.
  - `allowBuilds.esbuild: true` because Astro requires the esbuild build
    script.
- Regenerate the lockfile with pnpm `12.21.0`.

### Build fix

In `src/pages/articles/page/[page].astro`, compute `pageSize`, `ordered`, and
`pageCount` inside `getStaticPaths()` instead of the frontmatter module body.
Pass values through `props` where the template needs them.

### Documentation

- Update `docs/toolchain-policy.md` to state one TypeScript version and no
  `astro check`.
- Update `docs/build-report.txt` with final validation results.

## Validation

Run on Node `26.13.1` and pnpm `12.21.0`:

1. `pnpm install`
2. `pnpm run check`
3. `pnpm run build`
4. `pnpm run typecheck`
5. `pnpm run lint`
6. `pnpm run test`

Inspect `git status` and `git diff` before commit. Commit to `main`, then push.
