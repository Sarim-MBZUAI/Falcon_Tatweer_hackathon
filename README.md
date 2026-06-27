# Hakim AI

A bilingual (Arabic & English) market-research avatar that helps **local entrepreneurs in rural communities** decide **with evidence instead of guesswork**.

Built for the **Tatweer Hackathon**, Challenge 3: _The data gap for local entrepreneurs_.

---

## The problem

Entrepreneurs in rural communities often make decisions in the dark. There is little local data on customers, demand, or what the area actually needs, so people guess.

These are communities where many families run camel farms as a main source of income and where local insight (not generic national statistics) is what's missing. Hakim closes that local data gap.

## The solution

**Hakim AI** is a talking avatar that:

- Speaks **Arabic (UAE dialect) and English**.
- Talks to an entrepreneur about what to build, what to sell, or where to focus.
- Performs **market research** and makes sense of scattered local information.
- Visualizes market trends with dynamic charts.
- Backs every answer with a **citation**.

It was **benchmarked on 50 manually curated QA pairs** representative of real questions a local entrepreneur would ask.

![Hakim AI — from a spoken or typed question to grounded market research: understand, plan, web-research, analyze, synthesize, and answer out loud with charts and citations](artifacts/readme_diagram.png)

---

## This repository

| Part | What it is |
| --- | --- |
| `app/`, `components/`, `lib/` | The Next.js landing site presenting the solution and evidence |
| `lib/data.ts` | All editable content: benchmark stats, sample QA + citations, scores, judging-criteria copy |
| `public/hakim.png` | The Hakim AI avatar |

> The agent and the full 50-QA benchmark set are tracked alongside this site so judges can reproduce every claim.

## Tech stack

- **Next.js (App Router)** + **TypeScript**
- **Tailwind CSS v4**
- **Framer Motion** for animations, **Recharts** for data charts
- **lucide-react** icons
- **Anam AI** real-time avatar (client-side custom LLM)
- **FastAPI** Python service wrapping the `market_researcher` tool
- Fonts: Space Grotesk (display), Inter (body), IBM Plex Sans Arabic (RTL)

## The live agent (`/hakim`)

`/hakim` is a full-screen talking avatar. The user just talks (Arabic or
English) and the avatar listens live, answers out loud, and a side panel renders
the grounded UAE market data (a chart) and the sources behind it. Typing is also
supported.

Voice is fully hands-free: browser-side **voice-activity detection** (Silero VAD
via `@ricky0123/vad-web`) detects when the user starts and stops talking, each
utterance is transcribed by **OpenAI `gpt-4o-transcribe`** (auto-detects Arabic
vs English), and the user can barge in to interrupt the avatar mid-sentence.

How it fits together:

```
Browser (/hakim)  ──session token──▶  Next /api/anam/session-token ──▶ Anam API
      │  WebRTC video + voice  ◀────────────────────────────────────────┘
      │  VAD detects an utterance ──▶ Next /api/transcribe ──▶ FastAPI /transcribe
      │                                          └─ OpenAI gpt-4o-transcribe
      │  user message ──▶ Next /api/agent ──▶ Python FastAPI /agent
      │                                          └─ OpenAI + market_researcher tool
      └─ speaks spoken_text via Anam, renders research (chart + citations)
```

The Anam persona is created with `llmId: "CUSTOMER_CLIENT_V1"` (brain disabled),
so we own the conversation logic and can render the structured tool output in
the browser. Anam supplies the face and voice only; its built-in mic input is
muted so all transcription goes through OpenAI. Headphones are recommended so the
avatar's own voice doesn't trigger the mic.

## Environment

Create a `.env` in the project root (git-ignored):

```bash
OPENAI_API_KEY=sk-...          # used by the Python agent service
ANAM_API_KEY=...               # used by Next.js to create the avatar/persona and mint session tokens
AGENT_SERVICE_URL=http://127.0.0.1:8001
```

## Getting started

```bash
# 1. Web app deps (postinstall copies the VAD model + ONNX wasm into public/vad)
npm install

# 2. Python agent service deps (isolated venv)
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt

# 3. Create the Hakim avatar + persona once (writes anam-agent.json)
npm run setup:anam

# 4. Run both processes (in two terminals)
npm run agent     # Python FastAPI agent on :8001
npm run dev       # Next.js app on :3000
```

Open [http://localhost:3000](http://localhost:3000) and click **Try Agent**.

> Note: creating a custom avatar from `hakim.png` requires an Anam enterprise
> plan. Without it, `setup:anam` automatically falls back to a stock avatar (the
> persona, male voice, and full agent still work). Swap `avatarId` in
> `anam-agent.json` to use a different face.

## Build

```bash
npm run build
npm start
```

## Deployment

The site is a lightweight Next.js app and deploys to **Vercel** with one click: low cost, scales to zero when idle, and minimal maintenance.

## Editing content

All copy and numbers (benchmark stats, sample QA, accuracy scores, criteria text, repo URL) live in [`lib/data.ts`](lib/data.ts). Update values there, no component changes needed.

## Home page sections

1. **Hero**: Hakim AI intro + `Try Agent` call to action.
2. **Benchmark**: 50 curated QA, hours of research, team size, plus a sample English and a sample UAE-Arabic QA with citations.
3. **Score**: measured accuracy of the agent.
4. **Impact / Relevance / Feasibility / Readiness / Scalability**: judging-criteria evidence.
5. **Repository & documentation**: repo link and what the README covers.

## Scalability

Nothing about Hakim is locked to one place. Swap the local knowledge base and the same agent serves any rural community in the UAE and beyond.
