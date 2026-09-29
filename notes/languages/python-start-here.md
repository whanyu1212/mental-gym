---
title: Python — Start Here
slug: python-start-here
description: Run a first Python program and pytest test with Mental Gym's uv environment.
category: Languages
order: -8
status: stable
kind: concept
tags:
  - python
  - foundations
---

# Python — Start Here

This lesson gets one small Python program running in the same environment as the
repository. Keep the terminal in the repository root while you work. That makes
paths and uv's `pyproject.toml` and `uv.lock` predictable.

## Install the tools

Install a supported Python 3 release from the [official Python downloads
page](https://www.python.org/downloads/). This repository currently accepts
Python 3.10 and newer compatible 3.x releases, as declared in `pyproject.toml`.

The repository uses [uv](https://docs.astral.sh/uv/) to install Python when
needed, create an isolated environment, and install locked dependencies. Follow
uv's [official installation guide](https://docs.astral.sh/uv/getting-started/installation/),
then verify `uv --version`.

## Set up from the repository root

Open a terminal, change into your clone, and confirm the working directory:

```bash
cd /path/to/mental-gym
git rev-parse --show-toplevel
```

The second command should print the directory you just entered. From there,
install the locked dependencies and verify the interpreter uv selected:

```bash
uv sync --locked
uv run python --version
uv run pytest --version
```

Use `uv run ...` for the repository workflow. It checks the lockfile and runs
the command inside the repository's environment even when that environment is
not activated in your shell.

## Keep experiments in an ignored scratch directory

The repository ignores `build/`, so it is a safe place for disposable practice
files. Commands below assume you are still at the repository root:

```bash
mkdir -p build/scratch
```

Create `build/scratch/python_first.py`:

```python
def normalize_scores(scores: list[int]) -> list[float]:
    """Scale non-empty scores by their positive maximum."""
    if not scores:
        raise ValueError("scores must not be empty")

    maximum = max(scores)
    if maximum <= 0:
        raise ValueError("maximum score must be positive")

    return [round(score / maximum, 2) for score in scores]


def main() -> None:
    print(normalize_scores([2, 3, 4]))


if __name__ == "__main__":
    main()
```

Run it from the root:

```bash
uv run python build/scratch/python_first.py
```

Expected output:

```text
[0.5, 0.75, 1.0]
```

The `if __name__ == "__main__"` guard runs `main()` when the file is executed,
but does not run it when a test imports the function.

## Add one test

Create `build/scratch/test_python_first.py`:

```python
import pytest

from python_first import normalize_scores


def test_normalize_scores() -> None:
    assert normalize_scores([2, 3, 4]) == [0.5, 0.75, 1.0]

    with pytest.raises(ValueError, match="must not be empty"):
        normalize_scores([])
```

Run just that test:

```bash
uv run pytest build/scratch/test_python_first.py -q
```

Pytest should report `1 passed`. A passing test exits with status code 0, which
is what local scripts and CI use to recognize success.

## Troubleshooting

- **`uv: command not found`:** finish the uv installation, reopen your terminal,
  and check `uv --version`.
- **uv cannot find `pyproject.toml`:** run `git rev-parse --show-toplevel`, then
  `cd` to the printed directory. uv commands in this lesson start there.
- **uv rejects the Python version:** run `uv python install 3.11`, then repeat
  `uv sync --locked`.
- **An import fails during the scratch test:** keep the program and test together
  in `build/scratch/`, use the filenames shown above, and run pytest from the
  repository root.
- **`python` and `uv run python` report different versions:** that is normal
  when uv owns a virtual environment. Use the uv version for this repo.

Next, learn the core language model in [Python Essentials](../python-essentials/),
then return to the [Python learning track](../../learn/python/).

## Official references

- [Python downloads](https://www.python.org/downloads/)
- [The Python Tutorial](https://docs.python.org/3/tutorial/)
- [Installing packages in a virtual environment](https://packaging.python.org/en/latest/guides/installing-using-pip-and-virtual-environments/)
- [uv installation](https://docs.astral.sh/uv/getting-started/installation/)
- [uv projects and environments](https://docs.astral.sh/uv/guides/projects/)
