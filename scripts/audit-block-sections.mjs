#!/usr/bin/env node
/**
 * Build-output audit for content block sections.
 *
 * Every block rendered by BlockRenderer must be directly addressable: a
 * stable kebab-case id, a named type/surface class pair, and an
 * aria-labelledby that resolves to a heading in the same section.
 */
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const root = process.argv[2] ?? "dist";
const sectionTypes = ["content-section", "faq", "howto", "cta"];
const surfaces = ["white", "blue", "navy", "mint", "coral", "cream"];
const idPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

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

function attribute(tag, name) {
  return tag.match(new RegExp(`${name}="([^"]*)"`))?.[1];
}

function auditFile(file) {
  const html = readFileSync(file, "utf8");
  const issues = [];
  const ids = new Set();
  const tags = [...html.matchAll(/<(?:section|aside)\b[^>]*>/g)].filter((match) =>
    /class="[^"]*\bblock-section\b[^"]*"/.test(match[0]),
  );

  tags.forEach((match) => {
    const tag = match[0];
    const id = attribute(tag, "id");
    const label = attribute(tag, "aria-labelledby");
    const classes = (attribute(tag, "class") ?? "").split(/\s+/).filter(Boolean);
    const labelFor = (name) => classes.filter((value) => value.startsWith(name));

    if (!id || !idPattern.test(id)) issues.push(`${file}: invalid or missing block id in <${tag}>`);
    if (id && ids.has(id)) issues.push(`${file}: duplicate block id "${id}"`);
    if (id) ids.add(id);
    if (!classes.includes("block-section")) issues.push(`${file}: missing block-section class for "${id}"`);

    const types = labelFor("block-section--").filter((value) =>
      sectionTypes.some((type) => value === `block-section--${type}`),
    );
    if (types.length !== 1) issues.push(`${file}: expected one block type class for "${id}"`);

    const surfaceClasses = labelFor("block-section--surface-").filter((value) =>
      surfaces.some((surface) => value === `block-section--surface-${surface}`),
    );
    if (surfaceClasses.length !== 1) issues.push(`${file}: expected one surface class for "${id}"`);

    if (!label) {
      issues.push(`${file}: missing aria-labelledby for "${id}"`);
    } else {
      const bodyStart = match.index + tag.length;
      const closingTag = tag.startsWith("<aside") ? "</aside>" : "</section>";
      const body = html.slice(bodyStart, html.indexOf(closingTag, bodyStart));
      if (!new RegExp(`<h[1-6]\\b[^>]*id="${label}"`).test(body)) {
        issues.push(`${file}: aria-labelledby "${label}" has no heading in "${id}"`);
      }
    }

    if (tag.includes("[#")) issues.push(`${file}: hardcoded hex class on "${id}"`);
  });

  return { count: tags.length, issues };
}

const files = ["services", "trainings", "en/services", "en/trainings"].flatMap((directory) =>
  htmlFiles(path.join(root, directory)),
);
const results = files.map(auditFile);
const count = results.reduce((total, result) => total + result.count, 0);
const issues = results.flatMap((result) => result.issues);

if (issues.length > 0) {
  console.error(`Block section audit failed with ${issues.length} issue(s):`);
  issues.forEach((issue) => console.error(`  ${issue}`));
  process.exit(1);
}

console.log(`Block section audit: ${count} section(s) checked in ${files.length} page(s).`);
