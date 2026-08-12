# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server at localhost:4321
npm run build      # Build to ./dist/
npm run preview    # Preview the production build locally
npm run astro check  # Type-check .astro files
```

The site deploys to GitHub Pages at `https://whanyu1212.github.io/mental-gym`. The `base` path is set to `/mental-gym` in production and `""` in dev — all internal links must use relative paths or Astro's built-in `base`-aware helpers.

## Regenerating problems.ts

`src/data/problems.ts` is **auto-generated** — never edit it by hand. To regenerate after adding Python solutions:

```bash
# from repo root (mental-gym/), not web/
poetry run python scripts/generate_problems.py
```

The script reads `src/leetcode/<category>/<problem>.py`, fetches problem metadata from the LeetCode GraphQL API (with local cache in `scripts/leetcode_cache.json`), and writes `web/src/data/problems.ts`.

## Architecture

### Content sources

The site has four content sources that feed different pages:

| Source | How it's used |
|---|---|
| `src/data/problems.ts` | Auto-generated. Drives all algorithm problem pages via `getStaticPaths()`. |
| `src/data/mlProblems.ts` | Hand-authored. ML coding interview problems with prompts, hints, and follow-ups. |
| `src/data/sqlProblems.ts` | Hand-authored SQL exercise metadata. Each imports its reference answer from `src/sql/`. |
| `../notes/` (outside `web/`) | Markdown files collected via Astro content collections. Rendered with KaTeX math support. |

The notes loader globs `**/*.{md,mdx}`, so both extensions are valid. Use `.mdx` **only** when a note imports an Astro component (e.g. `arrays_and_hashing.mdx`, `two_pointers.mdx` embed the `notes/*Viz.astro` visualizations); keep prose-only notes as `.md` so they stay on the lighter Markdown pipeline. Frontmatter is identical for both: `title`, `description`, `category`, optional `order`.

### SQL practice

SQL answers live in `src/sql/`, next to deterministic fixtures and test harnesses:

- `<problem>.sql` is the reference answer rendered on the Astro site.
- `<problem>.fixture.sql` creates local test tables and data.
- `<problem>.test.sql` runs the fixture, then the answer.

PostgreSQL exercises run locally with Homebrew PostgreSQL 17 through `scripts/run_postgres_sql.sh`; SQLite exercises run with `sqlite3`. The PostgreSQL service must be started with `brew services start postgresql@17`. See `src/sql/README.md` for commands. Add a problem to `src/data/sqlProblems.ts`; the `/sql/[slug]` routes and Problems Bank SQL tab are generated from that data.

### Practice-flow authoring

Every algorithm page is an attempt-first learning loop: the problem statement is visible, but the guide, animation, and solution are opened by either saving an attempt or explicitly choosing **Study instead**. Attempt history is local-only and separate from spaced-repetition review ratings.

When adding an algorithm problem, add the Python solution and a complete entry in `src/data/algorithmGuides.ts`; CI runs `scripts/validate_algorithm_guides.py --strict`. Add a bespoke animation only when motion makes the invariant or state change materially clearer than a guide and worked test cases do.

The IndexedDB export format is versioned. Preserve all prior import versions when adding new local progress stores, and add migration plus export/import tests for the new version.

### Teaching motion framework

Each algorithm page can embed a step-by-step animation built on the `teaching-motion` system:

- **`src/components/framework/AlgorithmPlayer.astro`** — the core player. Accepts a `steps: TeachingStep[]` prop (serialized to `data-steps` JSON) and drives a custom element `<algo-player>`. Navigation (Prev/Next) renders one step at a time.
- **`src/lib/teaching/types.ts`** — defines `TeachingStep`. Each step can declare `exp` (explanation), `reason`, `invariant`, `formula`, `highlights`, and an optional `callout`.
- **`src/lib/teaching/highlight.ts`** — applies CSS classes (`teach-focus`, `teach-write`, `teach-discard`, etc.) to DOM elements matched by `data-teach-target` attribute. This is how individual cells/nodes get visually highlighted per step.
- **Individual animation components** (e.g. `TwoSumAnimation.astro`, `SortColorsAnimation.astro`) — each wraps `<AlgorithmPlayer>` with a hardcoded `steps` array and renders SVG/HTML visuals as the slot. The `data-teach-target` attributes on visual elements must match `target` strings in the step's `highlights` array.

To add a new animation: create `src/components/<ProblemName>Animation.astro`, define a `TeachingStep[]` array, wrap it in `<AlgorithmPlayer>`, render visuals in the slot, and register the slug in `[slug].astro`'s `animationBySlug` map.

### Spaced repetition (SR) system

Client-side only — no server. State is stored in **IndexedDB** (`mental-gym-sr` database, `reviews` object store):

- **`src/scripts/sr-types.ts`** — `ReviewRecord` shape. Each record tracks SM-2 fields: `easeFactor`, `interval`, `repetitions`, `dueDate`.
- **`src/scripts/sr-scheduler.ts`** — implements a simplified SM-2 algorithm. `schedule(record, quality)` takes a 0–3 rating (Again/Hard/Good/Easy) and returns an updated record with the next due date.
- **`src/scripts/sr-db.ts`** — IndexedDB wrapper: `getRecord`, `putRecord`, `getAllRecords`, plus import/export helpers.
- **`src/components/RecallRating.astro`** — the rating UI embedded in each problem page, writes to IndexedDB after user rates.
- **`src/components/DueForReview.astro`** — dashboard widget showing problems due today.

### Routing

| Route pattern | File | What it renders |
|---|---|---|
| `/` | `src/pages/index.astro` | Home dashboard with stats |
| `/problems` | `src/pages/problems/index.astro` | Problem list (tabs: algorithms / ML / SQL) |
| `/algorithms/[slug]` | `src/pages/algorithms/[slug].astro` | Individual algorithm problem + optional animation |
| `/machine-learning` | `src/pages/machine-learning/index.astro` | ML engineering landing page |
| `/machine-learning/[slug]` | `src/pages/machine-learning/[slug].astro` | ML problem with prompt/hints |
| `/sql/[slug]` | `src/pages/sql/[slug].astro` | SQL prompt, local runner command, and source-file answer |
| `/notes` | `src/pages/notes/index.astro` | Notes index |
| `/notes/[slug]` | `src/pages/notes/[slug].astro` | Individual note (markdown + KaTeX) |
| `/progress` | `src/pages/progress/index.astro` | Local SR dashboard (history, summary, import/export) |
| `/system-design` | `src/pages/system-design/index.astro` | ML/AI systems design landing page and lifecycle overview |
