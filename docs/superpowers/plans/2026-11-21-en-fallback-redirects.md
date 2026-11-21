# English-to-Indonesian fallback redirects Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `/en/` redirect to `/` and generate `/en/<path>/` redirect stubs for every published Indonesian route that has no real English page.

**Architecture:** A pure builder turns typed route inputs into absolute Indonesian paths. An Astro data module gathers those inputs from the existing collection queries and subtracts routes that already have English pages. A catch-all `/en/[...path].astro` renders a noindex meta-refresh stub per path, while `astro.config.mjs` handles the locale root separately because a rest parameter needs at least one segment.

**Tech Stack:** Astro 7 static build, TypeScript strict, node:test.

**Spec:** `docs/superpowers/specs/2026-11-21-en-fallback-redirects-design.md`

## Global Constraints

- `src/site.ts` is the single source of truth for canonical URLs.
- Redirect stubs are `200` + `<meta http-equiv="refresh">`, consistent with the site's existing redirects; no HTTP 301 and no vhost change.
- Real English pages (`/en/services/`, `/en/services/<en-slug>/`) must never be shadowed by a stub.
- Draft entries must never gain a fallback stub.
- No changes to content entries, `src/site.ts`, Indonesian routes, or `astro.config.mjs` beyond the single `/en/` redirect.

## Review Focus

- `/en/` currently 403s; after the change `dist/en/index.html` must exist and point to `/` — verified in Task 2 build assertions.
- `/en/services/` is a real English page; a generated stub must not replace it — verified in Task 2 build assertions (English card still present, canonical still `/en/services/`).
- A draft service/article/training must not produce a stub — unit test in Task 1.
- Pagination stubs must match the real archive (`ceil(publishedArticles / 9)` pages 2..N) — unit test in Task 1.
- Stub canonical must point to the Indonesian target and carry `noindex` — build assertion in Task 2.

---

### Task 1: Pure fallback path builder

**Files:**
- Create: `src/lib/locale-fallback.ts`
- Test: `tests/en-fallback.test.mjs`

**Interfaces:**
- Produces: `buildEnglishFallbackPaths(data: FallbackRouteSet): string[]`
- Produces: `type FallbackRoute = { slug: string; draft?: boolean; lang?: string }`
- Produces: `type FallbackRouteSet = { pages: readonly FallbackRoute[]; services: readonly FallbackRoute[]; articles: readonly FallbackRoute[]; trainings: readonly FallbackRoute[]; articlePageCount: number; existingEnglishPaths: readonly string[] }`
- `existingEnglishPaths` contains absolute English paths such as `/en/services/`.

- [ ] **Step 1: Write failing tests** in `tests/en-fallback.test.mjs` asserting:
  - static indices `/services/`, `/trainings/`, `/schedules/`, `/articles/`, `/csms/` are returned;
  - pages produce `/about-us/`; services produce `/services/<slug>/`; articles `/articles/<slug>/`; trainings `/trainings/<slug>/`;
  - `/articles/page/2/` and `/articles/page/3/` are returned for `articlePageCount: 3`, and `/articles/page/1/` is not;
  - `{ draft: true }` and `{ lang: "en" }` entries are excluded;
  - a path listed in `existingEnglishPaths` (e.g. `/en/services/`) is excluded;
  - every result starts with `/`, ends with `/`, and contains no `/en/` segment.
- [ ] **Step 2:** Run `npm run test` and confirm the new tests fail because the module is missing.
- [ ] **Step 3:** Implement `src/lib/locale-fallback.ts` with `buildEnglishFallbackPaths` and the two exported types. Build paths from the five static indices plus the four entry lists plus pagination; filter drafts, `lang === "en"`, and paths whose `/en`-prefixed form appears in `existingEnglishPaths`; dedupe and sort.
- [ ] **Step 4:** Run `npm run test`; all tests pass.
- [ ] **Step 5:** Commit `src/lib/locale-fallback.ts` and `tests/en-fallback.test.mjs`.

### Task 2: Astro data module, catch-all page, and locale-root redirect

**Files:**
- Create: `src/data/locale-fallback.ts`
- Create: `src/pages/en/[...path].astro`
- Modify: `astro.config.mjs:19-23`

**Interfaces:**
- Consumes: `buildEnglishFallbackPaths`, `FallbackRoute` from Task 1.
- Consumes: `getPublishedArticles()` from `src/data/articles.ts`, `getPublishedServices(lang)` from `src/data/services.ts`.
- Produces: `getEnglishFallbackPaths(): Promise<string[]>` used by the catch-all page.

- [ ] **Step 1:** Create `src/data/locale-fallback.ts`. Gather published `pages` and `training` via `getCollection` using the same filters their real pages use (`draft !== true`), map entries to `FallbackRoute` via `entry.data`, call `getPublishedServices("id")` for services, `getPublishedArticles()` for articles and `articlePageCount = Math.ceil(articles.length / 9)`, and set `existingEnglishPaths` to `["/en/services/", ...getPublishedServices("en").map(s => `/en/services/${s.data.slug}/`)]`. Return `buildEnglishFallbackPaths(...)`.
- [ ] **Step 2:** Create `src/pages/en/[...path].astro`. `getStaticPaths` maps each path from `getEnglishFallbackPaths()` to `params: { path: target.slice(1, -1) }` and `props: { target }`. Render a minimal noindex redirect stub with `<meta http-equiv="refresh" content={"0;url=" + target}>`, canonical `new URL(target, siteSettings.url).toString()`, `lang="id"`, and one visible anchor linking to the target.
- [ ] **Step 3:** Add `"/en/": "/"` to the `redirects` object in `astro.config.mjs`, keeping the three existing entries unchanged.
- [ ] **Step 4:** Run `npm run check` and `npm run build`. Assert in `dist/`: `dist/en/index.html` exists and contains `url=/`; `dist/en/services/index.html` still contains the English service card and canonical `/en/services/`; `dist/en/about-us/index.html` exists with canonical pointing to `/about-us/`; `dist/en/services/sertifikasi-iso-9001-2026/index.html` exists with canonical `/services/sertifikasi-iso-9001-2026/`; no stub file contains an English service card.
- [ ] **Step 5:** Commit the three files.

### Task 3: Full validation

- [ ] **Step 1:** Run `npm run check`, `npm run test`, `npm run build`, `npm run lint`, `npm run audit:seo`.
- [ ] **Step 2:** Request `http://tnvcertification.lan/en/`, `/en/about-us/`, `/en/services/`, and `/en/services/sertifikasi-iso-9001-2026/` with curl; confirm the 403 is gone, stubs return 200 with the refresh meta tag, and `/en/services/` remains the English index.
- [ ] **Step 3:** Commit any validation-driven fix in a focused follow-up commit.
