"""FastAPI agent service for Hakim AI.

Wraps the existing `market_researcher` tool in a small conversational agent
(mirrors chat.py) and exposes it over HTTP so the Next.js app can use it as the
client-side "brain" for the Anam avatar.

POST /agent
    body: { "messages": [ { "role": "user"|"assistant", "content": str }, ... ] }
    returns: {
        "spoken_text": str,        # short, TTS-friendly answer for the avatar
        "research": dict | null,   # latest market_researcher result (text_summary,
                                   # chart_data, data_citation) for the UI panel
        "used_tool": bool
    }

Run:  uvicorn market_research.server:app --port 8001 --reload
"""

from __future__ import annotations

import io
import json
import os

from dotenv import find_dotenv, load_dotenv
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

try:  # works when run as `uvicorn market_research.server:app` from the repo root
    from market_research.market_researcher import market_researcher
except ImportError:  # fallback when run from inside the market_research/ dir
    from market_researcher import market_researcher

load_dotenv(find_dotenv())

ORCHESTRATOR_MODEL = "gpt-4.1"
# Auto-detects language (Arabic / English) far better than a single-language STT.
TRANSCRIBE_MODEL = "gpt-4o-transcribe"

SYSTEM_PROMPT = (
    "You are Hakim AI, a warm, confident bilingual market-research advisor for "
    "local entrepreneurs in the United Arab Emirates. You speak fluent UAE "
    "Arabic and English. ALWAYS reply in the SAME language the user used "
    "(Arabic question gets an Arabic answer; English gets English).\n\n"
    "You help people decide what to build, what to sell, and where to focus. "
    "When the user raises a new or changed business idea, or asks about demand, "
    "feasibility, audience, competition, or strategy, CALL the market_researcher "
    "tool with a clear description of the idea. Do not call it again for "
    "follow-up questions that the existing research already answers.\n\n"
    "After you have the research, give a SHORT spoken answer (2 to 4 sentences) "
    "that a friendly avatar can say out loud: state the headline verdict and the "
    "single most useful insight, and tell the user that the full data, chart, "
    "and sources are shown on the screen. Write plain conversational sentences "
    "only: no markdown, no bullet points, no headings, no em dashes, and no URLs "
    "in the spoken answer. Keep it natural for text to speech."
)

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "market_researcher",
            "description": (
                "UAE-only, web-search-grounded market research for a business idea. "
                "Returns text_summary, chart_data, and data_citation."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "description": {
                        "type": "string",
                        "description": "The business or product idea to research.",
                    }
                },
                "required": ["description"],
            },
        },
    }
]


class Message(BaseModel):
    role: str
    content: str


class AgentRequest(BaseModel):
    messages: list[Message]


class AgentResponse(BaseModel):
    spoken_text: str
    research: dict | None = None
    used_tool: bool = False


app = FastAPI(title="Hakim AI Agent")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict:
    return {"ok": True, "model": ORCHESTRATOR_MODEL}


@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...)) -> dict:
    """Transcribe a short audio clip with OpenAI, auto-detecting the language.

    Returns { text, language? }. Handles Arabic and English equally well, which
    Anam's built-in transcription did not.
    """
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return {"text": "", "error": "OPENAI_API_KEY is not set"}

    from openai import OpenAI

    client = OpenAI(api_key=api_key)
    audio_bytes = await file.read()
    if not audio_bytes:
        return {"text": ""}

    buffer = io.BytesIO(audio_bytes)
    buffer.name = file.filename or "audio.webm"

    try:
        result = client.audio.transcriptions.create(
            model=TRANSCRIBE_MODEL,
            file=buffer,
        )
        return {"text": (result.text or "").strip()}
    except Exception as exc:  # surface a readable error to the client
        return {"text": "", "error": str(exc)}


@app.post("/agent", response_model=AgentResponse)
def agent(req: AgentRequest) -> AgentResponse:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return AgentResponse(
            spoken_text="The server is missing its OpenAI key, so I can't run research right now.",
            research=None,
            used_tool=False,
        )

    from openai import OpenAI

    client = OpenAI(api_key=api_key)

    messages: list[dict] = [{"role": "system", "content": SYSTEM_PROMPT}]
    for m in req.messages:
        if m.role in ("user", "assistant") and m.content:
            messages.append({"role": m.role, "content": m.content})

    latest_research: dict | None = None
    used_tool = False

    # Tool-calling loop (bounded so a misbehaving model can't spin forever).
    for _ in range(4):
        resp = client.chat.completions.create(
            model=ORCHESTRATOR_MODEL, messages=messages, tools=TOOLS
        )
        msg = resp.choices[0].message
        messages.append(msg.model_dump(exclude_none=True))

        if not msg.tool_calls:
            return AgentResponse(
                spoken_text=(msg.content or "").strip(),
                research=latest_research,
                used_tool=used_tool,
            )

        for tc in msg.tool_calls:
            used_tool = True
            try:
                args = json.loads(tc.function.arguments or "{}")
                result = market_researcher(description=args.get("description", ""))
                latest_research = result
                content = json.dumps(result, ensure_ascii=False)
            except Exception as exc:  # surface tool errors back to the model
                content = json.dumps({"error": str(exc)})
            messages.append(
                {"role": "tool", "tool_call_id": tc.id, "content": content}
            )

    # Fell out of the loop without a final text answer.
    return AgentResponse(
        spoken_text=(
            "I gathered the market data and the details are on the screen, but I "
            "had trouble summarizing it. Please try asking again."
        ),
        research=latest_research,
        used_tool=used_tool,
    )
