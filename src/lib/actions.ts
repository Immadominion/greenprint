"use server";

/**
 * Greenprint · Server Actions
 * ---------------------------
 * The app's write path. `analyzeAndSaveAction` is the heart of the loop:
 * analyse → persist → award XP → advance streak → check badges → level up.
 * Every action verifies the session first (Server Actions are directly callable).
 */
import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { analysis, gameProfile, userBadge } from "@/lib/db/schema";
import { getSession } from "@/lib/session";
import { analyzeCode, type AnalysisReport, type Language } from "@/lib/analysis";
import {
  computeXpAward,
  evaluateBadges,
  levelFromXp,
  levelProgress,
  nextStreak,
  todayKey,
  type BadgeContext,
} from "@/lib/game";
import { ensureProfile, getDistinctLanguageCount } from "@/lib/data";
import { explainCode, generateDocs } from "@/lib/ai";

function deriveTitle(report: AnalysisReport, filename?: string): string {
  if (filename) return filename;
  const match = report.issues[0]?.ruleTitle;
  if (report.ecoScore.score >= 90) return "Clean snippet";
  return match ? `Snippet · ${match}` : "Untitled snippet";
}

export interface AnalyzeResult {
  ok: true;
  analysisId: string;
  report: AnalysisReport;
  xp: ReturnType<typeof computeXpAward>;
  levelUp: boolean;
  previousLevel: number;
  newLevel: number;
  progress: ReturnType<typeof levelProgress>;
  streak: number;
  streakExtended: boolean;
  newBadges: { id: string; name: string; description: string; emoji: string; tier: string }[];
}

export async function analyzeAndSaveAction(input: {
  code: string;
  language?: Language;
  filename?: string;
  title?: string;
}): Promise<AnalyzeResult | { ok: false; error: string }> {
  const session = await getSession();
  if (!session?.user) return { ok: false, error: "You need to be signed in." };
  const userId = session.user.id;

  const code = input.code ?? "";
  if (!code.trim()) return { ok: false, error: "There's no code to analyse." };
  if (code.length > 200_000) return { ok: false, error: "That snippet is too large (200k char limit)." };

  const report = analyzeCode({ code, language: input.language, filename: input.filename });
  const profile = await ensureProfile(userId, session.user.name);

  const streak = nextStreak(profile.lastActiveDate, profile.streakCount);
  const xpAward = computeXpAward(report, { firstAnalysisToday: streak.isNewDay });
  const previousLevel = levelFromXp(profile.xp);
  const newXp = profile.xp + xpAward.total;
  const newLevel = levelFromXp(newXp);

  const [saved] = await db
    .insert(analysis)
    .values({
      userId,
      title: input.title ?? deriveTitle(report, input.filename),
      filename: input.filename,
      language: report.language,
      code,
      ecoScore: report.ecoScore.score,
      grade: report.ecoScore.grade,
      qualityScore: report.qualityScore,
      complexityClass: report.energy.complexityClass,
      issueCount: report.issues.length,
      criticalCount: report.issueCountBySeverity.critical,
      co2Grams: report.energy.estimatedCo2Grams,
      co2SavingGrams: report.energy.potentialCo2SavingGrams,
      xpAwarded: xpAward.total,
      report: JSON.stringify(report),
    })
    .returning({ id: analysis.id });

  const longestStreak = Math.max(profile.longestStreak, streak.streakCount);
  const totalAnalyses = profile.totalAnalyses + 1;
  const totalIssuesFixed = profile.totalIssuesFixed + report.issues.length;
  const totalCo2SavedGrams = profile.totalCo2SavedGrams + report.energy.potentialCo2SavingGrams;

  await db
    .update(gameProfile)
    .set({
      xp: newXp,
      level: newLevel,
      streakCount: streak.streakCount,
      longestStreak,
      lastActiveDate: todayKey(),
      totalAnalyses,
      totalIssuesFixed,
      totalCo2SavedGrams,
    })
    .where(eq(gameProfile.userId, userId));

  // Badge evaluation
  const distinctLanguages = await getDistinctLanguageCount(userId);
  const earnedRows = await db.select({ badgeId: userBadge.badgeId }).from(userBadge).where(eq(userBadge.userId, userId));
  const earnedIds = new Set(earnedRows.map((r) => r.badgeId));
  const ctx: BadgeContext = {
    profile: { xp: newXp, level: newLevel, streakCount: streak.streakCount, longestStreak, totalAnalyses, totalCo2SavedGrams, totalIssuesFixed },
    report,
    distinctLanguages,
  };
  const newBadgeDefs = evaluateBadges(ctx, earnedIds);
  for (const b of newBadgeDefs) {
    await db.insert(userBadge).values({ userId, badgeId: b.id }).onConflictDoNothing();
  }

  revalidatePath("/dashboard");
  revalidatePath("/history");
  revalidatePath("/leaderboard");

  return {
    ok: true,
    analysisId: saved.id,
    report,
    xp: xpAward,
    levelUp: newLevel > previousLevel,
    previousLevel,
    newLevel,
    progress: levelProgress(newXp),
    streak: streak.streakCount,
    streakExtended: streak.extended,
    newBadges: newBadgeDefs.map(({ id, name, description, emoji, tier }) => ({ id, name, description, emoji, tier })),
  };
}

export async function explainCodeAction(input: { code: string; language: Language }) {
  const session = await getSession();
  if (!session?.user) return { ok: false as const, error: "You need to be signed in." };
  const result = await explainCode({ code: input.code, language: input.language });
  return { ok: true as const, ...result };
}

export async function generateDocsAction(input: { code: string; language: Language }) {
  const session = await getSession();
  if (!session?.user) return { ok: false as const, error: "You need to be signed in." };
  const result = await generateDocs({ code: input.code, language: input.language });
  return { ok: true as const, ...result };
}

export async function deleteAnalysisAction(id: string) {
  const session = await getSession();
  if (!session?.user) return { ok: false as const, error: "You need to be signed in." };
  await db.delete(analysis).where(and(eq(analysis.id, id), eq(analysis.userId, session.user.id)));
  revalidatePath("/history");
  revalidatePath("/dashboard");
  return { ok: true as const };
}
