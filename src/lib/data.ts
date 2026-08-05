/**
 * Greenprint · Data-access layer (server-only)
 * --------------------------------------------
 * All reads the app needs, in one place: gamification profile, analysis history,
 * aggregate stats, trend series, badges and the team leaderboard. Keeping queries
 * here (not scattered in pages) is part of the "optimized database access" goal -
 * lists never select the heavy `code`/`report` columns they don't render.
 */
import "server-only";
import { and, avg, count, countDistinct, desc, eq, sql, sum } from "drizzle-orm";
import { db } from "@/lib/db";
import { analysis, gameProfile, user, userBadge } from "@/lib/db/schema";
import { badgeById, levelFromXp } from "@/lib/game";

export async function ensureProfile(userId: string, displayName?: string) {
  const [existing] = await db.select().from(gameProfile).where(eq(gameProfile.userId, userId)).limit(1);
  if (existing) return existing;
  await db.insert(gameProfile).values({ userId, displayName }).onConflictDoNothing();
  const [created] = await db.select().from(gameProfile).where(eq(gameProfile.userId, userId)).limit(1);
  return created!;
}

export type ProfileRow = Awaited<ReturnType<typeof ensureProfile>>;

/** Lightweight history rows (no heavy columns) for lists. */
export async function getRecentAnalyses(userId: string, limit = 8) {
  return db
    .select({
      id: analysis.id,
      title: analysis.title,
      filename: analysis.filename,
      language: analysis.language,
      ecoScore: analysis.ecoScore,
      grade: analysis.grade,
      complexityClass: analysis.complexityClass,
      issueCount: analysis.issueCount,
      criticalCount: analysis.criticalCount,
      co2SavingGrams: analysis.co2SavingGrams,
      xpAwarded: analysis.xpAwarded,
      createdAt: analysis.createdAt,
    })
    .from(analysis)
    .where(eq(analysis.userId, userId))
    .orderBy(desc(analysis.createdAt))
    .limit(limit);
}

export async function getAnalysis(userId: string, id: string) {
  const [row] = await db
    .select()
    .from(analysis)
    .where(and(eq(analysis.id, id), eq(analysis.userId, userId)))
    .limit(1);
  return row;
}

export async function getStats(userId: string) {
  const [agg] = await db
    .select({
      total: count(),
      avgEco: avg(analysis.ecoScore),
      totalCo2Saved: sum(analysis.co2SavingGrams),
      totalIssues: sum(analysis.issueCount),
      totalCritical: sum(analysis.criticalCount),
      languages: countDistinct(analysis.language),
    })
    .from(analysis)
    .where(eq(analysis.userId, userId));
  return {
    total: Number(agg?.total ?? 0),
    avgEco: Math.round(Number(agg?.avgEco ?? 0)),
    totalCo2Saved: Number(agg?.totalCo2Saved ?? 0),
    totalIssues: Number(agg?.totalIssues ?? 0),
    totalCritical: Number(agg?.totalCritical ?? 0),
    languages: Number(agg?.languages ?? 0),
  };
}

/** Ascending series for trend charts (EcoScore + CO2 over time). */
export async function getTrend(userId: string, limit = 20) {
  const rows = await db
    .select({
      id: analysis.id,
      ecoScore: analysis.ecoScore,
      co2Grams: analysis.co2Grams,
      co2SavingGrams: analysis.co2SavingGrams,
      createdAt: analysis.createdAt,
    })
    .from(analysis)
    .where(eq(analysis.userId, userId))
    .orderBy(desc(analysis.createdAt))
    .limit(limit);
  return rows.reverse();
}

export async function getUserBadges(userId: string) {
  const rows = await db
    .select()
    .from(userBadge)
    .where(eq(userBadge.userId, userId))
    .orderBy(desc(userBadge.earnedAt));
  return rows
    .map((r) => ({ ...r, def: badgeById(r.badgeId) }))
    .filter((r): r is typeof r & { def: NonNullable<typeof r.def> } => !!r.def);
}

export async function getDistinctLanguageCount(userId: string) {
  const [row] = await db
    .select({ n: countDistinct(analysis.language) })
    .from(analysis)
    .where(eq(analysis.userId, userId));
  return Number(row?.n ?? 0);
}

export interface LeaderboardRow {
  userId: string;
  name: string | null;
  displayName: string | null;
  regNumber: string | null;
  xp: number;
  level: number;
  streak: number;
  totalAnalyses: number;
  co2Saved: number;
}

export async function getLeaderboard(limit = 50): Promise<LeaderboardRow[]> {
  return db
    .select({
      userId: gameProfile.userId,
      name: user.name,
      displayName: gameProfile.displayName,
      regNumber: gameProfile.regNumber,
      xp: gameProfile.xp,
      level: gameProfile.level,
      streak: gameProfile.streakCount,
      totalAnalyses: gameProfile.totalAnalyses,
      co2Saved: gameProfile.totalCo2SavedGrams,
    })
    .from(gameProfile)
    .innerJoin(user, eq(user.id, gameProfile.userId))
    .orderBy(desc(gameProfile.xp))
    .limit(limit);
}

/** A user's 1-based rank on the XP leaderboard. */
export async function getUserRank(userId: string): Promise<number> {
  const [me] = await db.select({ xp: gameProfile.xp }).from(gameProfile).where(eq(gameProfile.userId, userId)).limit(1);
  if (!me) return 0;
  const [row] = await db
    .select({ ahead: count() })
    .from(gameProfile)
    .where(sql`${gameProfile.xp} > ${me.xp}`);
  return Number(row?.ahead ?? 0) + 1;
}

export async function getTotalPlayers(): Promise<number> {
  const [row] = await db.select({ n: count() }).from(gameProfile);
  return Number(row?.n ?? 0);
}

/** Global cumulative CO2 saved across all members (for the landing / dashboard hero). */
export async function getGlobalImpact() {
  const [row] = await db
    .select({
      totalSaved: sum(gameProfile.totalCo2SavedGrams),
      analyses: sum(gameProfile.totalAnalyses),
      members: count(),
    })
    .from(gameProfile);
  return {
    totalCo2Saved: Number(row?.totalSaved ?? 0),
    totalAnalyses: Number(row?.analyses ?? 0),
    members: Number(row?.members ?? 0),
  };
}

export { levelFromXp };
