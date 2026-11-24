# Full English Main Menu Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Serve real English pages for all seven main-menu items, including translated training and article details and an English schedule archive.

**Architecture:** Shared routing selectors derive ID and EN paths from explicit `lang`, `slug`, and `translationKey`. Editorial copy stays in validated collections; routes only resolve entries and pass data to existing layouts. One typed English-label module supplies UI strings that do not belong to company identity.

**Tech Stack:** Astro 7, TypeScript strict, Tailwind CSS, Astro Content Collections with Zod, Node test runner via `tsx`, SVG source converted to WebP by `sharp-cli`.

**Spec:** `docs/superpowers/specs/2026-11-24-full-english-main-menu-pages-design.md`

## Global Constraints

- Export `PATH="$HOME/.local/node-v26.13.1/bin:$PATH"` before every Node, pnpm, or npm command.
- `src/site.ts` remains the single source of truth for company identity, contact details, navigation labels, navigation hrefs, locale labels, breadcrumbs, and shared UI copy.
- Editorial copy lives only in validated `src/content/**/*.md` frontmatter blocks. A route must not own editorial page copy.
- Every publishable content entry has a positive numeric frontmatter `id`, exactly one `featuredImage`, a unique `metaDescription`, and a valid English or Indonesian intro.
- English intro begins with the exact title followed by ` is `. English `featuredImage.alt` contains the title and ` is `, and is shorter than the intro. Indonesian uses `adalah`.
- New language pairs share `slug` and `translationKey`; `lang` distinguishes the variant. The two P16 document-control drafts keep their historical slugs and stay unpublished.
- Existing Indonesian dates are reused for English translations. Do not invent `pubDate`, `updatedDate`, prices, quotas, venues, or availability.
- Public content must not use words beginning `konsult` or `consult`, including inside compound words.
- Public content must not use internal development-status, service-availability, approval, or self-audit copy.
- Sitemap `lastmod` uses `updatedDate ?? pubDate`, never build time.
- Real English pages are indexable, carry `/en/` canonicals, and expose reciprocal hreflang alternates. Stub redirects stay noindex and absent from the sitemap.
- Each generated canonical URL needs one unique primary image source and unique image bytes.
- Keep commits focused. Run the focused tests before each commit. Run the full gate before the final commit and before pushing.

## Review Focus

- **Menu still returns to Indonesian:** a visitor on `/en/services/` must see `Trainings -> /en/trainings/`, `Schedules -> /en/schedules/`, and `Articles -> /en/articles/` in header and footer. `tests/english-main-menu-built.test.mjs` starts with the four existing EN pages (Task 1), then Tasks 2–4 extend it by one menu pair and one real route each.
- **Stub/real-page collision:** `/en/trainings/`, `/en/schedules/`, and `/en/articles/` must be real `<html lang="en">` pages, not `http-equiv="refresh"` stubs. `tests/english-main-menu-built.test.mjs` (Task 1) and `tests/english-fallback.test.mjs` (Task 1) pin this.
- **Language-switch dead ends:** English detail pages must offer working Indonesian counterparts, and Indonesian detail pages must offer `/en/` counterparts. `tests/english-routing-foundation.test.mjs` (Task 1) and built HTML tests in Tasks 2 and 4 pin this.
- **Numeric id migration:** adding numeric ids to `articles` and `training` must not change publication order or break custom selectors. `tests/english-routing-foundation.test.mjs` (Task 1) pins positive, unique ids and unchanged default Indonesian ordering.
- **Editorial and image-policy drift:** 26 new English surfaces must satisfy intro, alt, heading, uniqueness, and prohibited-copy rules. `tests/english-training-content.test.mjs` (Task 2), `tests/english-schedule-page.test.mjs` (Task 3), `tests/english-article-content.test.mjs` (Task 4), plus `pnpm audit:page-images`, `pnpm audit:headings`, and `pnpm audit:blocks` (Task 5) pin this.

---

### Task 1: Routing foundation and built-menu regression test

**Files:**
- Modify: `src/content.config.ts:181-230`, `src/content.config.ts:321-330`
- Create: `src/lib/numeric-entry-id.ts`
- Modify: every file in `src/content/articles/*.md` and `src/content/training/*.md` (add `id`; do not change other fields)
- Create: `src/lib/article-routing.ts`, `src/lib/training-routing.ts`, `src/lib/english-labels.ts`
- Modify: `src/data/articles.ts:11-26`, `src/data/articles.ts:58-123`, `src/data/locale-fallback.ts:11-38`, `src/data/locale-switch.ts:14-44`
- Modify: `src/lib/locale-switch.ts:8-113`, `src/lib/page-alternates.ts`, `src/lib/sitemap-lastmod.mjs:8-71`
- Modify: `src/site.ts:96-135`, `src/data/breadcrumbs.ts`
- Modify: `src/components/page/PageBlockRenderer.astro:53-63`, `src/layouts/WidePageLayout.astro:18-24`, `src/layouts/TrainingLayout.astro:22-40`
- Create: `tests/english-routing-foundation.test.mjs`, `tests/english-main-menu-built.test.mjs`
- Modify: `tests/language-switch.test.mjs`, `tests/localized-navigation.test.mjs`, `tests/page-sitemap-lastmod.test.mjs`, `tests/en-fallback.test.mjs`

**Interfaces:**
- Consumes: `pageEntryId(data)` from `src/lib/page-entry-id.ts`; `getPublishedArticles()` from `src/data/articles.ts`; `buildEnglishFallbackPaths(data)` from `src/lib/locale-fallback.ts`.
- Produces:
  - `numericEntryId(data: { id?: unknown }): string`
  - `type ArticleLang = "id" | "en"`; `articleIndexPath(lang: ArticleLang): string`; `articlePath(article: { lang: string; slug: string }): string`
  - `type TrainingLang = "id" | "en"`; `trainingIndexPath(lang: TrainingLang): string`; `trainingPath(training: { lang: string; slug: string }): string`
  - `getPublishedArticles(lang?: ArticleLang): Article[]`, default `"id"`
  - `articlePageAlternates(page: number): SeoAlternate[]`
  - `englishLabels` with the exact strings listed in Step 3
  - `resolveLanguageOptions(input)` extended with `trainings` and with article/training/index/pagination counterparts
- Numeric ids:
  - Articles `1`–`9` map to the nine current published files in filename order; drafts keep `10` and `11`; new EN articles use `300`–`308`.
  - Trainings use `100`–`113` for the fourteen current files in filename order; new EN trainings use `200`–`213`.

- [ ] **Step 1: Write the failing routing tests**

Create `tests/english-routing-foundation.test.mjs` with these assertions:

```js
import assert from "node:assert/strict";
import test from "node:test";

test("published article selector filters by language and keeps ID order", async () => {
  const { getPublishedArticles } = await import("../src/data/articles.ts");
  const id = getPublishedArticles();
  const en = getPublishedArticles("en");
  assert.deepEqual(
    id.map((article) => article.slug),
    [
      "sertifikasi-iso-9001-2015",
      "proses-audit-sertifikasi-iso-9001-2015",
      "manfaat-sertifikasi-iso-9001-2015-bagi-perusahaan",
      "posisi-kualitas-sebagai-talenta-kompetitif",
      "mengendalikan-risiko-kualitas-di-pabrik",
      "sertifikasi-iso-45001-2018",
      "manajemen-beasiswa-kualitas-di-industri",
      "penilaian-kepatuhan-terhadap-standar-global",
      "manajemen-kualitas-nononkonformitas",
    ],
  );
  assert.ok(Array.isArray(en));
  assert.ok(en.every((article) => article.lang === "en"));
});

test("article and training paths use /en only for English records", async () => {
  const { articlePath } = await import("../src/lib/article-routing.ts");
  const { trainingPath } = await import("../src/lib/training-routing.ts");
  assert.equal(articlePath({ lang: "id", slug: "x" }), "/articles/x/");
  assert.equal(articlePath({ lang: "en", slug: "x" }), "/en/articles/x/");
  assert.equal(trainingPath({ lang: "id", slug: "x" }), "/trainings/x/");
  assert.equal(trainingPath({ lang: "en", slug: "x" }), "/en/trainings/x/");
});
```

Also assert:

- `numericEntryId({ id: 42 }) === "42"` and `assert.throws(() => numericEntryId({ id: "42" }), /positive numeric id/)`.
- Every `articles` and `training` frontmatter has a positive integer `id`; ids are unique within each collection.
- `pageAlternates("trainings")`, `pageAlternates("schedules")`, and `pageAlternates("articles")` each contain exactly `id` and `en` absolute URLs under the expected paths.
- `resolveLanguageOptions`, with synthetic translated entries, returns an available ID counterpart for `/en/trainings/x/` and an available EN counterpart for `/articles/x/` and `/articles/page/2/`.
- `buildEnglishFallbackPaths`, with synthetic input, omits `/trainings/`, `/schedules/`, and `/articles/` when their `/en/` equivalents appear in `existingEnglishPaths`.
- `getContentLastmod("/en/")` reads the EN Home page date and differs from `getContentLastmod("/")` when the two dates differ. Task 4 adds the EN article lastmod assertion.
- Existing `tests/language-switch.test.mjs` expectation changes from `/articles/<slug>/` to `/en/articles/<slug>/` for the English counterpart.

Create `tests/english-main-menu-built.test.mjs` with only the four currently real EN pages:

```js
const expected = {
  Home: "/en/",
  Services: "/en/services/",
  CSMS: "/en/csms/",
  About: "/en/about-us/",
};
```

For every non-stub `dist/**/index.html` whose path contains `/en/`, assert:

- `<html lang="en">` is present and `http-equiv="refresh"` is absent.
- Each `expected` label maps to the expected `href` in both `<header>` and `<footer>`.
- Every main-menu href starts with `/en/`.

- [ ] **Step 2: Run the tests to verify they fail**

Run:

```bash
export PATH="$HOME/.local/node-v26.13.1/bin:$PATH"
node --import tsx --test tests/english-routing-foundation.test.mjs tests/english-main-menu-built.test.mjs
```

Expected: `english-routing-foundation.test.mjs` FAILS because the new modules do not exist; `english-main-menu-built.test.mjs` PASSES against the four existing pages and becomes the regression guard. Record the failing assertions.

- [ ] **Step 3: Add the shared routing and label foundation**

- Add `id: z.number().int().positive()` to `articleSchema` and `trainingSchema`. Add `generateId: ({ data }) => numericEntryId(data)` to both collections.
- Add `id` to every article and training entry using the mapping in Interfaces. Do not alter slugs, dates, translation keys, or blocks.
- Implement `numericEntryId` using the same validation shape as `pageEntryId`, with the error text `Entry requires a positive numeric id.`
- Implement `article-routing.ts` and `training-routing.ts` with the path helpers in Interfaces.
- Change `getPublishedArticles(lang: ArticleLang = "id")` so it filters `data.lang` and reads the numeric frontmatter `id` instead of the file path. Default ordering must stay byte-for-byte equivalent for ID callers.
- Add `hrefEn` to `/trainings/`, `/schedules/`, and `/articles/` in `primaryNavigation` and `footerNavigation`. Change the English `/articles/` crumb href to `/en/articles/` and add English crumbs for `/trainings/` and `/schedules/`.
- Put these exact strings in `src/lib/english-labels.ts`:

```ts
export const englishLabels = {
  pagination: { previous: "Previous", next: "Next" },
  schedule: {
    registrationOpen: "Registration open",
    registrationClosed: "Registration closed",
    quotaFull: "Quota full",
    registrationCancelled: "Registration cancelled",
    informationPending: "Registration information pending",
    onSite: "On site",
    methodPending: "Method to be confirmed",
    fee: "Fee",
    quota: "Quota",
    programDetail: "Program details",
    register: "Register",
    datePending: "Schedule to be announced",
  },
  trainingDetail: {
    schedule: "Training schedule",
    locationPending: "Location to be confirmed",
    register: "Register for training",
    noSchedule: "No published schedule is available for this program yet.",
    scheduleMayChange: "Schedules may change. Confirm the delivery details before registering.",
    showPast: "Show past schedules",
    activeSummary: "Showing {count} active and upcoming schedules.",
    allSummary: "Showing {count} schedules.",
    noMonth: "No schedules for the selected month.",
    selectMonth: "Select schedule month",
    monthCount: "{month}, {count} schedules",
    past: "Past",
    ongoing: "In progress",
  },
  trainingIndex: {
    methodPending: "Method to be confirmed",
    registrationOpen: "Registration open",
    registrationClosed: "Registration closed",
    quotaFull: "Quota full",
    registrationCancelled: "Registration cancelled",
    informationPending: "Registration information pending",
  },
} as const;
```

- Extend `pageAlternates` for `trainings`, `schedules`, and `articles`; add `articlePageAlternates(page)`.
- Extend `LanguageSwitchInput` with `trainings`, and `counterpartHref` with training detail, article detail under both languages, three index paths, and `/articles/page/<n>/` ↔ `/en/articles/page/<n>/`.
- Update `src/data/locale-switch.ts` to load published trainings and pass them to `resolveLanguageOptions`.
- Extend `src/data/locale-fallback.ts` so published EN pages, EN trainings, EN articles, and EN article pagination paths enter `existingEnglishPaths`.
- Update `src/lib/sitemap-lastmod.mjs` so `lang: en` articles map to `/en/articles/<slug>/`, trainings to `/en/trainings/<slug>/`, and EN service details to `/en/services/<slug>/`. Keep `updatedDate ?? pubDate`.
- Pass `lang` from `PageBlockRenderer` to `PageHero`, from `WidePageLayout` to `Breadcrumbs`, and from `TrainingLayout` to `PageHero`. Do not change visible ID copy.

- [ ] **Step 4: Run focused tests**

Run:

```bash
export PATH="$HOME/.local/node-v26.13.1/bin:$PATH"
node --import tsx --test tests/english-routing-foundation.test.mjs tests/en-fallback.test.mjs tests/language-switch.test.mjs tests/localized-navigation.test.mjs tests/page-sitemap-lastmod.test.mjs
pnpm check
pnpm lint
```

Expected: all listed tests PASS. `check` and `lint` PASS. The built-menu test still covers only the four existing EN pages; Tasks 2–4 extend it.

- [ ] **Step 5: Commit**

```bash
git add src tests docs/superpowers/plans/2026-11-25-full-english-main-menu-pages.md docs/superpowers/specs/2026-11-24-full-english-main-menu-pages-design.md
git commit -m "feat: prepare English routing for remaining menu pages"
```

---

### Task 2: English trainings index and detail pages

**Files:**
- Create: `src/content/pages/0038-halaman-trainings-en.md`
- Create: `src/content/training/0200-*-en.md` through `0213-*-en.md` (14 files)
- Create: 15 SVG sources in `assets/illustrations/source/`, 15 WebP files in `public/images/illustrations/`, and 15 rows in `docs/illustration-library/asset-register.md`
- Create: `src/pages/en/trainings/index.astro`, `src/pages/en/trainings/[slug].astro`
- Modify: `src/components/TrainingCard.astro`
- Create: `tests/english-training-content.test.mjs`

**Interfaces:**
- Consumes: `getPageEntry(slug, lang)`, `getTrainingView(input)`, `trainingIndexPath("en")`, `trainingPath(training)`, `pageAlternates("trainings")`, `englishLabels.trainingDetail`. Do not invent a `getPublishedTrainings` helper; filter `getCollection("training", ...)` by `data.lang === "en"` in the route.
- Produces: published EN training records with ids `200`–`213`; real routes `/en/trainings/` and `/en/trainings/<slug>/`.
- ID-to-asset map, in order:

| ID | slug suffix | WebP |
|---:|---|---|
| 200 | `cgmp` | `training-en-cgmp.webp` |
| 201 | `fssc-22000` | `training-en-fssc-22000.webp` |
| 202 | `iatf-16949` | `training-en-iatf-16949.webp` |
| 203 | `iso-13485` | `training-en-iso-13485.webp` |
| 204 | `iso-14001` | `training-en-iso-14001.webp` |
| 205 | `iso-15189` | `training-en-iso-15189.webp` |
| 206 | `iso-17025` | `training-en-iso-17025.webp` |
| 207 | `iso-22000` | `training-en-iso-22000.webp` |
| 208 | `iso-22301` | `training-en-iso-22301.webp` |
| 209 | `iso-27001` | `training-en-iso-27001.webp` |
| 210 | `iso-45001` | `training-en-iso-45001.webp` |
| 211 | `iso-50001` | `training-en-iso-50001.webp` |
| 212 | `iso-9001` | `training-en-iso-9001.webp` |
| 213 | `migrasi-iso-14001` | `training-en-iso-14001-migration.webp` |

Register `trainings-index-en.webp` as `ILL-052` and the table rows as `ILL-053`–`ILL-066`.

- [ ] **Step 1: Write the failing content test**

Create `tests/english-training-content.test.mjs`. Assert:

- Exactly 14 published EN training entries.
- Each EN entry shares `slug` and `translationKey` with its ID pair.
- Each EN entry reuses the paired `pubDate` and `updatedDate`.
- Each EN entry follows all mandatory English intro, alt, meta, hero, and heading rules.
- Each EN `featuredImage.src` matches its mapped WebP and is unique.
- Both EN route files exist; the index calls `getPageEntry("trainings", "en")` and the detail route filters `getCollection("training", ...)` by `data.lang === "en"`.
- Add `Trainings: "/en/trainings/"` to `expected` in `tests/english-main-menu-built.test.mjs` and assert `dist/en/trainings/index.html` is a real English page. Before the route exists, this edit makes the built-menu test fail.

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
export PATH="$HOME/.local/node-v26.13.1/bin:$PATH"
node --import tsx --test tests/english-training-content.test.mjs tests/english-main-menu-built.test.mjs
```

Expected: FAIL because no published EN training entries or EN routes exist.

- [ ] **Step 3: Add the English page entry and translated training records**

- Create `0038-halaman-trainings-en.md` with `id: 38`, `slug: trainings`, `lang: en`, a stable `translationKey`, and dates copied from `0023-halaman-trainings.md`. Write a hero plus English listing copy. Use `trainings-index-en.webp` as its only featured image.
- Create the 14 EN training entries. Use English titles of the form `<Standard> Internal Auditor Training`, with `ISO 14001 Migration Internal Auditor Training` for id `213`.
- Translate each ID block into English, preserving block order and hierarchy. Use block ids ending in `-en`. Do not add consultation, implementation-support, availability, or internal-status copy.
- Use the mapped WebP paths and English alt text in every entry.

- [ ] **Step 4: Add unique illustrations**

- Create one original SVG per mapped WebP with a distinct layout seeded by its numeric id. Use the corporate palette already used in `docs/illustration-library/README.md`.
- Register every asset with `ILL-052`–`ILL-066`, its source path, output path, owner, and alt purpose.
- Run:

```bash
export PATH="$HOME/.local/node-v26.13.1/bin:$PATH"
pnpm images:illustrations
```

Expected: 15 WebP files exist and `assets/illustrations/webp-conversion-manifest.json` contains their source and output hashes.

- [ ] **Step 5: Add the English routes**

- `src/pages/en/trainings/index.astro`: resolve the EN page entry with `getPageEntry("trainings", "en")`; filter trainings with `lang === "en"`; use `trainingIndexPath("en")`, `pageAlternates("trainings")`, `lang="en"`, and `englishLabels.trainingIndex`.
- `src/pages/en/trainings/[slug].astro`: build paths from published EN trainings only; use `getTrainingView`; canonical `trainingPath(training.data)`; alternates from the shared `translationKey` group; structured data with the EN canonical; `TrainingLayout lang="en"`; `englishLabels.trainingDetail`; date locale `en-US`.
- Add an optional `lang` prop to `TrainingCard.astro` and source its label and link text from `englishLabels` for English, keeping current ID output unchanged.

- [ ] **Step 6: Run focused tests and build**

Run:

```bash
export PATH="$HOME/.local/node-v26.13.1/bin:$PATH"
node --import tsx --test tests/english-training-content.test.mjs
pnpm build
node --import tsx --test tests/english-main-menu-built.test.mjs
pnpm audit:page-images
```

Expected: all PASS. `dist/en/trainings/index.html` and all 14 detail pages are real English pages with reciprocal alternates.

- [ ] **Step 7: Commit**

```bash
git add src assets public/images/illustrations docs/illustration-library tests
git commit -m "feat: add English trainings pages"
```

---

### Task 3: English schedules archive

**Files:**
- Create: `src/content/pages/0039-halaman-schedules-en.md`
- Create: 1 SVG source, 1 WebP file, 1 row in `docs/illustration-library/asset-register.md` (`ILL-067`)
- Create: `src/pages/en/schedules/index.astro`
- Create: `tests/english-schedule-page.test.mjs`

**Interfaces:**
- Consumes: `getPageEntry("schedules", "en")`, `ScheduleArchiveLayout`, `getPublishedArticles` is not used here, `scheduleDateLabel`, `englishLabels.schedule`, `pageAlternates("schedules")`.
- Produces: real route `/en/schedules/` using the shared 2027 schedule records and EN training titles.

- [ ] **Step 1: Write the failing test**

Create `tests/english-schedule-page.test.mjs`. Assert:

- The EN schedules page entry has `id: 39`, `slug: schedules`, `lang: en`, valid English intro/alt/meta, and dates copied from `0024-halaman-schedules.md`.
- `src/pages/en/schedules/index.astro` exists and uses `getPageEntry("schedules", "en")`.
- The route source contains no Indonesian schedule labels from the Task 1 inventory.
- The route uses `englishLabels.schedule` and `scheduleDateLabel` with `locale: "en-US"`.
- Add `Schedules: "/en/schedules/"` to `expected` in `tests/english-main-menu-built.test.mjs` and assert `dist/en/schedules/index.html` is a real English page. Before the route exists, this edit makes the built-menu test fail.

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
export PATH="$HOME/.local/node-v26.13.1/bin:$PATH"
node --import tsx --test tests/english-schedule-page.test.mjs tests/english-main-menu-built.test.mjs
```

Expected: FAIL because the EN page entry, asset, and route do not exist.

- [ ] **Step 3: Add content and the illustration**

- Create `0039-halaman-schedules-en.md` with a hero and English listing copy. Use `schedules-calendar-en.webp` as its only featured image.
- Create and convert `schedules-calendar-en.svg`; register it as `ILL-067`.

- [ ] **Step 4: Add the route**

Create `src/pages/en/schedules/index.astro` mirroring `src/pages/schedules/index.astro`, with these differences:

- Page entry: `getPageEntry("schedules", "en")`.
- Training lookup: published EN trainings from Task 2, matched by the unchanged schedule `trainingSlug`.
- Canonical `/en/schedules/`; `alternates={pageAlternates("schedules")}`; `lang="en"`; `ScheduleArchiveLayout` receives `lang="en"`.
- All statuses, location labels, fee/quota labels, buttons, and empty-state copy come from `englishLabels.schedule`.
- Schedule dates use `scheduleDateLabel(..., { locale: "en-US" })`.
- Keep all schedule records unchanged. Do not translate venue names or invent availability.

- [ ] **Step 5: Run focused tests and build**

Run:

```bash
export PATH="$HOME/.local/node-v26.13.1/bin:$PATH"
node --import tsx --test tests/english-schedule-page.test.mjs
pnpm build
node --import tsx --test tests/english-main-menu-built.test.mjs
pnpm audit:page-images
```

Expected: all PASS. `dist/en/schedules/index.html` is real and contains English status labels.

- [ ] **Step 6: Commit**

```bash
git add src assets public/images/illustrations docs/illustration-library tests
git commit -m "feat: add English schedules page"
```

---

### Task 4: English articles index and translated article details

**Files:**
- Create: `src/content/pages/0040-halaman-articles-en.md`
- Create: `src/content/articles/0300-*-en.md` through `0308-*-en.md` (9 files)
- Create: 10 SVG sources, 10 WebP files, and 10 rows in `docs/illustration-library/asset-register.md` (`ILL-068`–`ILL-077`)
- Create: `src/pages/en/articles/index.astro`, `src/pages/en/articles/[slug].astro`, `src/pages/en/articles/page/[page].astro`
- Modify: `src/pages/articles/[slug].astro`
- Create: `tests/english-article-content.test.mjs`

**Interfaces:**
- Consumes: `getPublishedArticles("en")`, `articleIndexPath("en")`, `articlePath(article)`, `articlePageAlternates(page)`, `pageAlternates("articles")`, `ArticleCard`.
- Produces: real routes `/en/articles/`, `/en/articles/<slug>/`, and zero or more `/en/articles/page/<n>/` generated from the EN article count.
- ID-to-asset map, in source-file order:

| ID | English slug | WebP |
|---:|---|---|
| 300 | `posisi-kualitas-sebagai-talenta-kompetitif` | `article-en-quality-talent.webp` |
| 301 | `sertifikasi-iso-9001-2015` | `article-en-iso9001-certification.webp` |
| 302 | `mengendalikan-risiko-kualitas-di-pabrik` | `article-en-factory-risk.webp` |
| 303 | `sertifikasi-iso-45001-2018` | `article-en-iso45001-certification.webp` |
| 304 | `manajemen-beasiswa-kualitas-di-industri` | `article-en-quality-scholarships.webp` |
| 305 | `penilaian-kepatuhan-terhadap-standar-global` | `article-en-global-conformity.webp` |
| 306 | `proses-audit-sertifikasi-iso-9001-2015` | `article-en-audit-process.webp` |
| 307 | `manajemen-kualitas-nononkonformitas` | `article-en-nonconformity.webp` |
| 308 | `manfaat-sertifikasi-iso-9001-2015-bagi-perusahaan` | `article-en-iso9001-benefits.webp` |

Register the index asset as `ILL-068` and the detail assets as `ILL-069`–`ILL-077`.

- [ ] **Step 1: Write the failing tests**

Create `tests/english-article-content.test.mjs`. Assert:

- Exactly 9 published EN article entries.
- Each EN entry shares `slug` and `translationKey` with its ID pair.
- Each EN entry reuses the paired `pubDate` and `updatedDate`.
- Each EN entry follows all mandatory English intro, alt, meta, hero, and heading rules.
- Each EN `featuredImage.src` matches its mapped WebP and is unique.
- `src/pages/en/articles/[slug].astro` produces only EN entries; `src/pages/articles/[slug].astro` produces only ID entries.
- Detail alternates from both routes contain reciprocal `id` and `en` URLs.
- The EN archive page entry uses `articles-index-en.webp` and has `id: 40`.
- `getContentLastmod("/en/articles/<slug>/")` reads that EN article date and does not fall back to the ID record.
- Add `Articles: "/en/articles/"` to `expected` in `tests/english-main-menu-built.test.mjs` and assert `dist/en/articles/index.html` is a real English page. Before the route exists, this edit makes the built-menu test fail.

- [ ] **Step 2: Run the tests to verify they fail**

Run:

```bash
export PATH="$HOME/.local/node-v26.13.1/bin:$PATH"
node --import tsx --test tests/english-article-content.test.mjs tests/english-main-menu-built.test.mjs
```

Expected: FAIL because no EN article entries or EN article routes exist.

- [ ] **Step 3: Add the English page entry and translated articles**

- Create `0040-halaman-articles-en.md` with `id: 40`, `slug: articles`, `lang: en`, dates copied from `0025-halaman-articles.md`, English hero and listing copy, and `articles-index-en.webp`.
- Create the 9 EN article entries using the mapped ids and slugs. Translate every block from the paired ID entry, preserving order and hierarchy. Use block ids ending in `-en`.
- Do not publish or edit either P16 document-control draft. Assert they remain `draft: true`.

- [ ] **Step 4: Add unique illustrations**

- Create one original SVG per mapped WebP, convert them, and register them as `ILL-068`–`ILL-077`.
- Run:

```bash
export PATH="$HOME/.local/node-v26.13.1/bin:$PATH"
pnpm images:illustrations
```

Expected: 10 new WebP files and updated manifest hashes.

- [ ] **Step 5: Add and correct the routes**

- `src/pages/en/articles/index.astro`: `getPageEntry("articles", "en")`, `getPublishedArticles("en")`, `articleIndexPath("en")`, `pageAlternates("articles")`, `lang="en"`, English pagination labels from `englishLabels.pagination`.
- `src/pages/en/articles/page/[page].astro`: generate pages from `getPublishedArticles("en")` with page size 9; use `articlePageAlternates(page)`; use the EN page entry for title and image. With the current 9 EN articles, zero page-2 files are generated.
- `src/pages/en/articles/[slug].astro`: paths from `getPublishedArticles("en")`; canonical `articlePath(entry.data)`; alternates from the shared `translationKey` group; `ArticleLayout lang="en"`; EN structured data and breadcrumbs.
- Change `src/pages/articles/[slug].astro` so paths come from `getPublishedArticles("id")` and alternates use `articlePath`. Its canonical must remain `/articles/<slug>/`.

- [ ] **Step 6: Run focused tests and build**

Run:

```bash
export PATH="$HOME/.local/node-v26.13.1/bin:$PATH"
node --import tsx --test tests/english-article-content.test.mjs
pnpm build
node --import tsx --test tests/english-main-menu-built.test.mjs
pnpm audit:seo
pnpm audit:page-images
pnpm audit:headings
```

Expected: all PASS. `dist/en/articles/index.html` and all 9 detail pages are real English pages. No `/en/articles/page/2/` is built unless more than 9 published EN articles exist.

- [ ] **Step 7: Commit**

```bash
git add src assets public/images/illustrations docs/illustration-library tests
git commit -m "feat: add English articles pages"
```

---

### Task 5: Documentation, full gate, and push

**Files:**
- Modify: `docs/bilingual-content.md`, `docs/prelaunch-work-status.md`, `docs/illustration-library/asset-register.md` if any register row still lacks its WebP hash
- Create: no new source files

**Interfaces:**
- Consumes: all outputs from Tasks 1–4.
- Produces: validated merged tree and a pushed `main` branch.

- [ ] **Step 1: Update documentation**

- In `docs/bilingual-content.md`, replace the statement that remaining menu routes are stubs with the real EN route list.
- In `docs/prelaunch-work-status.md`, update validation rows using the exact exit codes, test count, and built-page count from Step 2. Do not write numbers before the commands run.
- Confirm the two P16 document-control drafts are still unpublished and that this is stated in the docs.

- [ ] **Step 2: Run the full gate on the merged tree**

Run each command separately and record its exit code:

```bash
export PATH="$HOME/.local/node-v26.13.1/bin:$PATH"
pnpm check
pnpm build
pnpm typecheck
pnpm lint
pnpm test
pnpm audit:seo
pnpm audit:blocks
pnpm audit:page-images
pnpm audit:headings
```

Expected: every command exits `0`. Record the test count and built-page count from the actual output. If any command fails, fix it in the task that owns the failure and amend that task's commit before continuing.

- [ ] **Step 3: Inspect the built English output**

Assert from the fresh `dist`:

- Seven real English main-menu routes exist.
- No real English page contains `http-equiv="refresh"`.
- Every real English page has `<html lang="en">`, a canonical under `/en/`, and reciprocal hreflang alternates where a pair exists.
- Header and footer links match `tests/english-main-menu-built.test.mjs`.
- The two document-control drafts produced no public routes.

- [ ] **Step 4: Read operational memory and commit**

Read `docs/agent-operational-memory.md` before any push or merge work.

```bash
git add docs
git commit -m "docs: record English main menu validation"
```

- [ ] **Step 5: Push**

Use the documented token form without printing the token:

```bash
token=$(tr -d '\n' < /home/tnv-certification/.git-pat-tnvcertification)
auth=$(printf 'x-access-token:%s' "$token" | base64 -w0)
git -c http.extraHeader="Authorization: Basic $auth" push origin main
```

Expected: `origin/main` advances to the new local `HEAD`. Do not write the token into git config, logs, docs, or shell history output.
