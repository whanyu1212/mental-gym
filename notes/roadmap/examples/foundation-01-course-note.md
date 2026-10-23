---
title: Python, arrays, and complexity
description: Course note for foundation week 1 — CS229 prerequisites, hash-table solutions, and the complexity vocabulary the rest of the roadmap assumes.
category: Machine Learning
order: 1
status: stable
kind: course
courseId: stanford-cs229-2022
moduleId: foundation-01-python-and-complexity
sourceUrl: https://cs229.stanford.edu/
relatedExercises:
  - domain: note
    slug: python-dsa-toolkit
  - domain: note
    slug: asymptotic-analysis
  - domain: algorithm
    slug: 1-two-sum
  - domain: algorithm
    slug: 217-contains-duplicate
tags:
  - roadmap
  - python
  - complexity
---

# Python, arrays, and complexity

Labeled example of a **course note** linked to a roadmap module. It is authored teaching copy, not a private journal and not proof that the week was completed.

## Module

- Track and week: any path, shared foundation week 1 (`foundation-01-python-and-complexity`)
- Course and offering: CS229, Autumn 2022 public materials
- What this week is for: enough Python and complexity vocabulary to implement two hash-table solutions and explain their cost without looking the answers up.

## What I studied

- CS229 public notes: prerequisites and linear-model notation, only as far as “arrays, indices, and shapes show up again in week 4.”
- Site notes listed in `relatedExercises`: Python DSA toolkit and asymptotic analysis.

## Related practice

- Two Sum and Contains Duplicate: one pass with a set or map, then state time and extra space.
- The toolkit note is for choosing the Python collection; the analysis note is for saying why that choice is O(n).

## What I can explain without notes

- Why a hash set turns “have I seen this value?” into expected O(1), and when that still uses O(n) extra space.
- The difference between the problem’s input size and the size of the hash table you allocated.

## Open questions

- Whether a TypeScript port of one of the two exercises is worth the language-practice block this week, or whether that waits until a later TS sequence.
