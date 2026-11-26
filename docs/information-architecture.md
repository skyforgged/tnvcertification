# Information architecture contract

This document describes the automated QG-13 gate for the production route graph.

## Source of truth

- `src/data/information-architecture.ts` records core routes, route families, and permanent redirects.
- `src/site.ts` remains authoritative for primary and footer navigation labels and destinations.
- Astro's generated `dist/` output is authoritative for routes that actually exist after static generation.
- The generated sitemap is authoritative for indexable URL discovery, but it must agree with the built pages.
- Breadcrumbs are validated from rendered HTML, not guessed from route names.

Do not maintain a second hand-written inventory of every article, service, training, or CSMS topic URL. Dynamic records remain owned by their content collections and their route files.

## Blocking rules

| Rule | Requirement |
|---|---|
| IA-001 | Every declared core route exists and is indexable. |
| IA-002 | Every indexable canonical page appears in the sitemap. |
| IA-003 | Sitemap URLs resolve to indexable canonical pages only. |
| IA-004 | Primary and footer navigation destinations resolve to indexable canonical pages. |
| IA-005 | Every rendered breadcrumb destination resolves to an indexable canonical page. |
| IA-006 | Every configured permanent redirect emits a redirect page. |
| IA-007 | Every redirect target resolves to an indexable canonical page. |
| IA-008 | Redirect source URLs are excluded from the sitemap. |
| IA-010 | Every configured navigation destination is actually rendered in the site navigation. |

IA-009 reports an indexable page with no incoming internal link as a warning initially. This is intentionally non-blocking until the existing content graph has been reviewed and a baseline established; an orphan can be intentional (for example, a campaign or externally distributed page) but must be consciously accepted.

## Running the audit

```sh
npm run build
npm run audit:ia
```

The audit runs against `dist/` and should run after the production build in CI. It complements, rather than replaces, the SEO link/canonical audit and editorial validation. It does not decide whether content is useful or editorially complete; that remains the human QG-12 review.
