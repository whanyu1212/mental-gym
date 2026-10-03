@AGENTS.md

# Claude notes for Mental Gym

This repo is the user's practice workspace and knowledge base. Coaching behaviour (what to practise, logging, hints) comes from the global `coach` skill; this file covers repo conventions only.

## LeetCode problems (`src/leetcode/`)

- One file per problem: `src/leetcode/<pattern_folder>/<language>/<problem>.<extension>`. Languages: `python`, `julia`, `typescript`, `rust`. Existing topics: `arrays_hashing`, `two_pointers`, `sliding_window`, `stack`; see `src/leetcode/README.md`.
- Python format (see `src/leetcode/sliding_window/python/subarrays_with_avg_geq_threshold.py`): a `Solution` class with a typed LeetCode signature and a Google-style docstring, then an `if __name__ == "__main__":` block that prints each test case with `# Expected: ...` above it. Python is the default practice language, not a publication requirement.
- Practice drills leave the insight-bearing lines as `# TODO` for the user to write; don't fill them in unless asked.
- Review attempts go in `<snake_case_name>_review.py` next to the original and are deleted afterwards unless the user wants them kept.
- Run a Python problem with `uv run python src/leetcode/<folder>/python/<file>.py`.
- Rust solutions share `src/leetcode/Cargo.toml`; register each in its topic's `rust/mod.rs` and keep unit tests in the problem file. Run `cargo test --locked --manifest-path src/leetcode/Cargo.toml`.
- Every finished Python solution is covered by pytest in CI (see `README.md`): add parametrized cases for it to `tests/leetcode/test_<folder>.py`, following the existing modules, and run `uv run pytest tests/leetcode`. Add the tests once the solution is complete, not while it still has a `# TODO` drill, and don't commit `_review.py` files.

### Adding a new pattern folder

When the first problem in a new pattern arrives (e.g. `binary_search`, `linked_list`, `trees`):
1. Add the folder to `CATEGORY_TITLE_MAP` in `scripts/generate_problems.py`.
2. Add its `python/` subfolder to `pythonpath` under `[tool.pytest.ini_options]` in `pyproject.toml` if adding Python solutions; register a new Rust topic in `src/leetcode/lib.rs` if adding Rust solutions.
3. Create `tests/leetcode/test_<folder>.py` with test cases for the new problem, so CI actually exercises it.

## DSA from scratch (`src/dsa_from_scratch/`)

- Use `src/dsa_from_scratch/<topic>/<language>/<implementation>.<extension>`, matching the LeetCode layout; create language folders as needed.
- Python tests remain in `tests/dsa_from_scratch/`; add the relevant `<topic>/python` path to pytest's `pythonpath` when using direct imports.
- All Rust implementations share `src/dsa_from_scratch/Cargo.toml`. Register a topic in `lib.rs` and its implementation files in `<topic>/rust/mod.rs`; keep unit tests beside the implementation.
- Run `cargo test --locked --manifest-path src/dsa_from_scratch/Cargo.toml`; clean build output afterwards. See `src/dsa_from_scratch/README.md`.
- These reusable templates are not scanned by `scripts/generate_problems.py`.

## Publishing a solved problem to the site (only when the user asks)

A problem addition usually touches:
- `web/src/data/problems.ts` — regenerate with `uv run python scripts/generate_problems.py` (add a slug override in that script if the file stem doesn't map to the LeetCode slug).
- `web/src/data/algorithmGuides.ts` — the teaching guide entry.
- `notes/patterns/<pattern>.mdx` — the pattern note, if the problem adds a new sub-pattern.
- Optionally an animation component in `web/src/components/`.

The root Bun workspace manages site dependencies. Run site commands from the repository root: `bun run --cwd web dev`, `bun run --cwd web build`, `bun run --cwd web test`.

## Notes (`notes/`)

Published teaching content, not a personal log. Don't put attempt history, hours or progress in `notes/` (see `notes/templates/weekly-review.md`); the practice log lives with the coach skill.
