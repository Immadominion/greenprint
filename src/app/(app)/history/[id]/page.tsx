import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/session";
import { getAnalysis } from "@/lib/data";
import type { AnalysisReport } from "@/lib/analysis";
import { LANGUAGE_LABELS } from "@/lib/analysis";
import { AnalysisResults } from "@/components/app/analysis-results";
import { AiPanel } from "@/components/app/ai-panel";
import { ExportButtons } from "@/components/app/export-buttons";
import { CodeEditor } from "@/components/app/code-editor";

export default async function AnalysisDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  const row = await getAnalysis(session!.user.id, id);
  if (!row) notFound();

  const report = JSON.parse(row.report) as AnalysisReport;
  const title = row.title ?? row.filename ?? "Snippet";

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Link href="/history" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> History
      </Link>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">
            {LANGUAGE_LABELS[report.language]} · analysed {format(row.createdAt, "PPP 'at' p")}
          </p>
        </div>
        <ExportButtons report={report} title={title} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
            <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Source</div>
            <CodeEditor value={row.code} language={report.language} editable={false} height="420px" />
          </div>
          <AiPanel code={row.code} language={report.language} />
        </div>
        <AnalysisResults report={report} />
      </div>
    </div>
  );
}
