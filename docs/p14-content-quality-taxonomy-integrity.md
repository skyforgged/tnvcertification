# P14 — Content Quality & Taxonomy Integrity

## Status and scope

P14 is a content audit and corrective pass, not a certification-scope approval. Category records remain planning taxonomy and retain `planned` status. No services, accreditation, authorization, scheme availability, or certification claims are activated.

## Audit criteria

- Assign a category only when it clearly reflects the article's primary subject.
- Do not force broad or cross-domain articles into a category simply to avoid uncategorized content.
- Keep standard-specific content in the domain category of the standard (ISO 45001 is Occupational Health & Safety, not Quality Management).
- Treat article category assignment as editorial metadata; it is not proof of a scheme/service relationship.
- Preserve stable category slugs and translation keys. Localized labels may differ naturally between Indonesian and English.
- Do not mix languages within localized content beyond standard names and intentional terms.

## Article mapping review (main baseline)

| Article | Existing category | Decision |
|---|---|---|
| 0001 Posisi Kualitas sebagai Talenta Kompetitif | quality-management | Keep: quality profession and quality culture |
| 0002 Sertifikasi ISO 9001:2015 | quality-management | Keep: ISO 9001 quality management |
| 0003 Mengendalikan Risiko Kualitas di Pabrik | quality-management | Keep: quality risk and production quality |
| 0004 Sertifikasi ISO 45001:2018 | quality-management | Correct to occupational-health-safety |
| 0005 Manajemen Beasiswa Kualitas di Industri | quality-management | Keep: quality talent development |
| 0006 Penilaian Kepatuhan Terhadap Standar Global | quality-management | Remove: generic compliance article spans domains and lacks a clearly supported primary category |
| 0007 Proses Audit Sertifikasi ISO 9001:2015 | quality-management | Keep: ISO 9001 audit process |
| 0008 Manajemen Kualitas Nonkonformitas | quality-management | Keep: quality nonconformity management |
| 0009 Manfaat Sertifikasi ISO 9001:2015 bagi Perusahaan | quality-management | Keep: ISO 9001 benefits |

## Bilingual taxonomy quality

Category pairs are reviewed as localized equivalents, not word-for-word translations. Each pair should have one Indonesian and one English record, the same stable slug and translation key, and the same publication-planning status. A test can enforce structural parity; editorial review is still required for nuance and meaning.

## Integrity rules

- Category slug format is lowercase kebab-case.
- Translation groups contain exactly one `id` and one `en` record.
- Both translated records use the same stable slug and status.
- No duplicate slug/language records or duplicate references on a content entry.
- Content category references must resolve to known slugs.

Automated tests do not determine topical relevance. The relevance audit and mapping decisions in this document remain a manual editorial responsibility.

## Reviewed outcome

- Corrected the ISO 45001 article to Occupational Health & Safety.
- Removed the category from the generic global-compliance article to avoid implying a narrow quality-management focus.
- Existing other article assignments remain aligned with the article topics.
- No certification service or scheme status changed.
