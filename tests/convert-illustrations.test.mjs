import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const repoRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const script = join(repoRoot, "scripts/convert-illustrations.mjs");

function fixture() {
  const cwd = mkdtempSync(join(tmpdir(), "tnvc-convert-illustrations-"));
  mkdirSync(join(cwd, "assets/illustrations/source"), { recursive: true });
  mkdirSync(join(cwd, "bin"), { recursive: true });
  writeFileSync(join(cwd, "assets/illustrations/source/a.svg"), "<svg>a</svg>");
  writeFileSync(join(cwd, "assets/illustrations/source/b.svg"), "<svg>b</svg>");

  const fixtureWebp = join(cwd, "fixture.webp");
  writeFileSync(fixtureWebp, "converted-webp");
  const calls = join(cwd, "calls.log");
  const stub = join(cwd, "bin/pnpm");
  writeFileSync(
    stub,
    `#!/bin/sh
echo "$@" >> "$TNV_CONVERT_CALLS"
while [ "$#" -gt 0 ]; do
  if [ "$1" = "--output" ]; then
    shift
    cp "$TNV_CONVERT_FIXTURE_WEBP" "$1"
    exit 0
  fi
  shift
done
exit 1
`,
  );
  chmodSync(stub, 0o755);

  return {
    cwd,
    calls,
    fixtureWebp,
    manifest: join(cwd, "assets/illustrations/webp-conversion-manifest.json"),
  };
}

function run({ cwd, calls, fixtureWebp }) {
  const env = {
    ...process.env,
    PATH: `${join(cwd, "bin")}:${process.env.PATH}`,
    TNV_CONVERT_CALLS: calls,
    TNV_CONVERT_FIXTURE_WEBP: fixtureWebp,
  };
  return spawnSync(process.execPath, [script], { cwd, env, encoding: "utf8" });
}

function conversionCount(calls) {
  if (!existsSync(calls)) return 0;
  return readFileSync(calls, "utf8").trim().split("\n").filter(Boolean).length;
}

test("WebP conversion skips unchanged files and reruns for changed source or missing output", () => {
  const f = fixture();
  try {
    let result = run(f);
    assert.equal(result.status, 0, result.stderr || result.stdout);
    assert.equal(conversionCount(f.calls), 2);
    assert.match(
      result.stdout,
      /Converted 2 SVG master\(s\); skipped 0 unchanged\./,
    );
    assert.ok(existsSync(f.manifest), "conversion manifest should be written");

    result = run(f);
    assert.equal(result.status, 0, result.stderr || result.stdout);
    assert.equal(
      conversionCount(f.calls),
      2,
      "unchanged files must not be converted again",
    );
    assert.match(
      result.stdout,
      /Converted 0 SVG master\(s\); skipped 2 unchanged\./,
    );

    writeFileSync(
      join(f.cwd, "assets/illustrations/source/a.svg"),
      "<svg>a changed</svg>",
    );
    result = run(f);
    assert.equal(result.status, 0, result.stderr || result.stdout);
    assert.equal(
      conversionCount(f.calls),
      3,
      "changed source must be reconverted",
    );
    assert.match(
      result.stdout,
      /Converted 1 SVG master\(s\); skipped 1 unchanged\./,
    );

    rmSync(join(f.cwd, "public/images/illustrations/b.webp"));
    result = run(f);
    assert.equal(result.status, 0, result.stderr || result.stdout);
    assert.equal(
      conversionCount(f.calls),
      4,
      "missing output must be regenerated",
    );
    assert.match(
      result.stdout,
      /Converted 1 SVG master\(s\); skipped 1 unchanged\./,
    );
  } finally {
    rmSync(f.cwd, { recursive: true, force: true });
  }
});
