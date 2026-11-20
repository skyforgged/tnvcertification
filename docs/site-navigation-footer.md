---
title: Sitewide navigation and footer
status: implemented on feature branch
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
- No changes to `main`; user performs local merge after validation.

## Validation
- Reviewed the current source, route structure, site settings, and layout contracts from GitHub.
- Remote source was updated in multiple commits; local `pnpm check`, `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`, and visual/keyboard review are not run in this environment. Run them on the pinned Node/pnpm toolchain before merging.
