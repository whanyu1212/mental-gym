# Mental Gym — Practice Site

The Astro site that powers [whanyu1212.github.io/mental-gym](https://whanyu1212.github.io/mental-gym/): problem pages, technical notes, and a spaced-repetition review loop for the solutions in [`../src/leetcode/`](../src/leetcode/), [`../src/sql/`](../src/sql/), and the ML track.

## Quick start

Use Node 24 (`nvm use` from the repository root) and Bun 1.3.11. Bun installs the shared workspace dependencies; Astro and the web tests run on Node. All commands below start from the repository root.

```bash
bun install                  # from the repository root
bun run --cwd web dev        # http://localhost:4321
```

```bash
bun run --cwd web build        # production build to ./dist/
bun run --cwd web preview      # preview the production build locally
bun run --cwd web astro check  # type-check .astro files
```

The tests compare teaching animations with Python reference solutions, so they also require uv on PATH:

```bash
uv sync --locked
bun run web:test
```

## What lives here

| Route | Source | Notes |
| --- | --- | --- |
| `/problems` | `src/data/problems.ts`, `mlProblems.ts`, `sqlProblems.ts` | Tabbed bank across algorithms, ML, and SQL |
| `/algorithms/[slug]` | `src/data/problems.ts` + `../src/leetcode/` | Auto-generated from the LeetCode API, paired with the local solution; some problems include a step-by-step animation |
| `/machine-learning/[slug]` | `src/data/mlProblems.ts` | Hand-authored ML interview prompts and hints |
| `/sql/[slug]` | `src/data/sqlProblems.ts` + `../src/sql/` | Prompt, local runner command, and reference answer |
| `/learn/` and `/learn/[language]/` | `src/data/learningTracks.ts` | Four ordered language tracks, current resources, and clearly labeled upcoming lessons |
| `/notes/` | `../notes/` | Full library; language tags drive the shareable `?language=python` filter (also Julia, TypeScript, Rust) |
| `/notes/[slug]` | `../notes/` | Markdown/MDX notes with KaTeX math support. Optional `kind` / `courseId` / `moduleId` link a note to the roadmap; `kind: template` outlines stay out of the main list. See [`../notes/README.md`](../notes/README.md). |

`problems.ts` is **auto-generated** — never edit it by hand. After adding or changing a solution in `../src/leetcode/<topic>/<language>/`, regenerate it from the repo root. Python, Julia, TypeScript, and Rust implementations are joined by canonical LeetCode slug; a problem does not need a Python counterpart. Solution tabs show only available languages. See [`../src/leetcode/README.md`](../src/leetcode/README.md) for naming and module conventions.

```bash
uv run python scripts/generate_problems.py
```

## Spaced repetition

Review scheduling runs entirely client-side: a simplified SM-2 algorithm (`src/scripts/sr-scheduler.ts`) tracks per-problem review state in IndexedDB and the home dashboard surfaces what's due. No backend, no accounts — state lives in the browser it was created in.

## Active practice

Algorithm pages begin with an **attempt-first** panel. Before opening a guide, animation, or solution, start a timer, make a pattern/invariant/approach guess, and save a short self-report on the outcome, support used, confidence, and the part that caused trouble. Those attempt events are separate from later spaced-repetition ratings: attempts describe first-pass problem solving; reviews describe later recall.

Progress stays private in IndexedDB, now with portable review records, highlights, and attempt history. The site offers JSON export/import and warns when new local activity has not been backed up recently. Export before changing browsers or clearing browser data.

## Architecture notes

Deeper implementation details — the teaching-motion animation framework, SQL fixture/test harness conventions, the SR IndexedDB schema, and full routing table — are documented in [`CLAUDE.md`](CLAUDE.md).

## Deployment

Pushes to `develop` and `main` trigger `.github/workflows/deploy-docs.yml`, which builds this site and publishes it to GitHub Pages. The `base` path is `/mental-gym` in production and empty in dev, so internal links must use relative paths or the `withBase` helper in `src/lib/url.ts`.
