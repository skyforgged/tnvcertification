import assert from "node:assert/strict";
import test from "node:test";
import { auditInformationArchitecture, normalizeRoutePath } from "../src/lib/information-architecture.mjs";
test("normalizes paths and rejects malformed percent encoding", () => {
  assert.equal(normalizeRoutePath("/services"), "/services/");
  assert.equal(normalizeRoutePath("/services//"), "/services/");
  assert.equal(normalizeRoutePath("/"), "/");
  assert.equal(normalizeRoutePath("https://example.com/articles/one"), "/articles/one/");
  assert.equal(normalizeRoutePath("/bad/%E0%A4%A"), null);
});
test("accepts a consistent route, sitemap, navigation, breadcrumb and redirect graph", () => {
  const pages = [{ path: "/", indexable: true, links: ["/services/"] }, { path: "/services/", indexable: true, links: ["/services/iso/"] }, { path: "/services/iso/", indexable: true, links: ["/services/"] }, { path: "/old-services/", indexable: false, redirect: true }];
  assert.deepEqual(auditInformationArchitecture({ pages, sitemapPaths: ["/", "/services/", "/services/iso/"], navigationPaths: ["/", "/services/"], breadcrumbPaths: ["/", "/services/"], redirects: { "/old-services/": "/services/" }, coreRoutes: ["/", "/services/"], routeFamilies: [{ prefix: "/services/" }] }), []);
});
test("detects sitemap, navigation and breadcrumb inconsistencies", () => {
  const issues = auditInformationArchitecture({ pages: [{ path: "/", indexable: true }], sitemapPaths: ["/ghost/"], navigationPaths: ["/missing/"], breadcrumbPaths: ["/missing/"], coreRoutes: ["/"] });
  for (const rule of ["IA-003", "IA-004", "IA-005", "IA-006"]) assert.ok(issues.some((issue) => issue.rule === rule), `missing ${rule}`);
});
test("requires redirects to exist, target an indexable page, and stay out of sitemap", () => {
  const issues = auditInformationArchitecture({ pages: [{ path: "/", indexable: true }, { path: "/old/", indexable: false, redirect: true }], sitemapPaths: ["/", "/old/"], redirects: { "/old/": "/missing/" }, coreRoutes: ["/"] });
  for (const rule of ["IA-008", "IA-009"]) assert.ok(issues.some((issue) => issue.rule === rule), `missing ${rule}`);
});
test("reports orphan pages as warnings", () => {
  const issues = auditInformationArchitecture({ pages: [{ path: "/", indexable: true }, { path: "/isolated/", indexable: true }], sitemapPaths: ["/", "/isolated/"], coreRoutes: ["/"] });
  assert.deepEqual(issues, [{ rule: "IA-010", severity: "warning", message: "Indexable page has no incoming internal links: /isolated/" }]);
});
test("requires route-family ownership and canonical path agreement", () => {
  const issues = auditInformationArchitecture({ pages: [{ path: "/", indexable: true }, { path: "/odd/nested/", indexable: true }, { path: "/services/old/", canonical: "/services/new/", indexable: true }], sitemapPaths: ["/", "/odd/nested/", "/services/new/"], coreRoutes: ["/"], routeFamilies: [{ prefix: "/services/" }] });
  assert.ok(issues.some((issue) => issue.rule === "IA-011"));
  assert.ok(issues.some((issue) => issue.rule === "IA-002"));
});
