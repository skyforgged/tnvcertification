import assert from "node:assert/strict";
import test from "node:test";
import { siteCrumb } from "../src/data/breadcrumbs.ts";

test("siteCrumb resolves labels from primaryNavigation", () => {
  assert.deepEqual(siteCrumb("/services/"), { label: "Layanan", href: "/services/" });
  assert.deepEqual(siteCrumb("/"), { label: "Beranda", href: "/" });
});

test("siteCrumb rejects hrefs that are not in primaryNavigation", () => {
  assert.throws(() => siteCrumb("/not-a-site-route/"), /primaryNavigation/);
});

test("siteCrumb localizes English labels and uses the English service index", () => {
  assert.deepEqual(siteCrumb("/services/", "en"), { label: "Services", href: "/en/services/" });
  assert.deepEqual(siteCrumb("/articles/", "en"), { label: "Articles", href: "/en/articles/" });
});

test("English breadcrumbs use real English routes", () => {
  assert.deepEqual(siteCrumb("/", "en"), { label: "Home", href: "/en/" });
  assert.deepEqual(siteCrumb("/csms/", "en"), { label: "CSMS", href: "/en/csms/" });
  assert.deepEqual(siteCrumb("/trainings/", "en"), { label: "Trainings", href: "/en/trainings/" });
  assert.deepEqual(siteCrumb("/about-us/", "en"), { label: "About", href: "/en/about-us/" });
});
