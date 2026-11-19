# SEO, Schema.org, Metadata, and Images

## SEO is required
Every indexable page must have appropriate SEO metadata:
- Unique localized title
- Meta description
- Canonical URL
- Robots directives when needed
- Open Graph metadata (title, description, image, URL)
- Twitter/X card metadata as applicable
- Alternate language links (hreflang) for bilingual pages

Metadata can be defined in page frontmatter/content schemas and rendered through a shared SEO component or layout. Ensure values are page-specific and not duplicated or stale.

## Schema.org structured data
Every page must include valid, relevant Schema.org JSON-LD. Choose schema types based on the actual content and entity represented; do not apply one generic schema to every page.

Examples (select as applicable):
- Organization / EducationalOrganization: only when accurate for the organization
- Service: certification service pages
- Course: training course pages
- Event: scheduled training sessions, when appropriate
- Article / BlogPosting: editorial articles
- BreadcrumbList: pages with breadcrumb navigation

Structured data may be implemented in a layout or component, or composed at page level. Keep JSON-LD data typed/validated where practical, escape safely, avoid duplicate/conflicting schema blocks, and ensure markup matches visible page content. Never claim accreditation, approvals, credentials, or other status that TNV does not actually hold.

## Images
- Published website imagery should use WebP.
- Optimize image dimensions and file size for the display context; provide responsive variants where beneficial.
- SVG may be used as an editable source or placeholder asset. For image assets intended for web delivery, convert SVG sources to WebP as part of the asset workflow.
- Preserve SVG source files when useful for editing, but do not use SVG as a substitute for the requested WebP published image format.
- Use descriptive filenames and meaningful localized alt text. Decorative images should use empty alt text.
- Do not fabricate photos or imply that placeholders depict real TNV auditors, clients, facilities, or events.
- For placeholders, create abstract, illustrative, or brand-neutral SVG artwork and convert it to WebP.
- Ensure image conversion workflow is reproducible and documented (tooling may be selected based on environment).
