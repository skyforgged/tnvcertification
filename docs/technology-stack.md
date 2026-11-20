# TNV Certification Technology Stack

## Version policy
- Astro 7 or newer stable compatible version.
- TypeScript 7.0.2 native compiler via `@typescript/native`; `typescript` module aliases `@typescript/typescript6@6.0.2` for tooling without a TS 7 API. Strict mode enabled.
- Tailwind CSS latest stable compatible release.
- Node.js `22.23.4` (`.nvmrc` and `.node-version`); minimum `>=22.23.4`.
- pnpm `10.15.0` via Corepack (`packageManager` in `package.json`).
- Check release notes and compatibility before major upgrades; do not blindly update.
- Lock exact resolved versions in package manifests and lockfile.

## Core
- Astro for framework, routing, static rendering, and components.
- TypeScript for strict typing.
- Tailwind CSS for utility styling.
- Vite is managed through Astro; configure independently only if required.
- pnpm for package/dependency management.

## Content
- Astro Content Collections and Zod schemas for validated content.
- Markdown as default authoring format.
- MDX only when embedding components in content is justified.
- Indonesian (id) and English (en) localization.

## Design and media
- Tailwind plus CSS custom properties/design tokens.
- Astro scoped CSS for complex custom treatments.
- Astro image tooling for optimization.
- WebP preferred for raster photography; AVIF optionally.
- SVG for logos, icons, and vector diagrams.

## Code quality
- ESLint for linting.
- Prettier for formatting.
- Prettier Tailwind plugin for class ordering.
- Astro Check for Astro and TypeScript diagnostics.
- Playwright for focused end-to-end/browser checks.
- Lighthouse for performance, accessibility, SEO, and best-practice auditing.
- Git/GitHub for version control.
- GitHub Actions for CI checks when configured.

## SEO and security
- Semantic HTML and accessibility.
- Accurate Schema.org JSON-LD.
- Sitemap, robots.txt, canonical, hreflang, Open Graph.
- HTTPS, CSP, and security headers where hosting configuration permits.
- Dependency audits and secure environment-variable handling.

## Hosting
- Cloudflare Pages is the proposed static hosting platform.
- GitHub-connected deploys and preview environments where supported.
- Document deployment configuration and environment variables.
- Hosting choice can be reconsidered if requirements change.

## Not included by default
React, Vue, backend frameworks, databases, Docker, GraphQL, state management, large animation libraries, and generic UI kits are excluded unless a clear need emerges.

## Principle
Use the minimum technology required to deliver maximum quality, performance, accessibility, maintainability, and credibility.
