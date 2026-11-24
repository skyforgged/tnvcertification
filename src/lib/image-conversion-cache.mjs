import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export const CONVERSION_MANIFEST_VERSION = 1;
export const CONVERSION_MANIFEST_NAME = "webp-conversion-manifest.json";

function digest(value) {
  return createHash("sha256").update(value).digest("hex");
}

function emptyManifest() {
  return { version: CONVERSION_MANIFEST_VERSION, entries: {} };
}

export async function sourceFingerprint(sourcePath, settings, sharpVersion) {
  const canonicalSettings = Object.fromEntries(
    Object.entries(settings).sort(([a], [b]) => a.localeCompare(b)),
  );
  return digest(
    JSON.stringify({
      version: CONVERSION_MANIFEST_VERSION,
      settings: canonicalSettings,
      sharpVersion,
      source: digest(await readFile(sourcePath)),
    }),
  );
}

export async function outputHash(outputPath) {
  try {
    return digest(await readFile(outputPath));
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}

export async function readManifest(manifestPath) {
  let raw;
  try {
    raw = await readFile(manifestPath, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") return emptyManifest();
    throw error;
  }

  try {
    const parsed = JSON.parse(raw);
    if (
      parsed?.version === CONVERSION_MANIFEST_VERSION &&
      parsed.entries &&
      typeof parsed.entries === "object" &&
      !Array.isArray(parsed.entries)
    ) {
      return { version: parsed.version, entries: parsed.entries };
    }
  } catch {
    // A corrupt manifest is treated as a cold cache so the build can proceed.
  }
  return emptyManifest();
}

export async function writeManifest(manifestPath, manifest) {
  await mkdir(path.dirname(manifestPath), { recursive: true });
  await writeFile(
    manifestPath,
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8",
  );
}

export function shouldConvert(manifest, relativePath, fingerprint, output) {
  const entry = manifest.entries[relativePath];
  return (
    !entry ||
    output === null ||
    entry.source !== fingerprint ||
    entry.output !== output
  );
}
