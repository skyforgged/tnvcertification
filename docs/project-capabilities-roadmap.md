# Project Capabilities & Skill Roadmap

Work in progress checklist of the capabilities (plugins/skills/artifacts) we need to prepare before the PT. Intiprima Sertifikasi website can be built and delivered. Organized by subsystem, with what each needs and a recommended build order.

## 1) Stack & project setup
- Astro 7+ stable skeleton.
- TypeScript 7+ stable with strict mode enabled.
- Tailwind CSS latest stable compatible with the chosen Astro/TypeScript versions.
- Config: `tsconfig.json`, `vite.config.*`, `astro.config.*`, ESLint, `astro check`/typecheck script, path alias for `@/*`.
- Version control workflow per `docs/git-workflow.md` (commit directly to `main`; no feature branches unless asked).

## 2) Content layer
### 2.1 Site identity (SSOT)
- `site.ts` (or equivalent central config) holding Organization identity, company/contact details, addresses, shared site settings.
- Never hardcode company/site-wide info in components, pages, layouts, navigation, footer, SEO metadata, CTAs, or contact sections; read it from `site.ts`.

### 2.2 Content collections (separate, typed)
- `certifications` collection.
- `training` collection.
- `training-schedules` collection.
- `articles` collection.
- `pages` collection.
- One dedicated TypeScript schema per collection using Astro Content Collections + Zod.
- Frontmatter metadata (dates, slugs, IDs, draft status, image fields, service/taxonomy references) validated per type.
- Image object schema shared across collections: `featuredImage` (single, required) and optional `images` array. `featuredImage` is never an array.

### 2.3 Shared block schemas (discriminated, not permissive)
- `faq`: question/answer items.
- `how-to`: ordered procedural steps with optional titles, descriptions, images, links.
- `cta`: validated variant + title/description + button/link config.
- Each shared block type must be schema-validated by discriminated block type and optional within collections.
- Blocks stay optional and orderable where block arrays are used.

## 3) Build-time validation (mandatory; fails the build)
### 3.1 Editorial content rules
- `CONTENT-001`: H1 exists.
- `CONTENT-002`: exactly one intro paragraph immediately after H1.
- `CONTENT-003`: intro is non-empty and starts with the page title followed by `adalah`.
- `CONTENT-004`: intro explains the title and is not generic/reused across unrelated content.
- `CONTENT-005`: `metaDescription` is present and non-empty.
- `CONTENT-006`: `metaDescription` is unique and is not an exact duplicate of intro or image alt.
- `CONTENT-007`: exactly one `featuredImage` object exists.
- `CONTENT-008`: `featuredImage.alt` is non-empty, title-relevant, and uses `adalah`.
- `CONTENT-009`: `featuredImage.alt` is shorter than intro.
- `CONTENT-010`: optional `images`, when supplied, is a valid array of image objects.

### 3.2 Heading hierarchy
- `CONTENT-011`: semantic heading levels must not skip (e.g. H1 cannot be followed directly by H3/H4; H2 cannot be followed directly by H4).
- Validate from parsed Markdown/content AST or rendered document structure, not raw-text matching.

### 3.3 Report format
- Diagnostics include: content entry/path, field, rule identifier, and reason.
- Violations are hard build errors with non-zero exit status.

## 3.4 Build-time editorial validation gate

Implemented as an Astro integration (`src/content-validation.ts`) that runs on
the `astro:build:done` hook. It reads the published `.md` files straight off the
filesystem (via `tinyglobby` + `yaml` parse; the content store is not reliably
populated inside `astro:build:done`, so `getCollection()` cannot be used for this
gate) and enforces the editorial rules in 3.1–3.2, returning actionable
diagnostics that make the build fail.

Files:
- `src/lib/content-validation.ts` — rule logic (CONTENT-001..011) and cross-entry
  checks (intro reuse, metaDescription uniqueness).
- `src/content-validation.ts` — Astro integration: globbing `src/content/{articles,
  certifications, training, training-schedules, pages}/**/*.md`, parsing frontmatter
  with `yaml`, running `validateAllEntries`, throwing on any violation.

Verified behavior: a build with an invalid entry fails with diagnostics such as
`[CONTENT-003] articles → src/content/articles/0010-audit-tmp.md → body: Intro must
begin with the page title followed by "adalah"…`.

### 3.5 Current content review findings (before/after the gate)
Running the gate against the existing content surfaced the following editorial-rule
violations that were previously hidden by the content-layer schema:

- CONTENT-006 (metaDescription duplicated): `articles → 0007`, `0009` share the same
  `metaDescription` as `0002` (all three carry the identical SEO summary).
- CONTENT-009 (featuredImage.alt too long): `articles → 0008` `featuredImage.alt` is
  the same length as its intro (rule: alt must be shorter).
- CONTENT-004 (intro reused): `articles → 0009` intro duplicates `0002` (0009 is a
  duplicate entry; its slug also clashes with 0002's `sertifikasi-iso-9001-2015`).
- (Test artifact `0010-audit-tmp.md` was added to prove the gate and removed.)

Fixing these content issues is a content-curation decision and is not performed
automatically here; the gate is left failing until the frontmatter/body are corrected.

## 4) Structured data (JSON-LD)
### 4.1 Canonical Organization
- Declare Organization once from `site.ts`; reference it by `@id` on other entities. Do not duplicate company identity.

### 4.2 Per-entity graphs
- Service pages: `Service` (+ `WebPage` + `BreadcrumbList`); `FAQPage` only when valid FAQ is actually rendered; `HowTo` only for genuinely instructional visible procedures.
- Service entity fields: `@id` (`canonical URL + #service`), `name`, `description`, `url`, `image`, `serviceType`, `category` (when present), `provider` referencing canonical Organization `@id`, `areaServed` only when supported by config/content.
- Service index `/service/`: `CollectionPage`, `ItemList`, `BreadcrumbList` as appropriate.
- Training pages: `Course` when content genuinely represents a course/program.
- Schedules: `Event` only for real event instances with accurate details (dates/location/delivery from canonical metadata only).
- Articles: `Article`/`BlogPosting`.
- Serialization: validate, escape, avoid duplicates; omit unsupported optional fields; never fabricate claims, times, dates, prices, locations, or relationships.

## 5) SEO & technical
- Common SEO layout: unique title, `metaDescription`, canonical URL, robots directives, Open Graph, applicable Twitter/X cards, hreflang alternates for translations.
- Sitemap XML with `lastmod` sourced from actual content metadata (not build/deploy timestamps).
- `robots.txt`.
- Canonical URLs and reciprocal hreflang links.
- Avoid broken internal links and duplicate content.

## 6) Article discovery & pagination (shared logic, not duplicated)
- Shared sorted article dataset: effective update date descending (`updatedDate`, falling back to `pubDate`), then `pubDate DESC`, then stable article ID/slug ascending.
- Only published, valid articles are eligible.
- Homepage (`/`): **Artikel Terbaru** section before the footer, first 3 articles (global ranks 1-3).
- Service index (`/service/`): **Artikel Terbaru** section, global ranks 4-6 (does not repeat ranks 1-3).
- Service detail (`/services/<slug>`): **Artikel Terkait** filtered to articles whose explicit `serviceId` matches the canonical service ID, sorted by `updatedDate DESC`.
- Shared data/query logic for the sort/filter rules so homepage and service-index windows stay consistent.

### 6.1 Archive listing
- `/articles/`: published valid articles as cards, responsive grid 3 columns desktop / 2 tablet / 1 mobile.
- Page size 9 articles per page.
- Card shows: `featuredImage`, category when available, title, intro/excerpt, updated date, link.
- Pagination dynamic from eligible article count; first page canonical `/articles/`; subsequent pages `/articles/page/N`.
- Crawlable anchor pagination (Previous, page numbers, Next) with current page marked for assistive tech; Previous omitted on first page, Next omitted on last.
- Page-specific metadata/canonical handling (do not canonicalize every page to the archive root).

\n### 6.2 Route implementation status (2026-11-20)\n\n- Implemented static article detail routes at `/articles/<slug>/`.\n- Implemented article archive at `/articles/` and paginated routes at `/articles/page/<N>/` (9 entries per page).\n- Implemented content-driven general-page routes from the `pages` collection (for example, the current about-page slug).\n- Archive pages use the shared `getPublishedArticles()` ordering/filtering logic; page 1 and subsequent pages use the same eligible dataset.\n- Build/typecheck still needs to be run against these newly committed route files before marking the routes fully verified.\n\n## 7) Design system & UI
- CSS custom properties for design tokens.
- Vibrant, high-saturation palette: electric blue, vivid orange/coral, sunshine yellow, fresh mint, warm cream/white. Use sparingly for clear roles, not noise.
- Intentional typography, spacing, composition, visual hierarchy. Avoid pastel corporate styling, generic SaaS/AI landing pages, excessive gradients/glows, glassmorphism, repetitive card grids.
- Semantic HTML, accessible labels, keyboard navigation, clear interactive affordances, focus states, adequate contrast.
- Responsive layout that preserves composition across breakpoints.

## 8) Rendering components (typed props, no global state)
- One layout per page purpose (certification, training, training page, schedule, article, service index, archive).
- Shared block components: FAQ accordion, HowTo, CTA.
- Image handling and responsive optimization.
- Contextual footer (default + service-contextual), resolved from service data or `serviceId` on articles with fallback to default footer.

## 9) Quality gates
- TypeScript strict typecheck.
- ESLint.
- Astro build smoke test.
- Validation suite must pass before a feature is considered done.
