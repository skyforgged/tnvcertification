#!/usr/bin/env node
/**
 * Classify a Git diff for the safe content-first build workflow.
 * This never creates partial dist output; production builds remain full Astro builds.
 */
import { appendFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const [base, head = "HEAD"] = process.argv.slice(2);
const FULL = "full";
const CONTENT = "content-only";
const EDITORIAL_DIRS = [
  "src/content/articles/",
  "src/content/services/",
  "src/content/certifications/",
  "src/content/training/",
  "src/content/pages/",
];

function classifyPath(path) {
  const normalized = path.replaceAll("\\", "/");
  return EDITORIAL_DIRS.some((dir) => normalized.startsWith(dir)) &&
    /\.(md|mdx)$/i.test(normalized)
    ? CONTENT
    : FULL;
}

function classifyDiff(raw) {
  if (!raw.length) return { mode: FULL, reason: "empty-or-unavailable-diff", files: [] };

  const fields = raw.toString("utf8").split("\0");
  const files = [];
  let index = 0;
  while (index < fields.length - 1) {
    const status = fields[index++];
    if (!status) continue;
    if (/^[RC]/.test(status)) {
      const oldPath = fields[index];
      const newPath = fields[index + 1];
      if (oldPath) files.push({ status, path: oldPath });
      if (newPath) files.push({ status, path: newPath });
      return { mode: FULL, reason: "renamed-or-copied-path", files };
    }
    const path = fields[index++];
    if (!path) continue;
    files.push({ status, path });
    if (status !== "A" && status !== "M") {
      return { mode: FULL, reason: "deleted-or-ambiguous-path", files };
    }
    if (classifyPath(path) !== CONTENT) {
      return { mode: FULL, reason: "build-wide-or-unrecognized-path", files };
    }
  }
  return files.length
    ? { mode: CONTENT, reason: "editorial-markdown-only", files }
    : { mode: FULL, reason: "empty-or-unavailable-diff", files };
}

let result;
try {
  if (!base || /^0+$/.test(base)) throw new Error("No usable base commit");
  const raw = execFileSync("git", ["diff", "--name-status", "-z", base, head], {
    encoding: "buffer",
    stdio: ["ignore", "pipe", "pipe"],
  });
  result = classifyDiff(raw);
} catch (error) {
  result = {
    mode: FULL,
    reason: "diff-unavailable-fallback",
    files: [],
    detail: error instanceof Error ? error.message : String(error),
  };
}

const output = {
  build_mode: result.mode,
  reason: result.reason,
  changed_files: result.files.length,
};
console.log(JSON.stringify({ ...output, files: result.files }, null, 2));

if (process.env.GITHUB_OUTPUT) {
  appendFileSync(
    process.env.GITHUB_OUTPUT,
    "build_mode=" + output.build_mode + "\n" +
      "reason=" + output.reason + "\n" +
      "changed_files=" + output.changed_files + "\n",
  );
}
