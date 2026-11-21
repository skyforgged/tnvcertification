# P16.2 — Article Integration & SEO Readiness

## Objective
Define a safe integration path for the approved P16 bilingual document-control article into the publishable article collection. This checkpoint is preparation and review—not publication. Do not add public article records until technical/editorial review and required publication metadata are approved.

## Draft under review
- Source draft: `docs/drafts/p16-document-control-iso9001.md`
- Proposed Indonesian slug: `pengendalian-dokumen-iso-9001`
- Category proposal: `quality-management` (verify canonical slug exists before use)
- Translation key: choose one stable shared key for both locale records; do not derive it from translated title.
- No public records or routes created in this checkpoint.

## Integration requirements verified from the current content schema
The article base schema requires `title`, `intro`, `slug`, `metaDescription`, `pubDate`, `featuredImage` object (`src`, `alt`), `lang` (`id` or `en`), and `translationKey`.

Optional fields include `updatedDate`, `images`, `draft`, `categoryIds`, and `serviceId`.

Do not fabricate `pubDate` or `updatedDate`; set publication dates only when approved. For a draft integration, keep both records marked `draft: true` so they remain excluded from public article routes and indexes.

## Proposed locale record metadata

| Field | Indonesian | English |
|---|---|---|
| Title | Pengendalian Dokumen ISO 9001: Cara Menjaga Informasi Tetap Terkendali | ISO 9001 Document Control: Keeping Documented Information Under Control |
| Slug | pengendalian-dokumen-iso-9001 | iso-9001-document-control |
| lang | id | en |
| translationKey | Shared stable key | Shared stable key |
| categoryIds | quality-management (verify canonical slug) | quality-management (verify canonical slug) |
| draft | true | true |
| pubDate | Only when approved | Only when approved |

Metadata above is a proposal. Confirm the English title, canonical category slug, image asset, and publication dates before converting the draft into collection records.

## Editorial/technical publication gates
1. **Technical accuracy:** Review against a licensed copy of the applicable ISO 9001 edition and current official edition/transition status. This draft intentionally avoids clause numbers and edition-specific assertions.
2. **Terminology:** Confirm consistent use of documented information, document, record, revision, retention, and disposition in Indonesian and English.
3. **Translation parity:** Ensure both locales cover the same points and caveats.
4. **SEO uniqueness:** Meta description must be unique and not copied verbatim from intro or image alt text.
5. **Intro rule:** Each locale must have exactly one intro immediately after H1; Indonesian intro begins with the title followed by “adalah ...”; English uses equivalent natural wording.
6. **Image:** Exactly one featured image object with descriptive alt text explaining the article title using “adalah” (Indonesian). Use owned/licensed imagery and verify asset path.
7. **Taxonomy:** Confirm the category exists and is appropriate; do not activate taxonomy records as a side effect.
8. **Internal links:** Add only verified links to existing relevant articles or service pages; avoid draft/unsupported services.
9. **Claims:** No accreditation, certification availability, authorization, audit outcome, or guarantee claims.
10. **Build/SEO validation:** Run check, typecheck, lint, tests, build, and post-build SEO/link audit; inspect generated routes, canonical, H1, sitemap, and locale links.

## Implementation decision
The GitHub integration available in this checkpoint could not enumerate `src/content/articles/` directory entries reliably. Do not guess article filenames or overwrite article records. Resume integration once current directory listing and existing locale-record patterns are available. This avoids duplicate slugs, schema mismatches, and accidental changes to existing content.

## Next actions
- Technical/editorial approval of the draft and current-standard references.
- Confirm category slug and article filename conventions against the actual article directory.
- Confirm featured-image asset and publication dates.
- Only then add both locale records with `draft: true`, validate, and open a review PR.
