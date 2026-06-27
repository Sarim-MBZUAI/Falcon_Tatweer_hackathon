"""market_researcher: UAE-scoped, web-search-grounded market research tool.

A single agent-callable function that takes a free-text business idea and returns
structured, JSON-serializable market research focused exclusively on the United Arab
Emirates. Grounding is done with the OpenAI Responses API + built-in web_search tool;
output is validated with pydantic before being returned.

This module performs NO network calls at import time.
"""

from __future__ import annotations

import json
import os
from typing import Literal, Optional, Union

from dotenv import find_dotenv, load_dotenv
from pydantic import BaseModel

# Load env (walks up to find the parent .env holding OPENAI_API_KEY). Safe at import:
# this only reads a dotenv file, it does not make network calls.
load_dotenv(find_dotenv())

# Default OpenAI model. Must support the built-in web_search tool. Overridable via param.
DEFAULT_MODEL = "gpt-4.1"

SYSTEM_PROMPT = """\
You are a market-research advisor for LOCAL UAE entrepreneurs. Help them decide what to \
build or sell using REAL UAE data, not guesswork.

ANSWER STYLE (this is graded — get it right):
- ANSWER THE USER'S ACTUAL QUESTION FIRST, directly and concisely. Most users want a \
practical next step, not a long report. Lead with the cheapest concrete way to validate \
demand (talk to ~10-30 real local people, run a WhatsApp/Instagram pre-order, do one \
small paid pilot) plus a clear go / no-go signal.
- Be short and action-first: specific steps and numbers, not a generic essay. Include \
market-size data only when it genuinely helps the decision.
- LANGUAGE: write text_summary in the SAME language as the user's question (Arabic \
question -> Arabic answer).

SCOPE: every figure, segment, competitor, channel and regulation must be UAE-specific \
(prefer emirate level: Dubai, Abu Dhabi, Sharjah...). If the idea implies a non-UAE \
market, reframe to the UAE and say so.

GROUNDING (anti-hallucination): use the web_search tool before citing. Prefer \
authoritative UAE sources (FCSC, SCAD, DSC, Dubai Chamber, UAE Central Bank, Ministry of \
Economy, Dubai SME, DET/DED, official open-data portals). NEVER invent statistics, URLs, \
publishers or years. Mark any unverified number is_estimate=true and call it a \
directional estimate.

OUTPUT — return ONE complete, valid JSON object with EXACTLY these 3 fields and nothing \
else. The output is parsed strictly and REJECTED on any type mismatch, so follow the \
types exactly:
- text_summary: string (the answer described above).
- chart_data: a list with exactly ONE chart object. The object MUST include ALL of: \
title (string), chart_type (one of "bar","line","pie"), x_label (string), y_label \
(string), series (list of {label: string, points: [{x: string or number, y: number}]}), \
is_estimate (true or false), source_ref (string or null), note (NON-EMPTY string). Give \
the series 4+ points; every y MUST be a number — use your best numeric estimate, NEVER null.
- data_citation: a list of sources. Each item MUST have: claim (string), source_name \
(string), publisher (string), url (NON-EMPTY string), year (string in quotes e.g. "2025" \
— NEVER a bare number), confidence (one of "high","medium","low"). Only include a source \
if you actually have its real URL; if you found none, return an empty list [].
"""


# --------------------------------------------------------------------------------------
# Pydantic models (internal validation; the public return is model.model_dump()).
# --------------------------------------------------------------------------------------
class Point(BaseModel):
    x: Union[str, float]
    y: float


class Series(BaseModel):
    label: str
    points: list[Point]


class Graph(BaseModel):
    title: str
    chart_type: Literal["bar", "line", "pie"]
    x_label: str
    y_label: str
    series: list[Series]
    is_estimate: bool
    source_ref: Optional[str] = None
    note: str


class Citation(BaseModel):
    claim: str
    source_name: str
    publisher: str
    url: str
    year: Optional[str] = None
    confidence: Literal["high", "medium", "low"]


class MarketResearch(BaseModel):
    text_summary: str
    chart_data: list[Graph]
    data_citation: list[Citation]

def _json_schema() -> dict:
    """JSON schema handed to the Responses API for structured output.

    strict is left off (False) so flexible types (x as str|number, nullable fields)
    are allowed; pydantic does the real validation on the way out.
    """
    return MarketResearch.model_json_schema()


def market_researcher(
    description: str,
    *,
    model: str | None = None,
    provider: str = "openai",
) -> dict:
    """Run UAE-scoped, web-search-grounded market research on a business idea.

    Args:
        description: Free-text business/product idea.
        model: OpenAI model override; defaults to a web_search-capable model.
        provider: LLM provider. Only "openai" is implemented today.

    Returns:
        JSON-serializable dict matching the MarketResearch schema.
    """
    if provider != "openai":
        # Seam for future Falcon / Fireworks support. Wire a new branch here that
        # builds the same MarketResearch dict from that provider's API.
        raise NotImplementedError(
            f"provider={provider!r} is not supported yet; only 'openai' is implemented "
            "(Falcon/Fireworks grounding support is planned)."
        )

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError(
            "OPENAI_API_KEY is not set. Add it to your environment or a .env file."
        )

    # Imported lazily so module import never requires the SDK to be installed at import.
    from openai import OpenAI

    client = OpenAI(api_key=api_key)

    user_input = (
        "Business idea to research (UAE market only):\n"
        f"{description}\n\n"
        "Search the web for real, authoritative UAE sources, then fill the JSON schema. "
        "Cite only sources you actually found, and mark every unverified number as an "
        "estimate."
    )

    response = client.responses.create(
        model=model or DEFAULT_MODEL,
        instructions=SYSTEM_PROMPT,
        input=user_input,
        tools=[{"type": "web_search", "user_location": {"type": "approximate", "country": "AE"}}],
        text={
            "format": {
                "type": "json_schema",
                "name": "market_research",
                "schema": _json_schema(),
                "strict": False,
            }
        },
    )

    # output_text aggregates the final text content of the response.
    raw = response.output_text
    if not raw:
        raise RuntimeError("OpenAI returned no text output for the market research request.")

    data = json.loads(raw)
    validated = MarketResearch.model_validate(data)
    return validated.model_dump()


if __name__ == "__main__":
    # Tiny demo: only runs if a key is present. Never fails the import.
    if os.getenv("OPENAI_API_KEY"):
        try:
            result = market_researcher(
                "A premium specialty coffee subscription delivered to homes in Dubai."
            )
            print(json.dumps(result, indent=2, ensure_ascii=False))
        except Exception as exc:  # noqa: BLE001 - demo only
            print(f"Demo skipped due to error: {exc}")
    else:
        print("OPENAI_API_KEY not set; skipping live demo.")
