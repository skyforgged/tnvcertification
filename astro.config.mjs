import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import viteConfig from "./vite.config.mjs";
import { contentValidationIntegration } from "./src/content-validation";
import { siteSettings } from "./src/site";

export default defineConfig({
  site: siteSettings.url,
  // Preserve the previous singular directory URL as a permanent redirect.
  redirects: {
    "/service/": "/services/",
    "/schedule/": "/schedules/",
  },
  integrations: [
    contentValidationIntegration,
    sitemap({
      // lastmod must trace to content publication/update metadata, never to
      // the file system or build time. Content-backed routes set it explicitly.
      serialize(item) {
        delete item.lastmod;
        return item;
      },
    }),
  ],
  vite: viteConfig,
});
