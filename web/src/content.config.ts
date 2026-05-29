import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

const notes = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "../notes" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    category: z.string().default("General"),
    order: z.number().optional(),
  }),
});

export const collections = { notes };
