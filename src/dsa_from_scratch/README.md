# DSA from scratch

Use the same **topic → language → implementation** layout as LeetCode:

```text
dsa_from_scratch/
├── Cargo.toml               # One crate for all from-scratch Rust implementations
├── Cargo.lock
├── lib.rs                   # Registers Rust topic modules
├── arrays/
│   ├── python/
│   │   ├── common_operations.py
│   │   ├── kadane.py
│   │   └── prefix_sum.py
│   └── rust/
│       ├── mod.rs
│       └── common_operations.rs
├── graph/python/
├── hash_map/python/
├── list_adt/python/
├── sorting/python/
├── two_pointers/python/
└── ...
```

Existing topic names and implementation files are preserved. Create `julia/`,
`typescript/`, or `rust/` directories under a topic when adding that language;
do not recreate a top-level language directory.

Run a Python implementation from the repository root:

```bash
uv run python src/dsa_from_scratch/arrays/python/common_operations.py
uv run --locked pytest tests/dsa_from_scratch/
```

Python tests stay in `tests/dsa_from_scratch/`. Add a topic's `python/` directory
to pytest's `pythonpath` in `pyproject.toml` when its tests use direct imports.

## Rust

All from-scratch Rust implementations share this directory's Cargo crate. The
existing array operations and their 17 unit tests live in
`arrays/rust/common_operations.rs`; the `rand` dependency and its locked version
are retained. LeetCode has a separate crate at `src/leetcode/Cargo.toml`.

For a new implementation, add its file to `<topic>/rust/` and declare it in that
directory's `mod.rs`, such as `pub mod prefix_sum;`. Keep its unit tests in a
`#[cfg(test)]` module beside the implementation. A new Rust topic also needs a
declaration in the crate's `lib.rs`:

```rust
#[path = "sorting/rust/mod.rs"]
pub mod sorting;
```

Run from the repository root:

```bash
cargo test --locked --manifest-path src/dsa_from_scratch/Cargo.toml
cargo fmt --manifest-path src/dsa_from_scratch/Cargo.toml --check
cargo clean --manifest-path src/dsa_from_scratch/Cargo.toml
```

The LeetCode problem generator does not scan this directory: these are reusable
data structures and algorithm templates, not problem-page solutions.
