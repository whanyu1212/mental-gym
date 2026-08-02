# Mental Gym — Practice Site

The Astro site that powers [whanyu1212.github.io/mental-gym](https://whanyu1212.github.io/mental-gym/): problem pages, technical notes, and a spaced-repetition review loop for the solutions in [`../src/leetcode/`](../src/leetcode/), [`../src/sql/`](../src/sql/), and the ML track.

## Quick start

```bash
npm install
npm run dev        # http://localhost:4321
```

```bash
npm run build      # production build to ./dist/
npm run preview    # preview the production build locally
npm run astro check  # type-check .astro files
```

## What lives here

| Route | Source | Notes |
| --- | --- | --- |
| `/problems` | `src/data/problems.ts`, `mlProblems.ts`, `sqlProblems.ts` | Tabbed bank across algorithms, ML, and SQL |
| `/algorithms/[slug]` | `src/data/problems.ts` + `src/leetcode/` | Auto-generated from the LeetCode API, paired with the local solution; some problems include a step-by-step animation |
| `/machine-learning/[slug]` | `src/data/mlProblems.ts` | Hand-authored ML interview prompts and hints |
| `/sql/[slug]` | `src/data/sqlProblems.ts` + `src/sql/` | Prompt, local runner command, and reference answer |
| `/notes/[slug]` | `../notes/` | Markdown/MDX notes with KaTeX math support |

`problems.ts` is **auto-generated** — never edit it by hand. After adding or changing a solution in `src/leetcode/`, regenerate it from the repo root:

```bash
poetry run python scripts/generate_problems.py
```

## Spaced repetition

Review scheduling runs entirely client-side: a simplified SM-2 algorithm (`src/scripts/sr-scheduler.ts`) tracks per-problem review state in IndexedDB and the home dashboard surfaces what's due. No backend, no accounts — state lives in the browser it was created in.

## Architecture notes

Deeper implementation details — the teaching-motion animation framework, SQL fixture/test harness conventions, the SR IndexedDB schema, and full routing table — are documented in [`CLAUDE.md`](CLAUDE.md).

## Deployment

Pushes to `develop` and `main` trigger `.github/workflows/deploy-docs.yml`, which builds this site and publishes it to GitHub Pages. The `base` path is `/mental-gym` in production and empty in dev, so internal links must use relative paths or the `withBase` helper in `src/lib/url.ts`.
