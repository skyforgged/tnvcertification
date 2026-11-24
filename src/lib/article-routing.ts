/** Shared path rules for article archive and detail routes. */
export type ArticleLang = "id" | "en";

export function articleIndexPath(lang: ArticleLang): string {
  return lang === "en" ? "/en/articles/" : "/articles/";
}

export function articlePath(article: { lang: string; slug: string }): string {
  return `${articleIndexPath(article.lang === "en" ? "en" : "id").replace(/\/$/, "")}/${article.slug}/`;
}
