"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { benchmarkAccuracy, accuracyFacts } from "@/lib/data";
import { SectionHeading } from "./SectionHeading";
import { Reveal } from "./Reveal";

function Ring({ value }: { value: number }) {
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative h-44 w-44">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 144 144">
        <circle cx="72" cy="72" r={radius} fill="none" stroke="#23232b" strokeWidth="9" />
        <motion.circle
          cx="72"
          cy="72"
          r={radius}
          fill="none"
          stroke="url(#goldGrad)"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          whileInView={{ strokeDashoffset: offset }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: "easeOut" }}
        />
        <defs>
          <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f4d7a1" />
            <stop offset="100%" stopColor="#e8b96a" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="font-display text-4xl font-bold text-white"
        >
          {value}
          <span className="text-xl text-gold">%</span>
        </motion.span>
      </div>
    </div>
  );
}

export function Scores() {
  return (
    <section id="score" className="relative border-y border-line/60 bg-ink-soft/40">
      <div className="mx-auto max-w-6xl px-5 py-24 sm:py-28">
        <SectionHeading
          eyebrow="Score"
          title="How accurate is Hakim?"
          description="We avoided vague AI hype and measured Hakim with an LLM-as-judge setup, comparing its answers against human-written reference answers on the 50-QA benchmark."
        />

        <div className="mt-14 grid grid-cols-1 items-center gap-8 rounded-3xl border border-line bg-card/50 p-8 sm:p-12 lg:grid-cols-2">
          <Reveal className="flex flex-col items-center text-center">
            <Ring value={benchmarkAccuracy.value} />
            <p className="mt-6 font-display text-lg font-semibold text-white">
              Overall accuracy
            </p>
            <p className="mt-1 max-w-xs text-sm text-white/45">{benchmarkAccuracy.method}</p>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="text-sm font-semibold uppercase tracking-wider text-gold">
              What was measured
            </p>
            <ul className="mt-4 space-y-3">
              {accuracyFacts.map((fact) => (
                <li key={fact} className="flex items-start gap-3 text-white/75">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-gold" />
                  <span className="leading-relaxed">{fact}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm leading-relaxed text-white/50">
              This supports our claim in a falsifiable way: instead of asserting Hakim is helpful,
              we check whether its guidance is specific, UAE-relevant, practical, and evidence-aware.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
