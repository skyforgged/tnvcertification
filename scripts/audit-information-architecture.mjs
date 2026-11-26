#!/usr/bin/env node
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { informationArchitecture } from "../src/data/information-architecture.ts";
import { footerNavigation, primaryNavigation } from "../src/site.ts";
import { auditInformationArchitecture, normalizeRoutePath } from "../src/lib/information-architecture.mjs";
const root = path.resolve(process.argv[2] ?? "dist"), origin = "https://ia.invalid";
const htmlFiles = [], errors = [];
async function walk(dir) {
  let entries;
  try { entries = await readdir(dir, { withFileTypes: true }); } catch (error) { errors.push(`Cannot read build directory ${dir}: ${error.message}`); return; }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(full);
    else if (entry.isFile() && entry.name.endsWith(".html")) htmlFiles.push(full);
  }
}
async function exists(file) { try { return (await stat(file)).isFile(); } catch { return false; } }
function routeFromFile(file) {
  const rel = path.relative(root, file).split(path.sep).join("/");
  return rel === "index.html" ? "/" : rel.endsWith("/index.html") ? `/${rel.slice(0, -"index.html".length)}` : `/${rel}`;
}
function linksFrom(html) {
  const links = [];
  for (const match of html.matchAll(/<a\b[^>]*\bhref=["']([^"'#]+)["'][^>]*>/gi)) {
    try { const url = new URL(match[1], origin); if (url.origin === origin) links.push(normalizeRoutePath(url.pathname)); }
    catch { /* malformed anchors are handled by the SEO audit */ }
  }
  return links.filter(Boolean);
}
function navLinksFrom(html, breadcrumbs = false) {
  const links = [];
  for (const nav of html.match(/<nav\b[^>]*>[\s\S]*?<\/nav>/gi) ?? []) {
    const isBreadcrumb = /aria-label=["'](?:Breadcrumb|Navigasi lokasi)["']/i.test(nav);
    if (isBreadcrumb === breadcrumbs) links.push(...linksFrom(nav));
  }
  return links;
}
await walk(root);
const pages = [];
for (const file of htmlFiles) {
  const html = await readFile(file, "utf8"), route = routeFromFile(file);
  const redirectMatch = html.match(/<meta\b(?=[^>]*\bhttp-equiv=["']refresh["'])[^>]*\bcontent=["'][^"']*url=([^"' ;]+)[^"']*["'][^>]*>/i);
  const canonicalMatch = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["'][^>]*>/i);
  const robotsMatch = html.match(/<meta\s+name=["']robots["']\s+content=["']([^"']+)["']/i);
  let canonical = route;
  if (canonicalMatch) { try { canonical = normalizeRoutePath(new URL(canonicalMatch[1], origin).pathname); } catch { canonical = null; } }
  const redirect = Boolean(redirectMatch), noindex = /noindex/i.test(robotsMatch?.[1] ?? "");
  pages.push({ path: route, canonical, redirect, indexable: !redirect && !noindex && Boolean(canonical), links: linksFrom(html), navigationLinks: navLinksFrom(html), breadcrumbLinks: navLinksFrom(html, true) });
}
const sitemapPaths = [];
for (const name of (await readdir(root)).filter((item) => /^sitemap.*\.xml$/i.test(item))) {
  const xml = await readFile(path.join(root, name), "utf8");
  for (const match of xml.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/gi)) {
    try {
      const url = new URL(match[1].trim());
      if (url.pathname.endsWith(".xml")) {
        const nested = path.join(root, url.pathname.replace(/^\/+/, ""));
        if (await exists(nested)) for (const item of (await readFile(nested, "utf8")).matchAll(/<loc>\s*([^<]+)\s*<\/loc>/gi)) {
          try { sitemapPaths.push(new URL(item[1].trim()).pathname); } catch { errors.push(`Malformed nested sitemap URL: ${item[1]}`); }
        }
      } else sitemapPaths.push(url.pathname);
    } catch { errors.push(`Malformed sitemap URL: ${match[1].trim()}`); }
  }
}
const configuredNavigation = [...primaryNavigation.map((item) => item.href), ...footerNavigation.flatMap((group) => group.links.map((item) => item.href))];
const renderedNavigation = new Set(pages.flatMap((page) => page.navigationLinks));
for (const href of configuredNavigation) if (!renderedNavigation.has(normalizeRoutePath(href))) errors.push(`IA-012: Configured navigation link is not rendered: ${href}`);
const issues = auditInformationArchitecture({
  pages, sitemapPaths, navigationPaths: configuredNavigation,
  breadcrumbPaths: [...new Set(pages.flatMap((page) => page.breadcrumbLinks))],
  redirects: informationArchitecture.redirects, coreRoutes: informationArchitecture.coreRoutes,
  routeFamilies: informationArchitecture.routeFamilies,
});
for (const issue of issues) {
  const message = `[${issue.rule}] ${issue.message}`;
  if (issue.severity === "error") errors.push(message); else console.warn(`WARN ${message}`);
}
console.log(`Information architecture audit: ${pages.length} HTML routes, ${pages.filter((page) => page.indexable).length} indexable pages, ${new Set(sitemapPaths.map(normalizeRoutePath)).size} sitemap URLs.`);
if (errors.length) { console.error(`Found ${errors.length} IA issue(s):\n- ${errors.join("\n- ")}`); process.exitCode = 1; }
else console.log("No blocking information-architecture issues found.");
