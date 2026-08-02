# Mental Gym

[![Deploy Docs](https://github.com/whanyu1212/mental-gym/actions/workflows/deploy-docs.yml/badge.svg)](https://github.com/whanyu1212/mental-gym/actions/workflows/deploy-docs.yml)
[![Run Tests](https://github.com/whanyu1212/mental-gym/actions/workflows/test.yml/badge.svg)](https://github.com/whanyu1212/mental-gym/actions/workflows/test.yml)
[![pre-commit](https://img.shields.io/badge/pre--commit-enabled-brightgreen?logo=pre-commit)](https://pre-commit.com)

A structured practice system for technical interview preparation and first-principles engineering study — algorithms, ML implementations, SQL, and system design, backed by a spaced-repetition review loop and a custom Astro site.

**Live site:** [whanyu1212.github.io/mental-gym](https://whanyu1212.github.io/mental-gym/)

## Why this exists

Most interview prep is either flashcards with no depth, or solved problems that are never revisited and quietly forgotten. Mental Gym is built around one loop instead:

> **Learn the pattern → implement it from scratch → solve the problem → review on a schedule → retain it**

Every problem is solved with an explicit invariant and complexity justification, not just a passing test. Every review is scheduled with a simplified SM-2 algorithm rather than left to chance.

## What's in it

| Area | Scope | Where |
| --- | --- | --- |
| DSA (LeetCode) | 44 solved problems across Arrays & Hashing, Two Pointers, Sliding Window, and Stack, each with a Python solution and most with a Julia port | `src/leetcode/` |
| Competitive programming (Kattis) | 28 solved problems with pytest coverage | `src/kattis/`, `tests/kattis/` |
| ML from scratch | NumPy-only implementations (e.g. logistic regression with vectorized forward pass, BCE loss, gradient descent) — no framework shortcuts | `src/ml/` |
| SQL practice | PostgreSQL and SQLite exercises with fixtures, reference answers, and deterministic test harnesses | `src/sql/` |
| Technical notes | 15 long-form guides on complexity analysis, algorithmic patterns, ML foundations, and system design, rendered with KaTeX math support | `notes/` |
| Pattern references | Reusable algorithmic templates independent of any single problem | `src/patterns/` |

## The practice site

The `web/` directory is a hand-built Astro site — not a generic doc generator — purpose-built for this workflow:

- **Auto-generated problem pages.** `scripts/generate_problems.py` pulls problem metadata (title, difficulty, tags, description) live from the LeetCode GraphQL API and pairs it with the local solution, so the write-up is never hand-copied or allowed to drift from the source.
- **Spaced repetition.** A simplified SM-2 scheduler tracks per-problem review state client-side (IndexedDB) and surfaces what's due today.
- **Step-by-step algorithm animations.** A custom teaching-motion framework drives problem-specific visualizations (e.g. two-pointer convergence, sliding-window expansion) tied to named steps in the solution's logic, not generic transitions.
- **A unified design system.** One token-driven `.prose` layer and consistent glass-morphism components across all four content surfaces (algorithms, ML, SQL, notes).

See [`web/README.md`](web/README.md) for the site's architecture and local dev instructions.

## Repository structure

```text
src/
├── leetcode/         # LeetCode solutions (Python + Julia), organized by pattern
├── kattis/           # Kattis competitive-programming solutions (Python + Julia)
├── ml/               # NumPy-first ML implementations
├── sql/              # SQL exercises: answers, fixtures, test harnesses
├── patterns/         # Reusable algorithmic pattern templates
└── dsa_from_scratch/ # Core data structures implemented without stdlib shortcuts

notes/                # Technical knowledge notes — see notes/README.md
web/                  # Astro practice site (problems, notes, spaced repetition)
scripts/              # Problem-data generation and content validation
tests/                # pytest (Kattis) and Julia test suites
.github/workflows/    # CI: test suite + GitHub Pages deploy
```

## Development

**Python (solutions, scripts, tests):**

```bash
poetry install
poetry run pytest tests/kattis/ -v
```

**Astro site:**

```bash
cd web && npm install && npm run dev
```

**Regenerate problem data** after adding or editing a LeetCode solution:

```bash
poetry run python scripts/generate_problems.py
```

**Julia solutions and tests** run via `julia --project=.`; see `Project.toml`.

## CI

Two GitHub Actions workflows run on every push/PR: a test workflow (`pytest` over the Kattis suite, a guide-content validator, and the Julia test suite) and a deploy workflow that builds and publishes the Astro site to GitHub Pages on pushes to `develop` and `main`.

## Tooling

Python code is enforced with `black`, `isort`, `flake8`, and `docformatter` (Google-style docstrings) via pre-commit hooks. The Astro site is TypeScript-checked with `astro check`.
