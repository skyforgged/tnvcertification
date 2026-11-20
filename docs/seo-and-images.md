# SEO, Schema.org, Metadata, and Images

## Metadata
Each indexable page needs a unique localized title and description, canonical URL, appropriate robots directives, Open Graph metadata, applicable Twitter/X cards, and hreflang alternates for available translations.

Render metadata through shared SEO components/layouts while ensuring values are page-specific and not stale.

## Schema.org
Include valid, relevant JSON-LD based on the page/entity, such as Organization, Service, Course, Event, Article/BlogPosting, or BreadcrumbList where applicable. Structured data must match visible content. Validate and escape it, avoid duplicates, and never misrepresent TNV's accreditation, approval, credentials, or status.

## Technical SEO
- Generate sitemap XML and robots.txt.
- Maintain canonical URLs and reciprocal hreflang links.
- Use semantic HTML, descriptive links, and intentional indexability.
- Avoid broken internal links and duplicate content.

## Images
- Optimize images and serve responsive sizes where useful.
- Prefer WebP for raster photos; AVIF can be used if supported and beneficial.
- Astro image tooling should be used for sizing/optimization where applicable.
- SVG remains appropriate for logos, icons, and vector diagrams.
- Use descriptive filenames and localized alt text; decorative images use empty alt.
- Do not fabricate photos or imply placeholders depict TNV staff, clients, facilities, or events.
- Use abstract or brand-neutral placeholder visuals when actual assets are unavailable.
- Keep optimization workflows reproducible.

## Performance
- Minimize client-side JavaScript; prefer static rendering.
- Lazy-load non-critical images but not critical above-the-fold imagery.
- Reserve image dimensions to limit layout shift.
- Review Lighthouse/Core Web Vitals as part of quality checks.


## Service SEO implementation notes

- The service directory at `/service/` uses the canonical URL, localized document language, and title assembled with the shared site title from `src/site.ts`.
- The service directory emits a `CollectionPage`, an `ItemList` containing only non-draft services rendered on the page, and a `BreadcrumbList`.
- Published service detail pages emit a `WebPage`, `Service`, and `BreadcrumbList` graph. The `Service.provider` references the one canonical Organization entity by `@id`.
- Optional `image`, `serviceType`, and `category` properties are emitted only when the published content supplies them. No `areaServed`, accreditation, certification scope, price, or authorization claim is inferred.
- The base layout combines centrally defined Organization JSON-LD with page-specific entities and serializes the combined graph safely.
- Draft service records are filtered before static paths are generated and before the service directory is assembled. They therefore do not become indexable service pages or ItemList entries.
- The current CSMS record remains draft, so this implementation does not publish a CSMS detail page or claim that the assessment is available.
- The production domain and organization contact values in `src/site.ts` are still placeholders/unconfirmed and must be corrected before deployment; this phase intentionally does not guess replacements.
