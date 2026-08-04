"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Loader2, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteAnalysisAction } from "@/lib/actions";
import { ComplexityBadge, GradeBadge } from "@/components/greenprint/badges";
import type { BigO } from "@/lib/analysis";
import { cn } from "@/lib/utils";

export interface HistoryRow {
  id: string;
  title: string | null;
  filename: string | null;
  language: string;
  ecoScore: number;
  grade: string;
  complexityClass: string;
  issueCount: number;
  criticalCount: number;
  xpAwarded: number;
  createdAt: string | Date;
}

export function HistoryList({ rows }: { rows: HistoryRow[] }) {
  const [q, setQ] = useState("");
  const [pending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  const filtered = rows.filter((r) => {
    const hay = `${r.title ?? ""} ${r.filename ?? ""} ${r.language}`.toLowerCase();
    return hay.includes(q.toLowerCase());
  });

  function del(id: string) {
    setDeletingId(id);
    startTransition(async () => {
      const res = await deleteAnalysisAction(id);
      if (res.ok) {
        toast.success("Analysis deleted");
        router.refresh();
      } else {
        toast.error(res.error);
      }
      setDeletingId(null);
    });
  }

  return (
    <div>
      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search analyses…"
          className="h-10 w-full rounded-xl border border-border bg-card pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card py-16 text-center text-sm text-muted-foreground">
          {rows.length === 0 ? (
            <>
              No analyses yet.{" "}
              <Link href="/workspace" className="font-medium text-brand hover:underline">
                Run your first one →
              </Link>
            </>
          ) : (
            "No matches."
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
          <ul className="divide-y divide-border">
            {filtered.map((r) => (
              <li key={r.id} className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/40">
                <GradeBadge grade={r.grade} />
                <Link href={`/history/${r.id}`} className="min-w-0 flex-1">
                  <div className="truncate font-medium">{r.title ?? r.filename ?? "Snippet"}</div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                    <span className="uppercase">{r.language}</span>
                    <span>·</span>
                    <span>{r.issueCount} issues</span>
                    {r.criticalCount > 0 && <span className="text-destructive">· {r.criticalCount} critical</span>}
                    <span>·</span>
                    <span>{formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}</span>
                  </div>
                </Link>
                <ComplexityBadge bigO={r.complexityClass as BigO} className="hidden sm:inline-flex" />
                <div className="hidden w-14 text-right md:block">
                  <div className="font-display text-lg font-bold tabular-nums">{r.ecoScore}</div>
                  <div className="text-[0.6rem] text-muted-foreground">+{r.xpAwarded} XP</div>
                </div>
                <button
                  onClick={() => del(r.id)}
                  disabled={pending && deletingId === r.id}
                  aria-label="Delete"
                  className="rounded-lg p-2 text-muted-foreground opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                >
                  {pending && deletingId === r.id ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
