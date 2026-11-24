import assert from "node:assert/strict";
import test from "node:test";
import { isHeroRequiredRoute } from "../scripts/audit-page-images.mjs";

for (const route of [
  "/services/sertifikasi-iso-9001-2026/",
  "/en/services/iso-14001-2026-certification/",
  "/articles/0001-posisi-kualitas-sebagai-talenta-kompetitif/",
  "/trainings/pelatihan-auditor-internal-iso-9001/",
  "/csms/manajemen-risiko/",
  "/en/csms/manajemen-risiko/",
  "/services/",
]) {
  test(`${route} requires a frontmatter hero`, () => {
    assert.equal(isHeroRequiredRoute(route), true);
  });
}

test("taxonomy routes do not require a frontmatter hero", () => {
  assert.equal(isHeroRequiredRoute("/categories/quality-management/"), false);
});
