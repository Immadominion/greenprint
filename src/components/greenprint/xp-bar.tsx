"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export function XpBar({ pct, className, height = 10 }: { pct: number; className?: string; height?: number }) {
  return (
    <div className={cn("w-full overflow-hidden rounded-full bg-muted", className)} style={{ height }}>
      <motion.div
        className="h-full rounded-full bg-gradient-to-r from-brand to-brand-bright"
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}

export function LevelRing({
  level,
  pct,
  size = 56,
  stroke = 5,
  className,
}: {
  level: number;
  pct: number;
  size?: number;
  stroke?: number;
  className?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const p = Math.min(100, Math.max(0, pct)) / 100;
  return (
    <div className={cn("relative grid place-items-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--muted)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--brand)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - p) }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center leading-none">
          <div className="text-[0.55rem] font-medium uppercase tracking-wider text-muted-foreground">Lvl</div>
          <div className="font-display text-sm font-bold tabular-nums">{level}</div>
        </div>
      </div>
    </div>
  );
}
