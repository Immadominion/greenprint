/**
 * Greenprint · XP & streaks
 * -------------------------
 * How much XP a single analysis is worth, and how the daily streak advances.
 * XP rewards BOTH writing clean code (high EcoScore) and engaging with feedback
 * (issues surfaced) — so beginners and experts both make progress.
 */
import type { AnalysisReport } from "@/lib/analysis";

export interface XpBreakdownRow {
  label: string;
  xp: number;
}

export interface XpAward {
  total: number;
  breakdown: XpBreakdownRow[];
}

export function computeXpAward(report: AnalysisReport, opts: { firstAnalysisToday: boolean }): XpAward {
  const rows: XpBreakdownRow[] = [];

  rows.push({ label: "Analysis run", xp: 10 });

  const scoreXp = Math.round(report.ecoScore.score * 0.4); // up to +40 for clean code
  rows.push({ label: `EcoScore ${report.ecoScore.score}`, xp: scoreXp });

  const s = report.issueCountBySeverity;
  const insightXp = s.critical * 8 + s.high * 5 + s.medium * 3 + s.low * 1;
  if (insightXp > 0) rows.push({ label: "Issues surfaced", xp: insightXp });

  if (report.ecoScore.grade === "A+" || report.ecoScore.grade === "A") {
    rows.push({ label: "Top grade bonus", xp: 20 });
  }

  if (opts.firstAnalysisToday) {
    rows.push({ label: "First analysis today", xp: 25 });
  }

  const total = rows.reduce((sum, r) => sum + r.xp, 0);
  return { total, breakdown: rows };
}

// ------------------------------------------------------------------- streaks
/** Local calendar day as YYYY-MM-DD. */
export function todayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function dayDiff(a: string, b: string): number {
  const da = new Date(a + "T00:00:00");
  const db = new Date(b + "T00:00:00");
  return Math.round((db.getTime() - da.getTime()) / 86_400_000);
}

export interface StreakUpdate {
  streakCount: number;
  isNewDay: boolean;
  extended: boolean; // continued a streak (2+ days)
}

/** Compute the new streak given the last active day and today. */
export function nextStreak(lastActiveDate: string | null, current: number, today = todayKey()): StreakUpdate {
  if (!lastActiveDate) return { streakCount: 1, isNewDay: true, extended: false };
  const diff = dayDiff(lastActiveDate, today);
  if (diff <= 0) return { streakCount: Math.max(1, current), isNewDay: false, extended: false };
  if (diff === 1) return { streakCount: current + 1, isNewDay: true, extended: true };
  return { streakCount: 1, isNewDay: true, extended: false }; // streak broken
}
