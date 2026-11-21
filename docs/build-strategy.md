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

1. Record and preserve the safe full-build baseline (this document).
2. Add Git-based change classification with conservative full-build fallback.
3. Add selective per-entry validation for changed editorial Markdown, without weakening global checks.
4. Measure actual CI/build time and verify that the new preflight catches changed-file errors earlier.
5. Evaluate incremental production rendering only if the full build becomes a material bottleneck. Do not adopt it solely to reduce a few seconds from the current build.

## Decision

For the current 13-page site, keep full production builds. The measured build is only a few seconds, while partial static output introduces correctness and deployment risks. Optimize validation first; revisit incremental production generation when content volume or measured build duration justifies it.
