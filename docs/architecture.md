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
