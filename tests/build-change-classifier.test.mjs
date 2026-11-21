import assert from "node:assert/strict";
import test from "node:test";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const script = new URL("../scripts/classify-build-changes.mjs", import.meta.url);

function git(cwd, ...args) {
  return execFileSync("git", args, { cwd, encoding: "utf8" }).trim();
}

function fixtureRepo() {
  const cwd = mkdtempSync(join(tmpdir(), "tnvc-build-classifier-"));
  git(cwd, "init", "-q");
  git(cwd, "config", "user.email", "test@example.com");
  git(cwd, "config", "user.name", "Test");
  mkdirSync(join(cwd, "src/content/articles"), { recursive: true });
  writeFileSync(join(cwd, "src/content/articles/article.md"), "# Article");
  git(cwd, "add", ".");
  git(cwd, "commit", "-qm", "initial");
  return cwd;
}

function runClassifier(cwd, base, head = "HEAD") {
  return JSON.parse(execFileSync("node", [script.pathname, base, head], {
    cwd,
    encoding: "utf8",
  }));
}

test("editorial Markdown additions and modifications use content-only mode", () => {
  const cwd = fixtureRepo();
  try {
    const base = git(cwd, "rev-parse", "HEAD");
    writeFileSync(join(cwd, "src/content/articles/article.md"), "# Updated");
    git(cwd, "add", ".");
    git(cwd, "commit", "-qm", "update article");
    assert.equal(runClassifier(cwd, base).build_mode, "content-only");
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
});

test("Astro components force a full build", () => {
  const cwd = fixtureRepo();
  try {
    const base = git(cwd, "rev-parse", "HEAD");
    mkdirSync(join(cwd, "src/components"), { recursive: true });
    writeFileSync(join(cwd, "src/components/Header.astro"), "<header />");
    git(cwd, "add", ".");
    git(cwd, "commit", "-qm", "change component");
    const result = runClassifier(cwd, base);
    assert.equal(result.build_mode, "full");
    assert.equal(result.reason, "build-wide-or-unrecognized-path");
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
});

test("taxonomy changes force a full build", () => {
  const cwd = fixtureRepo();
  try {
    const base = git(cwd, "rev-parse", "HEAD");
    mkdirSync(join(cwd, "src/content/categories"), { recursive: true });
    writeFileSync(join(cwd, "src/content/categories/category.md"), "# Category");
    git(cwd, "add", ".");
    git(cwd, "commit", "-qm", "add taxonomy");
    assert.equal(runClassifier(cwd, base).build_mode, "full");
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
});

test("deletions and missing base commits fail safe to full", () => {
  const cwd = fixtureRepo();
  try {
    const base = git(cwd, "rev-parse", "HEAD");
    git(cwd, "rm", "src/content/articles/article.md");
    git(cwd, "commit", "-qm", "delete article");
    assert.equal(runClassifier(cwd, base).build_mode, "full");
    assert.equal(runClassifier(cwd, "0000000000000000000000000000000000000000").build_mode, "full");
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
});
