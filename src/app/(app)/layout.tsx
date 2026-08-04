import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { ensureProfile, getUserRank, getTotalPlayers } from "@/lib/data";
import { levelProgress } from "@/lib/game";
import { AppShell } from "@/components/app/app-shell";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const profile = await ensureProfile(session.user.id, session.user.name);
  const progress = levelProgress(profile.xp);
  const [rankPosition, totalPlayers] = await Promise.all([getUserRank(session.user.id), getTotalPlayers()]);

  return (
    <AppShell
      user={{ name: session.user.name, email: session.user.email }}
      stats={{
        level: progress.level,
        rankName: progress.rank.name,
        rankEmoji: progress.rank.emoji,
        pct: progress.pct,
        xp: profile.xp,
        xpToNext: progress.xpToNext,
        streak: profile.streakCount,
        rankPosition,
        totalPlayers,
      }}
    >
      {children}
    </AppShell>
  );
}
