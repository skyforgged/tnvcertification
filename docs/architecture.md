# Astro Architecture Guidelines

## Core approach
- Build TNV Certification as a content-driven Astro site.
- Keep page content, presentation, composition, and layout responsibilities separate.
- Markdown files with frontmatter are the source of truth for editorial content.
- Use Astro Content Collections with schema validation for structured content.
- UI is composed from reusable components and content-selected blocks.
- Blocks map content data to reusable components; they must not become a universal page layout.
- Keep the architecture understandable, maintainable, accessible, and extensible.

## Content model
Organize collections by content type, not by visual layout. Recommended initial collections:
- certifications
- training
- training-schedules
- articles
- pages

Each collection should define a schema in TypeScript. Use frontmatter for page metadata and structured content. Use Markdown body for long-form editorial content where appropriate.

## Layout flexibility
Do not force all pages into one layout. Select layouts based on the purpose and content:
- Service / certification pages: service-focused layout with benefits, process, standards, FAQs, and conversion actions.
- Articles: reading-focused layout with readable typography, author/date metadata, table of contents when useful, and related content.
- Training pages: course-focused layout with objectives, audience, curriculum, delivery method, and registration.
- Schedule pages: listing/calendar-oriented layout with date, status, modality, and registration.
- Corporate/static pages: flexible informational layouts.

Reuse components across layouts where appropriate, but preserve meaningful differences in information hierarchy and page experience.

## Rendering and data
- Avoid duplicating content in page templates.
- Prefer typed content and validated frontmatter.
- Use block arrays where a page needs flexible section ordering.
- Keep content authoring straightforward for Markdown editors.
- Components should receive explicit typed props rather than reaching into unrelated global state.

## Maintainability
- Keep components focused and reusable; avoid giant components.
- Avoid layout-specific CSS leaking into other layouts.
- Use semantic HTML and accessible headings, landmarks, links, and controls.
- Document any architecture exceptions in the relevant docs.
