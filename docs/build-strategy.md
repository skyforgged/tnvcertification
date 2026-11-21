# Build Strategy

## Status

Adopted architecture; implementation is staged. The current production pipeline remains a complete Astro build.

## Operating phases

### Development and stabilization

Astro components, layouts, routes, configuration, and shared site settings may change frequently. Use the normal development server for feedback and run the full quality pipeline before integrating changes.

### Stable site with ongoing content growth

Markdown content is expected to be the most frequent change. The intended optimization is selective *pre-build validation* for changed content, while preserving whole-site integrity checks and a complete production output.

Astro components, layouts, route files, content schemas, collection definitions, integrations, Vite/Astro configuration, shared site configuration (including `src/site.ts`), and other shared code are treated as build-wide dependencies. A change to any of these requires a full production build.

## Change classification

| Changed paths | Required handling |
| --- | --- |
| One or more editorial Markdown files | Validate changed entries early; retain collection-wide duplicate, taxonomy, relation, schema, and production checks |
| Category/taxonomy Markdown | Run full taxonomy and cross-collection validation |
| Any `.astro`, route, layout, component, TypeScript/JavaScript module, schema, collection registry, integration, `src/site.ts`, `astro.config.*`, `vite.config.*`, package manifest, or lockfile | Full quality checks and full production build |
| Unknown, deleted, renamed, or ambiguous paths | Fail safe to full validation and full production build |

## Non-negotiable production guarantees

1. A deployment artifact must contain the complete site, never only changed pages.
2. The standard `astro build` remains the production source of truth.
3. Do not emulate incremental builds by building one route and replacing or merging a partial `dist` directory.
4. Selective validation is an early feedback optimization, not a replacement for global integrity checks.
5. If change classification is uncertain, fall back to the full pipeline.
6. Any future incremental renderer must prove output equivalence with a clean full build, including routes, assets, canonical metadata, hreflang, sitemap, and internal links, before it can be used for deployment.

## Current implementation baseline

- `pnpm build` runs the standard Astro production build.
- `src/content-validation.ts` performs whole-collection editorial, taxonomy, certification-scheme, and article/service relation validation at build completion.
- `scripts/audit-seo-build.mjs` audits the generated complete `dist` output.
- GitHub Actions runs checks, tests, a full production build, and the SEO build audit.

## Staged rollout

1. Record and preserve the safe full-build baseline (this document). **Complete.**
2. Add Git-based change classification with conservative full-build fallback. **Implemented.**
3. Add selective per-entry validation for changed editorial Markdown, without weakening global checks. **Pending.**
4. Measure actual CI/build time and verify that the new preflight catches changed-file errors earlier. **Pending.**
5. Evaluate incremental production rendering only if the full build becomes a material bottleneck. Do not adopt it solely to reduce a few seconds from the current build.

## Git change classification (implemented)

`scripts/classify-build-changes.mjs` compares a base and head commit and writes GitHub Actions outputs:

- `build_mode=content-only` only when every changed path is an added or modified editorial Markdown/MDX file under `src/content/` (excluding categories).
- `build_mode=full` for Astro/source/configuration/assets/taxonomy changes, deletions, renames, copies, unknown paths, empty diffs, missing base commits, or any diff error.

The Quality gates workflow fetches full Git history and runs this classifier before dependency installation. The output is currently informational and deliberately does not skip any checks: type checking, lint, tests, the complete `astro build`, and SEO audit continue to run for every workflow. This keeps deployment behavior unchanged while establishing a tested classification boundary.

Automated tests cover editorial Markdown changes, Astro component changes, taxonomy changes, deletions, and unavailable base commits.

## Decision

For the current 13-page site, keep full production builds. The measured build is only a few seconds, while partial static output introduces correctness and deployment risks. Optimize validation first; revisit incremental production generation when content volume or measured build duration justifies it.


## Selective editorial preflight (implemented)

For a diff classified as \`content-only\`, Quality gates runs
\`pnpm validate:changed <base-sha> <head-sha>\` before the general checks.
The script reads only added/modified Markdown/MDX files in the canonical
editorial collections and runs the existing \`validateEntry()\` rules against
each changed entry. Invalid/missing YAML frontmatter fails the preflight.

The classifier allowlist is intentionally limited to the editorial
collections declared by the project (articles, services, certifications,
training, and pages). Taxonomy, training schedules, unknown content folders,
deletions, renames, and mixed source/content changes use the full path.

This preflight is additive. It does not replace:
- \`validateAllEntries()\` duplicate intro/meta-description/slug checks;
- cross-collection taxonomy validation;
- certification scheme validation;
- article/service relationship validation;
- Astro content schema/type checks, lint, tests, complete production build,
  or SEO/link audit.

All of these existing full checks continue to run for every CI workflow.
