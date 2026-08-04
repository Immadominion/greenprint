"use client";

import { motion } from "motion/react";
import { CountUp } from "./count-up";
import { cn } from "@/lib/utils";

export function scoreColor(score: number): string {
  if (score >= 80) return "var(--eco)";
  if (score >= 60) return "var(--warn)";
  if (score >= 40) return "var(--brand)";
  return "var(--destructive)";
}

export function EcoScoreGauge({
  score,
  grade,
  rating,
  size = 200,
  stroke = 15,
  label = "EcoScore",
  className,
}: {
  score: number;
  grade?: string;
  rating?: string;
  size?: number;
  stroke?: number;
  label?: string;
  className?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score)) / 100;
  const color = scoreColor(score);

  return (
    <div className={cn("relative inline-grid place-items-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--muted)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - pct) }}
          transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
          style={{ filter: `drop-shadow(0 0 8px color-mix(in oklch, ${color} 60%, transparent))` }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="font-display text-5xl font-extrabold tabular-nums leading-none" style={{ color }}>
            <CountUp value={score} />
          </div>
          <div className="mt-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
          {grade && (
            <div className="mt-1 text-sm font-semibold">
              Grade {grade}
              {rating ? <span className="text-muted-foreground"> · {rating}</span> : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
