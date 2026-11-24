/** Shared path rules for training archive and detail routes. */
export type TrainingLang = "id" | "en";

export function trainingIndexPath(lang: TrainingLang): string {
  return lang === "en" ? "/en/trainings/" : "/trainings/";
}

export function trainingPath(training: { lang: string; slug: string }): string {
  return `${trainingIndexPath(training.lang === "en" ? "en" : "id").replace(/\/$/, "")}/${training.slug}/`;
}
