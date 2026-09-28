---
title: Python — Start Here
slug: python-start-here
description: Run a first Python program and pytest test with Mental Gym's Poetry environment, or try uv in a separate practice project.
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
paths and Poetry's `pyproject.toml` predictable.

Prefer uv for your own practice? The [uv alternative](#try-the-same-example-with-uv)
uses the same program and test in a separate project. You can follow that route
without installing Poetry.

## Install the tools

Install a supported Python 3 release from the [official Python downloads
page](https://www.python.org/downloads/). This repository currently accepts
Python 3.10 and newer compatible 3.x releases, as declared in `pyproject.toml`.

The repository uses Poetry to create an isolated environment and install its
dependencies. If `poetry --version` is not available, follow Poetry's [official
installation guide](https://python-poetry.org/docs/#installation).

## Set up from the repository root

Open a terminal, change into your clone, and confirm the working directory:

```bash
cd /path/to/mental-gym
git rev-parse --show-toplevel
```

The second command should print the directory you just entered. From there,
install the locked dependencies and verify the interpreter Poetry selected:

```bash
poetry install
poetry run python --version
poetry run pytest --version
```

Use `poetry run ...` for the repository workflow. It runs the command inside the repository's
environment even when that environment is not activated in your shell.

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
poetry run python build/scratch/python_first.py
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
poetry run pytest build/scratch/test_python_first.py -q
```

Pytest should report `1 passed`. A passing test exits with status code 0, which
is what local scripts and CI use to recognize success.

## Try the same example with uv

[uv](https://docs.astral.sh/uv/) manages Python versions, project dependencies,
and virtual environments. Install it using the [official uv installation
guide](https://docs.astral.sh/uv/getting-started/installation/), then verify
`uv --version`.

Create a separate practice project. These commands use a temporary directory on
macOS/Linux; on Windows, choose a directory outside the clone. If the directory
already contains a project, choose a fresh name.

```bash
uv init --bare --python 3.12 --vcs none /tmp/mental-gym-python-uv
cd /tmp/mental-gym-python-uv
uv add --dev "pytest>=8,<9"
```

`uv init` creates the project metadata; `uv add --dev` records pytest as a
development dependency and prepares the project's environment and `uv.lock`.
uv can download the requested Python version if it is not installed.

In this directory, create `python_first.py` and `test_python_first.py` using the
two Python code blocks above. Then run:

```bash
uv run python python_first.py
uv run pytest test_python_first.py -q
```

Expect `[0.5, 0.75, 1.0]` and `1 passed`, just as with Poetry. Use
`uv run python <file>` for the Essentials snippets you save in this project.

Mental Gym's full dependency set stays managed by Poetry and `poetry.lock`.
This uv project installs only the dependencies needed for the lesson, using its
own `.venv` and `uv.lock`. Return to the repository root and use Poetry when
running the repository's full tests. See uv's [project guide](https://docs.astral.sh/uv/guides/projects/)
for adding packages and running other commands.

## Troubleshooting

- **`uv: command not found`:** finish the uv installation, reopen your terminal,
  and check `uv --version`. Run the uv commands from the practice project above.
- **`poetry: command not found`:** install Poetry, open a new terminal, and run
  `poetry --version` before returning to the repository.
- **Poetry cannot find `pyproject.toml`:** run `git rev-parse --show-toplevel`,
  then `cd` to the printed directory. Poetry commands in this lesson start there.
- **Poetry rejects the Python version:** run `poetry env use /path/to/python3`
  with a compatible interpreter, then repeat `poetry install`.
- **An import fails during the scratch test:** keep the program and test together
  in `build/scratch/`, use the filenames shown above, and run pytest from the
  repository root.
- **`python` and `poetry run python` report different versions:** that is normal
  when Poetry owns a virtual environment. Use the Poetry version for this repo.

Next, learn the core language model in [Python Essentials](../python-essentials/),
then return to the [Python learning track](../../learn/python/).

## Official references

- [Python downloads](https://www.python.org/downloads/)
- [The Python Tutorial](https://docs.python.org/3/tutorial/)
- [Installing packages in a virtual environment](https://packaging.python.org/en/latest/guides/installing-using-pip-and-virtual-environments/)
- [Poetry installation](https://python-poetry.org/docs/#installation)
- [uv projects and environments](https://docs.astral.sh/uv/guides/projects/)
