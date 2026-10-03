"""Test multilingual LeetCode discovery and generation."""

import importlib.util
from pathlib import Path

import pytest

SCRIPT = Path(__file__).resolve().parents[2] / "scripts" / "generate_problems.py"
spec = importlib.util.spec_from_file_location("generate_problems", SCRIPT)
generator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(generator)


def solution(root, topic, language, name, code="solution"):
    path = root / topic / language / name
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(code, encoding="utf-8")
    return path


@pytest.mark.parametrize(
    ("stem", "slug"),
    [
        ("two_sum", "two-sum"),
        ("TwoSum", "two-sum"),
        ("two-sum", "two-sum"),
        ("GroupAnagrams", "group-anagrams"),
        ("IsAnagram", "valid-anagram"),
        ("CloseDuplicates", "contains-duplicate-ii"),
        (
            "NumOfSubarrays",
            "number-of-sub-arrays-of-size-k-and-average-greater-than-or-equal-to-threshold",
        ),
        ("Merge2SortedList", "merge-two-sorted-lists"),
        ("TwoSumPart2", "two-sum-ii-input-array-is-sorted"),
        ("MinWindow", "minimum-window-substring"),
        ("three_sum", "3sum"),
    ],
)
def test_canonical_slug_across_naming_conventions(stem, slug):
    assert generator.stem_to_leetcode_slug(stem) == slug


def test_collects_every_language_without_requiring_python(tmp_path, monkeypatch):
    monkeypatch.setattr(generator, "SRC_LEETCODE_DIR", tmp_path)
    paths = {
        "python": solution(tmp_path, "arrays_hashing", "python", "two_sum.py"),
        "julia": solution(tmp_path, "arrays_hashing", "julia", "TwoSum.jl"),
        "typescript": solution(tmp_path, "arrays_hashing", "typescript", "two_sum.ts"),
        "rust": solution(tmp_path, "arrays_hashing", "rust", "two_sum.rs"),
    }
    rust_only = solution(tmp_path, "two_pointers", "rust", "reverse_string.rs")
    julia_only = solution(tmp_path, "sliding_window", "julia", "MinWindow.jl")
    ts_only = solution(tmp_path, "stack", "typescript", "min_stack.ts")
    entries = {p["leetcode_slug"]: p for p in generator.collect_problems()}
    assert entries["two-sum"]["solution_paths"] == paths
    assert entries["reverse-string"]["solution_paths"] == {"rust": rust_only}
    assert entries["minimum-window-substring"]["solution_paths"] == {"julia": julia_only}
    assert entries["min-stack"]["solution_paths"] == {"typescript": ts_only}
    assert entries["reverse-string"]["group"] == "Two Pointers"


def test_joins_cross_topic_aliases_and_prefers_canonical_topic(tmp_path, monkeypatch):
    monkeypatch.setattr(generator, "SRC_LEETCODE_DIR", tmp_path)
    solution(tmp_path, "sliding_window", "python", "contains_duplicate_2.py")
    alias = solution(tmp_path, "arrays_hashing", "julia", "CloseDuplicates.jl")
    solution(tmp_path, "arrays_hashing", "julia", "MaxProfit.jl", "other port")
    canonical = solution(tmp_path, "sliding_window", "julia", "MaxProfit.jl")
    solution(tmp_path, "sliding_window", "python", "max_profit.py")
    entries = {p["leetcode_slug"]: p for p in generator.collect_problems()}
    assert len(entries) == 2
    assert entries["contains-duplicate-ii"]["group"] == "Sliding Window"
    assert entries["contains-duplicate-ii"]["solution_paths"]["julia"] == alias
    assert (
        entries["best-time-to-buy-and-sell-stock"]["solution_paths"]["julia"]
        == canonical
    )
    assert generator.collect_problems() == list(entries.values())


def test_skips_module_wiring_reviews_and_test_files(tmp_path, monkeypatch):
    monkeypatch.setattr(generator, "SRC_LEETCODE_DIR", tmp_path)
    for language, names in {
        "rust": ["mod.rs", "lib.rs", "main.rs", "two_sum_review.rs"],
        "python": ["__init__.py", "two_sum_review.py", "test_two_sum.py"],
        "typescript": ["two_sum.test.ts", "two_sum.spec.ts"],
    }.items():
        for name in names:
            solution(tmp_path, "arrays_hashing", language, name)
    # Helpers belong in nested directories, not the one-file-per-problem folder.
    solution(tmp_path, "arrays_hashing", "rust/helpers", "util.rs")
    assert generator.collect_problems() == []


def test_main_renders_cached_standalone_and_shared_solutions(tmp_path, monkeypatch):
    root = tmp_path / "src" / "leetcode"
    output = tmp_path / "problems.ts"
    solution(root, "arrays_hashing", "python", "two_sum.py", "python code")
    solution(root, "arrays_hashing", "rust", "two_sum.rs", "rust code")
    solution(root, "sliding_window", "julia", "MinWindow.jl", "julia code")
    solution(root, "stack", "typescript", "min_stack.ts", "const s = `${value}`;")
    solution(root, "two_pointers", "rust", "reverse_string.rs", "rust-only code")
    cache = {
        slug: {
            "questionFrontendId": str(id_),
            "title": slug,
            "difficulty": "Easy",
            "topicTags": [],
            "content": "<p>Statement</p>",
        }
        for slug, id_ in [
            ("two-sum", 1),
            ("minimum-window-substring", 76),
            ("min-stack", 155),
            ("reverse-string", 344),
        ]
    }
    monkeypatch.setattr(generator, "SRC_LEETCODE_DIR", root)
    monkeypatch.setattr(generator, "REPO_ROOT", tmp_path)
    monkeypatch.setattr(generator, "OUTPUT_FILE", output)
    monkeypatch.setattr(generator, "load_cache", lambda: cache)
    monkeypatch.setattr(
        generator.urllib.request,
        "urlopen",
        lambda *args, **kwargs: pytest.fail("unexpected network request"),
    )
    generator.main()
    text = output.read_text()
    assert text.count('slug: "1-two-sum"') == 1
    assert 'slug: "76-minimum-window-substring"' in text
    assert 'slug: "344-reverse-string"' in text
    assert 'solutions: Partial<Record<SolutionLanguage, string>>;' in text
    assert 'rust: `rust-only code`' in text
    assert 'julia: `julia code`' in text
    assert 'typescript: `const s = \\`\\${value}\\`;`' in text
    assert 'python: ``' not in text
    generator.main()
    assert output.read_text() == text
