# Localized Navigation Labels Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show English navigation labels on English URLs while preserving every existing link target.

**Architecture:** Navigation labels live beside their existing labels in `src/site.ts`. A pure `src/lib/navigation.ts` helper selects the Indonesian or English field from a `lang` value. Header, footer, and layout chrome read that helper and the localized `siteSettings.ui` strings; no route or content schema changes.

**Tech Stack:** Astro `7.4.13`, TypeScript `7.1.0-beta`, Tailwind CSS `4.3.5`, Node test runner with `tsx`.

**Spec:** `docs/superpowers/specs/2026-11-23-localized-navigation-labels-design.md`

## Global Constraints

- "Localize labels only; keep every href unchanged."
- "Keep all site-wide strings in `src/site.ts` as the single source of truth."
- "No new English page content, translation entries, or `/en/` routes."
- "No change to language switcher, breadcrumbs, locale resolver, or fallback stubs."
- "No translation of `siteSettings.description`; it stays as the existing SSOT value."
- "No visual redesign, new dependency, or client-side language state."
- Commit directly to upstream `main`.

## Review Focus

- English page request: `/en/services/` must render `Home`, `Services`, `About`, `Trainings`, and localized chrome; pinned in Task 2 build inspection.
- Indonesian page request: `/` must keep `Beranda`, `Layanan`, and existing Indonesian chrome; pinned in Task 1 selector test and Task 2 source test.
- Locale-prefixed or unknown `lang`: `en-US` selects English, `id-ID` and unknown values select Indonesian without throwing; pinned in Task 1 `uiLang` test.
- Link integrity: every header and footer `href` stays byte-for-byte unchanged; pinned in Task 1 href test.
- Incomplete localization: missing `labelEn`, `titleEn`, or `siteSettings.ui.en` value must be caught before merge; pinned in Task 1 coverage test and Task 2 source tests.

---

### Task 1: Navigation data and selector

**Files:**
- Modify: `src/site.ts:40-95`
- Create: `src/lib/navigation.ts`
- Test: `tests/localized-navigation.test.mjs`

**Interfaces:**
- Consumes: `siteSettings`, `primaryNavigation`, `footerNavigation` from `src/site.ts`.
- Produces: `UiLang`, `uiLang(lang: string): UiLang`, and `navigationLabel(entry: { label: string; labelEn: string }, lang: string): string`.

- [ ] **Step 1: Write the failing test**

Create `tests/localized-navigation.test.mjs` with these assertions:

```js
import assert from "node:assert/strict";
import test from "node:test";
import { navigationLabel, uiLang } from "../src/lib/navigation.ts";
import { footerNavigation, primaryNavigation, siteSettings } from "../src/site.ts";

test("uiLang maps explicit and locale-prefixed values", () => {
  assert.equal(uiLang("id"), "id");
  assert.equal(uiLang("id-ID"), "id");
  assert.equal(uiLang(""), "id");
  assert.equal(uiLang("en"), "en");
  assert.equal(uiLang("en-US"), "en");
});

test("navigationLabel selects the requested language", () => {
  const entry = { label: "Layanan", labelEn: "Services" };
  assert.equal(navigationLabel(entry, "id"), "Layanan");
  assert.equal(navigationLabel(entry, "en"), "Services");
  assert.equal(navigationLabel(entry, "en-GB"), "Services");
});

test("primary navigation keeps canonical hrefs and gains English labels", () => {
  assert.deepEqual(
    primaryNavigation.map((entry) => [entry.href, entry.label, entry.labelEn]),
    [
      ["/", "Beranda", "Home"],
      ["/services/", "Layanan", "Services"],
      ["/csms/", "CSMS", "CSMS"],
      ["/about-us/", "Tentang", "About"],
      ["/trainings/", "Pelatihan", "Trainings"],
      ["/schedules/", "Jadwal", "Schedules"],
      ["/articles/", "Artikel", "Articles"],
    ],
  );
});

test("footer navigation keeps canonical hrefs and gains English labels", () => {
  assert.deepEqual(
    footerNavigation.map((group) => ({
      title: group.title,
      titleEn: group.titleEn,
      links: group.links.map((link) => [link.href, link.label, link.labelEn]),
    })),
    [
      {
        title: "Mulai",
        titleEn: "Get started",
        links: [
          ["/", "Beranda", "Home"],
          ["/services/", "Layanan", "Services"],
          ["/csms/", "CSMS", "CSMS"],
          ["/about-us/", "Tentang", "About"],
          ["/trainings/", "Pelatihan", "Trainings"],
          ["/schedules/", "Jadwal pelatihan", "Training schedules"],
        ],
      },
      {
        title: "Baca",
        titleEn: "Read",
        links: [["/articles/", "Artikel dan panduan", "Articles and guides"]],
      },
    ],
  );
});

test("localized UI chrome has both languages", () => {
  for (const value of Object.values(siteSettings.ui)) {
    assert.ok(value.id, "missing Indonesian UI string");
    assert.ok(value.en, "missing English UI string");
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- tests/localized-navigation.test.mjs`

Expected: FAIL because `src/lib/navigation.ts` does not exist and the new fields are absent.

- [ ] **Step 3: Add navigation fields and selector**

In `src/site.ts`, add `labelEn` to every `primaryNavigation` entry and every `footerNavigation` link. Add `titleEn` to every `footerNavigation` group. Use exactly the strings in the failing test.

Add to `siteSettings` inside the existing object, after `languageSwitcher`:

```ts
ui: {
  skipToContent: { id: "Lewati ke konten utama", en: "Skip to main content" },
  mainNavigation: { id: "Navigasi utama", en: "Main navigation" },
  logoHome: { id: "beranda", en: "home" },
  backToTop: { id: "Kembali ke atas ↑", en: "Back to top ↑" },
},
```

Create `src/lib/navigation.ts` with these exports:

```ts
export type UiLang = "id" | "en";

export function uiLang(lang: string): UiLang;

export function navigationLabel(
  entry: { label: string; labelEn: string },
  lang: string,
): string;
```

`uiLang` returns `"en"` only for `lang === "en"` or a value starting with `"en-"`; all other values return `"id"`. `navigationLabel` returns `labelEn` for English and `label` otherwise.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- tests/localized-navigation.test.mjs`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/site.ts src/lib/navigation.ts tests/localized-navigation.test.mjs
git commit -m "feat: add localized navigation labels and selector"
```

---

### Task 2: Header, footer, and layout wiring

**Files:**
- Modify: `src/components/SiteHeader.astro:1-47`
- Modify: `src/components/SiteFooter.astro:1-33`
- Modify: `src/layouts/Layout.astro:1-53`
- Test: `tests/localized-navigation-markup.test.mjs`

**Interfaces:**
- Consumes: `uiLang`, `navigationLabel`, `siteSettings.ui` from Task 1.
- Produces: `SiteFooter` accepts `lang: string`.

- [ ] **Step 1: Write the failing markup test**

Create `tests/localized-navigation-markup.test.mjs`:

```js
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const header = await readFile(
  new URL("../src/components/SiteHeader.astro", import.meta.url),
  "utf8",
);
const footer = await readFile(
  new URL("../src/components/SiteFooter.astro", import.meta.url),
  "utf8",
);
const layout = await readFile(
  new URL("../src/layouts/Layout.astro", import.meta.url),
  "utf8",
);

test("header localizes menu labels and navigation chrome", () => {
  assert.match(header, /import \{ navigationLabel, uiLang \} from "\.\.\/lib\/navigation"/);
  assert.match(header, /const ui = uiLang\(lang\)/);
  assert.match(header, /navigationLabel\(item, lang\)/);
  assert.match(header, /siteSettings\.ui\.mainNavigation\[ui\]/);
  assert.match(header, /siteSettings\.ui\.logoHome\[ui\]/);
  assert.doesNotMatch(header, /aria-label="Navigasi utama"/);
  assert.doesNotMatch(header, /— beranda/);
  assert.doesNotMatch(header, />\s*\{item\.label\}\s*</);
});

test("footer accepts lang and localizes group titles, links, and back-to-top", () => {
  assert.match(footer, /interface Props \{\s*lang: string;\s*\}/);
  assert.match(footer, /const \{ lang \} = Astro\.props/);
  assert.match(footer, /import \{ navigationLabel, uiLang \} from "\.\.\/lib\/navigation"/);
  assert.match(footer, /navigationLabel\(\{ label: group\.title, labelEn: group\.titleEn \}, lang\)/);
  assert.match(footer, /navigationLabel\(link, lang\)/);
  assert.match(footer, /siteSettings\.ui\.backToTop\[ui\]/);
  assert.doesNotMatch(footer, /Kembali ke atas/);
  assert.doesNotMatch(footer, />\s*\{link\.label\}\s*</);
});

test("layout localizes skip link and passes lang to footer", () => {
  assert.match(layout, /import \{ uiLang \} from "\.\.\/lib\/navigation"/);
  assert.match(layout, /const ui = uiLang\(seo\.lang\)/);
  assert.match(layout, /siteSettings\.ui\.skipToContent\[ui\]/);
  assert.match(layout, /<SiteFooter lang=\{seo\.lang\} \/>/);
  assert.doesNotMatch(layout, /Lewati ke konten utama/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- tests/localized-navigation-markup.test.mjs`

Expected: FAIL because components do not import the helper or accept `lang`.

- [ ] **Step 3: Wire components**

In `src/components/SiteHeader.astro`:

- Import `navigationLabel` and `uiLang` from `../lib/navigation`.
- Set `const ui = uiLang(lang);` after destructuring `lang`.
- Replace the logo aria-label suffix `beranda` with `siteSettings.ui.logoHome[ui]`.
- Replace the literal nav aria-label with `siteSettings.ui.mainNavigation[ui]`.
- Replace `{item.label}` with `{navigationLabel(item, lang)}`.

In `src/components/SiteFooter.astro`:

- Add `interface Props { lang: string; }`, destructure `lang`, and set `const ui = uiLang(lang);`.
- Import `navigationLabel` and `uiLang` from `../lib/navigation`.
- Replace both `{group.title}` occurrences with `navigationLabel({ label: group.title, labelEn: group.titleEn }, lang)`.
- Replace `{link.label}` with `navigationLabel(link, lang)`.
- Replace `Kembali ke atas ↑` with `siteSettings.ui.backToTop[ui]`.

In `src/layouts/Layout.astro`:

- Import `uiLang` from `../lib/navigation`.
- Set `const ui = uiLang(seo.lang);` beside the existing `seo` and `jsonLd` constants.
- Replace the skip-link text with `{siteSettings.ui.skipToContent[ui]}`.
- Replace `<SiteFooter />` with `<SiteFooter lang={seo.lang} />`.

Keep all classes, focus rings, `aria-current`, and markup structure unchanged.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- tests/localized-navigation-markup.test.mjs`

Expected: PASS.

- [ ] **Step 5: Run focused build verification**

```bash
export PATH="$HOME/.local/node-v26.13.1/bin:$PATH"
npm run build
grep -q '>Home<' dist/en/services/index.html
grep -q '>Services<' dist/en/services/index.html
grep -q 'aria-label="Main navigation"' dist/en/services/index.html
grep -q '>Back to top ↑<' dist/en/services/index.html
grep -q '>Beranda<' dist/index.html
grep -q 'aria-label="Navigasi utama"' dist/index.html
```

Expected: build exits `0`; every grep finds a match. If a grep fails, inspect the built HTML before committing.

- [ ] **Step 6: Commit**

```bash
git add src/components/SiteHeader.astro src/components/SiteFooter.astro src/layouts/Layout.astro tests/localized-navigation-markup.test.mjs
git commit -m "feat: localize header and footer navigation labels"
```

---

### Task 3: Gate suite and status record

**Files:**
- Modify: `docs/prelaunch-work-status.md`

**Interfaces:**
- Consumes: commits from Tasks 1 and 2.

- [ ] **Step 1: Run full validation**

```bash
export PATH="$HOME/.local/node-v26.13.1/bin:$PATH"
for s in check build typecheck lint test audit:seo audit:blocks; do
  npm run "$s"
done
```

Expected: every script exits `0`; test suite reports 340 passing tests; build reports 36 pages; SEO audit and block audit report no issues.

- [ ] **Step 2: Update status record**

In `docs/prelaunch-work-status.md`, update the validated commit, add a `P19` row for localized navigation labels, and record the validation commands and actual results from Step 1. Do not claim CI success.

- [ ] **Step 3: Commit and push**

```bash
git add docs/prelaunch-work-status.md
git commit -m "docs: record localized navigation validation"
git fetch origin
git rebase origin/main
git push origin main
```

Expected: local `main` matches `origin/main`; working tree clean.
