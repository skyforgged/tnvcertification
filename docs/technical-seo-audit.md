---
title: Technical SEO and internal link integrity
phase: P12
status: draft
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

## Limitations / follow-up
- This static audit does not validate external links, hreflang reciprocity, robots directives, rich-result eligibility, content quality, or actual production-domain availability.
- Sitemap URL host is not validated because the current configured production domain is a placeholder and remains a launch blocker.
- Local build, CI, and browser verification must be performed before merging.
