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
