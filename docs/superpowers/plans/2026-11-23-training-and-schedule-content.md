# Training and Schedule Content Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish three Indonesian training programs derived from the three published certification services, plus honest schedule records that do not invent dates or operational facts.

**Architecture:** Reuse the existing Astro content collections and block system. Training detail pages gain the same `hero`-block rendering path already used by service detail pages, so editorial copy stays frontmatter-only. Schedule records that have no verified batch date are represented as explicit “jadwal menyusul” placeholders: dates become optional in the schema and both schedule surfaces render a pending label instead of a fabricated date.

**Tech Stack:** Astro content collections, Zod, TypeScript, Tailwind CSS, original SVG/WebP illustrations.

**Spec:** `AGENTS.md` and `docs/components-blocks-layouts.md`.

## Global Constraints

- Published entries must have `draft` absent or `false`; no draft content for this task.
- Intro begins with the exact title followed by `adalah`; `metaDescription` is unique; `featuredImage.alt` contains `adalah`, is title-relevant, and is shorter than the intro.
- Editorial `.md` entries contain frontmatter only; no Markdown body (CONTENT-014).
- No consultation/consulting terminology anywhere; CTA wording stays certification-focused.
- Never fabricate dates, prices, quota, venue, or registration state. The 2027 CSV template in the reference repository has empty operational cells, so it cannot be used as a data source.
- Each published page needs a unique primary image source and unique image bytes.
- FSSC 22000 copy must not imply TNCV is a licensed FSSC Certification Body or offers implementation help.

## Review Focus

- A training detail page must render one H1, one intro paragraph, and one primary image — checked by `npm run build`, `audit:headings`, and `audit:page-images`.
- A date-less schedule must never render “Invalid Date”, a fake date, or an Event schema — checked by a unit test for the schema and by preview HTML inspection.
- Training slugs must match `trainingSlug` on every schedule record — checked by the schedules archive route and manual preview.
- Each new training intro, metaDescription, and image alt must be unique and compliant — checked by build-time content validation.
- New illustrations must have unique bytes and be registered — checked by `audit:page-images` and the asset register.

---

### Task 1: Enable hero blocks and date-less schedule records in schemas

**Files:**
- Modify: `src/content.config.ts`
- Test: `tests/training-and-schedule-schema.test.mjs`

**Interfaces:**
- Produces: `collections.training.schema` accepts `hero` blocks; `collections.trainingSchedules.schema` accepts records without `startDate`/`endDate` when both are omitted.

- [ ] **Step 1: Write failing tests for both schema behaviors**
- [ ] **Step 2: Run the test file and verify it fails for the missing schema support**
- [ ] **Step 3: Change `trainingSchema.blocks` to `pageBlockSchema` and make schedule dates optional with a paired-date refinement**
- [ ] **Step 4: Run the test file and verify it passes**
- [ ] **Step 5: Run `npm test` and verify the whole suite passes**
- [ ] **Step 6: Commit**

### Task 2: Render hero-led training detail pages

**Files:**
- Modify: `src/pages/trainings/[slug].astro`
- Modify: `src/layouts/TrainingLayout.astro`
- Verify: `npm run build`, `npm run audit:headings`, `npm run audit:page-images`

**Interfaces:**
- Consumes: `hero` blocks from Task 1.
- Produces: training detail pages with exactly one `data-page-image`.

- [ ] **Step 1: Update the route to require and extract the hero block, then render all blocks with `PageBlockRenderer`**
- [ ] **Step 2: Remove the duplicate `FeaturedImage` from `TrainingLayout`**
- [ ] **Step 3: Add a minimal rendering test or build-based assertion that the hero is present**
- [ ] **Step 4: Run build and audits; confirm zero errors**
- [ ] **Step 5: Commit**

### Task 3: Add three unique training illustrations and register them

**Files:**
- Create: `assets/illustrations/source/training-iso9001-2026.svg`
- Create: `assets/illustrations/source/training-iso14001-2026.svg`
- Create: `assets/illustrations/source/training-fssc-22000.svg`
- Modify: `docs/illustration-library/asset-register.md`

**Interfaces:**
- Produces: `/images/illustrations/training-*.webp` at build time.

- [ ] **Step 1: Author three original SVGs in the repository illustration style**
- [ ] **Step 2: Register them as ILL-023–ILL-025**
- [ ] **Step 3: Run `npm run images:illustrations` and confirm all WebP files exist**
- [ ] **Step 4: Commit**

### Task 4: Add three published training entries

**Files:**
- Create: `src/content/training/pelatihan-sertifikasi-iso-9001-2026.md`
- Create: `src/content/training/pelatihan-sertifikasi-iso-14001-2026.md`
- Create: `src/content/training/pelatihan-sertifikasi-fssc-22000.md`

**Interfaces:**
- Consumes: unique illustrations from Task 3 and hero rendering from Task 2.
- Produces: slugs used by Task 5 schedule records.

- [ ] **Step 1: Write entry frontmatter with hero, content-section, howto/faq, and cta blocks**
- [ ] **Step 2: Run `npm run validate:changed` and `npm run build`; confirm zero diagnostics**
- [ ] **Step 3: Commit**

### Task 5: Add three published schedule placeholder records

**Files:**
- Create: `src/content/training-schedules/2027/iso-9001-2026/jadwal-pelatihan-iso-9001-2026.md`
- Create: `src/content/training-schedules/2027/iso-14001-2026/jadwal-pelatihan-iso-14001-2026.md`
- Create: `src/content/training-schedules/2027/fssc-22000/jadwal-pelatihan-fssc-22000.md`
- Modify: `src/pages/trainings/[slug].astro`
- Modify: `src/pages/schedules/index.astro`

**Interfaces:**
- Consumes: training slugs from Task 4 and optional-date schema from Task 1.
- Produces: schedule archive and training detail sections that say dates are pending.

- [ ] **Step 1: Add date-less schedule records linked by `trainingSlug` with explicit pending copy**
- [ ] **Step 2: Update both schedule surfaces to render a pending label when dates are absent**
- [ ] **Step 3: Add a test asserting no invalid date text appears for date-less records**
- [ ] **Step 4: Run full validation and preview the rendered pages**
- [ ] **Step 5: Commit**

### Task 6: Final verification and PR

**Files:** none beyond review fixes.

- [ ] **Step 1: Run `npm test`, `npm run check`, `npm run lint`, `npm run build`, all four audits**
- [ ] **Step 2: Review the full diff**
- [ ] **Step 3: Push the branch and open a PR to upstream `main`**
