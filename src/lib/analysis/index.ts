/**
 * Greenprint · Analysis Engine — public entry point
 * -------------------------------------------------
 * `analyzeCode()` runs the whole pipeline and returns one {@link AnalysisReport}:
 *
 *   detectLanguage → preprocess → metrics → rules → energy model → scores
 *
 * It is pure and synchronous: no network, no database, no API key. The same
 * function runs on the server (in a Server Action) and could run in the browser
 * or a Web Worker unchanged. It also measures its OWN wall-clock time — an honest,
 * real "resource usage" number to sit alongside the modelled estimates.
 */
import type { AnalysisReport, CodeIssue, Language, Severity } from "./types";
import { SEVERITY_ORDER } from "./types";
import { detectLanguage } from "./languages";
import { preprocess } from "./preprocess";
import { computeSizeMetrics, computeComplexityMetrics } from "./metrics";
import { runRules } from "./rules";
import { buildEnergyEstimate, computeEcoScore, computeQualityScore, inferComplexityClass } from "./estimate";

export interface AnalyzeInput {
  code: string;
  language?: Language;
  filename?: string;
}

/** Fast, portable FNV-1a hash (no node:crypto) → 8-char hex. Used for AI cache keys. */
export function hashCode(input: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

const severityRank = (s: Severity) => SEVERITY_ORDER.indexOf(s);

function sortIssues(issues: CodeIssue[]): CodeIssue[] {
  return [...issues].sort((a, b) => severityRank(a.severity) - severityRank(b.severity) || a.line - b.line);
}

function tallyBySeverity(issues: CodeIssue[]): Record<Severity, number> {
  const t: Record<Severity, number> = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
  for (const i of issues) t[i.severity]++;
  return t;
}

/** Prioritised, de-duplicated one-liners for the summary panel. */
function topGreenSuggestions(issues: CodeIssue[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const i of [...issues].sort((a, b) => b.impact - a.impact)) {
    if (seen.has(i.suggestion)) continue;
    seen.add(i.suggestion);
    out.push(i.suggestion);
    if (out.length >= 6) break;
  }
  return out;
}

export function analyzeCode({ code, language, filename }: AnalyzeInput): AnalysisReport {
  const start = performance.now();

  const lang = language ?? detectLanguage(code, filename);
  const pre = preprocess(code, lang);
  const size = computeSizeMetrics(pre);
  const complexity = computeComplexityMetrics(pre, size);
  const issues = sortIssues(runRules(pre));
  const cls = inferComplexityClass(pre, issues);
  const energy = buildEnergyEstimate(pre, issues);
  const ecoScore = computeEcoScore(complexity, issues, cls);
  const qualityScore = computeQualityScore(complexity, issues, size);

  const analysisDurationMs = Math.round((performance.now() - start) * 100) / 100;

  return {
    language: lang,
    filename,
    size,
    complexity,
    energy,
    ecoScore,
    qualityScore,
    issues,
    issueCountBySeverity: tallyBySeverity(issues),
    greenSuggestions: topGreenSuggestions(issues),
    analyzedAt: new Date().toISOString(),
    analysisDurationMs,
    hash: hashCode(code),
  };
}

export * from "./types";
export { LANGUAGE_LABELS, SUPPORTED_LANGUAGES, detectLanguage } from "./languages";
export { RULE_CATALOG } from "./rules";
export type { RuleMeta } from "./rules";
export { CLASS_ORDER } from "./estimate";
