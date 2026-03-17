import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

const notes = defineCollection({
  loader: glob({ pattern: "{asymptotic-analysis,time-complexity,space-complexity,python-big-o-cheatsheet}.md", base: "../notes" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
  }),
});

export const collections = { notes };
