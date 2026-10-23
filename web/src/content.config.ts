import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

import { noteId } from "./lib/note-id";

const notes = defineCollection({
  loader: glob({
    pattern: "**/*.{md,mdx}",
    base: "../notes",
    // Explicit so a note's id (its /notes/<id>/ URL and IndexedDB highlight key)
    // never depends on undocumented loader defaults. See notes/README.md.
    generateId: ({ entry, data }) => noteId(entry, data),
  }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    category: z.string().default("General"),
    order: z.number().optional(),
    status: z.enum(["wip", "stable"]).optional(),
    tags: z.array(z.string()).optional(),
    kind: z.enum(["concept", "course", "weekly-review", "template"]).optional(),
    courseId: z.string().optional(),
    moduleId: z.string().optional(),
    relatedExercises: z
      .array(
        z.object({
          domain: z.enum(["algorithm", "ml", "sql", "note", "system-design"]),
          slug: z.string(),
        }),
      )
      .optional(),
    sourceUrl: z.string().url().optional(),
  }),
});

export const collections = { notes };
