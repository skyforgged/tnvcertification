import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const header = await readFile(
  new URL("../src/components/SiteHeader.astro", import.meta.url),
  "utf8",
);
const footer = await readFile(
  new URL("../src/components/SiteFooter.astro", import.meta.url),
  "utf8",
);
const layout = await readFile(
  new URL("../src/layouts/Layout.astro", import.meta.url),
  "utf8",
);

test("header localizes menu labels and navigation chrome", () => {
  assert.match(header, /import \{ navigationHref, navigationLabel, uiLang \} from "\.\.\/lib\/navigation"/);
  assert.match(header, /const ui = uiLang\(lang\)/);
  assert.match(header, /navigationLabel\(item, lang\)/);
  assert.match(header, /siteSettings\.ui\.mainNavigation\[ui\]/);
  assert.match(header, /siteSettings\.ui\.logoHome\[ui\]/);
  assert.doesNotMatch(header, /aria-label="Navigasi utama"/);
  assert.doesNotMatch(header, /— beranda/);
  assert.doesNotMatch(header, />\s*\{item\.label\}\s*</);
});

test("footer accepts lang and localizes group titles, links, and back-to-top", () => {
  assert.match(footer, /interface Props \{\s*lang: string;\s*description\?: string;\s*\}/);
  assert.match(footer, /const \{ lang, description \} = Astro\.props/);
  assert.match(footer, /siteSettings\.ui\.footerDescription\[ui\]/);
  assert.match(footer, /import \{ navigationHref, navigationLabel, uiLang \} from "\.\.\/lib\/navigation"/);
  assert.match(footer, /navigationLabel\(\{ label: group\.title, labelEn: group\.titleEn \}, lang\)/);
  assert.match(footer, /navigationLabel\(link, lang\)/);
  assert.match(footer, /siteSettings\.ui\.backToTop\[ui\]/);
  assert.doesNotMatch(footer, /Kembali ke atas/);
  assert.doesNotMatch(footer, />\s*\{link\.label\}\s*</);
});

test("header and footer resolve localized hrefs", () => {
  assert.match(header, /navigationHref\(primaryNavigation\[0\], lang\)/);
  assert.match(header, /navigationHref\(item, lang\)/);
  assert.match(footer, /navigationHref\(primaryNavigation\[0\], lang\)/);
  assert.match(footer, /navigationHref\(link, lang\)/);
});

test("layout localizes skip link and passes lang to footer", () => {
  assert.match(layout, /import \{ uiLang \} from "\.\.\/lib\/navigation"/);
  assert.match(layout, /const ui = uiLang\(seo\.lang\)/);
  assert.match(layout, /siteSettings\.ui\.skipToContent\[ui\]/);
  assert.match(layout, /<SiteFooter lang=\{seo\.lang\} description=\{footerDescription\} \/>/);
  assert.doesNotMatch(layout, /Lewati ke konten utama/);
});
