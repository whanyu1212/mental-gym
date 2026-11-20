"""Run the complexity analyzer from the command line."""

import argparse
from pathlib import Path

from .catalog import (
    CatalogError,
    ReviewedBounds,
    analyze_leetcode,
    analyze_reviewed,
    iter_reviews,
)
from .inference import Analysis, UnsupportedSyntax, analyze, format_bound


def _summary(result: Analysis | ReviewedBounds) -> tuple[str, str, str]:
    if isinstance(result, ReviewedBounds):
        return result.time, result.space, result.time_kind
    kind = "expected" if result.expected_time else "worst case"
    return format_bound(result.time_exponent), format_bound(result.space_exponent), kind


def _print_derivation(result: Analysis | ReviewedBounds) -> None:
    time, space, kind = _summary(result)
    qualifier = "upper bound" if kind == "worst case" else f"{kind} upper bound"
    print(f"Time ({qualifier}): {time}")
    print(f"Extra space (upper bound): {space}")
    steps = (
        (result.sizes, result.reason)
        if isinstance(result, ReviewedBounds)
        else result.steps
    )
    for step in steps:
        print(step)


def _print_leetcode() -> None:
    files = list(iter_reviews())
    total = inferred = 0
    for path, source, functions in files:
        for name, review in functions.items():
            result = analyze_reviewed(source, name, review)
            from_source = isinstance(result, Analysis)
            origin = "inferred" if from_source else "reviewed"
            time, space, kind = _summary(result)
            print(f"{path}::{name} | {origin} | {time} {kind} time | {space} space")
            total += 1
            inferred += from_source
    print(
        f"{total} functions in {len(files)} files "
        f"({inferred} inferred, {total - inferred} reviewed)"
    )


def main() -> None:
    """Print complexity bounds and their derivation for a function."""
    parser = argparse.ArgumentParser(description="Analyze Python time and extra space.")
    parser.add_argument("path", type=Path, nargs="?", help="Python source file")
    parser.add_argument("--function", help="function name or Class.method")
    parser.add_argument(
        "--leetcode", action="store_true", help="report all Python solutions"
    )
    size = parser.add_mutually_exclusive_group()
    size.add_argument("--sequence", help="list parameter whose length is n")
    size.add_argument("--size", help="integer parameter whose value is n")
    args = parser.parse_args()
    size_parameter = args.sequence if args.sequence is not None else args.size

    if args.leetcode:
        if any(
            value is not None for value in (args.path, args.function, size_parameter)
        ):
            parser.error("--leetcode cannot be combined with a file, function, or size")
    elif args.path is None or args.function is None:
        parser.error("specify a path and --function, or use --leetcode")

    try:
        if args.leetcode:
            _print_leetcode()
            return
        if size_parameter is None:
            result = analyze_leetcode(args.path, args.function)
            if isinstance(result, ReviewedBounds):
                print("Reviewed derivation")
            else:
                print("Inferred from source")
        else:
            result = analyze(
                args.path.read_text(encoding="utf-8"),
                args.function,
                size=size_parameter,
                sequence=args.sequence is not None,
            )
    except (
        OSError,
        SyntaxError,
        UnicodeError,
        UnsupportedSyntax,
        CatalogError,
    ) as error:
        parser.exit(2, f"unknown: {error}\n")

    _print_derivation(result)
