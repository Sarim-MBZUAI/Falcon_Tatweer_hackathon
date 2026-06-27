import { Reveal } from "./Reveal";

export function SectionHeading({
  eyebrow,
  title,
  description,
  points,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  points?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <Reveal>
        <div className="mb-4 flex items-center justify-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
            {eyebrow}
          </span>
          {points && (
            <span className="rounded-full border border-gold/40 bg-gold/10 px-2.5 py-0.5 text-xs font-medium text-gold-soft">
              {points}
            </span>
          )}
        </div>
      </Reveal>
      <Reveal delay={0.05}>
        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          {title}
        </h2>
      </Reveal>
      {description && (
        <Reveal delay={0.1}>
          <p className="mt-4 text-base leading-relaxed text-white/60">
            {description}
          </p>
        </Reveal>
      )}
    </div>
  );
}
