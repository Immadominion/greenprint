import { Leaf, TriangleAlert } from "lucide-react";
import type { CodeIssue, Severity } from "@/lib/analysis";
import { SeverityBadge } from "./badges";
import { cn } from "@/lib/utils";

const accentBar: Record<Severity, string> = {
  critical: "before:bg-destructive",
  high: "before:bg-brand",
  medium: "before:bg-warn",
  low: "before:bg-muted-foreground/40",
  info: "before:bg-muted-foreground/30",
};

export function IssueCard({ issue, className }: { issue: CodeIssue; className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border bg-card p-4 pl-5 shadow-soft",
        "before:absolute before:inset-y-0 before:left-0 before:w-1.5 before:content-['']",
        accentBar[issue.severity],
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <TriangleAlert className="size-4 text-muted-foreground" />
          <h4 className="font-display text-[0.95rem] font-semibold">{issue.ruleTitle}</h4>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">line {issue.line}</span>
          <SeverityBadge severity={issue.severity} />
        </div>
      </div>

      <p className="mt-2 text-sm text-foreground/90">{issue.message}</p>

      {issue.snippet && (
        <pre className="mt-2.5 overflow-x-auto rounded-lg bg-muted/60 px-3 py-2 font-mono text-xs text-muted-foreground">
          <code>{issue.snippet}</code>
        </pre>
      )}

      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        <span className="font-semibold text-foreground/80">Why it costs: </span>
        {issue.why}
      </p>

      <div className="mt-3 rounded-lg border border-eco/25 bg-eco-soft/60 p-3">
        <div className="flex items-center gap-1.5 text-eco-strong">
          <Leaf className="size-3.5" />
          <span className="text-xs font-semibold uppercase tracking-wide">Greener alternative</span>
        </div>
        <p className="mt-1 text-sm text-foreground/90">{issue.suggestion}</p>
        {issue.betterExample && (
          <pre className="mt-2 overflow-x-auto rounded-md bg-card/80 px-3 py-2 font-mono text-xs">
            <code>{issue.betterExample}</code>
          </pre>
        )}
      </div>
    </div>
  );
}
