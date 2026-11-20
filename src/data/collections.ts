/**
 * Canonical registry of content collections.
 *
 * Names and directories are defined once here. Content configuration, the
 * build-time editorial gate, and page queries consume this registry instead of
 * maintaining their own list of collection paths.
 */
export const collectionRegistry = {
  articles: {
    name: "articles",
    dir: "src/content/articles",
    editorial: true,
  },
  services: {
    name: "services",
    dir: "src/content/services",
    editorial: true,
  },
  categories: {
    name: "categories",
    dir: "src/content/categories",
    editorial: false,
  },
  certifications: {
    name: "certifications",
    dir: "src/content/certifications",
    editorial: true,
  },
  training: {
    name: "training",
    dir: "src/content/training",
    editorial: true,
  },
  trainingSchedules: {
    name: "trainingSchedules",
    dir: "src/content/training-schedules",
    editorial: false,
  },
  pages: {
    name: "pages",
    dir: "src/content/pages",
    editorial: true,
  },
} as const;

export type CollectionName = keyof typeof collectionRegistry;

/** Collections whose entries are publishable pages subject to editorial rules. */
export const editorialCollections = Object.values(collectionRegistry).filter(
  (collection) => collection.editorial,
);
