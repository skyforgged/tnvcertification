# English main-menu pages — short design

**Date:** 2026-11-24
**Status:** Awaiting approval
**Approach:** Path 2 — real English pages for Home, CSMS, About, and Services; Trainings, Schedules, and Articles keep their existing fallback stubs.

## Intent

The English menu currently shows English labels, but only Services has real English content. Home, CSMS, and About still redirect to Indonesian pages. This change gives the main corporate menu real English surfaces while avoiding a larger translation of training, schedule, and article records that are not ready.

## Goals

- `/en/` serves a real English homepage.
- `/en/csms/` serves a real English CSMS page.
- `/en/about-us/` serves a real English About page.
- `/en/services/` and its detail pages remain the real English service surfaces.
- English navigation and breadcrumbs point to those real routes.
- The language switcher offers English for the three new routes and Indonesian for their counterparts.
- English fallback stubs stop covering routes that now have real English pages.

## Non-goals

- No English training or training-schedule records.
- No English article records or article pagination.
- No English CSMS topic detail pages; topic links on `/en/csms/` may continue to `/en/csms/<slug>/` fallback stubs until translated.
- No new service records and no edits to service copy.
- No changes to company identity or contact data outside `site.ts`.

## Constraints

- `site.ts` remains the single source of truth for navigation, labels, canonical site URL, and shared UI copy.
- Editorial copy lives in validated `src/content/pages/*.md` frontmatter blocks. Routes only resolve entries and render blocks.
- Page entries may now have Indonesian and English variants. Use the same stable `slug` and `translationKey` within each pair; `lang` distinguishes the variant.
- English intro, metadata, image alt text, and visible block copy must be English. Indonesian intro and image alt text must use `adalah`; English must use `is`. The shared validator already derives this copula from `lang` in `src/lib/content-validation.ts` (CONTENT-003 and CONTENT-008); do not weaken or duplicate those rules.
- No internal development, availability, approval, or self-audit copy in public content.
- No competitor backlinks. External references, when needed, must support substantive on-page information.
- Validators, tests, plans, and specs must not require or generate the prohibited status copy.
- Existing sitemap lastmod rules must keep using content metadata, not build time.
- Sitemap stub filtering must exclude real English routes.

## Codebase findings that shape the design

These are current behaviours that the implementation must handle explicitly.

1. `src/data/pages.ts` `getPageEntry(slug)` filters on `slug` only, and `src/pages/[slug].astro` `getStaticPaths()` filters only on `routeOwnedPageSlugs`. Adding EN page entries with the same slugs would create duplicate `/about-us/`, `/`, and `/csms/` routes.
2. `src/lib/locale-fallback.ts` hardcodes `INDEX_PATHS`, including `/csms/`; `src/data/locale-fallback.ts` reserves only `/en/services/` and its detail paths. `src/pages/en/[...path].astro` builds a redirect stub for every remaining path, so `/en/csms/` and `/en/about-us/` would collide with the new real routes.
3. `src/lib/sitemap-lastmod.mjs` maps `pages` to root URLs by `slug` alone. A same-slug EN entry would overwrite the Indonesian lastmod, and `/en/`, `/en/csms/`, `/en/about-us/` would get no content-derived lastmod.
4. `primaryNavigation` in `src/site.ts` stores one `href` per item, and `localizedCrumbs.en` covers only `/`, `/services/`, and `/articles/`. `src/components/SiteHeader.astro` hardcodes the logo `href="/"` and computes `aria-current` from the Indonesian hrefs; `src/components/SiteFooter.astro` renders the same nav hrefs.
5. `src/lib/locale-switch.ts` `counterpartHref()` only handles service detail, article detail, and the service index. Page paths are not mapped to page entries yet.
6. The fork's hero work is newer than this spec: `MainMenuHero` has an `about` variant through `isElevated`, `PageHero` exposes `isAbout`, and `src/pages/[slug].astro` renders the hero in the `fullBleed` slot with breadcrumbs above it. The English About route must follow that pattern. `isHome` and `isCsms` apply to the other two new routes.
7. `siteSettings.footer.serviceDescription` and `trainingDescription` in `src/site.ts` still produce Indonesian text for English detail pages. Keep them out of the new English surfaces or localize them in the same change.

## Design

1. Add three English `pages` entries paired by `translationKey` with the existing Home, CSMS, and About entries. Each entry uses frontmatter blocks only, includes a hero, substantive English copy, unique `metaDescription`, and one `featuredImage`.
2. Add a language-aware page selector in `src/data/pages.ts`. Existing callers keep working with the Indonesian default: `getPageEntry()` accepts `lang: "id"` by default, and its filter checks both `slug` and `lang`. Update every caller explicitly, including `src/pages/index.astro`, `src/pages/services/index.astro`, `src/pages/csms/index.astro`, `src/pages/trainings/index.astro`, `src/pages/schedules/index.astro`, `src/pages/articles/index.astro`, `src/pages/articles/page/[page].astro`, and the `getStaticPaths()` filter in `src/pages/[slug].astro`, so published EN entries never enter the Indonesian route set.
3. Add English routes for `/en/`, `/en/csms/`, and `/en/about-us/`. Reuse `WidePageLayout`, `PageHero`, and `PageBlockRenderer`; do not duplicate editorial copy in `.astro` files. Match the fork's hero treatment: Home uses the home variant, CSMS uses the CSMS variant, and About uses `isAbout` with the hero in the `fullBleed` slot and breadcrumbs above it.
4. Extend navigation helpers with localized hrefs and update header/footer/breadcrumbs to use them for `lang === "en"`. Expand `localizedCrumbs.en` with `/csms/` and `/about-us/` and point localized crumbs at real English routes. Include the header logo home link and `isCurrent()`/`aria-current` comparison in `SiteHeader.astro`. Menu items without real English pages keep their existing hrefs.
5. Extend the language-switch input with published page entries. Map the current pathname (`/`, `/csms/`, `/about-us/` and their `/en/...` counterparts) to a page entry first, then resolve the counterpart by `translationKey`. Keep existing service and article behaviour.
6. Update English fallback generation so `/en/`, `/en/csms/`, `/en/about-us/`, and `/en/services/` are reserved for real English routes. Add `/en/`, `/en/csms/`, and `/en/about-us/` to `existingEnglishPaths` in `src/data/locale-fallback.ts` alongside the existing service paths. Remove the `/en/` redirect from `astro.config.mjs`.
7. Add reciprocal `hreflang` alternates to the new English pages and their Indonesian counterparts where a pair exists. Make `src/lib/sitemap-lastmod.mjs` language-aware so EN page entries populate `/en/`, `/en/csms/`, and `/en/about-us/` without overwriting Indonesian lastmods.
8. Add tests for language-aware page lookup, duplicate-route prevention, localized navigation hrefs (including logo and `aria-current`), language-switch counterparts, fallback exclusion, EN lastmod mapping, and built HTML.

## Files expected to change

- Create: three English page entries in `src/content/pages/`.
- Create: `src/pages/en/index.astro`, `src/pages/en/csms/index.astro`, `src/pages/en/about-us/index.astro` or equivalent static route.
- Modify: `src/site.ts`, `src/data/pages.ts`, `src/data/locale-fallback.ts`, `src/data/locale-switch.ts`, `src/lib/locale-fallback.ts`, `src/lib/locale-switch.ts`, `src/lib/navigation.ts`, `src/lib/sitemap-lastmod.mjs`, `src/components/SiteHeader.astro`, `src/components/SiteFooter.astro`, `src/data/breadcrumbs.ts`, `astro.config.mjs`.
- Modify: `src/pages/[slug].astro` and the `getPageEntry()` callers listed in design step 2. `src/components/page/PageHero.astro` and `src/components/MainMenuHero.astro` need no new variant; the new routes must use the existing `isHome`, `isCsms`, and `isAbout` props.
- Modify or add: tests under `tests/`.
- Modify: `docs/bilingual-content.md` and `docs/architecture.md` so they no longer say all English page paths are stubs. Align the wording of the root `AGENTS.md` intro/alt rule with the validator's language-aware copula.

## Verification

- `npm run check`
- `npm run build`
- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npm run audit:seo`
- `npm run audit:blocks`
- `npm run audit:page-images`
- `npm run audit:headings`
- Inspect `dist/en/index.html`, `dist/en/csms/index.html`, and `dist/en/about-us/index.html` for English content, correct canonicals, real navigation hrefs, breadcrumbs above the hero, and reciprocal alternates.
- Confirm no fallback stub is generated for `/en/`, `/en/csms/`, `/en/about-us/`, or `/en/services/`.
- Confirm the language switcher links to the real counterparts on all four surfaces and reports a missing translation only for the remaining stub routes.
- Confirm sitemap lastmods for the new English routes come from their page entries and that Indonesian lastmods are unchanged.
