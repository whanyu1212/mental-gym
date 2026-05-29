"""
Generate web/src/data/problems.ts from src/leetcode/ + LeetCode GraphQL
API.

Run: poetry run python scripts/generate_problems.py
"""

from __future__ import annotations

import json
import re
import time
import urllib.request
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
SRC_LEETCODE_DIR = REPO_ROOT / "src" / "leetcode"
OUTPUT_FILE = REPO_ROOT / "web" / "src" / "data" / "problems.ts"
CACHE_FILE = REPO_ROOT / "scripts" / "leetcode_cache.json"

LEETCODE_GRAPHQL = "https://leetcode.com/graphql"

CATEGORY_TITLE_MAP = {
    "arrays_hashing": "Arrays & Hashing",
    "two_pointers": "Two Pointers",
    "sliding_window": "Sliding Window",
    "stack": "Stack",
}

# Map python file stems → correct LeetCode slug where auto-conversion would be wrong
SLUG_OVERRIDES: dict[str, str] = {
    "is_anagram": "valid-anagram",
    "group_anagram": "group-anagrams",
    "top_k_frequent_elements": "top-k-frequent-elements",
    "product_except_self": "product-of-array-except-self",
    "is_valid_sudoku": "valid-sudoku",
    "valid_sudoku": "valid-sudoku",
    "encode_decode_string": "encode-and-decode-strings",
    "longest_consecutive": "longest-consecutive-sequence",
    "get_concatenation": "concatenation-of-array",
    "range_query_sum_2d_immutable": "range-sum-query-2d-immutable",
    "two_sum2": "two-sum-ii-input-array-is-sorted",
    "three_sum": "3sum",
    "max_area": "container-with-most-water",
    "max_profit": "best-time-to-buy-and-sell-stock",
    "longest_substring": "longest-substring-without-repeating-characters",
    "character_replacement": "longest-repeating-character-replacement",
    "eval_rpn": "evaluate-reverse-polish-notation",
    "generate_parenthesis": "generate-parentheses",
    "max_sliding_window": "sliding-window-maximum",
    "merge_2_sorted_lists": "merge-two-sorted-lists",
    "permutation_in_string": "permutation-in-string",
    "design_hashset": "design-hashset",
    "design_hashmap": "design-hashmap",
    "sort_an_array": "sort-an-array",
    "sort_colors": "sort-colors",
    "valid_palindrome": "valid-palindrome",
    "majority_element": "majority-element",
    "majority_element_2": "majority-element-ii",
    "longest_common_prefix": "longest-common-prefix",
    "contains_duplicate": "contains-duplicate",
    "two_sum": "two-sum",
    "trap": "trapping-rain-water",
    "min_stack": "min-stack",
}


def stem_to_leetcode_slug(stem: str) -> str:
    if stem in SLUG_OVERRIDES:
        return SLUG_OVERRIDES[stem]
    return stem.replace("_", "-")


def normalized_key(stem: str) -> str:
    """Normalize a filename stem for cross-language matching."""
    text = re.sub(r"[_-]+", " ", stem)
    text = re.sub(r"([a-z0-9])([A-Z])", r"\1 \2", text)
    return re.sub(r"[^a-z0-9]", "", text.lower())


def load_cache() -> dict:
    if CACHE_FILE.exists():
        return json.loads(CACHE_FILE.read_text())
    return {}


def save_cache(cache: dict) -> None:
    CACHE_FILE.write_text(json.dumps(cache, indent=2))


def fetch_problem(leetcode_slug: str, cache: dict) -> dict | None:
    if leetcode_slug in cache:
        return cache[leetcode_slug]

    query = """
    query getProblem($titleSlug: String!) {
      question(titleSlug: $titleSlug) {
        questionFrontendId
        title
        difficulty
        topicTags { slug }
        content
      }
    }
    """
    payload = json.dumps(
        {"query": query, "variables": {"titleSlug": leetcode_slug}}
    ).encode()
    req = urllib.request.Request(
        LEETCODE_GRAPHQL,
        data=payload,
        headers={
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0",
            "Referer": "https://leetcode.com",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read())
        question = data.get("data", {}).get("question")
        cache[leetcode_slug] = question
        save_cache(cache)
        time.sleep(0.6)
        return question
    except Exception as exc:
        print(f"  WARNING: failed to fetch '{leetcode_slug}': {exc}")
        return None


def collect_problems() -> list[dict]:
    """Walk src/leetcode/ and collect one entry per unique Python
    file."""
    seen_slugs: set[str] = set()
    problems: list[dict] = []

    for category_dir in sorted(SRC_LEETCODE_DIR.iterdir()):
        if not category_dir.is_dir():
            continue
        group = CATEGORY_TITLE_MAP.get(category_dir.name, category_dir.name)

        for py_file in sorted(category_dir.glob("*.py")):
            lc_slug = stem_to_leetcode_slug(py_file.stem)
            if lc_slug in seen_slugs:
                print(f"  Skipping duplicate: {py_file.name} → {lc_slug}")
                continue
            seen_slugs.add(lc_slug)

            problems.append(
                {
                    "py_path": py_file,
                    "group": group,
                    "leetcode_slug": lc_slug,
                    "norm_key": normalized_key(py_file.stem),
                }
            )

    return problems


def find_julia_solution(norm_key: str) -> str:
    """Search all category dirs for a .jl file matching the normalized
    key."""
    for category_dir in SRC_LEETCODE_DIR.iterdir():
        if not category_dir.is_dir():
            continue
        for jl_file in category_dir.glob("*.jl"):
            if normalized_key(jl_file.stem) == norm_key:
                return jl_file.read_text(encoding="utf-8").strip()
    return ""


def js_string(s: str) -> str:
    """Escape a string for embedding in a JS/TS template literal."""
    s = s.replace("\\", "\\\\")
    s = s.replace("`", "\\`")
    s = s.replace("${", "\\${")
    return s


def render_ts(problems_data: list[dict]) -> str:
    lines: list[str] = []
    lines.append(
        "// AUTO-GENERATED by scripts/generate_problems.py — do not edit manually."
    )
    lines.append("// Run: poetry run python scripts/generate_problems.py")
    lines.append("")
    lines.append('export type Difficulty = "Easy" | "Medium" | "Hard";')
    lines.append("")
    lines.append("export interface Problem {")
    lines.append("  id: string;")
    lines.append("  slug: string;")
    lines.append("  leetcodeSlug: string;")
    lines.append("  title: string;")
    lines.append("  difficulty: Difficulty;")
    lines.append("  group: string;")
    lines.append("  topics: string[];")
    lines.append("  description: string;")
    lines.append("  solutions: {")
    lines.append("    python: string;")
    lines.append("    julia: string;")
    lines.append("  };")
    lines.append("  sourceUrl: string;")
    lines.append("}")
    lines.append("")
    lines.append("export const problems: Problem[] = [")

    for p in problems_data:
        topics_json = json.dumps(p["topics"])
        lines.append("  {")
        lines.append(f'    id: {json.dumps(p["id"])},')
        lines.append(f'    slug: {json.dumps(p["slug"])},')
        lines.append(f'    leetcodeSlug: {json.dumps(p["leetcode_slug"])},')
        lines.append(f'    title: {json.dumps(p["title"])},')
        lines.append(f'    difficulty: {json.dumps(p["difficulty"])},')
        lines.append(f'    group: {json.dumps(p["group"])},')
        lines.append(f"    topics: {topics_json},")
        lines.append(f'    description: `{js_string(p["description"])}`,')
        lines.append("    solutions: {")
        lines.append(f'      python: `{js_string(p["python"])}`,')
        lines.append(f'      julia: `{js_string(p["julia"])}`,')
        lines.append("    },")
        lines.append(f'    sourceUrl: {json.dumps(p["source_url"])},')
        lines.append("  },")

    lines.append("];")
    lines.append("")
    return "\n".join(lines)


def main() -> None:
    print("Loading cache...")
    cache = load_cache()

    print("Collecting problems from src/leetcode/...")
    raw_problems = collect_problems()
    print(f"  Found {len(raw_problems)} unique problems")

    problems_data: list[dict] = []

    for i, entry in enumerate(raw_problems, 1):
        lc_slug = entry["leetcode_slug"]
        print(f"  [{i}/{len(raw_problems)}] {lc_slug}")

        question = fetch_problem(lc_slug, cache)

        if question is None:
            print(f"    SKIP: API returned nothing for '{lc_slug}'")
            continue

        frontend_id = question.get("questionFrontendId", "")
        title = question.get("title", "")
        difficulty = question.get("difficulty", "Medium")
        topics = [t["slug"] for t in (question.get("topicTags") or [])]
        description = question.get("content") or ""

        python_code = entry["py_path"].read_text(encoding="utf-8").strip()
        julia_code = find_julia_solution(entry["norm_key"])

        slug = f"{frontend_id}-{lc_slug}"

        problems_data.append(
            {
                "id": frontend_id,
                "slug": slug,
                "leetcode_slug": lc_slug,
                "title": title,
                "difficulty": difficulty,
                "group": entry["group"],
                "topics": topics,
                "description": description,
                "python": python_code,
                "julia": julia_code,
                "source_url": f"https://leetcode.com/problems/{lc_slug}/",
            }
        )

    # Sort by numeric id within each group
    problems_data.sort(
        key=lambda p: (p["group"], int(p["id"]) if p["id"].isdigit() else 9999)
    )

    print(f"\nWriting {OUTPUT_FILE.relative_to(REPO_ROOT)}...")
    OUTPUT_FILE.write_text(render_ts(problems_data), encoding="utf-8")
    print(f"Done. Generated {len(problems_data)} problems.")


if __name__ == "__main__":
    main()
