# P16.3 — Bilingual Article Integration Audit

## Scope

Review the bilingual document-control article draft before adding publishable collection records. This audit checks current article routes, SEO alternate support, content validation rules, image assets, and metadata prerequisites. It does not publish content.

## Current baseline

- The editorial draft at `docs/drafts/p16-document-control-iso9001.md` already contains Indonesian and English sections with corresponding major headings and practical topics.
- The nine existing article records are Indonesian-only (`lang: id`). No English article records are currently present.
- Existing records use unique article slugs and translation keys; retain a shared translation key for the paired ID/EN article records.
- The `quality-management` category has Indonesian and English records with the same canonical slug and is currently `planned`; referencing this slug does not activate the category.

## Integration blockers identified

1. **Language-aware editorial validation:** `src/lib/content-validation.ts` requires the intro to begin with `<title> adalah` and requires featured-image alt text to contain `adalah` for every language. That rule is Indonesian-specific and will reject natural English content. P16.3 must make these checks language-aware and add tests for both languages.
2. **Reciprocal locale SEO:** `src/lib/seo.ts` and `Layout.astro` support hreflang alternates, but `src/pages/articles/[slug].astro` does not supply article alternates. Implement paired translation lookup by stable `translationKey`, then emit reciprocal Indonesian/English alternates (including self) only when both published records exist.
3. **Featured-image rendering:** Article detail pages currently show a generic decorative placeholder instead of rendering the article's `featuredImage`. Metadata can reference the image while visible article content does not display it. P16.3 should wire the verified image into the article layout with responsive dimensions and localized alt text.
4. **Image inventory:** The repository tree has no tracked image assets under `public/` or `src/assets/`; existing article frontmatter points to `/images/articles/0001.jpg` through `0009.jpg`. Verify/restore assets or provide licensed replacements before creating new records. Do not reuse a broken path.
5. **Publication metadata:** Article schema requires `pubDate` even for draft records. Do not assign a fabricated publication date to satisfy schema. Confirm the planned/publication date when the content is approved for collection integration.

## Proposed metadata for the bilingual pair

| Field | Indonesian | English |
|---|---|---|
| Title | Pengendalian Dokumen ISO 9001: Cara Menjaga Informasi Tetap Terkendali | ISO 9001 Document Control: Keeping Documented Information Under Control |
| Slug | pengendalian-dokumen-iso-9001 | iso-9001-document-control |
| Language | id | en |
| Shared translationKey | article-document-control-iso-9001 | article-document-control-iso-9001 |
| Category | quality-management | quality-management |
| Draft | true | true |
| Publication date | Pending approval | Pending approval |
| Featured image | Pending verified asset | Pending verified asset |

Titles/slugs are editorial proposals. The stable translation key is recommended; no collection records have been created in this audit.

## P16.3 implementation order

1. Make editorial intro and featured-image alt validation locale-aware; add unit tests for Indonesian and English cases.
2. Add translation-pair resolution by `translationKey` to article routes and reciprocal hreflang generation.
3. Render verified featured images on article detail pages; keep metadata and visible image consistent.
4. Verify image assets and their licenses/alt text; do not fabricate organizational imagery.
5. Final technical/editorial review of both language versions and source references.
6. Integrate both article records with confirmed metadata, still `draft: true`, then run check, typecheck, lint, tests, build, SEO audit, and inspect route output before publication review.

## Status

P16.2 readiness checkpoint is complete. P16.3 is in progress as an integration audit; code-level fixes and article records are intentionally deferred until assets and publication metadata are verified. No public article records/routes or certification claims were added.
