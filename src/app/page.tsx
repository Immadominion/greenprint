import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Cpu,
  Database,
  Gauge,
  Leaf,
  Recycle,
  Scale,
  Search,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";
import { analyzeCode } from "@/lib/analysis";
import { EXAMPLES } from "@/lib/examples";
import { getGlobalImpact, getLeaderboard } from "@/lib/data";
import { co2Display, formatCo2, formatDuration, formatOps } from "@/lib/format";
import { COURSE } from "@/lib/team";
import { LandingNav } from "@/components/app/landing-nav";
import { EcoScoreGauge } from "@/components/greenprint/eco-score-gauge";
import { ComplexityBadge, SeverityBadge } from "@/components/greenprint/badges";
import { IssueCard } from "@/components/greenprint/issue-card";
import { CountUp } from "@/components/greenprint/count-up";
import { FadeIn, Stagger, StaggerItem } from "@/components/greenprint/motion";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

const CHIPS = [
  { icon: Gauge, label: "Instant EcoScore", chip: "bg-brand-soft text-brand" },
  { icon: Leaf, label: "Greener fixes", chip: "bg-eco-soft text-eco-strong" },
  { icon: Trophy, label: "Gamified", chip: "bg-warn-soft text-warn-foreground" },
];

const GREEN = [
  { icon: Search, text: "Flags the exact lines that burn CPU, memory and I/O" },
  { icon: Scale, text: "Recommends better complexity - O(n²) → O(n)" },
  { icon: Recycle, text: "Caches AI answers so identical code is never re-billed" },
  { icon: Database, text: "Queries fetch only what each view renders" },
  { icon: Cpu, text: "A dependency-free engine that runs fully offline" },
  { icon: Zap, text: "Real analysis timing beside modelled runtime" },
];

export default async function LandingPage() {
  const demo = analyzeCode({ code: EXAMPLES[0].code, language: EXAMPLES[0].language });
  const [impact, top3] = await Promise.all([getGlobalImpact(), getLeaderboard(3)]);
  const co2 = co2Display(impact.totalCo2Saved || 0.02);
  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="relative min-h-screen overflow-x-clip bg-background">
      {/* Announcement bar */}
      <div className="border-b border-border bg-background text-center">
        <div className="mx-auto max-w-[1480px] px-4 py-3 text-sm">
          <span className="text-muted-foreground">Sustainable AI Code Assistant · {COURSE.code} · {COURSE.group}</span>{" "}
          <Link href="#green" className="font-bold hover:underline">
            See the green features <span className="inline-block">↗</span>
          </Link>
        </div>
      </div>

      <LandingNav />

      <main className="mx-auto max-w-[1480px] px-4 sm:px-6">
        {/* HERO */}
        <section className="pb-6 pt-14 text-center sm:pt-24">
          <FadeIn>
            <h1 className="mx-auto flex flex-col items-center gap-[0.02em] font-display font-extrabold leading-[0.88] tracking-[-0.045em] text-[clamp(46px,9.2vw,148px)]">
              <span>greener code</span>
              <span className="flex items-center gap-[0.16em] whitespace-nowrap">
                <span className="grid aspect-square w-[0.92em] place-items-center rounded-[0.24em] bg-gradient-to-br from-brand-bright to-brand text-primary-foreground shadow-[0_16px_40px_-12px_rgba(232,93,12,0.6)]">
                  <Leaf className="size-[0.5em]" />
                </span>
                by design
              </span>
            </h1>
            <p className="mx-auto mt-7 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              Greenprint scores your code&apos;s efficiency, estimates its energy and CO₂, and hands you the greener fix - with a
              score you&apos;ll want to beat.
            </p>
          </FadeIn>

          <Stagger className="mt-8 flex flex-wrap justify-center gap-3">
            {CHIPS.map((c) => (
              <StaggerItem key={c.label}>
                <div className="group flex cursor-default items-center gap-3 rounded-full border border-border bg-card py-2.5 pl-2.5 pr-5 font-semibold shadow-soft transition-transform hover:-translate-y-1">
                  <span className={`grid size-10 place-items-center rounded-full ${c.chip} transition-transform group-hover:-rotate-6`}>
                    <c.icon className="size-5" />
                  </span>
                  {c.label}
                </div>
              </StaggerItem>
            ))}
          </Stagger>

          <FadeIn delay={0.1}>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" className="group rounded-full font-bold">
                <Link href="/signup">
                  Start analysing
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full font-bold">
                <a href="#how">See how it works</a>
              </Button>
            </div>
          </FadeIn>
        </section>

        {/* PRODUCT SHOWCASE */}
        <FadeIn delay={0.1}>
          <section className="mt-4">
            <div className="rounded-[40px] bg-gradient-to-b from-muted/80 to-muted/20 p-3 sm:p-10">
              <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-border bg-card shadow-[0_26px_70px_rgba(20,18,40,0.16)]">
                <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                  <span className="size-3 rounded-full bg-destructive/60" />
                  <span className="size-3 rounded-full bg-warn/70" />
                  <span className="size-3 rounded-full bg-eco/70" />
                  <span className="ml-2 font-mono text-xs text-muted-foreground">loadOrderTotals.js</span>
                  <ComplexityBadge bigO={demo.energy.complexityClass} className="ml-auto" />
                </div>
                <div className="grid gap-6 p-6 md:grid-cols-[auto_1fr] md:items-center">
                  <EcoScoreGauge score={demo.ecoScore.score} grade={demo.ecoScore.grade} rating={demo.ecoScore.rating} size={190} />
                  <div className="min-w-0 space-y-2.5">
                    {demo.issues.slice(0, 3).map((i) => (
                      <div key={`${i.id}-${i.line}`} className="flex items-center justify-between gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2.5">
                        <span className="truncate text-sm font-medium">{i.ruleTitle}</span>
                        <SeverityBadge severity={i.severity} />
                      </div>
                    ))}
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      <MiniStat label="Ops @10k" value={formatOps(demo.energy.estimatedOperations)} />
                      <MiniStat label="Runtime" value={formatDuration(demo.energy.estimatedRuntimeMs)} />
                      <MiniStat label="CO₂ savable" value={formatCo2(demo.energy.potentialCo2SavingGrams)} eco />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </FadeIn>

        {/* IMPACT NUMBERS */}
        <section className="grid grid-cols-3 gap-4 py-16 text-center">
          <Stat value={<CountUp value={impact.totalAnalyses} />} label="analyses run" color="text-brand" />
          <Stat value={<CountUp value={co2.value} decimals={co2.decimals} suffix={` ${co2.unit}`} />} label="CO₂ saved (est.)" color="text-eco-strong" />
          <Stat value={<CountUp value={impact.members} />} label="developers" color="text-foreground" />
        </section>

        {/* BIG FEATURE CARD */}
        <FadeIn>
          <section className="mb-6">
            <div className="grid gap-10 rounded-[34px] bg-brand-soft p-8 sm:p-14 md:grid-cols-[1fr_clamp(300px,34%,440px)] md:items-center">
              <div className="flex min-w-0 flex-col justify-between gap-8">
                <div className="flex items-start gap-5">
                  <span className="grid size-16 shrink-0 place-items-center rounded-3xl bg-gradient-to-br from-brand-bright to-brand text-primary-foreground shadow-[0_16px_40px_-12px_rgba(232,93,12,0.6)]">
                    <Leaf className="size-8" />
                  </span>
                  <h2 className="min-w-0 font-display text-[clamp(28px,4vw,56px)] font-extrabold leading-[0.98] tracking-[-0.03em]">
                    Every problem comes with a greener fix.
                  </h2>
                </div>
                <p className="max-w-md text-lg text-foreground/70">
                  Greenprint never just complains. Each of the 21 detection rules explains why a pattern costs energy - then
                  shows the faster, lighter alternative, with example code.
                </p>
              </div>
              <div className="min-w-0 rounded-2xl bg-card/70 p-3 shadow-soft">
                <IssueCard issue={demo.issues[0]} />
              </div>
            </div>
          </section>
        </FadeIn>

        {/* WHAT IT DOES */}
        <section id="how" className="pt-8">
          <h2 className="text-center font-display font-bold leading-[0.85] tracking-[-0.04em] text-[clamp(44px,13vw,190px)]">
            what it does
          </h2>

          <FeatureRow
            tag="Analyze"
            tagClass="bg-brand-soft text-brand"
            title="See what your code costs"
            body="Complexity class, estimated runtime, energy and CO₂ - modelled from documented assumptions and shown for every analysis, fully offline."
            visual={
              <div className="grid grid-cols-2 gap-3">
                <BigStat label="Complexity" value={demo.energy.complexityClass} mono />
                <BigStat label="Est. runtime" value={formatDuration(demo.energy.estimatedRuntimeMs)} />
                <BigStat label="Energy" value={`${demo.energy.estimatedEnergyJoules.toFixed(1)} J`} />
                <BigStat label="CO₂ savable" value={formatCo2(demo.energy.potentialCo2SavingGrams)} eco />
              </div>
            }
          />

          <FeatureRow
            reverse
            tag="Optimize"
            tagClass="bg-eco-soft text-eco-strong"
            title="Fix it the green way"
            body="Nested loops, N+1 queries, exponential recursion and 18 more - each with a plain-English reason and a concrete, more efficient fix."
            visual={<IssueCard issue={demo.issues[1] ?? demo.issues[0]} />}
          />

          <FeatureRow
            tag="Compete"
            tagClass="bg-warn-soft text-warn-foreground"
            title="Level up your whole team"
            body="Earn XP, keep daily streaks, unlock badges and climb the team leaderboard. Greener code has never been this competitive."
            visual={
              <div className="space-y-2.5">
                {top3.map((row, i) => (
                  <div key={row.userId} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-soft">
                    <span className="text-2xl">{medals[i]}</span>
                    <div className="grid size-9 place-items-center rounded-xl bg-brand-soft font-bold text-brand">
                      {(row.displayName ?? row.name ?? "?").slice(0, 1)}
                    </div>
                    <span className="flex-1 truncate font-semibold">{row.displayName ?? row.name}</span>
                    <span className="font-mono font-bold text-brand">{row.xp.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            }
          />
        </section>

        {/* GREEN + CTA */}
        <section id="green" className="grid gap-4 py-16 md:grid-cols-2">
          <div className="rounded-[34px] bg-secondary p-8 sm:p-12">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-eco px-3 py-1 text-xs font-bold text-eco-foreground">
              <Leaf className="size-3.5" /> Green by design
            </span>
            <h3 className="mt-4 font-display text-[clamp(28px,3.4vw,44px)] font-extrabold leading-[0.98] tracking-[-0.03em]">
              The tool practises what it preaches.
            </h3>
            <ul className="mt-6 space-y-3">
              {GREEN.map((g) => (
                <li key={g.text} className="flex items-start gap-3">
                  <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-eco-soft text-eco-strong">
                    <g.icon className="size-4" />
                  </span>
                  <span className="text-foreground/80">{g.text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative overflow-hidden rounded-[34px] bg-gradient-to-br from-brand via-brand-bright to-warn p-8 text-white sm:p-12">
            <div className="bg-grid pointer-events-none absolute inset-0 opacity-20" />
            <div className="relative flex h-full flex-col justify-between gap-8">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur">
                  <Sparkles className="size-3.5" /> Ready in seconds
                </span>
                <h3 className="mt-4 font-display text-[clamp(32px,4vw,56px)] font-extrabold leading-[0.95] tracking-[-0.03em]">
                  Ready to green your code?
                </h3>
                <p className="mt-3 max-w-sm text-white/85">
                  Create an account, paste your first snippet, and watch your EcoScore climb.
                </p>
              </div>
              <Button asChild size="lg" variant="secondary" className="w-max rounded-full font-bold text-brand">
                <Link href="/signup">
                  Get started free
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="mx-auto max-w-[1480px] overflow-hidden px-4 pt-10 sm:px-6">
        <h2 className="text-center font-display font-bold leading-[0.9] tracking-[-0.04em] text-[clamp(52px,11vw,170px)]">
          the future is{" "}
          <span className="inline-grid aspect-square w-[0.7em] translate-y-[0.08em] place-items-center rounded-[0.2em] bg-gradient-to-br from-eco to-eco-strong align-middle text-eco-foreground">
            <Leaf className="size-[0.4em]" />
          </span>{" "}
          efficient
        </h2>

        <div className="mt-14 grid gap-10 border-t border-border pt-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h4 className="mb-4 text-sm font-semibold text-muted-foreground">Product</h4>
            <ul className="space-y-2.5 font-semibold">
              <li><Link href="/signup" className="hover:text-brand">Analyze code</Link></li>
              <li><Link href="/signup" className="hover:text-brand">Dashboard</Link></li>
              <li><Link href="/signup" className="hover:text-brand">Leaderboard</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold text-muted-foreground">Learn</h4>
            <ul className="space-y-2.5 font-semibold">
              <li><a href="#how" className="hover:text-brand">How it works</a></li>
              <li><a href="#green" className="hover:text-brand">Green features</a></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold text-muted-foreground">Account</h4>
            <ul className="space-y-2.5 font-semibold">
              <li><Link href="/login" className="hover:text-brand">Sign in</Link></li>
              <li><Link href="/signup" className="hover:text-brand">Get started</Link></li>
            </ul>
          </div>
          <div className="max-w-xs">
            <p className="text-foreground/70">
              A sustainable AI code assistant built by Group 3 for {COURSE.code} - {COURSE.title}.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">{COURSE.institution}</p>
          </div>
        </div>

        <div className="select-none pt-8 text-center font-display font-extrabold leading-[0.72] tracking-[-0.05em] text-[clamp(120px,29vw,500px)] text-foreground">
          green<span className="text-gradient-eco">print</span>
        </div>
      </footer>
    </div>
  );
}

function MiniStat({ label, value, eco }: { label: string; value: string; eco?: boolean }) {
  return (
    <div className={`rounded-lg p-2 text-center ${eco ? "bg-eco-soft/70" : "bg-muted/50"}`}>
      <div className={`text-[0.6rem] uppercase ${eco ? "text-eco-strong" : "text-muted-foreground"}`}>{label}</div>
      <div className={`font-mono text-sm font-bold ${eco ? "text-eco-strong" : ""}`}>{value}</div>
    </div>
  );
}

function Stat({ value, label, color }: { value: ReactNode; label: string; color: string }) {
  return (
    <div>
      <div className={`font-display text-[clamp(22px,5.5vw,52px)] font-extrabold tabular-nums ${color}`}>{value}</div>
      <div className="mt-1 text-xs text-muted-foreground sm:text-sm">{label}</div>
    </div>
  );
}

function BigStat({ label, value, mono, eco }: { label: string; value: string; mono?: boolean; eco?: boolean }) {
  return (
    <div className={`rounded-2xl border border-border p-4 ${eco ? "bg-eco-soft/60" : "bg-card"}`}>
      <div className={`text-xs ${eco ? "text-eco-strong" : "text-muted-foreground"}`}>{label}</div>
      <div className={`mt-1 text-2xl font-extrabold tabular-nums ${mono ? "font-mono" : "font-display"} ${eco ? "text-eco-strong" : ""}`}>
        {value}
      </div>
    </div>
  );
}

function FeatureRow({
  tag,
  tagClass,
  title,
  body,
  visual,
  reverse,
}: {
  tag: string;
  tagClass: string;
  title: string;
  body: string;
  visual: ReactNode;
  reverse?: boolean;
}) {
  return (
    <FadeIn>
      <div className="grid items-center gap-8 py-10 md:grid-cols-2 md:gap-16 md:py-16">
        <div className={`min-w-0 ${reverse ? "md:order-2" : ""}`}>
          <span className={`inline-block rounded-full px-4 py-1.5 text-sm font-bold ${tagClass}`}>{tag}</span>
          <h3 className="mt-5 font-display text-[clamp(32px,4.4vw,64px)] font-extrabold leading-[0.98] tracking-[-0.035em]">{title}</h3>
          <p className="mt-4 max-w-lg text-lg text-muted-foreground">{body}</p>
        </div>
        <div className={`min-w-0 ${reverse ? "md:order-1" : ""}`}>
          <div className="rounded-[26px] border border-border bg-gradient-to-b from-muted/50 to-transparent p-5 sm:p-8">{visual}</div>
        </div>
      </div>
    </FadeIn>
  );
}
