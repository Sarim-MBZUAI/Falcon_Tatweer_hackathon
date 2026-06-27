import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-line/60 bg-ink">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-5 py-12 text-center">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/15 text-gold ring-1 ring-gold/30">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight">
            Hakim<span className="text-gold"> AI</span>
          </span>
        </div>
        <p className="max-w-md text-sm leading-relaxed text-white/45">
          Built to close the local data gap for entrepreneurs in rural
          communities across the UAE and beyond.
        </p>
        <p className="text-xs text-white/30">
          Tatweer Hackathon · Challenge 3 — The data gap for local entrepreneurs
        </p>
      </div>
    </footer>
  );
}
