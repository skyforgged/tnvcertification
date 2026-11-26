export function normalizeRoutePath(value) {
  let pathname;
  try { pathname = decodeURIComponent(new URL(value, "https://ia.invalid").pathname); } catch { return null; }
  if (!pathname.startsWith("/") || pathname.includes("\\") || pathname.split("/").includes("..")) return null;
  if (pathname === "/") return "/";
  return pathname.replace(/\/{2,}/g, "/").replace(/\/?$/, "/");
}
export function auditInformationArchitecture({ pages, sitemapPaths, navigationPaths = [], breadcrumbPaths = [], redirects = {}, coreRoutes = [], routeFamilies = [] }) {
  const issues = [], byPath = new Map(pages.map((page) => [normalizeRoutePath(page.path), page]));
  const indexable = new Set(pages.filter((page) => page.indexable).map((page) => normalizeRoutePath(page.canonical ?? page.path)));
  const sitemap = new Set(sitemapPaths.map(normalizeRoutePath).filter(Boolean)), core = coreRoutes.map(normalizeRoutePath);
  for (const route of coreRoutes) {
    const path = normalizeRoutePath(route);
    if (!path || !byPath.get(path)?.indexable) issues.push({ rule: "IA-001", severity: "error", message: `Core route is missing or not indexable: ${route}` });
  }
  for (const page of pages.filter((item) => item.indexable)) {
    const route = normalizeRoutePath(page.path), canonical = normalizeRoutePath(page.canonical ?? page.path);
    if (!route || !canonical || route !== canonical) issues.push({ rule: "IA-002", severity: "error", message: `Built page route and canonical URL disagree: ${page.path} -> ${page.canonical ?? "(missing)"}` });
    const covered = core.includes(route) || routeFamilies.some((family) => route.startsWith(normalizeRoutePath(family.prefix)) && !(family.excludes ?? []).some((excluded) => route.startsWith(normalizeRoutePath(excluded)))) || /^\/[^/]+\/$/.test(route ?? "");
    if (!covered) issues.push({ rule: "IA-011", severity: "error", message: `Indexable route is not assigned to a route family: ${route}` });
  }
  for (const route of indexable) if (!sitemap.has(route)) issues.push({ rule: "IA-003", severity: "error", message: `Indexable page is missing from sitemap: ${route}` });
  for (const route of sitemap) if (!indexable.has(route)) issues.push({ rule: "IA-004", severity: "error", message: `Sitemap contains a missing, redirected, or noindex route: ${route}` });
  for (const route of navigationPaths) if (!indexable.has(normalizeRoutePath(route))) issues.push({ rule: "IA-005", severity: "error", message: `Navigation target is not an indexable canonical page: ${route}` });
  for (const route of breadcrumbPaths) if (!indexable.has(normalizeRoutePath(route))) issues.push({ rule: "IA-006", severity: "error", message: `Breadcrumb target is not an indexable canonical page: ${route}`);
  for (const [from, to] of Object.entries(redirects)) {
    const source = normalizeRoutePath(from), target = normalizeRoutePath(to);
    if (!byPath.get(source)?.redirect) issues.push({ rule: "IA-007", severity: "error", message: `Configured redirect has no generated redirect page: ${from}` });
    if (!indexable.has(target)) issues.push({ rule: "IA-008", severity: "error", message: `Redirect target is not an indexable canonical page: ${from} -> ${to}` });
    if (sitemap.has(source)) issues.push({ rule: "IA-009", severity: "error", message: `Redirect source must not appear in sitemap: ${from}` });
  }
  const incoming = new Map([...indexable].map((route) => [route, 0]));
  for (const page of pages.filter((item) => item.indexable)) for (const href of page.links ?? []) {
    const target = normalizeRoutePath(href);
    if (incoming.has(target) && target !== normalizeRoutePath(page.path)) incoming.set(target, incoming.get(target) + 1);
  }
  for (const [route, count] of incoming) if (!count && !core.includes(route)) issues.push({ rule: "IA-010", severity: "warning", message: `Indexable page has no incoming internal links: ${route}` });
  return issues;
}
