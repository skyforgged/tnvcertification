# TypeScript Single Version Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove TypeScript 6 and make Node 26, pnpm 12, Astro 7, Tailwind 4, TypeScript 7, check, lint, and build agree.

**Architecture:** Replace `astro check` with `astro sync && tsc --noEmit`, simplify ESLint to avoid the TypeScript 7 incompatibility, add direct `vite` and pnpm install policy, then fix the prerender route that still breaks build.

**Tech Stack:** Astro `7.4.13`, TypeScript `7.0.2`, Tailwind CSS `4.3.5`, Node `26.13.1`, pnpm `12.21.0`.

**Spec:** `docs/superpowers/specs/2026-11-20-typescript-single-version-design.md`

## Global Constraints

- TypeScript must be exactly `7.0.2`.
- TypeScript `6.x` must not appear in `package.json` or `pnpm-lock.yaml`.
- `@astrojs/check` must not be used.
- Node stays pinned to `26.13.1`.
- pnpm stays pinned to `12.21.0`.
- Astro stays pinned to `7.4.13`.
- Tailwind CSS and `@tailwindcss/vite` stay pinned to `4.3.5`.
- Do not use TypeScript `7.1.0-beta` or `@astrojs/ts-content-mapper`.
- Do not claim Astro-aware template type-checking.

## Review Focus

- Direct `vite` import: `vite.config.mjs` imports `vite`; pnpm strict layout must still resolve it. Covered by Task 1 `pnpm run build` and `pnpm run check`.
- ESLint startup: `typescript-eslint` must not be loaded because it throws on TypeScript 7. Covered by Task 1 `pnpm run lint`.
- pnpm 12 install: `source-map-js@1.2.4` and `esbuild` must not block install. Covered by Task 1 `pnpm install`.
- Pagination static paths: `getStaticPaths()` must not reference module-body constants. Covered by Task 2 `pnpm run build`.
- Validation honesty: final report must distinguish `tsc` checking from Astro-aware checking. Covered by Task 3 report update.

---

### Task 1: Single TypeScript toolchain

**Files:**
- Modify: `package.json`
- Modify: `eslint.config.js`
- Modify: `docs/toolchain-policy.md`
- Create: `pnpm-workspace.yaml`
- Modify: `pnpm-lock.yaml`
- Commit: `docs/superpowers/specs/2026-11-20-typescript-single-version-design.md`

**Interfaces:**
- Consumes: current `check`, `build`, `lint`, and `typecheck` scripts from `package.json`.
- Produces: `check` = `astro sync && tsc --noEmit`; TypeScript `7.0.2` only; pnpm install policy in `pnpm-workspace.yaml`.

- [ ] **Step 1: Update `package.json`**

Set `dependencies.typescript` to `7.0.2`. Remove `devDependencies.@astrojs/check`, `devDependencies.@typescript/native`, and `devDependencies.typescript-eslint`. Add `devDependencies.vite` as `8.3.8`. Change `scripts.check` to `astro sync && tsc --noEmit`. Keep `scripts.build` as `astro build`.

- [ ] **Step 2: Update `eslint.config.js`**

Remove the `typescript-eslint` import and all `tseslint.config(...)` / `tseslint.configs.recommended` usage. Export a flat config that keeps existing ignores, `js.configs.recommended` for `**/*.{js,mjs,cjs}`, globals, and `astro.configs["flat/recommended"]`. If the Astro plugin requires `tseslint.config`, use ESLint's array export instead; do not import `typescript-eslint`.

- [ ] **Step 3: Create `pnpm-workspace.yaml`**

Write exactly:

```yaml
minimumReleaseAge: 0

allowBuilds:
  esbuild: true
```

- [ ] **Step 4: Update `docs/toolchain-policy.md`**

Replace the TypeScript compatibility section with one TypeScript version policy: TypeScript `7.0.2` only, TypeScript 6 prohibited, `astro check` intentionally removed, `check` uses `astro sync && tsc --noEmit`, and `.astro` templates are not fully type-checked under this setup.

- [ ] **Step 5: Regenerate lockfile and install dependencies**

Run:

```bash
export PATH="$HOME/.local/node-v26.13.1/bin:$PATH"
pnpm install
```

Expected: exit code `0`; `pnpm-lock.yaml` updated; no `typescript@6` or `@typescript/typescript6` entries remain.

- [ ] **Step 6: Verify toolchain scripts**

Run:

```bash
export PATH="$HOME/.local/node-v26.13.1/bin:$PATH"
pnpm run check
pnpm run lint
pnpm run typecheck
```

Expected: all three exit `0`. `astro sync` content warnings are acceptable. Build may still fail from Task 2.

- [ ] **Step 7: Commit**

```bash
git add package.json eslint.config.js pnpm-workspace.yaml pnpm-lock.yaml docs/toolchain-policy.md docs/superpowers/specs/2026-11-20-typescript-single-version-design.md
git commit -m "build: use single TypeScript 7 toolchain"
```

### Task 2: Fix pagination static paths build crash

**Files:**
- Modify: `src/pages/articles/page/[page].astro`

**Interfaces:**
- Consumes: `getPublishedArticles()` from `src/data/articles.ts`.
- Produces: `getStaticPaths()` returns page params and props without referencing module-body constants.

- [ ] **Step 1: Confirm current build failure**

Run:

```bash
export PATH="$HOME/.local/node-v26.13.1/bin:$PATH"
pnpm run build > /tmp/tnv-pagination-before.log 2>&1
```

Expected: exit `1` with `pageCount is not defined`.

- [ ] **Step 2: Move pagination data into `getStaticPaths()`**

In `src/pages/articles/page/[page].astro`, compute `pageSize = 9`, `ordered = getPublishedArticles()`, and `pageCount` inside `getStaticPaths()`. Keep the generated pages for page `2..pageCount`. Pass `page`, `articles`, and `pageCount` through props. Remove module-body definitions of those constants.

- [ ] **Step 3: Verify build passes**

Run:

```bash
export PATH="$HOME/.local/node-v26.13.1/bin:$PATH"
pnpm run build
```

Expected: exit `0`; static routes generate without `pageCount is not defined`.

- [ ] **Step 4: Commit**

```bash
git add src/pages/articles/page/[page].astro
git commit -m "fix: build article pagination routes"
```

### Task 3: Final validation, report, and push

**Files:**
- Modify: `docs/build-report.txt`

**Interfaces:**
- Consumes: final results from Task 1 and Task 2.
- Produces: updated build report and pushed `main`.

- [ ] **Step 1: Run full validation**

Run:

```bash
export PATH="$HOME/.local/node-v26.13.1/bin:$PATH"
pnpm run check
pnpm run build
pnpm run typecheck
pnpm run lint
pnpm run test
```

Expected: all five commands exit `0`.

- [ ] **Step 2: Update `docs/build-report.txt`**

Replace the post-merge section with final results. Include exact tool versions, script results, removal of TypeScript 6 and `@astrojs/check`, the `pnpm-workspace.yaml` policy, the `vite` direct dependency, the pagination fix, and the caveat that `.astro` templates are not fully type-checked.

- [ ] **Step 3: Inspect diff and status**

Run:

```bash
git status --short
git diff --check
git diff --stat
```

Expected: only intended files; no whitespace errors; no untracked `node_modules` or `node_modules/vite` symlink in git status.

- [ ] **Step 4: Commit report**

```bash
git add docs/build-report.txt
git commit -m "docs: record final toolchain validation"
```

- [ ] **Step 5: Push to GitHub**

Use account `tnvcertification` and the PAT from `~/.git-pat-tnvcertification` without printing the token.

Expected: `main` pushed and verified with `git ls-remote origin refs/heads/main`.
