# Visual Redesign & Architecture Roadmap

> **Purpose:** Single tracking document for the TNV Certification website redesign. Checkboxes are the source of truth for task progress. A task may be checked only after its implementation and relevant validation are complete.
>
> **Current status:** Planned — implementation and visual QA have not yet been completed.
>
> **Approved direction:** Premium, modern, mature, professional, corporate. This document records the latest design decisions and takes precedence over older visual proposals where they conflict.

## 1. Non-negotiable design decisions

### 1.1 Visual direction
- [ ] Use a premium, modern, mature, professional, corporate visual language.
- [ ] Use white as the dominant page background.
- [ ] Use very light gray sparingly for subtle section separation.
- [ ] Use deep blue for deliberate emphasis, such as selected hero or CTA areas.
- [ ] Use orange, mint, yellow, and pink only as restrained accents—not as a different background color for every section.
- [ ] Create hierarchy through whitespace, typography, grid, image composition, alignment, borders, and restrained shadows.
- [ ] Keep the visual language consistent across all page types.
- [ ] Remove childish, school-project, generic-template, and excessive decoration patterns.
- [ ] Avoid repetitive card grids, gratuitous gradients/glows, excessive rounded cards, blobs, and purposeless animation.

### 1.2 Page width and composition
- [ ] Main-menu pages use a wide page composition with generous, consistent content width.
- [ ] Define shared wide-container and reading-container sizes, responsive gutters, and breakpoints.
- [ ] Do not force editorial/article content to use the same text measure as wide corporate pages.
- [ ] Give sections visual distinction through layout and content composition, not arbitrary background-color changes.

### 1.3 Main-menu hero requirements
- [ ] Every main-menu page has a purposeful hero.
- [ ] Each hero contains exactly one page-level H1.
- [ ] The first introductory paragraph appears immediately after the H1 in the content hierarchy.
- [ ] Each main-menu page has one featured image.
- [ ] Hero composition is responsive and accessible, with consistent typography, spacing, image treatment, and CTA behavior.
- [ ] Featured image URLs are unique per page URL; do not reuse the same image URL on different page URLs.
- [ ] Image subject matter is credible and relevant to certification, audit, training, industry, or corporate context.
- [ ] Do not imply stock or placeholder imagery depicts TNV staff, clients, facilities, or events.

### 1.4 Shared design system
- [ ] Define shared typography tokens and heading/body scales.
- [ ] Define spacing scale and vertical rhythm.
- [ ] Define colors, neutral surfaces, border colors, and accessible contrast pairs.
- [ ] Define wide and reading container tokens.
- [ ] Define button, link, badge, card, section-heading, image-frame, and form-control patterns.
- [ ] Define focus-visible, keyboard, reduced-motion, and responsive interaction rules.
- [ ] Ensure layouts, blocks, and components consume shared tokens rather than creating unrelated local design systems.

## 2. Layout architecture

Layouts are selected by page purpose. They may share primitives and components, but must preserve their own information hierarchy and user experience.

### 2.1 Required layout inventory

| Layout | Intended use | Main responsibility |
|---|---|---|
| `WidePageLayout.astro` | Homepage, corporate pages, and wide main-menu/index pages | Wide, flexible corporate page composition |
| `ServiceLayout.astro` | Certification/service detail pages | Service scope, benefits, process, evidence, FAQs, and next steps |
| `ArticleLayout.astro` | Articles and editorial content | Reading-focused typography, metadata, article body, and related content |
| `TrainingLayout.astro` | Training/course detail pages | Course overview, objectives, audience, curriculum, delivery, schedule references, and registration |
| `ScheduleLayout.astro` | Schedule archive and schedule/batch detail pages | Schedule discovery, dates, status, delivery mode, venue, training relationship, and registration |

### 2.2 Layout implementation tracking
- [ ] Audit current layouts and all route-to-layout assignments.
- [ ] Define the shared shell used by all layouts (site header, navigation, footer, SEO, breadcrumbs where appropriate).
- [ ] Design and implement `WidePageLayout.astro`.
- [ ] Design and implement `ServiceLayout.astro`.
- [ ] Design and implement `ArticleLayout.astro`.
- [ ] Design and implement `TrainingLayout.astro`.
- [ ] Design and implement `ScheduleLayout.astro`.
- [ ] Confirm `ScheduleLayout` is used for schedule listing/detail routes where appropriate—not an article or training layout by convenience.
- [ ] Confirm all layouts use shared design tokens and UI primitives.
- [ ] Confirm responsive behavior at mobile, tablet, laptop, and wide desktop sizes.

## 3. Component architecture

Components are focused, reusable presentation units. They receive explicit typed props and must not hardcode organization details that belong in `src/site.ts`.

### 3.1 Shared UI primitives
- [ ] Audit and consolidate container, button, link, badge, icon, and image primitives.
- [ ] Implement or refine shared `Container` variants for wide and reading widths.
- [ ] Implement or refine button variants and interaction states.
- [ ] Implement or refine badges/status indicators with accessible contrast.
- [ ] Implement reusable section heading and section wrapper patterns.
- [ ] Implement consistent image presentation, aspect ratios, loading priority, and responsive behavior.

### 3.2 Reusable content components
- [ ] Audit and refine service cards.
- [ ] Audit and refine article cards.
- [ ] Audit and refine training cards.
- [ ] Audit and refine schedule cards/rows.
- [ ] Audit and refine FAQ, process, statistics, gallery, testimonial, and CTA presentation where these patterns are needed.
- [ ] Ensure cards do not all look identical when their information architecture differs.
- [ ] Ensure all components are keyboard accessible and use semantic HTML.

### 3.3 Site shell and SSOT
- [ ] Keep company identity, contact details, navigation, and site-wide configuration sourced from `src/site.ts`.
- [ ] Do not hardcode company identity/contact details in layouts, components, blocks, SEO, footer, or CTA.
- [ ] Keep header, navigation, breadcrumbs, and footer consistent across all layouts.
- [ ] Preserve the contextual footer behavior documented in the architecture guidelines.

## 4. Block architecture

Blocks define content composition and order; components define presentation. A block system must not become a universal replacement for purpose-specific layouts.

- [ ] Audit current block schemas, renderers, and content usage.
- [ ] Define typed block schemas with discriminated unions and block-specific validation.
- [ ] Define a central block registry.
- [ ] Ensure the renderer preserves the exact order of the content block array.
- [ ] Keep shared FAQ, HowTo, and CTA blocks reusable across supported content types.
- [ ] Add page-specific blocks only when there is a real content need.
- [ ] Keep training schedule data in the canonical schedule collection; the training schedule block only configures/displays the related schedule list.
- [ ] Preserve compatibility with existing content during migration.
- [ ] Localize all visible block text and labels for Indonesian and English.
- [ ] Ensure structured data is emitted only for visible content that satisfies the relevant requirements.

## 5. Content and page migration

### 5.1 Content model and relationships
- [ ] Review all collection schemas before changing them.
- [ ] Preserve Markdown + frontmatter as the canonical editorial source.
- [ ] Preserve `src/site.ts` as the single source of truth for company/site configuration.
- [ ] Keep numeric relationship IDs numeric (for example, `serviceId`, `trainingId`) and slugs as strings (for example, `serviceSlug`, `trainingSlug`).
- [ ] Do not duplicate canonical service, training, or schedule data in unrelated content records.
- [ ] Keep bilingual content and reciprocal translation relationships valid.

### 5.2 Page migration
- [ ] Inventory every published page and assign its correct layout.
- [ ] Migrate homepage to the approved design system.
- [ ] Migrate corporate/main-menu pages to `WidePageLayout` and the standard hero pattern.
- [ ] Migrate service index and service detail pages.
- [ ] Migrate article archive and article detail pages.
- [ ] Migrate training index and training detail pages.
- [ ] Migrate schedule index and schedule detail pages to the schedule-specific experience.
- [ ] Verify each page has appropriate, unique featured-image URL and accurate alt text.
- [ ] Verify no published route is left on an unintended legacy layout.
- [ ] Verify all navigation and internal links after migration.

## 6. ScheduleLayout experience requirements

- [ ] Provide a clear schedule page heading and introductory context.
- [ ] Use a schedule-appropriate hero/intro composition; include a featured image when the page content and editorial model call for one.
- [ ] Provide usable schedule discovery/filter controls where supported by the data and route.
- [ ] Present training/course name, date range, delivery mode, location, and registration status with clear hierarchy.
- [ ] Distinguish open, closed, full, cancelled, draft, and past schedules accurately.
- [ ] Do not invent event start/end times from date-only values.
- [ ] Do not imply an unconfirmed venue or registration state is confirmed.
- [ ] Link each schedule to its canonical training page using `trainingSlug`.
- [ ] Use `serviceSlug` only as optional service context; do not require every schedule to belong to a service.
- [ ] Make registration CTA clear and render it only when a valid registration destination exists.
- [ ] Ensure the schedule list and detail views work responsively and accessibly.

## 7. Visual and technical quality assurance

### 7.1 Visual QA
- [ ] Review every main-menu page at desktop width.
- [ ] Review every main-menu page at tablet width.
- [ ] Review every main-menu page at mobile width.
- [ ] Confirm page width is generous and consistent where the page purpose calls for a wide layout.
- [ ] Confirm section backgrounds are restrained and not arbitrarily alternating through multiple colors.
- [ ] Confirm typography, spacing, image treatment, buttons, cards, and section headings are consistent.
- [ ] Confirm no broken, duplicated, irrelevant, or misleading images.
- [ ] Confirm every page URL uses a unique featured-image URL.
- [ ] Confirm no horizontal overflow, clipped content, or awkward wrapping.
- [ ] Confirm hover, focus, active, and disabled states are clear.

### 7.2 Accessibility and content QA
- [ ] Validate semantic heading hierarchy and exactly one H1 per page.
- [ ] Validate intro placement and editorial quality.
- [ ] Validate image alt text and decorative-image handling.
- [ ] Validate keyboard navigation, focus visibility, labels, and contrast.
- [ ] Validate localized UI and content.
- [ ] Validate that status, dates, prices, quota, venue, and registration claims match source data.

### 7.3 Engineering and SEO QA
- [ ] Run the production build and resolve all errors.
- [ ] Run available type checks and lint checks.
- [ ] Validate internal links and route generation.
- [ ] Validate canonical URLs, metadata, Open Graph, hreflang, sitemap, and robots rules.
- [ ] Validate JSON-LD against the content actually rendered.
- [ ] Review image optimization, dimensions, loading priority, and layout shift.
- [ ] Review Lighthouse/Core Web Vitals for representative page types.
- [ ] Record final validation results and commit references below.

## 8. Execution phases and progress tracker

Complete phases in order unless an explicit dependency requires a different sequence. Do not mark a phase complete while any mandatory task inside it remains unchecked.

### P15 — Visual Design Audit & Requirements
- [x] Audit existing pages, layouts, components, blocks, styles, and design tokens.
- [x] Review existing architecture documentation and identify conflicts with the approved visual direction.
- [x] Inventory page types and map every inspected route to its intended layout.
- [ ] Complete the generated-output featured-image audit and confirm duplicate image URLs/bytes across all page URLs.
- [x] Record visual defects and migration risks in [P15 Visual Audit Findings](./visual-audit.md).
- [ ] Complete screenshot-based visual review at desktop, tablet, and mobile sizes.
- [ ] Approve the detailed design-system specification before broad implementation.

**Exit criteria:** audit findings and page/layout matrix are documented. P15 remains open until generated-output image validation, screenshot review, and detailed design-system approval are complete.

### P16 — Shared Design System
- [ ] Define typography, color, spacing, container, border, and responsive tokens.
- [ ] Define hero, section, image, button, card, and form visual patterns.
- [ ] Verify color contrast and interaction states.
- [ ] Update shared global styles without introducing page-specific inconsistencies.

**Exit criteria:** shared tokens and primitives are implemented and validated on representative pages.

### P17 — Layout Architecture
- [ ] Implement/refine `WidePageLayout`.
- [ ] Implement/refine `ServiceLayout`.
- [ ] Implement/refine `ArticleLayout`.
- [ ] Implement/refine `TrainingLayout`.
- [ ] Implement/refine `ScheduleLayout`.
- [ ] Verify shared shell consistency and page-specific hierarchy.

**Exit criteria:** all five layouts are usable, responsive, and connected to the correct page types.

### P18 — Components & Blocks
- [ ] Refactor shared UI primitives and content components.
- [ ] Define/validate typed block schemas.
- [ ] Implement central registry and order-preserving renderer.
- [ ] Add or refine page-type-specific blocks where required.
- [ ] Preserve existing content compatibility and localization.

**Exit criteria:** components and blocks are reusable, typed, accessible, and do not override layout responsibilities.

### P19 — Page and Content Migration
- [ ] Migrate homepage and corporate/main-menu pages.
- [ ] Migrate service pages.
- [ ] Migrate article pages and archive.
- [ ] Migrate training pages.
- [ ] Migrate schedule pages using `ScheduleLayout`.
- [ ] Resolve featured-image uniqueness and alt-text requirements.
- [ ] Verify relationships, navigation, and localized routes.

**Exit criteria:** all intended pages use the approved design system and correct layouts without broken content or routes.

### P20 — Visual QA, Accessibility & Release Readiness
- [ ] Complete desktop/tablet/mobile visual review.
- [ ] Complete accessibility and content validation.
- [ ] Complete build, type, lint, link, SEO, and structured-data validation.
- [ ] Review performance and image optimization.
- [ ] Fix all release-blocking issues.
- [ ] Record final commit SHA and validation summary.

**Exit criteria:** all mandatory QA tasks pass and the redesign is ready for release.

## 9. Progress log

| Date | Phase | Work completed | Validation | Commit |
|---|---|---|---|---|
| 2026-11-21 | Documentation baseline | Recorded approved visual direction and roadmap; aligned architecture visual identity section | Documentation update committed; implementation not yet started | See repository history |
| 2026-11-21 | P15 — Visual audit | Audited layout files, route assignments, shared shell, hero, components, block renderer, global CSS, design docs, and image audit implementation; recorded findings in `docs/visual-audit.md` | Source audit completed. Production build, generated image audit, and screenshot review remain pending. | `6dcdbda` |

## 10. Change control

- Update this checklist as work progresses; do not silently remove unfinished tasks.
- Mark a checkbox `[x]` only when the task is actually complete and verified.
- If a task is blocked, leave it unchecked and add the reason in the progress log.
- If scope changes, update this roadmap and document why.
- Keep implementation incremental and validate before committing.
- Default workflow is Direct-to-Main with small, validated commits. If risk or incompatibility appears, use Branch → PR → Review → Merge → Delete Branch.
- This roadmap tracks implementation status; planned tasks must not be described as completed work.
