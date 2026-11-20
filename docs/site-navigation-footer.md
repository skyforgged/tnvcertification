---
title: Sitewide navigation and footer
status: merged to main
phase: P10
---

# P10 — Sitewide navigation and footer

## Scope
Introduce consistent sitewide navigation and footer elements using shared configuration. This is a navigation/UX stage only; it does not introduce new service, certification, contact, accreditation, or authorization claims.

## Changes
- `src/site.ts`: added `primaryNavigation` and `footerNavigation` as shared route/label configuration.
- `src/components/SiteHeader.astro`: responsive site identity block and navigation links; current route is marked with `aria-current`.
- `src/components/SiteFooter.astro`: brand description, grouped links, year, and back-to-top link. It intentionally omits placeholder contact details.
- `src/layouts/Layout.astro`: integrated header/footer, added skip-to-content link, landmark IDs, and full-height flex layout.

## Guardrails
- Sitewide navigation labels and paths live in `src/site.ts`.
- Do not expose placeholder contact fields from `src/site.ts` in public UI.
- The approved logo/contact/domain still require confirmation; this change does not replace those values.
- Merged into `main` at `f3f4875`.

## Validation
Local validation on `main` at merge commit `f3f4875` with Node.js `26.13.1` and pnpm `12.21.0`:

- `npm run check`: PASS, exit `0`.
- `npm run typecheck`: PASS, exit `0`.
- `npm run lint`: PASS, exit `0`.
- `npm run test`: PASS, exit `0`, 33 tests.
- `npm run build`: PASS, exit `0`, 13 pages.

Integration fix after merge: removed an unused `organization` import from `src/layouts/Layout.astro` that strict typechecking rejected. Visual and keyboard review remain separate manual tasks.
