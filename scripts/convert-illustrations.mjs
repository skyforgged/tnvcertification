import { readdir, mkdir, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const sourceDir = path.join(root, "assets/illustrations/source");
const outputDir = path.join(root, "public/images/illustrations");
const settings = {
  density: 144,
  width: 1600,
  quality: 82,
  effort: 6,
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
let converted = 0;

for (const sourcePath of sources) {
  const relativePath = path.relative(sourceDir, sourcePath);
  const outputPath = path.join(
    outputDir,
    relativePath.replace(/\.svg$/i, ".webp"),
  );
  await mkdir(path.dirname(outputPath), { recursive: true });

  await sharp(sourcePath, { density: settings.density })
    .resize({ width: settings.width, withoutEnlargement: true })
    .webp({ quality: settings.quality, effort: settings.effort })
    .toFile(outputPath);

  const output = await stat(outputPath);
  console.log(
    `Created ${path.relative(root, outputPath)} (${(output.size / 1024).toFixed(1)} KB)`,
  );
  converted += 1;
}

console.log(`Converted ${converted} SVG master(s) to WebP.`);
