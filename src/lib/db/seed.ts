/**
 * Seeds the database with the 15 active Group-3 members as demo accounts, a
 * populated team leaderboard, earned badges, and a realistic analysis history —
 * so the app looks alive the moment it starts. Runs only when the DB is empty.
 *
 * Every demo account uses the shared password in team.ts (DEMO_PASSWORD).
 */
import { db } from "./index";
import { user, gameProfile, analysis, userBadge } from "./schema";
import { auth } from "../auth";
import { TEAM_MEMBERS, DEMO_PASSWORD, type TeamMember } from "../team";
import { levelFromXp, todayKey, computeXpAward } from "../game";
import { analyzeCode } from "../analysis";
import { EXAMPLES } from "../examples";

const EXT: Record<string, string> = {
  javascript: "js",
  typescript: "ts",
  python: "py",
  java: "java",
  cpp: "cpp",
  c: "c",
  csharp: "cs",
  go: "go",
  ruby: "rb",
  php: "php",
  rust: "rs",
  sql: "sql",
};

const round = (n: number, dp = 3) => Math.round(n * 10 ** dp) / 10 ** dp;

async function createUser(m: TeamMember): Promise<string> {
  try {
    const res = await auth.api.signUpEmail({
      body: { email: m.email, password: DEMO_PASSWORD, name: m.display },
    });
    return res.user.id;
  } catch {
    const [existing] = await db.select().from(user).where(eqEmail(m.email)).limit(1);
    if (!existing) throw new Error(`Could not create or find user ${m.email}`);
    return existing.id;
  }
}

// tiny local eq helper to avoid importing drizzle operators here
import { eq } from "drizzle-orm";
const eqEmail = (email: string) => eq(user.email, email);

async function seedBadges(userId: string, ids: string[]) {
  for (const badgeId of ids) {
    await db.insert(userBadge).values({ userId, badgeId }).onConflictDoNothing();
  }
}

async function seedAnalysis(userId: string, exampleId: string, daysAgo: number) {
  const ex = EXAMPLES.find((e) => e.id === exampleId);
  if (!ex) return;
  const report = analyzeCode({ code: ex.code, language: ex.language });
  const xp = computeXpAward(report, { firstAnalysisToday: false }).total;
  await db.insert(analysis).values({
    userId,
    title: ex.label,
    filename: `${ex.id}.${EXT[ex.language] ?? "txt"}`,
    language: report.language,
    code: ex.code,
    ecoScore: report.ecoScore.score,
    grade: report.ecoScore.grade,
    qualityScore: report.qualityScore,
    complexityClass: report.energy.complexityClass,
    issueCount: report.issues.length,
    criticalCount: report.issueCountBySeverity.critical,
    co2Grams: report.energy.estimatedCo2Grams,
    co2SavingGrams: report.energy.potentialCo2SavingGrams,
    xpAwarded: xp,
    report: JSON.stringify(report),
    createdAt: new Date(Date.now() - daysAgo * 86_400_000),
  });
}

export async function runSeed() {
  const existing = await db.select().from(user).limit(1);
  if (existing.length > 0) {
    console.log("• Seed skipped — database already has data.");
    return;
  }

  console.log("• Seeding team, leaderboard and history…");

  for (const m of TEAM_MEMBERS) {
    const userId = await createUser(m);
    const level = levelFromXp(m.seedXp);
    const totalAnalyses = Math.max(3, Math.round(m.seedXp / 55));
    const co2Saved = round(m.seedXp / 850);

    await db
      .insert(gameProfile)
      .values({
        userId,
        displayName: m.display,
        regNumber: m.regNumber,
        xp: m.seedXp,
        level,
        streakCount: m.seedStreak,
        longestStreak: m.seedStreak,
        lastActiveDate: todayKey(),
        totalAnalyses,
        totalIssuesFixed: Math.round(m.seedXp / 130),
        totalCo2SavedGrams: co2Saved,
        createdAt: new Date(Date.now() - 20 * 86_400_000),
      })
      .onConflictDoNothing();

    const badges = ["first-steps"];
    if (m.seedStreak >= 3) badges.push("on-a-roll");
    if (m.seedStreak >= 7) badges.push("week-warrior");
    if (level >= 10) badges.push("forest-guardian");
    if (totalAnalyses >= 25) badges.push("prolific");
    if (co2Saved >= 1) badges.push("carbon-cutter");
    await seedBadges(userId, badges);
  }

  // Give the two top members a rich, dated history so charts & lists look real.
  const dominion = TEAM_MEMBERS.find((m) => m.id === "nwakanma-dominion")!;
  const lead = TEAM_MEMBERS.find((m) => m.lead)!;
  const [dUser] = await db.select().from(user).where(eqEmail(dominion.email)).limit(1);
  const [lUser] = await db.select().from(user).where(eqEmail(lead.email)).limit(1);

  const dominionHistory: [string, number][] = [
    ["n-plus-one", 11],
    ["naive-fib", 9],
    ["string-builder", 7],
    ["membership-scan", 5],
    ["clean-lookup", 3],
    ["clean-util", 1],
  ];
  const leadHistory: [string, number][] = [
    ["naive-fib", 8],
    ["clean-lookup", 5],
    ["clean-util", 2],
    ["n-plus-one", 1],
  ];

  if (dUser) for (const [id, d] of dominionHistory) await seedAnalysis(dUser.id, id, d);
  if (lUser) for (const [id, d] of leadHistory) await seedAnalysis(lUser.id, id, d);

  // Reward the two rich users the analysis-based badges too.
  if (dUser) await seedBadges(dUser.id, ["loop-slayer", "n1-terminator", "the-memoizer", "polyglot", "eco-warrior"]);
  if (lUser) await seedBadges(lUser.id, ["the-memoizer", "polyglot", "eco-warrior"]);

  console.log(`✓ Seeded ${TEAM_MEMBERS.length} members (password: "${DEMO_PASSWORD}")`);
}
