"use client";

import { motion } from "framer-motion";
import { scores } from "@/lib/data";
import { SectionHeading } from "./SectionHeading";
import { Reveal } from "./Reveal";

function Ring({ value }: { value: number }) {
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative h-36 w-36">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 128 128">
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke="#23232b"
          strokeWidth="8"
        />
        <motion.circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke="url(#goldGrad)"
          strokeWidth="8"
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
          className="font-display text-3xl font-bold text-white"
        >
          {value}
          <span className="text-lg text-gold">%</span>
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
          description="Measured accuracy of the agent across the 50-QA benchmark. Numbers shown are current results."
        />

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {scores.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.1}>
              <div className="flex flex-col items-center rounded-2xl border border-line bg-card/50 p-8">
                <Ring value={s.value} />
                <p className="mt-6 font-display text-lg font-semibold text-white">
                  {s.label}
                </p>
                <p className="mt-1 text-sm text-white/45">{s.hint}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
