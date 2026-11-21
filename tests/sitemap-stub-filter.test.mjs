import assert from "node:assert/strict";
import test from "node:test";
import { removeStubUrlsFromSitemap } from "../src/lib/sitemap-stubs.mjs";

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>http://tnvcertification.lan/en/about-us/</loc></url>
  <url><loc>http://tnvcertification.lan/en/services/</loc></url>
  <url><loc>http://tnvcertification.lan/about-us/</loc></url>
</urlset>`;

test("removes only redirect stub URLs from the sitemap", () => {
  const result = removeStubUrlsFromSitemap(sitemap, (pathname) => pathname === "/en/about-us/");
  assert.ok(!result.includes("/en/about-us/"));
  assert.ok(result.includes("/en/services/"));
  assert.ok(result.includes("/about-us/"));
  assert.ok(result.includes("<urlset"));
});

test("leaves the sitemap untouched when no URL is a stub", () => {
  assert.equal(removeStubUrlsFromSitemap(sitemap, () => false), sitemap);
});
