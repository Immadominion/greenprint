import { cn } from "@/lib/utils";
import type { BigO, Severity } from "@/lib/analysis";

const gradeStyles: Record<string, string> = {
  "A+": "bg-eco-soft text-eco-strong border-eco/30",
  A: "bg-eco-soft text-eco-strong border-eco/30",
  B: "bg-eco-soft text-eco-strong border-eco/30",
  C: "bg-warn-soft text-warn-foreground border-warn/40",
  D: "bg-brand-soft text-brand border-brand/30",
  F: "bg-destructive/10 text-destructive border-destructive/30",
};

export function GradeBadge({ grade, className }: { grade: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-bold", gradeStyles[grade] ?? gradeStyles.C, className)}>
      {grade}
    </span>
  );
}

const sevStyles: Record<Severity, { label: string; cls: string; dot: string }> = {
  critical: { label: "Critical", cls: "bg-destructive/10 text-destructive border-destructive/25", dot: "bg-destructive" },
  high: { label: "High", cls: "bg-brand-soft text-brand border-brand/30", dot: "bg-brand" },
  medium: { label: "Medium", cls: "bg-warn-soft text-warn-foreground border-warn/40", dot: "bg-warn" },
  low: { label: "Low", cls: "bg-muted text-muted-foreground border-border", dot: "bg-muted-foreground" },
  info: { label: "Info", cls: "bg-muted text-muted-foreground border-border", dot: "bg-muted-foreground/70" },
};

export function SeverityBadge({ severity, className }: { severity: Severity; className?: string }) {
  const s = sevStyles[severity];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-semibold", s.cls, className)}>
      <span className={cn("size-1.5 rounded-full", s.dot)} />
      {s.label}
    </span>
  );
}

const bigOTone = (c: BigO): string => {
  if (c === "O(n²)") return "bg-warn-soft text-warn-foreground border-warn/40";
  if (c === "O(n³)" || c === "O(2ⁿ)") return "bg-destructive/10 text-destructive border-destructive/30";
  return "bg-eco-soft text-eco-strong border-eco/30";
};

export function ComplexityBadge({ bigO, className }: { bigO: BigO; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 font-mono text-xs font-semibold", bigOTone(bigO), className)}>
      {bigO}
    </span>
  );
}
