# P16.3 — Bilingual Article Integration & SEO Readiness

## Scope and outcome

P16.3 integrates the first Indonesian/English document-control article pair as internal drafts. The work does not publish either article or activate the planned quality-management category.

## Implemented on main

- Locale-aware editorial validation: Indonesian intro/alt wording uses `adalah`; English uses `is`.
- Article drafts can omit `pubDate` and `featuredImage` while `draft: true`; published articles remain subject to mandatory publication-date and featured-image checks.
- Published article route generation has a runtime guard for required metadata.
- Article translation pairs use the shared `translationKey` to generate reciprocal hreflang links only for records included in the published collection.
- Article detail pages render the featured image and localize the date format and breadcrumb labels.
- Added the bilingual records below, both marked `draft: true`.

## Draft records

| Field | Indonesian | English |
|---|---|---|
| File | `0010-pengendalian-dokumen-iso-9001-id.md` | `0011-iso-9001-document-control-en.md` |
| Slug | `pengendalian-dokumen-iso-9001` | `iso-9001-document-control` |
| Language | `id` | `en` |
| Shared translationKey | `article-document-control-iso-9001` | `article-document-control-iso-9001` |
| Category | `quality-management` (planned) | `quality-management` (planned) |
| Draft | `true` | `true` |
| pubDate | Omitted pending approval | Omitted pending approval |
| featuredImage | Omitted pending licensed asset | Omitted pending licensed asset |

Draft status excludes these records from published article queries, detail routes, archive listings, and sitemap output. No publication date or image path has been fabricated.

## Standards research update — 21 November 2026

ISO's official catalogue states that ISO 9001:2026, sixth edition, was published on 16 September 2026 and replaces ISO 9001:2015. The bilingual article records have therefore been updated to identify ISO 9001:2026 as the current edition and to remove the 2015 guidance PDF as a current-edition reference.

Official references:
- ISO 9001:2026 catalogue: https://www.iso.org/standard/9001
- ISO publication announcement (16 September 2026): https://www.iso.org/news/2026/09/ISO9001-2026
- ISO/TC 176 transition guidance: https://committee.iso.org/sites/tc176sc2/home/news/content-left-area/news-and-updates/news-2.html
- ISO 10013:2021 documented-information guidance: https://www.iso.org/standard/75736.html

The article remains general guidance, not a clause-by-clause interpretation. Technical review against a licensed copy of ISO 9001:2026 remains required before publication.

## Remaining publication gates

1. Obtain technical review against the official ISO 9001:2026 text.
2. Review Indonesian/English technical equivalence and terminology.
3. Select and verify an owned or licensed featured image and localized alt text.
4. Approve publication dates.
5. Review internal links and any service references.
6. Run all CI quality gates and inspect the built output before changing either record from draft.

## Status

P16.3 implementation is in progress. Article records exist as unpublished drafts. No public routes, publication dates, image assets, or unsupported certification claims have been added.
