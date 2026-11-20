# Pre-launch work status — 2026-11-20

## Current checkpoint

Repository: `tnvcertification/tnvcertification`  
Base branch: `main`  
Completed audit branch: `prep/site-identity-taxonomy-audit` (merged via PR #3)  
Current implementation branch: `feat/bilingual-service-taxonomy`

The current implementation is isolated from `main` and contains taxonomy schema, planned bilingual category records, and build-time reference validation. No category routes, certification scheme records, or active service claims have been published.

## Completed in the previous audit branch

| Commit | Change |
|---|---|
| `eea6d3b` | Audit `src/site.ts` and document placeholder identity/contact values |
| `051403a` | Define service taxonomy, multilingual category rules and explicit scheme relationships |
| `ac14094` | Record pre-launch work status |

The audit branch was merged into `main` by PR #3 (`ab54c88`).

## Current implementation branch

| Commit | Change |
|---|---|
| `c747167` | Add bilingual taxonomy cross-validation and tests |
| `fbd70ea` | Add 12 planned category groups (24 Indonesian/English records), category status schema, and explicit CSMS category reference |

## Roadmap status

| Phase | Scope | Status |
|---|---|---|
| P1 | Foundation and architecture audit | Completed in prior work |
| P2 | CSMS planned-service draft | Completed; remains `draft: true` |
| P3 | Site identity / `site.ts` SSOT audit | Audit completed; code replacement blocked on confirmed company details |
| P4 | Service taxonomy design and implementation | 12 bilingual category pairs and reference validation implemented; build verification pending |
| P5 | ISO service/scheme catalog | Planning shortlist exists; TNCV authority/scope/partner evidence must be confirmed |
| P6 | Article-to-service relationships | Architecture exists; requires canonical service records and editorial mapping |
| P7 | Service SEO and structured data | Shared SEO/JSON-LD helpers exist; verify against approved canonical service data |
| P8 | Full quality gate | Must be run on the final implementation and deployment runtime |

## Verified repository facts

- `src/site.ts` is the intended company/site SSOT.
- Its current canonical domain, email, telephone and street address include placeholder/unconfirmed values; these must not be used for production.
- Organization JSON-LD emits contact/address fields from that configuration.
- The content registry includes articles, services, categories, certifications, training, training schedules and pages.
- The category collection now contains 12 candidate groups as 24 localized records, all `status: planned`; no public category routes exist.
- The certification collection currently has no content records.
- The services collection currently contains a CSMS draft; it is not a published service.
- Current repository runtime policy pins Node.js `26.13.1` in `.node-version` / `.nvmrc`, with `package.json` engine `>=26.13.1 <27`; pnpm is `12.21.0`.
- Current TypeScript is `7.1.0-beta`; TypeScript 6.x is prohibited by repository policy. This is a beta exception, not a stable release.

## External confirmations needed

1. Production domain.
2. Correct legal/public company address and postal code (project context includes WTC 3, 20th Floor, R30, Jl. Jendral Sudirman; full formatting remains to be confirmed).
3. Official email and telephone/WhatsApp.
4. Official social profiles and approved logo.
5. TNCV's exact certification/assessment scope, accreditation and authorization evidence, including any partner-delivered schemes.

Do not replace these values with guesses. If a field is optional and not confirmed, omit it from public UI and structured data after checking the relevant component contracts.

## Next implementation sequence

1. Resolve the site identity inputs above, then update `src/site.ts` and any optional-field consumers in a dedicated code commit.
2. Implement taxonomy/category schema refinements and bilingual category entries in a separate commit.
3. Add verified certification scheme records and explicit service-to-scheme relationships; do not publish unverified standards.
4. Add cross-collection checks for dangling category, scheme and service references.
5. Complete service/article mapping and service SEO.
6. Run `check`, `typecheck`, `lint`, `test` and `build` on the pinned Node/pnpm toolchain, then inspect generated routes and JSON-LD.

## Validation note

No local install, typecheck, test, lint, or build has been run for `feat/bilingual-service-taxonomy` in this environment. The previous build report belongs to an earlier HEAD and is not validation of these commits. Keep the PR unmerged until CI or a local full validation run is available.
