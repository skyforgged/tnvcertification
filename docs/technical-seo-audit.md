---
title: Technical SEO and internal link integrity
phase: P12
status: merged to main
---

# P12 — Technical SEO and internal link integrity

## Scope
Introduce a post-build audit for generated static HTML to catch technical SEO and navigation regressions before merge.

## Checks
- Each generated HTML page has exactly one title, meta description, canonical link, and H1.
- Canonical URLs are unique across generated pages.
- Local internal links resolve to a generated HTML route.
- Sitemap XML (including sitemap index files) exists and sitemap URLs resolve to built pages.

## Implementation
- `scripts/audit-seo-build.mjs` is a dependency-free Node script.
- Run it with `pnpm audit:seo` after `pnpm build`.
- Quality workflow runs the audit after the production build.

## Validation
Local validation on `main` at `221d7bc` with Node.js `26.13.1` and pnpm `12.21.0`:

- `npm run check`: PASS, exit `0`.
- `npm run build`: PASS, exit `0`, 13 pages.
- `npm run typecheck`: PASS, exit `0`.
- `npm run lint`: PASS, exit `0`.
- `npm run test`: PASS, exit `0`, 33 tests.
- `npm run audit:seo`: PASS, exit `0`, 13 pages and 13 unique canonicals.

Integration fix after merge: `ArticleLayout.astro` and `ServiceLayout.astro` duplicated the validated H1 and intro from markdown content. Removed the layout-level H1 and intro so the rendered document has one H1. Scoped styles preserve the heading and intro typography.

Merged into `main` at `0f418b2`; integration fix at `221d7bc`.

## Limitations / follow-up
- This static audit does not validate external links, hreflang reciprocity, robots directives, rich-result eligibility, content quality, or actual production-domain availability.
- Sitemap URL host is not validated because the current configured production domain is a placeholder and remains a launch blocker.
- Browser verification remains a separate manual task.
