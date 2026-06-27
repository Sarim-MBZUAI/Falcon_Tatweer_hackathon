"use client";

import { Quote, CheckCircle2, ShieldCheck } from "lucide-react";
import { benchmarkStats, sampleQAs, citationGate, type SampleQA } from "@/lib/data";
import { SectionHeading } from "./SectionHeading";
import { Reveal } from "./Reveal";
import { CountUp } from "./CountUp";

function QACard({ qa, delay }: { qa: SampleQA; delay: number }) {
  const isArabic = qa.lang === "ar";
  return (
    <Reveal delay={delay} className="h-full">
      <article
        dir={qa.dir}
        className={`flex h-full flex-col rounded-2xl border border-line bg-card/60 p-6 backdrop-blur transition-colors hover:border-gold/40 ${
          isArabic ? "font-arabic" : ""
        }`}
      >
        <div className="mb-4 flex items-center justify-between">
          <span className="rounded-full bg-gold/10 px-2.5 py-1 text-xs font-semibold text-gold-soft">
            {qa.tag}
          </span>
          <Quote className="h-5 w-5 text-white/20" />
        </div>

        <p className="text-sm font-semibold text-white/50">
          {isArabic ? "السؤال" : "Question"}
        </p>
        <p className="mt-1 text-lg font-medium leading-relaxed text-white">
          {qa.question}
        </p>

        <p className="mt-5 text-sm font-semibold text-white/50">
          {isArabic ? "الإجابة المرجعية" : "Strong reference answer"}
        </p>
        <p className="mt-1 leading-relaxed text-white/75">{qa.answer}</p>

        <div className="mt-auto" />
        <div className="mt-6 rounded-xl border border-line bg-ink/60 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-gold">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {isArabic ? "لماذا هذا اختبار جيد" : "Why this is a good test"}
          </div>
          <p className="mt-2 text-sm leading-relaxed text-white/60">
            {qa.rationale}
          </p>
        </div>
      </article>
    </Reveal>
  );
}

export function Benchmark() {
  return (
    <section id="benchmark" className="relative mx-auto max-w-6xl px-5 py-24 sm:py-28">
      <SectionHeading
        eyebrow="Benchmark"
        title="Falsifiable, not just claimed"
        description="We didn't just build an agent, we measured it. Hakim was benchmarked on 50 handcrafted question-answer samples written by four contributors, covering realistic UAE entrepreneurship scenarios in English and Arabic across local demand, idea validation, competition, and rural feasibility."
      />

      <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {benchmarkStats.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.08}>
            <div className="rounded-2xl border border-line bg-card/50 p-7 text-center transition-colors hover:border-gold/40">
              <div className="font-display text-5xl font-bold text-gold">
                <CountUp to={s.value} suffix={s.suffix} />
              </div>
              <p className="mt-3 font-medium text-white">{s.label}</p>
              <p className="mt-1 text-sm text-white/45">{s.sub}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {sampleQAs.map((qa, i) => (
          <QACard key={qa.lang} qa={qa} delay={i * 0.1} />
        ))}
      </div>

      <Reveal delay={0.1}>
        <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-gold/30 bg-gold/[0.06] p-6 sm:flex-row sm:items-start">
          <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold ring-1 ring-gold/30">
            <ShieldCheck className="h-6 w-6" />
          </span>
          <div>
            <h3 className="font-display text-lg font-bold text-white">{citationGate.title}</h3>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/70">
              {citationGate.body}
            </p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
