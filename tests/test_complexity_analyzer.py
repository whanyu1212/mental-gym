import subprocess
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]


def run_analyzer(
    path: Path, function: str, sizing: tuple[str, str]
) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        [
            sys.executable,
            "-m",
            "src.complexity_analyzer",
            str(path),
            "--function",
            function,
            *sizing,
        ],
        cwd=ROOT,
        capture_output=True,
        check=False,
        text=True,
        timeout=5,
    )


def test_analyzes_real_solution() -> None:
    result = run_analyzer(
        ROOT / "src/leetcode/arrays_hashing/python/contains_duplicate.py",
        "Solution.hasDuplicate",
        ("--sequence", "nums"),
    )

    assert result.returncode == 0, result.stderr
    assert "Time (expected upper bound): O(n)" in result.stdout
    assert "Extra space (upper bound): O(n)" in result.stdout
    assert "set(nums) makes n insertion attempts" in result.stdout


@pytest.mark.parametrize(
    "loop, expected_time",
    [
        ("range(i)", "O(n^2)"),
        ("range(3)", "O(n)"),
    ],
)
def test_combines_loop_bounds(tmp_path: Path, loop: str, expected_time: str) -> None:
    path = tmp_path / "solution.py"
    path.write_text(
        "raise RuntimeError('analysis must never execute this module')\n"
        "def walk(n):\n"
        "    for i in range(n):\n"
        f"        for j in {loop}:\n"
        "            pass\n",
        encoding="utf-8",
    )
    result = run_analyzer(path, "walk", ("--size", "n"))

    assert result.returncode == 0, result.stderr
    assert f"Time (upper bound): {expected_time}" in result.stdout
    assert "Extra space (upper bound): O(1)" in result.stdout
    assert f"{loop} has at most" in result.stdout


def test_rejects_unbounded_iteration(tmp_path: Path) -> None:
    path = tmp_path / "solution.py"
    path.write_text(
        "def walk(nums):\n"
        "    for value in nums:\n"
        "        for counter in range(value):\n"
        "            pass\n",
        encoding="utf-8",
    )
    result = run_analyzer(path, "walk", ("--sequence", "nums"))

    assert result.returncode == 2
    assert "unknown: line 3: unknown loop bound range(value)" in result.stderr
    assert "Time" not in result.stdout


def test_bounds_list_iteration(tmp_path: Path) -> None:
    path = tmp_path / "solution.py"
    path.write_text(
        "def walk(nums):\n"
        "    if len(nums) > 3:\n"
        "        for i in range(len(nums)):\n"
        "            for value in nums:\n"
        "                if i == value:\n"
        "                    pass\n"
        "    else:\n"
        "        return 0\n",
        encoding="utf-8",
    )
    result = run_analyzer(path, "walk", ("--sequence", "nums"))

    assert result.returncode == 0, result.stderr
    assert "Time (upper bound): O(n^2)" in result.stdout
    assert "Extra space (upper bound): O(1)" in result.stdout


@pytest.mark.parametrize(
    "function, size, message",
    [
        ("Missing.walk", "n", "expected one undecorated class named Missing"),
        (
            "Solution.other",
            "n",
            "expected one undecorated function named Solution.other",
        ),
        ("Solution.walk", "other", "'other' is not a named parameter"),
        ("shadowed", "n", "a parameter shadows len, range, or set"),
    ],
)
def test_rejects_invalid_targets(
    tmp_path: Path, function: str, size: str, message: str
) -> None:
    path = tmp_path / "solution.py"
    path.write_text(
        "class Solution:\n"
        "    def walk(self, n):\n"
        "        pass\n"
        "def shadowed(n, *range):\n"
        "    for value in range(n):\n"
        "        pass\n",
        encoding="utf-8",
    )
    result = run_analyzer(path, function, ("--size", size))

    assert result.returncode == 2
    assert f"unknown: {message}" in result.stderr


@pytest.mark.parametrize(
    "signature, target",
    [("n, max", "i"), ("n, i: int", "i"), ("n", "max")],
)
def test_allows_scalar_loop_targets(tmp_path: Path, signature: str, target: str) -> None:
    path = tmp_path / "solution.py"
    path.write_text(
        f"def walk({signature}):\n    for {target} in range(n):\n        pass\n",
        encoding="utf-8",
    )
    result = run_analyzer(path, "walk", ("--size", "n"))

    assert result.returncode == 0, result.stderr
    assert "Time (upper bound): O(n)" in result.stdout
    assert "Extra space (upper bound): O(1)" in result.stdout


@pytest.mark.parametrize(
    "source, reason",
    [
        ("def walk(n, max):\n    return max(n, 0)\n", "max(n, 0)"),
        (
            "def walk(n, i: int):\n    for i in range(n):\n        pass\n"
            "    for j in range(i):\n        pass\n",
            "unknown loop bound range(i)",
        ),
    ],
)
def test_rejects_unproven_local_bounds(tmp_path: Path, source: str, reason: str) -> None:
    path = tmp_path / "solution.py"
    path.write_text(source, encoding="utf-8")
    result = run_analyzer(path, "walk", ("--size", "n"))

    assert result.returncode == 2
    assert reason in result.stderr
    assert not result.stdout


@pytest.mark.parametrize(
    "path, function, size, space",
    [
        ("arrays_hashing/maximum_subarray.py", "Solution.maxSubArray", "nums", "O(1)"),
        ("arrays_hashing/maximum_subarray.py", "max_subarray_elements", "nums", "O(n)"),
        (
            "arrays_hashing/maximum_sum_circular_subarray.py",
            "Solution.maxSubarraySumCircular",
            "nums",
            "O(1)",
        ),
        (
            "sliding_window/subarrays_with_avg_geq_threshold.py",
            "Solution.numOfSubarrays",
            "arr",
            "O(1)",
        ),
        (
            "two_pointers/remove_duplicates_ii.py",
            "Solution.removeDuplicates",
            "nums",
            "O(1)",
        ),
    ],
)
def test_bounds_scalar_list_solutions(
    path: str, function: str, size: str, space: str
) -> None:
    topic, filename = path.split("/")
    result = run_analyzer(
        ROOT / "src/leetcode" / topic / "python" / filename,
        function,
        ("--sequence", size),
    )

    assert result.returncode == 0, result.stderr
    assert "Time (upper bound): O(n)" in result.stdout
    assert f"Extra space (upper bound): {space}" in result.stdout


@pytest.mark.parametrize(
    "sizing, body, detail",
    [
        (
            ("--size", "n"),
            "    bound = 1\n"
            "    for i in range(n):\n"
            "        for j in range(bound):\n"
            "            pass\n"
            "        bound = bound * n\n",
            "unknown loop bound range(bound)",
        ),
        (
            ("--sequence", "nums"),
            "    if len(nums):\n"
            "        bound = nums[0]\n"
            "    else:\n"
            "        bound = 1\n"
            "    for i in range(bound):\n"
            "        pass\n",
            "unknown loop bound range(bound)",
        ),
        (("--sequence", "nums"), "    nums[:] = 3\n", "nums[:]"),
        (("--sequence", "nums"), "    value = external()\n", "external()"),
    ],
)
def test_rejects_unmodeled_effects(
    tmp_path: Path, sizing: tuple[str, str], body: str, detail: str
) -> None:
    path = tmp_path / "solution.py"
    path.write_text("def walk(nums, n: int):\n" + body, encoding="utf-8")
    result = run_analyzer(path, "walk", sizing)

    assert result.returncode == 2
    assert detail in result.stderr
    assert "Time" not in result.stdout


def test_merges_bounded_branches(tmp_path: Path) -> None:
    path = tmp_path / "solution.py"
    path.write_text(
        "def walk(n):\n"
        "    if n < 2:\n"
        "        bound = n + 1\n"
        "    else:\n"
        "        bound = n * n\n"
        "    for i in range(bound, 0, -1):\n"
        "        pass\n",
        encoding="utf-8",
    )
    result = run_analyzer(path, "walk", ("--size", "n"))

    assert result.returncode == 0, result.stderr
    assert "Time (upper bound): O(n^2)" in result.stdout
    assert "Extra space (upper bound): O(1)" in result.stdout


def test_counts_iterator_setup_once(tmp_path: Path) -> None:
    path = tmp_path / "solution.py"
    path.write_text(
        "def walk(nums):\n    for i in range(len(set(nums))):\n        pass\n",
        encoding="utf-8",
    )
    result = run_analyzer(path, "walk", ("--sequence", "nums"))

    assert result.returncode == 0, result.stderr
    assert "Time (expected upper bound): O(n)" in result.stdout
    assert "Extra space (upper bound): O(n)" in result.stdout
