"""
Validate algorithm teaching guides against generated problem data.

Run from the repo root:
    python3 scripts/validate_algorithm_guides.py
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
PROBLEMS_FILE = REPO_ROOT / "web" / "src" / "data" / "problems.ts"
GUIDES_FILE = REPO_ROOT / "web" / "src" / "data" / "algorithmGuides.ts"
ALGO_PAGE_FILE = REPO_ROOT / "web" / "src" / "pages" / "algorithms" / "[slug].astro"

REQUIRED_GUIDE_FIELDS = [
    "pattern",
    "recognitionSignals",
    "dissection",
    "intuition",
    "invariant",
    "approachSteps",
    "complexity",
    "pitfalls",
    "testCases",
    "followUps",
    "relatedNotes",
]


def fail(message: str) -> None:
    print(f"ERROR: {message}", file=sys.stderr)
    raise SystemExit(1)


def extract_problem_slugs() -> list[str]:
    if not PROBLEMS_FILE.exists():
        fail(f"missing {PROBLEMS_FILE.relative_to(REPO_ROOT)}")
    text = PROBLEMS_FILE.read_text(encoding="utf-8")
    slugs = re.findall(r'\bslug:\s*"([^"]+)"', text)
    if not slugs:
        fail("no problem slugs found in generated problem data")
    duplicates = sorted({slug for slug in slugs if slugs.count(slug) > 1})
    if duplicates:
        fail(f"duplicate problem slugs in generated data: {', '.join(duplicates)}")
    return slugs


def object_block_for_key(text: str, key: str) -> str | None:
    key_match = re.search(rf'"{re.escape(key)}"\s*:', text)
    if not key_match:
        return None

    start = text.find("{", key_match.end())
    if start == -1:
        return None

    depth = 0
    in_string: str | None = None
    escaped = False

    for index in range(start, len(text)):
        char = text[index]

        if in_string:
            if escaped:
                escaped = False
            elif char == "\\":
                escaped = True
            elif char == in_string:
                in_string = None
            continue

        if char in {"'", '"', "`"}:
            in_string = char
        elif char == "{":
            depth += 1
        elif char == "}":
            depth -= 1
            if depth == 0:
                return text[start : index + 1]

    return None


def extract_guide_blocks(problem_slugs: list[str]) -> dict[str, str]:
    if not GUIDES_FILE.exists():
        fail(f"missing {GUIDES_FILE.relative_to(REPO_ROOT)}")
    text = GUIDES_FILE.read_text(encoding="utf-8")

    guides = {}
    for slug in problem_slugs:
        block = object_block_for_key(text, slug)
        if block is not None:
            guides[slug] = block

    declared_slugs = re.findall(r'slug:\s*"([^"]+)"', text)
    unknown = sorted(set(declared_slugs) - set(problem_slugs))
    if unknown:
        fail(f"guide slugs not present in generated problems: {', '.join(unknown)}")

    return guides


def validate_guide_block(slug: str, block: str) -> list[str]:
    errors: list[str] = []

    for field in REQUIRED_GUIDE_FIELDS:
        if not re.search(rf"\b{field}\s*:", block):
            errors.append(f"{slug}: missing {field}")

    if not re.search(rf'slug:\s*"{re.escape(slug)}"', block):
        errors.append(f"{slug}: guide object must repeat its slug")

    for kind in ("canonical", "boundary", "trap"):
        if f'kind: "{kind}"' not in block:
            errors.append(f"{slug}: missing {kind} test case")

    test_case_count = len(
        re.findall(r"\bkind:\s*\"(?:canonical|boundary|trap)\"", block)
    )
    if test_case_count < 3:
        errors.append(f"{slug}: expected at least 3 test cases, found {test_case_count}")

    return errors


def extract_animation_slugs() -> set[str]:
    if not ALGO_PAGE_FILE.exists():
        fail(f"missing {ALGO_PAGE_FILE.relative_to(REPO_ROOT)}")
    text = ALGO_PAGE_FILE.read_text(encoding="utf-8")

    registry_match = re.search(
        r"const\s+animationBySlug\s*=\s*\{([\s\S]*?)\}\s*(?:as const)?;", text
    )
    if registry_match:
        return set(re.findall(r'"([^"]+)"\s*:', registry_match.group(1)))

    legacy_match = re.search(
        r"const\s+animatedSlugs\s*=\s*new Set\(\[([\s\S]*?)\]\);", text
    )
    if legacy_match:
        return set(re.findall(r'"([^"]+)"', legacy_match.group(1)))

    return set()


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--strict",
        action="store_true",
        help="Treat missing guides as a hard error (use once every problem is covered).",
    )
    args = parser.parse_args()

    problem_slugs = extract_problem_slugs()
    guide_blocks = extract_guide_blocks(problem_slugs)

    # Coverage gap (a problem with no guide yet) is a warning during incremental
    # authoring, but a hard error under --strict (the release gate). Field-level
    # problems in guides that DO exist are always fatal — we never ship a
    # malformed guide.
    missing_guides = sorted(set(problem_slugs) - set(guide_blocks))
    if missing_guides:
        message = f"missing guides for problem slugs: {', '.join(missing_guides)}"
        if args.strict:
            fail(message)
        print(f"WARNING: {message}", file=sys.stderr)

    authored_slugs = [slug for slug in problem_slugs if slug in guide_blocks]

    errors: list[str] = []
    for slug in authored_slugs:
        errors.extend(validate_guide_block(slug, guide_blocks[slug]))

    animation_slugs = extract_animation_slugs()
    orphaned_animations = sorted(animation_slugs - set(problem_slugs))
    if orphaned_animations:
        errors.append(
            "animation slugs not present in generated problems: "
            + ", ".join(orphaned_animations)
        )

    teaching_markers = [
        "🧠 Core idea",
        "🎯 What interviewers are testing",
        "⚠️ Common mistakes",
        "🧪 What to test for",
        "✅ Correctness note",
    ]
    problems_text = PROBLEMS_FILE.read_text(encoding="utf-8")
    leaked = [marker for marker in teaching_markers if marker in problems_text]
    if leaked:
        errors.append(
            "generated problem descriptions contain teaching-guide markers: "
            + ", ".join(leaked)
        )

    if errors:
        for error in errors:
            print(f"ERROR: {error}", file=sys.stderr)
        raise SystemExit(1)

    print(f"Validated {len(authored_slugs)} of {len(problem_slugs)} algorithm guides.")


if __name__ == "__main__":
    main()
