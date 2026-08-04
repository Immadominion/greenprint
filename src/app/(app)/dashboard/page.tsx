import type { Metadata } from "next";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";
import {
  Activity,
  ArrowRight,
  Cpu,
  Database,
  Gauge,
  Leaf,
  Plus,
  Recycle,
  Sparkles,
  TriangleAlert,
  Trophy,
  Zap,
} from "lucide-react";
import { getSession } from "@/lib/session";
import { ensureProfile, getGlobalImpact, getRecentAnalyses, getStats, getTrend, getUserBadges } from "@/lib/data";
import { getCacheStats } from "@/lib/ai";
import { levelProgress, BADGES } from "@/lib/game";
import { co2Display, formatCo2 } from "@/lib/format";
import { StatTile } from "@/components/greenprint/stat-tile";
import { EcoScoreGauge } from "@/components/greenprint/eco-score-gauge";
import { TrendChart } from "@/components/greenprint/trend-chart";
import { GradeBadge, ComplexityBadge } from "@/components/greenprint/badges";
import { CountUp } from "@/components/greenprint/count-up";
import { XpBar } from "@/components/greenprint/xp-bar";
import { FadeIn, Stagger, StaggerItem } from "@/components/greenprint/motion";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Dashboard" };

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

const GREEN_FEATURES = [
  { icon: Cpu, label: "Offline analysis engine", note: "Zero API calls for core analysis" },
  { icon: Recycle, label: "AI response caching", note: "Identical code is never re-billed" },
  { icon: Database, label: "Optimized data access", note: "Lists skip heavy columns" },
  { icon: Zap, label: "Lightweight architecture", note: "No heavy runtime dependencies" },
];

export default async function DashboardPage() {
  const session = await getSession();
  const user = session!.user;

  const [profile, stats, trend, recent, badges, impact, cache] = await Promise.all([
    ensureProfile(user.id, user.name),
    getStats(user.id),
    getTrend(user.id, 12),
    getRecentAnalyses(user.id, 6),
    getUserBadges(user.id),
    getGlobalImpact(),
    getCacheStats(),
  ]);

  const progress = levelProgress(profile.xp);
  const co2 = co2Display(profile.totalCo2SavedGrams);
  const firstName = user.name.split(" ")[0];
  const trendData = trend.map((t) => ({ label: format(t.createdAt, "MMM d"), ecoScore: t.ecoScore, co2: t.co2Grams }));

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Hero */}
      <FadeIn>
        <section className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-soft lg:p-8">
          <div className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-brand/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 right-24 size-72 rounded-full bg-eco/10 blur-3xl" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand">
                <Sparkles className="size-3.5" />
                {progress.rank.emoji} {progress.rank.name} · Level {progress.level}
              </div>
              <h1 className="mt-3 font-display text-3xl font-bold tracking-tight lg:text-4xl">
                {greeting()}, {firstName}.
              </h1>
              <p className="mt-2 text-muted-foreground">
                You&apos;ve saved an estimated <span className="font-semibold text-eco-strong">{formatCo2(profile.totalCo2SavedGrams)}</span> of
                CO₂ and surfaced <span className="font-semibold text-foreground">{stats.totalIssues}</span> inefficiencies. Keep it green.
              </p>
              <div className="mt-5 max-w-md">
                <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
                  <span>{profile.xp.toLocaleString()} XP</span>
                  <span>
                    {progress.xpToNext} XP to Level {progress.level + 1}
                  </span>
                </div>
                <XpBar pct={progress.pct} />
              </div>
            </div>
            <Button asChild size="lg" className="shrink-0 font-semibold shadow-soft">
              <Link href="/workspace">
                <Plus className="size-4" />
                Analyze code
              </Link>
            </Button>
          </div>
        </section>
      </FadeIn>

      {/* Stat tiles */}
      <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StaggerItem>
          <StatTile icon={Activity} label="Analyses" accent="brand" value={<CountUp value={stats.total} />} sub="lifetime runs" />
        </StaggerItem>
        <StaggerItem>
          <StatTile icon={Gauge} label="Avg EcoScore" accent="eco" value={<CountUp value={stats.avgEco} />} sub="across all runs" />
        </StaggerItem>
        <StaggerItem>
          <StatTile
            icon={Leaf}
            label="CO₂ saved"
            accent="eco"
            value={<CountUp value={co2.value} decimals={co2.decimals} suffix={` ${co2.unit}`} />}
            sub="estimated, if fixes applied"
          />
        </StaggerItem>
        <StaggerItem>
          <StatTile
            icon={TriangleAlert}
            label="Issues surfaced"
            accent="warn"
            value={<CountUp value={stats.totalIssues} />}
            sub={`${stats.totalCritical} critical`}
          />
        </StaggerItem>
      </Stagger>

      {/* Trend + gauge */}
      <div className="grid gap-6 lg:grid-cols-3">
        <FadeIn className="lg:col-span-2">
          <div className="h-full rounded-2xl border border-border bg-card p-6 shadow-soft">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-semibold">EcoScore trend</h2>
                <p className="text-sm text-muted-foreground">Your last {trendData.length} analyses</p>
              </div>
              <Trophy className="size-5 text-muted-foreground" />
            </div>
            <TrendChart data={trendData} />
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-border bg-card p-6 text-center shadow-soft">
            <h2 className="mb-3 font-display text-lg font-semibold">Average EcoScore</h2>
            <EcoScoreGauge score={stats.avgEco} size={180} label="Average" />
            <p className="mt-3 text-sm text-muted-foreground">across {stats.total} analyses in {stats.languages} language(s)</p>
          </div>
        </FadeIn>
      </div>

      {/* Recent + side panels */}
      <div className="grid gap-6 lg:grid-cols-3">
        <FadeIn className="lg:col-span-2">
          <div className="rounded-2xl border border-border bg-card shadow-soft">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="font-display text-lg font-semibold">Recent activity</h2>
              <Link href="/history" className="flex items-center gap-1 text-sm font-medium text-brand hover:underline">
                View all <ArrowRight className="size-3.5" />
              </Link>
            </div>
            {recent.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-muted-foreground">
                No analyses yet.{" "}
                <Link href="/workspace" className="font-medium text-brand hover:underline">
                  Run your first one →
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {recent.map((a) => (
                  <li key={a.id}>
                    <Link href={`/history/${a.id}`} className="flex items-center gap-4 px-6 py-3.5 transition-colors hover:bg-accent/50">
                      <GradeBadge grade={a.grade} />
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium">{a.title ?? a.filename ?? "Snippet"}</div>
                        <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="uppercase">{a.language}</span>
                          <span>·</span>
                          <span>{a.issueCount} issues</span>
                          <span>·</span>
                          <span>{formatDistanceToNow(a.createdAt, { addSuffix: true })}</span>
                        </div>
                      </div>
                      <ComplexityBadge bigO={a.complexityClass as never} />
                      <div className="hidden text-right sm:block">
                        <div className="font-display text-lg font-bold tabular-nums">{a.ecoScore}</div>
                        <div className="text-[0.65rem] text-muted-foreground">+{a.xpAwarded} XP</div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </FadeIn>

        <div className="space-y-6">
          {/* Badges */}
          <FadeIn delay={0.05}>
            <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold">Badges</h2>
                <span className="text-sm text-muted-foreground">
                  {badges.length} / {BADGES.length}
                </span>
              </div>
              {badges.length === 0 ? (
                <p className="text-sm text-muted-foreground">Analyse code to start earning badges.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {badges.slice(0, 8).map((b) => (
                    <div
                      key={b.id}
                      title={`${b.def.name} — ${b.def.description}`}
                      className="flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-2.5 py-1 text-xs font-medium"
                    >
                      <span className="text-base leading-none">{b.def.emoji}</span>
                      {b.def.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </FadeIn>

          {/* Green engineering */}
          <FadeIn delay={0.1}>
            <div className="rounded-2xl border border-eco/25 bg-eco-soft/40 p-6 shadow-soft">
              <div className="mb-1 flex items-center gap-2 text-eco-strong">
                <Leaf className="size-5" />
                <h2 className="font-display text-lg font-semibold">Green engineering</h2>
              </div>
              <p className="mb-4 text-sm text-muted-foreground">
                {cache.servedFromCache} AI request(s) served from cache · team saved{" "}
                <span className="font-semibold text-eco-strong">{formatCo2(impact.totalCo2Saved)}</span> CO₂.
              </p>
              <ul className="space-y-2.5">
                {GREEN_FEATURES.map((f) => (
                  <li key={f.label} className="flex items-start gap-2.5 text-sm">
                    <f.icon className="mt-0.5 size-4 shrink-0 text-eco-strong" />
                    <div>
                      <span className="font-medium">{f.label}</span>
                      <span className="text-muted-foreground"> — {f.note}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>
        </div>
      </div>
    </div>
  );
}
