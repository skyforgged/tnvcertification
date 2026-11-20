/**
 * Checks whether shared site identity fields look like pre-launch placeholders.
 * This is an advisory gate: it does not verify company identity externally.
 */
const PLACEHOLDER_TEXT = /placeholder|example|change[-_ ]?me|todo|pahlawan no\. 123/i;

export interface SiteIdentityReadinessConfig {
  url?: unknown;
  email?: unknown;
  phone?: unknown;
  street?: unknown;
  sameAs?: unknown;
}

export interface SiteIdentityReadinessFinding {
  field: string;
  reason: string;
}

export function siteIdentityReadiness(config: SiteIdentityReadinessConfig) {
  const findings: SiteIdentityReadinessFinding[] = [];
  const checks: Array<[string, unknown, (value: string) => boolean]> = [
    ["url", config.url, (value) => /\.dev\/?$/i.test(value) || /localhost/i.test(value)],
    ["email", config.email, (value) => /\.example$/i.test(value) || /placeholder/i.test(value)],
    ["phone", config.phone, (value) => /555|0000|placeholder/i.test(value)],
    ["street", config.street, (value) => PLACEHOLDER_TEXT.test(value)],
  ];

  for (const [field, value, isPlaceholder] of checks) {
    if (typeof value !== "string" || value.trim().length === 0) {
      findings.push({ field, reason: "missing value" });
    } else if (isPlaceholder(value)) {
      findings.push({ field, reason: "likely placeholder; verify against official source" });
    }
  }

  const sameAs: unknown = config.sameAs;
  if (Array.isArray(sameAs)) {
    sameAs.forEach((url: unknown, index: number) => {
      if (typeof url !== "string" || !/^https:\/\//i.test(url) || /placeholder|example/i.test(url)) {
        findings.push({ field: `sameAs[${index}]`, reason: "invalid or placeholder social URL" });
      }
    });
  }

  return { ready: findings.length === 0, findings };
}
