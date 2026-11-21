# P15 — Visual Design Audit Findings

**Audit date:** 2026-11-21  
**Repository:** `tnvcertification/tnvcertification`  
**Branch reviewed:** `main`  
**Scope:** Existing design documentation, layouts, page routes, components, block rendering, global styles, image validation, and content schemas.

## 1. Executive summary

The repository already contains several useful foundations: a shared SEO/site shell, a reusable main-menu hero, purpose-specific article/service/schedule layouts, shared design tokens, content schemas, and an automated page-image uniqueness audit.

However, the current implementation is not yet consistent with the approved premium, mature, wide corporate direction. The main issue is not a lack of components alone; it is that page routes bypass or underuse the existing layout architecture, the shared shell constrains page width and uses a cream surface, the current hero is visually over-decorated, and the block renderer changes authored order.

**Important correction:** `ScheduleLayout.astro` already exists. It must be refined and wired into the correct schedule route(s), not recreated.

## 2. Existing documentation review

| Document | Audit result | Action |
|---|---|---|
| `docs/design-system.md` | Already describes restrained editorial corporate design, whitespace, typography, and avoidance of generic SaaS patterns. | Retain as a foundation; refine tokens and concrete visual rules during P16. |
| `docs/architecture.md` | Previously contained a more saturated multi-color section rhythm that conflicted with the latest user direction. | Visual identity section has been aligned with the approved direction. |
| `docs/components-blocks-layouts.md` | Correctly separates layouts, blocks, and components, but previously lacked the complete approved layout inventory. | Updated with five layouts and visual direction. |
| `docs/visual-redesign-roadmap.md` | Provides phase and task tracking. | Update checkboxes only for audit tasks completed and verified. |
| `docs/homepage-discovery-layout.md` | Describes current homepage hero/discovery structure and QA expectations. | Keep; revisit homepage composition during P19. |

## 3. Current layout inventory and route mapping

| Page/route | Current implementation | Audit finding | Target |
|---|---|---|---|
| `/` | `Layout.astro` + `HomeHero.astro` | Has hero; uses shared shell's constrained container. | `WidePageLayout` |
| `/services/` | `Layout.astro` + `MainMenuHero` | Has hero and listing; bypasses service-specific/index composition layout. | `WidePageLayout` |
| `/services/[slug]/` | `ServiceLayout.astro` | Purpose-specific layout is already wired. | Refine `ServiceLayout` |
| `/csms/` | `Layout.astro` + `MainMenuHero` | Has hero; page-specific sections are manually composed. | `WidePageLayout` |
| `/trainings/` | `Layout.astro` + `MainMenuHero` | Has hero and catalogue; no dedicated wide layout. | `WidePageLayout` |
| `/trainings/[slug]/` | `Layout.astro` + manual content and schedule section | No dedicated training layout; page hierarchy is embedded in route file. | `TrainingLayout` |
| `/schedules/` | `Layout.astro` + `MainMenuHero` + manual schedule list | Has hero, but does not use existing `ScheduleLayout`. | `ScheduleLayout` with archive/list mode |
| Schedule detail | No dedicated schedule detail route found in the inspected `src/pages` route tree. | Current published route model is an archive plus schedule records rendered within training pages. | Decide whether standalone schedule detail URLs are actually required before adding routes. |
| `/articles/` and pagination | `Layout.astro` + `MainMenuHero` | Has hero and archive composition; constrained by base shell. | `WidePageLayout` |
| `/articles/[slug]/` | `ArticleLayout.astro` | Purpose-specific reading layout is wired. | Refine `ArticleLayout` |
| `/[slug]/` general pages | `ArticleLayout.astro` | Corporate/about pages are rendered in a reading-focused article layout. | `WidePageLayout` for corporate/main-menu pages; keep article layout for editorial pages only. |

### Layout files currently present

- Present: `Layout.astro`, `ArticleLayout.astro`, `ScheduleLayout.astro`, `ServiceLayout.astro`.
- Not present: `WidePageLayout.astro`, `TrainingLayout.astro`.
- The `src/blocks/` directory is not present. Current block-related code is in `src/components/BlockRenderer.astro` and schemas in `src/content.config.ts`.

## 4. Visual findings

### Critical / high priority

1. **Shared page width is constrained.** `Layout.astro` applies `max-w-6xl` to the entire main region. This prevents the wide main-menu pages from using a more generous, consistent page width.
2. **Global page surface is cream.** The body uses `bg-cream` and global CSS sets `--color-cream` as the page background. The approved direction is white-dominant with very light neutral gray used selectively.
3. **Main hero treatment is over-decorated.** `MainMenuHero.astro` uses a full deep-blue rounded panel, blur/glow decoration, and a large orange decorative shape. This is repeated across several main-menu pages and does not yet deliver the intended mature, restrained editorial composition.
4. **Existing ScheduleLayout is not used by the schedule archive.** `src/pages/schedules/index.astro` imports the base `Layout` directly and duplicates the schedule presentation. The existing `ScheduleLayout` is a narrow `max-w-3xl` article-like detail layout with a thick mint border and no hero image/breadcrumb treatment.
5. **Training detail lacks a purpose-specific layout.** `src/pages/trainings/[slug].astro` directly composes the base shell, image, markdown, blocks, and schedule cards.
6. **General corporate pages use ArticleLayout.** The catch-all `src/pages/[slug].astro` currently wraps all general pages in the article reading layout, even though the About/corporate page should be wide.
7. **Block order is not preserved.** `BlockRenderer.astro` filters blocks into FAQ, HowTo, and CTA groups, then renders those groups separately. This can change the authored order of blocks.
8. **Article cards do not display their featured images.** `ArticleCard.astro` renders a decorative placeholder-like `div[role=img]` using the alt text, rather than rendering the canonical `featuredImage.src`. This discards the image editorially selected for the article.

### Medium priority

9. **Limited component architecture.** Current component inventory is concentrated in root-level files; there is no dedicated UI/cards/sections component structure yet.
10. **Navigation is visually pill-heavy.** Header links use rounded pill shapes and a cream header surface; revisit with a more restrained corporate navigation system.
11. **Card patterns are inconsistent.** Some sections use rounded white cards, some top-color borders, and some plain lists. The distinction should be intentional and token-based.
12. **Schedule layout copy is Indonesian-only.** Visible labels in `ScheduleLayout` are hardcoded; bilingual UI requirements must be respected if the layout supports English routes.
13. **Hero contract is not yet data-driven for all page types.** Main-menu hero data is passed as route props, while content entries have their own featured-image metadata. Align data ownership during layout migration without duplicating metadata.

## 5. Positive foundations to preserve

- `src/site.ts` is the canonical source for organization identity, shared settings, and navigation. Keep this SSOT.
- `Layout.astro` already centralizes SEO metadata, JSON-LD, site header, and footer.
- `MainMenuHero.astro` provides one reusable hero contract and includes H1, intro paragraph, and featured image.
- Current main-menu route files use distinct image assets: home assurance, services assessment, CSMS safety, training competency, schedules calendar, and editorial articles.
- `src/lib/page-image-validation.mjs` and `scripts/audit-page-images.mjs` already enforce one primary page image, local asset availability, unique image source URLs, and unique image bytes; they also validate main-menu hero structure in generated HTML.
- `docs/design-system.md` already aligns with restrained editorial corporate design.
- Existing article and service layouts demonstrate the intended separation of reading and service content.
- The content model already separates training programme records from training schedule records.

## 6. Image audit status

The current route source references different hero image URLs for the inspected main-menu pages. The repository also has a build-time audit script that checks:
- one `data-page-image` per generated canonical page URL;
- a main-menu hero containing H1, paragraph, and featured image;
- root-relative local image paths and actual built asset existence;
- duplicate image URLs and duplicate image bytes across page URLs.

**Not yet verified:** the audit script has not been run against a fresh production build during this P15 review. Therefore, image uniqueness and generated-page compliance remain unconfirmed until `pnpm build` and `pnpm audit:page-images` run in the project environment.

Also, the article card component currently does not render its article featured image, even though the content model has the image metadata. This is a separate component defect, not proof of duplicate hero image URLs.

## 7. Recommended implementation order

1. **P16 — Shared design system:** establish white-dominant page surface, wide/reading container tokens, typography, spacing, borders, buttons, and image treatment.
2. **P17 — Layout architecture:** introduce `WidePageLayout` and `TrainingLayout`; refine `ScheduleLayout`; preserve and refine existing `ServiceLayout` and `ArticleLayout`.
3. **P18 — Components and blocks:** reorganize reusable UI components and implement an order-preserving block registry/renderer; fix article image rendering.
4. **P19 — Page migration:** migrate homepage, corporate pages, service/training/schedule indexes, and detail routes to their correct layouts.
5. **P20 — QA:** run build, checks, page-image audit, route/link checks, and visual review at desktop/tablet/mobile sizes.

Do not create a standalone schedule detail route unless the content/URL requirements are confirmed. The current architecture treats schedule records as occurrences associated with training pages and displayed in the schedule archive.

## 8. Audit completion status

- [x] Reviewed existing design-system and architecture documentation.
- [x] Inventoried existing layout files and route-to-layout assignments for the inspected routes.
- [x] Audited shared shell, main-menu hero, representative cards, block renderer, and global styles.
- [x] Identified the existing image uniqueness audit and its validation criteria.
- [x] Recorded layout gaps, visual defects, and migration risks.
- [ ] Run production build and page-image audit to confirm generated output.
- [ ] Complete screenshot-based visual review at desktop, tablet, and mobile sizes.
- [ ] Finalize and approve detailed P16 token values and component specifications.

**P15 status:** Audit findings documented; final generated-output and screenshot checks remain pending.
