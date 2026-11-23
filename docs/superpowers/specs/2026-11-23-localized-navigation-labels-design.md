# Localized navigation labels — short design

**Date:** 2026-11-23
**Status:** Proposed
**Size:** Small change
**Selected approach:** Localize labels only; keep every href unchanged.

## Intent

On English URLs, the header and footer still show Indonesian menu labels. The owner wants the interface language consistent with the URL. Only real English pages exist for `/en/services/` and its details; other `/en/` paths are redirect stubs to Indonesian content.

## Goals

- Show English menu labels when `lang` is `en`, Indonesian otherwise.
- Apply the same rule to header navigation, footer navigation groups, and footer links.
- Keep every `href` exactly as it is; do not create or repoint English routes.
- Keep all site-wide strings in `src/site.ts` as the single source of truth.
- Localize the small UI chrome strings that surround the menus: skip link, main-navigation label, logo home label, and back-to-top link.

## Non-goals

- No new English page content, translation entries, or `/en/` routes.
- No change to language switcher, breadcrumbs, locale resolver, or fallback stubs.
- No translation of `siteSettings.description`; it stays as the existing SSOT value.
- No visual redesign, new dependency, or client-side language state.

## Constraints

- `site.ts` owns company identity, navigation, and shared settings; components read from it.
- Current `primaryNavigation` and `footerNavigation` are `as const` arrays; adding a field must not weaken their types.
- Only `src/tests` and existing npm scripts are available for verification.

## Approaches considered

1. **Labels only (chosen)** — add `labelEn` to each navigation entry and a small typed selector. Hrefs stay untouched. Lowest risk; English visitors still reach Indonesian content through the existing redirect stubs for pages without a real English surface.
2. **Labels plus real English hrefs** — point `Services` at `/en/services/` and keep the rest. More consistent, but needs per-item exceptions and still mixes languages.
3. **All menu items under `/en/`** — would require real English pages that do not exist. Visitors would land on redirect stubs and could wrongly infer translated content. Rejected.

## Design

- Extend `src/site.ts`:
  - Each `primaryNavigation` item gains `labelEn`.
  - Each `footerNavigation` group gains `titleEn`; each link gains `labelEn`.
  - `siteSettings` gains a `ui` map with `skipToContent`, `mainNavigation`, `logoHome`, and `backToTop`, each with `id` and `en` strings.
- Add `src/lib/navigation.ts` with two pure helpers: `uiLang(lang)` returning `"id" | "en"`, and `navigationLabel(entry, lang)` selecting `labelEn` or `label`. `uiLang` treats any `en` prefix as English and everything else as Indonesian.
- `SiteHeader.astro` uses `navigationLabel(item, lang)` for visible labels and the localized `siteSettings.ui` strings for the nav aria-label and logo aria-label.
- `SiteFooter.astro` accepts `lang: string`, uses `navigationLabel` for group titles and links, and uses the localized back-to-top string.
- `Layout.astro` passes `lang={seo.lang}` to `SiteFooter` and uses the localized skip-link string.
- Keep existing classes, focus rings, `aria-current`, and markup structure unchanged.

## Verification

- Add `tests/localized-navigation.test.mjs`: every navigation entry has a non-empty Indonesian and English label; selector behavior for `id`, `en`, and locale-prefixed values; header and footer source use the selector and do not hardcode menu copy; footer receives `lang`.
- Run `npm run check`, `npm run build`, `npm run typecheck`, `npm run lint`, `npm run test`, `npm run audit:seo`, and `npm run audit:blocks`.
- Inspect built `/en/services/index.html` for English menu labels and absence of the old Indonesian menu labels.
- Record results in `docs/prelaunch-work-status.md` in a separate docs commit.

## Delivery

Commit to upstream `main` after approval, following the repository's direct-to-`main` rule for this repository.
