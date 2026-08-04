/**
 * Greenprint · AI layer (server-only)
 * -----------------------------------
 * Two AI features — "Explain this code" and "Auto-generate documentation" —
 * powered by Anthropic Claude, with two green/robustness properties:
 *
 *  1. CACHING  — results are cached in SQLite keyed by (kind + code hash). The
 *     same code never pays for the same Claude call twice. This is the
 *     "efficient caching to reduce repeated AI requests" green requirement.
 *
 *  2. DEMO FALLBACK — with no ANTHROPIC_API_KEY, both features still return a
 *     genuinely useful, deterministic answer built from the offline analysis.
 *     So the whole app works for every teammate with zero configuration; a key
 *     only upgrades these two panels from "demo" to live Claude.
 *
 * We default to the small, efficient Haiku model — using the smallest capable
 * model is itself a sustainability choice.
 */
import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { aiCache } from "@/lib/db/schema";
import { analyzeCode, hashCode, LANGUAGE_LABELS } from "@/lib/analysis";
import type { AnalysisReport, Language } from "@/lib/analysis";

const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5-20251001";

export type AiKind = "explain" | "document";
export interface AiResult {
  content: string; // markdown
  source: "ai" | "demo";
  cached: boolean;
  model?: string;
}

export function isAiLive(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

// ------------------------------------------------------------------- caching
async function readCache(kind: AiKind, hash: string): Promise<AiResult | null> {
  const id = `${kind}:${hash}`;
  const [row] = await db.select().from(aiCache).where(eq(aiCache.id, id)).limit(1);
  if (!row) return null;
  await db.update(aiCache).set({ hits: sql`${aiCache.hits} + 1` }).where(eq(aiCache.id, id));
  return { content: row.content, source: row.source as "ai" | "demo", cached: true, model: row.model ?? undefined };
}

async function writeCache(kind: AiKind, hash: string, language: Language, result: AiResult) {
  await db
    .insert(aiCache)
    .values({
      id: `${kind}:${hash}`,
      kind,
      hash,
      language,
      content: result.content,
      model: result.model ?? null,
      source: result.source,
    })
    .onConflictDoNothing();
}

/** Aggregate cache stats for the "green metrics" panel. */
export async function getCacheStats() {
  const [row] = await db
    .select({
      entries: sql<number>`count(*)`,
      hits: sql<number>`coalesce(sum(${aiCache.hits}), 0)`,
    })
    .from(aiCache);
  return { entries: Number(row?.entries ?? 0), servedFromCache: Number(row?.hits ?? 0) };
}

// --------------------------------------------------------------- Claude calls
async function callClaude(system: string, userPrompt: string): Promise<string> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1400,
    system,
    messages: [{ role: "user", content: userPrompt }],
  });
  return message.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
}

// ------------------------------------------------------------- demo fallbacks
function demoExplain(code: string, language: Language, report: AnalysisReport): string {
  const lang = LANGUAGE_LABELS[language];
  const out: string[] = [];
  out.push(`### Overview`);
  out.push(
    `This is a **${lang}** snippet of about ${report.size.codeLines} lines of code across ` +
      `${report.complexity.functionCount || "a few"} function(s). Greenprint estimates its ` +
      `algorithmic complexity at **${report.energy.complexityClass} (${report.energy.complexityLabel})**.`,
  );

  out.push(`### Sustainability review`);
  out.push(
    `**EcoScore ${report.ecoScore.score}/100 — grade ${report.ecoScore.grade} (${report.ecoScore.rating}).** ` +
      (report.issues.length === 0
        ? "No inefficiency patterns were detected — this code is already lean. 🌿"
        : `The analyser found ${report.issues.length} issue(s) worth attention:`),
  );
  for (const issue of report.issues.slice(0, 6)) {
    out.push(
      `- **${issue.ruleTitle}** _(line ${issue.line}, ${issue.severity})_ — ${issue.message} ` +
        `\n  _Why it matters:_ ${issue.why}\n  _Greener alternative:_ ${issue.suggestion}`,
    );
  }

  if (report.greenSuggestions.length) {
    out.push(`### Top green recommendations`);
    for (const s of report.greenSuggestions.slice(0, 4)) out.push(`- ${s}`);
  }

  out.push(
    `> _This explanation was generated in demo mode from Greenprint's offline analysis. ` +
      `Add an ANTHROPIC_API_KEY to get a richer, conversational explanation from Claude._`,
  );
  return out.join("\n\n");
}

function demoDocument(code: string, language: Language, report: AnalysisReport): string {
  const lang = LANGUAGE_LABELS[language];
  const names = [...code.matchAll(/(?:function|def|fn|func)\s+([A-Za-z_$][\w$]*)/g)].map((m) => m[1]);
  const out: string[] = [];
  out.push(`# Module documentation`);
  out.push(
    `_${lang} · ${report.size.codeLines} lines · complexity ${report.energy.complexityClass}._`,
  );
  out.push(`## Summary`);
  out.push(
    `This module ${names.length ? `defines ${names.length} function(s): ${names.map((n) => `\`${n}\``).join(", ")}.` : "is a script-style snippet."} ` +
      `Its maintainability index is ${report.complexity.maintainabilityIndex}/100.`,
  );
  if (names.length) {
    out.push(`## Functions`);
    for (const n of names.slice(0, 12)) {
      out.push(`### \`${n}()\`\n- **Purpose:** _describe what ${n} does._\n- **Parameters:** _list inputs._\n- **Returns:** _describe the output._`);
    }
  }
  out.push(`## Notes on efficiency`);
  out.push(
    report.issues.length
      ? report.issues.slice(0, 4).map((i) => `- Line ${i.line}: ${i.suggestion}`).join("\n")
      : "- No efficiency concerns detected.",
  );
  out.push(
    `> _Generated in demo mode. Add an ANTHROPIC_API_KEY for Claude to write complete, prose documentation._`,
  );
  return out.join("\n\n");
}

// -------------------------------------------------------------- public API
export async function explainCode(input: { code: string; language: Language; report?: AnalysisReport }): Promise<AiResult> {
  const { code, language } = input;
  const report = input.report ?? analyzeCode({ code, language });
  const hash = hashCode(code);

  const cached = await readCache("explain", hash);
  if (cached) return cached;

  let result: AiResult;
  if (isAiLive()) {
    try {
      const system =
        "You are Greenprint, an assistant that explains code to developers and coaches them toward energy-efficient, sustainable software. Be clear and encouraging. Use short markdown sections. First explain what the code does, then discuss efficiency/sustainability and concrete greener alternatives.";
      const issueSummary = report.issues
        .slice(0, 8)
        .map((i) => `- line ${i.line}: ${i.ruleTitle} — ${i.message}`)
        .join("\n");
      const prompt = `Language: ${LANGUAGE_LABELS[language]}\nStatic analysis found EcoScore ${report.ecoScore.score}/100, complexity ${report.energy.complexityClass}.\nDetected issues:\n${issueSummary || "none"}\n\nCode:\n\`\`\`${language}\n${code}\n\`\`\``;
      const content = await callClaude(system, prompt);
      result = { content, source: "ai", cached: false, model: MODEL };
    } catch {
      result = { content: demoExplain(code, language, report), source: "demo", cached: false };
    }
  } else {
    result = { content: demoExplain(code, language, report), source: "demo", cached: false };
  }

  await writeCache("explain", hash, language, result);
  return result;
}

export async function generateDocs(input: { code: string; language: Language; report?: AnalysisReport }): Promise<AiResult> {
  const { code, language } = input;
  const report = input.report ?? analyzeCode({ code, language });
  const hash = hashCode(code);

  const cached = await readCache("document", hash);
  if (cached) return cached;

  let result: AiResult;
  if (isAiLive()) {
    try {
      const system =
        "You are Greenprint's documentation generator. Produce clean, professional markdown documentation for the given code: a short overview, then per-function documentation (purpose, parameters, returns), and a brief 'efficiency notes' section. Do not invent behaviour that isn't in the code.";
      const prompt = `Language: ${LANGUAGE_LABELS[language]}\n\nCode:\n\`\`\`${language}\n${code}\n\`\`\``;
      const content = await callClaude(system, prompt);
      result = { content, source: "ai", cached: false, model: MODEL };
    } catch {
      result = { content: demoDocument(code, language, report), source: "demo", cached: false };
    }
  } else {
    result = { content: demoDocument(code, language, report), source: "demo", cached: false };
  }

  await writeCache("document", hash, language, result);
  return result;
}
