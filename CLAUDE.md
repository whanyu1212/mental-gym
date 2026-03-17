# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Python (Poetry)
```bash
poetry install                                    # install dependencies
poetry run python scripts/generate_problems.py   # regenerate web/src/data/problems.ts from LeetCode API
poetry run pytest                                 # run all tests
poetry run pytest src/leetcode/arrays_hashing/   # run tests in a specific folder
```

Python formatting is enforced via pre-commit: black (line length 89, no string normalisation), isort (black profile), flake8 (max 89, ignore E203/W503), docformatter.

### Astro site (Node ≥ 22)
```bash
# Node version — must use 22+
source ~/.nvm/nvm.sh && nvm use 22

cd web
npm run dev       # dev server at http://localhost:4321/mental-gym/
npm run build     # production build to web/dist/
npm run preview   # preview built output
```

## Architecture

### Repository layout
```
src/leetcode/          # LeetCode solutions grouped by topic (arrays_hashing, two_pointers, etc.)
src/ml/                # ML coding interview implementations (Python)
notes/                 # Markdown source for concept notes (loaded by Astro content collections)
web/                   # Astro 6 static site
scripts/               # Data generation scripts
```

### Data pipeline
`web/src/data/problems.ts` is **auto-generated** — never edit it by hand.

Run `poetry run python scripts/generate_problems.py` to regenerate it. The script:
1. Walks `src/leetcode/` for Python files, maps filenames → LeetCode slugs via `SLUG_OVERRIDES`
2. Fetches problem metadata and HTML description from the LeetCode GraphQL API (`https://leetcode.com/graphql`) with caching to `scripts/leetcode_cache.json`
3. Cross-matches Julia solutions by normalised filename
4. Writes the full `problems.ts` export

ML problems live in `web/src/data/mlProblems.ts` — this one is **hand-authored**. Each entry has `prompt`, `expectations`, `hints`, `followUps`, `solution?.python`, and a `status` field (`"Placeholder" | "Completed"`).

### Astro site structure
- `web/src/pages/index.astro` — landing page (domain tiles, stats, topic lists, notes)
- `web/src/pages/problems/index.astro` — tabbed hub: Algorithms | Machine Learning | System Design
- `web/src/pages/algorithms/[slug].astro` — LeetCode problem detail (uses `problems.ts`)
- `web/src/pages/machine-learning/[slug].astro` — ML problem detail (uses `mlProblems.ts`)
- `web/src/pages/notes/[slug].astro` — renders markdown notes with KaTeX + Chart.js
- `web/src/layouts/Layout.astro` — shared layout, CSS variables, nav (Home | Problems | Notes)
- `web/src/content.config.ts` — Astro content collection pointing at `../notes/*.md`

### Notes content
Markdown files live at `notes/` (repo root, outside `web/`). The content collection glob is scoped to `{asymptotic-analysis,time-complexity,space-complexity}.md` — add new filenames to this pattern in `web/src/content.config.ts` to surface them on the site.

### Base path
The site is deployed to `https://whanyu1212.github.io/mental-gym/`. `astro.config.mjs` sets `base: '/mental-gym'` — all internal `href` values must be root-relative (Astro handles prefixing automatically, but be careful with hardcoded strings).

### Styling
All colours and fonts are CSS custom properties defined in `Layout.astro`:
- Gold accent: `--accent: #c9a84c`
- Background: `--bg: #0e0e0e`, panel: `--panel: #161616`
- Fonts: `--font-serif` (Cormorant Garamond), `--font-sans` (Inter), `--font-mono`

### Deployment
Push to `develop` or `main` triggers `.github/workflows/deploy-docs.yml`, which runs `generate_problems.py` then builds and deploys the Astro site to GitHub Pages.
