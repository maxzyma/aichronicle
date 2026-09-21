#!/usr/bin/env python3
"""Check local Markdown links and document reachability from the README."""

from pathlib import Path
import re
import sys
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
LINK = re.compile(r"(?<!!)\[[^\]]+\]\(([^\s)]+)\)")
DOC_ROOTS = ("docs", "templates")
ROOT_DOCS = ("README.md", "CONTRIBUTING.md", "LICENSE-CONTENT.md")


def targets(path: Path) -> tuple[Path, ...]:
    """Resolve relative file links; external URLs are outside this check."""
    links = (urlsplit(link) for link in LINK.findall(path.read_text()))
    return tuple(
        (path.parent / unquote(link.path)).resolve()
        for link in links
        if not link.scheme and not link.netloc and link.path
    )


def walk(path: Path, visited: frozenset[Path]) -> frozenset[Path]:
    """Follow documentation links without revisiting cycles."""
    if path in visited or not path.is_file() or path.suffix != ".md":
        return visited
    reached = visited | {path}
    for target in targets(path):
        if target.is_relative_to(ROOT):
            reached = walk(target, reached)
    return reached


def main() -> int:
    documents = tuple(ROOT / name for name in ROOT_DOCS) + tuple(
        path for folder in DOC_ROOTS for path in (ROOT / folder).rglob("*.md")
    )
    missing = tuple(path for path in documents if not path.is_file())
    broken = tuple(
        (path, target)
        for path in documents if path.is_file()
        for target in targets(path)
        if not target.is_relative_to(ROOT) or not target.exists()
    )
    reached = walk(ROOT / "README.md", frozenset())
    orphaned = tuple(path for path in documents if path not in reached)
    for path in missing:
        print(f"Missing document: {path.relative_to(ROOT)}", file=sys.stderr)
    for path, target in broken:
        print(f"Invalid link in {path.relative_to(ROOT)}: {target.name}", file=sys.stderr)
    for path in orphaned:
        print(f"Unreachable document: {path.relative_to(ROOT)}", file=sys.stderr)
    if missing or broken or orphaned:
        return 1
    print(f"OK: {len(documents)} documents reachable; local file links resolve.")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except (OSError, ValueError) as error:
        print(f"Documentation check failed: {error}", file=sys.stderr)
        sys.exit(1)
