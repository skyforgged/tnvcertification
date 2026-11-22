#!/usr/bin/env node
/**
 * Build-output audit for rendered heading hierarchy. Content-level heading
 * validation checks Markdown bodies; this gate checks the composed HTML so a
 * component that emits H3 cards directly after an H1 cannot slip through.
 */
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

export function findHeadingViolations(html) {
  const levels = [...html.matchAll(/<h([1-6])\b[^>]*>/gi)].map((match) => Number(match[1]));
  const violations = [];
  let previous = 0;
  for (const level of levels) {
    if (previous > 0 && level > previous + 1) violations.push(`${previous} -> ${level}`);
    previous = level;
  }
  return violations;
}

/** English block components emit English auto-headings; verify the built HTML agrees. */
export function findLocalizedBlockHeadingViolations(html) {
  const lang = html.match(/<html\b[^>]*\blang=["']([^"']+)["']/i)?.[1]?.toLowerCase().split("-")[0] ?? "id";
  if (lang !== "en") return [];
  const expected = {
    faq: "Frequently asked questions",
    howto: "Certification process",
  };
  const violations = [];
  for (const [type, label] of Object.entries(expected)) {
    const pattern = new RegExp(`<section\\b[^>]*block-section--${type}[^>]*>([\\s\\S]*?)<\\/section>`, "i");
    const heading = html.match(pattern)?.[1]?.match(/<h2\b[^>]*>([\s\S]*?)<\/h2>/i)?.[1]
      ?.replace(/<[^>]*>/g, "").trim();
    if (heading && heading !== label) violations.push(`${type}: ${heading}`);
  }
  return violations;
}

function htmlFiles(directory) {
  let entries;
  try {
    entries = readdirSync(directory, { withFileTypes: true });
  } catch {
    return [];
  }
  return entries.flatMap((entry) => {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) return htmlFiles(full);
    return entry.isFile() && entry.name.endsWith(".html") ? [full] : [];
  });
}

const isCli = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isCli) {
  const root = process.argv[2] ?? "dist";
  const errors = [];
  for (const file of htmlFiles(root)) {
    const html = readFileSync(file, "utf8");
    const violations = [
      ...findHeadingViolations(html),
      ...findLocalizedBlockHeadingViolations(html),
    ];
    if (violations.length > 0) {
      errors.push(`${path.relative(root, file)}: ${violations.join(", ")}`);
    }
  }

  if (errors.length > 0) {
    console.error(`Rendered heading audit: ${errors.length} page(s) with skipped levels or mismatched localized block headings.`);
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
  }
  console.log(`Rendered heading audit passed: ${htmlFiles(root).length} HTML page(s).`);
}

export { htmlFiles };
