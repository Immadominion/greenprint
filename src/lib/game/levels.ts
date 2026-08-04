/**
 * Greenprint · Levels & ranks
 * ---------------------------
 * XP turns into levels; levels map to tree-growth ranks (Seedling → Ancient
 * Forest). The curve is gentle early (fast first wins) and steeper later.
 *
 * Cumulative XP required to REACH a level L:  60 · L · (L − 1)
 *   L1=0, L2=120, L3=360, L5=1200, L10=5400, L20=22800
 */

export interface Rank {
  name: string;
  emoji: string;
  minLevel: number;
}

export const RANKS: Rank[] = [
  { name: "Seedling", emoji: "🌱", minLevel: 1 },
  { name: "Sprout", emoji: "🌿", minLevel: 4 },
  { name: "Sapling", emoji: "🍃", minLevel: 7 },
  { name: "Young Oak", emoji: "🌳", minLevel: 10 },
  { name: "Mighty Oak", emoji: "🌳", minLevel: 14 },
  { name: "Redwood", emoji: "🌲", minLevel: 18 },
  { name: "Ancient Forest", emoji: "🌲", minLevel: 22 },
];

export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.round(60 * level * (level - 1));
}

export function levelFromXp(xp: number): number {
  let level = 1;
  while (xpForLevel(level + 1) <= xp) level++;
  return level;
}

export function rankForLevel(level: number): Rank {
  let rank = RANKS[0];
  for (const r of RANKS) if (level >= r.minLevel) rank = r;
  return rank;
}

export interface LevelProgress {
  level: number;
  rank: Rank;
  xp: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
  xpToNext: number;
  pct: number; // 0..100 progress toward next level
  nextRank?: Rank;
  levelsToNextRank?: number;
}

export function levelProgress(xp: number): LevelProgress {
  const level = levelFromXp(xp);
  const rank = rankForLevel(level);
  const floor = xpForLevel(level);
  const ceil = xpForLevel(level + 1);
  const span = Math.max(1, ceil - floor);
  const into = xp - floor;
  const nextRank = RANKS.find((r) => r.minLevel > level);
  return {
    level,
    rank,
    xp,
    xpIntoLevel: into,
    xpForNextLevel: span,
    xpToNext: Math.max(0, ceil - xp),
    pct: Math.min(100, Math.round((into / span) * 100)),
    nextRank,
    levelsToNextRank: nextRank ? nextRank.minLevel - level : undefined,
  };
}
