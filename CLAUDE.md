@AGENTS.md

# Claude notes for Mental Gym

This repo is the user's practice workspace and knowledge base. Coaching behaviour (what to practise, logging, hints) comes from the global `coach` skill; this file covers repo conventions only.

## LeetCode problems (`src/leetcode/`)

- One file per problem: `src/leetcode/<pattern_folder>/<snake_case_name>.py`. Existing folders: `arrays_hashing`, `two_pointers`, `sliding_window`, `stack`.
- Format (see `src/leetcode/sliding_window/subarrays_with_avg_geq_threshold.py`): a `Solution` class with a typed LeetCode signature and a Google-style docstring, then an `if __name__ == "__main__":` block that prints each test case with `# Expected: ...` above it. Python is the default language.
- Practice drills leave the insight-bearing lines as `# TODO` for the user to write; don't fill them in unless asked.
- Review attempts go in `<snake_case_name>_review.py` next to the original and are deleted afterwards unless the user wants them kept.
- Run a problem with `poetry run python src/leetcode/<folder>/<file>.py`.
- Every finished solution is covered by pytest in CI (see `README.md`): add parametrized cases for it to `tests/leetcode/test_<folder>.py`, following the existing modules, and run `poetry run pytest tests/leetcode`. Add the tests once the solution is complete, not while it still has a `# TODO` drill, and don't commit `_review.py` files.

### Adding a new pattern folder

When the first problem in a new pattern arrives (e.g. `binary_search`, `linked_list`, `trees`):
1. Add the folder to `CATEGORY_TITLE_MAP` in `scripts/generate_problems.py`.
2. Add it to `pythonpath` under `[tool.pytest.ini_options]` in `pyproject.toml`.
3. Create `tests/leetcode/test_<folder>.py` with test cases for the new problem, so CI actually exercises it.

## Publishing a solved problem to the site (only when the user asks)

A problem addition usually touches:
- `web/src/data/problems.ts` — regenerate with `poetry run python scripts/generate_problems.py` (add a slug override in that script if the file stem doesn't map to the LeetCode slug).
- `web/src/data/algorithmGuides.ts` — the teaching guide entry.
- `notes/patterns/<pattern>.mdx` — the pattern note, if the problem adds a new sub-pattern.
- Optionally an animation component in `web/src/components/`.

Site commands run from `web/` with npm (CI uses `npm ci`): `npm run dev`, `npm run build`, `npm run test`.

## Notes (`notes/`)

Published teaching content, not a personal log. Don't put attempt history, hours or progress in `notes/` (see `notes/templates/weekly-review.md`); the practice log lives with the coach skill.
