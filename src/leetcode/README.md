# LeetCode solutions

Organize solutions as **topic → language → problem**:

```text
leetcode/
├── Cargo.toml             # One crate for all LeetCode Rust solutions
├── Cargo.lock
├── lib.rs                 # Registers each topic's Rust module
├── arrays_hashing/
│   ├── python/two_sum.py
│   ├── julia/TwoSum.jl
│   └── rust/mod.rs
├── sliding_window/
│   ├── python/contains_duplicate_2.py
│   ├── julia/MaxProfit.jl
│   ├── typescript/contains_duplicate_2.ts
│   └── rust/mod.rs
├── stack/
└── two_pointers/
```

Create language directories as needed. Existing filenames and topic assignments
are preserved; implementations of the same problem are joined by their canonical
LeetCode slug, even when legacy ports live in different topics.

## Add a problem

1. Put one solution file directly in `<topic>/<language>/`. Supported languages
   are `python` (`.py`), `julia` (`.jl`), `typescript` (`.ts`), and `rust` (`.rs`).
2. Prefer the official slug converted to snake_case, such as
   `contains_duplicate_ii.rs`. Legacy CamelCase filenames also work. Add an
   entry to `SLUG_OVERRIDES` in `scripts/generate_problems.py` when a filename
   does not map directly to the official slug.
3. Add tests: Python and Julia suites live in `tests/leetcode/`; Rust unit tests
   live alongside their implementations. Finish practice TODOs before publishing.
4. When publishing, regenerate `web/src/data/problems.ts` from the repo root:
   `uv run python scripts/generate_problems.py`. No Python counterpart is needed
   for a Julia-, TypeScript-, or Rust-only problem. Add the teaching guide in
   `web/src/data/algorithmGuides.ts`; strict CI checks every published problem.

The generator ignores module files (`__init__`, `mod`, `lib`, `main`), review
attempts (`*_review`), and test files (`test_*`, `*.test.ts`, `*.spec.ts`). Keep
shared helpers in a nested directory so they are not mistaken for problems.
Duplicate implementations in one language are resolved deterministically: prefer
the problem's canonical topic, then the first sorted path. The generator reports
duplicates instead of deleting files.

For a new topic, add its display name to `CATEGORY_TITLE_MAP`. For Python, add
`src/leetcode/<topic>/python` to pytest's `pythonpath` in `pyproject.toml`.

## Rust module wiring

The crate is intentionally empty of solutions until you write them. For example,
after creating `arrays_hashing/rust/two_sum.rs`, register it in
`arrays_hashing/rust/mod.rs`:

```rust
pub mod two_sum;
```

A new topic also needs a module declaration in `lib.rs`:

```rust
#[path = "binary_search/rust/mod.rs"]
pub mod binary_search;
```

Run from the repository root:

```bash
cargo test --locked --manifest-path src/leetcode/Cargo.toml
cargo fmt --manifest-path src/leetcode/Cargo.toml --check
cargo clean --manifest-path src/leetcode/Cargo.toml
```

There is no per-problem Cargo project. The from-scratch implementations share a
separate crate under `src/dsa_from_scratch/`.
