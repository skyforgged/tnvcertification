# Pre-launch work status — 2026-11-20

## Current checkpoint

- Repository: `tnvcertification/tnvcertification`
- Base branch: `main`
- Completed audit branch: `prep/site-identity-taxonomy-audit` (merged via PR #3)
- Completed implementation branch: `feat/bilingual-service-taxonomy` (merged at `736bd14`)
- Validated commit: `72b843c` (merge `feat/p16-document-control-article-draft`)

The taxonomy implementation is merged into `main`. It contains taxonomy schema, planned bilingual category records, and build-time reference validation. Integration fixed stale `categoryIds` references so the build passes. No category routes, certification scheme records, or active service claims have been published.

## Completed in the previous audit branch

| Commit | Change |
|---|---|
| `eea6d3b` | Audit `src/site.ts` and document placeholder identity/contact values |
| `051403a` | Define service taxonomy, multilingual category rules and explicit scheme relationships |
| `ac14094` | Record pre-launch work status |

The audit branch was merged into `main` by PR #3 (`ab54c88`).

## Merged implementation branch

| Commit | Change |
|---|---|
| `c747167` | Add bilingual taxonomy cross-validation and tests |
| `fbd70ea` | Add 12 planned category groups (24 Indonesian/English records), category status schema, and explicit CSMS category reference |
| `9a52d51` | Record bilingual taxonomy implementation status |
| `a68b53b` | Migrate legacy `categoryIds` to canonical slugs so validation and build pass |

## Roadmap status

| Phase | Scope | Status |
|---|---|---|
| P1 | Foundation and architecture audit | Completed in prior work |
| P2 | CSMS planned-service draft | Completed; remains `draft: true` |
| P3 | Site identity / `site.ts` SSOT audit | Audit completed; code replacement blocked on confirmed company details |
| P4 | Service taxonomy design and implementation | Completed; 12 bilingual category pairs and reference validation merged and locally validated |
| P5 | ISO service/scheme catalog | Internal 12-item planned catalog and build-time validation implemented; editions and TNCV scope remain unverified |
| P6 | Article-to-service relationships | Cross-collection validation implemented and merged; no article linked to the draft CSMS service |
| P7 | Service SEO and structured data | Implemented and merged; local checks passed on pinned toolchain |
| P8 | Full quality gate | Local checks passed on pinned toolchain; deployment runtime verification still pending |
| P14 | Content quality and taxonomy integrity | Completed; article assignments corrected and bilingual slug/status validation added |
| P15 | Content expansion and editorial strategy | Completed; topic gaps and an eight-article editorial queue documented; no articles published |
| P16 | Editorial content production | In progress; first Indonesian/English article draft created in docs for review; not published |

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
- `categoryIds` values now use canonical stable slugs. Legacy `kualitas` and `organisasi` references were removed during integration.
- GitHub Actions workflow `.github/workflows/quality.yml` is present on `main`; it runs install, check, lint, test and build on pull requests and pushes to `main`.

## External confirmations needed

1. Production domain.
2. Correct legal/public company address and postal code (project context includes WTC 3, 20th Floor, R30, Jl. Jendral Sudirman; full formatting remains to be confirmed).
3. Official email and telephone/WhatsApp.
4. Official social profiles and approved logo.
5. TNCV's exact certification/assessment scope, accreditation and authorization evidence, including any partner-delivered schemes.

Do not replace these values with guesses. If a field is optional and not confirmed, omit it from public UI and structured data after checking the relevant component contracts.

## Next implementation sequence

1. Start P16 with a researched, reviewed draft of the first editorial priority (document control); avoid bulk article generation.
2. Resolve official company identity/contact/domain inputs and update `src/site.ts` only after confirmation.
3. Verify certification/assessment scope, authorization and accreditation evidence before activating any scheme or service records.
4. Continue content/service relationship and launch-readiness reviews using the SSOT and build-time validations.

## Validation note

Local full validation ran on `main` at `72b843c` with the pinned Node.js `26.13.1` and pnpm `12.21.0` toolchain:

| Command | Result |
|---|---|
| `npm run check` | PASS, exit `0` |
| `npm run build` | PASS, exit `0`, 13 pages |
| `npm run typecheck` | PASS, exit `0` |
| `npm run lint` | PASS, exit `0` |
| `npm run test` | PASS, exit `0`, 35 tests |
| `npm run audit:seo` | PASS, exit `0`, 13 pages and 13 unique canonicals |

GitHub Actions workflow `.github/workflows/quality.yml` is present and configured for install, check, lint, test, build and the post-build SEO audit on pull requests and pushes to `main`. Runs `44845274570` (`6151e50`), `44854428984` (`2733047`) and `44855036386` (`0ce7f0b`) completed with `conclusion: success`. No CI result was available for the current merge before this status update. Build success above comes from local execution on the pinned toolchain, not from CI. Non-fatal warnings remain for bilingual category records sharing one slug across languages and for empty content collections.


## P5 completion — certification scheme catalog and CI

- PR #5 was merged by the repository maintainer into `main` at commit `85711a2`.
- Added 12 internal candidate scheme records; all remain `planned`, with editions unset pending official verification.
- Added scheme reference validation and the `.github/workflows/quality.yml` quality gates.
- The workflow is configured for dependency installation, Astro/TypeScript checks, lint, tests and production build. CI run results were not independently verifiable in this environment.

## P6 merged work — article/service relationships

Branch: `feat/article-service-relations` (merged at `96ca35b`)

- The article schema already supports an explicit optional numeric `serviceId`; this stage adds cross-collection validation instead of introducing a second competing relationship field.
- Every service must have a unique positive integer `id`.
- Every article `serviceId`, when supplied, must resolve to an existing service.
- A published article may not link to a draft service. Draft articles may reference draft services.
- No current article has been associated with the draft CSMS service. Existing article topics are not sufficient evidence to claim that an operational certification service is available.
- Added automated tests and integrated relation checks into the build-time validation gate.
- Merged into `main` at `96ca35b`.


## P7 merged work — service SEO and structured data

Branch: `feat/service-seo-structured-data` (merged at `7a288de`)

- Added service detail JSON-LD graph: `WebPage`, `Service`, and `BreadcrumbList`.
- Added service directory JSON-LD graph: `CollectionPage`, `ItemList`, and `BreadcrumbList`.
- Service provider references the canonical Organization `@id`; optional properties are emitted only when present in the service content.
- Base layout safely combines the canonical Organization graph with page-specific JSON-LD.
- Service directory title now reads the organization name from `src/site.ts`, uses canonical `/service/`, and declares Indonesian language.
- Service detail pages retain canonical URLs and now emit structured data from the same published service record used for visible page content.
- Draft services remain excluded from static routes and the service directory. The CSMS record is still draft and is not published.
- Added three automated tests for service page graph, omission of unsupported optional claims, and service directory ItemList.
- No accreditation, authorization, area-served, pricing, or active certification claims are inferred.
- The canonical domain and organization contact details in `src/site.ts` remain unconfirmed placeholders; production deployment remains blocked until verified details are supplied.
- Integration fix after merge: `structured-data.ts` uses an explicit `.ts` import so the Node test runner can resolve it, and `tsconfig.json` enables `allowImportingTsExtensions` to keep typecheck passing.
- Merged into `main` at `7a288de`.


## P9 — Pre-launch site identity readiness helper

Branch: `feat/prelaunch-identity-readiness-gate` (merged at `bca8043`)

- Added an advisory helper to detect likely placeholder values in the shared site identity configuration (domain, email, phone, address, and social URLs).
- Added automated tests for the current placeholder values, complete-looking values, missing values, and invalid/placeholder social URLs.
- This check intentionally does not run as a production CI blocker: current placeholder data is expected during preparation. It also does not independently verify legal identity, domain ownership, contact details, or official profiles.
- Run the helper against `src/site.ts` once authoritative company details have been supplied; do not treat a green result as proof of identity.
- Current source values are expected to be flagged until the company confirms them.
- Integration fix after merge: the helper now declares explicit types for its config, findings, and placeholder checks so strict typechecking passes without changing runtime behavior.
- Merged into `main` at `bca8043`.


## P9 — Homepage discovery layout

Branch: `feat/homepage-discovery-layout` (merged at `2a3b225`)

- Added a reusable responsive homepage hero component.
- Added clear navigation panels for the existing service index and article archive.
- Retained the homepage's latest-three article section using the shared article ordering function.
- No unverified certification service, accreditation, authorization, criteria, coverage, pricing or company identity details were added.
- Draft CSMS remains excluded from public service pages.
- See `docs/homepage-discovery-layout.md` for implementation notes and local QA checklist.
- Merged into `main` at `2a3b225`. Full local checks passed; responsive visual review remains a separate manual task.


## Remaining work

1. Review the homepage at desktop, tablet and mobile widths visually; fix any issues in follow-up commits if found.
2. Confirm official company identity/contact/domain and approved logo before production-facing configuration is updated.
3. Confirm certification/assessment scope and authorization evidence before activating scheme or service records.
4. Continue with content page UX after the homepage and navigation reviews; preserve the SSOT and avoid publishing placeholder identity or unsupported service claims.


## P10 — Sitewide navigation and footer

Branch: `feat/site-navigation-footer` (merged at `f3f4875`).

- `primaryNavigation` and `footerNavigation` now live in `src/site.ts` as shared route/label configuration.
- `SiteHeader.astro` and `SiteFooter.astro` provide responsive sitewide navigation, skip-to-content, and a back-to-top link.
- Placeholder contact details stay out of public UI. No new service, accreditation or authorization claims were added.
- Integration fix after merge: removed an unused `organization` import from `Layout.astro`.
- See `docs/site-navigation-footer.md` for scope and validation notes. Visual and keyboard review remain separate manual tasks.


## P11 — Content breadcrumbs

Branch: `feat/content-breadcrumbs` (merged at `e4f3bc2`).

- `Breadcrumbs.astro` provides semantic navigation with an ordered list, accessible label, and current-page indicator.
- Article and service detail pages now show Home → archive → current page trails.
- Archive indexes carried updated context labels. SEO metadata, JSON-LD, and related-article sections were preserved.
- See `docs/content-breadcrumbs.md` for scope and validation notes. Visual and keyboard review remain separate manual tasks.


## P12 — Technical SEO and internal link integrity

Branch: `feat/seo-link-integrity` (merged at `0f418b2`).

- Added `scripts/audit-seo-build.mjs` and `npm run audit:seo` for title, meta description, canonical, H1, internal-link and sitemap checks.
- The quality workflow runs the audit after the production build.
- Integration fix at `221d7bc`: layouts no longer duplicate the validated H1 and intro from markdown content. The audit found two H1s on nine article pages and the corporate page; the rendered document now has one H1.
- See `docs/technical-seo-audit.md` for scope and validation notes. Browser verification remains a separate manual task.


## P13 — GitHub Actions runtime refresh

Branch: `chore/github-actions-node24-runtime` (merged at `cf666d3`).

- Workflow now uses `actions/checkout@v6`, `pnpm/action-setup@v6`, and `actions/setup-node@v7`, removing the Node.js 20 action runtime dependency.
- Project Node.js from `.node-version` and pnpm `12.21.0` are unchanged.
- Major action tags were confirmed to exist. CI run `44845274570` for `6151e50` completed with `conclusion: success`.
- See `docs/github-actions-runtime.md` for scope and validation notes.


## P14 — Content Quality & Taxonomy Integrity

Branch: `feat/p14-content-taxonomy-integrity` (merged at `aae693a`).

- Audited the nine existing article category assignments against their subjects.
- Corrected the ISO 45001 article from `quality-management` to `occupational-health-safety`.
- Removed the category from the generic global-compliance article because its subject spans domains and a single category would be misleading.
- Added taxonomy validator checks for lowercase kebab-case slugs and bilingual category status parity.
- Added tests for malformed slugs and mismatched translation statuses.
- Added `docs/p14-content-quality-taxonomy-integrity.md` with mapping decisions and editorial boundaries.
- Local validation ran on merge commit `aae693a`; see the validation note above for command results.
- Categories remain `planned`; no certification/service scope claims were activated.


## P15 — Content Expansion & Editorial Strategy

Branch: `feat/p15-editorial-strategy` (merged at `c210dfe`).

- P15 is completed as a planning/documentation phase.
- Added `docs/p15-content-expansion-editorial-strategy.md`, recording the current article-topic baseline, three editorial clusters, eight proposed topics with a prioritized publishing order, editorial quality checks, and a review workflow.
- The next editorial priority is document control; content should be drafted and researched one article at a time, not generated in bulk.
- No new articles, public category routes, service/scheme activation, or unsupported certification claims were introduced.
- Local validation ran on merge commit `c210dfe`; see the validation note above for command results.
- Production identity/contact/domain and certification-scope verification remain separate launch blockers.


## P16 — Editorial Content Production (in progress)

Branch: `feat/p16-document-control-article-draft` (merged at `72b843c`).

- Started first prioritized editorial topic: document control for ISO 9001.
- Drafted Indonesian and English versions in `docs/drafts/p16-document-control-iso9001.md` for editorial/technical review before entering the publishable article collection.
- Research notes reference ISO's documented-information guidance and the current ISO 9001 edition status page; exact edition-specific requirements and clause references are intentionally not asserted pending technical review.
- No public article routes or publishable article records were added; this branch only created a documentation draft.
- Local validation ran on merge commit `72b843c`; see the validation note above for command results.
- Remaining work: technical review, language/SEO review, image selection, internal-link review, metadata/schema verification, and final conversion into the article collection if approved.


## P16.2 — Article Integration & SEO Readiness (review checkpoint)

- Added `docs/p16-2-article-integration-readiness.md` with the article collection schema requirements, proposed bilingual metadata, and editorial/technical publication gates.
- No publishable article records or routes were created; dates, featured image, category slug, and technical approval remain unconfirmed.
- GitHub connector did not reliably enumerate the article directory, so filenames and existing locale conventions were not guessed or overwritten.
- This is a documentation-only checkpoint; local build and automated checks are not run here.
- Next: confirm article directory patterns, approve the draft technically, verify category/image metadata, then integrate both locale records as drafts.
