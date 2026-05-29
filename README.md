# Mental Gym

Personal interview practice space — algorithms, ML coding, and system design.

[![Deploy Docs](https://github.com/whanyu1212/mental-gym/actions/workflows/deploy-docs.yml/badge.svg)](https://github.com/whanyu1212/mental-gym/actions/workflows/deploy-docs.yml)
[![pre-commit](https://img.shields.io/badge/pre--commit-enabled-brightgreen?logo=pre-commit)](https://pre-commit.com)

**Site:** [whanyu1212.github.io/mental-gym](https://whanyu121212.github.io/mental-gym/)

## Structure

```
src/leetcode/   # LeetCode solutions (Python + Julia)
src/ml/         # ML coding interview implementations
notes/          # Markdown notes (asymptotic analysis, time/space complexity)
web/            # Astro site
scripts/        # Data generation scripts
```

## Dev

```bash
cd web && npm run dev
```

To regenerate problem data from LeetCode:

```bash
poetry run python scripts/generate_problems.py
```
