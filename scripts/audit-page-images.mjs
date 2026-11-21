#!/usr/bin/env node
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validatePageImageRecords } from "../src/lib/page-image-validation.mjs";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.resolve(process.argv[2] ?? path.join(root, "dist"));
if (!existsSync(dist)) { console.error("Build output not found. Run pnpm build first."); process.exit(1); }
function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : entry.isFile() && entry.name.endsWith(".html") ? [full] : [];
  });
}
function attr(tag, name) {
  const match = tag.match(new RegExp(`(?:^|\\s)${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, "i"));
  return match ? (match[1] ?? match[2] ?? "") : "";
}
const records = [], errors = [];
for (const file of walk(dist)) {
  const html = readFileSync(file, "utf8");
  const canonicalTag = html.match(/<link\\b(?=[^>]*\\brel=["']canonical["'])[^>]*>/i)?.[0];
  const canonical = canonicalTag ? attr(canonicalTag, "href") : "";
  const route = canonical ? new URL(canonical, "https://tnvcertification.invalid").pathname : path.relative(dist, file);
  const images = [...html.matchAll(/<img\\b[^>]*>/gi)].map((m) => m[0]).filter((tag) => /(?:^|\\s)data-page-image(?:\\s|=|>)/i.test(tag));
  if (!canonical) errors.push(`[PAGE-IMAGE-001] ${file}: missing canonical URL.`);
  if (images.length !== 1) { errors.push(`[PAGE-IMAGE-002] ${route}: expected exactly one data-page-image; found ${images.length}.`); continue; }
  const src = attr(images[0], "src");
  if (!src.startsWith("/")) { errors.push(`[PAGE-IMAGE-002] ${route}: primary image must use a root-relative local src.`); continue; }
  const asset = path.resolve(dist, "." + decodeURIComponent(new URL(src, "https://tnvcertification.invalid").pathname));
  const hash = existsSync(asset) && asset.startsWith(dist + path.sep) ? createHash("sha256").update(readFileSync(asset)).digest("hex") : "";
  records.push({ route, src, hash });
}
errors.push(...validatePageImageRecords(records).map((d) => `[${d.rule}] ${d.route}: ${d.reason}`));
if (errors.length) { console.error("Page image uniqueness audit failed:\\n" + errors.join("\\n")); process.exit(1); }
console.log(`Page image uniqueness audit passed: ${records.length} generated URL(s).`);
