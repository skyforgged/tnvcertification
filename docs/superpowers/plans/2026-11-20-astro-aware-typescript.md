# Astro-aware TypeScript Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `npm run check` type-check `.astro` files through TypeScript's content mapper while keeping one TypeScript compiler and unchanged lint scope.

**Architecture:** Replace stable TypeScript `7.0.2` with `7.1.0-beta`, register `@astrojs/ts-content-mapper`, and let `tsc --runExternalCode` parse `.astro` files. Fix the two content typing defects that Astro-aware checking exposes, then record the beta exception and remaining lint limitation in docs.

**Tech Stack:** Node `26.13.1`, pnpm `12.21.0`, Astro `7.4.13`, Tailwind CSS `4.3.5`, TypeScript `7.1.0-beta`, `@astrojs/ts-content-mapper` `0.2.0`.

**Spec:** `docs/superpowers/specs/2026-11-20-astro-aware-typescript-design.md`

## Global Constraints

- Node must be `26.13.1`; pnpm must be `12.21.0`.
- Astro stays at `7.4.13`.
- Tailwind CSS and `@tailwindcss/vite` stay at `4.3.5`.
- `typescript` must be exactly `7.1.0-beta`.
- `@astrojs/ts-content-mapper` must be exactly `0.2.0`.
- TypeScript 6 is prohibited. Do not add aliases or overrides that install any TypeScript 6 package.
- Do not add `@astrojs/check`.
- Do not add `typescript-eslint`, `eslint-plugin-astro`, or `@typescript-eslint/parser`.
- `check` must be exactly `astro sync && tsc --noEmit --runExternalCode`.
- `typecheck` must be exactly `tsc --noEmit --runExternalCode`.
- `build` stays `astro build`.
- `lint` stays `eslint .` with JavaScript-only rules.
- Commit directly to `main`. Do not create branches or pull requests.
- Use `docs/build-report.txt` for the report. `.log` files are ignored by `.gitignore`.

## Review Focus

- `contentMappers` placed inside `compilerOptions` produces `TS5023`. Task 1 Step 1 pins the top-level placement.
- Missing `jsx: "preserve"` produces `TS17004` in `.astro` files. Task 1 Step 2 pins the value by requiring only content-type errors.
- The `collection()` helper typed as `schema: z.ZodType` erases schema output and makes `entry.data` `unknown`. Task 1 Step 2 expects 36 `TS18046` errors; Step 3 removes them.
- `pageSchema` lacks `draft` although `src/pages/[slug].astro` filters on it. Task 1 Step 3 expects one `TS2339` error; Step 4 removes it.
- ESLint scope must not silently expand. Task 2 Step 4 checks that `package.json` and `eslint.config.js` contain no TypeScript or Astro lint packages or rules.

---

### Task 1: Enable Astro-aware checking and fix exposed typing defects

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Modify: `tsconfig.json`
- Modify: `src/content.config.ts`

**Interfaces:**
- Consumes: current scripts `check`, `typecheck`, `build`, `lint`, and `test` from `package.json`.
- Produces:
  - `check`: `astro sync && tsc --noEmit --runExternalCode`
  - `typecheck`: `tsc --noEmit --runExternalCode`
  - `tsconfig.json` top-level `contentMappers`: `[{ "package": "@astrojs/ts-content-mapper", "extensions": [".astro"] }]`
  - `tsconfig.json` `compilerOptions.jsx`: `"preserve"`
  - `tsconfig.json` `include`: `[".astro/types.d.ts", "src"]`
  - `src/content.config.ts` helper: `function collection<T extends z.ZodTypeAny>(name: keyof typeof collectionRegistry, schema: T)`
  - `src/content.config.ts` `pageSchema`: `baseEntrySchema.extend({ draft: z.boolean().optional() })`

- [ ] **Step 1: Configure TypeScript 7.1 beta and the Astro content mapper**

In `package.json`:
- Set `devDependencies.typescript` to `7.1.0-beta`.
- Add `devDependencies["@astrojs/ts-content-mapper"]` as `0.2.0`.
- Set `scripts.check` to `astro sync && tsc --noEmit --runExternalCode`.
- Set `scripts.typecheck` to `tsc --noEmit --runExternalCode`.

In `tsconfig.json`:
- Add `"jsx": "preserve"` inside `compilerOptions`.
- Change `include` to `[".astro/types.d.ts", "src"]`.
- Add this object at the root of the file, outside `compilerOptions`:

```json
"contentMappers": [
  {
    "package": "@astrojs/ts-content-mapper",
    "extensions": [".astro"]
  }
]
```

Do not change `src/content.config.ts` in this step.

- [ ] **Step 2: Install dependencies and verify the mapper exposes the schema defect**

Run:

```bash
export PATH="$HOME/.local/node-v26.13.1/bin:$PATH"
pnpm install
pnpm run check
```

Expected: `pnpm install` exits `0` and updates `pnpm-lock.yaml`. `pnpm run check` exits `2` with `36` `TS18046` errors in `src/pages/[slug].astro`, `src/pages/articles/[slug].astro`, `src/pages/service/index.astro`, and `src/pages/services/[slug].astro`. No `TS5023` or `TS17004` errors may appear.

- [ ] **Step 3: Preserve concrete Zod schema types**

In `src/content.config.ts`, change the `collection()` signature from:

```ts
function collection(name: keyof typeof collectionRegistry, schema: z.ZodType) {
```

to:

```ts
function collection<T extends z.ZodTypeAny>(name: keyof typeof collectionRegistry, schema: T) {
```

Run `pnpm run check`.

Expected: exit `2` with exactly one `TS2339` error: `Property 'draft' does not exist` in `src/pages/[slug].astro`. All `TS18046` errors are gone.

- [ ] **Step 4: Add the missing draft field to the page schema**

In `src/content.config.ts`, change:

```ts
const pageSchema = baseEntrySchema;
```

to:

```ts
const pageSchema = baseEntrySchema.extend({
  draft: z.boolean().optional(),
});
```

Run `pnpm run check`.

Expected: exit `0`. No `error TS` lines. Glob-loader warnings for empty collections are acceptable.

- [ ] **Step 5: Verify the rest of the toolchain**

Run:

```bash
export PATH="$HOME/.local/node-v26.13.1/bin:$PATH"
pnpm run build
pnpm run typecheck
pnpm run lint
pnpm run test
```

Expected: all four commands exit `0`. `pnpm run build` reports `13 page(s) built`. `pnpm run test` reports `tests 10`, `pass 10`, `fail 0`.

- [ ] **Step 6: Inspect and commit the toolchain change**

Run:

```bash
git status --short
git diff --check
git diff -- package.json pnpm-lock.yaml tsconfig.json src/content.config.ts
git add package.json pnpm-lock.yaml tsconfig.json src/content.config.ts
git commit -m "chore: enable astro-aware typescript checking"
```

Expected: `git diff --check` exits `0`. Diff contains only the four listed files.

---

### Task 2: Update policy, report, and saved build output

**Files:**
- Modify: `docs/toolchain-policy.md`
- Modify: `docs/build-report.txt`
- Modify: `docs/build-output.txt`

**Interfaces:**
- Consumes: exact script strings and config values produced by Task 1.
- Produces: documentation reflecting TypeScript `7.1.0-beta`, mapper-based `.astro` type-checking, unchanged JS-only lint, and fresh validation evidence.

- [ ] **Step 1: Update toolchain policy**

Replace the "TypeScript policy" section of `docs/toolchain-policy.md` with bullets that state:
- TypeScript is `7.1.0-beta` as an approved beta exception.
- `@astrojs/ts-content-mapper` is `0.2.0`.
- TypeScript 6.x remains prohibited.
- `@astrojs/check` remains removed.
- `check` is `astro sync && tsc --noEmit --runExternalCode`.
- `typecheck` is `tsc --noEmit --runExternalCode`.
- `.astro` files are type-checked by `tsc` through the mapper.
- ESLint remains JavaScript-only because `typescript-eslint` rejects TypeScript 7.
- Do not add package aliases that install multiple TypeScript compiler majors.

Keep runtime, framework, CSS, and validation-requirement sections unchanged.

- [ ] **Step 2: Rewrite the build report**

Overwrite `docs/build-report.txt`. Include:
- Validation environment: Node `26.13.1`, pnpm `12.21.0`, Astro `7.4.13`, TypeScript `7.1.0-beta`, mapper `0.2.0`.
- Fresh results for `check`, `build`, `typecheck`, `lint`, and `test`, all exit `0`.
- Test result `10/10` and build result `13 pages`.
- Findings and fixes:
  - TypeScript `7.0.2` did not check `.astro` templates.
  - `collection()` used `schema: z.ZodType`, erasing schema output and causing 36 `TS18046` errors once mapper checking was enabled. Fixed with generic `T extends z.ZodTypeAny`.
  - `pageSchema` omitted `draft`, causing one `TS2339` error. Fixed with optional `draft`.
  - `contentMappers` is top-level in `tsconfig.json`; `jsx: "preserve"` and `--runExternalCode` are required.
- Limitations:
  - ESLint still checks only JavaScript files.
  - `typescript-eslint` still rejects TypeScript 7, including canary `8.73.1-alpha.7`.
  - Empty content-collection glob warnings remain non-fatal.
  - Deprecated `z.string().url()` calls remain.
- Artifact: `docs/build-output.txt` contains the saved fresh build output.

- [ ] **Step 3: Regenerate saved build output**

Run a fresh build, strip ANSI sequences and trailing whitespace, and write `docs/build-output.txt` in this exact shape:

```text
$ npm run build
<build output with ANSI codes removed>
<blank line>
exit code: 0
```

Use the Node `26.13.1` PATH export from Task 1. Do not paste output from an earlier commit.

- [ ] **Step 4: Verify documentation and unchanged lint scope**

Run:

```bash
grep -n '7.1.0-beta\|ts-content-mapper\|runExternalCode' docs/toolchain-policy.md docs/build-report.txt
grep -n 'eslint.config.js\|eslint .' package.json
grep -n 'typescript-eslint\|eslint-plugin-astro\|@typescript-eslint' package.json eslint.config.js || true
sed -n '1,5p' docs/build-output.txt
tail -2 docs/build-output.txt
```

Expected:
- First grep finds `7.1.0-beta`, `ts-content-mapper`, and `runExternalCode` in both docs.
- `package.json` still has `"lint": "eslint ."`.
- Third grep finds no TypeScript or Astro lint packages or rules.
- `docs/build-output.txt` starts with `$ npm run build` and ends with `exit code: 0`.

- [ ] **Step 5: Final validation, inspect, commit, and push**

Run:

```bash
export PATH="$HOME/.local/node-v26.13.1/bin:$PATH"
pnpm run check
pnpm run build
pnpm run typecheck
pnpm run lint
pnpm run test
git status --short
git diff --check
git diff -- docs/toolchain-policy.md docs/build-report.txt docs/build-output.txt
git add docs/toolchain-policy.md docs/build-report.txt docs/build-output.txt
git commit -m "docs: record astro-aware typescript toolchain"
```

Expected: all five validation commands exit `0`; `git diff --check` exits `0`; diff contains only the three documentation files.

Push to `main` using the repository's existing PAT helper without printing the token, then verify with:

```bash
git fetch origin
git status --short --branch
git ls-remote origin refs/heads/main
```

Expected: worktree clean, `## main...origin/main`, and `refs/heads/main` equals the new local HEAD.
