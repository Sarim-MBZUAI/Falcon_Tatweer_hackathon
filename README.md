# Hakim AI

A bilingual (Arabic & English) market-research avatar that helps **local entrepreneurs in rural communities** decide **with evidence instead of guesswork**.

Built for the **Tatweer Hackathon**, Challenge 3: _The data gap for local entrepreneurs_.

---

## The problem

Entrepreneurs in rural communities often make decisions in the dark. There is little local data on customers, demand, or what the area actually needs, so people guess.

These are communities where many families run camel farms as a main source of income and where local insight — not generic national statistics — is what's missing. Hakim closes that local data gap.

## The solution

**Hakim AI** is a talking avatar that:

- Speaks **Arabic (UAE dialect) and English**.
- Talks to an entrepreneur about what to build, what to sell, or where to focus.
- Performs **market research** and makes sense of scattered local information.
- Visualizes market trends with dynamic charts.
- Backs every answer with a **citation**.

It was **benchmarked on 50 manually curated QA pairs** representative of real questions a local entrepreneur would ask.

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
- **Framer Motion** for animations
- **lucide-react** icons
- Fonts: Space Grotesk (display), Inter (body), IBM Plex Sans Arabic (RTL)

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
npm start
```

## Deployment

The site is a lightweight Next.js app and deploys to **Vercel** with one click — low cost, scales to zero when idle, and minimal maintenance.

## Editing content

All copy and numbers (benchmark stats, sample QA, accuracy scores, criteria text, repo URL) live in [`lib/data.ts`](lib/data.ts). Update values there — no component changes needed.

## Home page sections

1. **Hero** — Hakim AI intro + `Try Agent` call to action.
2. **Benchmark** — 50 curated QA, hours of research, team size, plus a sample English and a sample UAE-Arabic QA with citations.
3. **Score** — measured accuracy of the agent.
4. **Impact / Relevance / Feasibility / Readiness / Scalability** — judging-criteria evidence.
5. **Repository & documentation** — repo link and what the README covers.

## Scalability

Nothing about Hakim is locked to one place. Swap the local knowledge base and the same agent serves any rural community in the UAE and beyond.
