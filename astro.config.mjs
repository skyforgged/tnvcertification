import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import viteConfig from "./vite.config.mjs";
import { contentValidationIntegration } from "./src/content-validation";
import { getContentLastmod, normalizeSitemapLastmod } from "./src/lib/sitemap-lastmod.mjs";
import { siteSettings } from "./src/site";

const sitemapLastmodIntegration = {
  name: "sitemap-content-lastmod",
  hooks: {
    "astro:build:done": ({ dir }) => normalizeSitemapLastmod(fileURLToPath(dir)),
  },
};

export default defineConfig({
  site: siteSettings.url,
  // Preserve the previous singular directory URL as a permanent redirect.
  redirects: {
    "/en/": "/",
    "/service/": "/services/",
    "/schedule/": "/schedules/",
    "/hal-about-us/": "/about-us/",
  },
  integrations: [
    contentValidationIntegration,
    sitemap({
      // lastmod must trace to content publication/update metadata, never to
      // the file system or build time. Content-backed routes set it explicitly.
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
