import shutil
import subprocess
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
LEETCODE = ROOT / "src/leetcode"


def run_catalog(*args: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        [sys.executable, "-m", "src.complexity_analyzer", *args],
        cwd=ROOT,
        capture_output=True,
        check=False,
        text=True,
        timeout=10,
    )


def test_reports_every_solution() -> None:
    result = run_catalog("--leetcode")

    assert result.returncode == 0, result.stderr
    entries = [
        line.split("::", 1) for line in result.stdout.splitlines() if "::" in line
    ]
    paths = {
        path.relative_to(LEETCODE).as_posix() for path in LEETCODE.glob("*/python/*.py")
    }
    assert {path for path, _ in entries} == paths
    assert "Solution.hasDuplicate | inferred | O(n) expected time" in result.stdout
    assert "MinStack.pop | reviewed | O(1) amortized time" in result.stdout
    assert (
        "Solution.trap_bruteforce | inferred | O(n^2) worst case time" in result.stdout
    )
    assert f"{len(entries)} functions in {len(paths)} files" in result.stdout


def test_infers_known_source() -> None:
    path = LEETCODE / "arrays_hashing/python/contains_duplicate.py"
    result = run_catalog(str(path), "--function", "Solution.hasDuplicate")

    assert result.returncode == 0, result.stderr
    assert result.stdout.startswith("Inferred from source\n")
    assert "n = len(nums)." in result.stdout
    assert "set(nums) makes n insertion attempts" in result.stdout


@pytest.mark.parametrize(
    "args, reason",
    [
        (("--leetcode", "--size", "n"), "cannot be combined"),
        (("--function", "f"), "specify a path"),
    ],
)
def test_rejects_invalid_modes(args: tuple[str, ...], reason: str) -> None:
    result = run_catalog(*args)

    assert result.returncode == 2
    assert reason in result.stderr
    assert not result.stdout


@pytest.mark.parametrize(
    "path, function, time, explanation",
    [
        (
            "arrays_hashing/python/top_k_frequent_elements.py",
            "Solution.topKFrequent",
            "Time (expected upper bound): O(n + d log(d + 1))",
            "sorts the d count/value pairs",
        ),
        (
            "stack/python/generate_parenthesis.py",
            "Solution.generateParenthesis",
            "Time (upper bound): O(n * C_n)",
            "the nth Catalan number",
        ),
        (
            "stack/python/min_stack.py",
            "MinStack.getMin",
            "Time (upper bound): O(1)",
            "cached minimum",
        ),
    ],
)
def test_explains_reviewed_bounds(
    path: str, function: str, time: str, explanation: str
) -> None:
    result = run_catalog(str(LEETCODE / path), "--function", function)

    assert result.returncode == 0, result.stderr
    assert result.stdout.startswith("Reviewed derivation\n")
    assert time in result.stdout
    assert explanation in result.stdout


def test_rejects_changed_source(tmp_path: Path) -> None:
    src = tmp_path / "src"
    path = Path("leetcode/arrays_hashing/python/top_k_frequent_elements.py")
    target = src / path
    target.parent.mkdir(parents=True)
    shutil.copytree(
        ROOT / "src/complexity_analyzer",
        src / "complexity_analyzer",
        ignore=shutil.ignore_patterns("__pycache__"),
    )
    payload = (ROOT / "src" / path).read_text(encoding="utf-8")
    target.write_text(
        payload.replace("arr.sort(reverse=True)", "arr.reverse()"), encoding="utf-8"
    )
    result = subprocess.run(
        [
            sys.executable,
            "-m",
            "src.complexity_analyzer",
            str(target),
            "--function",
            "Solution.topKFrequent",
        ],
        cwd=tmp_path,
        capture_output=True,
        check=False,
        text=True,
        timeout=10,
    )

    assert result.returncode == 2
    assert "source changed since review" in result.stderr
    assert "Time" not in result.stdout
