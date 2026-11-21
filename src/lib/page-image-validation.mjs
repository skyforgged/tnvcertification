export function validatePageImageRecords(records) {
  const diagnostics = [];
  const sources = new Map();
  const hashes = new Map();
  const routes = new Set();
  for (const { route, src, hash } of records) {
    if (routes.has(route)) diagnostics.push({ rule: "PAGE-IMAGE-001", route, reason: "Canonical URL is duplicated." });
    routes.add(route);
    const normalized = String(src ?? "").trim().split(/[?#]/, 1)[0];
    if (!normalized) {
      diagnostics.push({ rule: "PAGE-IMAGE-002", route, reason: "Exactly one primary image with a non-empty src is required." });
      continue;
    }
    if (sources.has(normalized)) diagnostics.push({ rule: "PAGE-IMAGE-003", route, reason: `Image source is already assigned to ${sources.get(normalized)}.` });
    else sources.set(normalized, route);
    if (hash && hashes.has(hash)) diagnostics.push({ rule: "PAGE-IMAGE-004", route, reason: `Image bytes duplicate the primary image assigned to ${hashes.get(hash)}.` });
    else if (hash) hashes.set(hash, route);
  }
  return diagnostics;
}
