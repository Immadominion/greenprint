import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Accent = "brand" | "eco" | "warn" | "muted" | "destructive";

const accentChip: Record<Accent, string> = {
  brand: "bg-brand-soft text-brand",
  eco: "bg-eco-soft text-eco-strong",
  warn: "bg-warn-soft text-warn-foreground",
  muted: "bg-muted text-muted-foreground",
  destructive: "bg-destructive/10 text-destructive",
};

export function StatTile({
  icon: Icon,
  label,
  value,
  sub,
  accent = "brand",
  className,
}: {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  accent?: Accent;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
        <span className={cn("grid size-9 place-items-center rounded-xl transition-transform group-hover:scale-110", accentChip[accent])}>
          <Icon className="size-[18px]" />
        </span>
      </div>
      <div className="mt-3 font-display text-3xl font-bold tabular-nums leading-none">{value}</div>
      {sub && <div className="mt-1.5 text-sm text-muted-foreground">{sub}</div>}
    </div>
  );
}
