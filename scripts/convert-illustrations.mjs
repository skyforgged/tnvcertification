import { readdir, mkdir, stat } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";

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

for (const sourcePath of sources) {
  const relativePath = path.relative(sourceDir, sourcePath);
  const outputPath = path.join(
    outputDir,
    relativePath.replace(/\.svg$/i, ".webp"),
  );
  await mkdir(path.dirname(outputPath), { recursive: true });

  const result = spawnSync(
    "pnpm",
    [
      "dlx",
      "sharp-cli@6.1.0",
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
    throw new Error(`WebP conversion failed for ${relativePath} (exit ${result.status}).`);
  }

  const output = await stat(outputPath);
  console.log(
    `Created ${path.relative(root, outputPath)} (${(output.size / 1024).toFixed(1)} KB)`,
  );
}

console.log(`Converted ${sources.length} SVG master(s) to WebP.`);
