# Build Strategy

## Status

Adopted architecture. Selective editorial preflight is implemented and its CLI is covered by isolated end-to-end CI tests. The content-only conditional workflow step has not yet been exercised by a real editorial-only push. Production output continues to use a complete Astro build.

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
4. Verify the content-only conditional workflow step with a real editorial-only push and measure CI/build time. **Pending.**
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
