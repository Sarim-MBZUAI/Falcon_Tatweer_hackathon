"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, MessageSquareText } from "lucide-react";
import { Starfield } from "./Starfield";

export function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-screen items-center overflow-hidden pt-16"
    >
      <Starfield />
      <div className="absolute inset-0 grid-bg" aria-hidden />
      <div
        className="absolute left-1/2 top-[-10%] h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-gold/20 blur-[120px]"
        aria-hidden
      />

      <div className="relative mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 px-5 py-16 lg:grid-cols-2">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-card/60 px-3 py-1.5 text-xs text-white/70 backdrop-blur"
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold" />
            Tatweer Hackathon · Challenge 3: The data gap for local entrepreneurs
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl"
          >
            Meet <span className="text-shimmer">Hakim AI</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-6 max-w-xl text-lg leading-relaxed text-white/65"
          >
            A talking avatar that speaks Arabic and English, does real market
            research, and turns scattered local data into clear, cited insight,
            so local entrepreneurs decide with evidence, not guesswork.
          </motion.p>

          <motion.p
            dir="rtl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-3 font-arabic text-base text-gold-soft/80"
          >
            مستشارك الذكي لرواد الأعمال المحليين، قرارات مبنية على البيانات
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <Link
              href="/hakim"
              className="group inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3.5 text-base font-semibold text-ink shadow-[0_0_40px_-8px_rgba(232,185,106,0.6)] transition-transform hover:scale-[1.03] active:scale-95"
            >
              <MessageSquareText className="h-5 w-5" />
              Try Agent
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="#benchmark"
              className="inline-flex items-center gap-2 rounded-full border border-line bg-card/40 px-6 py-3.5 text-base font-medium text-white/80 backdrop-blur transition-colors hover:border-gold/50 hover:text-white"
            >
              <BarChart3 className="h-5 w-5 text-gold" />
              See the benchmark
            </a>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.2, ease: "easeOut" }}
          className="relative mx-auto w-full max-w-md"
        >
          <div
            className="absolute -inset-4 rounded-[2rem] bg-gradient-to-tr from-gold/30 via-transparent to-gold/10 blur-2xl"
            aria-hidden
          />
          <div className="animate-float relative overflow-hidden rounded-[1.75rem] border border-line bg-card shadow-2xl">
            <Image
              src="/hakim.png"
              alt="Hakim AI, bilingual market-research avatar"
              width={1024}
              height={683}
              priority
              className="h-auto w-full"
            />
            <div className="pointer-events-none absolute inset-0 rounded-[1.75rem] ring-1 ring-inset ring-white/10" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="absolute -bottom-5 left-4 rounded-2xl border border-line bg-ink/90 px-4 py-3 backdrop-blur"
          >
            <p className="text-xs text-white/50">Grounded in real local data</p>
            <p className="font-display text-sm font-semibold text-white">
              Built for rural communities · UAE
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
