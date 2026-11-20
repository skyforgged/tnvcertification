# Site identity audit — 2026-11-20

## Status

**P3 audit completed; production identity values are not ready to be published.**

This is a repository inspection of `src/site.ts` and its consumers, not a local build or deployment test.

## Findings

`src/site.ts` is correctly established as the intended single source of truth (SSOT), and `src/lib/seo.ts` and `src/lib/structured-data.ts` consume it. However, several current values are unmistakably placeholders or require owner confirmation:

| Field | Current repository value | Audit result |
|---|---|---|
| Canonical domain | `https://www.intiprima-sertifikasi.dev` | Unconfirmed; do not treat as production domain |
| Email | `sertifikasi@intiprima.example` | Placeholder domain; must not be published |
| Phone | `+62-21-5555-0000` | Generic placeholder; must not be published |
| Street address | `Jalan Pahlawan No. 123` | Placeholder; must not be published |
| City/province/postal code | Jakarta / DKI Jakarta / 10110 | Not independently confirmed for the legal/company address |
| LinkedIn / Instagram | URLs in `sameAs` | Official ownership and current profile URLs unverified |
| Logo | `/logo.svg` | Asset existence and approved brand version need checking |

The project context previously supplied this company address fragment: **WTC 3, 20th Floor, R30, Jl. Jendral Sudirman**. It is more specific than the placeholder currently in code, but the full postal address and exact legal/contact formatting still need confirmation before replacing the current fields.

## Impact

- `organizationJsonLd()` serializes the email, telephone and postal address from `src/site.ts`. Placeholder values therefore flow into machine-readable Organization data, not only visible contact sections.
- `buildSeo()` derives absolute canonical URLs, Open Graph URLs and site names from `siteSettings`. An unconfirmed domain affects canonical and social metadata site-wide.
- The `sameAs` values are emitted as Organization profile references and must not be assumed official without verification.
- Existing architecture comments correctly prohibit company-wide hardcoding outside this module. Keep that SSOT boundary.

## Required owner-confirmed inputs

Before changing production-facing identity values, obtain and verify:

1. Exact production domain, including preferred `www` or apex host.
2. Approved legal/company address formatting, including postal code.
3. Official public email address.
4. Official public telephone/WhatsApp number and preferred display format.
5. Official LinkedIn and Instagram profile URLs, or confirmation that either should be omitted.
6. Approved logo asset and dimensions/format.

Do not invent missing values, and do not publish placeholder contact details. If a value is not yet available, omit it from structured data and public UI rather than emitting a fabricated value; implement omission only after checking the consuming component contracts.

## Next implementation checks

- Search the application for company identity literals outside `src/site.ts`; migrate only true shared company identity/configuration values into the SSOT.
- Check whether every visible contact, CTA, header, footer and SEO component reads from the SSOT.
- Confirm that no component assumes email, phone, address or social links are always present before making those fields optional.
- Validate Organization JSON-LD after real values are supplied.
- Re-run check, typecheck, lint, tests and production build after implementation.

## Scope boundary

This audit does not alter `src/site.ts`, because the production domain and public contact details are not yet confirmed. It does not make claims about certification accreditation, authorization or service scope.
