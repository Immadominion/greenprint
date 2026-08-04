/**
 * Greenprint · Badges
 * -------------------
 * The achievement catalogue. Definitions live here in code; only *earned* badges
 * are persisted (user_badge table). `evaluateBadges` returns the badges a user
 * has newly qualified for, given their profile + latest analysis.
 */
import type { AnalysisReport } from "@/lib/analysis";

export type BadgeTier = "bronze" | "silver" | "gold";

export interface BadgeContext {
  profile: {
    xp: number;
    level: number;
    streakCount: number;
    longestStreak: number;
    totalAnalyses: number;
    totalCo2SavedGrams: number;
    totalIssuesFixed: number;
  };
  report?: AnalysisReport;
  distinctLanguages: number;
}

export interface BadgeDef {
  id: string;
  name: string;
  description: string;
  emoji: string;
  tier: BadgeTier;
  check: (ctx: BadgeContext) => boolean;
}

const reportHasRule = (ctx: BadgeContext, ruleId: string) =>
  !!ctx.report?.issues.some((i) => i.id === ruleId);

export const BADGES: BadgeDef[] = [
  {
    id: "first-steps",
    name: "First Steps",
    description: "Run your very first analysis.",
    emoji: "👣",
    tier: "bronze",
    check: (c) => c.profile.totalAnalyses >= 1,
  },
  {
    id: "eco-warrior",
    name: "Eco Warrior",
    description: "Score 90+ EcoScore on an analysis.",
    emoji: "🛡️",
    tier: "silver",
    check: (c) => (c.report?.ecoScore.score ?? 0) >= 90,
  },
  {
    id: "zero-waste",
    name: "Zero Waste",
    description: "Hit a perfect EcoScore of 100.",
    emoji: "💯",
    tier: "gold",
    check: (c) => (c.report?.ecoScore.score ?? 0) >= 100,
  },
  {
    id: "loop-slayer",
    name: "Loop Slayer",
    description: "Detect a nested-loop hotspot.",
    emoji: "🌀",
    tier: "bronze",
    check: (c) => reportHasRule(c, "nested-loops"),
  },
  {
    id: "n1-terminator",
    name: "N+1 Terminator",
    description: "Catch a database query hiding inside a loop.",
    emoji: "🎯",
    tier: "silver",
    check: (c) => reportHasRule(c, "db-query-in-loop"),
  },
  {
    id: "the-memoizer",
    name: "The Memoizer",
    description: "Uncover exponential recursion begging for memoization.",
    emoji: "🧠",
    tier: "gold",
    check: (c) => reportHasRule(c, "exponential-recursion"),
  },
  {
    id: "polyglot",
    name: "Polyglot",
    description: "Analyse code in 3 different languages.",
    emoji: "🗺️",
    tier: "silver",
    check: (c) => c.distinctLanguages >= 3,
  },
  {
    id: "on-a-roll",
    name: "On a Roll",
    description: "Keep a 3-day streak going.",
    emoji: "🔥",
    tier: "bronze",
    check: (c) => c.profile.streakCount >= 3,
  },
  {
    id: "week-warrior",
    name: "Week Warrior",
    description: "Reach a 7-day streak.",
    emoji: "📅",
    tier: "gold",
    check: (c) => c.profile.streakCount >= 7,
  },
  {
    id: "prolific",
    name: "Prolific",
    description: "Complete 25 analyses.",
    emoji: "⚡",
    tier: "silver",
    check: (c) => c.profile.totalAnalyses >= 25,
  },
  {
    id: "carbon-cutter",
    name: "Carbon Cutter",
    description: "Save an estimated 1g of CO₂ across your analyses.",
    emoji: "🍃",
    tier: "silver",
    check: (c) => c.profile.totalCo2SavedGrams >= 1,
  },
  {
    id: "forest-guardian",
    name: "Forest Guardian",
    description: "Reach Level 10.",
    emoji: "🌳",
    tier: "gold",
    check: (c) => c.profile.level >= 10,
  },
];

export function badgeById(id: string): BadgeDef | undefined {
  return BADGES.find((b) => b.id === id);
}

/** Returns badge defs newly earned this round (qualifies now, not already owned). */
export function evaluateBadges(ctx: BadgeContext, earnedIds: Set<string>): BadgeDef[] {
  return BADGES.filter((b) => !earnedIds.has(b.id) && b.check(ctx));
}
