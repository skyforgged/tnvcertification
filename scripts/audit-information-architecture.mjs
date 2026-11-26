#!/usr/bin/env node
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { informationArchitecture } from "../src/data/information-architecture.ts";
import { footerNavigation, primaryNavigation } from "../src/site.ts";
import { auditInformationArchitecture, normalizeRoutePath } from "../src/lib/information-architecture.mjs";

const root = path.resolve(process.argv[2] ?? "dist");
const origin = "https://ia.invalid";
const htmlFiles = [];
const errors = [];
async function walk(dir) {
  let entries;
  try { entries = await readdir(dir, { withFileTypes: true }); }
  catch (error) { errors.push(`Cannot read build directory ${dir}: ${error.message}`); return; }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(full);
    else if (entry.isFile() && entry.name.endsWith(".html")) htmlFiles.push(full);
  }
}
async function exists(file) { try { return (await stat(file)).isFile(); } catch { return false; } }
function routeFromFile(file) {
  const relative = path.relative(root, file).split(path.sep).join("/");
  return relative === "index.html" ? "/" : relative.endsWith("/index.html")
    ? `/${relative.slice(0, -"index.html".length)}`
    : `/${relative}`;
}
function extractLinks(html, pattern = /<a\b[^>]*\bhref=["']([^"'#]+)["'][^>]*>/gi) {
  const links = [];
  for (const match of html.matchAll(pattern)) {
    try {
      const url = new URL(match[1], origin);
      if (url.origin === origin) links.push(normalizeRoutePath(url.pathname));
    } catch { /* malformed anchors are handled by the SEO audit */ }
  }
  return links.filter(Boolean);
}
function extractNavigationLinks(html) {
  const links = [];
  const navs = html.match(/<nav\b[^>]*>[\s\S]*?<\/nav>/gi) ?? [];
  for (const nav of navs) {
    if (/aria-label=["'](?:Main navigation|Navigasi utama)["']/i.test(nav)) {
      links.push(...extractLinks(nav));
    }
  }
  return links;
}
function extractBreadcrumbLinks(html) {
  const links = [];
  const navs = html.match(/<nav\b[^>]*>[\s\S]*?<\/nav>/gi) ?? [];
  for (const nav of navs) {
    if (/aria-label=["'](?:Breadcrumb|Navigasi lokasi)["']/i.test(nav)) {
      links.push(...extractLinks(nav));
    }
  }
  return links;
}
await walk(root);
const pages = [];
for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  const route = routeFromFile(file);
  const redirectMatch = html.match(/<meta\b(?=[^>]*\bhttp-equiv=["']refresh["'])[^>]*\bcontent=["'][^"']*url=([^"' ;]+)[^"']*["'][^>]*>/i);
  const canonicalMatch = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["'][^>]*>/i);
  const robotsMatch = html.match(/<meta\s+name=["']robots["']\s+content=["']([^"']+)["']/i);
  const redirect = Boolean(redirectMatch);
  const noindex = /noindex/i.test(robotsMatch?.[1] ?? "");
  let canonical = route;
  if (canonicalMatch) {
    try { canonical = normalizeRoutePath(new URL(canonicalMatch[1], origin).pathname); }
    catch { canonical = null; }
  }
  pages.push({
    path: route,
    canonical,
    redirect,
    indexable: !redirect && !noindex && Boolean(canonical),
    links: extractLinks(html),
    navigationLinks: extractNavigationLinks(html),
    breadcrumbLinks: extractBreadcrumbLinks(html),
    redirectTarget: redirectMatch?.[1] ?? null,
  });
}

const sitemapPaths = [];
const sitemapFiles = (await readdir(root)).filter((name) => /^sitemap.*\.xml$/i.test(name));
for (const name of sitemapFiles) {
  const xml = await readFile(path.join(root, name), "utf8");
  for (const match of xml.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/gi)) {
    try {
      const url = new URL(match[1].trim());
      if (url.pathname.endsWith(".xml")) {
        const nested = path.join(root, url.pathname.replace(/^\/+/, ""));
        if (await exists(nested)) {
          const nestedXml = await readFile(nested, "utf8");
          for (const item of nestedXml.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/gi)) {
            try { sitemapPaths.push(new URL(item[1].trim()).pathname); } catch { /* ignored */ }
          }
        }
      } else sitemapPaths.push(url.pathname);
    } catch { errors.push(`Malformed sitemap URL: ${match[1].trim()}`); }
  }
}
const configuredNavigation = [
  ...primaryNavigation.map((item) => item.href),
  ...footerNavigation.flatMap((group) => group.links.map((item) => item.href)),
];
const renderedNavigation = [...new Set(pages.flatMap((page) => page.navigationLinks))];
const renderedBreadcrumbs = [...new Set(pages.flatMap((page) => page.breadcrumbLinks))];
for (const href of configuredNavigation) {
  if (!renderedNavigation.includes(normalizeRoutePath(href)) && !renderedNavigation.includes(normalizeRoutePath(href) === "/" ? "/" : normalizeRoutePath(href))) {
    errors.push(`IA-010: Configured navigation link is not rendered: ${href}`);
  }
}
const issues = auditInformationArchitecture({
  pages,
  sitemapPaths,
  navigationPaths: configuredNavigation,
  breadcrumbPaths: renderedBreadcrumbs,
  redirects: informationArchitecture.redirects,
  coreRoutes: informationArchitecture.coreRoutes,
});
for (const issue of issues) {
  const line = `[${issue.rule}] ${issue.message}`;
  if (issue.severity === "error") errors.push(line);
  else console.warn(`WARN ${line}`);
}
console.log(`Information architecture audit: ${pages.length} HTML routes, ${pages.filter((page) => page.indexable).length} indexable pages, ${sitemapPaths.length} sitemap URLs.`);
if (errors.length) {
  console.error(`Found ${errors.length} IA issue(s):\n- ${errors.join("\n- ")}`);
  process.exitCode = 1;
} else console.log("No blocking information-architecture issues found.");
