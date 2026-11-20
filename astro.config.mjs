import { defineConfig } from "astro/config";
import viteConfig from "./vite.config.mjs";
import { contentValidationIntegration } from "./src/content-validation";

/**
 * Canonical site URL used for canonical links, sitemap base, and
 * structured-data base URLs. Replace with the production domain when
 * deploying. Kept as a placeholder until the real domain is defined.
 */
export default defineConfig({
  site: "https://www.intiprima-sertifikasi.dev",
  integrations: [contentValidationIntegration],
  vite: viteConfig,
});
