import assert from "node:assert/strict";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import {
  CONVERSION_MANIFEST_NAME,
  CONVERSION_MANIFEST_VERSION,
  outputHash,
  readManifest,
  shouldConvert,
  sourceFingerprint,
  writeManifest,
} from "../src/lib/image-conversion-cache.mjs";

function fixture() {
  return mkdtempSync(path.join(tmpdir(), "tnvc-image-cache-"));
}

test("source fingerprint changes with source bytes, settings, and sharp-cli version", async () => {
  const dir = fixture();
  try {
    const source = path.join(dir, "a.svg");
    writeFileSync(source, "<svg></svg>");
    const settings = {
      density: "144",
      width: "1600",
      quality: "82",
      effort: "6",
    };

    const base = await sourceFingerprint(source, settings, "6.1.0");
    assert.match(base, /^[a-f0-9]{64}$/);
    assert.equal(await sourceFingerprint(source, settings, "6.1.0"), base);
    assert.notEqual(
      await sourceFingerprint(source, { ...settings, quality: "90" }, "6.1.0"),
      base,
    );
    assert.notEqual(await sourceFingerprint(source, settings, "6.2.0"), base);

    writeFileSync(source, "<svg>changed</svg>");
    assert.notEqual(await sourceFingerprint(source, settings, "6.1.0"), base);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("outputHash returns null when output is missing and a hash when it exists", async () => {
  const dir = fixture();
  try {
    const output = path.join(dir, "a.webp");
    assert.equal(await outputHash(output), null);
    writeFileSync(output, "webp-bytes");
    assert.match(await outputHash(output), /^[a-f0-9]{64}$/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("manifest starts empty, round-trips, and writes deterministic bytes", async () => {
  const dir = fixture();
  try {
    const manifestPath = path.join(dir, "nested", CONVERSION_MANIFEST_NAME);
    const manifest = await readManifest(manifestPath);
    assert.deepEqual(manifest, {
      version: CONVERSION_MANIFEST_VERSION,
      entries: {},
    });

    manifest.entries["nested/a.svg"] = {
      source: "source-hash",
      output: "output-hash",
    };
    await writeManifest(manifestPath, manifest);
    assert.deepEqual(await readManifest(manifestPath), manifest);

    const first = readFileSync(manifestPath, "utf8");
    await writeManifest(manifestPath, manifest);
    assert.equal(readFileSync(manifestPath, "utf8"), first);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("malformed manifest is treated as empty instead of crashing the build", async () => {
  const dir = fixture();
  try {
    const manifestPath = path.join(dir, CONVERSION_MANIFEST_NAME);
    mkdirSync(path.dirname(manifestPath), { recursive: true });
    writeFileSync(manifestPath, "{not json");
    assert.deepEqual(await readManifest(manifestPath), {
      version: CONVERSION_MANIFEST_VERSION,
      entries: {},
    });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("shouldConvert skips only when the recorded source, output, and fingerprint match", () => {
  const manifest = {
    version: CONVERSION_MANIFEST_VERSION,
    entries: { "a.svg": { source: "fp", output: "oh" } },
  };

  assert.equal(shouldConvert(manifest, "a.svg", "fp", "oh"), false);
  assert.equal(shouldConvert(manifest, "b.svg", "fp", "oh"), true);
  assert.equal(shouldConvert(manifest, "a.svg", "changed-fp", "oh"), true);
  assert.equal(shouldConvert(manifest, "a.svg", "fp", "changed-oh"), true);
  assert.equal(shouldConvert(manifest, "a.svg", "fp", null), true);
});
