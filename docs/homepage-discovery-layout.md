# Homepage discovery layout

## Scope

The homepage now uses a dedicated responsive hero and two simple discovery paths. It is a presentation layer, not an expanded service-claims surface.

## Components

- `src/components/HomeHero.astro`: reusable hero with responsive typography, decorative brand accents, and links to the article archive and service index.
- `src/pages/index.astro`: composes the hero, service/article discovery panels, and the latest three published articles from the existing shared article query.

## Copy and publication safeguards

- Hero title and description are passed from `siteSettings` / the page; the canonical company identity continues to come from `src/site.ts`.
- No certification scheme, accreditation, authorization, assessment criteria, geographic coverage, pricing, or active service claims are added.
- The service index remains the destination for service information. Draft CSMS remains excluded from public service routes.
- Navigation and CTA destinations are existing internal routes.

## QA checklist

Run on the pinned toolchain before merging:

```bash
pnpm check
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

After build, visually review homepage at mobile/tablet/desktop widths, keyboard focus styles, CTA destination paths, and the rendered article cards.
