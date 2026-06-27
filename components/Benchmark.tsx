"use client";

import { Quote, BookOpen } from "lucide-react";
import { benchmarkStats, sampleQAs, type SampleQA } from "@/lib/data";
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
          {isArabic ? "إجابة حكيم" : "Hakim's answer"}
        </p>
        <p className="mt-1 leading-relaxed text-white/75">{qa.answer}</p>

        <div className="mt-auto" />
        <div className="mt-6 rounded-xl border border-line bg-ink/60 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-gold">
            <BookOpen className="h-3.5 w-3.5" />
            {isArabic ? "المصدر" : "Citation"}
          </div>
          <p className="mt-2 text-sm leading-relaxed text-white/60">
            {qa.citation}
          </p>
          <p className="mt-2 text-xs italic text-white/40">— {qa.source}</p>
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
        title="Proven against a curated test set"
        description="We didn't just build an agent — we measured it. Hakim was benchmarked on a hand-written, manually verified set of questions a local entrepreneur would actually ask."
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
    </section>
  );
}
