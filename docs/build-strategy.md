# Build Strategy

## Status

Adopted architecture. Selective editorial preflight is implemented and its CLI is covered by isolated end-to-end CI tests. The content-only conditional workflow step was exercised by a real editorial-only push. Timing measurement and earlier-error-detection confirmation remain open. Production output continues to use a complete Astro build.

## Operating phases

### Development and stabilization

Astro components, layouts, routes, configuration, and shared site settings may change frequently. Use the normal development server for feedback and run the full quality pipeline before integrating changes.

### Stable site with ongoing content growth

Markdown content is expected to be the most frequent change. The optimization is selective pre-build validation for changed editorial entries, while preserving whole-site integrity checks and complete production output.

Astro components, layouts, route files, content schemas, collection definitions, integrations, Vite/Astro configuration, shared site configuration (including src/site.ts), and other shared code are build-wide dependencies. A change to any of these requires a full production build.

## Change classification

| Changed paths | Required handling |
| --- | --- |
| Added or modified editorial Markdown/MDX | Validate changed entries early; retain collection-wide duplicate, taxonomy, relation, schema, and production checks |
| Category/taxonomy Markdown | Full taxonomy and cross-collection validation |
| Any Astro/source/configuration/asset/dependency file | Full quality checks and full production build |
| Unknown, deleted, renamed, or ambiguous paths | Fail safe to full validation and full production build |

The content-only allowlist is limited to the canonical editorial collections: articles, services, certifications, training, and pages. Categories and training schedules are deliberately excluded.

## Non-negotiable production guarantees

1. A deployment artifact must contain the complete site, never only changed pages.
2. The standard astro build remains the production source of truth.
3. Do not emulate incremental builds by building one route and replacing or merging a partial dist directory.
4. Selective validation is an early feedback optimization, not a replacement for global integrity checks.
5. If change classification is uncertain, fall back to the full pipeline.
6. Any future incremental renderer must prove output equivalence with a clean full build, including routes, assets, canonical metadata, hreflang, sitemap, and internal links, before it can be used for deployment.

## Current implementation baseline

- pnpm build runs the standard Astro production build.
- src/content-validation.ts performs whole-collection editorial, taxonomy, certification-scheme, and article/service relation validation at build completion.
- scripts/audit-seo-build.mjs audits the generated complete dist output.
- GitHub Actions runs checks, tests, a full production build, and the SEO build audit.

## Staged rollout

1. Record and preserve the safe full-build baseline. **Complete.**
2. Add Git-based change classification with conservative full-build fallback. **Implemented.**
3. Add selective per-entry validation for changed editorial Markdown, without weakening global checks. **Implemented; CLI integration tests pass in CI.**
4. Verify the content-only conditional workflow step with a real editorial-only push and measure CI/build time. **Push verification complete on `88f19a1`; timing measurement remains open.**
5. Evaluate incremental production rendering only if the full build becomes a material bottleneck. Do not adopt it solely to reduce a few seconds from the current build.

## Git change classification

scripts/classify-build-changes.mjs compares a base and head commit and writes GitHub Actions outputs:

- build_mode=content-only only when every changed path is an added or modified Markdown/MDX file in one of the canonical editorial collections.
- build_mode=full for Astro/source/configuration/assets/taxonomy changes, deletions, renames, copies, unknown paths, empty diffs, missing base commits, or any diff error.

The Quality gates workflow fetches full Git history and runs this classifier before dependency installation. The classifier does not skip any checks: type checking, lint, tests, the complete astro build, and SEO audit continue to run for every workflow.

Automated tests cover editorial Markdown changes, Astro component changes, taxonomy changes, deletions, unavailable base commits, non-editorial collections, and mixed source/content changes. End-to-end CLI tests also run the real selective validator against isolated temporary Git repositories: valid editorial Markdown passes, malformed YAML fails, and editorial rule violations fail.

## Selective editorial preflight

For a diff classified as content-only, Quality gates runs pnpm validate:changed <base-sha> <head-sha> before the general checks.

The script reads only added/modified Markdown/MDX files in the canonical editorial collections and runs the existing validateEntry() rules against each changed entry. Missing or malformed YAML frontmatter fails the preflight.

This preflight is additive. It does not replace:

- validateAllEntries() duplicate intro/meta-description/slug checks;
- cross-collection taxonomy validation;
- certification scheme validation;
- article/service relationship validation;
- Astro content schema/type checks, lint, tests, complete production build, or SEO/link audit.

All of these full checks continue to run for every CI workflow.

## Decision

For the current 13-page site, keep full production builds. The measured build is only a few seconds, while partial static output introduces correctness and deployment risks. Optimize validation first; revisit incremental production generation when content volume or measured build duration justifies it.

## Continuation note (2026-11-21)

- Baseline before this note: `main` at `e7f8857`. Fresh local gates all exited `0`: `check`, `build` (13 pages), `typecheck`, `lint`, `test` (49 tests), and `audit:seo` (13 canonicals). CI run `44871598897` completed with `conclusion: success`.
- The `content-only` conditional step is verified, not pending. Fixture commits `f321207` and `88f19a1` exercised a real editorial-only push; `9049434` removed the fixture. The local classifier returned `content-only` for `70eb5a7..88f19a1`, `npm run validate:changed -- 70eb5a7 88f19a1` exited `0`, and CI run `44867371518` completed with `conclusion: success`, including the `Validate changed editorial content` step.
- Still open: measure CI/build time and confirm that selective preflight catches changed-file errors earlier than the main gates. Do not adopt incremental production rendering solely to reduce a few seconds.
- Commit-level evidence lives in `docs/prelaunch-work-status.md`, sections "Build strategy (adopted baseline)" and "Selective editorial preflight".
- Any future status change must cite verifiable evidence and update this note together with the master status document in the same commit.


## Priority before resuming CSMS work

**Priority: complete the remaining build-strategy verification before starting another CSMS work item.** This is a separate website/build-engineering track and must not be counted as a CSMS phase.

Open items, in order:
1. **Measure CI/build duration:** collect comparable workflow timings across representative content-only and source/configuration changes. Record run IDs, commit SHAs, start/end times, and relevant step durations. A single successful run is not enough to claim a performance improvement.
2. **Verify earlier error detection:** demonstrate that an invalid changed editorial entry fails at the selective preflight step before the general quality gates; retain the failing run/step evidence and confirm the normal full gates still run for valid changes.
3. **Update this strategy and the master prelaunch status with the evidence.** Do not introduce incremental production rendering; the full Astro build remains mandatory.

**Resume CSMS only after these build-strategy verification items are closed and recorded.** CSMS status and safeguards remain as recorded in [the CSMS implementation status tracker](csms/implementation-status.md); this priority note does not change CSMS approvals, remediation statuses, or phase numbering.


## Verification results — 2026-11-21

**Checkpoint: completed for the current implementation baseline.** The evidence below closes the two outstanding verification actions. Timing is a baseline observation only; it does not demonstrate a performance improvement.

### 1. CI/build duration baseline — [x] Measured

| Change class | Workflow run | Commit | Total elapsed | Astro production build | Result |
|---|---:|---|---:|---:|---|
| Content-only editorial Markdown | [44867371518](https://github.com/tnvcertification/tnvcertification/actions/runs/44867371518) | `88f19a19e8e164f480d3443a6d20b2de7e1367be` | 28 s | 761 ms (13 pages) | Success; selective preflight and all full gates passed |
| Source/build tooling | [44864063830](https://github.com/tnvcertification/tnvcertification/actions/runs/44864063830) | `455bb7313d029d999d7c8c608ac8d7f4ac1d104f` | 28 s | 1.02 s (13 pages) | Success; full gates passed; selective preflight correctly skipped |
| Source/build tooling | [44864868895](https://github.com/tnvcertification/tnvcertification/actions/runs/44864868895) | `bef1c3b89ef23a9ff1ca92ade8495eea5fa56846` | 23 s | 700 ms (13 pages) | Success; full gates passed; selective preflight correctly skipped |

Run elapsed time is measured from `run_started_at` to `updated_at`; Astro duration is taken from the production-build log. The sample contains one confirmed content-only run and two source/tooling runs. These are useful baseline observations, not a statistically robust comparison: runner/cache conditions and change sizes differ, and the observed 23–28 s workflow totals do not establish a speedup. Continue collecting comparable samples during future ordinary changes; do not claim a performance gain from this dataset.

### 2. Earlier error detection — [x] Verified in CI

- Negative test: [workflow run 44867324725](https://github.com/tnvcertification/tnvcertification/actions/runs/44867324725), commit `f3212076480bb221b3db5f6ee17adf9bf30bc7bd`, completed as failure after 18 s.
- The changed editorial file was classified as `content-only`; step **Validate changed editorial content** failed with `[CONTENT-002]` because the article had two intro paragraphs after H1 instead of exactly one.
- The general type/Astro checks, lint, tests, production build, and SEO audit were skipped after the preflight failure, proving the invalid entry is rejected before those later gates.
- Positive control: [workflow run 44867371518](https://github.com/tnvcertification/tnvcertification/actions/runs/44867371518), commit `88f19a19e8e164f480d3443a6d20b2de7e1367be`, passed the selective preflight and all general gates, including the complete 13-page Astro build and SEO/link audit.
- The CI test suite also reports passing isolated CLI tests for valid editorial Markdown, malformed YAML, and editorial rule violations in that positive run.

### Closure and operating decision

- [x] CI timing baseline captured and documented with run/commit evidence.
- [x] Earlier-error behavior demonstrated by a real failing CI run and a valid positive-control run.
- [x] Full production build and global quality gates remain mandatory for valid changes.
- [x] No incremental production rendering adopted.
- [x] Build-strategy verification checkpoint closed for the current baseline; CSMS work may resume from its existing tracker without changing CSMS approval or readiness statuses.

Future timing observations should be added here when additional ordinary content-only and source/configuration runs are available. Do not rewrite the baseline as a performance improvement claim.
