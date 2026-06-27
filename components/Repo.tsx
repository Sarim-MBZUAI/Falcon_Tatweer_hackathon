"use client";

import { Github, FileText, ArrowUpRight } from "lucide-react";
import { REPO_URL } from "@/lib/data";
import { SectionHeading } from "./SectionHeading";
import { Reveal } from "./Reveal";

const readmeContents = [
  "Project overview & the local data problem it solves",
  "How the bilingual agent works (Arabic & English)",
  "The 50-QA benchmark set and how to reproduce results",
  "Local setup, environment variables & run instructions",
  "Deployment guide (one-click to Vercel)",
];

export function Repo() {
  return (
    <section id="repo" className="border-t border-line/60 bg-ink-soft/40">
      <div className="mx-auto max-w-6xl px-5 py-24 sm:py-28">
        <SectionHeading
          eyebrow="Repository & documentation"
          points="5 pts"
          title="Everything needed to understand and verify"
          description="The repo contains the agent, the benchmark set, this site, and a complete README so judges can reproduce every claim."
        />

        <div className="mt-14 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Reveal>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="group flex h-full flex-col justify-between rounded-2xl border border-line bg-card/60 p-8 transition-colors hover:border-gold/50"
            >
              <div>
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/15 text-gold ring-1 ring-gold/30">
                  <Github className="h-6 w-6" />
                </span>
                <h3 className="mt-5 font-display text-xl font-bold">
                  GitHub repository
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">
                  Source for the agent, benchmark, and this landing site, open
                  and documented.
                </p>
              </div>
              <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-gold">
                {REPO_URL.replace("https://", "")}
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </a>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="h-full rounded-2xl border border-line bg-card/60 p-8">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/15 text-gold ring-1 ring-gold/30">
                  <FileText className="h-6 w-6" />
                </span>
                <h3 className="font-display text-xl font-bold">In the README</h3>
              </div>
              <ul className="mt-5 space-y-2.5">
                {readmeContents.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-sm leading-relaxed text-white/70"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gold" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
