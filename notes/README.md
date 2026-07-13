---
title: Notes Organization
category: Meta
---

# Notes

This directory contains reusable technical knowledge that complements the practice artifacts in `src/`.

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
└── system-design/
```

Do not move existing notes solely to match this convention. Preserve links and migrate deliberately when a domain needs a fuller reorganization.

## File Naming

Use lowercase, hyphen-separated filenames that describe the topic:

```text
binary-search-invariants.mdx
logistic-regression-gradient-descent.mdx
cache-aside-pattern.mdx
```

Use `.md` for straightforward prose. Use `.mdx` when the note benefits from math, interactive components, or richer site presentation.

## Categories

Use one of these categories for new notes:

- `DSA` for data structures, algorithms, patterns, and complexity.
- `Machine Learning` for model foundations, implementations, evaluation, and ML systems.
- `System Design` for architecture, scaling, reliability, and trade-offs.

## Frontmatter for New Notes

Start from [`templates/note.md`](../templates/note.md). New published notes should include:

```yaml
---
title: Binary Search Invariants
description: The decision rule and boundary handling behind binary search.
category: DSA
order: 10
status: wip
tags:
  - dsa
  - binary-search
---
```

Use `status: wip` while developing a note and `status: stable` once it is ready to rely on as a reference. Keep tags specific enough to support future navigation and discovery. `order` is optional; use it when notes in the same category need a deliberate reading sequence.
