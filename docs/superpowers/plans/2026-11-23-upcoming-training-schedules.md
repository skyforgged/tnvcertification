# Upcoming training schedules on `/trainings/` Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the 3 training programs with the 14 unique IAS Internal Auditor programs, generate their 2027 schedules, and show the 12 nearest upcoming sessions in DESC order on `/trainings/`.

**Architecture:** Editorial copy stays in `src/content/pages/`; the route resolves published training and schedule collections, filters through one shared selector, and passes plain view items to a presentational Astro component. Schedules are date-only content records validated by the existing Zod collection schema.

**Tech Stack:** Astro 7.4.13, TypeScript strict, Zod via `astro/zod`, Tailwind 4.3.5, Node test runner with `tsx`.

**Spec:** `docs/superpowers/specs/2026-11-23-upcoming-training-schedules-design.md`

## Global Constraints

- `site.ts` is the single source of truth for company identity, contact details, navigation, and shared settings; components must not hardcode them.
- Page copy lives in `src/content/pages/*.md`; `.astro` files must not own editorial page copy.
- Editorial entries contain frontmatter blocks only and no Markdown body (CONTENT-014).
- Every publishable entry: intro begins with the title followed by `adalah ...`; unique `metaDescription`; exactly one `featuredImage` whose `alt` uses `adalah` and is shorter than the intro.
- Heading levels must progress without skipping, validated from rendered/frontmatter document structure.
- ZERO CONSULTATION: no `konsult*` / `consult*` wording anywhere in public-facing copy.
- A schedule must reference its training; `serviceSlug` is optional and explicit.
- No invented venue, price, quota, or registration state.
- Dates are `YYYY-MM-DD`, compared in UTC at build time.
- Do not run `pnpm install` in this worktree. Use `PATH=/home/aapanel/.nvm/versions/node/v26.13.1/bin:$PATH`.

## Review Focus

- **A cancelled or date-less schedule sneaks into the upcoming block** → Task 2 selector tests assert both are dropped.
- **A past schedule remains after a rebuild boundary** → Task 2 test uses `today = "2027-01-13"` and excludes `2027-01-12`.
- **The 12-session window is selected wrongly (farthest instead of nearest)** → Task 2 test asserts the kept set is the 12 soonest before DESC display.
- **A training without a published ID entry leaks a schedule** → Task 3 route filters by `trainingBySlug`; Task 3 source test asserts the filter exists.
- **Duplicate IAS menu item creates a 15th training or 360 schedules** → Task 4 catalogue test asserts exactly 14 unique slugs; Task 5 coverage test asserts 14 × 24 files.
- **Reversed date range (`endDate < startDate`)** → Task 1 schema test asserts rejection.

---

### Task 1: Typed block schema and validation

**Files:**
- Modify: `src/content.config.ts` (after `listingBlock`, line ~125; in `pageBlockSchema`, line ~140; in `trainingScheduleSchema.superRefine`, line ~263)
- Modify: `src/data/pages.ts` (after `ListingBlock`, line ~13)
- Modify: `src/lib/content-validation.ts` (line ~122)
- Test: `tests/page-block-schema.test.mjs`, `tests/training-and-schedule-schema.test.mjs`, `tests/content-validation.test.mjs`

**Interfaces:**
- Produces: `UpcomingSchedulesBlock` exported from `src/data/pages.ts` with `type: "upcoming-schedules"`, `id?`, `surface?`, `eyebrow?`, `title`, `description?`, `emptyTitle?`, `emptyDescription?`.

- [ ] **Step 1: Write the failing block-schema test**

In `tests/page-block-schema.test.mjs`, add `upcoming-schedules` to the block-type list and assert `pageBlockSchema` is still a discriminated union.

- [ ] **Step 2: Write the failing reversed-date test**

In `tests/training-and-schedule-schema.test.mjs`, assert `collections.trainingSchedules.schema.safeParse({ ...scheduleInput, startDate: "2027-03-10", endDate: "2027-03-01" }).success === false`.

- [ ] **Step 3: Write the failing heading-structure test**

In `tests/content-validation.test.mjs`, pass `parseFrontmatterContent({ lang: "id", blocks: [{ type: "hero", title: "H1", description: "..." }, { type: "upcoming-schedules", title: "H2" }] })` and assert the second heading is level 2.

- [ ] **Step 4: Run the tests to verify they fail**

Run: `PATH=/home/aapanel/.nvm/versions/node/v26.13.1/bin:$PATH npm test`
Expected: the three new assertions fail; existing tests pass.

- [ ] **Step 5: Implement the schema and validation changes**

- Add `upcomingSchedulesBlock` to `src/content.config.ts` using the shared `sectionSurfaceSchema` and `blockIdSchema`, and add it to `pageBlockSchema`.
- Extend `trainingScheduleSchema.superRefine` with an `endDate < startDate` issue (in addition to the existing paired-dates rule).
- Export `UpcomingSchedulesBlock` from `src/data/pages.ts`.
- Add `type === "upcoming-schedules"` to the `listing || contact` H2 branch in `src/lib/content-validation.ts`.

- [ ] **Step 6: Run the tests to verify they pass**

Run: `PATH=/home/aapanel/.nvm/versions/node/v26.13.1/bin:$PATH npm test`
Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add src/content.config.ts src/data/pages.ts src/lib/content-validation.ts tests/page-block-schema.test.mjs tests/training-and-schedule-schema.test.mjs tests/content-validation.test.mjs
git commit -m "feat: add upcoming-schedules block schema and date validation"
```

---

### Task 2: Shared upcoming-session selector and date label

**Files:**
- Modify: `src/lib/schedule-display.ts`
- Test: `tests/schedule-display.test.mjs`

**Interfaces:**
- Consumes: entries shaped `{ data: { slug: string; startDate?: string; registrationStatus?: "open" | "closed" | "full" | "cancelled" } }`.
- Produces: `selectUpcomingSchedules<T extends ScheduleSortItem>(items: T[], today: string, limit: number): T[]`.

- [ ] **Step 1: Write the failing selector tests**

In `tests/schedule-display.test.mjs`, import `selectUpcomingSchedules` and assert, with `today = "2027-01-13"` and `limit = 3`:

- an item dated `2027-01-13` is included (today counts as upcoming);
- items dated `2027-01-12`, without `startDate`, and with `registrationStatus: "cancelled"` are excluded;
- given six dated items from `2027-01-13` to `2027-03-10`, the result is the three soonest, reordered `2027-02-10`, `2027-01-27`, `2027-01-13` (DESC);
- ties on `startDate` break by `slug` ascending;
- `limit` larger than the input returns all remaining items.

- [ ] **Step 2: Write the failing same-day label test**

Assert `scheduleDateLabel("2027-01-13", "2027-01-13")` returns one formatted date with no `–`.

- [ ] **Step 3: Run the tests to verify they fail**

Run: `PATH=/home/aapanel/.nvm/versions/node/v26.13.1/bin:$PATH node --import tsx --test tests/schedule-display.test.mjs`
Expected: FAIL — `selectUpcomingSchedules is not a function`; same-day label still contains `–`.

- [ ] **Step 4: Implement selector and label**

In `src/lib/schedule-display.ts`, filter then sort ascending by `startDate`/`slug`, slice to `limit`, then re-sort that window descending by `startDate` with the same slug tie-break. In `scheduleDateLabel`, return a single `formatDate(startDate, locale)` when `startDate === endDate`.

- [ ] **Step 5: Run the tests to verify they pass**

Run: `PATH=/home/aapanel/.nvm/versions/node/v26.13.1/bin:$PATH node --import tsx --test tests/schedule-display.test.mjs`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/schedule-display.ts tests/schedule-display.test.mjs
git commit -m "feat: add upcoming schedule selector and same-day date label"
```

---

### Task 3: Upcoming block component, page copy, and route

**Files:**
- Create: `src/components/page/UpcomingSchedules.astro`
- Modify: `src/content/pages/0023-halaman-trainings.md`
- Modify: `src/pages/trainings/index.astro`
- Modify: `docs/components-blocks-layouts.md` (page structure blocks section, line ~13)
- Test: `tests/page-block-components.test.mjs`, `tests/page-listing-routes.test.mjs`

**Interfaces:**
- Consumes: `UpcomingSchedulesBlock` (Task 1); `selectUpcomingSchedules` (Task 2).
- Produces: `UpcomingScheduleItem = { key: string; dateLabel: string; title: string; href: string; detailLabel: string; statusLabel: string }` exported from `src/components/page/UpcomingSchedules.astro` as a TypeScript `interface` used by the route via `Astro.props`.
- The component takes `{ block: UpcomingSchedulesBlock; items: UpcomingScheduleItem[] }` and must not call `getCollection`.

- [ ] **Step 1: Write the failing component-contract test**

In `tests/page-block-components.test.mjs`, add `UpcomingSchedules` to the `files` map and assert its source contains `<slot` **or** an `items.map(` loop, has no `getCollection`, and reads `block.emptyTitle` / `block.emptyDescription` exactly once each.

- [ ] **Step 2: Write the failing route test**

In `tests/page-listing-routes.test.mjs`, assert the source of `src/pages/trainings/index.astro` contains `selectUpcomingSchedules`, `UpcomingSchedules`, and `trainingBySlug`, and does not contain a hardcoded Indonesian section title.

- [ ] **Step 3: Run the tests to verify they fail**

Run: `PATH=/home/aapanel/.nvm/versions/node/v26.13.1/bin:$PATH npm test`
Expected: the two new assertions fail.

- [ ] **Step 4: Add the editorial block**

Append to `blocks` in `src/content/pages/0023-halaman-trainings.md`:

```yaml
  - type: upcoming-schedules
    id: pelatihan-terdekat
    surface: cream
    eyebrow: "Jadwal mendatang"
    title: "Pelatihan Terdekat"
    description: "Sesi pelatihan dengan tanggal mulai terdekat. Sesi paling jauh ditampilkan lebih atas, sesi terdekat paling bawah."
    emptyTitle: "Belum ada jadwal pelatihan terdekat"
    emptyDescription: "Jadwal pelatihan akan ditampilkan setelah tanggal pelaksanaan tersedia."
```

- [ ] **Step 5: Implement the component and route**

- `UpcomingSchedules.astro` renders `Section`, eyebrow, `h2` with `id` derived from `block.id`, description, a `divide-y` list of `article` items (date, linked program title, detail line, status), or the empty state. Use `min-h-11` and `focus-visible:` classes on the link, matching `ListingSection.astro`.
- In `src/pages/trainings/index.astro`, load `trainingSchedules` and published `id` trainings, build `trainingBySlug`, filter schedules by that map, call `selectUpcomingSchedules(schedules, new Date().toISOString().slice(0, 10), 12)`, then map to `UpcomingScheduleItem` using `scheduleDateLabel`, `/trainings/${training.data.slug}/`, location text (“Metode menyusul” when unset), and “Informasi pendaftaran menyusul” when status is unset. Render the block with `hasItems`-equivalent logic via `items.length > 0`.

- [ ] **Step 6: Register the block in docs**

Add `upcoming-schedules` to the page structure blocks list in `docs/components-blocks-layouts.md` with its intent and the fact that its data comes from the route, not frontmatter.

- [ ] **Step 7: Run the tests to verify they pass**

Run: `PATH=/home/aapanel/.nvm/versions/node/v26.13.1/bin:$PATH npm test`
Expected: all pass.

- [ ] **Step 8: Commit**

```bash
git add src/components/page/UpcomingSchedules.astro src/content/pages/0023-halaman-trainings.md src/pages/trainings/index.astro docs/components-blocks-layouts.md tests/page-block-components.test.mjs tests/page-listing-routes.test.mjs
git commit -m "feat: render upcoming training sessions on trainings page"
```

---

### Task 4: Replace 3 training entries with the 14 IAS Internal Auditor programs

**Files:**
- Delete: `src/content/training/pelatihan-sertifikasi-iso-9001-2026.md`, `src/content/training/pelatihan-sertifikasi-iso-14001-2026.md`, `src/content/training/pelatihan-sertifikasi-fssc-22000.md`
- Create: 14 files in `src/content/training/` using the slugs from the spec's “Program yang dipakai” table
- Modify: `tests/hero-route-audit.test.mjs`, `tests/page-sitemap-lastmod.test.mjs`, `tests/training-and-schedule-schema.test.mjs`
- Test: `tests/training-catalogue.test.mjs` (new)

**Interfaces:**
- Consumes: 14 title/slug pairs from the spec table.
- Produces: 14 published `training` entries whose `data.slug` values are referenced by Task 5 schedules.

- [ ] **Step 1: Write the failing catalogue test**

Create `tests/training-catalogue.test.mjs` that reads `src/content/training/*.md` and asserts:

- exactly 14 files;
- the set of `slug` values equals the 14 slugs in the spec table, and no `pelatihan-sertifikasi-*` slug remains;
- every `title` starts with `Pelatihan` and is unique;
- every `intro` starts with `"<title> adalah "` and is exactly one paragraph;
- every `metaDescription` is unique and differs from `intro` and from `featuredImage.alt`;
- every `featuredImage.alt` contains `adalah`;
- no file matches `/konsult|consult/i`.

- [ ] **Step 2: Run the test to verify it fails**

Run: `PATH=/home/aapanel/.nvm/versions/node/v26.13.1/bin:$PATH node --test tests/training-catalogue.test.mjs`
Expected: FAIL — 3 files found, 14 expected.

- [ ] **Step 3: Generate the 14 training entries**

Write the files with: `draft: false`, `pubDate`/`updatedDate` `2026-11-23T00:00:00Z`, `lang: id`, a unique `translationKey: training-<slug>`, `featuredImage.src` from `training-iso9001-2026.webp` (ISO 9001), `training-iso14001-2026.webp` (ISO 14001), `training-fssc-22000.webp` (FSSC 22000), or `training-competency.webp` (all others), and blocks `hero` (title + intro) followed by one `content-section` with a unique H2 title and three `items` describing audit scope, audit stages, and certification administration. Keep copy factual: no venue, price, quota, registration promise, or consultation wording.

- [ ] **Step 4: Update tests that point at the removed slugs**

Replace `/trainings/pelatihan-sertifikasi-iso-9001-2026/` with `/trainings/pelatihan-auditor-internal-iso-9001/` in `tests/hero-route-audit.test.mjs` and `tests/page-sitemap-lastmod.test.mjs` (keep the expected date `2026-11-23T00:00:00Z`). Update `trainingInput` and `scheduleInput` in `tests/training-and-schedule-schema.test.mjs` to the new first title/slug.

- [ ] **Step 5: Run the tests to verify they pass**

Run: `PATH=/home/aapanel/.nvm/versions/node/v26.13.1/bin:$PATH npm test`
Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add src/content/training tests/training-catalogue.test.mjs tests/hero-route-audit.test.mjs tests/page-sitemap-lastmod.test.mjs tests/training-and-schedule-schema.test.mjs
git commit -m "content: replace training catalogue with 14 internal auditor programs"
```

---

### Task 5: Generate 336 dated 2027 schedules

**Files:**
- Delete: `src/content/training-schedules/2027/fssc-22000/jadwal-pelatihan-fssc-22000.md`, `src/content/training-schedules/2027/iso-14001-2026/jadwal-pelatihan-iso-14001-2026.md`, `src/content/training-schedules/2027/iso-9001-2026/jadwal-pelatihan-iso-9001-2026.md`
- Create: `src/content/training-schedules/2027/<training-slug>/jadwal-<training-slug>-<YYYY-MM-DD>.md` (24 files per training)
- Test: `tests/training-schedule-coverage.test.mjs` (new)

**Interfaces:**
- Consumes: 14 `trainingSlug` values from Task 4.
- Produces: 336 schedule entries consumed by Task 3's route via `getCollection("trainingSchedules")`.

- [ ] **Step 1: Write the failing coverage test**

Create `tests/training-schedule-coverage.test.mjs` that reads all files under `src/content/training-schedules/2027/` via `tinyglobby` and asserts:

- total file count is 336;
- each of the 14 training slugs has exactly 24 files in a directory named after the slug;
- every date is one of the 24 values in the spec's 2nd/4th-Wednesday table;
- `startDate === endDate`;
- `slug` values are unique;
- `trainingSlug` values are all present in the 14 training entries;
- `serviceSlug`, when present, is one of the service slugs actually used in `src/content/services/`;
- no file matches `/konsult|consult/i`.

- [ ] **Step 2: Run the test to verify it fails**

Run: `PATH=/home/aapanel/.nvm/versions/node/v26.13.1/bin:$PATH node --test tests/training-schedule-coverage.test.mjs`
Expected: FAIL — placeholder files have no dates.

- [ ] **Step 3: Generate the entries**

Use a one-off script (do not commit it) to delete the 3 placeholders and write 336 files. Each file contains only:

```yaml
---
trainingSlug: "<training-slug>"
serviceSlug: "<matching service slug>"   # omit when no matching service exists
slug: "jadwal-<training-slug>-<YYYY-MM-DD>"
startDate: "<YYYY-MM-DD>"
endDate: "<YYYY-MM-DD>"
---
```

Use the 24 dates from the spec table. Set `serviceSlug` only for ISO 9001 (`sertifikasi-iso-9001-2026`), ISO 14001 (`sertifikasi-iso-14001-2026`), and FSSC 22000 (`sertifikasi-fssc-22000`). Leave `locationType`, `venue`, `price`, `quota`, `registrationStatus`, and `registrationUrl` unset.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `PATH=/home/aapanel/.nvm/versions/node/v26.13.1/bin:$PATH npm test`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add src/content/training-schedules tests/training-schedule-coverage.test.mjs
git commit -m "content: add 2027 internal auditor training schedules"
```

---

### Task 6: Full verification and PR update

**Files:**
- Commit the spec document from `docs/superpowers/specs/2026-11-23-upcoming-training-schedules-design.md`.

- [ ] **Step 1: Run the full test suite**

Run: `PATH=/home/aapanel/.nvm/versions/node/v26.13.1/bin:$PATH npm test`
Expected: all tests pass.

- [ ] **Step 2: Run static checks, lint, and build**

Run: `PATH=/home/aapanel/.nvm/versions/node/v26.13.1/bin:$PATH npm run check && npm run lint && npm run build`
Expected: all exit 0.

- [ ] **Step 3: Run all four audits and changed-content preflight**

Run: `PATH=/home/aapanel/.nvm/versions/node/v26.13.1/bin:$PATH npm run audit:seo && npm run audit:blocks && npm run audit:page-images && npm run audit:headings && npm run validate:changed`
Expected: all exit 0.

- [ ] **Step 4: Verify the built `/trainings/` page**

Run: `grep -o 'Pelatihan Terdekat' dist/trainings/index.html | head -1`
Expected: the section title is present, along with 12 date entries.

- [ ] **Step 5: Commit the spec and push the branch**

```bash
git add docs/superpowers/specs/2026-11-23-upcoming-training-schedules-design.md
git commit -m "docs: record IAS training reference and upcoming schedule design"
git push origin feat/training-and-schedule-content
```

Expected: PR #30 updates; report the new HEAD commit hash.
