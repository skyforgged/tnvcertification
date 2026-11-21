import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

/** Remove <url> blocks whose pathname is reported as a redirect stub. */
export function removeStubUrlsFromSitemap(xml, isStub) {
  return xml.replace(/<url>[\s\S]*?<\/url>/g, (block) => {
    const loc = block.match(/<loc>([^<]+)<\/loc>/)?.[1];
    if (!loc) return block;
    let pathname;
    try {
      pathname = new URL(loc).pathname;
    } catch {
      return block;
    }
    return isStub(pathname) ? "" : block;
  });
}

/** Drop generated noindex redirect pages from the built sitemap files. */
export function removeStubUrlsFromSitemapFiles(directory) {
  let files;
  try {
    files = readdirSync(directory);
  } catch {
    return;
  }

  const isStub = (pathname) => {
    let decoded;
    try {
      decoded = decodeURIComponent(pathname);
    } catch {
      return false;
    }
    const file = path.join(
      directory,
      decoded === "/" ? "index.html" : decoded,
      "index.html",
    );
    if (!existsSync(file)) return false;
    return /http-equiv=["']?refresh/i.test(readFileSync(file, "utf8"));
  };

  for (const name of files.filter((item) => /^sitemap.*\.xml$/.test(item))) {
    const file = path.join(directory, name);
    const xml = readFileSync(file, "utf8");
    const filtered = removeStubUrlsFromSitemap(xml, isStub);
    if (filtered !== xml) writeFileSync(file, filtered);
  }
}
