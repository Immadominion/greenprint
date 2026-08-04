"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";

export interface Reward {
  levelUp: boolean;
  newLevel: number;
  rankName: string;
  rankEmoji: string;
  badges: { id: string; name: string; description: string; emoji: string; tier: string }[];
  xp: number;
}

const CONFETTI_COLORS = ["var(--brand)", "var(--brand-bright)", "var(--eco)", "var(--warn)"];

function Confetti() {
  const pieces = Array.from({ length: 28 });
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 0.3;
        const duration = 1.6 + Math.random() * 1.2;
        const size = 6 + Math.random() * 8;
        const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
        return (
          <motion.span
            key={i}
            className="absolute top-[-5%] rounded-[2px]"
            style={{ left: `${left}%`, width: size, height: size * 1.4, background: color }}
            initial={{ y: -40, rotate: 0, opacity: 1 }}
            animate={{ y: "110vh", rotate: 360 + Math.random() * 360, opacity: [1, 1, 0.6] }}
            transition={{ duration, delay, ease: "easeIn" }}
          />
        );
      })}
    </div>
  );
}

export function RewardOverlay({ reward, onClose }: { reward: Reward | null; onClose: () => void }) {
  const show = !!reward && (reward.levelUp || reward.badges.length > 0);

  useEffect(() => {
    if (!show) return;
    const t = setTimeout(onClose, 7000);
    return () => clearTimeout(t);
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && reward && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <Confetti />
          <motion.div
            className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-border bg-card p-8 text-center shadow-lift"
            initial={{ scale: 0.8, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={onClose} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
              <X className="size-5" />
            </button>

            {reward.levelUp ? (
              <>
                <motion.div
                  className="mx-auto grid size-20 place-items-center rounded-3xl bg-gradient-to-br from-brand to-brand-bright text-4xl shadow-lift"
                  initial={{ rotate: -12, scale: 0.7 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.1 }}
                >
                  {reward.rankEmoji}
                </motion.div>
                <div className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-brand">Level Up!</div>
                <h2 className="mt-1 font-display text-3xl font-bold">Level {reward.newLevel}</h2>
                <p className="mt-1 text-muted-foreground">
                  You&apos;re now a {reward.rankEmoji} <span className="font-semibold text-foreground">{reward.rankName}</span>
                </p>
              </>
            ) : (
              <>
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-brand">Badge unlocked</div>
                <h2 className="mt-1 font-display text-2xl font-bold">Nice work!</h2>
              </>
            )}

            {reward.badges.length > 0 && (
              <div className="mt-5 space-y-2">
                {reward.badges.map((b) => (
                  <motion.div
                    key={b.id}
                    className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-3 text-left"
                    initial={{ x: -12, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.25 }}
                  >
                    <span className="text-2xl">{b.emoji}</span>
                    <div>
                      <div className="text-sm font-semibold">{b.name}</div>
                      <div className="text-xs text-muted-foreground">{b.description}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            <div className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1 text-sm font-semibold text-brand">
              +{reward.xp} XP earned
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
