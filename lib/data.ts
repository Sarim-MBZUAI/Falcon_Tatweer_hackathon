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
  { value: 50, suffix: "", label: "Curated QA pairs", sub: "Handcrafted, English & Arabic" },
  { value: 7, suffix: "", label: "Hours to build", sub: "Idea to working demo" },
  { value: 4, suffix: "", label: "Contributors", sub: "Wrote the benchmark by hand" },
];

// Single, honest headline metric from the LLM-as-judge evaluation.
export const benchmarkAccuracy = {
  value: 74,
  method: "LLM-as-judge, scored against human-written reference answers",
};

export const accuracyFacts = [
  "50 handcrafted QA samples",
  "English + 10 Arabic prompts",
  "4 scenario categories",
  "Answers gated on real citations",
];

export type SampleQA = {
  lang: "en" | "ar";
  dir: "ltr" | "rtl";
  tag: string;
  question: string;
  answer: string;
  rationale: string;
};

export const sampleQAs: SampleQA[] = [
  {
    lang: "en",
    dir: "ltr",
    tag: "English",
    question:
      "I want to open a small karak and snacks kiosk near my rural town. How can I check if people actually want it?",
    answer:
      "Start with a one-week demand test before renting anything. Ask 30 nearby residents, farm workers, and weekend visitors three questions: when they pass the area, what they currently buy, and how much they would pay for karak and snacks. Also run a simple WhatsApp pre-order form for Thursday to Saturday evenings. Launch only if you get at least 20 serious responses or 10 paid pre-orders.",
    rationale:
      "Checks whether the assistant gives a practical, low-cost validation plan instead of simply saying the idea is good.",
  },
  {
    lang: "ar",
    dir: "rtl",
    tag: "UAE Arabic",
    question:
      "أبغي أفتح مشروع توصيل طلبات بسيط في منطقتي. كيف أعرف إذا الناس فعلاً محتاجينه؟",
    answer:
      "أبدأ بتجربة بسيطة لمدة أسبوع. سوِّ فورم على واتساب أو Google Forms واسأل الناس: شو أكثر شيء يطلبونه من برّا المنطقة؟ كم مرة بالأسبوع؟ وكم مستعدين يدفعون للتوصيل؟ إذا جمعت 15 طلبًا مدفوعًا أو 5 عملاء كرروا الطلب، فغالبًا الفكرة تستحق تكمل فيها.",
    rationale:
      "يتأكد أن حكيم يرد بطبيعية بالعربية ويقترح خطوة تحقق بسيطة وقابلة للقياس لمشروع ريفي محلي.",
  },
];

// Short, honest statement of the integrity guarantee behind every answer.
export const citationGate = {
  title: "Citation-gated researcher agent",
  body: "Hakim does not treat a business answer as valid unless the researcher tool returns citations alongside it. If the tool cannot support its output with evidence, that answer is not used. Supported findings stay separate from assumptions, so when someone asks \"how do you know?\", the answer is cited evidence, not AI confidence.",
};

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
    title: "Better decisions before money is spent",
    body: "Hakim helps local entrepreneurs decide before they invest, turning a guess into an evidence-based next step. For people who cannot afford formal market research or a business consultant, that is the difference between a cheap test and a costly mistake.",
    bullets: [
      "Shows whether people may actually want the product or service",
      "Names the first customers and the cheapest test to run",
      "Surfaces the risks and the evidence that is still missing",
    ],
    icon: Target,
  },
  {
    id: "relevance",
    eyebrow: "Relevance",
    title: "Built straight for Challenge 3",
    body: "Challenge 3 is the data gap for local entrepreneurs. Hakim is built specifically for it, a UAE-focused market-research helper for someone with no data team, not a generic chatbot.",
    bullets: [
      "Turns vague ideas into testable, measurable next steps",
      "Prefers UAE-specific, emirate-level evidence",
      "Helps gauge demand, competitors, and feasibility",
    ],
    icon: Compass,
  },
  {
    id: "feasibility",
    eyebrow: "Feasibility",
    title: "Lightweight, web-based, cheap to run",
    body: "Hakim needs no expensive hardware, no complex install, and no large operations team. Entrepreneurs reach it through a web app and interact by voice or text, whichever they are comfortable with.",
    bullets: [
      "Standard web frontend, deployable in minutes",
      "Web-search grounding instead of relying on model memory alone",
      "Structured, validated output rendered as text, charts, and citations",
    ],
    icon: CheckCircle2,
  },
  {
    id: "readiness",
    eyebrow: "Readiness",
    title: "Working end to end today",
    body: "Hakim is not just an idea. The demo runs end to end: a user can ask about a business idea and receive a practical, evidence-aware response, spoken aloud and shown on screen.",
    bullets: [
      "Voice and text input in English and Arabic",
      "Avatar speech output with on-screen text",
      "Custom market_researcher tool, charts, and citations live",
    ],
    icon: Rocket,
  },
  {
    id: "scalability",
    eyebrow: "Scalability",
    points: "10 pts",
    title: "Replicable to any community",
    body: "The data gap exists far beyond one village, so the same workflow serves many communities. Swap the focus and Hakim adapts to other rural areas, emirates, tourism or farming hubs, and youth programs.",
    bullets: [
      "Same engine, new region, no rebuild required",
      "Roadmap: WhatsApp, saved reports, community surveys",
      "Can plug into official UAE open-data sources",
    ],
    icon: Globe2,
  },
];
