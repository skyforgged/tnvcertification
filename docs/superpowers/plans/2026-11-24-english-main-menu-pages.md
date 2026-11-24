# English Main Menu Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Serve real English pages for Home, CSMS, and About while Services keeps its existing English pages and the remaining menu items keep redirect stubs.

**Architecture:** Editorial copy stays in `src/content/pages/*.md`. A language-aware selector resolves paired entries by slug and `lang`; routes resolve entries and render blocks. Navigation, breadcrumbs, language switching, fallback generation, sitemap lastmod, and alternates use shared selectors so no route duplicates editorial or company copy.

**Tech Stack:** Astro 7, TypeScript strict, Tailwind CSS, Content Collections with Zod, Node test runner, `tsx`.

**Spec:** `docs/superpowers/specs/2026-11-24-english-main-menu-pages-design.md`

## Global Constraints

- `site.ts` remains the single source of truth for company identity, contact details, navigation, labels, canonical site URL, and shared UI copy.
- Editorial copy lives only in validated `src/content/pages/*.md` frontmatter blocks.
- A route must not own editorial page copy.
- Page variants share `slug` and `translationKey`; `lang` distinguishes ID and EN entries.
- English intro and featured-image alt must use `is`; Indonesian must use `adalah`.
- Every publishable entry has exactly one `featuredImage`; alt is shorter than intro.
- Public content must not use words beginning `konsult` or `consult`.
- Public content must not use internal development-status, service-availability, approval, or self-audit copy.
- External references are research inputs, never competitor backlinks.
- Sitemap `lastmod` uses content publication/update metadata, never build time.
- Fallback stubs are noindex redirects; real pages are indexable with canonicals and reciprocal hreflang alternates.

## Review Focus

- **Paired slug collision:** English and Indonesian entries share `slug`, so the generic `/[slug]` route could emit a duplicate `/about-us/`. Test the selector and built canonical uniqueness (Tasks 1, 7, 8).
- **Stub/real-page collision:** `/en/`, `/en/csms/`, and `/en/about-us/` must be real indexable pages, not noindex stubs. Test fallback exclusion and built HTML (Tasks 4, 8).
- **Language switch dead ends:** English pages must offer Indonesian counterparts, and stub-only routes must stay unavailable. Test resolver branches (Task 3).
- **Localized navigation side effects:** English hrefs must not break active states, breadcrumbs, or ID routes. Test pure selectors and markup (Task 2).
- **Editorial policy drift:** English copy could violate `is`/`adalah`, alt-length, prohibited terminology, unique-image, or status-copy rules. Test frontmatter and run full audits (Tasks 5–8).

---

### Task 1: Language-aware page lookup

**Files:**
- Create: `src/lib/page-selection.ts`
- Create: `tests/page-entry-language.test.mjs`
- Modify: `src/data/pages.ts:30-38`, `src/data/pages.ts:48-55`

**Interfaces:**
- Consumes: `PageEntry` from `src/data/pages.ts`.
- Produces: `selectPageEntry(entries: readonly PageEntry[], slug: string, lang?: string): PageEntry`; `getPageEntry(slug: string, lang?: string): Promise<PageEntry>`. Default `lang` is `"id"`. `getCsmsTopicEntries` returns only `lang === "id"` entries.

- [ ] **Step 1: Write the failing test**

Create `tests/page-entry-language.test.mjs`:

```js
import assert from "node:assert/strict";
import test from "node:test";
import { selectPageEntry } from "../src/lib/page-selection.ts";

const entry = (slug, lang, draft = false) => ({ data: { slug, lang, draft } });
const entries = [
  entry("about-us", "id"),
  entry("about-us", "en"),
  entry("home", "id", true),
];

test("selectPageEntry filters by slug, language and draft state", () => {
  assert.equal(selectPageEntry(entries, "about-us", "en").data.lang, "en");
  assert.equal(selectPageEntry(entries, "about-us").data.lang, "id");
});

test("selectPageEntry reports missing and draft entries", () => {
  assert.throws(() => selectPageEntry(entries, "missing", "id"), /not found/);
  assert.throws(() => selectPageEntry(entries, "home", "id"), /not found or is a draft/);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --import tsx --test tests/page-entry-language.test.mjs`
Expected: FAIL because `src/lib/page-selection.ts` does not exist.

- [ ] **Step 3: Implement the selector**

In `src/lib/page-selection.ts`, define a minimal structural entry type with `data: { slug: string; lang?: string; draft?: boolean }`. Match exact `slug`, requested language (default `"id"`), and `draft !== true`. Throw `Page entry "<slug>" not found or is a draft` when absent.

In `src/data/pages.ts`, import `selectPageEntry`, change `getPageEntry(slug: string, lang = "id")` to filter the collection by `lang`, then call `selectPageEntry`. Add `entry.data.lang === "id"` to `getCsmsTopicEntries`.

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --import tsx --test tests/page-entry-language.test.mjs`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/page-selection.ts src/data/pages.ts tests/page-entry-language.test.mjs
git commit -m "feat: add language-aware page lookup"
```

### Task 2: Localized navigation, hero actions, and breadcrumbs

**Files:**
- Create: `tests/page-hero-localization.test.mjs`
- Modify: `src/site.ts:51-89`, `src/lib/navigation.ts`, `src/components/SiteHeader.astro`, `src/components/SiteFooter.astro`, `src/components/page/PageHero.astro`, `src/data/breadcrumbs.ts`
- Modify: `tests/localized-navigation.test.mjs`, `tests/localized-navigation-markup.test.mjs`, `tests/breadcrumbs.test.mjs`

**Interfaces:**
- Consumes: `primaryNavigation`, `footerNavigation`, `siteSettings.ui`, `localizedCrumbs` from `src/site.ts`.
- Produces: `navigationHref(entry: { href: string; hrefEn?: string }, lang: string): string`; `siteCrumb` returns `/en/` routes for English.

- [ ] **Step 1: Write the failing tests**

Add `navigationHref` to the existing import from `../src/lib/navigation.ts`, then append:

```js
test("navigationHref uses English hrefs only when present", () => {
  assert.equal(navigationHref({ href: "/", hrefEn: "/en/" }, "en"), "/en/");
  assert.equal(navigationHref({ href: "/", hrefEn: "/en/" }, "id"), "/");
  assert.equal(navigationHref({ href: "/trainings/" }, "en"), "/trainings/");
});

test("real main-menu routes expose localized hrefs", () => {
  assert.deepEqual(
    primaryNavigation.map((entry) => [entry.href, entry.hrefEn]),
    [
      ["/", "/en/"],
      ["/services/", "/en/services/"],
      ["/csms/", "/en/csms/"],
      ["/trainings/", undefined],
      ["/schedules/", undefined],
      ["/articles/", undefined],
      ["/about-us/", "/en/about-us/"],
    ],
  );
});
```

Append to `tests/breadcrumbs.test.mjs`:

```js
test("English breadcrumbs use real English routes", () => {
  assert.deepEqual(siteCrumb("/", "en"), { label: "Home", href: "/en/" });
  assert.deepEqual(siteCrumb("/csms/", "en"), { label: "CSMS", href: "/en/csms/" });
  assert.deepEqual(siteCrumb("/about-us/", "en"), { label: "About", href: "/en/about-us/" });
});
```

Replace the existing English-home assertion in that file with the first line above.

Create `tests/page-hero-localization.test.mjs`:

```js
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const hero = await readFile(new URL("../src/components/page/PageHero.astro", import.meta.url), "utf8");
const header = await readFile(new URL("../src/components/SiteHeader.astro", import.meta.url), "utf8");
const footer = await readFile(new URL("../src/components/SiteFooter.astro", import.meta.url), "utf8");
const site = await readFile(new URL("../src/site.ts", import.meta.url), "utf8");

test("page hero takes lang and reads CTA copy from site settings", () => {
  assert.match(hero, /lang = "id"/);
  assert.match(hero, /siteSettings\.ui\.heroActions/);
  assert.doesNotMatch(hero, /Hubungi Kami via WhatsApp|Jelajahi layanan|Lihat daftar layanan/);
  for (const label of ["Contact us on WhatsApp", "Explore services", "View service list"]) {
    assert.ok(site.includes(label));
  }
});

test("shared chrome localizes site description and home links", () => {
  assert.match(footer, /siteSettings\.ui\.footerDescription\[ui\]/);
  assert.match(footer, /navigationHref\(primaryNavigation\[0\], lang\)/);
  assert.match(header, /navigationHref\(primaryNavigation\[0\], lang\)/);
  assert.ok(site.includes("Certification information and management system standards."));
});
```

Add to `tests/localized-navigation-markup.test.mjs`:

```js
test("header and footer resolve localized hrefs", () => {
  assert.match(header, /import \{ navigationHref, navigationLabel, uiLang \}/);
  assert.match(header, /navigationHref\(item, lang\)/);
  assert.match(footer, /import \{ navigationHref, navigationLabel, uiLang \}/);
  assert.match(footer, /navigationHref\(link, lang\)/);
});
```

Update existing import assertions in that file to match the new import line.

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --import tsx --test tests/localized-navigation.test.mjs tests/breadcrumbs.test.mjs tests/page-hero-localization.test.mjs tests/localized-navigation-markup.test.mjs`
Expected: FAIL for `navigationHref`, localized hrefs, breadcrumbs, and hero copy.

- [ ] **Step 3: Implement navigation and hero localization**

In `src/lib/navigation.ts`, add `navigationHref(entry, lang)` using `uiLang(lang) === "en" && entry.hrefEn ? entry.hrefEn : entry.href`.

In `src/site.ts`:
- Add `hrefEn` to `primaryNavigation` and `footerNavigation` exactly as asserted above.
- Add `siteSettings.ui.heroActions` with `{ id, en }` values for `whatsapp`, `exploreServices`, and `viewServiceList`.
- Add `siteSettings.ui.footerDescription` with the existing Indonesian description and `Certification information and management system standards.` for English.
- Set `localizedCrumbs.en["/"]` to `{ label: "Home", href: "/en/" }`; add `"/csms/"` and `"/about-us/"` entries with their English hrefs.

In `SiteHeader.astro`, import `navigationHref`, compute the localized href per menu item, and use it for `href` and active-state checks. Use `navigationHref(primaryNavigation[0], lang)` for the logo link.

In `SiteFooter.astro`, import `navigationHref` and `primaryNavigation`, localize every footer link and the brand link, and default `description` to `siteSettings.ui.footerDescription[ui]`.

In `PageHero.astro`, accept `lang?: string` (default `"id"`), use `uiLang`, and read all action labels from `siteSettings.ui.heroActions`. Keep existing variant flags unchanged.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --import tsx --test tests/localized-navigation.test.mjs tests/breadcrumbs.test.mjs tests/page-hero-localization.test.mjs tests/localized-navigation-markup.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/site.ts src/lib/navigation.ts src/components/SiteHeader.astro src/components/SiteFooter.astro src/components/page/PageHero.astro src/data/breadcrumbs.ts tests/localized-navigation.test.mjs tests/localized-navigation-markup.test.mjs tests/breadcrumbs.test.mjs tests/page-hero-localization.test.mjs
git commit -m "feat: localize main menu hrefs and hero actions"
```

### Task 3: Language switcher page counterparts

**Files:**
- Modify: `src/lib/locale-switch.ts`, `src/data/locale-switch.ts`
- Modify: `tests/language-switch.test.mjs`

**Interfaces:**
- Consumes: `LanguageEntry` from `src/lib/locale-switch.ts`.
- Produces: `LanguageSwitchInput.pages: readonly LanguageEntry[]`; `resolveLanguageOptions` resolves Home, CSMS, and About pairs. Service and article branches remain unchanged.

- [ ] **Step 1: Write the failing tests**

Add page fixtures and assertions to `tests/language-switch.test.mjs`:

```js
const pages = [
  { lang: "id", slug: "home", translationKey: "page-hal-home" },
  { lang: "en", slug: "home", translationKey: "page-hal-home" },
  { lang: "id", slug: "csms", translationKey: "page-hal-csms" },
  { lang: "en", slug: "csms", translationKey: "page-hal-csms" },
  { lang: "id", slug: "about-us", translationKey: "page-hal-about-us" },
  { lang: "en", slug: "about-us", translationKey: "page-hal-about-us" },
];

test("language switch resolves localized main-menu pages", () => {
  assert.deepEqual(shape(options("/", "id", { pages }).filter((option) => option.lang === "en")), [
    { lang: "en", href: "/en/", active: false, available: true },
  ]);
  assert.deepEqual(shape(options("/en/", "en", { pages }).filter((option) => option.lang === "id")), [
    { lang: "id", href: "/", active: false, available: true },
  ]);
  assert.deepEqual(shape(options("/csms/", "id", { pages }).filter((option) => option.lang === "en")), [
    { lang: "en", href: "/en/csms/", active: false, available: true },
  ]);
  assert.deepEqual(shape(options("/en/about-us/", "en", { pages }).filter((option) => option.lang === "id")), [
    { lang: "id", href: "/about-us/", active: false, available: true },
  ]);
});
```

Remove `"/about-us/"` from the `fallbackPaths` fixture used by this test so it represents the post-change state. Add `pages` to the shared `options` helper.

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --import tsx --test tests/language-switch.test.mjs`
Expected: FAIL because `pages` is ignored.

- [ ] **Step 3: Implement page counterparts**

In `src/lib/locale-switch.ts`:
- Add `pages` to `LanguageSwitchInput`.
- Add `pagePath(entry)` returning `/` for ID home, `/en/` for EN home, and `/<lang-prefix><slug>/` otherwise.
- Before service/article branches in `counterpartHref`, find a page entry whose `pagePath` equals the normalized pathname and return `findCounterpart(input.pages, source, lang, pagePath)`.

In `src/data/locale-switch.ts`, collect published `pages` entries and pass `{ lang, slug, translationKey }` into `resolveLanguageOptions`.

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --import tsx --test tests/language-switch.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/locale-switch.ts src/data/locale-switch.ts tests/language-switch.test.mjs
git commit -m "feat: add page counterparts to language switcher"
```

### Task 4: Fallback exclusions, alternates, and sitemap lastmod

**Files:**
- Create: `src/lib/page-alternates.ts`
- Create: `tests/page-alternates.test.mjs`
- Modify: `src/data/locale-fallback.ts`, `astro.config.mjs`, `src/pages/services/index.astro`, `src/pages/en/services/index.astro`
- Modify: `tests/en-fallback.test.mjs`

**Interfaces:**
- Consumes: `siteSettings.url` from `src/site.ts`; `SeoAlternate` from `src/lib/seo.ts`.
- Produces: `pageAlternates(slug: string): SeoAlternate[]` for `home`, `services`, `csms`, and `about-us`; empty array otherwise. English page paths are reserved in fallback output.

- [ ] **Step 1: Write the failing tests**

Create `tests/page-alternates.test.mjs`:

```js
import assert from "node:assert/strict";
import test from "node:test";
import { pageAlternates } from "../src/lib/page-alternates.ts";

const origin = "https://tnv-certification.com";

test("pageAlternates emits reciprocal absolute alternates", () => {
  assert.deepEqual(pageAlternates("home"), [
    { lang: "id", href: `${origin}/` },
    { lang: "en", href: `${origin}/en/` },
  ]);
  assert.deepEqual(pageAlternates("about-us"), [
    { lang: "id", href: `${origin}/about-us/` },
    { lang: "en", href: `${origin}/en/about-us/` },
  ]);
});

test("pageAlternates ignores unsupported slugs", () => {
  assert.deepEqual(pageAlternates("trainings"), []);
});
```

Append to `tests/en-fallback.test.mjs`:

```js
test("excludes English paths backed by real page entries", () => {
  const paths = buildEnglishFallbackPaths({
    ...empty,
    pages: [
      { slug: "home", lang: "en" },
      { slug: "csms", lang: "en" },
      { slug: "about-us", lang: "en" },
    ],
    existingEnglishPaths: ["/en/", "/en/csms/", "/en/about-us/"],
  });
  assert.ok(!paths.includes("/csms/"));
  assert.ok(!paths.includes("/about-us/"));
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --import tsx --test tests/page-alternates.test.mjs tests/en-fallback.test.mjs`
Expected: FAIL for alternates and fallback exclusion.

- [ ] **Step 3: Implement alternates and route exclusions**

Create `src/lib/page-alternates.ts`. Map `home` to `/` and `/en/`; map other supported slugs to `/<slug>/` and `/en/<slug>/`; resolve both with `new URL(path, siteSettings.url).toString()`.

In `src/data/locale-fallback.ts`, add English page paths to `existingEnglishPaths`: map `home` to `/en/`, other English page slugs to `/en/<slug>/`.

In `astro.config.mjs`, remove only the `"/en/": "/"` redirect.

Add `alternates={pageAlternates("services")}` to both `src/pages/services/index.astro` and `src/pages/en/services/index.astro`.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --import tsx --test tests/page-alternates.test.mjs tests/en-fallback.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/page-alternates.ts src/data/locale-fallback.ts astro.config.mjs src/pages/services/index.astro src/pages/en/services/index.astro tests/page-alternates.test.mjs tests/en-fallback.test.mjs
git commit -m "feat: reserve English page routes and add alternates"
```

### Task 5: English Home page

**Files:**
- Create: `src/content/pages/0030-halaman-home-en.md`
- Create: `src/pages/en/index.astro`
- Create: `assets/illustrations/source/home-assurance-en.svg`
- Create: `public/images/illustrations/home-assurance-en.webp`
- Modify: `src/pages/index.astro`, `docs/illustration-library/asset-register.md`
- Create: `tests/english-page-content.test.mjs`

**Interfaces:**
- Consumes: `getPageEntry(slug, lang)`, `getPageHero`, `getPageBlocks`, `pageAlternates`, home article query.
- Produces: indexable `/en/` page with English hero, link grid, and latest-article listing.

- [ ] **Step 1: Write the failing test**

Create `tests/english-page-content.test.mjs` with a shared assertion helper and Home fixture:

```js
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { parse as parseYaml } from "yaml";
import { parseFrontmatterContent } from "../src/lib/content-validation.ts";

const readEntry = async (file) => {
  const raw = await readFile(new URL(`../src/content/pages/${file}`, import.meta.url), "utf8");
  const fm = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  return { raw, data: parseYaml(fm?.[1] ?? "{}"), body: fm?.[2] ?? "" };
};

const assertEnglishEntry = ({ raw, data, body }) => {
  assert.equal(data.lang, "en");
  assert.equal(body.trim(), "");
  assert.ok(data.intro.startsWith(`${data.title} is `));
  assert.ok(data.featuredImage.alt.includes(` ${data.title.toLowerCase()} `));
  assert.ok(data.featuredImage.alt.includes(" is "));
  assert.ok(data.featuredImage.alt.length < data.intro.length);
  assert.notEqual(data.metaDescription, data.intro);
  assert.notEqual(data.metaDescription, data.featuredImage.alt);
  assert.doesNotMatch(raw, /konsult\p{L}*|consult\p{L}*/iu);
  assert.doesNotMatch(raw, /development status|not yet available|not yet approved|belum dinyatakan|status pengembangan/iu);
  assert.doesNotMatch(raw, /href:\s*["']https?:\/\//iu);
  const { headings } = parseFrontmatterContent(data);
  assert.equal(headings.filter((heading) => heading.level === 1).length, 1);
  for (let i = 1; i < headings.length; i += 1) {
    assert.ok(headings[i].level <= headings[i - 1].level + 1);
  }
};

test("English Home entry is frontmatter-only and policy-compliant", async () => {
  assertEnglishEntry(await readEntry("0030-halaman-home-en.md"));
});
```

Also assert route/CSS source in the same file:

```js
test("English Home route resolves the English entry and alternates", async () => {
  const route = await readFile(new URL("../src/pages/en/index.astro", import.meta.url), "utf8");
  assert.match(route, /getPageEntry\("home", "en"\)/);
  assert.match(route, /canonical="\/en\/"/);
  assert.match(route, /pageAlternates\("home"\)/);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --import tsx --test tests/english-page-content.test.mjs`
Expected: FAIL because content and route files do not exist.

- [ ] **Step 3: Add the English Home entry and route**

Create `0030-halaman-home-en.md` with `slug: home`, `translationKey: page-hal-home`, `lang: en`, `pubDate: "2026-11-24T00:00:00Z"`, one hero, a link-grid with `/en/services/` and `/en/articles/`, and a `listing` block for articles. Use title `Intiprima Sertifikasi Home`; intro and alt begin with that exact title plus `is`. Copy must be substantive English information about certification information, services, and published insights. Use `featuredImage.src: "/images/illustrations/home-assurance-en.webp"`. Keep all visible copy in English.

Create `src/pages/en/index.astro` mirroring `src/pages/index.astro`, but call `getPageEntry("home", "en")`, set `lang="en"`, `canonical="/en/"`, `alternates={pageAlternates("home")}`, and pass `lang={entry.data.lang}` to `PageHero`.

Modify `src/pages/index.astro` to add `alternates={pageAlternates("home")}`.

Create an original SVG master in the existing illustration style and generate its WebP with `pnpm images:illustrations`. Add an asset-register row for the new English Home asset.

- [ ] **Step 4: Run focused checks**

Run: `node --import tsx --test tests/english-page-content.test.mjs && pnpm check && pnpm build`
Expected: PASS, and `dist/en/index.html` exists.

- [ ] **Step 5: Commit**

```bash
git add src/content/pages/0030-halaman-home-en.md src/pages/en/index.astro src/pages/index.astro assets/illustrations/source/home-assurance-en.svg public/images/illustrations/home-assurance-en.webp docs/illustration-library/asset-register.md tests/english-page-content.test.mjs
git commit -m "feat: add English homepage"
```

### Task 6: English CSMS page

**Files:**
- Create: `src/content/pages/0031-halaman-csms-en.md`
- Create: `src/pages/en/csms/index.astro`
- Create: `assets/illustrations/source/csms-safety-en.svg`
- Create: `public/images/illustrations/csms-safety-en.webp`
- Modify: `src/pages/csms/index.astro`, `docs/illustration-library/asset-register.md`, `tests/english-page-content.test.mjs`

**Interfaces:**
- Consumes: Task 5 English entry assertions; `getPageEntry(slug, lang)`, `pageAlternates`.
- Produces: indexable `/en/csms/` with translated nine-element links to existing English fallback stubs.

- [ ] **Step 1: Write the failing tests**

Append to `tests/english-page-content.test.mjs`:

```js
test("English CSMS entry covers the nine elements with English paths", async () => {
  const { data } = await readEntry("0031-halaman-csms-en.md");
  assertEnglishEntry(await readEntry("0031-halaman-csms-en.md"));
  const grid = data.blocks.find((block) => block.type === "link-grid" && block.items.length === 9);
  assert.ok(grid);
  assert.ok(grid.items.every((item) => item.href.startsWith("/en/csms/")));
  const route = await readFile(new URL("../src/pages/en/csms/index.astro", import.meta.url), "utf8");
  assert.match(route, /getPageEntry\("csms", "en"\)/);
  assert.match(route, /canonical="\/en\/csms\/"/);
  assert.match(route, /pageAlternates\("csms"\)/);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --import tsx --test tests/english-page-content.test.mjs`
Expected: FAIL for missing CSMS files.

- [ ] **Step 3: Add the English CSMS entry and route**

Create the entry with `slug: csms`, `translationKey: page-hal-csms`, `lang: en`, title `Contractor Safety Management System (CSMS)`, and the same publication date as the English Home entry. Include a hero, a definition content section, a nine-item link-grid with `/en/csms/<slug>/` hrefs, scope content, a CSMS-versus-ISO-45001 explanation, FAQ, and a CTA to `/en/services/`. Use `featuredImage.src: "/images/illustrations/csms-safety-en.webp"`.

Create `src/pages/en/csms/index.astro` mirroring the ID CSMS route with `isCsms`, `lang="en"`, `canonical="/en/csms/"`, and `alternates={pageAlternates("csms")}`.

Modify `src/pages/csms/index.astro` to add `alternates={pageAlternates("csms")}`.

Create and register the new English CSMS illustration using the documented SVG-to-WebP pipeline.

- [ ] **Step 4: Run focused checks**

Run: `node --import tsx --test tests/english-page-content.test.mjs && pnpm check && pnpm build`
Expected: PASS, and `dist/en/csms/index.html` exists.

- [ ] **Step 5: Commit**

```bash
git add src/content/pages/0031-halaman-csms-en.md src/pages/en/csms/index.astro src/pages/csms/index.astro assets/illustrations/source/csms-safety-en.svg public/images/illustrations/csms-safety-en.webp docs/illustration-library/asset-register.md tests/english-page-content.test.mjs
git commit -m "feat: add English CSMS page"
```

### Task 7: English About page

**Files:**
- Create: `src/content/pages/0032-halaman-about-us-en.md`
- Create: `src/pages/en/about-us/index.astro`
- Create: `assets/illustrations/source/about-organization-en.svg`
- Create: `public/images/illustrations/about-organization-en.webp`
- Modify: `src/pages/[slug].astro`, `docs/illustration-library/asset-register.md`, `tests/english-page-content.test.mjs`

**Interfaces:**
- Consumes: Task 5 English entry assertions; `getPageEntry(slug, lang)`, `pageAlternates`, `siteCrumb`.
- Produces: indexable `/en/about-us/`; generic ID route skips English entries.

- [ ] **Step 1: Write the failing tests**

Append to `tests/english-page-content.test.mjs`:

```js
test("English About entry has English contact labels and a paired route", async () => {
  const { data } = await readEntry("0032-halaman-about-us-en.md");
  assertEnglishEntry(await readEntry("0032-halaman-about-us-en.md"));
  const contact = data.blocks.find((block) => block.type === "contact");
  assert.deepEqual(contact.labels, { email: "Email", phone: "Phone", address: "Address" });
  const route = await readFile(new URL("../src/pages/en/about-us/index.astro", import.meta.url), "utf8");
  assert.match(route, /getPageEntry\("about-us", "en"\)/);
  assert.match(route, /canonical="\/en\/about-us\/"/);
  assert.match(route, /pageAlternates\("about-us"\)/);
  const generic = await readFile(new URL("../src/pages/[slug].astro", import.meta.url), "utf8");
  assert.match(generic, /entry\.data\.lang !== "en"/);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --import tsx --test tests/english-page-content.test.mjs`
Expected: FAIL for missing About files and generic-route filter.

- [ ] **Step 3: Add the English About entry and route**

Create the entry with `slug: about-us`, `translationKey: page-hal-about-us`, `lang: en`, title `About Intiprima Sertifikasi`, and the same publication date as the other English entries. Include a hero, focus/organization content, principles, a trust-and-accuracy section, and a `contact` block with English labels. Contact values come from `site.ts` through `ContactPanel`; do not duplicate them in frontmatter. Use `featuredImage.src: "/images/illustrations/about-organization-en.webp"`.

Create `src/pages/en/about-us/index.astro` mirroring the generic page route with `lang="en"`, `canonical="/en/about-us/"`, `alternates={pageAlternates("about-us")}`, and `breadcrumbs={[siteCrumb("/", "en"), { label: entry.data.title }]}`.

Modify `src/pages/[slug].astro` to filter out `entry.data.lang === "en"` and add `alternates={pageAlternates(entry.data.lang === "id" ? entry.data.slug : "")}`.

Create and register the new English About illustration using the documented pipeline.

- [ ] **Step 4: Run focused checks**

Run: `node --import tsx --test tests/english-page-content.test.mjs && pnpm check && pnpm build`
Expected: PASS, and `dist/en/about-us/index.html` exists.

- [ ] **Step 5: Commit**

```bash
git add src/content/pages/0032-halaman-about-us-en.md src/pages/en/about-us/index.astro 'src/pages/[slug].astro' assets/illustrations/source/about-organization-en.svg public/images/illustrations/about-organization-en.webp docs/illustration-library/asset-register.md tests/english-page-content.test.mjs
git commit -m "feat: add English About page"
```

### Task 8: Documentation, built-page assertions, and full gate

**Files:**
- Modify: `AGENTS.md`, `docs/architecture.md`, `docs/bilingual-content.md`, `docs/superpowers/specs/2026-11-23-localized-navigation-labels-design.md`
- Modify: `src/lib/sitemap-lastmod.mjs`, `tests/page-sitemap-lastmod.test.mjs`, `tests/page-docs-contract.test.mjs`, `tests/english-page-content.test.mjs`, `scripts/audit-page-images.mjs`

**Interfaces:**
- Consumes: built output from Tasks 5–7.
- Produces: documentation matches implemented page phase; built HTML assertions pin real pages, canonicals, alternates, and nav hrefs.

- [ ] **Step 1: Write the failing built-page tests**

Add `existsSync` and `readFileSync` to the existing `node:fs` import in `tests/english-page-content.test.mjs`, then append:

```js
const builtHtml = (path) => readFileSync(new URL(`../dist/${path}`, import.meta.url), "utf8");

test("built English main-menu pages are real indexable pages", () => {
  for (const path of ["en/index.html", "en/csms/index.html", "en/about-us/index.html"]) {
    assert.ok(existsSync(new URL(`../dist/${path}`, import.meta.url)));
    const html = builtHtml(path);
    assert.doesNotMatch(html, /http-equiv=["']refresh["']/);
    assert.match(html, /<html lang="en"/);
    assert.match(html, /<link rel="canonical"/);
    assert.match(html, /rel="alternate" hreflang="id"/);
    assert.match(html, /rel="alternate" hreflang="en"/);
    assert.match(html, /href="\/en\/services\/"/);
    assert.doesNotMatch(html, />\s*Beranda\s*</);
  }
});
```

Append to `tests/page-sitemap-lastmod.test.mjs`:

```js
test("English page entries use their own routes and metadata", () => {
  assert.equal(getContentLastmod("/en/"), "2026-11-24T00:00:00Z");
  assert.equal(getContentLastmod("/en/csms/"), "2026-11-24T00:00:00Z");
  assert.equal(getContentLastmod("/en/about-us/"), "2026-11-24T00:00:00Z");
  assert.equal(getContentLastmod("/csms/"), "2026-11-24T00:00:00Z");
});
```

Update `tests/page-docs-contract.test.mjs` so the bilingual standard test asserts the new state:

```js
test("bilingual standard records localized main-menu page entries", () => {
  assert.match(bilingual, /Page entries are no longer ID-only/);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm build && node --import tsx --test tests/english-page-content.test.mjs tests/page-docs-contract.test.mjs tests/page-sitemap-lastmod.test.mjs`
Expected: FAIL on documentation contract and English lastmod; built HTML assertions pass only after build.

- [ ] **Step 3: Update docs and audits**

Replace the ID-only claims in `AGENTS.md`, `docs/architecture.md`, and `docs/bilingual-content.md` with the implemented scope: English page entries exist for Home, CSMS, and About; Services already has English pages; remaining menu routes stay stubs.

Change the old localized-navigation design non-goal to state that new English page content is limited to Home, CSMS, and About.

In `src/lib/sitemap-lastmod.mjs`, read `lang` from frontmatter. For `lang: "en"`, write `/en/` for `home` and `/en/<slug>/` otherwise; for ID entries keep current URL mapping. Do not let an English `home` entry overwrite `/`.

Add `/en/`, `/en/csms/`, and `/en/about-us/` to `mainMenuRoutes` in `scripts/audit-page-images.mjs` so English main-menu pages require a frontmatter hero.

Update `tests/page-docs-contract.test.mjs` to match the new documentation wording.

- [ ] **Step 4: Run the full gate**

Run:

```bash
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

Expected: every command exits `0`. Record outputs and page/test counts.

Inspect built pages:

```bash
grep -o '<link rel="canonical"[^>]*>' dist/en/index.html dist/en/csms/index.html dist/en/about-us/index.html
grep -o 'rel="alternate" hreflang="[^"]*"[^>]*>' dist/en/index.html dist/en/csms/index.html dist/en/about-us/index.html
```

Expected: canonicals `/en/`, `/en/csms/`, `/en/about-us/`; reciprocal ID/EN alternates; no noindex redirect markup on the three real pages.

- [ ] **Step 5: Commit**

```bash
git add AGENTS.md docs/architecture.md docs/bilingual-content.md docs/superpowers/specs/2026-11-23-localized-navigation-labels-design.md src/lib/sitemap-lastmod.mjs tests/page-sitemap-lastmod.test.mjs tests/page-docs-contract.test.mjs tests/english-page-content.test.mjs scripts/audit-page-images.mjs
git commit -m "docs: align page phase with English main-menu routes"
```
