---
title: Notes Organization
category: Meta
---

# Notes

This directory contains reusable technical knowledge that complements the practice artifacts in `src/`.

Public notes on the site are authored teaching content. Browser attempts, highlights, and weekly hours stay in IndexedDB and are never published by adding a Markdown file here.

## Scope

Notes should help answer one or more of these questions:

- What is the core idea behind a concept, pattern, or technique?
- What invariant, trade-off, or complexity result matters?
- When should a technique be used, and when should it not?
- Which implementations or exercises demonstrate it?

Link related solutions and implementations when they provide useful practice context.

## Organization

Existing notes remain at this directory's root. For new topic collections, introduce a domain directory when it contains multiple related notes:

```text
notes/
├── dsa/
├── ml/
├── recommendation-system/
├── roadmap/examples/   # labeled course-note examples linked to a module
└── templates/          # copy-paste outlines; kind: template
```

Do not move existing notes solely to match this convention. Preserve links and migrate deliberately when a domain needs a fuller reorganization.

## File Naming

Use lowercase, hyphen-separated filenames that describe the topic:

```text
binary-search-invariants.mdx
logistic-regression-gradient-descent.mdx
cache-aside-pattern.mdx
```

Use `.md` for straightforward prose. Use `.mdx` **only** when the note imports an Astro component (for example `arrays_and_hashing.mdx`). Keep prose-only notes as `.md` so they stay on the lighter Markdown pipeline. Frontmatter fields are the same for both.

## Categories

Use one of these categories for new notes:

- `DSA` for data structures, algorithms, patterns, and complexity.
- `Machine Learning` for model foundations, implementations, evaluation, and ML systems.
- `System Design` for architecture, scaling, reliability, and trade-offs.
- `Templates` for copy-paste outlines (`kind: template` only).

## Frontmatter

New published notes should include frontmatter like this:

```yaml
---
title: Binary Search Invariants
description: The decision rule and boundary handling behind binary search.
category: DSA
order: 10
status: wip
kind: concept
tags:
  - dsa
  - binary-search
---
```

Optional fields, all backward-compatible:

| Field | Meaning |
| --- | --- |
| `kind` | `concept` (default if omitted), `course`, `weekly-review`, or `template`. |
| `courseId` | Must match `courses[].id` in `web/src/data/roadmap.ts`. |
| `moduleId` | Must match a `RoadmapModule.id`. |
| `relatedExercises` | `{ domain, slug }` pairs using the same domains as the roadmap (`algorithm`, `ml`, `sql`, `note`, `system-design`). |
| `sourceUrl` | Canonical course or paper URL. |

Use `status: wip` while developing a note and `status: stable` once it is ready to rely on as a reference. Keep tags specific enough to support future navigation and discovery. `order` is optional; use it when notes in the same category need a deliberate reading sequence.

`kind: template` notes are listed separately on `/notes` so they are not mixed in with teaching copy. `kind: weekly-review` is for the outline only; filled personal reviews do not belong in this directory.

## Course notes and weekly reviews

Copy `templates/course-note.md` for a public explanation tied to a roadmap week. Set `kind: course` plus `courseId` and `moduleId`. A labeled example lives at `roadmap/examples/foundation-01-course-note.md`.

Copy `templates/weekly-review.md` locally for planned versus actual hours, work attempted, evidence links, a failure or misconception, what you can now explain, and next week's adjustment. `templates/weekly-review-example.md` shows the fields filled with placeholders. Do not commit actual hours or private attempts.

## Note Outline

Copy and adapt this outline for a new concept note:

```md
# Topic Title

## Intuition

Explain the problem this concept solves and the mental model to retain.

## Baseline and Improvement

Describe the simple approach first, where its cost comes from, and the key observation that enables a better approach.

## Invariant or Correctness

State the condition that remains true throughout the algorithm or process. Explain why it establishes correctness.

## Complexity

State and justify time and space complexity.

## Implementation Notes

Document important API contracts, data shapes, state transitions, or language-specific details.

## Edge Cases and Pitfalls

List the failures that are easy to miss and how to test for them.

## Related Practice

- Problem: link to the relevant practice prompt.
- Implementation: link to the source file or repository implementation.
- Related note: link to a prerequisite or follow-up concept.
```
