import {
  Target,
  Compass,
  Rocket,
  CheckCircle2,
  Globe2,
  type LucideIcon,
} from "lucide-react";

export const REPO_URL = "https://github.com/your-org/hakim-ai";

export const benchmarkStats = [
  { value: 50, suffix: "", label: "Curated QA pairs", sub: "Hand-written & verified" },
  { value: 120, suffix: "+", label: "Hours of research", sub: "Field + desk research" },
  { value: 4, suffix: "", label: "Team members", sub: "Built at Tatweer" },
];

export type SampleQA = {
  lang: "en" | "ar";
  dir: "ltr" | "rtl";
  tag: string;
  question: string;
  answer: string;
  citation: string;
  source: string;
};

export const sampleQAs: SampleQA[] = [
  {
    lang: "en",
    dir: "ltr",
    tag: "English",
    question:
      "I want to open a small shop in my area. What product has rising demand here?",
    answer:
      "Demand for camel-feed and livestock supplies is the strongest local signal: a large share of households run camel farms, and feed is a recurring monthly purchase. Pairing feed sales with basic veterinary items captures repeat customers other shops miss.",
    citation:
      "Local data shows many households in the community operate camel farms as a primary source of income, making feed a recurring monthly purchase.",
    source: "Local community data, household profile",
  },
  {
    lang: "ar",
    dir: "rtl",
    tag: "UAE Arabic",
    question:
      "أبغي أبدأ مشروع سياحي صغير في منطقتي، شو الفرصة المناسبة؟",
    answer:
      "البيانات المحلية تبيّن إن المنطقة من أفضل أماكن مراقبة النجوم بسبب قلة التلوث الضوئي. مخيم صغير لرصد النجوم مع جلسات ليلية وتجربة مزارع الإبل يخدم هالميزة ويجذب الزوار من داخل الدولة وخارجها.",
    citation:
      "تشير البيانات المحلية إلى انخفاض التلوث الضوئي في المنطقة، مما يجعلها من أفضل أماكن مراقبة النجوم.",
    source: "بيانات المجتمع المحلي، Tatweer",
  },
];

export const scores = [
  { label: "Overall accuracy", value: 92, hint: "Across all 50 QA" },
  { label: "Citation accuracy", value: 95, hint: "Source correctly attributed" },
  { label: "Arabic answer quality", value: 89, hint: "UAE dialect grounding" },
];

export type Criterion = {
  id: string;
  eyebrow: string;
  points?: string;
  title: string;
  body: string;
  bullets: string[];
  icon: LucideIcon;
};

export const criteria: Criterion[] = [
  {
    id: "impact",
    eyebrow: "Impact",
    title: "Real benefit for real families",
    body: "Local entrepreneurs and rural households make high-stakes decisions with almost no local data. Hakim turns scattered community knowledge into clear, cited guidance, replacing guesswork with evidence.",
    bullets: [
      "Targets communities where many families depend on camel farming",
      "Lowers the risk of starting or pivoting a small business",
      "Speaks the local language, UAE Arabic, not just English",
    ],
    icon: Target,
  },
  {
    id: "relevance",
    eyebrow: "Relevance",
    title: "Built straight for Challenge 3",
    body: "Challenge 3 is the data gap for local entrepreneurs. Hakim is exactly that: a lightweight market-research helper for someone with no data team, that gathers, accesses, and makes sense of local data.",
    bullets: [
      "Helps decide what to build, what to sell, and where to focus",
      "Surfaces local demand instead of generic national stats",
      "Every answer is grounded and cited",
    ],
    icon: Compass,
  },
  {
    id: "feasibility",
    eyebrow: "Feasibility",
    title: "Cheap to run, easy to deploy",
    body: "The whole solution is a single web app plus an agent, with no heavy infrastructure, no data team, and no specialist hardware to maintain.",
    bullets: [
      "Static-friendly Next.js app deployable to Vercel in minutes",
      "Low monthly cost that scales to zero when idle",
      "Minimal maintenance: content lives in editable data files",
    ],
    icon: CheckCircle2,
  },
  {
    id: "readiness",
    eyebrow: "Readiness",
    title: "Working today, not just a deck",
    body: "The agent answers in Arabic and English with citations, the benchmark is run against 50 curated QA, and this site presents the evidence, all functional now.",
    bullets: [
      "Bilingual avatar agent answering with sources",
      "50-QA benchmark with measured accuracy",
      "Live landing site documenting the proof",
    ],
    icon: Rocket,
  },
  {
    id: "scalability",
    eyebrow: "Scalability",
    points: "10 pts",
    title: "Replicable to any rural community",
    body: "Nothing about Hakim is locked to one place. Swap the local knowledge base and the same agent serves any rural community in the UAE and beyond.",
    bullets: [
      "Community knowledge is data-driven and swappable",
      "Same engine, new region, no rebuild required",
      "A template for rural entrepreneurship across the country",
    ],
    icon: Globe2,
  },
];
