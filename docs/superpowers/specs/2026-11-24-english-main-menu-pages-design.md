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
- English intro, metadata, image alt text, and visible block copy must be English. Indonesian intro and image alt text must use `adalah`; English must use `is`.
- No internal development, availability, approval, or self-audit copy in public content.
- No competitor backlinks. External references, when needed, must support substantive on-page information.
- Validators, tests, plans, and specs must not require or generate the prohibited status copy.
- Existing sitemap lastmod rules must keep using content metadata, not build time.
- Sitemap stub filtering must exclude real English routes.

## Design

1. Add three English `pages` entries paired by `translationKey` with the existing Home, CSMS, and About entries. Each entry uses frontmatter blocks only, includes a hero, substantive English copy, unique `metaDescription`, and one `featuredImage`.
2. Add a language-aware page selector in `src/data/pages.ts`. Existing callers keep working with the Indonesian default; new English routes request `lang: "en"`.
3. Add English routes for `/en/`, `/en/csms/`, and `/en/about-us/`. Reuse the existing `WidePageLayout`, `PageHero`, and `PageBlockRenderer` components. Do not duplicate editorial copy in `.astro` files.
4. Extend navigation helpers with localized hrefs and update header/footer/breadcrumbs to use them for `lang === "en"`. Menu items without real English pages keep their existing hrefs.
5. Extend the language-switch input with published page entries. Resolve Home, CSMS, About, and Services counterparts by `translationKey`; keep existing service and article behavior.
6. Update English fallback generation so `/en/`, `/en/csms/`, `/en/about-us/`, and `/en/services/` are reserved for real English routes. Remove the `/en/` redirect from `astro.config.mjs`.
7. Add reciprocal `hreflang` alternates to the new English pages and their Indonesian counterparts where a pair exists.
8. Add tests for language-aware page lookup, localized navigation hrefs, language-switch counterparts, fallback exclusion, and built HTML.

## Files expected to change

- Create: three English page entries in `src/content/pages/`.
- Create: `src/pages/en/index.astro`, `src/pages/en/csms/index.astro`, `src/pages/en/about-us/index.astro` or equivalent static route.
- Modify: `src/site.ts`, `src/data/pages.ts`, `src/data/locale-fallback.ts`, `src/data/locale-switch.ts`, `src/lib/locale-fallback.ts`, `src/lib/locale-switch.ts`, `src/lib/navigation.ts`, `src/components/SiteHeader.astro`, `src/components/SiteFooter.astro`, `src/data/breadcrumbs.ts`, `astro.config.mjs`.
- Modify or add: tests under `tests/`.
- Modify: `docs/bilingual-content.md` and `docs/architecture.md` so they no longer say all English page paths are stubs.

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
- Inspect `dist/en/index.html`, `dist/en/csms/index.html`, and `dist/en/about-us/index.html` for English content, correct canonicals, real navigation hrefs, and reciprocal alternates.
- Confirm no fallback stub is generated for the three real English routes.
