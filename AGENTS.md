# AGENTS.md

## Project mission
Build and maintain the PT. Intiprima Sertifikasi website as a polished, content-driven, accessible, SEO-conscious Astro site. Avoid generic AI-generated design patterns and unnecessary complexity.

## Work rules
- Read relevant existing code and documentation before changing it. Follow the established patterns unless there is a concrete reason to improve them.
- Commit directly to `main`; do not create pull requests or feature branches unless explicitly requested.
- Keep changes focused. Do not rewrite unrelated files, introduce speculative abstractions, or add dependencies without a clear need.
- Report what changed, validation performed, and any validation that could not be run. Never claim tests/builds succeeded without actually running them.

## Source of truth and content
- Treat `site.ts` as the single source of truth (SSOT) for company identity, contact details, addresses, shared site settings, and other company-wide information.
- Do not hardcode company/site-wide information in components, pages, layouts, navigation, footer, SEO metadata, CTAs, or contact sections. Read it from the central configuration.
- Content belongs in validated content collections, not duplicated in presentation code.
- Use stable canonical identifiers/relationships; do not infer relationships from labels, categories, or similar-looking slugs.
- Keep Service, Training, Schedule, Article, and Category as distinct content entities. A schedule must reference its training; service association is optional and explicit.

## Mandatory editorial content rules
- Every publishable content entry must have an introductory paragraph directly after its H1. The intro is exactly one paragraph and must explain the page title, beginning with the title followed by `adalah ...` (for example, `Sertifikasi ISO 9001 adalah ...`). Do not use generic or repeated intro copy across unrelated pages.
- `metaDescription` is a required, separate SEO field. It must be unique, persuasive, relevant to the page, and must not duplicate the intro or featured-image alt text.
- Every publishable content entry must have exactly one `featuredImage` object. Its `alt` is required, explains the page title using `adalah`, and is shorter and more concise than the intro. Avoid generic alt text and keyword stuffing.
- Additional `images` are optional and do not replace `featuredImage`.
- Enforce required content rules at build time. Invalid content must fail the build with actionable file/field/rule diagnostics; do not treat mandatory rule violations as warnings.
- Enforce semantic heading hierarchy at build time: heading levels must progress without skipping (H1 → H2 → H3 → H4). For example, H1 may be followed by H2, H2 may be followed by H3 or H2, and H3 may be followed by H4, H3, or a higher-level heading. H1 → H3, H2 → H4, and any other downward level jump are invalid and must fail the build. Heading hierarchy must be validated from the content/rendered document structure, not by string matching.

## Stack and conventions
- Astro 7+ stable (confirm actual compatibility and release status before upgrades).
- TypeScript 7+ stable, strict typing.
- Tailwind CSS latest stable compatible with the chosen Astro/TypeScript versions.
- Use Astro Content Collections with Zod schemas for validation.
- Prefer Astro components and typed props; keep dependencies lean.
- Use semantic HTML, accessible labels, keyboard navigation, appropriate heading hierarchy, and responsive behavior.
- Tailwind is the primary styling tool. Use CSS custom properties for design tokens and scoped CSS for distinctive complex visuals when utilities are not the clearest choice.
- Do not introduce Bootstrap, generic UI kits, or heavy client-side frameworks without an explicit architectural decision.

## Content architecture
- Keep content, data, validation, presentation, composition, and layout responsibilities separate.
- Use separate, type-specific collection schemas. Use discriminated schemas for blocks; avoid permissive catch-all objects.
- Reusable content blocks can be shared across content types when the data model and editorial purpose match.
- Service, Schedule, and Article may all use FAQ, HowTo, and CTA blocks. These blocks are optional and should not be forced into every page.
- Keep layouts specific to page purpose. Shared components must not flatten meaningful differences between service, schedule, article, training, and corporate pages.
- Structured data (JSON-LD) must accurately reflect supported, visible page content. Never fabricate dates, prices, availability, event times, locations, claims, or relationships for SEO.
- Use actual publication/update metadata for sitemap `lastmod`; never use build or deploy timestamps.

## UI and design quality
- Prioritize intentional typography, spacing, composition, visual hierarchy, and brand credibility.
- Avoid template-like hero layouts, excessive cards, gradients/glows, gratuitous icons, repeated rounded boxes, and overlong utility-class chains.
- Design responsively, but preserve the intended composition across breakpoints rather than merely stacking everything.
- Use imagery only where it adds meaning; ensure alt text is useful and not redundant.
- Ensure interactive elements have clear affordances, focus states, and adequate contrast.
- Visual direction: use a cheerful, vibrant, high-saturation palette—not pale, washed-out, or pastel-heavy corporate styling. Prefer strong colors such as electric blue, vivid orange/coral, sunshine yellow, and fresh mint balanced with warm cream and white. Color must be purposeful, with clear roles and accessible contrast; avoid using every accent at once. Create visual rhythm with intentional section/background variation rather than making the whole site white or uniformly dark.
- Preserve a professional, credible, energetic, modern, and human brand feel. Avoid generic SaaS/AI landing-page styling, excessive cards, gradients/glows, and decorative color noise.

## Validation and delivery
- Before committing, inspect the diff and check for accidental unrelated changes.
- Run available checks (typecheck, lint, build, tests) that are relevant and present in the repository; do not invent scripts.
- Summarize the work and provide the commit hash after a successful commit.
- If requirements conflict or the existing architecture is unclear, inspect first and ask only the necessary clarifying question.

## Article discovery and contextual article sections

- Homepage (`/`): render an **Artikel Terbaru** section before the footer, showing the first 3 published/valid articles after sorting by `updatedDate DESC` (global ranks 1–3).
- Service index (`/service/`): render an **Artikel Terbaru** section showing global ranks 4–6 from the same sorted article list. Do not repeat ranks 1–3 shown on the homepage.
- Service detail (`/services/<slug>`): render an **Artikel Terkait** section filtered to articles whose explicit `serviceId` matches the canonical ID of the current service. Sort matching articles by `updatedDate DESC`. Do not infer associations from categories, titles, or slugs.
- Only published, valid articles are eligible for these sections; draft/invalid articles must never appear. When `updatedDate` is missing, use `pubDate` as a documented sort fallback. For deterministic ordering when timestamps match, sort by `pubDate DESC`, then stable article ID/slug ascending.
- Keep these article selection rules in shared data/query logic rather than duplicating sort/filter logic in page components. Homepage and service-index article lists must use the same sorted result so their rank windows remain consistent.
- The number of articles in the service-detail related section is a presentation/configuration choice; do not assume an arbitrary limit unless explicitly set.
