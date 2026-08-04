import type { Metadata } from "next";
import { Cpu, Database, GitBranch, Layers, Leaf, Repeat, Scale, Sparkles, Zap } from "lucide-react";
import { RULE_CATALOG, type RuleMeta } from "@/lib/analysis";
import type { IssueCategory } from "@/lib/analysis";
import { SeverityBadge } from "@/components/greenprint/badges";
import { FadeIn } from "@/components/greenprint/motion";

export const metadata: Metadata = { title: "How it works" };

const CATEGORY_META: Record<IssueCategory, { label: string; icon: typeof Cpu }> = {
  algorithmic: { label: "Algorithmic efficiency", icon: GitBranch },
  database: { label: "Data access", icon: Database },
  resource: { label: "Resource usage", icon: Cpu },
  energy: { label: "Energy waste", icon: Zap },
  loop: { label: "Loop work", icon: Repeat },
  quality: { label: "Code quality", icon: Sparkles },
};

const CATEGORY_ORDER: IssueCategory[] = ["algorithmic", "database", "resource", "energy", "loop", "quality"];

const PIPELINE = [
  { icon: Layers, title: "1 · Pre-process", text: "Strip comments & strings, then map every line's block-nesting and loop-nesting depth." },
  { icon: Scale, title: "2 · Measure", text: "Compute size, cyclomatic complexity, function sizes and a maintainability index." },
  { icon: GitBranch, title: "3 · Detect", text: "Run the rule catalogue below over the cleaned source using the nesting context." },
  { icon: Leaf, title: "4 · Estimate & score", text: "Infer the Big-O class, model energy/CO₂, and compute the EcoScore." },
];

export default function RulesPage() {
  const byCategory = CATEGORY_ORDER.map((cat) => ({
    cat,
    rules: RULE_CATALOG.filter((r) => r.category === cat),
  })).filter((g) => g.rules.length > 0);

  return (
    <div className="mx-auto max-w-4xl">
      <FadeIn>
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold tracking-tight">How Greenprint works</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            The entire analysis engine runs <span className="font-medium text-foreground">offline</span>, with no API key. It
            is a lightweight, dependency-free static analyser — heuristic by design, which keeps it fast and green.
          </p>
        </div>
      </FadeIn>

      {/* Pipeline */}
      <FadeIn>
        <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PIPELINE.map((p) => (
            <div key={p.title} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
              <div className="grid size-9 place-items-center rounded-xl bg-brand-soft text-brand">
                <p.icon className="size-[18px]" />
              </div>
              <div className="mt-2.5 font-display text-sm font-semibold">{p.title}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">{p.text}</div>
            </div>
          ))}
        </div>
      </FadeIn>

      {/* Energy model */}
      <FadeIn>
        <div className="mb-8 rounded-2xl border border-eco/25 bg-eco-soft/40 p-6 shadow-soft">
          <div className="flex items-center gap-2 text-eco-strong">
            <Leaf className="size-5" />
            <h2 className="font-display text-lg font-semibold">The energy model</h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Energy and CO₂ figures are a <span className="font-medium text-foreground">transparent teaching model</span>, not
            measurements. The Big-O class is inferred from loop nesting and recursion, then applied to a reference input of
            N = 10,000. From the operation count we model runtime (~100M ops/second), CPU energy (15&nbsp;W active core), and
            carbon using the global average grid intensity (475&nbsp;gCO₂/kWh). Every result screen lists these assumptions.
          </p>
        </div>
      </FadeIn>

      {/* Rule catalogue */}
      <div className="space-y-8">
        {byCategory.map(({ cat, rules }) => {
          const meta = CATEGORY_META[cat];
          return (
            <section key={cat}>
              <div className="mb-3 flex items-center gap-2">
                <meta.icon className="size-5 text-brand" />
                <h2 className="font-display text-lg font-semibold">{meta.label}</h2>
                <span className="text-sm text-muted-foreground">({rules.length})</span>
              </div>
              <div className="space-y-3">
                {rules.map((rule) => (
                  <RuleCard key={rule.id} rule={rule} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function RuleCard({ rule }: { rule: RuleMeta }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display font-semibold">{rule.title}</h3>
        <SeverityBadge severity={rule.severity} />
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        <span className="font-medium text-foreground/80">Why it costs: </span>
        {rule.why}
      </p>
      <div className="mt-3 rounded-lg border border-eco/25 bg-eco-soft/50 p-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-eco-strong">
          <Leaf className="size-3.5" /> Greener alternative
        </div>
        <p className="mt-1 text-sm text-foreground/90">{rule.suggestion}</p>
        {rule.betterExample && (
          <pre className="mt-2 overflow-x-auto rounded-md bg-card/80 px-3 py-2 font-mono text-xs">
            <code>{rule.betterExample}</code>
          </pre>
        )}
      </div>
    </div>
  );
}
