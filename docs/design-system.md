# TNV Certification Design System

**Status:** P16 foundation — token system and shared visual specifications defined; representative-page validation remains pending.

## 1. Design intent

Editorial corporate: institutional, precise, contemporary, confident, and restrained. The experience should feel appropriate for a professional certification and training organization. Typography, whitespace, alignment, image composition, and clear information hierarchy do the design work.

Avoid generic SaaS/AI landing-page patterns, school-project styling, decorative gradients/glows, blobs, gratuitous animation, excessive pill controls, and repetitive card grids.

## 2. Color system

White is the default page surface. Very light neutral gray is reserved for subtle section separation and inset surfaces. Deep navy is the primary high-emphasis color for selected hero, navigation, and CTA contexts. Bright brand colors are accents, not a rotating set of section backgrounds.

| Token | Value | Intended use |
|---|---|---|
| `--color-page` | `#FFFFFF` | Default page/body surface |
| `--color-surface` | `#FFFFFF` | Cards and raised content |
| `--color-surface-muted` | `#F5F7FA` | Subtle alternate sections |
| `--color-surface-inset` | `#EEF2F6` | Inset panels and quiet controls |
| `--color-ink` | `#172033` | Primary text |
| `--color-ink-muted` | `#536174` | Supporting text |
| `--color-ink-subtle` | `#697586` | Metadata and secondary labels |
| `--color-brand-deepblue` | `#1736A8` | Strong brand emphasis |
| `--color-brand-blue` | `#315CFF` | Links and selected interactive accents |
| `--color-border` | `#DCE2EA` | Standard separators and outlines |
| `--color-border-strong` | `#B8C2D0` | Emphasized boundaries |
| `--color-brand-orange` | `#FF6B35` | Restrained accent only |
| `--color-brand-mint` | `#36C9A5` | Restrained accent only |
| `--color-brand-yellow` | `#FFD447` | Restrained accent only |
| `--color-brand-pink` | `#F45B91` | Restrained accent only |

Do not assume every brand color is suitable for text on white. Verify actual foreground/background pairs before using an accent for text, controls, or status communication. Never communicate status by color alone.

## 3. Typography

- Primary family: Inter with system sans-serif fallbacks.
- Serif family: Merriweather/Noto Serif/Georgia is optional for occasional editorial emphasis, not a default heading style.
- Body copy: 16px minimum baseline, 1.65 line-height for long-form paragraphs.
- UI and metadata: 13–14px with readable contrast; avoid tiny uppercase labels as the primary information carrier.
- Headings: compact but not cramped line-height; use weight and scale rather than decorative treatments.
- Wide corporate content may use broad line lengths for headings and grids; paragraph measure should remain comfortable.
- Article body measure: approximately 68ch maximum.
- Avoid arbitrary letter spacing and excessive all-caps.

## 4. Layout, containers, and spacing

- Wide content container: maximum 80rem (1280px).
- Reading container: maximum 48rem (768px).
- Default responsive gutters: 1rem mobile, 1.5rem tablet, 2rem desktop.
- Section vertical rhythm: 4–6rem desktop, 3–4rem tablet, 2.5–3rem mobile; tune to content density.
- Use a consistent 4px base spacing rhythm. Prefer the Tailwind spacing scale and shared semantic tokens over one-off values.
- Main-menu pages should use wide composition. Editorial prose should retain a reading measure even when its shell is wide.
- Do not force all sections into cards. Use open layouts, rules, tables, lists, image/text splits, and cards only when they clarify relationships.

## 5. Borders, corners, and elevation

- Standard border: 1px solid the shared border token.
- Strong border: reserved for active, selected, or structurally important boundaries.
- Small control radius: 0.375–0.5rem.
- Card/panel radius: 0.75rem by default; larger radii only when the composition warrants them.
- Avoid rounding every section or using pill shapes for ordinary navigation and content.
- Shadows should be subtle and rare. Prefer borders and whitespace for separation.

## 6. Shared component patterns

### Hero
- One page-level H1, followed immediately in content hierarchy by the introductory paragraph.
- Main-menu hero includes one meaningful featured image with accurate alt text.
- Use a restrained editorial split layout: text and image balanced on a wide grid, then deliberately reordered/stacked on small screens.
- Deep-blue full-bleed or contained hero treatment is reserved for selected pages; white-background hero is the default direction.
- No decorative blobs, blur glows, or unrelated color shapes.
- Keep CTA placement and button hierarchy consistent.

### Sections
- Each section has a clear heading and coherent content purpose.
- Distinguish sections through spacing, alignment, subtle neutral surfaces, dividers, and composition—not arbitrary background colors.
- Use a consistent section-heading pattern and avoid repeating the same card grid in every section.

### Images
- Preserve meaningful source imagery and render the canonical featured image rather than placeholders.
- Use explicit width/height or aspect ratio to prevent layout shift.
- Use `object-fit: cover` for photographic frames when cropping is appropriate; use `contain` for diagrams/illustrations.
- Provide descriptive alt text for informative images and empty alt text for decorative images.
- Every page URL must use a unique featured-image URL. Validate URL and byte uniqueness in generated output.

### Buttons and links
- Primary action: solid deep-blue treatment with clear text contrast.
- Secondary action: quiet outlined or text-link treatment.
- Destructive, disabled, hover, active, and focus states must be visually distinct where applicable.
- Links must remain recognizable without relying only on color.

### Cards and data displays
- Use cards only for discrete, related items such as service, article, training, or schedule summaries.
- Keep card structure and emphasis specific to the data type; do not force all content into one universal card.
- Use semantic tables or aligned rows for dense schedule and comparison data.

### Forms
- Every control has a visible or programmatic label, clear validation messaging, and keyboard-operable interaction.
- Focus state must be visible and must not rely on color alone.

## 7. Responsive behavior

- Design mobile, tablet, laptop, and wide desktop compositions intentionally; do not merely shrink desktop layouts.
- Prevent horizontal overflow and preserve readable text measure.
- Stack split hero content with deliberate image sizing and spacing.
- Navigation must remain keyboard accessible and usable at narrow widths.
- Interactive targets should be comfortably tappable; avoid tiny icon-only controls without accessible names.

## 8. Accessibility and motion

- Maintain semantic landmarks and logical heading order.
- Use visible `:focus-visible` treatment with sufficient contrast and offset.
- Respect `prefers-reduced-motion`; motion is optional and never required to understand content.
- Verify text, controls, borders, and focus contrast against their actual backgrounds before release.
- Do not encode meaning or status using color alone.

## 9. Implementation rules

- Tailwind CSS 4 is the primary utility workflow.
- CSS custom properties are the source for shared semantic design tokens; register reusable values in `@theme` when Tailwind utilities are useful.
- Astro scoped styles are appropriate for distinctive component composition.
- Do not add another UI kit or styling framework without an explicit decision.
- Components must receive explicit typed props and must not hardcode company identity/contact details; those remain sourced from `src/site.ts`.
- Layouts, blocks, and components consume the same shared tokens.
- Preserve bilingual Indonesian/English content and localize visible UI labels.

## 10. Review checklist

Review representative pages for:
- clear hierarchy, restrained palette, and consistent spacing;
- appropriate wide vs reading content measures;
- credible, unique, correctly described featured images;
- responsive composition at mobile/tablet/desktop;
- keyboard navigation, visible focus, contrast, and reduced motion;
- absence of generic template patterns and decorative noise.

P16 is not complete until the tokens and component patterns are exercised on representative page types and the resulting implementation passes build and accessibility/contrast checks.
