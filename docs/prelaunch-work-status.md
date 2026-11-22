# Pre-launch work status — 2026-11-20

## Current checkpoint

- Repository: `tnvcertification/tnvcertification`
- Base branch: `main`
- Completed audit branch: `prep/site-identity-taxonomy-audit` (merged via PR #3)
- Completed implementation branch: `feat/bilingual-service-taxonomy` (merged at `736bd14`)
- Validated commit: `c728ddf` (full gate suite; PR #26 editorial localization/hero validation and PR #27 ISO 14001 layout variants merged)

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
| P2 | CSMS planned-service draft | Completed; remains `draft: true`; internal research, readiness toolkit, governance framework, desktop pilot simulation, management/resource planning, consistency audit, and status tracker documented, no public claims |
| P3 | Site identity / `site.ts` SSOT audit | Audit completed; code replacement blocked on confirmed company details |
| P4 | Service taxonomy design and implementation | Completed; 12 bilingual category pairs and reference validation merged and locally validated |
| P5 | ISO service/scheme catalog | Internal 12-item planned catalog and build-time validation implemented; editions and TNCV scope remain unverified |
| P6 | Article-to-service relationships | Cross-collection validation implemented and merged; no article linked to the draft CSMS service |
| P7 | Service SEO and structured data | Implemented and merged; local checks passed on pinned toolchain |
| P8 | Full quality gate | Local checks passed on pinned toolchain; deployment runtime verification still pending |
| P14 | Content quality and taxonomy integrity | Completed; article assignments corrected and bilingual slug/status validation added |
| P15 | Content expansion and editorial strategy | Completed; topic gaps and an eight-article editorial queue documented; no articles published |
| P16 | Editorial content production | In progress; first Indonesian/English article draft created in docs for review; not published |
| P16.2 | Article integration and SEO readiness | Review checkpoint; collection schema, metadata gates, and publication gates documented |
| P16.3 | Bilingual article integration | Bilingual document-control draft pair integrated as `draft: true`; no public article published |
| P17 | Editorial localization and ISO 14001 layouts | Completed; PR #26 and PR #27 merged, full gate suite passed on `c728ddf`; visual QA remains manual |
| Build strategy | Content-first full-build baseline | Verification checkpoint closed for current baseline; timing baseline captured, negative preflight verified in CI; full checks mandatory |

## Verified repository facts

- `src/site.ts` is the intended company/site SSOT.
- Its current canonical domain, email, telephone and street address include placeholder/unconfirmed values; these must not be used for production.
- Organization JSON-LD emits contact/address fields from that configuration.
- The content registry includes articles, services, categories, certifications, training, training schedules and pages.
- The category collection now contains 12 candidate groups as 24 localized records, all `status: planned`; no public category routes exist.
- The certification collection currently has no content records.
- The services collection contains a CSMS draft and three ISO 2026 records with `draft: false`: ISO 14001:2026 (Indonesian and English) and ISO 9001:2026 (Indonesian). The ISO records are included for publication, while their page copy still says service availability, scope, and authority are not confirmed. Treat this as a publication-state/approval-copy mismatch; do not add or activate further service records until it is resolved.
- Internal CSMS research now includes an expanded competitor benchmark, a proposed service model, a requirement/evidence matrix, a readiness assessment form, and a readiness review report template. These are planning documents only; CSMS stays out of the published catalog until competence, authorization, and claims are approved.
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

Local full validation ran on `main` at `c728ddf` with the pinned Node.js `26.13.1` toolchain:

| Command | Result |
|---|---|
| `npm run check` | PASS, exit `0` |
| `npm run build` | PASS, exit `0`, 36 pages |
| `npm run typecheck` | PASS, exit `0` |
| `npm run lint` | PASS, exit `0` |
| `npm run test` | PASS, exit `0`, 330 tests |
| `npm run audit:seo` | PASS, exit `0`, 40 HTML pages and 20 unique canonicals |

Build warnings about empty `training` and `trainingSchedules` collections remain non-fatal. No CI result is claimed for `c728ddf`; only the local command output above is recorded.

Earlier pulled commits `9bc16d1` and `ddac326` failed local `lint`; final pulled commit `67b56b3` still had both errors. Commit `455bb73` fixed `no-useless-assignment` in the classifier and `preserve-caught-error` in the preflight.

GitHub Actions workflow `.github/workflows/quality.yml` is present and configured for install, check, lint, test, build and the post-build SEO audit on pull requests and pushes to `main`. Runs `44845274570` (`6151e50`), `44854428984` (`2733047`), `44855036386` (`0ce7f0b`), `44855490692` (`15daddb`), `44856851545` (`c4934aa`), `44858182875` (`c6f9015`), `44859275893` (`ef84389`) and `44862425784` (`2a44281`) completed with `conclusion: success`. Runs `44863006246` (`9bc16d1`) and `44863375398` (`ddac326`) completed with `conclusion: failure` before the lint fixes. Runs `44864063830` (`455bb73`), `44864122309` (`c0764c6`), `44864948124` (`2c2828b`), `44865216807` (`70eb5a7`), `44867371518` (`88f19a1`), `44867438542` (`9049434`), `44867757684` (`41df5b9`), `44868225838` (`d828d81`), `44868734147` (`d9ce3be`), `44869018493` (`7101e27`), `44869711362` (`ab647ca`), `44870176304` (`d29c72b`), `44871266120` (`f0d8105`), `44872016416` (`7a7a1eb`), `44872496114` (`b37e8ea`), `44872936117` (`ce8d66d`), `44873398903` (`f6ac2da`), `44873764078` (`579ed86`), `44873979114` (`cffcdd4`), `44874169419` (`c2b9de4`), `44874521129` (`eae3a06`), `44875417782` (`863def5`), `44875730310` (`cba6965`), `44876022952` (`a88449f`) and `44876902615` (`7b74dd0`) completed with `conclusion: success`. Build success above comes from local execution on the pinned toolchain, not from CI. Non-fatal warnings remain for bilingual category records sharing one slug across languages and for empty content collections.


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

Branch: `docs/p16-2-article-integration-readiness` (merged at `fe2f175`).

- Added `docs/p16-2-article-integration-readiness.md` with the article collection schema requirements, proposed bilingual metadata, and editorial/technical publication gates.
- No publishable article records or routes were created; dates, featured image, category slug, and technical approval remain unconfirmed.
- GitHub connector did not reliably enumerate the article directory, so filenames and existing locale conventions were not guessed or overwritten.
- This branch only added documentation; local validation ran on merge commit `fe2f175`, with results in the validation note above.
- Next: confirm article directory patterns, approve the draft technically, verify category/image metadata, then integrate both locale records as drafts.


## P16.3 — Bilingual Article Integration (in progress)

- Updated the article schema so internal drafts may omit `pubDate` and `featuredImage`; published articles must provide both. Added CONTENT-012 and tests for the publication-date gate.
- Made editorial validation language-aware: Indonesian intro/alt wording uses `adalah`; English uses `is`.
- Added reciprocal article hreflang generation from shared `translationKey`, visible featured-image rendering, locale-specific date formatting, and localized article breadcrumbs.
- Added the first bilingual document-control article pair as collection records, both `draft: true`: `pengendalian-dokumen-iso-9001` (ID) and `iso-9001-document-control` (EN). Shared translation key: `article-document-control-iso-9001`.
- Draft records intentionally omit publication dates and featured-image paths. The planned `quality-management` category remains `planned`; no public route or index entry is created for these drafts.
- Official ISO catalogue research confirms ISO 9001:2026 (sixth edition) was published on 16 September 2026 and replaces ISO 9001:2015. Both article drafts now cite the 2026 edition and the official transition guidance; clause-specific interpretation remains deferred pending review against a licensed standard copy.
- Technical/editorial approval, approved image assets, and publication dates remain outstanding. Do not change either record from draft until these gates are met.
- Commit history: `359152a` (draft integration/schema), `11f2c8b` (published metadata guards and localized breadcrumbs), `69801b5` (test fixture correction), `fdb072e` (ISO 9001:2026 source alignment), `bd0697e` and `2be9036` (bilingual intro alignment), `ef84389` (editorial title-rule alignment).
- Local full gate suite passed on `ef84389`; CI run `44859275893` completed with `conclusion: success`. Both records remain drafts.


## Build strategy (adopted baseline)

- Pulled commit `2a44281` added `docs/build-strategy.md` as the adopted architecture; implementation is staged and no code changed.
- Full `astro build` remains the production source of truth. A deployment artifact must always contain the complete site.
- Editorial Markdown changes may get selective early validation, but collection-wide integrity checks and the full production build stay mandatory.
- Any code, schema, config, manifest, lockfile, rename, deletion, or ambiguous change fails safe to the full pipeline.
- No incremental renderer is in use. Future incremental production output must prove equivalence on routes, assets, canonicals, hreflang, sitemap, and internal links first.
- `check` and `build` ran on `2a44281` with exit `0`; CI run `44862425784` completed with `conclusion: success`.
- Pulled `2c2828b` records that the preflight CLI has isolated end-to-end CI coverage. Pulled fixture commits `f321207` and `88f19a1` exercised the real `content-only` step with an editorial-only push; `9049434` removed the temporary fixture afterward.
- `docs/build-strategy.md` carries a continuation note (2026-11-21) recording the verified `content-only` step and the still-open timing measurement. Keep both documents in sync on any future status change.


## Selective editorial preflight

- Pulled commits `dcbac60` through `67b56b3` implemented build-step 2 (Git change classification) and build-step 3 (selective editorial validation), plus documentation and bug fixes.
- `scripts/classify-build-changes.mjs` allowlists added or modified Markdown/MDX files in `articles/`, `services/`, `certifications/`, `training/`, and `pages/`. Taxonomy, training schedules, deletions, renames, mixed changes, and unknown paths force `full`.
- `scripts/validate-changed-content.mjs`, exposed as `pnpm validate:changed <base> <head>`, parses frontmatter for changed editorial entries and runs `validateEntry()` on each. It does not skip global duplicates, cross-collection taxonomy, scheme, relation, type, lint, test, full build, or SEO checks.
- `.github/workflows/quality.yml` runs the preflight only when `build_mode=content-only`, after install and before the normal gates. Production behavior stays unchanged.
- Verified manually: classifier returned `content-only` for `2be9036..ef84389` (2 article files), and `pnpm validate:changed 2be9036 ef84389` exited `0`.
- Pulled commits `94562ab` (end-to-end CLI tests), `9bb4538` (tsx loader resolution), `bef1c3b` (unused import), and `2c2828b` (docs) verified the real preflight CLI in isolated temporary Git repositories: valid Markdown passes, malformed YAML fails, editorial rule violations fail.
- Full local gate suite passed on `7b74dd0`: 49 tests, 13 pages, 13 canonicals. CI run `44876902615` completed with `conclusion: success`.
- Real editorial-only push verified on `88f19a1`: local classifier returned `content-only`, `npm run validate:changed -- 70eb5a7 88f19a1` exited `0`, and CI job step `Validate changed editorial content` completed with `conclusion: success` before the full gates. The temporary `ci-content-only-fixture.md` was then removed on `9049434`.
- Closed: timing baseline captured and negative preflight verified in CI; see the build-strategy verification closure section below. Incremental rendering remains not adopted.

## CSMS readiness service — governance toolkit checkpoint (2026-11-21)

The proposed CSMS Readiness Review & Documentation Support service remains **internal planning only**. It is not approved for public launch or customer delivery.

### Completed internal documents

- `docs/csms/requirement-evidence-matrix.md` — principal-specific requirement-to-evidence mapping.
- `docs/csms/readiness-assessment-form.md` — scope, criteria, competence/impartiality checks, sampling, findings, and limited readiness conclusion.
- `docs/csms/readiness-report-template.md` — report structure and explicit non-certification / non-approval limitations.
- `docs/csms/operational-procedure.md` — enquiry-to-closeout operating procedure.
- `docs/csms/competence-matrix.md` — personnel competence evidence and assignment authorization.
- `docs/csms/impartiality-conflict-register.md` — conflict screening, threat evaluation, safeguards, and escalation.
- `docs/csms/document-control-retention.md` — document control, evidence traceability, security, and retention framework.

The Service Catalog and Operational Procedure link to these supporting documents. All remain proposed/internal drafts pending formal approval.

### Governance decisions still required

1. Approve the actual service model and boundaries.
2. Verify applicable principal requirement sources and determine whether any formal authorization is required.
3. Approve competence criteria, personnel, mandatory credentials, and technical review authority.
4. Approve impartiality policy, conflict thresholds, role separation, and escalation authority.
5. Approve information classification, storage channels, privacy controls, retention periods, and secure disposal.
6. Approve legal/marketing claims, contract terms, pricing, report distribution, and complaint handling.
7. Complete a controlled pilot and review its results before any launch decision.

### Important limitations

- No generic CSMS standard or universal checklist is asserted.
- No official principal score, certificate, contractor qualification, vendor approval, or tender acceptance is promised.
- Retention periods remain deliberately unfilled pending legal/management approval.
- Public CSMS content must remain in draft status until all applicable approval gates are closed.

### Repository changes

- `bffba62` — readiness review operational procedure; `7521ebd` — catalog link to that procedure.
- `6658c0a` — competence matrix.
- `e41b2a6` — impartiality and conflict register.
- `6f2ee90` — document control and retention framework.
- `8d9cacd` — integrate governance controls into operational procedure.
- `4260e5f` — link governance documents from Service Catalog.
- `d9ce3be` — record governance checkpoint and remaining approval gates.



## CSMS pilot simulation checkpoint (2026-11-21)

A desk-top process simulation was completed using a wholly fictional contractor, fictional principal and invented requirement pack. The exercise is explicitly not based on a real principal scheme and is not a customer assessment.

### Pilot artifacts

- `docs/csms/pilot/pilot-case-simulation.md` — fictional contractor profile, invented criteria, mock evidence register, completed requirement/evidence matrix and limitations.
- `docs/csms/pilot/pilot-assessment-and-report.md` — completed simulated assessment record, sample report, process observations and corrective actions.

### Pilot outcome

- The workflow produced a traceable matrix, assessment record and descriptive sample report.
- All five fictional requirements were classified as **Partially evidenced** against mock records. No score, percentage, pass/fail or official result was generated.
- Process prototype demonstrated; **real-world/customer pilot is not authorized**.
- Competence and impartiality could not be demonstrated with fictional role labels. Data protection, real source verification, client factual review, complaint handling and operational effectiveness were not tested.
- The pilot identified ten process improvement actions, including controlled verification of principal sources, evidence sufficiency language, sampling records, personnel authorization, conflict screening, technical review, information governance, client factual review and complaint handling.

### Mandatory next gates

1. Close and document the pilot observations in the controlled procedure and supporting forms.
2. Approve competence and technical reviewer authorization for the actual scope.
3. Approve impartiality/conflict decision authority and safeguards.
4. Approve privacy, information security, storage, retention and disposal controls.
5. Verify one actual principal's current requirement source and applicability before any external pilot.
6. Obtain legal, commercial and management approval for engagement terms, claims and report issuance.

### Public-content safeguard

The CSMS service page remains a draft and must not be activated. The simulation artifacts must not be used as customer evidence, marketing proof, or a representation of completed assessment work.



## CSMS pilot remediation and procedure hardening checkpoint (2026-11-21)

The ten observations from the desk-top simulation have been converted into controlled remediation actions. This is a documentation update only; no action is represented as implemented or formally approved merely because a template was added.

### Added internal control document

- `docs/csms/source-verification-and-sampling.md` — source identity, revision/currentness, applicability, independent verification, population, sampling method, sample execution, evidence intake and sufficiency record.
- `docs/csms/pilot-remediation-register.md` — ten remediation actions with accountable-owner, due-date, status and closure-evidence fields.

### Hardened working documents

- `docs/csms/operational-procedure.md` updated to version 0.2 draft: independent source verification; assignment-specific competence and conflict gate; documented sampling; distinction between received, examined and sufficient evidence; controlled factual corrections; technical review checklist; structured complaint handling.
- `docs/csms/readiness-assessment-form.md` updated to version 0.2 draft: source gate, verification approval, sampling references, evidence sufficiency checks, factual-correction log and complaint control.
- `docs/csms/readiness-report-template.md` updated to require source verification, sampling boundaries, evidence sufficiency rationale and factual-correction disposition.

### Current decision

- Remediation documents are drafts. Owners, deadlines, actual implementation evidence and management approvals remain unassigned/outstanding.
- No actual principal source has been selected or verified in this stage.
- No real personnel competence or impartiality assessment has been completed.
- Privacy/security arrangements and retention periods remain subject to management/legal approval.
- The customer pilot remains **not authorized** and the public CSMS page must remain `draft: true`.

### Next gate

Management must assign owners and approve deadlines, then close RA-01 through RA-10 with objective evidence and independent verification. Only after that should a separate decision be made on whether to prepare an actual principal-specific pilot.

### Repository changes

- `910bb02` — simulated pilot case and evidence matrix.
- `6f95578` — simulated pilot assessment and sample report.
- `ac9c142` — record pilot simulation checkpoint.
- `860835f` — harden operational procedure after pilot.
- `29c0d19` — strengthen assessment controls.
- `6aee425` — improve report evidence traceability.
- `7f1bfef` — source verification and sampling record.
- `2b2e01a` — pilot remediation register.
- `974f532` — record pilot remediation plan.
- `ab647ca` — fix assessment form section numbering.


## CSMS management approval and resource readiness checkpoint (2026-11-21)

The next governance stage has prepared two additional internal draft documents:

- `docs/csms/management-approval-register.md` — twelve management decisions covering business model, scheme basis, legal/claims, competence, impartiality, methodology, privacy/security, resources, commercial terms, pilot authorization, pilot review and publication.
- `docs/csms/roles-responsibilities-resource-plan.md` — proposed functions, role-segregation safeguards, RACI, assignment authorization checklist and resource-readiness plan.

### Current decision state

- All twelve management decisions are **Pending**; this register is a decision aid, not evidence of approval.
- No management sponsor, approver, role holder or individual assessor has been appointed by this documentation work.
- No personnel competence authorization, staffing capacity, budget, software/storage approval, secure communication channel or resource allocation is evidenced.
- No customer pilot or public launch is authorized.
- The public CSMS service page remains `draft: true`.

### Required management action

Management must appoint accountable role holders, complete and evidence the decision register, approve actual resource commitments, and close all prerequisite gates before considering a controlled pilot. Any role combination must undergo competence, capacity and impartiality review; unresolved threats require scope restriction or refusal.

### Repository changes

- `90a0506` — management approval register with twelve pending decisions.
- `f5fe0e8` — roles, responsibilities and resource readiness plan.
- `83ae5e7` — link management governance documents from Service Catalog.
- `d29c72b` — record management readiness checkpoint.


## CSMS governance consistency audit checkpoint (2026-11-21)

A repository-level desk audit was completed and recorded in `docs/csms/governance-consistency-audit.md`.

### Documentation corrections

- Reconciled the document-control master register with the current operational procedure version (0.2) and expanded the inventory to include the current forms, templates, governance records and simulation-only artifacts.
- Added the management approval register and roles/resource readiness plan to the operational procedure's governance references.
- Linked the audit record from the service catalog and operational procedure.

### Audit outcome

Documentation consistency improved; operational readiness is **not demonstrated**. The audit records ten findings: three documentation inconsistencies corrected, management/competence/impartiality/privacy/source verification/pilot effectiveness gates remain open, and the public draft safeguard is maintained.

### Current restrictions

- All management decisions remain pending until supported by actual approval evidence.
- No personnel appointments, competence authorization, approved budget/resources, verified target principal source pack, or customer pilot authorization is evidenced.
- No customer evidence may be accepted until privacy, security, access and retention arrangements are approved.
- The public CSMS content remains `draft: true`; no publication or launch is authorized.

The audit is a documentation review only. It is not a legal opinion, accreditation assessment, management approval, or proof of operational effectiveness.

### Repository changes

- `376ec3e` — reconcile document-control master register.
- `7b56aeb` — align procedure governance references.
- `cd52834` — record governance consistency audit.
- `2ae98fb` — index audit record.
- `46b8c25` — reference audit record from operational procedure.
- `e9de419` — link audit record from Service Catalog.
- `9a4d36c` — record audit checkpoint in prelaunch status.
- `f7320d4` — add implementation status tracker.
- `753ccd5` — link implementation status tracker from prelaunch status.
- `f0d8105` — link implementation status tracker from Service Catalog.


## CSMS implementation status tracker

For one authoritative view of which CSMS documents have been prepared versus which approvals and real-world implementation actions remain open, see [CSMS Implementation & Document Status Tracker](csms/implementation-status.md). The tracker distinguishes completed documentation from operational readiness; it does not create or renumber implementation phases. Current baseline: management decisions 12/12 Pending, pilot remediation actions 10/10 Open, audit findings AUD-01–AUD-03 corrected, AUD-04–AUD-09 open, and AUD-10 publication safeguard maintained. The public CSMS page remains `draft: true`. The tracker baseline field still reads `a9e9944`; its continuation log now records stages CSMS-DOC-01..09.


## CSMS documentation-control reinforcement checkpoint (2026-11-21)

All ten remediation actions now have strengthened documentation. These are drafts and blank templates only. RA-01 through RA-10 remain **Open**.

### Added controls

- `docs/csms/requirement-evidence-matrix.md` — stable REQ / EV / FR / ACT / RPT identifiers, mandatory requirement → evidence → finding → action → report traceability, exception handling, and a completeness review (RA-02).
- `docs/csms/readiness-assessment-form.md` — separate received / examined / sufficient status, decision rules, and six synthetic challenge tests EV-T01..EV-T06 (RA-03).
- `docs/csms/source-verification-and-sampling.md` — sampling design decision record, selection-method guidance, sample selection and deviation log, and sampling conclusion limits (RA-04).
- `docs/csms/competence-matrix.md` — competence dimensions and verifiable evidence examples, internal 0–4 rating limits, personnel register fields, activity-based authorization matrix, effectiveness monitoring, expiry/reassessment, suspension, and reviewer independence (RA-05).
- `docs/csms/pilot-remediation-register.md` — explicit RA-05 implementation evidence list and closure decision; template alone cannot close the action.
- `docs/csms/impartiality-conflict-register.md` — version 0.2: actual/potential/perceived conflict definitions, mandatory screening points, ten threat categories, Low/Medium/High/Unacceptable decision rules, hard stops, safeguard effectiveness, engagement decision record and escalation.
- `docs/csms/roles-responsibilities-resource-plan.md` — impartiality reviewer authority, minimum role segregation, engagement-level conflict gate; no engagement may start with pending conflict fields or approvals.
- `docs/csms/pilot-remediation-register.md` — explicit RA-06 implementation evidence list and closure decision; a blank template or client waiver cannot close the action.
- `docs/csms/technical-review-procedure.md`, `independent-review-checklist.md`, `review-evidence-register.md` — RA-07: review scope, inputs, method, independence, 18 technical criteria, comment/escalation log, release gate and evidence register. All blank drafts.
- `docs/csms/readiness-report-template.md` — records reviewed version, reviewer competence/conflict clearance, review outcome, blocking comments, re-review, delegated approver and controlled distribution. Technical review acceptance is not release authorization.
- `docs/csms/data-governance-information-security-procedure.md`, `data-asset-inventory-register.md`, `access-authorization-register.md`, `data-incident-response-playbook.md` — RA-08: lifecycle controls, classification, minimization, access, transfer, suppliers, retention, incident severity/notification and closure. All drafts or blank templates.
- `docs/csms/operational-procedure.md` — section 5.4A stops real client evidence intake until MGT-07 controls, approved channels, access roles and retention terms are approved and verified.
- `docs/csms/document-control-retention.md` — master register lists the four RA-08 records and links the data-governance framework; placeholder retention periods remain unapproved.
- `docs/csms/roles-responsibilities-resource-plan.md` — RA-07 reviewer release-escalation separation and RA-08 privacy/security accountability with stop conditions.
- `docs/csms/client-factual-review-procedure.md`, `client-factual-correction-log.md` — RA-09: factual-only review scope, intake and unique comment IDs, reasoned disposition, supporting evidence, original and revised versions, technical re-review and release gate. Both are blank drafts.
- `docs/csms/readiness-report-template.md` — RA-09 factual-review fields: comment ID, report version, evidence, impact, disposition and re-review. Technical re-review or client review does not authorize release.
- `docs/csms/operational-procedure.md` — RA-09 factual review integrated and separated from complaint handling and principal decision disputes.
- `docs/csms/roles-responsibilities-resource-plan.md` — factual review coordinator, assessor/author, technical reviewer and report approver separation.
- `docs/csms/document-control-retention.md` — master register lists both RA-09 records.
- `docs/csms/complaints-handling-procedure.md`, `complaints-register-case-record.md` — RA-10: accessible intake, confidentiality and no-retaliation safeguards, triage, independent investigation and decision, response, corrective action, effectiveness check, reopening and trend monitoring. Both are blanks/drafts; no numeric deadlines are invented.
- `docs/csms/operational-procedure.md` — section 6 separates complaints from RA-09 factual correction, technical disagreement, principal decision disputes and privacy/security incidents. Complaint records must not go through unapproved channels.
- `docs/csms/roles-responsibilities-resource-plan.md` — RA-10 role separation: coordinator, independent investigator, independent decision reviewer, corrective-action owner, separate effectiveness verifier and management escalation authority, with external fallback.
- `docs/csms/management-approval-register.md` — MGT-09 expanded to complaint channel, response targets, investigator independence, decision authority, remedy limits and escalation. Still Pending.
- `docs/csms/document-control-retention.md` — master register lists both RA-10 records; section 14 covers restricted storage, retention, legal hold and disposal. No channel or retention period approved.
- `docs/csms/implementation-status.md` — continuation log records CSMS-DOC-01..09 with explicit open items; baseline field still reads `a9e9944`.

### Current restrictions

- No verified principal source, authorized pilot, populated engagement record, or independent review is evidenced.
- Management decisions remain 12/12 Pending; remediation actions 10/10 Open; AUD-04..AUD-09 open.
- Synthetic challenge tests check form logic only. They do not close RA-03.
- No named or appointed personnel, verified credentials, task-competence evaluation, assignment authorization, or independent reviewer appointment is evidenced. RA-05 stays Open.
- No approved impartiality policy, appointed reviewer, actual engagement declarations, implemented safeguards, or independent proceed/decline decision is evidenced. RA-06 stays Open. Client consent alone does not clear a conflict.
- No approved review procedure/delegation, named reviewer with verified competence and conflict clearance, completed real-engagement review, closed blocking comments, or separately authorized report release is evidenced. RA-07 stays Open.
- No MGT-07 approval, legal/privacy assessment, completed data inventory, approved systems/channels/access/suppliers, retention/deletion evidence, tested incident response, or independent verification is evidenced. RA-08 stays Open. Do not request or receive real client evidence before that gate is approved and verified.
- No approved factual-review procedure, authorized engagement, actual client comments, populated correction log, revised report, technical re-review, separate release approval, or independent closure verification is evidenced. RA-09 stays Open. Client factual review does not grant a right to change technical conclusions.
- No approved complaint channel or response targets, appointed independent roles, actual case or controlled readiness exercise, independent decision, effective corrective action, restricted storage, trend monitoring, or independent closure verification is evidenced. RA-10 stays Open. Do not fabricate cases or deadlines; a controlled exercise is not a real complaint or proof of customer case handling.
- The public CSMS page remains `draft: true`; no launch, certification claim, or customer pilot is authorized.

### Repository changes

- `60124f6` — define end-to-end requirement traceability.
- `6c2a5c7` — mark traceability template stage complete.
- `6bb4173` — separate evidence receipt, examination and sufficiency.
- `d571c08` — mark evidence sufficiency design stage complete.
- `70dd3b8` — strengthen sampling design and deviation controls.
- `a240a3f` — mark sampling design stage complete.
- `f6ac2da` — reconcile implementation tracker baseline.
- `cd14bb2` — strengthen RA-05 competence and authorization controls.
- `e4ea09b` — define RA-05 objective closure evidence.
- `579ed86` — record RA-05 document completion and open gates.
- `f6daa56` — strengthen RA-06 impartiality controls.
- `27d2ef5` — define RA-06 impartiality governance roles.
- `057fd0e` — define RA-06 objective closure evidence.
- `c2b9de4` — track RA-06 document completion and open gates.
- `b679e4c` — define RA-07 technical review procedure.
- `a5c456b` — add RA-07 independent review checklist.
- `b08a078` — add RA-07 review evidence register.
- `f715fa8` — define RA-07 reviewer governance roles.
- `2f6de5e` — define RA-07 objective closure evidence.
- `931e373` — align report template with RA-07 release controls.
- `fd68bf6` — track RA-07 documentation and open gates.
- `30f8c28` — define RA-08 data governance procedure.
- `cbd2aa9` — add RA-08 data inventory register.
- `13fd34d` — add RA-08 access control register.
- `c3bba4d` — add RA-08 incident response playbook.
- `8b92e5d` — define RA-08 data security governance roles.
- `e507125` — link RA-08 controls in document master register.
- `0974e88` — add RA-08 evidence intake stop gate.
- `a9e9944` — define RA-08 objective closure evidence.
- `863def5` — track RA-08 documentation and open gates.
- `023f1f9` — define RA-09 client factual review procedure.
- `fbac7cc` — add RA-09 factual correction log.
- `67e1114` — align report template with RA-09 factual review.
- `c675454` — integrate RA-09 factual review into operations.
- `ac2c543` — define RA-09 factual review role governance.
- `d82a5ff` — register RA-09 factual review records.
- `6338076` — define RA-09 objective closure evidence.
- `a88449f` — track RA-09 documentation and open gates.
- `a74e0f0` — define RA-10 complaints handling procedure.
- `fe79a98` — add RA-10 complaints register and case record.
- `494372a` — integrate RA-10 complaints handling into operations.
- `b0af763` — define RA-10 complaint role separation.
- `ebeaa4d` — register RA-10 complaints documents.
- `41366a0` — include complaint commitments in MGT-09 approval.
- `87647ae` — define RA-10 objective closure evidence.
- `6825445` — track RA-10 documentation and open gates.
- `7b74dd0` — list RA-09 and RA-10 controlled draft documents.

Full gate suite passed on `7b74dd0`; CI run `44876902615` completed with `conclusion: success`. No code, schema, config, or content collection changed in this pull.


## Historical checkpoint — build-strategy verification priority (closed 2026-11-21)

**Closed.** See the build-strategy verification closure section below. This checkpoint is retained for history only and is not the active priority.

At this historical checkpoint the repository was at `7a7a1eb` (`docs: record build strategy continuation note`). The priority then was to close two items in [Build Strategy](build-strategy.md): (1) collect comparable CI/build timing evidence, and (2) verify with a retained CI failure record that selective preflight rejects an invalid changed editorial entry before the general gates. The content-only workflow had succeeded on `88f19a1` (run `44867371518`); the full workflow had succeeded on `e7f8857` (run `44871598897`). Those successes alone did not close the timing or negative-preflight items.

**Historical sequence rule:** the next CSMS task was to wait until both build-strategy items were verified and documented. That rule is now satisfied by the closure section below. It was a separate build-engineering priority, not a new CSMS phase. CSMS remains governed by [its implementation status tracker](csms/implementation-status.md); no CSMS status or approval was changed by this priority decision.


## Build strategy verification closure — 2026-11-21

**Status: [x] Completed for the current implementation baseline.** The two verification actions previously blocking CSMS continuation have now been performed and their evidence recorded in [Build Strategy](build-strategy.md).

| Verification | Status | Evidence |
|---|---|---|
| Capture CI/build timing across content-only and source/tooling changes | [x] Baseline measured | Content-only run `44867371518` (`88f19a1`): 28 s total / 761 ms Astro build. Source/tooling runs `44864063830` (`455bb73`): 28 s / 1.02 s, and `44864868895` (`bef1c3b`): 23 s / 700 ms. This is an initial baseline, not a statistically robust performance comparison or proof of speedup. |
| Demonstrate early rejection of invalid changed editorial content | [x] Verified in CI | Run `44867324725` (`f321207`) failed at **Validate changed editorial content** with `CONTENT-002` before general gates; valid positive-control run `44867371518` passed preflight and all full gates. |
| Preserve full production output and global checks | [x] Confirmed | Positive-control run built all 13 pages and passed SEO/link audit. Full Astro production build remains mandatory. |
| Adopt incremental production rendering | [x] Not adopted | No partial `dist`, route-only build, or incremental production renderer is approved. |

**Priority gate closed:** the build-strategy verification no longer blocks continuation of the CSMS workstream. Resume CSMS from the existing [CSMS implementation status tracker](csms/implementation-status.md). This closure does not approve CSMS launch, customer pilot, personnel appointments, formal certification claims, or any pending management decision/remediation action. The initial CI timing sample remains provisional; add future comparable runs before making performance claims.

### Repository changes

- `20a4c9d` — set build verification as immediate priority before CSMS continuation.
- `e695732` — record build verification as immediate project priority.
- `0f809b9` — record CI timing and negative-preflight verification evidence.
- `b37e8ea` — close build-strategy verification checkpoint for the current baseline.


## P17 — Editorial localization and ISO 14001 layouts (2026-11-22)

Merged PR #26 (`08e9626`) and PR #27 (`c728ddf`) into `main`, in that order. Both pull requests branched from `f59b314`. Both merge orders were simulated first and produced the identical tree `f3fe2cd`; the chosen order was not required to avoid a conflict.

- PR #26 passes `lang` through `PageBlockRenderer` to `BlockRenderer`, localizes English FAQ/HowTo/CTA headings, shares localized breadcrumb labels between `siteCrumb(href, lang)` and service JSON-LD, requires a non-empty hero `description`, and checks generated English headings in `audit:headings`.
- PR #27 adds presentation-only `layout` variants for `content-section` and `howto` blocks, recomposes the ISO 14001:2026 service page, renders FAQ blocks as native disclosures, and adds regression tests.
- Editorial `.md` entries remain frontmatter-only; no Markdown body was reintroduced.
- Full gate suite passed on `c728ddf`: 330 tests, 36 built pages, 40 HTML pages and 20 canonicals in the SEO audit.
- Expected non-fatal warnings for empty `training` and `trainingSchedules` collections remain.
- CI status for the merge commits was not verified; no CI result is claimed.
- Visual review of the new ISO 14001 layouts at desktop, tablet and mobile widths remains a separate manual task.
