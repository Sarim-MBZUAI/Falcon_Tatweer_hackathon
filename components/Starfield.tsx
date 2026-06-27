"use client";

import { useEffect, useState } from "react";

type Star = {
  top: string;
  left: string;
  size: number;
  delay: string;
  duration: string;
};

export function Starfield({ count = 70 }: { count?: number }) {
  const [stars, setStars] = useState<Star[]>([]);

  // Generated only on the client to avoid SSR/client hydration mismatch.
  useEffect(() => {
    setStars(
      Array.from({ length: count }).map(() => ({
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        size: Math.random() * 2 + 1,
        delay: `${Math.random() * 5}s`,
        duration: `${Math.random() * 3 + 2}s`,
      }))
    );
  }, [count]);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {stars.map((s, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            animation: `twinkle ${s.duration} ease-in-out infinite`,
            animationDelay: s.delay,
          }}
        />
      ))}
    </div>
  );
}
