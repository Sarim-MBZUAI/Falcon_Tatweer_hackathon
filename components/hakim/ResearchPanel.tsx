"use client";

import { BarChart3, BookOpen, ExternalLink, Loader2, Sparkles } from "lucide-react";
import { hasArabic, type Citation, type Research } from "@/lib/research";
import { ResearchChart } from "./ResearchChart";

const confidenceStyles: Record<Citation["confidence"], string> = {
  high: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  medium: "border-gold/40 bg-gold/10 text-gold-soft",
  low: "border-white/20 bg-white/5 text-white/50",
};

function SectionHeading({
  icon: Icon,
  label,
}: {
  icon: typeof Sparkles;
  label: string;
}) {
  return (
    <h3 className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-gold">
      <Icon className="h-3.5 w-3.5" /> {label}
    </h3>
  );
}

function CitationCard({ c }: { c: Citation }) {
  const rtl = hasArabic(c.claim);
  return (
    <div className="rounded-xl border border-line bg-ink/60 p-3 transition-colors hover:border-gold/30">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="truncate text-xs font-semibold text-white/85">{c.source_name}</span>
        <span
          className={`shrink-0 rounded-full border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${confidenceStyles[c.confidence]}`}
        >
          {c.confidence}
        </span>
      </div>
      <p
        dir={rtl ? "rtl" : "ltr"}
        className={`line-clamp-2 text-xs leading-relaxed text-white/65 ${rtl ? "font-arabic text-right" : ""}`}
      >
        {c.claim}
      </p>
      <div className="mt-2 flex items-center gap-1.5 text-[11px] text-white/40">
        <span className="truncate">{c.publisher}</span>
        {c.year && <span className="shrink-0">· {c.year}</span>}
        {c.url && (
          <a
            href={c.url}
            target="_blank"
            rel="noreferrer"
            className="ml-auto inline-flex shrink-0 items-center gap-1 text-gold hover:text-gold-soft"
          >
            Source <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </div>
  );
}

export function ResearchPanel({
  research,
  loading,
}: {
  research: Research | null;
  loading: boolean;
}) {
  if (!research && !loading) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 text-center">
        <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/15 text-gold ring-1 ring-gold/30">
          <BarChart3 className="h-6 w-6" />
        </span>
        <p className="font-display text-lg font-semibold text-white">Market insight appears here</p>
        <p className="mt-2 text-sm leading-relaxed text-white/50">
          Ask Hakim about a business idea. He researches real UAE data and shows the chart and the
          sources behind every answer right here.
        </p>
      </div>
    );
  }

  if (loading && !research) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
        <p className="font-display text-base font-semibold text-white">Researching UAE market data</p>
        <p className="text-sm text-white/50">Searching authoritative sources and building the chart.</p>
      </div>
    );
  }

  if (!research) return null;

  const summaryRtl = hasArabic(research.text_summary);
  const charts = research.chart_data ?? [];
  const citations = research.data_citation ?? [];

  return (
    // The whole panel scrolls as one column so sections can never overlap.
    <div className="flex h-full flex-col gap-5 overflow-y-auto pr-1">
      {loading && (
        <div className="flex items-center gap-2 rounded-lg border border-gold/30 bg-gold/10 px-3 py-2 text-xs text-gold-soft">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Updating with new research...
        </div>
      )}

      {/* 1. Chart */}
      {charts.length > 0 && (
        <section>
          <SectionHeading icon={BarChart3} label="Market data" />
          <div className="flex flex-col gap-3">
            {charts.map((g, i) => (
              <div
                key={i}
                className="rounded-2xl border border-line bg-gradient-to-b from-card/80 to-card/40 p-4"
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-white">{g.title}</p>
                  {g.is_estimate && (
                    <span className="shrink-0 rounded-full border border-white/20 bg-white/5 px-2 py-0.5 text-[10px] uppercase text-white/50">
                      Estimate
                    </span>
                  )}
                </div>
                <ResearchChart graph={g} />
                {g.note && <p className="mt-2 text-xs leading-relaxed text-white/45">{g.note}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 2. Summary */}
      <section>
        <SectionHeading icon={Sparkles} label="Summary" />
        <div className="rounded-2xl border border-line bg-ink/40 p-4">
          <p
            dir={summaryRtl ? "rtl" : "ltr"}
            className={`whitespace-pre-wrap text-sm leading-relaxed text-white/75 ${summaryRtl ? "font-arabic text-right" : ""}`}
          >
            {research.text_summary}
          </p>
        </div>
      </section>

      {/* 3. Citations */}
      {citations.length > 0 && (
        <section>
          <SectionHeading icon={BookOpen} label={`Sources (${citations.length})`} />
          <div className="flex flex-col gap-2">
            {citations.map((c, i) => (
              <CitationCard key={i} c={c} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
