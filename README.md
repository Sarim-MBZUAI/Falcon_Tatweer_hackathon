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

> Status: scaffolding. Implementation in progress (see CHANGELOG below).

## Changelog
- Bootstrap: repo skeleton, `.gitignore`, README.
