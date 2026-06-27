"use client";

import { Check } from "lucide-react";
import { criteria } from "@/lib/data";
import { Reveal } from "./Reveal";

export function CriteriaSections() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-24 sm:py-28">
      <div className="mb-16">
        <Reveal>
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
            Judging criteria
          </span>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mt-3 max-w-2xl font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Why Hakim scores on what matters
          </h2>
        </Reveal>
      </div>

      <div className="flex flex-col gap-5">
        {criteria.map((c, i) => {
          const Icon = c.icon;
          return (
            <Reveal key={c.id} delay={(i % 2) * 0.05}>
              <article
                id={c.id}
                className="group grid scroll-mt-24 grid-cols-1 gap-8 rounded-3xl border border-line bg-card/40 p-8 transition-colors hover:border-gold/40 sm:p-10 lg:grid-cols-[1.1fr_1fr]"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold/15 text-gold ring-1 ring-gold/30 transition-transform group-hover:scale-110">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
                        {c.eyebrow}
                      </span>
                      {c.points && (
                        <span className="rounded-full border border-gold/40 bg-gold/10 px-2 py-0.5 text-[11px] font-medium text-gold-soft">
                          {c.points}
                        </span>
                      )}
                    </div>
                  </div>
                  <h3 className="mt-5 font-display text-2xl font-bold tracking-tight">
                    {c.title}
                  </h3>
                  <p className="mt-4 leading-relaxed text-white/65">{c.body}</p>
                </div>

                <ul className="flex flex-col justify-center gap-3">
                  {c.bullets.map((b) => (
                    <li
                      key={b}
                      className="flex items-start gap-3 rounded-xl border border-line/70 bg-ink/50 px-4 py-3"
                    >
                      <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold">
                        <Check className="h-3 w-3" />
                      </span>
                      <span className="text-sm leading-relaxed text-white/75">
                        {b}
                      </span>
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
