# TNV Certification Design System

## Design direction
Use an editorial corporate visual language: institutional, precise, contemporary, confident, and restrained. Avoid generic SaaS and AI-generated landing page aesthetics. Make layout and typography do the design work.

## CSS stack
- Vanilla CSS is the primary styling system.
- CSS Custom Properties (design tokens) are required for shared color, spacing, typography, sizing, border, radius, shadow, and motion values.
- Astro scoped styles are preferred for component-level styles; use a small shared global stylesheet for reset, tokens, base typography, and site primitives.
- Tailwind, Bootstrap, and generic UI libraries are not used by default. Adoption requires an explicit architectural decision.
- Prefer CSS Grid and Flexbox for layout. Do not introduce layout dependencies without a clear need.

## Design tokens
- Centralize tokens in CSS custom properties.
- Components must use token values rather than independently inventing colors, spacing, radii, or typography.
- Token names should be semantic (e.g. color-text-primary, color-surface, color-border, spacing-section) rather than tied to one page.
- Palette, typography, and spacing should be documented and reviewed before being expanded.

## Typography
- Establish a clear type scale with deliberate line height, measure, and letter spacing.
- Sans-serif typography serves UI, navigation, body, and technical content.
- A complementary serif may be used selectively for editorial headlines or long-form content.
- Avoid overly large headings in every section; hierarchy must be meaningful.
- Candidate families for evaluation: IBM Plex Sans and IBM Plex Serif. Final fonts should be selected and self-hosted where licensing permits.

## Composition
- Use disciplined grids, alignment, whitespace, typography, rules/borders, tables, lists, and image composition.
- Not every section should be a card or share the same visual treatment.
- Page layouts must differ according to purpose: service/certification, article/editorial, training, schedule, corporate/about.
- Cards are used only when content is genuinely a grouped item or interactive unit.
- Gradients, decorative shadows, pill-shaped controls, icon tiles, blobs, and animations are not defaults; add them only with a clear functional or brand rationale.
- Motion must be subtle, purposeful, accessible, and respect reduced-motion preferences.
- Responsive design is intentional at each breakpoint, not merely stacked desktop columns.

## Semantic class naming
- Use semantic, consistent component class names such as `certification-process`, `training-course`, `article-body`, and `schedule-list`.
- Component variant modifiers use a consistent pattern such as `training-course--featured`.
- Avoid appearance-only names and arbitrary abbreviations.
- Keep styles scoped to components; global CSS should not unintentionally leak.

## Image treatment
- Use optimized WebP images in production.
- SVG may be used as editable source artwork or placeholder input; convert production image assets to WebP when appropriate.
- Do not use fake photos or imagery that misrepresents TNV's people, facilities, clients, or events.
- Image cropping, aspect ratios, and alt text are selected intentionally for the content and context.

## Quality review
Before accepting a design, review it for:
- Clear hierarchy and strong typography.
- Page-specific composition rather than repeated template sections.
- Consistent tokens and semantic CSS.
- Responsive behavior and accessibility.
- No decorative elements without purpose.
- No unintentional AI-template patterns.
