"""
Shared helpers for Kattis tests (importable via pytest ``pythonpath``).

``samples/<problem>/<n>.in`` and ``<n>.ans`` are the official sample files
from ``https://open.kattis.com/problems/<problem>/file/statement/samples.zip``.
"""

import subprocess
import sys
from pathlib import Path

import pytest

SAMPLES = Path(__file__).parent / "samples"
SOLUTIONS = Path(__file__).parents[2] / "src" / "kattis" / "python"


def sample_cases(problem: str) -> list:
    """Pytest params ``(input, expected)`` for each official sample."""
    cases = []
    for input_path in sorted(SAMPLES.joinpath(problem).glob("*.in")):
        answer_path = input_path.with_suffix(".ans")
        cases.append(
            pytest.param(
                input_path.read_text(),
                answer_path.read_text(),
                id=f"{problem}-sample-{input_path.stem}",
            )
        )
    assert cases, f"no samples found for {problem}"
    return cases


def run_solution(module: str, stdin: str) -> str:
    """Run ``src/kattis/python/<module>.py`` as Kattis would and return
    stdout."""
    result = subprocess.run(
        [sys.executable, str(SOLUTIONS / f"{module}.py")],
        input=stdin,
        capture_output=True,
        text=True,
        timeout=10,
        check=False,
    )
    assert result.returncode == 0, result.stderr
    return result.stdout


def tokens(text: str) -> list[str]:
    """Whitespace-insensitive view of judge output, like Kattis's
    default checker."""
    return text.split()
