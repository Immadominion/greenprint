"use client";

import { useState } from "react";
import { motion } from "motion/react";
import {
  AlertTriangle,
  Braces,
  ChevronDown,
  Clock,
  Cpu,
  FileCode2,
  GitBranch,
  Leaf,
  Percent,
  Repeat,
  Sparkles,
  Zap,
} from "lucide-react";
import type { AnalysisReport, Severity } from "@/lib/analysis";
import { EcoScoreGauge } from "@/components/greenprint/eco-score-gauge";
import { ComplexityBadge, GradeBadge } from "@/components/greenprint/badges";
import { IssueCard } from "@/components/greenprint/issue-card";
import { CountUp } from "@/components/greenprint/count-up";
import { formatCo2, formatDuration, formatEnergy, formatOps } from "@/lib/format";
import { LANGUAGE_LABELS } from "@/lib/analysis";
import { cn } from "@/lib/utils";

function MetricCell({ icon: Icon, label, value }: { icon: typeof Cpu; label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3.5">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </div>
      <div className="mt-1 font-display text-xl font-bold tabular-nums">{value}</div>
    </div>
  );
}

const FILTERS: (Severity | "all")[] = ["all", "critical", "high", "medium", "low"];

export function AnalysisResults({ report }: { report: AnalysisReport }) {
  const [filter, setFilter] = useState<Severity | "all">("all");
  const [showAssumptions, setShowAssumptions] = useState(false);

  const sev = report.issueCountBySeverity;
  const visible = filter === "all" ? report.issues : report.issues.filter((i) => i.severity === filter);
  const filterCount = (f: Severity | "all") => (f === "all" ? report.issues.length : sev[f]);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">
      {/* Summary */}
      <div className="grid gap-6 rounded-2xl border border-border bg-card p-6 shadow-soft md:grid-cols-[auto_1fr] md:items-center">
        <div className="mx-auto md:mx-0">
          <EcoScoreGauge score={report.ecoScore.score} grade={report.ecoScore.grade} rating={report.ecoScore.rating} size={190} />
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <GradeBadge grade={report.ecoScore.grade} />
            <ComplexityBadge bigO={report.energy.complexityClass} />
            <span className="rounded-md border border-border bg-muted px-2 py-0.5 text-xs font-medium">
              {LANGUAGE_LABELS[report.language]}
            </span>
          </div>
          <h3 className="mt-3 font-display text-xl font-bold">
            {report.ecoScore.rating} - {report.ecoScore.score}/100
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {report.issues.length === 0
              ? "No inefficiency patterns detected. This code is lean and green. 🌿"
              : `${report.issues.length} issue(s) found across ${report.size.codeLines} lines of code.`}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div>
              <div className="text-xs text-muted-foreground">Quality</div>
              <div className="font-display text-lg font-bold tabular-nums">{report.qualityScore}/100</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Maintainability</div>
              <div className="font-display text-lg font-bold tabular-nums">{report.complexity.maintainabilityIndex}/100</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Analysed in</div>
              <div className="font-display text-lg font-bold tabular-nums">{formatDuration(report.analysisDurationMs)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Energy & impact */}
      <div className="rounded-2xl border border-eco/25 bg-gradient-to-br from-eco-soft/50 to-card p-6 shadow-soft">
        <div className="mb-4 flex items-center gap-2">
          <div className="grid size-9 place-items-center rounded-xl bg-eco text-eco-foreground">
            <Leaf className="size-5" />
          </div>
          <div>
            <h3 className="font-display text-lg font-semibold">Estimated impact</h3>
            <p className="text-xs text-muted-foreground">
              Modelled for N = {report.energy.referenceInputSize.toLocaleString()} · {report.energy.complexityLabel} growth
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-border bg-card/80 p-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Cpu className="size-3.5" /> Operations
            </div>
            <div className="mt-1 font-display text-xl font-bold tabular-nums">{formatOps(report.energy.estimatedOperations)}</div>
          </div>
          <div className="rounded-xl border border-border bg-card/80 p-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="size-3.5" /> Est. runtime
            </div>
            <div className="mt-1 font-display text-xl font-bold tabular-nums">{formatDuration(report.energy.estimatedRuntimeMs)}</div>
          </div>
          <div className="rounded-xl border border-border bg-card/80 p-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Zap className="size-3.5" /> Energy
            </div>
            <div className="mt-1 font-display text-xl font-bold tabular-nums">{formatEnergy(report.energy.estimatedEnergyJoules)}</div>
          </div>
          <div className="rounded-xl border border-eco/30 bg-eco-soft/60 p-4">
            <div className="flex items-center gap-1.5 text-xs text-eco-strong">
              <Leaf className="size-3.5" /> CO₂ savable
            </div>
            <div className="mt-1 font-display text-xl font-bold tabular-nums text-eco-strong">
              {formatCo2(report.energy.potentialCo2SavingGrams)}
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowAssumptions((s) => !s)}
          className="mt-4 flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <ChevronDown className={cn("size-3.5 transition-transform", showAssumptions && "rotate-180")} />
          How is this estimated?
        </button>
        {showAssumptions && (
          <ul className="mt-2 space-y-1 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
            {report.energy.assumptions.map((a, i) => (
              <li key={i}>• {a}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Metrics */}
      <div>
        <h3 className="mb-3 font-display text-lg font-semibold">Code metrics</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <MetricCell icon={FileCode2} label="Lines of code" value={report.size.codeLines} />
          <MetricCell icon={Braces} label="Functions" value={report.complexity.functionCount} />
          <MetricCell icon={GitBranch} label="Cyclomatic" value={report.complexity.cyclomatic} />
          <MetricCell icon={Repeat} label="Loop nesting" value={report.complexity.maxLoopNesting} />
          <MetricCell icon={Cpu} label="Max nesting" value={report.complexity.maxNestingDepth} />
          <MetricCell icon={Sparkles} label="Maintainability" value={report.complexity.maintainabilityIndex} />
          <MetricCell icon={Percent} label="Comments" value={`${Math.round(report.size.commentRatio * 100)}%`} />
          <MetricCell icon={AlertTriangle} label="Duplicates" value={report.size.duplicateLineGroups} />
        </div>
      </div>

      {/* Issues */}
      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-display text-lg font-semibold">
            Issues & greener alternatives
            <span className="ml-2 text-sm font-normal text-muted-foreground">({report.issues.length})</span>
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {FILTERS.filter((f) => filterCount(f) > 0 || f === "all").map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "rounded-lg border px-2.5 py-1 text-xs font-medium capitalize transition-colors",
                  filter === f ? "border-brand bg-brand-soft text-brand" : "border-border text-muted-foreground hover:bg-accent",
                )}
              >
                {f} ({filterCount(f)})
              </button>
            ))}
          </div>
        </div>

        {visible.length === 0 ? (
          <div className="grid place-items-center rounded-2xl border border-dashed border-border bg-card py-12 text-center">
            <Leaf className="size-8 text-eco" />
            <p className="mt-2 font-medium">{filter === "all" ? "No issues - beautifully green code!" : `No ${filter} issues.`}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {visible.map((issue, i) => (
              <IssueCard key={`${issue.id}-${issue.line}-${i}`} issue={issue} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
