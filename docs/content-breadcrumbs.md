---
title: Content breadcrumbs and page consistency
status: merged to main
phase: P11
---

# P11 — Content breadcrumbs

## Scope
Add an accessible breadcrumb trail to article and service detail pages, reinforcing route context and helping users return to archive/index pages.

## Changes
- Add reusable `src/components/Breadcrumbs.astro` with semantic navigation, ordered list, accessible label, and current-page indicator.
- Integrate breadcrumbs in `ArticleLayout.astro`: Home → Articles → Current article.
- Integrate breadcrumbs in `ServiceLayout.astro`: Home → Services → Current service.
- Preserve SEO metadata, JSON-LD, article/service content, and related-article sections.

## Validation
Local validation on `main` at merge commit `e4f3bc2` with Node.js `26.13.1` and pnpm `12.21.0`:

- `npm run check`: PASS, exit `0`.
- `npm run typecheck`: PASS, exit `0`.
- `npm run lint`: PASS, exit `0`.
- `npm run test`: PASS, exit `0`, 33 tests.
- `npm run build`: PASS, exit `0`, 13 pages.

Merged into `main` at `e4f3bc2`. Visual and keyboard review remain separate manual tasks.
