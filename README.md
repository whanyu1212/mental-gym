# Mental Gym

[![Deploy Docs](https://github.com/whanyu1212/mental-gym/actions/workflows/deploy-docs.yml/badge.svg)](https://github.com/whanyu1212/mental-gym/actions/workflows/deploy-docs.yml)
[![Run Tests](https://github.com/whanyu1212/mental-gym/actions/workflows/test.yml/badge.svg)](https://github.com/whanyu1212/mental-gym/actions/workflows/test.yml)
[![pre-commit](https://img.shields.io/badge/pre--commit-enabled-brightgreen?logo=pre-commit)](https://pre-commit.com)

A structured practice system for technical interview preparation and first-principles engineering study — algorithms, ML implementations, SQL, and system design, backed by a spaced-repetition review loop and a custom Astro site.

**Live site:** [whanyu1212.github.io/mental-gym](https://whanyu1212.github.io/mental-gym/)

## Why this exists

Most interview prep is either flashcards with no depth, or solved problems that are never revisited and quietly forgotten. Mental Gym is built around one loop instead:

> **Learn the pattern → implement it from scratch → solve the problem → review on a schedule → retain it**

Most problems are solved with an explicit invariant and complexity justification, not just a passing test — a guide-content validator (`scripts/validate_algorithm_guides.py`) checks this, and currently flags a handful of recent additions still missing one. Every review is scheduled with a simplified SM-2 algorithm rather than left to chance.

## What's in it

| Area | Scope | Where |
| --- | --- | --- |
| DSA (LeetCode) | 43 unique solved problems across Arrays & Hashing, Two Pointers, Sliding Window, and Stack, each with a Python solution covered by pytest in CI; 16 also have a Julia port; TypeScript ports start from the repo-root Bun project | `src/leetcode/`, `tests/leetcode/` |
| Competitive programming (Kattis) | 26 unique solved problems (25 Python, 1 Julia-only), every Python solution covered by pytest in CI against the official Kattis samples | `src/kattis/`, `tests/kattis/` |
| ML from scratch | A NumPy-only logistic regression implementation (vectorized forward pass, gradient descent) — no framework shortcuts | `src/ml/` |
| SQL practice | PostgreSQL and SQLite exercises with fixtures, reference answers, and deterministic test harnesses | `src/sql/` |
| Technical notes | 16 long-form guides on complexity analysis, algorithmic patterns, ML foundations, and system design, rendered with KaTeX math support | `notes/` |
| DSA from scratch | Data structures and reusable algorithmic pattern templates (prefix sum, Kadane, sliding window, three pointers, backtracking), grouped by topic | `src/dsa_from_scratch/python/` |

## How to study a topic

Each DSA topic follows the same loop. Pick a row and work left to right:

1. **Read the note** for the core idea, the invariant, and when the pattern applies.
2. **Implement it from scratch** without looking, then compare against the reference.
3. **Solve the problems** on the site. Each problem page shows the invariant and complexity; most (38 of 47) also have a step-by-step animation.
4. **Check yourself** with the tests, then let spaced repetition schedule the review.

| Topic | 1. Note | 2. From scratch | 3. Problems | 4. Tests |
| --- | --- | --- | --- | --- |
| Arrays & Hashing | [Arrays & Hashing](https://whanyu1212.github.io/mental-gym/notes/arrays_and_hashing/) · [Prefix Sum](https://whanyu1212.github.io/mental-gym/notes/prefix_sum_pattern/) · [Kadane's Algorithm](https://whanyu1212.github.io/mental-gym/notes/kadane_algorithm/) | [`arrays/`](src/dsa_from_scratch/python/arrays/) · [`hash_map/`](src/dsa_from_scratch/python/hash_map/) | [22 problems](https://whanyu1212.github.io/mental-gym/problems/#algo-arrays-hashing) · [`src`](src/leetcode/arrays_hashing/) | [`test_arrays_hashing.py`](tests/leetcode/test_arrays_hashing.py) |
| Two Pointers | [Two Pointers](https://whanyu1212.github.io/mental-gym/notes/two_pointers/) | [`two_pointers/`](src/dsa_from_scratch/python/two_pointers/) · [`three_pointers/`](src/dsa_from_scratch/python/three_pointers/) (three-way partition) | [14 problems](https://whanyu1212.github.io/mental-gym/problems/#algo-two-pointers) · [`src`](src/leetcode/two_pointers/) | [`test_two_pointers.py`](tests/leetcode/test_two_pointers.py) |
| Sliding Window | [Sliding Window](https://whanyu1212.github.io/mental-gym/notes/sliding_window/) | [`sliding_window/`](src/dsa_from_scratch/python/sliding_window/) | [5 problems](https://whanyu1212.github.io/mental-gym/problems/#algo-sliding-window) · [`src`](src/leetcode/sliding_window/) | [`test_sliding_window.py`](tests/leetcode/test_sliding_window.py) |
| Stack | [Stack](https://whanyu1212.github.io/mental-gym/notes/stack/) | [`list_adt/`](src/dsa_from_scratch/python/list_adt/) (stacks, queues, linked lists) | [6 problems](https://whanyu1212.github.io/mental-gym/problems/#algo-stack) · [`src`](src/leetcode/stack/) | [`test_stack.py`](tests/leetcode/test_stack.py) |

**Before any topic**, the foundations apply everywhere: [Asymptotic Analysis](https://whanyu1212.github.io/mental-gym/notes/asymptotic-analysis/), [Time Complexity](https://whanyu1212.github.io/mental-gym/notes/time-complexity/), and [Space Complexity](https://whanyu1212.github.io/mental-gym/notes/space-complexity/). Keep the [Python DSA Quick Reference](https://whanyu1212.github.io/mental-gym/notes/python-dsa-toolkit/) open while solving.

**Other areas** follow the same shape: [Logistic Regression from Scratch](https://whanyu1212.github.io/mental-gym/notes/ml-logistic-regression/) pairs with [`src/ml/`](src/ml/), and the [Real-Time ML Inference](https://whanyu1212.github.io/mental-gym/notes/sd-real-time-ml-inference/) case study is the system-design entry point. Topics with a from-scratch implementation but no problems yet (graphs, heaps, sorting, binary search, DP, and more) live under [`src/dsa_from_scratch/python/`](src/dsa_from_scratch/python/).

## The practice site

The `web/` directory is a hand-built Astro site — not a generic doc generator — purpose-built for this workflow:

- **Auto-generated problem pages.** `scripts/generate_problems.py` fetches problem metadata (title, difficulty, tags, description) from the LeetCode GraphQL API and pairs it with the local solution, so the write-up is never hand-copied. Fetches are cached (`scripts/leetcode_cache.json`); re-running the generator picks up new problems but won't refresh metadata already cached for an existing one.
- **Spaced repetition.** A simplified SM-2 scheduler tracks per-problem review state client-side (IndexedDB) and surfaces what's due today.
- **Step-by-step algorithm animations.** A custom teaching-motion framework drives problem-specific visualizations (e.g. two-pointer convergence, sliding-window expansion) tied to named steps in the solution's logic, not generic transitions.
- **A shared design system.** A token-driven `.prose` layer and consistent glass-morphism components across the algorithm and notes pages, which carry most of the site's long-form content.

See [`web/README.md`](web/README.md) for the site's architecture and local dev instructions.

## Repository structure

```text
src/
├── leetcode/         # LeetCode solutions (Python + Julia), organized by pattern
├── kattis/           # Kattis competitive-programming solutions (Python + Julia)
├── ml/               # NumPy-first ML implementations
├── sql/              # SQL exercises: answers, fixtures, test harnesses
└── dsa_from_scratch/ # Data structures and pattern templates, by topic

notes/                # Technical notes by topic (foundations, patterns, toolkits, ml, …) — see notes/README.md
web/                  # Astro practice site (problems, notes, spaced repetition)
scripts/              # Problem-data generation and content validation
tests/                # pytest (LeetCode, Kattis) and Julia test suites
.github/workflows/    # CI: test suite + GitHub Pages deploy
```

## Development

**Python (solutions, scripts, tests):**

```bash
poetry install
poetry run pytest tests/ -v
```

**Astro site:**

```bash
cd web && npm install && npm run dev
```

**Regenerate problem data** after adding or editing a Python LeetCode solution (the generator collects `.py` files only; a Julia-only addition needs a matching Python file before it will appear):

```bash
poetry run python scripts/generate_problems.py
```

**Julia solutions and tests** run via `julia --project=.`; see `Project.toml`.

**TypeScript LeetCode ports** (repo root, separate from `web/`):

```bash
bun install
bun src/leetcode/sliding_window/contains_duplicate_2.ts
```

## CI

Two GitHub Actions workflows: a test workflow (`pytest` over the LeetCode and Kattis suites, a guide-content validator, and the Julia test suite) runs on pushes to `main`/`hy-dev` and on PRs targeting `main`; a deploy workflow builds and publishes the Astro site to GitHub Pages on pushes to `develop` and `main`. Note the gap — a push straight to `develop` deploys without the test workflow running.

## Tooling

Python code is enforced with `ruff` (linting, import sorting, and formatting) and `docformatter` (docstring formatting and wrapping) via pre-commit hooks. The Astro site is TypeScript-checked with `astro check`.
