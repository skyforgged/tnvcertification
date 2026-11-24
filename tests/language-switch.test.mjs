import assert from "node:assert/strict";
import test from "node:test";
import { resolveLanguageOptions } from "../src/lib/locale-switch.ts";

const services = [
  { lang: "id", slug: "sertifikasi-iso-14001-2026", translationKey: "service-sertifikasi-iso-14001-2026" },
  { lang: "en", slug: "iso-14001-2026-certification", translationKey: "service-sertifikasi-iso-14001-2026" },
  { lang: "id", slug: "sertifikasi-iso-9001-2026", translationKey: "service-sertifikasi-iso-9001-2026" },
];
const articles = [
  { lang: "id", slug: "panduan-dokumen-iso-9001", translationKey: "article-document-control-iso-9001" },
  { lang: "en", slug: "iso-9001-document-control", translationKey: "article-document-control-iso-9001" },
];
const pages = [
  { lang: "id", slug: "home", translationKey: "page-hal-home" },
  { lang: "en", slug: "home", translationKey: "page-hal-home" },
  { lang: "id", slug: "csms", translationKey: "page-hal-csms" },
  { lang: "en", slug: "csms", translationKey: "page-hal-csms" },
  { lang: "id", slug: "about-us", translationKey: "page-hal-about-us" },
  { lang: "en", slug: "about-us", translationKey: "page-hal-about-us" },
];
const fallbackPaths = [
  "/services/sertifikasi-iso-9001-2026/",
];

const options = (pathname, currentLang = "id", overrides = {}) =>
  resolveLanguageOptions({
    pathname,
    currentLang,
    services,
    articles,
    pages,
    fallbackPaths,
    ...overrides,
  });

const shape = (list) =>
  list.map(({ lang, href, active, available }) => ({ lang, href, active, available }));

test("service detail links Indonesian to English by translationKey", () => {
  assert.deepEqual(shape(options("/services/sertifikasi-iso-14001-2026/", "id")), [
    { lang: "id", href: "/services/sertifikasi-iso-14001-2026/", active: true, available: true },
    { lang: "en", href: "/en/services/iso-14001-2026-certification/", active: false, available: true },
  ]);
});

test("service detail links English to Indonesian by translationKey", () => {
  assert.deepEqual(shape(options("/en/services/iso-14001-2026-certification/", "en")), [
    { lang: "id", href: "/services/sertifikasi-iso-14001-2026/", active: false, available: true },
    { lang: "en", href: "/en/services/iso-14001-2026-certification/", active: true, available: true },
  ]);
});

test("article detail links Indonesian to English by translationKey", () => {
  const result = options("/articles/panduan-dokumen-iso-9001/");
  assert.equal(result[1].href, "/en/articles/iso-9001-document-control/");
  assert.equal(result[1].available, true);
});

test("article detail links English to Indonesian by translationKey", () => {
  const pathname = "/en/articles/iso-9001-document-control/";
  const result = options(pathname, "en");
  assert.equal(result[0].href, "/articles/panduan-dokumen-iso-9001/");
  assert.equal(result[0].available, true);
  assert.equal(result[1].active, true);
  assert.equal(result[1].href, pathname);
});

test("service index links both ways", () => {
  assert.equal(options("/services/")[1].href, "/en/services/");
  const english = options("/en/services/", "en");
  assert.equal(english[0].href, "/services/");
  assert.equal(english[1].active, true);
});

test("language switch resolves localized main-menu pages", () => {
  assert.deepEqual(shape(options("/", "id", { pages }).filter((option) => option.lang === "en")), [
    { lang: "en", href: "/en/", active: false, available: true },
  ]);
  assert.deepEqual(shape(options("/en/", "en", { pages }).filter((option) => option.lang === "id")), [
    { lang: "id", href: "/", active: false, available: true },
  ]);
  assert.deepEqual(shape(options("/csms/", "id", { pages }).filter((option) => option.lang === "en")), [
    { lang: "en", href: "/en/csms/", active: false, available: true },
  ]);
  assert.deepEqual(shape(options("/en/about-us/", "en", { pages }).filter((option) => option.lang === "id")), [
    { lang: "id", href: "/about-us/", active: false, available: true },
  ]);
});

test("main-menu indexes link both ways", () => {
  for (const pathname of ["/trainings/", "/schedules/", "/articles/"]) {
    const inactive = options(pathname).find((option) => !option.active);
    assert.equal(inactive.href, `/en${pathname}`, pathname);
    assert.equal(inactive.available, true, pathname);
  }
  for (const pathname of ["/en/trainings/", "/en/schedules/", "/en/articles/"]) {
    const inactive = options(pathname, "en").find((option) => !option.active);
    assert.equal(inactive.href, pathname.slice(3), pathname);
    assert.equal(inactive.available, true, pathname);
  }
});

test("fallback stubs and missing translations never produce an English link", () => {
  for (const option of options("/services/sertifikasi-iso-9001-2026/")) {
    assert.ok(!option.href.startsWith("/en/"));
  }
  const missingPartner = options("/services/sertifikasi-iso-9001-2026/")[1];
  assert.equal(missingPartner.available, false);
  assert.equal(missingPartner.href, "");
});

test("an Indonesian article counterpart is not mistaken for an English stub", () => {
  const result = options("/en/articles/iso-9001-document-control/", "en", {
    fallbackPaths: [...fallbackPaths, "/articles/panduan-dokumen-iso-9001/"],
  });
  assert.equal(result[0].href, "/articles/panduan-dokumen-iso-9001/");
  assert.equal(result[0].available, true);
});

test("labels follow siteSettings and the active option links to the current path", () => {
  const result = options("/services/", "id");
  assert.deepEqual(result.map((option) => option.label), ["Bahasa Indonesia", "English"]);
  assert.equal(result.find((option) => option.active).href, "/services/");
});

test("pathnames are normalized to a trailing slash before matching", () => {
  assert.deepEqual(shape(options("/services")), shape(options("/services/")));
});
