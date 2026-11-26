import assert from "node:assert/strict";
import test from "node:test";
import { auditInformationArchitecture, normalizeRoutePath } from "../src/lib/information-architecture.mjs";

test("normalizes canonical route paths", () => {
  assert.equal(normalizeRoutePath("/services"), "/services/");
  assert.equal(normalizeRoutePath("/services//"), "/services/");
  assert.equal(normalizeRoutePath("/"), "/");
  assert.equal(normalizeRoutePath("https://example.com/articles/one"), "/articles/one/");
  assert.equal(normalizeRoutePath("/bad/%E0%A4%A"), null);
});

test("accepts a consistent route, sitemap, navigation, breadcrumb and redirect graph", () => {
  const pages = [
    { path: "/", indexable: true, links: ["/services/"] },
    { path: "/services/", indexable: true, links: ["/services/iso/"] },
    { path: "/services/iso/", indexable: true, links: ["/services/"] },
    { path: "/old-services/", indexable: false, redirect: true, links: ["/services/"] },
  ];
  const issues = auditInformationArchitecture({
    pages,
    sitemapPaths: ["/", "/services/", "/services/iso/"],
    navigationPaths: ["/", "/services/"],
    breadcrumbPaths: ["/", "/services/"],
    redirects: { "/old-services/": "/services/" },
    coreRoutes: ["/", "/services/"],
  });
  assert.deepEqual(issues, []);
});

test("detects missing sitemap pages and invalid navigation and breadcrumb targets", () => {
  const issues = auditInformationArchitecture({
    pages: [{ path: "/", indexable: true, links: [] }],
    sitemapPaths: ["/ghost/"],
    navigationPaths: ["/missing/"],
    breadcrumbPaths: ["/missing/"],
    coreRoutes: ["/"],
  });
  assert.ok(issues.some((issue) => issue.rule === "IA-002" && issue.message.includes("/")));
  assert.ok(issues.some((issue) => issue.rule === "IA-003"));
  assert.ok(issues.some((issue) => issue.rule === "IA-004"));
  assert.ok(issues.some((issue) => issue.rule === "IA-005"));
});

test("requires redirect stubs to stay out of the sitemap and resolve to indexable targets", () => {
  const issues = auditInformationArchitecture({
    pages: [
      { path: "/", indexable: true, links: [] },
      { path: "/old/", indexable: false, redirect: true, links: [] },
    ],
    sitemapPaths: ["/", "/old/"],
    redirects: { "/old/": "/missing/" },
    coreRoutes: ["/"],
  });
  assert.ok(issues.some((issue) => issue.rule === "IA-007"));
  assert.ok(issues.some((issue) => issue.rule === "IA-008"));
});

test("reports orphan indexable pages as warnings rather than failing by default", () => {
  const issues = auditInformationArchitecture({
    pages: [{ path: "/", indexable: true, links: [] }, { path: "/isolated/", indexable: true, links: [] }],
    sitemapPaths: ["/", "/isolated/"],
    coreRoutes: ["/"],
  });
  assert.deepEqual(issues, [{
    rule: "IA-009",
    severity: "warning",
    message: "Indexable page has no incoming internal links: /isolated/",
  }]);
});
