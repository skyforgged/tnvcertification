import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { siteSettings } from "../src/site.ts";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("footer templates use the company name and avoid repeated subject prefixes", () => {
  assert.equal(
    siteSettings.footer.serviceDescription("Sertifikasi Sistem Manajemen Mutu ISO 9001:2026"),
    "PT. Intiprima Sertifikasi menyediakan jasa sertifikasi Sistem Manajemen Mutu ISO 9001:2026.",
  );
  assert.equal(
    siteSettings.footer.trainingDescription("Pelatihan Auditor Internal ISO 45001"),
    "PT. Intiprima Sertifikasi melayani pelatihan Auditor Internal ISO 45001.",
  );
});

test("SiteFooter accepts a description prop and falls back to the localized site description", async () => {
  const source = await read("../src/components/SiteFooter.astro");
  assert.match(source, /description\?: string/);
  assert.match(source, /description \?\? siteSettings\.ui\.footerDescription\[ui\]/);
  assert.match(source, /\{footerDescription\}/);
  assert.equal(siteSettings.ui.footerDescription.id, siteSettings.description);
});

test("Layout forwards footerDescription to SiteFooter", async () => {
  const source = await read("../src/layouts/Layout.astro");
  assert.match(source, /footerDescription/);
  assert.match(source, /<SiteFooter[^>]*description=\{footerDescription\}/);
});

test("detail layouts accept and forward footerDescription", async () => {
  for (const path of ["../src/layouts/ServiceLayout.astro", "../src/layouts/TrainingLayout.astro"]) {
    const source = await read(path);
    assert.match(source, /footerDescription\?: string/, path);
    assert.match(source, /footerDescription=\{footerDescription\}/, path);
  }
});

test("service and training detail pages set footerDescription from the site templates", async () => {
  const service = await read("../src/pages/services/[slug].astro");
  assert.match(service, /siteSettings\.footer\.serviceDescription\(service\.data\.title\)/);
  assert.match(service, /footerDescription=\{footerDescription\}/);

  const training = await read("../src/pages/trainings/[slug].astro");
  assert.match(training, /siteSettings\.footer\.trainingDescription\(training\.data\.title\)/);
  assert.match(training, /footerDescription=\{footerDescription\}/);
});
