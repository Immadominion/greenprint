"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { Gauge, Leaf, Loader2, Play, Sparkles, Trash2, Upload } from "lucide-react";
import { CodeEditor } from "./code-editor";
import { AnalysisResults } from "./analysis-results";
import { AiPanel } from "./ai-panel";
import { ExportButtons } from "./export-buttons";
import { RewardOverlay, type Reward } from "./reward-overlay";
import { analyzeAndSaveAction } from "@/lib/actions";
import { detectLanguage, LANGUAGE_LABELS, SUPPORTED_LANGUAGES } from "@/lib/analysis";
import type { AnalysisReport, Language } from "@/lib/analysis";
import { EXAMPLES } from "@/lib/examples";
import { cn } from "@/lib/utils";

export function WorkspaceClient() {
  const [code, setCode] = useState(EXAMPLES[0].code);
  const [language, setLanguage] = useState<Language>(EXAMPLES[0].language);
  const [filename, setFilename] = useState<string | undefined>(undefined);
  const [analyzing, setAnalyzing] = useState(false);
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [title, setTitle] = useState("Snippet");
  const [reward, setReward] = useState<Reward | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function analyze() {
    if (!code.trim()) {
      toast.error("Paste or write some code first.");
      return;
    }
    setAnalyzing(true);
    try {
      const res = await analyzeAndSaveAction({ code, language, filename });
      if (!res.ok) throw new Error(res.error);
      setReport(res.report);
      setTitle(filename ?? `${LANGUAGE_LABELS[res.report.language]} snippet`);
      toast.success(`+${res.xp.total} XP earned`, {
        description: res.streakExtended ? `🔥 ${res.streak}-day streak!` : `EcoScore ${res.report.ecoScore.score}/100`,
      });
      if (res.levelUp || res.newBadges.length > 0) {
        setReward({
          levelUp: res.levelUp,
          newLevel: res.newLevel,
          rankName: res.progress.rank.name,
          rankEmoji: res.progress.rank.emoji,
          badges: res.newBadges,
          xp: res.xp.total,
        });
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  }

  function loadExample(id: string) {
    const ex = EXAMPLES.find((e) => e.id === id);
    if (!ex) return;
    setCode(ex.code);
    setLanguage(ex.language);
    setFilename(undefined);
    setReport(null);
    toast.info(`Loaded "${ex.label}"`);
  }

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setCode(text);
    setLanguage(detectLanguage(text, file.name));
    setFilename(file.name);
    setReport(null);
    toast.success(`Loaded ${file.name}`);
    e.target.value = "";
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold tracking-tight">Analyze code</h1>
        <p className="text-sm text-muted-foreground">
          Paste, upload, or pick an example. Greenprint scores its efficiency and suggests greener alternatives.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Editor column */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="h-9 rounded-lg border border-border bg-background px-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-ring"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l} value={l}>
                    {LANGUAGE_LABELS[l]}
                  </option>
                ))}
              </select>
              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={() => fileRef.current?.click()}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <Upload className="size-4" /> Upload
                </button>
                <button
                  onClick={() => {
                    setCode("");
                    setReport(null);
                    setFilename(undefined);
                  }}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <Trash2 className="size-4" /> Clear
                </button>
                <input ref={fileRef} type="file" className="hidden" onChange={onUpload} accept=".js,.ts,.jsx,.tsx,.py,.java,.cpp,.c,.cs,.go,.rb,.php,.rs,.sql,.txt" />
              </div>
            </div>

            <div className="mb-3 flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Try:</span>
              {EXAMPLES.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => loadExample(ex.id)}
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                    ex.tone === "clean"
                      ? "border-eco/30 text-eco-strong hover:bg-eco-soft"
                      : "border-border text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  {ex.label}
                </button>
              ))}
            </div>

            <CodeEditor value={code} onChange={setCode} language={language} />

            <button
              onClick={analyze}
              disabled={analyzing}
              className="group relative mt-3 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-primary py-3 font-semibold text-primary-foreground shadow-soft transition-all hover:shadow-lift disabled:opacity-80"
            >
              {analyzing ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Analyzing…
                  <motion.span
                    className="absolute bottom-0 left-0 h-0.5 bg-white/60"
                    initial={{ width: "0%" }}
                    animate={{ width: "90%" }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                  />
                </>
              ) : (
                <>
                  <Play className="size-4 transition-transform group-hover:scale-110" />
                  Analyze code
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results column */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {analyzing && !report && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
                  <div className="flex items-center gap-4">
                    <div className="shimmer size-[120px] rounded-full" />
                    <div className="flex-1 space-y-2.5">
                      {[80, 60, 90, 70].map((w, i) => (
                        <div key={i} className="shimmer h-4 rounded" style={{ width: `${w}%` }} />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {report && !analyzing && (
              <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg font-semibold">Results</h2>
                  <ExportButtons report={report} title={title} />
                </div>
                <AnalysisResults report={report} />
                <AiPanel code={code} language={report.language} />
              </motion.div>
            )}

            {!report && !analyzing && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid h-full min-h-[420px] place-items-center rounded-2xl border border-dashed border-border bg-card p-8 text-center"
              >
                <div>
                  <div className="mx-auto grid size-16 place-items-center rounded-3xl bg-brand-soft text-brand">
                    <Gauge className="size-8" />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-semibold">Ready when you are</h3>
                  <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">
                    Hit <span className="font-medium text-foreground">Analyze code</span> to see the EcoScore, energy estimate, issues and greener fixes.
                  </p>
                  <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Sparkles className="size-3.5 text-brand" /> Instant &amp; offline
                    </span>
                    <span className="flex items-center gap-1">
                      <Leaf className="size-3.5 text-eco" /> Greener suggestions
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <RewardOverlay reward={reward} onClose={() => setReward(null)} />
    </div>
  );
}
