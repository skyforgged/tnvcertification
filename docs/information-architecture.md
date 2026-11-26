# Information architecture contract

QG-13 is an automated build-time check of the published route graph. It complements the human editorial assessment QG-12.

## Sources of truth
- `src/data/information-architecture.ts`: core routes, route families, permanent redirects.
- `src/site.ts`: primary and footer navigation labels and destinations.
- Astro `dist/`: routes that actually exist after static generation.
- Generated sitemap: indexable URL discovery; it must agree with built pages.
- Rendered HTML: canonical links, navigation, breadcrumbs, and internal links.
- Content collections and route files own dynamic records. Do not duplicate every content slug in this manifest.

## Rules
| Rule | Requirement |
|---|---|
| IA-001 | Every declared core route exists and is indexable. |
| IA-002 | Built route and canonical URL agree. |
| IA-003 | Every indexable canonical page appears in sitemap. |
| IA-004 | Sitemap contains only indexable canonical pages. |
| IA-005 | Primary and footer navigation targets are indexable. |
| IA-006 | Rendered breadcrumb targets are indexable. |
| IA-007 | Configured permanent redirects generate redirect pages. |
| IA-008 | Redirect targets are indexable. |
| IA-009 | Redirect sources are excluded from sitemap. |
| IA-010 | Orphan indexable pages are warnings, not build failures, pending baseline review. |
| IA-011 | Every indexable route belongs to a declared family or is a root-level content page. |
| IA-012 | Configured navigation destinations are actually rendered. |

## Run
```sh
npm run build
npm run audit:ia
```
The audit runs against `dist/` after production build in CI. It complements SEO link/canonical checks and editorial validation; it does not judge content usefulness or completeness, which remains QG-12.

## Listing and related-content policy coverage

The route/sitemap audit is complemented by deterministic query tests in the same CI test suite:

- Article ordering is centralized in `src/data/articles.ts`: effective date descending, publication date descending, collection file ID ascending, then slug ascending.
- Homepage articles use global ranks 1–3; service-index articles use ranks 4–6 and do not repeat the homepage set.
- Related articles require an explicit `serviceId` match; labels or similar slugs are not used to infer a relation.
- Article archive pagination is tested for crawlable previous/next/page links.
- Upcoming schedules exclude past, date-less, and cancelled sessions; choose the nearest eligible sessions; then display that selected set in descending date order with a slug tie-breaker.
- Training catalogue and schedule coverage are tested against the declared collection inventory.

These tests protect the current project policies. If a listing's filter, order, limit, or relation changes, update its tests and this document in the same change.
