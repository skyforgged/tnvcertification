#!/usr/bin/env node
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
const root = path.resolve(process.argv[2] ?? "dist");
const origin = "https://audit.invalid";
const errors = [];
const htmlFiles = [];
async function walk(dir) {
  let entries;
  try { entries = await readdir(dir, { withFileTypes: true }); }
  catch (error) { errors.push("Cannot read build directory " + dir + ": " + error.message); return; }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(full);
    else if (entry.isFile() && entry.name.endsWith(".html")) htmlFiles.push(full);
  }
}
function routeFile(urlPath) {
  let decoded;
  try { decoded = decodeURIComponent(urlPath); } catch { return null; }
  const normalized = path.posix.normalize(decoded);
  const candidates = normalized.endsWith("/") ? [normalized + "index.html"] : [normalized, normalized + "/index.html"];
  for (const candidate of candidates) {
    const absolute = path.join(root, candidate.replace(/^\/+/, ""));
    if ((absolute.startsWith(root + path.sep) || absolute === path.join(root, "index.html")) && !absolute.includes(path.sep + ".." + path.sep)) return absolute;
  }
  return null;
}
async function exists(file) { try { return (await stat(file)).isFile(); } catch { return false; } }
await walk(root);
const canonicalMap = new Map();
for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  const rel = path.relative(root, file).split(path.sep).join("/");
  const pageUrl = rel === "index.html" ? "/" : rel.endsWith("/index.html") ? "/" + rel.slice(0, -"index.html".length) : "/" + rel;
  // Static-host redirects are lightweight HTML stubs, not indexable content pages.
  // Validate their internal links below, but do not require editorial metadata or canonicals.
  const isRedirect = /<meta\b(?=[^>]*\bhttp-equiv=["']refresh["'])[^>]*>/i.test(html);
  const titleCount = (html.match(/<title(?:\s[^>]*)?>[\s\S]*?<\/title>/gi) ?? []).length;
  const descriptionCount = (html.match(/<meta\s+name=["']description["'][^>]*>/gi) ?? []).length;
  const canonicalMatches = [...html.matchAll(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["'][^>]*>/gi)];
  const h1Count = (html.match(/<h1(?:\s[^>]*)?>[\s\S]*?<\/h1>/gi) ?? []).length;
  if (!isRedirect) {
    if (titleCount !== 1) errors.push(rel + ": expected one title, found " + titleCount);
    if (descriptionCount !== 1) errors.push(rel + ": expected one meta description, found " + descriptionCount);
    if (canonicalMatches.length !== 1) errors.push(rel + ": expected one canonical link, found " + canonicalMatches.length);
    if (h1Count !== 1) errors.push(rel + ": expected exactly one H1, found " + h1Count);
    if (canonicalMatches[0]) {
      const canonical = new URL(canonicalMatches[0][1], origin).toString();
      if (canonicalMap.has(canonical)) errors.push("Duplicate canonical: " + canonical + " (" + canonicalMap.get(canonical) + " and " + rel + ")");
      else canonicalMap.set(canonical, rel);
    }
  }
  for (const match of html.matchAll(/\bhref=["']([^"']+)["']/gi)) {
    const href = match[1].trim();
    if (!href || href.startsWith("#") || /^(mailto:|tel:|javascript:|data:)/i.test(href)) continue;
    let url;
    try { url = new URL(href, new URL(pageUrl, origin)); } catch { errors.push(rel + ": malformed link " + href); continue; }
    if (url.origin !== origin) continue;
    const target = routeFile(url.pathname);
    if (!target || !(await exists(target))) errors.push(rel + ": broken internal link " + href);
  }
}
const sitemapCandidates = ["sitemap-index.xml", "sitemap.xml"];
let sitemapFound = false;
const visited = new Set();
async function inspectSitemap(file) {
  if (visited.has(file)) return;
  visited.add(file);
  if (!(await exists(file))) return;
  sitemapFound = true;
  const xml = await readFile(file, "utf8");
  const locs = [...xml.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/gi)].map((m) => m[1].trim());
  for (const loc of locs) {
    let url;
    try { url = new URL(loc); } catch { errors.push("Invalid sitemap loc: " + loc); continue; }
    if (url.pathname.endsWith(".xml")) { await inspectSitemap(path.join(root, url.pathname.replace(/^\/+/, ""))); continue; }
    const page = routeFile(url.pathname);
    if (!page || !(await exists(page))) errors.push("Sitemap URL has no built page: " + url.pathname);
  }
}
for (const name of sitemapCandidates) await inspectSitemap(path.join(root, name));
if (!sitemapFound) errors.push("No sitemap XML found in build output.");
console.log("SEO build audit: " + htmlFiles.length + " HTML pages checked; " + canonicalMap.size + " unique canonicals.");
if (errors.length) { console.error("Found " + errors.length + " issue(s):\n- " + errors.join("\n- ")); process.exitCode = 1; }
else console.log("No metadata, canonical, internal-link, or sitemap integrity issues found.");
