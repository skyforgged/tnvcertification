import type { HeroBlock, PageBlock } from "./pages";

interface TrainingViewInput {
  title: string;
  blocks?: PageBlock[];
}

/** Split a training entry into its required hero and the remaining renderable blocks. */
export function getTrainingView(input: TrainingViewInput): {
  hero: HeroBlock;
  blocks: PageBlock[];
} {
  const blocks = input.blocks ?? [];
  const hero = blocks.find((block): block is HeroBlock => block.type === "hero");
  if (!hero) throw new Error(`Training "${input.title}" is missing a hero block.`);
  return { hero, blocks: blocks.filter((block) => block.type !== "hero") };
}
