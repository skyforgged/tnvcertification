import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import viteConfig from "./vite.config.mjs";
import { contentValidationIntegration } from "./src/content-validation";
import { getContentLastmod, normalizeSitemapLastmod } from "./src/lib/sitemap-lastmod.mjs";
import { removeStubUrlsFromSitemapFiles } from "./src/lib/sitemap-stubs.mjs";
import { informationArchitecture } from "./src/data/information-architecture";

const sitemapLastmodIntegration = {
  name: "sitemap-content-lastmod",
  hooks: {
    "astro:build:done": ({ dir }) => {
      const outputDir = fileURLToPath(dir);
      normalizeSitemapLastmod(outputDir);
      removeStubUrlsFromSitemapFiles(outputDir);
    },
  },
};

export default defineConfig({
  site: "https://tnv-certification.com",
  // Permanent redirects are shared with the information-architecture audit.
  redirects: informationArchitecture.redirects,
  integrations: [
    contentValidationIntegration,
    sitemap({
      serialize(item) {
        const lastmod = getContentLastmod(new URL(item.url).pathname);
        if (lastmod) item.lastmod = new Date(lastmod);
        else delete item.lastmod;
        return item;
      },
    }),
    sitemapLastmodIntegration,
  ],
  vite: viteConfig,
});
