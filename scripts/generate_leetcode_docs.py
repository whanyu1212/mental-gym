from __future__ import annotations

import re
from collections import defaultdict
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
SRC_LEETCODE_DIR = REPO_ROOT / "src" / "leetcode"
OUTPUT_FILE = REPO_ROOT / "docs" / "problems" / "leetcode.md"
GITHUB_BASE_URL = "https://github.com/hanyuwu/mental-gym/blob/develop"

CATEGORY_TITLE_MAP = {
    "arrays_hashing": "Arrays & Hashing",
    "two_pointers": "Two Pointers",
    "sliding_window": "Sliding Window",
    "stack": "Stack",
    "linked_list": "Linked List",
    "trees": "Trees",
    "graphs": "Graphs",
    "binary_search": "Binary Search",
    "dp": "Dynamic Programming",
}


def title_from_stem(stem: str) -> str:
    with_spaces = re.sub(r"[_-]+", " ", stem)
    with_spaces = re.sub(r"([a-z0-9])([A-Z])", r"\1 \2", with_spaces)
    return " ".join(word.capitalize() for word in with_spaces.split())


def normalized_key(stem: str) -> str:
    return re.sub(r"[^a-z0-9]", "", title_from_stem(stem).lower())


def category_title(category: str) -> str:
    if category in CATEGORY_TITLE_MAP:
        return CATEGORY_TITLE_MAP[category]
    return title_from_stem(category)


def github_link(relative_path: Path, label: str) -> str:
    return f"[{label}]({GITHUB_BASE_URL}/{relative_path.as_posix()})"


def collect_category_entries(category_dir: Path) -> list[dict[str, str]]:
    entries: dict[str, dict[str, str]] = defaultdict(dict)

    for file_path in sorted(category_dir.glob("*.py")):
        key = normalized_key(file_path.stem)
        entries[key]["title"] = title_from_stem(file_path.stem)
        entries[key]["py"] = github_link(file_path.relative_to(REPO_ROOT), "Python")

    for file_path in sorted(category_dir.glob("*.jl")):
        key = normalized_key(file_path.stem)
        entries[key]["title"] = title_from_stem(file_path.stem)
        entries[key]["jl"] = github_link(file_path.relative_to(REPO_ROOT), "Julia")

    merged_entries = []
    for key in sorted(entries.keys()):
        record = entries[key]
        merged_entries.append(
            {
                "title": record["title"],
                "python": record.get("py", "—"),
                "julia": record.get("jl", "—"),
            }
        )
    return merged_entries


def render_markdown() -> str:
    lines: list[str] = []
    lines.append("# LeetCode Problems")
    lines.append("")
    lines.append("> This page is auto-generated from `src/leetcode/`.")
    lines.append(
        "> Do not edit manually. Run "
        "`poetry run python scripts/generate_leetcode_docs.py` to regenerate."
    )
    lines.append("")

    category_dirs = sorted(path for path in SRC_LEETCODE_DIR.iterdir() if path.is_dir())
    for category_dir in category_dirs:
        rows = collect_category_entries(category_dir)
        if not rows:
            continue

        lines.append(f"## {category_title(category_dir.name)}")
        lines.append("")
        lines.append("| Problem | Python | Julia |")
        lines.append("|---------|--------|-------|")
        for row in rows:
            lines.append(f"| {row['title']} | {row['python']} | {row['julia']} |")
        lines.append("")

    return "\n".join(lines).rstrip() + "\n"


def main() -> None:
    OUTPUT_FILE.write_text(render_markdown(), encoding="utf-8")
    print(f"Generated: {OUTPUT_FILE.relative_to(REPO_ROOT)}")


if __name__ == "__main__":
    main()
