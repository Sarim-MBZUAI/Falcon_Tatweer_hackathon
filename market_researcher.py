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
from pydantic import BaseModel, Field

# Load env (walks up to find the parent .env holding OPENAI_API_KEY). Safe at import:
# this only reads a dotenv file, it does not make network calls.
load_dotenv(find_dotenv())

# Default OpenAI model. Must support the built-in web_search tool. Overridable via param.
DEFAULT_MODEL = "gpt-4.1"

SYSTEM_PROMPT = """\
You are a senior market research analyst working EXCLUSIVELY for the United Arab \
Emirates (UAE) market. Your job is to help LOCAL UAE entrepreneurs decide what to \
build or sell using REAL data, not guesswork.

SCOPE (non-negotiable):
- Every number, segment, demand figure, competitor, channel, and regulation MUST be \
UAE-specific. Prefer emirate-level granularity (Dubai, Abu Dhabi, Sharjah, and the \
other emirates) where possible.
- If the user's idea implies a non-UAE market, REFRAME the analysis to the UAE and \
say so in the uae_scope_note and disclaimers.

GROUNDING (anti-hallucination — most important):
- Use ONLY facts found via the web_search tool for citations. Actually search before \
citing. Prefer authoritative UAE sources: Federal Competitiveness and Statistics \
Centre (FCSC), Statistics Centre Abu Dhabi (SCAD), Dubai Statistics Center (DSC), \
Dubai Chamber of Commerce, UAE Central Bank, Ministry of Economy, Dubai SME, the \
Department of Economy and Tourism / DED, and official emirate open-data portals.
- NEVER fabricate statistics, citations, URLs, publishers, or years. If you did not \
actually find a real source/URL via web search, DO NOT invent one — omit it, or set \
its confidence to "low" and explain the gap in disclaimers.
- Every numeric value in graphs_data and every quantitative claim must EITHER trace \
to a real entry in data_citation, OR have is_estimate=true with a note stating it is \
a directional estimate, not measured data.
- Clearly separate VERIFIED data from REASONING/ESTIMATES. When data is unavailable, \
say so honestly in disclaimers rather than guessing precise figures.

OUTPUT:
- Return output STRICTLY within the provided JSON schema. No extra keys, no prose \
outside the schema.
- disclaimers MUST explicitly flag which figures are estimates vs. verified, and note \
that this is decision-support, not financial advice.
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


class Feasibility(BaseModel):
    score: int = Field(ge=0, le=100)
    verdict: str
    reasoning: str
    risks: list[str]


class Segment(BaseModel):
    name: str
    description: str
    size_estimate: str
    is_estimate: bool


class Persona(BaseModel):
    name: str
    description: str


class TargetAudience(BaseModel):
    segments: list[Segment]
    primary_persona: Persona


class Strategy(BaseModel):
    summary: str
    steps: list[str]
    channels: list[str]
    differentiation: str


class Citation(BaseModel):
    claim: str
    source_name: str
    publisher: str
    url: str
    year: Optional[str] = None
    confidence: Literal["high", "medium", "low"]


class MarketResearch(BaseModel):
    input_description: str
    uae_scope_note: str
    feasibility: Feasibility
    graphs_data: list[Graph]
    target_audience: TargetAudience
    best_strategy: Strategy
    data_citation: list[Citation]
    disclaimers: list[str]


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
            "OPENAI_API_KEY is not set. Add it to the environment or a .env file "
            "(see /home/lukas/users/shashmi/falcon_tatweer_hackathon/.env)."
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
    # Echo the original input regardless of what the model returned.
    data["input_description"] = description
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
