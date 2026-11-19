# Components, Blocks, Layouts, and CSS Standards

## Components
- Components are reusable presentation units with a focused responsibility.
- Components should be content-agnostic when practical and receive data through explicit props.
- Keep component markup semantic and accessible.
- Do not make every component a page section; create components at useful reuse boundaries.

## Blocks
- Blocks are compositional section types that connect structured content to reusable UI components.
- Use a typed block registry / renderer to map block type to component.
- Blocks allow content authors to select and arrange sections where appropriate.
- Validate block data with discriminated schemas.
- Avoid turning the block system into an overly generic abstraction; block types should have clear purpose.
- Page composition may mix blocks with fixed layout elements when that improves UX.

## Layouts
- Multiple layouts are expected and encouraged.
- Choose layout by page intent and content type, not by convenience alone.
- Services/certification pages and articles must not be forced into the same layout.
- Layouts may share global elements (header, footer, navigation, breadcrumbs) while retaining unique page structures.

## CSS strategy
- Use native CSS (Vanilla CSS) as the primary styling system.
- Do not use Tailwind, Bootstrap, or a generic UI component library unless a project decision explicitly approves it.
- Use CSS Custom Properties for design tokens (colors, typography, spacing, sizing, borders, radii, shadows, motion).
- Use Astro scoped styles or CSS Modules-style isolation where suitable; shared global CSS should be limited to reset, tokens, typography defaults, and site-wide primitives.
- Prefer explicit component styles over utility-class chains.
- No styling decisions should be generated ad hoc per component: use the shared design tokens and documented visual system.
- Avoid AI-template aesthetics: gratuitous gradients, excessive rounded cards, repeated card grids, decorative shadows, floating blobs, generic icon tiles, and animations without purpose.
- Do not turn every section into a card. Use editorial layouts, typographic hierarchy, whitespace, grids, tables, lists, borders, and image composition according to the content.
- Visual variety should come from composition and content hierarchy, not inconsistent styling.
- Responsive behavior, reduced-motion preferences, focus states, and interaction feedback must be accessible and intentional.

## Semantic CSS classes
- Use consistent, descriptive semantic class names that describe role or meaning rather than appearance.
- Prefer a component-scoped naming convention, such as `certification-card`, `article-header`, `training-schedule`, and `content-block--faq`.
- Use clear modifier patterns for variants, e.g. `service-hero--compact`.
- Avoid opaque abbreviations, arbitrary names, and presentational classes that encode color or one-off styling.
- Avoid global selectors that unintentionally affect components.
- Use CSS variables/design tokens for shared colors, spacing, typography, borders, and responsive values.
- Component styles should be scoped or namespaced to prevent leakage.
- Responsive behavior and focus/hover states should be explicit and accessible.

## Visual quality bar
- The visual direction is editorial corporate: confident typography, intentional whitespace, disciplined grids, restrained color, and clear information hierarchy.
- Do not rely on generic SaaS/AI landing page patterns.
- Avoid uniform page structures. Service, article, training, schedule, and corporate pages should have distinct layouts tailored to their content and user tasks.
- Design should look authored for TNV Certification, not assembled from a generic theme.

## Consistency
- Preserve semantic naming conventions across layouts, components, blocks, and stylesheet files.
- Reuse patterns rather than copy/paste markup or CSS.
- Do not introduce a new naming convention without updating this guideline.
