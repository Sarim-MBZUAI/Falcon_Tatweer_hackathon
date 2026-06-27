// Shared types for the market_researcher tool output (matches the Python
// MarketResearch schema: exactly text_summary, chart_data, data_citation).

export type ChartPoint = { x: string | number; y: number };
export type ChartSeries = { label: string; points: ChartPoint[] };

export type Graph = {
  title: string;
  chart_type: "bar" | "line" | "pie";
  x_label: string;
  y_label: string;
  series: ChartSeries[];
  is_estimate: boolean;
  source_ref?: string | null;
  note: string;
};

export type Citation = {
  claim: string;
  source_name: string;
  publisher: string;
  url: string;
  year?: string | null;
  confidence: "high" | "medium" | "low";
};

export type Research = {
  text_summary: string;
  chart_data: Graph[];
  data_citation: Citation[];
};

export type AgentResult = {
  spoken_text: string;
  research: Research | null;
  used_tool: boolean;
};

export type SampleQuestion = { id: string; lang: "en" | "ar"; text: string };

// Clickable starter questions, tuned for rural UAE entrepreneurs.
export const sampleQuestions: SampleQuestion[] = [
  {
    id: "q-camel-feed",
    lang: "en",
    text: "Is there demand for a camel feed and livestock supplies shop in a rural town near Al Ain?",
  },
  {
    id: "q-stargazing",
    lang: "en",
    text: "Would a stargazing tourism camp work in a low light pollution area of the UAE?",
  },
  {
    id: "q-dates",
    lang: "en",
    text: "I want to sell premium packaged dates online in the UAE. What is the market like?",
  },
  {
    id: "q-grocery-ar",
    lang: "ar",
    text: "أبغي أفتح بقالة صغيرة في منطقة ريفية بالإمارات، شو المنتجات اللي عليها طلب؟",
  },
  {
    id: "q-camel-ar",
    lang: "ar",
    text: "هل مشروع محل أعلاف ومستلزمات إبل فكرة ناجحة في مزارع الإمارات؟",
  },
  {
    id: "q-tourism-ar",
    lang: "ar",
    text: "ما رأيك بمخيم سياحي لرصد النجوم في منطقة بعيدة عن أضواء المدينة؟",
  },
];

export function hasArabic(text: string): boolean {
  return /[\u0600-\u06FF]/.test(text);
}
