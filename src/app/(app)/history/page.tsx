import type { Metadata } from "next";
import { getSession } from "@/lib/session";
import { getRecentAnalyses, getStats } from "@/lib/data";
import { HistoryList } from "@/components/app/history-list";

export const metadata: Metadata = { title: "History" };

export default async function HistoryPage() {
  const session = await getSession();
  const user = session!.user;
  const [rows, stats] = await Promise.all([getRecentAnalyses(user.id, 100), getStats(user.id)]);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold tracking-tight">History</h1>
        <p className="text-sm text-muted-foreground">
          {stats.total} analyses · average EcoScore {stats.avgEco} · {stats.totalIssues} issues surfaced across {stats.languages} language(s)
        </p>
      </div>
      <HistoryList rows={rows} />
    </div>
  );
}
