# Bilingual Content Standards

## Languages
The website is bilingual:
- Indonesian: `id`
- English: `en`

Both languages must be supported consistently across page content, frontmatter, block definitions, UI components, navigation, metadata, and user-facing messages.

## Markdown and frontmatter
- Content is authored in Markdown with frontmatter.
- For content that exists in both languages, maintain linked language variants and consistent slugs/translation identifiers.
- Do not mix Indonesian and English in one localized page unless the content is a proper name, standard designation, or intentionally language-neutral.
- Keep equivalent content structure and meaning across translations; wording may be idiomatic rather than literal.
- Required fields (title, description, slug, language, translation key where applicable) should be validated by collection schemas.

## UI components
- Every user-facing component must have a clear localization strategy.
- Prefer passing localized labels and copy through props or a translation dictionary.
- Avoid hard-coded single-language text inside reusable components.
- Ensure links switch to the corresponding language page when a translation exists; otherwise use a deliberate fallback, not a broken route.

## Blocks
- Block type identifiers and code-level keys may remain language-neutral.
- Block content, accessible labels, headings, buttons, alt text, and metadata must be localized.
- If blocks have language-specific data, validate both language versions and their parity.

## SEO language handling
- Provide language-specific title and description.
- Use correct document language (`lang`) on each page.
- Add hreflang alternates for available translations, including self-reference and reciprocal links.
- Set canonical URLs correctly per localized page.
