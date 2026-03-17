# Mental Gym Context

## Project Overview

Mental Gym is a comprehensive workspace for practicing Data Structures and Algorithms (DSA), preparing for technical interviews, and solving LeetCode and Kattis challenges. It serves as a personal repository of code implementations, study notes, and a web interface for interacting with the content.

The project is highly polyglot, emphasizing solutions across multiple languages including **Python**, **Julia**, and **Rust**.

### Architecture & Directory Structure

- `src/`: The core implementations, organized into subdirectories:
  - `dsa_from_scratch/`: Fundamental data structures and algorithms built from scratch.
  - `leetcode/`: LeetCode problem solutions categorized by topic (e.g., `arrays_hashing`, `two_pointers`) and language.
  - `kattis/`: Solutions to problems from the Kattis platform.
  - `patterns/`: Standard algorithmic templates and boilerplate code (e.g., sliding window, three pointers).
- `tests/`: Comprehensive test suites matching the structure of `src/` to validate implementations (e.g., using `pytest` for Python solutions).
- `notes/`: Markdown documentation on theoretical concepts, complexity analysis, and strategy.
- `web/`: An Astro-based web application designed to present notes, algorithm flashcards, drill modes, and problem tracking.
- `docs/`: Documentation site managed with Vitepress.
- `scripts/`: Python utility scripts for automating project tasks (e.g., documentation and problem generation).

## Building and Running

The project manages dependencies independently for each of its core languages and environments.

### Python
Managed via **Poetry**.
- **Setup:** Run `poetry install` in the root directory to install all dependencies.
- **Testing:** Run `poetry run pytest` to execute the Python test suite.
- **Code Formatting:** The project relies on `black`, `isort`, `flake8`, and `docformatter` (often run via `pre-commit`).

### Julia
Managed via the `Project.toml` environment.
- Start the Julia REPL and use `] instantiate` to fetch the dependencies listed.

### Rust
Managed as a Cargo workspace.
- **Build/Test:** Navigate to `src/leetcode/rust` and use standard Cargo commands: `cargo build` and `cargo test`.

### Web (Astro)
Located in the `web/` directory. Requires Node.js >= 22.12.0.
- **Install:** `npm install` (or `pnpm install` / `yarn`)
- **Develop:** `npm run dev`
- **Build:** `npm run build`

## Development Conventions

- **Pre-commit Hooks:** Code quality checks are enforced via `pre-commit`. Ensure pre-commit is installed (`pre-commit install`) before submitting changes.
- **Python Style Guidelines:**
  - Max line length is set to 89 characters.
  - Black's string normalization is turned *off* (`--skip-string-normalization`), meaning quotes aren't strictly converted to double quotes.
  - `flake8` is configured to ignore `E203` and `W503` for Black compatibility.
- **Testing:** New algorithmic solutions and structural implementations must include corresponding test cases in the `tests/` directory to ensure correctness.
- **AI Independence Rule:** Note that problem-solving and algorithmic implementations are intended to be done independently. AI tools (like this agent) should be restricted to repository organization, test generation, and documentation structuring rather than solving the puzzles directly unless explicitly requested.
- **Strategic Planning:** Features and roadmap for the mental gym web application and repository expansions are documented in `STRATEGY.md`. Always refer to it when building out new features for the Astro site or planning Machine Learning modules.
