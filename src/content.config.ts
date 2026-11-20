import { defineCollection } from "astro/content/config";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

/**
 * Shared image-object schema (single primary / optional gallery).
 * `src`: relative path / asset URL.
 * `alt`: alternative text; must explain the title with "adalah".
 * `caption`: optional caption.
 */
const imageObjectSchema = z.object({
  src: z.string().min(1, "image src is required"),
  alt: z.string().min(1, "image alt is required"),
  caption: z.string().optional(),
});

// --- Shared blocks (discriminated union) ---
const faqBlock = z.object({
  type: z.literal("faq"),
  items: z
    .array(
      z.object({
        question: z.string().min(1),
        answer: z.string().min(1),
      })
    )
    .min(1),
});

const howToBlock = z.object({
  type: z.literal("howto"),
  steps: z.array(
    z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      image: imageObjectSchema.optional(),
    })
  ),
});

const ctaBlock = z.object({
  type: z.literal("cta"),
  variant: z.enum(["primary", "secondary", "ghost"]).optional().default("primary"),
  title: z.string().optional(),
  description: z.string().optional(),
  link: z
    .object({
      label: z.string().min(1),
      url: z.string().url(),
    })
    .optional(),
});

const blockSchema = z.union([faqBlock, howToBlock, ctaBlock]);

// --- Articles ---
const articleSchema = z.object({
  title: z.string().min(1, "title is required"),
  metaDescription: z.string().min(1, "meta description is required"),
  pubDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  draft: z.boolean().optional(),
  categoryIds: z.array(z.string()).optional(),
  serviceId: z.number().int().positive().optional(),
  featuredImage: imageObjectSchema,
  images: z.array(imageObjectSchema).optional(),
  slug: z.string().min(1),
  lang: z.enum(["id", "en"]),
});

// --- Certifications ---
const certificationSchema = z.object({
  title: z.string().min(1, "title is required"),
  metaDescription: z.string().min(1, "meta description is required"),
  pubDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  categoryIds: z.array(z.string()).optional(),
  featuredImage: imageObjectSchema,
  images: z.array(imageObjectSchema).optional(),
  slug: z.string().min(1),
  lang: z.enum(["id", "en"]),
});

// --- Training (program/course page) ---
const trainingHeroSchema = z.object({
  headline: z.string().min(1, "hero headline is required"),
  eyebrow: z.string().optional(),
  description: z.string().optional(),
  alt: z.string().min(1, "hero image alt is required"),
  cta: z
    .object({
      label: z.string().min(1),
      url: z.string().url(),
    })
    .optional(),
});

const trainingSchema = z.object({
  title: z.string().min(1, "title is required"),
  metaDescription: z.string().min(1, "meta description is required"),
  pubDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  draft: z.boolean().optional(),
  categoryIds: z.array(z.string()).optional(),
  featuredImage: imageObjectSchema,
  hero: trainingHeroSchema.optional(),
  blocks: z.array(blockSchema).optional(),
  slug: z.string().min(1),
  lang: z.enum(["id", "en"]),
});

// --- Training schedules (event/batch records) ---
const scheduleSchema = z.object({
  trainingSlug: z.string().min(1, "trainingSlug is required"),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "startDate must be YYYY-MM-DD"),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "endDate must be YYYY-MM-DD"),
  timezone: z.string().optional(),
  locationType: z.enum(["offline", "online", "hybrid"]).optional(),
  venue: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  registrationStatus: z
    .enum(["open", "closed", "full", "cancelled"])
    .optional(),
  price: z.number().int().min(0).optional(),
  currency: z.string().length(3).optional(),
  quota: z.number().int().positive().optional(),
  registrationUrl: z.string().url().optional(),
  notes: z.string().optional(),
  slug: z.string().min(1),
});

// --- General pages ---
const pageSchema = z.object({
  title: z.string().min(1, "title is required"),
  metaDescription: z.string().min(1, "meta description is required"),
  pubDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  draft: z.boolean().optional(),
  featuredImage: imageObjectSchema,
  slug: z.string().min(1),
  lang: z.enum(["id", "en"]),
});

export const collections = {
  articles: defineCollection({
    loader: glob({ base: "./src/content/articles", pattern: "**/*.{md,mdx}" }),
    schema: articleSchema,
  }),
  certifications: defineCollection({
    loader: glob({ base: "./src/content/certifications", pattern: "**/*.{md,mdx}" }),
    schema: certificationSchema,
  }),
  training: defineCollection({
    loader: glob({ base: "./src/content/training", pattern: "**/*.{md,mdx}" }),
    schema: trainingSchema,
  }),
  trainingSchedules: defineCollection({
    loader: glob({ base: "./src/content/training-schedules", pattern: "**/*.{md,mdx}" }),
    schema: scheduleSchema,
  }),
  pages: defineCollection({
    loader: glob({ base: "./src/content/pages", pattern: "**/*.{md,mdx}" }),
    schema: pageSchema,
  }),
};
