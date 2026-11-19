# TNV Certification Design System

## Direction
Editorial corporate: institutional, precise, contemporary, confident, restrained. Typography, whitespace, and composition should do the design work. Avoid generic SaaS/AI landing-page aesthetics.

## Styling
- Tailwind CSS is the primary styling workflow.
- CSS custom properties are required for shared design tokens.
- Astro scoped styles/component-local CSS are available for complex or distinctive treatments.
- Do not add UI kits or styling frameworks beyond Tailwind without an explicit decision.

## Tokens and typography
- Centralize semantic tokens for color, spacing, typography, sizing, borders, and motion.
- Components should use shared tokens rather than invent values independently.
- Establish type scale, line height, readable measure, and purposeful hierarchy.
- Use sans-serif for UI/body; a complementary serif may be used selectively.
- Evaluate font licensing and prefer self-hosting when appropriate.

## Composition
- Use deliberate grids, alignment, whitespace, type, rules/borders, tables, lists, and image composition.
- Do not make every section a card or repeat the same layout across all page types.
- Certification, editorial, training, schedule, and corporate pages must reflect their content and purpose.
- Gradients, shadows, pill controls, icon tiles, decorative blobs, and animations are not defaults.
- Motion must be purposeful, subtle, accessible, and respect reduced-motion.
- Responsive design should be designed at breakpoints, not simply stacked.

## Implementation
- Use Tailwind for common utility styling.
- Avoid excessively long class strings; create reusable components or local styles where helpful.
- Use semantic markup and keyboard-accessible focus/hover states.

## Review
Check visual hierarchy, layout originality, token consistency, responsiveness, accessibility, and absence of generic template patterns before accepting design.
