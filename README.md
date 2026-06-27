# Falcon Tatweer Hackathon

Tools for **Challenge 3 — The data gap for local entrepreneurs**: help a UAE-based
local entrepreneur or small business owner decide what to build/sell/where to focus
using evidence instead of guesswork.

## Tools

### `market_researcher`
A Python tool (called by an agent) that takes a free-text business description and
returns UAE-scoped market research as structured data:

| Field | What it gives |
|-------|---------------|
| `feasibility` | Score (0–100), verdict, reasoning, key risks |
| `graphs_data` | Chart-ready series (demand, market size, trends) |
| `data_citation` | Real, web-sourced UAE references only |
| `target_audience` | Segments, sizes, primary persona |
| `best_strategy` | Summary, go-to-market steps, channels, differentiation |

**Grounding & anti-hallucination:** UAE-only scope, live web search for citations,
and a system prompt that forbids inventing stats/sources and flags every estimate.

#### Usage

```python
from market_researcher import market_researcher

result = market_researcher("a specialty coffee shop in Dubai Marina")
```

Returns a JSON-serializable dict shaped like:

```jsonc
{
  "input_description": "a specialty coffee shop in Dubai Marina",
  "uae_scope_note": "All figures scoped to the UAE.",
  "feasibility": { "score": 72, "verdict": "Promising", "reasoning": "...", "risks": ["High rent", "..."] },
  "graphs_data": [
    { "title": "UAE coffee market size", "chart_type": "line", "x_label": "Year",
      "y_label": "AED (billions)",
      "series": [ { "label": "Market size", "points": [ { "x": 2022, "y": 1.2 } ] } ],
      "is_estimate": true, "source_ref": "Statista 2023", "note": "..." }
  ],
  "target_audience": { "segments": [ /* ... */ ], "primary_persona": { "name": "Layla", "description": "..." } },
  "best_strategy": { "summary": "...", "steps": ["..."], "channels": ["..."], "differentiation": "..." },
  "data_citation": [
    { "claim": "...", "source_name": "...", "publisher": "Statista",
      "url": "https://...", "year": 2023, "confidence": "medium" }
  ],
  "disclaimers": ["Figures are estimates; verify before investing."]
}
// ... (output truncated)
```

#### Setup

Add your OpenAI key to the **parent `.env`** (loaded via `python-dotenv`):

```
OPENAI_API_KEY=sk-...
```

The tool makes **live web-search calls that cost money**. Output is **UAE-scoped
only**, and every estimate is flagged (`is_estimate` / `disclaimers`) — citations
must be real, web-sourced UAE references (anti-hallucination by design).

#### Run the example

```bash
python examples/run_market_researcher.py "a specialty coffee shop in Dubai Marina"
# or pipe a description, or omit args to use the default sample idea
```

#### Run the tests

```bash
pip install -r requirements-dev.txt
pytest               # offline by default; the live test is opt-in
```

Tests don't hit the network: the OpenAI call is mocked and contract-validated.
The end-to-end live test only runs when `OPENAI_API_KEY` is set **and**
`RUN_LIVE_TESTS=1`. If the implementation isn't merged yet, tests skip cleanly.

> Status: scaffolding. Implementation in progress (see CHANGELOG below).

## Changelog
- Bootstrap: repo skeleton, `.gitignore`, README.
- Docs/tests: example runner (`examples/run_market_researcher.py`), mocked
  contract tests (`tests/test_market_researcher.py`), `requirements-dev.txt`,
  and expanded `market_researcher` usage docs.
