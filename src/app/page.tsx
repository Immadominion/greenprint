import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Cpu,
  Database,
  FileDown,
  FileText,
  Gauge,
  Leaf,
  Lock,
  Recycle,
  Scale,
  Search,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";
import { analyzeCode } from "@/lib/analysis";
import { EXAMPLES } from "@/lib/examples";
import { getGlobalImpact } from "@/lib/data";
import { co2Display } from "@/lib/format";
import { COURSE } from "@/lib/team";
import { LandingNav } from "@/components/app/landing-nav";
import { EcoScoreGauge } from "@/components/greenprint/eco-score-gauge";
import { ComplexityBadge, SeverityBadge } from "@/components/greenprint/badges";
import { CountUp } from "@/components/greenprint/count-up";
import { FadeIn, Stagger, StaggerItem } from "@/components/greenprint/motion";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

const FEATURES = [
  { icon: Sparkles, title: "AI code explanation", text: "Plain-English explanations of any snippet, with sustainability coaching." },
  { icon: FileText, title: "Auto documentation", text: "Generate clean, per-function docs in one click." },
  { icon: Gauge, title: "Code quality analysis", text: "Cyclomatic complexity, nesting, maintainability index and more." },
  { icon: Search, title: "Inefficiency detection", text: "Nested loops, N+1 queries, exponential recursion and 15+ other patterns." },
  { icon: Leaf, title: "Greener alternatives", text: "Every issue ships with a concrete, more efficient fix." },
  { icon: Zap, title: "Energy & CO₂ metrics", text: "Modelled execution time, energy and carbon for every analysis." },
  { icon: FileDown, title: "Exportable reports", text: "Download a full PDF or CSV report for any analysis." },
  { icon: Trophy, title: "Gamified progress", text: "Earn XP, keep streaks, unlock badges, climb the leaderboard." },
];

const GREEN = [
  { icon: Search, title: "Resource-intensive code detection", text: "Flags the specific lines that burn CPU, memory and I/O." },
  { icon: Scale, title: "Algorithmic optimization", text: "Recommends better complexity classes — O(n²) → O(n)." },
  { icon: Recycle, title: "Efficient AI caching", text: "Identical code is never sent to the model twice." },
  { icon: Database, title: "Optimized database access", text: "Queries select only what each view renders." },
  { icon: Cpu, title: "Lightweight architecture", text: "A dependency-free engine that runs fully offline." },
  { icon: Activity, title: "Execution & resource measurement", text: "Real analysis timing beside modelled runtime estimates." },
];

const STEPS = [
  { n: "01", title: "Paste or upload code", text: "Any of a dozen languages — or start from a built-in example." },
  { n: "02", title: "Get your EcoScore", text: "Instant, offline analysis: complexity, issues, energy and CO₂." },
  { n: "03", title: "Apply greener fixes", text: "Follow the suggestions, re-run, and watch your score climb." },
];

export default async function LandingPage() {
  const demo = analyzeCode({ code: EXAMPLES[0].code, language: EXAMPLES[0].language });
  const impact = await getGlobalImpact();
  const co2 = co2Display(impact.totalCo2Saved || 0.02);

  return (
    <div className="min-h-screen bg-background">
      <LandingNav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="bg-dotgrid pointer-events-none absolute inset-0 opacity-60" />
        <div className="pointer-events-none absolute -left-20 top-10 size-96 rounded-full bg-brand/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 top-40 size-96 rounded-full bg-eco/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 lg:grid-cols-2 lg:px-6 lg:py-24">
          <FadeIn>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-brand shadow-soft">
              <Leaf className="size-3.5" /> Sustainable AI Code Assistant
            </div>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Write code the <span className="text-gradient-brand">planet</span> can afford.
            </h1>
            <p className="mt-5 max-w-md text-lg text-muted-foreground">
              Greenprint finds wasteful patterns in your code, estimates their energy and CO₂ cost, and coaches you toward
              faster, greener alternatives — with a score you&apos;ll want to beat.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="group font-semibold">
                <Link href="/signup">
                  Start analysing free
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="font-semibold">
                <a href="#how">See how it works</a>
              </Button>
            </div>
            <div className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
              <Cpu className="size-4 text-eco" />
              Runs 100% offline · No API key required
            </div>
          </FadeIn>

          {/* Hero visual — a real analysis of the demo snippet */}
          <FadeIn delay={0.15}>
            <div className="animate-float relative mx-auto w-full max-w-md">
              <div className="glow-brand rounded-3xl border border-border bg-card p-6 shadow-lift">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-muted-foreground">loadOrderTotals.js</span>
                  <ComplexityBadge bigO={demo.energy.complexityClass} />
                </div>
                <div className="mt-4 flex items-center gap-5">
                  <EcoScoreGauge score={demo.ecoScore.score} grade={demo.ecoScore.grade} size={130} stroke={11} />
                  <div className="flex-1 space-y-2">
                    {demo.issues.slice(0, 3).map((i) => (
                      <div key={`${i.id}-${i.line}`} className="rounded-lg border border-border bg-muted/40 p-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-xs font-medium">{i.ruleTitle}</span>
                          <SeverityBadge severity={i.severity} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-muted/50 p-2">
                    <div className="text-[0.6rem] uppercase text-muted-foreground">Issues</div>
                    <div className="font-display font-bold">{demo.issues.length}</div>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-2">
                    <div className="text-[0.6rem] uppercase text-muted-foreground">Class</div>
                    <div className="font-mono text-sm font-bold">{demo.energy.complexityClass}</div>
                  </div>
                  <div className="rounded-lg bg-eco-soft/70 p-2">
                    <div className="text-[0.6rem] uppercase text-eco-strong">CO₂ savable</div>
                    <div className="font-display text-sm font-bold text-eco-strong">✓</div>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Impact strip */}
      <section className="border-y border-border bg-card/50">
        <div className="mx-auto grid max-w-4xl grid-cols-3 gap-4 px-4 py-8 text-center">
          <div>
            <div className="font-display text-3xl font-bold text-brand">
              <CountUp value={impact.totalAnalyses} />
            </div>
            <div className="text-xs text-muted-foreground">analyses run</div>
          </div>
          <div>
            <div className="font-display text-3xl font-bold text-eco-strong">
              <CountUp value={co2.value} decimals={co2.decimals} suffix={` ${co2.unit}`} />
            </div>
            <div className="text-xs text-muted-foreground">CO₂ saved (est.)</div>
          </div>
          <div>
            <div className="font-display text-3xl font-bold">
              <CountUp value={impact.members} />
            </div>
            <div className="text-xs text-muted-foreground">developers</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-20 lg:px-6">
        <FadeIn>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Everything you need to ship greener code</h2>
            <p className="mt-3 text-muted-foreground">One dashboard for quality, sustainability and AI assistance.</p>
          </div>
        </FadeIn>
        <Stagger className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <StaggerItem key={f.title}>
              <div className="h-full rounded-2xl border border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-1 hover:shadow-lift">
                <div className="grid size-11 place-items-center rounded-2xl bg-brand-soft text-brand">
                  <f.icon className="size-5" />
                </div>
                <h3 className="mt-4 font-display font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* Green by design */}
      <section id="green" className="border-y border-border bg-gradient-to-b from-eco-soft/30 to-background">
        <div className="mx-auto max-w-6xl px-4 py-20 lg:px-6">
          <FadeIn>
            <div className="mx-auto max-w-2xl text-center">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-eco px-3 py-1 text-xs font-semibold text-eco-foreground">
                <Leaf className="size-3.5" /> Green by design
              </div>
              <h2 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">The tool practises what it preaches</h2>
              <p className="mt-3 text-muted-foreground">
                Greenprint is engineered to be lightweight and low-carbon itself — every green feature is real, not a slogan.
              </p>
            </div>
          </FadeIn>
          <Stagger className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {GREEN.map((g) => (
              <StaggerItem key={g.title}>
                <div className="flex h-full gap-3.5 rounded-2xl border border-eco/20 bg-card p-5 shadow-soft">
                  <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-eco-soft text-eco-strong">
                    <g.icon className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold">{g.title}</h3>
                    <p className="mt-0.5 text-sm text-muted-foreground">{g.text}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl px-4 py-20 lg:px-6">
        <FadeIn>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Three steps to greener code</h2>
          </div>
        </FadeIn>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <FadeIn key={s.n} delay={i * 0.1}>
              <div className="relative rounded-2xl border border-border bg-card p-6 shadow-soft">
                <div className="font-display text-5xl font-extrabold text-brand/15">{s.n}</div>
                <h3 className="mt-2 font-display text-lg font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-20 lg:px-6">
        <FadeIn>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand via-brand-bright to-warn p-10 text-center text-white shadow-lift lg:p-16">
            <div className="bg-grid pointer-events-none absolute inset-0 opacity-20" />
            <h2 className="relative font-display text-3xl font-bold tracking-tight sm:text-4xl">Ready to green your code?</h2>
            <p className="relative mx-auto mt-3 max-w-md text-white/85">
              Create an account, paste your first snippet, and see your EcoScore in seconds.
            </p>
            <div className="relative mt-7">
              <Button asChild size="lg" variant="secondary" className="font-semibold text-brand">
                <Link href="/signup">
                  Get started free
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row lg:px-6">
          <div className="flex items-center gap-2">
            <Lock className="size-4" />
            {COURSE.code} · {COURSE.group} · {COURSE.institution}
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-foreground">Sign in</Link>
            <Link href="/signup" className="hover:text-foreground">Get started</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
