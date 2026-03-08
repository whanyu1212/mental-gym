# AGENTS.md

This file provides guidance to agents (i.e., ADAL) when working with code in this repository.

## Project Overview

**Mental Gym** is a personal coding practice repository documenting solutions to LeetCode, Kattis, and HackerRank problems, plus DSA implementations from scratch in Python, Julia, and C++.

**Languages**: Python (primary), Julia (secondary), C++ (planned)

**Structure**:
- `src/leetcode/` - LeetCode solutions, co-located by category (Python `.py` + Julia `.jl` in same folder)
- `src/kattis/` - Kattis solutions (`python/` and `julia/` subdirs)
- `src/rust/leetcode/` - Rust LeetCode solutions (Cargo workspace)
- `src/dsa_from_scratch/` - DSA implementations from scratch
- `src/patterns/` - Common algorithm patterns (arrays, backtracking, sliding_window, etc.) + `complexity/` for time/space fundamentals
- `tests/` - Test files mirroring `src/` structure

## Essential Commands

### Python Development

**Package Manager**: Poetry (NOT pip)
- **CRITICAL**: Always use `poetry run` prefix for Python commands
- Install dependencies: `poetry install`
- Add dependency: `poetry add <package>`

**Testing**:
```bash
# Run all Python tests
poetry run pytest

# Run specific test file
poetry run pytest tests/kattis/test_hip_hip.py

# Run specific test function
poetry run pytest tests/kattis/test_hip_hip.py::test_hip_hip

# Verbose output
poetry run pytest -v
```

**Code Quality** (enforced via pre-commit):
```bash
# Install pre-commit hooks
poetry run pre-commit install

# Run manually on all files
poetry run pre-commit run --all-files

# Individual tools
poetry run black src/ tests/ --line-length=89 --skip-string-normalization
poetry run isort src/ tests/ --profile black
poetry run flake8 src/ tests/ --max-line-length=89
poetry run docformatter --in-place --wrap-summaries=72 --pre-summary-newline <file>
```

**Pre-commit Configuration**: `.pre-commit-config.yml` runs black, isort, docformatter, flake8 on commit
- Line length: 89 characters
- Black profile with string normalization disabled
- Docstring wrapping at 72 characters

### Julia Development

**Package Manager**: Julia built-in package manager

**Dependencies** (from `Project.toml`):
- BenchmarkTools, CSV, DataFrames, DataStructures
- IJulia (Jupyter integration)
- MLJ, Plots, Statistics, Turing

**Testing**:
```bash
# Run Julia tests (from Julia REPL)
julia> using Test
julia> include("tests/leetcode/testMaxArea.jl")

# Or from command line
julia tests/leetcode/testMaxArea.jl
```

**Test Structure**: Julia tests use `@testset` and `@test` macros, include source files via relative paths

### Virtual Environment

**Python venv**: `.venv/` directory (managed by Poetry)
- Automatically activated when using `poetry run`
- Manual activation: `source .venv/bin/activate` (macOS/Linux)

## Architecture & Workflows

### Test Organization

**Python Tests**:
- Located in `tests/kattis/`, `tests/leetcode/`
- Use pytest framework
- Import directly by module name — `pythonpath` is configured in `pyproject.toml`
- Example: `tests/kattis/test_hip_hip.py` imports `from hip_hip import hip_hip`
- Use `monkeypatch` fixture to capture stdout for verification

**Julia Tests**:
- Located in `tests/leetcode/`
- Use Julia's `Test` module with `@testset` and `@test`
- Import pattern: `include("../../src/leetcode/<category>/<Module>.jl")`
- Test files named `test<ProblemName>.jl`, source files named `<ProblemName>.jl`

### Code Organization

**By Platform**:
- `src/leetcode/<category>/` — co-located Python + Julia per category (e.g. `two_sum.py` and `TwoSum.jl` in same folder)
  - Categories: `arrays_hashing/`, `two_pointers/`, `stack/`, `sliding_window/`
- `src/kattis/python/` - flat structure, one file per problem; `src/kattis/julia/` for Julia
- `src/rust/leetcode/` - Rust Cargo workspace for LeetCode
- `src/dsa_from_scratch/python/` organized by data structure type (no numeric prefixes):
  - `sorting/`, `arrays/`, `list_adt/`, `binary_heap/`, `hash_map/`, `tree/`, `graph/`, etc.
- `src/patterns/` - reusable algorithm templates; `src/patterns/complexity/` for time/space demos

**Naming Conventions**:
- Python: `snake_case.py` for files, functions
- Julia: `PascalCase.jl` for files/modules, `camelCase` for functions

### Problem-Solving Workflow

1. **Implement solution** in `src/<platform>/<category>/<problem>.py` and/or `<Problem>.jl`
2. **Write tests** in `tests/<platform>/test_<problem>.py|jl`
3. **Run tests**: `poetry run pytest <test_file>` (Python) or `julia <test_file>` (Julia)
4. **Format code**: Pre-commit hooks auto-format on commit, or run manually
5. **Update README**: Add entry to appropriate table with badge links

**No AI for solutions**: All implementations done independently; AI used only for repo organization/docs

## Key Files & Entry Points

**Configuration**:
- `pyproject.toml` - Python dependencies, Poetry config, build system
- `Project.toml` / `Manifest.toml` - Julia dependencies
- `.pre-commit-config.yaml` - Code quality hooks (black, isort, flake8, docformatter)
- `.gitignore` - Standard Python/Julia ignores plus `.venv/`, `__pycache__/`

**Documentation**:
- `README.md` - Main documentation with problem tables, badges, DSA catalog

**Source Entry Points**:
- Algorithm patterns: `src/patterns/arrays/kadane.py`, `src/patterns/sliding_window/*.py`
- Complexity demos: `src/patterns/complexity/`
- DSA implementations: Browse `src/dsa_from_scratch/python/<category>/` for specific data structures

## Common Gotchas

1. **Python commands**: MUST use `poetry run` prefix (not bare `pytest`, `python`, etc.)
2. **Line length**: 89 characters (not 80 or 120) - enforced by black/flake8
3. **Julia paths**: Test files use relative `include()` paths (`../../src/...`)
4. **Virtual env**: Poetry manages `.venv/` automatically; don't use pip directly
5. **Pre-commit**: Hooks will auto-format on commit; expect changes to staged files
6. **Test structure**: Python tests must add `src/<platform>/python` to `sys.path` before importing

## Development Tips

**Adding New Problems**:
1. Check README for existing problem to avoid duplicates
2. Follow existing file structure: `src/<platform>/<category>/<problem_name>.py` or `<ProblemName>.jl`
3. Create corresponding test file in `tests/<platform>/`
4. Run tests before committing
5. Update README table with new entry

**Running Specific Tests**:
- Python: `poetry run pytest tests/<platform>/test_<problem>.py::<test_function>`
- Julia: `julia tests/<platform>/test<Problem>.jl`

**Code Quality**:
- Pre-commit runs automatically on `git commit`
- To bypass (not recommended): `git commit --no-verify`
- Fix issues manually or run `poetry run pre-commit run --all-files`
