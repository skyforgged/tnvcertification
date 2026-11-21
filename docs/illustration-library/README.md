# Illustration Library

## Purpose

Maintain a controlled, reusable illustration library for the TNCVCertification website. The library should improve visual communication without introducing inconsistent styles, unverified licensing, or unnecessary page weight.

## Asset pipeline

1. Select an illustration that supports the content and page intent.
2. Download and preserve the original SVG master in `assets/illustrations/source/`.
3. Verify commercial-use permissions and record the exact source and license in [asset-register.md](./asset-register.md).
4. Convert the SVG master to WebP using `pnpm images:illustrations`.
5. Use the generated file from `/images/illustrations/<filename>.webp` in website pages.
6. Review visual quality, transparency/background, responsive rendering, alt text, and file size before publishing.

**SVG is the source of truth; WebP is the delivery format.** Do not delete the master SVG after conversion.

## Providers and license controls

Preferred sources to evaluate:
- [unDraw](https://undraw.co/illustrations) — verify its current license and restrictions for each acquisition.
- [Open Peeps](https://www.openpeeps.com/) — verify the applicable CC0 terms and source package.
- [Storyset](https://storyset.com/) — free-use attribution requirements may apply; record the selected license and attribution.
- [Lucide](https://lucide.dev/) and [Tabler Icons](https://tabler.io/icons) — use for interface/iconography rather than substituting icons for meaningful editorial illustrations.

Never assume that all assets on an aggregator share one license. A source URL or provider name alone is not sufficient evidence of permission.

## Conversion defaults

The conversion script uses Sharp with:
- SVG rasterization density: 144 DPI;
- maximum output width: 1600 px (no enlargement);
- WebP quality: 82;
- effort: 6;
- transparent background preserved.

These are starting defaults, not a substitute for visual review. If text, fine strokes, or small details become unclear, adjust the source or conversion settings and document the reason. Avoid rasterizing simple UI icons that should remain vector-based.

## Naming and placement

- Master: `assets/illustrations/source/<topic>.svg`
- Output: `public/images/illustrations/<topic>.webp`
- Use lowercase kebab-case and descriptive names.
- Keep source and output basenames identical.
- Keep illustrations grouped by subject in the register, not by page-specific duplicate copies.

## Page usage

Use an illustration only when it adds meaning. Prefer a small number of reusable assets across related pages, while avoiding repetitive hero imagery. The asset register records intended page placement and descriptive alt text. Alt text must describe the actual image in its context; decorative images should use empty alt text.

## Validation checklist

- [ ] Source SVG is self-contained and renders correctly.
- [ ] Commercial-use license and attribution requirements are recorded.
- [ ] SVG master is preserved in the source directory.
- [ ] WebP output exists and opens correctly.
- [ ] Output is visually legible at intended display sizes.
- [ ] File size is reasonable for its rendered dimensions.
- [ ] Page references the WebP output, not the source SVG.
- [ ] Context-appropriate alt text is supplied.
- [ ] Build and relevant checks pass.

No provider assets are added by this foundation change. Individual illustrations will be added only after selection and license verification.
