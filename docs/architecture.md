# Astro Architecture Guidelines

## Core approach
- Build TNV Certification as a content-driven Astro website.
- Use Astro 7 or newer stable releases, subject to compatibility checks before upgrades.
- Use TypeScript 7 or newer stable releases, with strict type checking enabled.
- Use Tailwind CSS (latest stable compatible release) as the primary styling workflow.
- Keep content, data, presentation, composition, and layout responsibilities separate.
- Markdown files with frontmatter are the source of truth for editorial content.
- Use Astro Content Collections with schema validation.
- UI is composed from reusable components and content-selected blocks.
- Blocks map content data to components; they must not become a universal page layout.
- Keep the architecture understandable, maintainable, accessible, and extensible.

## Content model
Organize collections by content type, not visual layout. Recommended initial collections:
- certifications
- training
- training-schedules
- articles
- pages

Each collection should define a TypeScript schema using Astro's content APIs and Zod. Use frontmatter for metadata and structured content. Use Markdown body for long-form editorial content. Use MDX only when embedding components in editorial content is a real requirement.

## Layout flexibility
Do not force all pages into one layout. Choose layouts by purpose and content:
- Certification pages: service-focused layout with scope, benefits, process, FAQs, and next steps.
- Articles: reading-focused layout with readable typography, author/date metadata, and related content where useful.
- Training pages: course-focused layout with objectives, audience, curriculum, delivery, and registration details.
- Schedule pages: schedule/list-oriented layout with dates, status, modality, and registration.
- Corporate pages: flexible informational layouts.

Reuse components across layouts where appropriate, but preserve meaningful differences in hierarchy and user experience.

## Styling
- Tailwind CSS is the primary styling workflow for layout, spacing, responsive behavior, and common presentation.
- Centralize design tokens with CSS custom properties.
- Use scoped/component-local CSS for distinctive complex visuals when utility classes are not the clearest solution.
- Avoid excessively long utility chains; extract meaningful Astro components or reusable patterns when appropriate.
- Do not add Bootstrap or generic UI kits without an explicit decision.

## Rendering and data
- Avoid duplicating content in page templates.
- Prefer typed content and validated frontmatter.
- Use block arrays where a page needs flexible section ordering.
- Keep content authoring straightforward for Markdown editors.
- Components should receive explicit typed props rather than reaching into unrelated global state.

## Maintainability
- Keep components focused and reusable; avoid giant components.
- Use semantic HTML and accessible headings, landmarks, links, and controls.
- Document architecture exceptions in the relevant docs.
- Keep dependencies lean; introduce packages only when they solve a concrete need.

## Contextual footer

The website uses one reusable footer component with two rendering modes: a default footer and a service-contextual footer. Do not create separate hardcoded footer components for individual service pages or articles.

- Default footer: used on general pages and articles without a valid service relationship. It includes company information, general navigation/contact information, and a general CTA.
- Service footer: used on a service page, or on an article linked to a service. It may include a service-specific claim and CTA that link to the related service.
- Service pages resolve footer context from their own service data.
- Articles may optionally declare `serviceId` in frontmatter. This is a foreign-key-style reference to the canonical service record; the article must not duplicate the service name or claim text.
- When an article has a valid `serviceId`, resolve the service and render its contextual footer. When `serviceId` is absent or cannot be resolved, fall back safely to the default footer.
- Footer claims must be accurate, natural, and based on the resolved service. Example: “PT. Intiprima Sertifikasi menyediakan layanan Sertifikasi ISO 9001.” Do not hardcode service names or company claims into components.
- Company identity and shared company information must come from the central `site.ts` configuration (single source of truth). Service metadata and optional service-specific claim copy should come from canonical service data.
- Keep footer presentation separate from the context-resolution/data logic. Use a typed resolver or equivalent clear logic to resolve the footer context.

## Article metadata and service relationship

Article frontmatter may include:
- `pubDate`: original publication timestamp, in valid ISO 8601 format.
- `updatedDate`: timestamp of the latest meaningful editorial/content update, in valid ISO 8601 format; optional.
- `serviceId`: optional numeric identifier referencing a canonical service record.
- Other editorial metadata (such as author, category, tags, draft status, and content blocks) should be validated through the collection schema.

Treat `serviceId` as a service reference, not as duplicated service content. Resolve the ID against the canonical service dataset. If no matching service exists, do not invent a relationship or contextual claim; use the default footer as fallback.

## Sitemap lastmod

Generate sitemap `lastmod` from actual content metadata rather than build/deploy timestamps.

- For articles, use `updatedDate` when present; otherwise fall back to `pubDate`.
- For other content types, use their own real modification metadata when available; define an explicit fallback appropriate to that content type.
- Do not set `lastmod` to the current build time or deployment time.
- Keep timestamps valid and consistent in ISO 8601 format, including timezone information where available.
- Only change `updatedDate` when meaningful content changes occur; avoid false freshness signals.

