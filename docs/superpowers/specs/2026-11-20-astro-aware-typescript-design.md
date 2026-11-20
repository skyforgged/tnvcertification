# Astro-aware TypeScript design

## Intent

Enable direct type-checking of `.astro` files while keeping a single TypeScript
compiler in the dependency graph. Move from TypeScript `7.0.2` to
`7.1.0-beta` and register `@astrojs/ts-content-mapper` as a TypeScript content
mapper. Keep lint scope unchanged.

## Goals

- Make `npm run check` type-check `.astro` templates, not only `.ts` files.
- Keep one TypeScript package. Do not reintroduce TypeScript 6 or
  `@astrojs/check`.
- Fix the two content-typing defects exposed by Astro-aware checking:
  schema erasure in the `collection()` helper and missing `draft` in
  `pageSchema`.
- Keep `build`, `typecheck`, `lint`, and `test` runnable on Node `26.13.1` and
  pnpm `12.21.0`.
- Update `docs/toolchain-policy.md` and `docs/build-report.txt` to describe the
  beta exception and the remaining lint limitation.

## Non-goals

- Do not restore linting for `.ts`, `.tsx`, or `.astro` files.
  `typescript-eslint` still rejects TypeScript 7, including canary
  `8.73.1-alpha.7`.
- Do not add a TypeScript 6 alias for ESLint.
- Do not change application content, visual design, or page routing.
- Do not replace deprecated `z.string().url()` calls.
- Do not add `@astrojs/check`.

## Constraints

- Astro stays at `7.4.13`.
- Tailwind CSS and `@tailwindcss/vite` stay at `4.3.5`.
- Node stays pinned to `26.13.1`; pnpm stays pinned to `12.21.0`.
- `@astrojs/ts-content-mapper@0.2.0` requires TypeScript `7.1+` and
  `tsc --runExternalCode`.
- TypeScript `7.1.0-beta` is not stable. This is a documented exception to the
  repository's stable-version policy.

## Approaches considered

### A. Keep TypeScript 7.0.2

Current state. `.astro` files are not type-checked. ESLint only checks
JavaScript. Rejected because it leaves the main validation gap unresolved.

### B. TypeScript 7.1 beta with content mapper

Use `typescript@7.1.0-beta` and `@astrojs/ts-content-mapper@0.2.0`.
`tsc --runExternalCode` parses `.astro` files and reports template errors.
ESLint remains JavaScript-only.

Spike result at `d515859`: `check=0`, `build=0`, 13 pages built. Chosen.

### C. Option B plus TypeScript 6 for ESLint

Add a TypeScript 6 alias only for `typescript-eslint` so `.ts` and `.astro`
can be linted. Rejected. It reintroduces the compiler split, needs further
compatibility testing, and adds lint rules after `tsc` already covers types.

## Design

### Packages and scripts

- Set `typescript` to `7.1.0-beta`.
- Add `@astrojs/ts-content-mapper` `0.2.0` as a dev dependency.
- Do not add `@astrojs/check`, `typescript-eslint`, `eslint-plugin-astro`, or
  any TypeScript 6 alias.
- Change `check` to:
  `astro sync && tsc --noEmit --runExternalCode`
- Change `typecheck` to:
  `tsc --noEmit --runExternalCode`
- Keep `build` as `astro build`.
- Regenerate `pnpm-lock.yaml` with pnpm `12.21.0`.

### TypeScript configuration

In `tsconfig.json`:

- Add top-level `contentMappers`:
  `[{ package: "@astrojs/ts-content-mapper", extensions: [".astro"] }]`
- Add `compilerOptions.jsx: "preserve"`.
- Change `include` to `[".astro/types.d.ts", "src"]`.

`contentMappers` must stay at the root of `tsconfig.json`. Putting it inside
`compilerOptions` produces `TS5023: Unknown compiler option 'contentMappers'`.

### Content typing fixes

In `src/content.config.ts`:

- Change `collection()` from
  `(name: keyof typeof collectionRegistry, schema: z.ZodType)` to
  `collection<T extends z.ZodTypeAny>(name: keyof typeof collectionRegistry, schema: T)`.
  The current annotation erases the concrete schema and makes `entry.data`
  `unknown` under Astro-aware checking.
- Change `pageSchema` from `baseEntrySchema` to
  `baseEntrySchema.extend({ draft: z.boolean().optional() })`.
  `src/pages/[slug].astro` already filters `data.draft !== true`, and
  `src/content/pages/0010-halaman-about-us.md` already contains `draft: false`.

### Lint

Leave `eslint.config.js` unchanged. Continue linting JavaScript files only.

### Documentation

- Update `docs/toolchain-policy.md`:
  - TypeScript policy becomes `7.1.0-beta` plus mapper, recorded as an
    approved beta exception.
  - TypeScript 6 remains prohibited.
  - `check` and `typecheck` include `--runExternalCode`.
  - `.astro` files are now type-checked by `tsc` through the mapper.
  - ESLint limitation remains explicit.
- Rewrite `docs/build-report.txt` with the new findings, fixes, final
  validation, and remaining limitations.
- Regenerate `docs/build-output.txt` from a fresh `npm run build`.

## Validation

Run on Node `26.13.1` and pnpm `12.21.0`:

1. `pnpm install`
2. `npm run check`
3. `npm run build`
4. `npm run typecheck`
5. `npm run lint`
6. `npm run test`

All commands must exit `0`. `npm run test` must report 10 passing tests.
`npm run build` must produce 13 pages.

Before commit, inspect `git status` and `git diff`, run `git diff --check`,
then commit to `main` and push.
