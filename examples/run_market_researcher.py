#!/usr/bin/env python3
"""CLI runner for the ``market_researcher`` tool.

Reads a business description from argv (joined) or stdin, falling back to a
sample UAE idea, calls ``market_researcher`` and pretty-prints the returned
dict as indented JSON.

Usage:
    python examples/run_market_researcher.py "a specialty coffee shop in Dubai Marina"
    echo "a halal cloud kitchen in Sharjah" | python examples/run_market_researcher.py

Requires ``OPENAI_API_KEY`` in the parent ``.env`` (loaded via python-dotenv);
the tool makes live web-search API calls that cost money.
"""

import json
import sys

from dotenv import load_dotenv

from market_researcher import market_researcher

DEFAULT_DESCRIPTION = "a specialty coffee shop in Dubai Marina"


def read_description() -> str:
    """Resolve the business description from argv, then stdin, then default."""
    if len(sys.argv) > 1:
        return " ".join(sys.argv[1:]).strip()
    if not sys.stdin.isatty():
        piped = sys.stdin.read().strip()
        if piped:
            return piped
    return DEFAULT_DESCRIPTION


def main() -> int:
    load_dotenv()  # loads parent .env (OPENAI_API_KEY, etc.)
    description = read_description()
    result = market_researcher(description)
    print(json.dumps(result, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
