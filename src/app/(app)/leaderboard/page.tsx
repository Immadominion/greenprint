import type { Metadata } from "next";
import { Flame, Leaf, Trophy } from "lucide-react";
import { getSession } from "@/lib/session";
import { getLeaderboard } from "@/lib/data";
import { rankForLevel } from "@/lib/game";
import { formatCo2 } from "@/lib/format";
import { FadeIn } from "@/components/greenprint/motion";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Leaderboard" };

const MEDAL = ["🥇", "🥈", "🥉"];

export default async function LeaderboardPage() {
  const session = await getSession();
  const rows = await getLeaderboard(50);
  const me = session!.user.id;
  const top3 = rows.slice(0, 3);
  const rest = rows.slice(3);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold tracking-tight">Team leaderboard</h1>
        <p className="text-sm text-muted-foreground">Who&apos;s writing the greenest code in Group 3.</p>
      </div>

      {/* Podium */}
      <FadeIn>
        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          {[top3[1], top3[0], top3[2]].filter(Boolean).map((row) => {
            const idx = rows.indexOf(row);
            const rank = rankForLevel(row.level);
            const isMe = row.userId === me;
            const first = idx === 0;
            return (
              <div
                key={row.userId}
                className={cn(
                  "relative overflow-hidden rounded-2xl border bg-card p-5 text-center shadow-soft",
                  first ? "border-brand/40 sm:-translate-y-2" : "border-border",
                  isMe && "ring-2 ring-brand",
                )}
              >
                {first && <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand to-brand-bright" />}
                <div className="text-3xl">{MEDAL[idx]}</div>
                <div className="mx-auto mt-2 grid size-12 place-items-center rounded-2xl bg-brand-soft font-display text-lg font-bold text-brand">
                  {(row.displayName ?? row.name ?? "?").slice(0, 1)}
                </div>
                <div className="mt-2 truncate font-semibold">{row.displayName ?? row.name}</div>
                <div className="text-xs text-muted-foreground">
                  {rank.emoji} {rank.name} · Lvl {row.level}
                </div>
                <div className="mt-2 font-mono text-2xl font-bold tabular-nums text-brand">{row.xp.toLocaleString()}</div>
                <div className="text-[0.65rem] uppercase tracking-wide text-muted-foreground">XP</div>
              </div>
            );
          })}
        </div>
      </FadeIn>

      {/* Rest */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        <ul className="divide-y divide-border">
          {rest.map((row, i) => {
            const rank = rankForLevel(row.level);
            const isMe = row.userId === me;
            return (
              <li
                key={row.userId}
                className={cn("flex items-center gap-4 px-4 py-3", isMe && "bg-brand-soft/50")}
              >
                <span className="w-6 text-center font-display text-sm font-bold text-muted-foreground">{i + 4}</span>
                <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-muted font-semibold">
                  {(row.displayName ?? row.name ?? "?").slice(0, 1)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">
                    {row.displayName ?? row.name}
                    {isMe && <span className="ml-2 rounded bg-brand px-1.5 py-0.5 text-[0.6rem] font-bold text-primary-foreground">YOU</span>}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {rank.emoji} {rank.name} · Level {row.level}
                  </div>
                </div>
                <div className="hidden items-center gap-1.5 text-sm text-muted-foreground sm:flex">
                  <Flame className="size-4 text-brand" />
                  {row.streak}
                </div>
                <div className="hidden items-center gap-1.5 text-sm text-eco-strong md:flex">
                  <Leaf className="size-4" />
                  {formatCo2(row.co2Saved)}
                </div>
                <div className="w-16 text-right font-mono font-bold tabular-nums">{row.xp.toLocaleString()}</div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
