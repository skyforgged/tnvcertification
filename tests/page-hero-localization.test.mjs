import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const hero = await readFile(new URL("../src/components/page/PageHero.astro", import.meta.url), "utf8");
const header = await readFile(new URL("../src/components/SiteHeader.astro", import.meta.url), "utf8");
const footer = await readFile(new URL("../src/components/SiteFooter.astro", import.meta.url), "utf8");
const site = await readFile(new URL("../src/site.ts", import.meta.url), "utf8");

test("page hero takes lang and reads CTA copy from site settings", () => {
  assert.match(hero, /lang = "id"/);
  assert.match(hero, /siteSettings\.ui\.heroActions/);
  assert.doesNotMatch(hero, /Hubungi Kami via WhatsApp|Jelajahi layanan|Lihat daftar layanan/);
  for (const label of ["Contact us on WhatsApp", "Explore services", "View service list"]) {
    assert.ok(site.includes(label));
  }
});

test("shared chrome localizes site description and home links", () => {
  assert.match(footer, /siteSettings\.ui\.footerDescription\[ui\]/);
  assert.match(footer, /navigationHref\(primaryNavigation\[0\], lang\)/);
  assert.match(header, /navigationHref\(primaryNavigation\[0\], lang\)/);
  assert.ok(site.includes("Certification information and management system standards."));
});
