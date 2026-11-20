# Service catalog foundation audit — 2026-11-20

## Scope
Initial source audit before populating the public service catalog. This is a repository review, not a fresh local test run.

## Existing architecture
- Content collections are registered in `src/data/collections.ts`.
- `services` content uses the shared service schema in `src/content.config.ts`.
- Service detail route is `src/pages/services/[slug].astro`; it excludes entries with `draft: true`.
- Service index route is `src/pages/service/index.astro`; it also excludes entries with `draft: true`.
- Service entries can link related articles through their numeric `id`.

## CSMS
- Existing plan documented in `docs/service-catalog.md`.
- CSMS means Contractor Safety Management System (contractor occupational safety assessment), not automotive cybersecurity CSMS / UN R155.
- Keep it unpublished/draft until scheme, criteria, scope, assessment process, and authority/recognition claims are verified.
- Existing planned slug: `csms-contractor-safety-management-system`.

## Issues to resolve before public content expansion
1. `src/site.ts` currently contains apparent placeholder contact information: example email domain, generic phone, and street/postal address. These must be confirmed and replaced before launch. Do not use these placeholders in new public content.
2. The service index route has hardcoded page title, description, heading, and intro. Consider centralizing shared page metadata and copy where appropriate, consistent with the site's SSOT policy.
3. The service schema requires editorial fields including `title`, `intro`, `slug`, `metaDescription`, `pubDate`, `featuredImage`, `lang`, and `translationKey`; services also require positive numeric `id`. Draft content still must conform to this schema.
4. Build logs previously reported empty service/category/certification/training/schedule collections. Empty collection warnings are not necessarily build failures, but the catalog routes will remain empty until content is added.

## Next steps
- Confirm actual company contact/address/domain values before launch-critical sitewide changes.
- Prepare service entries one at a time, with researched scope and non-unsupported certification claims.
- Use `draft: true` for entries awaiting verification or approval; the routes filter drafts from public pages.
- Run install/check/typecheck/lint/test/build on the pinned Node 26.13.1 + pnpm 12.21.0 environment after content changes. No fresh local run is claimed by this audit.
