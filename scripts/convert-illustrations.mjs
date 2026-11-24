import { readdir, mkdir, stat } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import {
  CONVERSION_MANIFEST_NAME,
  outputHash,
  readManifest,
  shouldConvert,
  sourceFingerprint,
  writeManifest,
} from "../src/lib/image-conversion-cache.mjs";

const sharpCliVersion = "6.1.0";
const root = process.cwd();
const sourceDir = path.join(root, "assets/illustrations/source");
const outputDir = path.join(root, "public/images/illustrations");
const settings = {
  density: "144",
  width: "1600",
  quality: "82",
  effort: "6",
};

async function listSvgFiles(directory) {
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }

  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await listSvgFiles(fullPath)));
    else if (entry.isFile() && entry.name.toLowerCase().endsWith(".svg")) {
      files.push(fullPath);
    }
  }
  return files.sort();
}

const sources = await listSvgFiles(sourceDir);
if (sources.length === 0) {
  console.log("No SVG masters found; no WebP files generated.");
  process.exit(0);
}

await mkdir(outputDir, { recursive: true });

const manifestPath = path.join(
  root,
  "assets/illustrations",
  CONVERSION_MANIFEST_NAME,
);
const manifest = await readManifest(manifestPath);
let converted = 0;
let skipped = 0;
let manifestChanged = false;

for (const sourcePath of sources) {
  const relativePath = path.relative(sourceDir, sourcePath);
  const outputPath = path.join(
    outputDir,
    relativePath.replace(/\.svg$/i, ".webp"),
  );
  const fingerprint = await sourceFingerprint(
    sourcePath,
    settings,
    sharpCliVersion,
  );
  const existingOutput = await outputHash(outputPath);

  if (!shouldConvert(manifest, relativePath, fingerprint, existingOutput)) {
    skipped += 1;
    console.log(`Skipped ${path.relative(root, outputPath)} (unchanged).`);
    continue;
  }

  await mkdir(path.dirname(outputPath), { recursive: true });

  const result = spawnSync(
    "pnpm",
    [
      "dlx",
      `sharp-cli@${sharpCliVersion}`,
      "--input",
      sourcePath,
      "--output",
      outputPath,
      "--format",
      "webp",
      "--quality",
      settings.quality,
      "--effort",
      settings.effort,
      "--density",
      settings.density,
      "resize",
      settings.width,
    ],
    { cwd: root, stdio: "inherit" },
  );

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(
      `WebP conversion failed for ${relativePath} (exit ${result.status}).`,
    );
  }

  const output = await stat(outputPath);
  manifest.entries[relativePath] = {
    source: fingerprint,
    output: await outputHash(outputPath),
  };
  manifestChanged = true;
  converted += 1;
  console.log(
    `Created ${path.relative(root, outputPath)} (${(output.size / 1024).toFixed(1)} KB)`,
  );
}

if (manifestChanged) await writeManifest(manifestPath, manifest);
console.log(
  `Converted ${converted} SVG master(s); skipped ${skipped} unchanged.`,
);
