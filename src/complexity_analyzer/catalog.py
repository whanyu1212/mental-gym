"""Load reviewed complexity derivations for Mental Gym's Python
solutions."""

import ast
import hashlib
import json
from collections.abc import Iterator
from dataclasses import dataclass, replace
from pathlib import Path

from .inference import Analysis, UnsupportedSyntax, analyze

_PACKAGE = Path(__file__).resolve().parent
_SOLUTIONS = _PACKAGE.parent / "leetcode"


class CatalogError(ValueError):
    """Report a missing or stale reviewed derivation."""


@dataclass(frozen=True)
class ReviewedBounds:
    """Describe a bound, its input sizes, and the argument behind it."""

    time: str
    space: str
    time_kind: str
    sizes: str
    reason: str
    sequence: str | None = None


@dataclass(frozen=True)
class _ReviewedFile:
    source_sha256: str
    functions: dict[str, ReviewedBounds]

    def verify(self, path: str, source: str) -> None:
        """Check the source version before using a reviewed result."""
        digest = hashlib.sha256(source.encode("utf-8")).hexdigest()
        if digest != self.source_sha256:
            raise CatalogError(f"source changed since review: {path}")


def _load_catalog() -> dict[str, _ReviewedFile]:
    path = _PACKAGE / "leetcode_catalog.json"
    try:
        files = json.loads(path.read_text(encoding="utf-8"))
        return {
            name: _ReviewedFile(
                source_sha256=file["source_sha256"],
                functions={
                    function: ReviewedBounds(**bounds)
                    for function, bounds in file["functions"].items()
                },
            )
            for name, file in files.items()
        }
    except (AttributeError, KeyError, OSError, TypeError, ValueError) as error:
        raise CatalogError(f"could not read {path.name}: {error}") from error


def get_review(path: Path, function: str, source: str) -> ReviewedBounds:
    """Look up a derivation for the exact repository source under
    analysis."""
    try:
        relative = path.resolve().relative_to(_SOLUTIONS).as_posix()
    except ValueError as error:
        raise CatalogError(f"no reviewed derivation for {path}::{function}") from error
    catalog = _load_catalog()
    try:
        record = catalog[relative]
        bounds = record.functions[function]
    except KeyError as error:
        raise CatalogError(f"no reviewed derivation for {path}::{function}") from error
    record.verify(relative, source)
    return bounds


def _definitions(source: str) -> set[str]:
    names = set()
    for node in ast.parse(source).body:
        if isinstance(node, ast.FunctionDef):
            names.add(node.name)
        elif isinstance(node, ast.ClassDef):
            names.update(
                f"{node.name}.{method.name}"
                for method in node.body
                if isinstance(method, ast.FunctionDef)
            )
    return names


def iter_reviews() -> Iterator[tuple[str, str, dict[str, ReviewedBounds]]]:
    """Yield each solution's relative path, source, and reviewed
    functions."""
    files = {
        path.relative_to(_SOLUTIONS).as_posix(): path
        for path in _SOLUTIONS.glob("*/python/*.py")
    }
    catalog = _load_catalog()
    if files.keys() != catalog.keys():
        differences = ", ".join(sorted(files.keys() ^ catalog.keys()))
        raise CatalogError(f"catalog and solution files differ: {differences}")

    for relative, path in sorted(files.items()):
        source = path.read_text(encoding="utf-8")
        record = catalog[relative]
        record.verify(relative, source)
        definitions = _definitions(source)
        if definitions != record.functions.keys():
            differences = ", ".join(sorted(definitions ^ record.functions.keys()))
            raise CatalogError(
                f"catalog and functions differ in {relative}: {differences}"
            )
        yield relative, source, record.functions


def analyze_reviewed(
    source: str, function: str, review: ReviewedBounds
) -> Analysis | ReviewedBounds:
    if review.sequence is None:
        return review
    try:
        inferred = analyze(source, function, size=review.sequence, sequence=True)
    except UnsupportedSyntax:
        return review
    return replace(inferred, steps=(f"n = len({review.sequence}).", *inferred.steps))


def analyze_leetcode(path: Path, function: str) -> Analysis | ReviewedBounds:
    """Derive bounds or return the reviewed argument for a LeetCode
    solution."""
    source = path.read_text(encoding="utf-8")
    return analyze_reviewed(source, function, get_review(path, function, source))
