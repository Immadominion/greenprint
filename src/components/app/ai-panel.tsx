"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FileText, Loader2, RefreshCw, Sparkles, Wand2, Zap } from "lucide-react";
import { toast } from "sonner";
import { explainCodeAction, generateDocsAction } from "@/lib/actions";
import type { Language } from "@/lib/analysis";
import { Markdown } from "./markdown";
import { cn } from "@/lib/utils";

type Kind = "explain" | "document";
interface AiState {
  content: string;
  source: "ai" | "demo";
  cached: boolean;
}

export function AiPanel({ code, language }: { code: string; language: Language }) {
  const [tab, setTab] = useState<Kind>("explain");
  const [results, setResults] = useState<Partial<Record<Kind, AiState>>>({});
  const [loading, setLoading] = useState<Kind | null>(null);

  async function run(kind: Kind) {
    setLoading(kind);
    try {
      const res = kind === "explain" ? await explainCodeAction({ code, language }) : await generateDocsAction({ code, language });
      if (!res.ok) throw new Error(res.error);
      setResults((r) => ({ ...r, [kind]: { content: res.content, source: res.source, cached: res.cached } }));
      if (res.cached) toast.success("Served instantly from cache ⚡");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "AI request failed");
    } finally {
      setLoading(null);
    }
  }

  const current = results[tab];
  const busy = loading === tab;

  const tabs: { key: Kind; label: string; icon: typeof Sparkles }[] = [
    { key: "explain", label: "Explain", icon: Sparkles },
    { key: "document", label: "Auto-document", icon: FileText },
  ];

  return (
    <div className="rounded-2xl border border-border bg-card shadow-soft">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Wand2 className="size-4 text-brand" />
          <span className="font-display text-sm font-semibold">AI assistant</span>
        </div>
        <div className="flex gap-1 rounded-lg bg-muted p-0.5">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                tab === t.key ? "bg-card text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <t.icon className="size-3.5" />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">
        {!current && !busy && (
          <div className="grid place-items-center py-10 text-center">
            <div className="grid size-12 place-items-center rounded-2xl bg-brand-soft text-brand">
              <Sparkles className="size-6" />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              {tab === "explain" ? "Get a plain-English explanation with sustainability tips." : "Generate documentation for this code."}
            </p>
            <button
              onClick={() => run(tab)}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground shadow-soft transition-transform hover:scale-[1.02]"
            >
              <Zap className="size-4" />
              {tab === "explain" ? "Explain this code" : "Generate docs"}
            </button>
          </div>
        )}

        {busy && (
          <div className="space-y-2.5 py-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin text-brand" />
              Thinking…
            </div>
            {[92, 78, 96, 64, 85].map((w, i) => (
              <div key={i} className="shimmer h-3.5 rounded" style={{ width: `${w}%` }} />
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {current && !busy && (
            <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium",
                      current.source === "ai"
                        ? "border-brand/30 bg-brand-soft text-brand"
                        : "border-border bg-muted text-muted-foreground",
                    )}
                  >
                    {current.source === "ai" ? "Claude" : "Demo mode"}
                  </span>
                  {current.cached && (
                    <span className="inline-flex items-center gap-1 rounded-md border border-eco/30 bg-eco-soft px-2 py-0.5 text-xs font-medium text-eco-strong">
                      ⚡ cached
                    </span>
                  )}
                </div>
                <button
                  onClick={() => run(tab)}
                  className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  <RefreshCw className="size-3.5" /> Regenerate
                </button>
              </div>
              <Markdown>{current.content}</Markdown>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
