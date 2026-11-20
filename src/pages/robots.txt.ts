import type { APIRoute } from "astro";
import { siteSettings } from "../site";

export const GET: APIRoute = () => {
  const sitemapUrl = new URL("sitemap-index.xml", siteSettings.url);
  const body = [
    "User-agent: *",
    "Allow: /",
    "",
    `Sitemap: ${sitemapUrl.toString()}`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
