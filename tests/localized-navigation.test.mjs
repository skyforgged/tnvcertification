import assert from "node:assert/strict";
import test from "node:test";
import { navigationLabel, uiLang } from "../src/lib/navigation.ts";
import { footerNavigation, primaryNavigation, siteSettings } from "../src/site.ts";

test("uiLang maps explicit and locale-prefixed values", () => {
  assert.equal(uiLang("id"), "id");
  assert.equal(uiLang("id-ID"), "id");
  assert.equal(uiLang(""), "id");
  assert.equal(uiLang("en"), "en");
  assert.equal(uiLang("en-US"), "en");
});

test("navigationLabel selects the requested language", () => {
  const entry = { label: "Layanan", labelEn: "Services" };
  assert.equal(navigationLabel(entry, "id"), "Layanan");
  assert.equal(navigationLabel(entry, "en"), "Services");
  assert.equal(navigationLabel(entry, "en-GB"), "Services");
});

test("primary navigation keeps canonical hrefs and gains English labels", () => {
  assert.deepEqual(
    primaryNavigation.map((entry) => [entry.href, entry.label, entry.labelEn]),
    [
      ["/", "Beranda", "Home"],
      ["/services/", "Layanan", "Services"],
      ["/csms/", "CSMS", "CSMS"],
      ["/about-us/", "Tentang", "About"],
      ["/trainings/", "Pelatihan", "Trainings"],
      ["/schedules/", "Jadwal", "Schedules"],
      ["/articles/", "Artikel", "Articles"],
    ],
  );
});

test("footer navigation keeps canonical hrefs and gains English labels", () => {
  assert.deepEqual(
    footerNavigation.map((group) => ({
      title: group.title,
      titleEn: group.titleEn,
      links: group.links.map((link) => [link.href, link.label, link.labelEn]),
    })),
    [
      {
        title: "Mulai",
        titleEn: "Get started",
        links: [
          ["/", "Beranda", "Home"],
          ["/services/", "Layanan", "Services"],
          ["/csms/", "CSMS", "CSMS"],
          ["/about-us/", "Tentang", "About"],
          ["/trainings/", "Pelatihan", "Trainings"],
          ["/schedules/", "Jadwal pelatihan", "Training schedules"],
        ],
      },
      {
        title: "Baca",
        titleEn: "Read",
        links: [["/articles/", "Artikel dan panduan", "Articles and guides"]],
      },
    ],
  );
});

test("localized UI chrome has both languages", () => {
  for (const value of Object.values(siteSettings.ui)) {
    assert.ok(value.id, "missing Indonesian UI string");
    assert.ok(value.en, "missing English UI string");
  }
});
