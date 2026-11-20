# Node 22 + Review Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Astro skeleton build on Node 22 with pnpm and close every Standards/Spec finding from commit `4661a15`.

**Architecture:** Toolchain first, then content/gate, then presentation/SEO. Each task leaves the build green. Shared schemas and one collection registry remove duplicated metadata rules. `site.ts` stays the only source of company identity.

**Tech Stack:** Astro `7.4.13`, TypeScript `7.0.2`, Tailwind `4.0.0`, pnpm, ESLint 10, Prettier, Node `22.23.4`.

**Spec:** `docs/superpowers/specs/2026-11-20-node22-and-review-fixes-design.md`

## Global Constraints

- Node.js `>=22.23.4`. Pin `.nvmrc` and `.node-version` to `22.23.4`.
- Astro `7.4.13`; TypeScript `7.0.2`; Tailwind `4.0.0`. Pin exact versions.
- Use pnpm per `docs/technology-stack.md:8,17`. Replace `package-lock.json` with `pnpm-lock.yaml`.
- `src/site.ts` is SSOT. No company/site-wide hardcoding in pages, layouts, SEO, CTAs.
- Mandatory content rules CONTENT-001..011 are hard build failures.
- Heading hierarchy validation uses parsed Markdown AST or rendered structure, never raw regex.
- Commit directly to `main`. No branches, no PRs.

## Review Focus

- Content with `H1 → H3` skip must fail with rule id, heading text, and expected level. Test in Task 3.
- Entry with duplicate `metaDescription`, reused intro, or duplicate slug must fail. Test in Task 3.
- `featuredImage.alt` identical to intro or too long must fail. Test in Task 3.
- Missing or multi-paragraph `intro` field must fail. Test in Task 3.
- `/` must render; empty `<title>` from `organization.title` must never ship. Test in Task 6.

---

### Task 1: Node 22 + pnpm toolchain

**Files:**
- Create: `.nvmrc`, `.node-version`
- Modify: `package.json`, `docs/technology-stack.md`, `README.md`
- Delete: `package-lock.json`
- Create: `pnpm-lock.yaml`

**Interfaces:**
- Consumes: existing `package.json` scripts.
- Produces: `packageManager: "pnpm@10.15.0"`; scripts `dev`, `build`, `typecheck`, `lint`, `check`, `test`, `preview`, `format`.

- [ ] **Step 1: Install Node 22.23.4 locally**

Download official Linux x64 tarball, verify checksum, extract to `/opt/node-v22.23.4`. Use `/opt/node-v22.23.4/bin` first in PATH for every later command.

Run:
```bash
/opt/node-v22.23.4/bin/node -v
```
Expected: `v22.23.4`.

- [ ] **Step 2: Add version pins**

Write `22.23.4` to `.nvmrc` and `.node-version`. Keep `engines.node` as `>=22.23.4`.

- [ ] **Step 3: Switch to pnpm**

Enable Corepack from Node 22, set `packageManager` in `package.json`, delete `package-lock.json`, run `corepack pnpm install`, commit `pnpm-lock.yaml`.

Run:
```bash
/opt/node-v22.23.4/bin/corepack pnpm install
```
Expected: `node_modules` present, `pnpm-lock.yaml` created.

- [ ] **Step 4: Pin exact dependency versions**

Replace all `^` ranges in `dependencies` and `devDependencies` with exact resolved versions. Add `tinyglobby` and `yaml` as direct dependencies.

- [ ] **Step 5: Add scripts**

Add `check: "astro check"`, `test: "node --test tests/**/*.test.mjs"`, `format: "prettier --write ."`. Keep existing scripts.

- [ ] **Step 6: Verify build**

Run:
```bash
/opt/node-v22.23.4/bin/corepack pnpm run build
```
Expected: exit 0. Gate may still fail on content; note but do not bypass.

- [ ] **Step 7: Commit**

```bash
git add .nvmrc .node-version package.json pnpm-lock.yaml docs/technology-stack.md README.md
git rm --cached package-lock.json || true
git commit -m "build: pin node 22 and pnpm toolchain"
```

---

### Task 2: Code quality config

**Files:**
- Create: `eslint.config.mjs`, `vite.config.mjs`, `tests/.gitkeep`
- Modify: `tsconfig.json`, `tsconfig.node.json`, `package.json`

**Interfaces:**
- Consumes: pnpm scripts from Task 1.
- Produces: `@/*` alias resolving to `src/*`; ESLint 10 flat config; `pnpm run lint` and `pnpm run check` green.

- [ ] **Step 1: Add `@/*` alias**

In `tsconfig.json` set `baseUrl: "."` and `paths: { "@/*": ["src/*"] }`. Mirror in `tsconfig.node.json` where needed.

- [ ] **Step 2: Add ESLint flat config**

Create `eslint.config.mjs` using `@eslint/js`, `typescript-eslint`, and `eslint-plugin-astro`. Ignore `dist/`, `.astro/`, `node_modules/`. Do not lint lockfiles.

- [ ] **Step 3: Add Vite config**

Create `vite.config.mjs` that registers `@tailwindcss/vite`. Keep `astro.config.mjs` free of duplicated plugin setup.

- [ ] **Step 4: Install config dependencies**

Add exact versions of `@eslint/js`, `typescript-eslint`, `eslint-plugin-astro`.

- [ ] **Step 5: Verify**

Run:
```bash
corepack pnpm run lint
corepack pnpm run check
```
Expected: both exit 0.

- [ ] **Step 6: Commit**

```bash
git add eslint.config.mjs vite.config.mjs tsconfig.json tsconfig.node.json package.json pnpm-lock.yaml tests/.gitkeep
git commit -m "chore: add eslint, astro check, and path alias"
```

---

### Task 3: Editorial gate with AST

**Files:**
- Modify: `src/lib/content-validation.ts`, `src/content-validation.ts`, `src/content.config.ts`
- Create: `tests/content-validation.test.mjs`, `tests/fixtures/heading-skip.md`, `tests/fixtures/duplicate-meta.md`, `tests/fixtures/bad-alt.md`, `tests/fixtures/missing-intro.md`

**Interfaces:**
- Consumes: direct deps `tinyglobby`, `yaml` from Task 1.
- Produces: `parseContent(body: string): { headings: Heading[]; intro: string | null }`; `validateEntry(entry: ContentEntryLike): Diagnostic[]`; `validateAllEntries(entries: ContentEntryLike[]): Diagnostic[]`.
- `Diagnostic` includes `entry`, `path`, `field`, `rule`, `reason`, optional `headingText`, `expectedLevel`.

- [ ] **Step 1: Write failing AST tests**

`tests/content-validation.test.mjs` imports from `../src/lib/content-validation.ts` via `tsx` loader. Assert:
- H1→H3 fixture yields `CONTENT-011` with `headingText: "Subheading"` and `expectedLevel: 2`.
- Duplicate meta fixture yields `CONTENT-006`.
- Alt equal to intro yields `CONTENT-006` and `CONTENT-009`.
- Missing `intro` field yields `CONTENT-002`.
- Multi-paragraph intro yields `CONTENT-002`.

- [ ] **Step 2: Run tests to verify failure**

Run:
```bash
corepack pnpm exec tsx --test tests/content-validation.test.mjs
```
Expected: FAIL because AST parser not implemented.

- [ ] **Step 3: Implement AST parser**

Use `remark-parse` + `unist-util-visit`, or Astro's Markdown AST API. Collect headings from AST nodes. Extract intro as exactly the first paragraph node immediately after the first H1. Do not use line regex.

- [ ] **Step 4: Add separate `intro` field**

Add required `intro: z.string().min(1)` to article and page schemas. Rule CONTENT-002 validates the field and the rendered first paragraph agree.

- [ ] **Step 5: Enforce CONTENT-006 fully**

Compare `metaDescription` against intro and `featuredImage.alt` across all entries. Compare `featuredImage.alt` against intro and title. Emit both rule ids where applicable.

- [ ] **Step 6: Enrich diagnostics**

Add `headingText` and `expectedLevel` for `CONTENT-011`; keep `entry/path`, `field`, `rule`, `reason`.

- [ ] **Step 7: Run tests**

Run:
```bash
corepack pnpm exec tsx --test tests/content-validation.test.mjs
```
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/lib/content-validation.ts src/content-validation.ts src/content.config.ts tests
git commit -m "fix: validate content from markdown AST"
```

---

### Task 4: Content curation

**Files:**
- Modify: `src/content/articles/0002-sertifikasi-iso-9001-2015.md`, `0007-...md`, `0008-...md`, `0009-...md`
- Modify: all article/page files missing `intro`

**Interfaces:**
- Consumes: required `intro` field from Task 3.
- Produces: zero editorial diagnostics for existing content.

- [ ] **Step 1: Run gate on current content**

Run:
```bash
corepack pnpm run build
```
Expected: FAIL listing duplicate intro/meta/slug and alt violations.

- [ ] **Step 2: Rewrite duplicate articles**

Give `0007` and `0009` unique titles, slugs, `intro`, `metaDescription`, and `featuredImage.alt` tied to their actual topic. Keep `0002` unchanged where valid.

- [ ] **Step 3: Fix `0008` alt**

Shorten `featuredImage.alt`; use `adalah`; ensure shorter than intro and not identical.

- [ ] **Step 4: Add `intro` to all entries**

Add one paragraph per entry, beginning with exact title + `adalah`.

- [ ] **Step 5: Verify gate**

Run:
```bash
corepack pnpm run build
```
Expected: exit 0 with no CONTENT-* diagnostics.

- [ ] **Step 6: Commit**

```bash
git add src/content
git commit -m "fix: correct editorial content violations"
```

---

### Task 5: Collections and schemas

**Files:**
- Create: `src/data/collections.ts`, `src/content/services/.gitkeep`, `src/content/categories/.gitkeep`
- Modify: `src/content.config.ts`, `src/content/training-schedules/*` schema use

**Interfaces:**
- Consumes: one shared metadata schema shape.
- Produces: `collectionRegistry` single source; `serviceSchema`, `categorySchema`; `trainingScheduleSchema.serviceSlug` optional.

- [ ] **Step 1: Extract shared metadata schema**

Create `baseEntrySchema` with `title`, `slug`, `metaDescription`, `pubDate`, `updatedDate`, `featuredImage`, `images`, `lang`, `translationKey`. Spread it into all collection schemas.

- [ ] **Step 2: Add `services` and `categories` collections**

Define type-specific schemas. Keep `serviceId` explicit and optional in articles; never infer from labels.

- [ ] **Step 3: Add `serviceSlug` to schedules**

Add optional `serviceSlug: z.string().optional()` to `trainingScheduleSchema`.

- [ ] **Step 4: Single registry**

Export `collectionRegistry` from `src/data/collections.ts`; consume it in `content.config.ts` and `content-validation.ts` for glob paths.

- [ ] **Step 5: Verify**

Run:
```bash
corepack pnpm run check
corepack pnpm run build
```
Expected: both exit 0.

- [ ] **Step 6: Commit**

```bash
git add src/data src/content.config.ts src/content-validation.ts src/content
git commit -m "refactor: unify collection schemas and registry"
```

---

### Task 6: Homepage and semantic fixes

**Files:**
- Rename: `src/pages/Index.astro` → `src/pages/index.astro`
- Modify: `src/pages/index.astro`, `src/layouts/Layout.astro`, `src/styles/global.css`

**Interfaces:**
- Consumes: `siteSettings`, `organization` from `src/site.ts`.
- Produces: route `/`; typed `LayoutProps`; correct title/description.

- [ ] **Step 1: Rename route**

Rename `Index.astro` to `index.astro`.

- [ ] **Step 2: Fix SSOT access**

In `index.astro` and `Layout.astro`, use `siteSettings.title` and `siteSettings.description`. Remove all `organization.title` references.

- [ ] **Step 3: Typed props**

Define `LayoutProps` with `title`, `description`, `lang`, `canonical`, `ogImage` optional. No import of page types into layout.

- [ ] **Step 4: Semantic markup**

Replace `className` with `class`. Replace `bg-brand-cream` with `bg-cream`. Keep token from `global.css`.

- [ ] **Step 5: Verify route**

Run:
```bash
corepack pnpm run build
test -f dist/index.html && grep -q '<title>PT. Intiprima Sertifikasi</title>' dist/index.html
```
Expected: build green, file exists, title matches.

- [ ] **Step 6: Commit**

```bash
git add src/pages src/layouts src/styles
git commit -m "fix: render homepage and use SSOT metadata"
```

---

### Task 7: SEO and technical metadata

**Files:**
- Create: `src/lib/seo.ts`, `src/pages/robots.txt.ts`, `src/lib/structured-data.ts`
- Modify: `astro.config.mjs`, `src/layouts/Layout.astro`, `src/site.ts`

**Interfaces:**
- Consumes: `siteSettings`, `organization`, `LayoutProps`.
- Produces: `buildSeo(props): SeoMeta`; canonical/OG/hreflang; `Organization` JSON-LD `@id`.

- [ ] **Step 1: Centralize site URL**

Move canonical URL into `site.ts` as `siteSettings.url`. Import it in `astro.config.mjs`. No duplicate literal.

- [ ] **Step 2: Build SEO meta**

Implement `buildSeo` returning title, description, canonical, robots, Open Graph, Twitter card, hreflang alternates.

- [ ] **Step 3: Add JSON-LD**

Define canonical `Organization` once from `site.ts`. Emit only supported visible data. No fabricated fields.

- [ ] **Step 4: Add `robots.txt`**

Generate from `siteSettings.url`; allow all, point to sitemap.

- [ ] **Step 5: Add sitemap integration**

Use `@astrojs/sitemap` with `lastmod` from content `updatedDate`/`pubDate` only.

- [ ] **Step 6: Verify**

Run:
```bash
corepack pnpm run build
test -f dist/robots.txt && test -f dist/sitemap-index.xml
```
Expected: files exist, no hardcoded URL outside `site.ts`.

- [ ] **Step 7: Commit**

```bash
git add src/lib src/pages/robots.txt.ts src/layouts astro.config.mjs src/site.ts package.json pnpm-lock.yaml
git commit -m "feat: add canonical SEO metadata and structured data"
```

---

### Task 8: i18n, layouts, blocks, article sections

**Files:**
- Create: `src/layouts/ServiceLayout.astro`, `src/layouts/ArticleLayout.astro`, `src/layouts/ScheduleLayout.astro`, `src/components/BlockRenderer.astro`, `src/components/ArticleCard.astro`
- Create: `src/data/articles.ts`
- Modify: `src/pages/index.astro`, `src/content.config.ts`, `src/layouts/Layout.astro`

**Interfaces:**
- Consumes: `collectionRegistry`, `baseEntrySchema`, `buildSeo`.
- Produces: `getPublishedArticles(): Article[]` sorted by effective update date; rank windows for homepage/service index.

- [ ] **Step 1: Add translation keys**

Require `translationKey` in all schemas. Derive `hreflang` from it. Keep `lang` values `id`/`en`.

- [ ] **Step 2: Shared article dataset**

Implement `getPublishedArticles()` with sort: effective update date DESC (`updatedDate` ?? `pubDate`), then `pubDate DESC`, then id/slug ASC. Filter draft/invalid entries.

- [ ] **Step 3: Article sections**

Homepage renders ranks 1–3 as **Artikel Terbaru** before footer. Service index will consume ranks 4–6 via the same function.

- [ ] **Step 4: Per-purpose layouts**

Add minimal Service/Article/Schedule layouts. Do not flatten their differences into one layout.

- [ ] **Step 5: Block components**

Add discriminated FAQ, HowTo, CTA rendering. Only render blocks present in content.

- [ ] **Step 6: Verify**

Run:
```bash
corepack pnpm run check
corepack pnpm run build
```
Expected: exit 0; homepage contains `Artikel Terbaru` with 3 cards.

- [ ] **Step 7: Commit**

```bash
git add src
git commit -m "feat: add i18n layouts, blocks, and article sections"
```

---

### Task 9: Final verification

**Files:** none

**Interfaces:**
- Consumes: all previous tasks.
- Produces: green checks and clean working tree.

- [ ] **Step 1: Run full checks**

```bash
corepack pnpm run lint
corepack pnpm run check
corepack pnpm run test
corepack pnpm run build
```
Expected: all exit 0.

- [ ] **Step 2: Inspect diff**

```bash
git log --oneline -10
git status --short
```
Expected: clean tree; commits on `main`.

- [ ] **Step 3: Report**

Summarize changed files, checks run, and commit hashes.
