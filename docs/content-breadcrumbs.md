---
title: Content breadcrumbs and page consistency
status: implemented on feature branch
phase: P11
---

# P11 — Content breadcrumbs

## Scope
Add an accessible breadcrumb trail to article and service detail pages, reinforcing route context and helping users return to archive/index pages.

## Changes
- Add reusable `src/components/Breadcrumbs.astro` with semantic navigation, ordered list, accessible label, and current-page indicator.
- Integrate breadcrumbs in `ArticleLayout.astro`: Home → Articles → Current article.
- Integrate breadcrumbs in `ServiceLayout.astro`: Home → Services → Current service.
- Preserve SEO metadata, JSON-LD, article/service content, and related-article sections.

## Validation
- Source review of existing route conventions confirms article detail route `/articles/[slug]/` and service detail route `/services/[slug]/`, with service index at `/service/`.
- Local pnpm check/typecheck/lint/test/build and visual keyboard review not run in this environment.
- No main branch changes; user merges locally after validation.
