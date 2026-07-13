# Mental Gym — Build technical fluency

A personal workspace for deliberate practice, first-principles implementation, and structured technical knowledge.

[![Deploy Docs](https://github.com/whanyu1212/mental-gym/actions/workflows/deploy-docs.yml/badge.svg)](https://github.com/whanyu1212/mental-gym/actions/workflows/deploy-docs.yml)
[![pre-commit](https://img.shields.io/badge/pre--commit-enabled-brightgreen?logo=pre-commit)](https://pre-commit.com)

**Site:** [whanyu1212.github.io/mental-gym](https://whanyu1212.github.io/mental-gym/)

Mental Gym supports a repeatable learning loop:

> **Learn → implement → practice → review → retain**

## Domains

| Domain | Practice | Knowledge |
| --- | --- | --- |
| DSA | `src/leetcode/` solutions and tests | `notes/` for patterns, complexity, and invariants |
| ML engineering | `src/ml/` from-scratch implementations | ML notes as the collection grows |
| System design | Design exercises and implementation trade-offs | System-design notes and case studies |

## Structure

```
.adal/skills/   # Project coaching skills
src/leetcode/   # LeetCode solutions (Python + Julia)
src/ml/         # NumPy-first ML implementations
notes/          # Technical knowledge notes; see notes/README.md
web/            # Astro site
scripts/        # Data generation and validation scripts
```

## Dev

```bash
cd web && npm run dev
```

To regenerate problem data from LeetCode:

```bash
poetry run python scripts/generate_problems.py
```
