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

New published notes should include frontmatter like this:

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

## Note Outline

Copy and adapt this outline for a new note:

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
