/**
 * Greenprint · Analysis Engine - Type Definitions
 * -------------------------------------------------
 * These types describe the output of the fully-offline static analysis engine.
 * Nothing here depends on any third-party package or on the network, so the
 * whole engine runs identically on a server, in a Web Worker, or in the browser.
 *
 * The engine answers four questions about a piece of code:
 *   1. How big / complex is it?          (SizeMetrics, ComplexityMetric)
 *   2. What is wrong with it?            (CodeIssue[])
 *   3. What will it cost the planet?     (EnergyEstimate)
 *   4. How "green" is it overall?        (EcoScore)
 */

export type Language =
  | "javascript"
  | "typescript"
  | "python"
  | "java"
  | "cpp"
  | "c"
  | "csharp"
  | "go"
  | "ruby"
  | "php"
  | "rust"
  | "sql"
  | "unknown";

/** How serious an issue is. Drives colour, sort order and score penalty. */
export type Severity = "critical" | "high" | "medium" | "low" | "info";

/** The bucket an issue belongs to. Used for grouping and filtering in the UI. */
export type IssueCategory =
  | "algorithmic" // inefficient algorithm / bad complexity class
  | "resource" // memory / IO heavy work
  | "database" // inefficient data access
  | "loop" // work done needlessly inside loops
  | "quality" // maintainability / readability
  | "energy"; // directly wasteful of CPU / power

/** A single finding: one thing the engine noticed at one place in the code. */
export interface CodeIssue {
  /** Stable rule id, e.g. "nested-loops". Used for docs, tests and dedupe. */
  id: string;
  ruleTitle: string;
  category: IssueCategory;
  severity: Severity;
  /** 1-based line number the issue was found on. */
  line: number;
  /** The offending source line, trimmed. Shown verbatim in the UI. */
  snippet: string;
  /** Plain-English description of what is wrong. */
  message: string;
  /** Why this pattern wastes CPU time / memory / energy. */
  why: string;
  /** The greener alternative, in plain English. */
  suggestion: string;
  /** Optional short code example of the fixed version. */
  betterExample?: string;
  /** Relative impact weight 0..1 - how much energy this pattern tends to waste. */
  impact: number;
  /** Estimated grams of CO2 saved per run if this issue is fixed (modelled). */
  co2SavingGrams: number;
}

export interface SizeMetrics {
  totalLines: number;
  codeLines: number;
  commentLines: number;
  blankLines: number;
  /** commentLines / codeLines, clamped to a sensible range. */
  commentRatio: number;
  characters: number;
  /** Number of groups of 2+ identical non-trivial lines (copy-paste smell). */
  duplicateLineGroups: number;
}

export interface ComplexityMetric {
  /** McCabe cyclomatic complexity (approximated by counting decision points). */
  cyclomatic: number;
  /** Deepest block nesting found anywhere in the file. */
  maxNestingDepth: number;
  /** Deepest *loop* nesting (2 => an O(n²) shaped hotspot). */
  maxLoopNesting: number;
  functionCount: number;
  longestFunctionLines: number;
  averageFunctionLines: number;
  /** Simplified Maintainability Index, 0 (worst) .. 100 (best). */
  maintainabilityIndex: number;
}

/** Big-O complexity classes we can infer, ordered from cheapest to most costly. */
export type BigO =
  | "O(1)"
  | "O(log n)"
  | "O(n)"
  | "O(n log n)"
  | "O(n²)"
  | "O(n³)"
  | "O(2ⁿ)";

/**
 * A transparent, *modelled* estimate of what running this code costs.
 * Every number here is derived from documented assumptions (see `assumptions`),
 * NOT measured from a real execution. The UI always labels these as estimates.
 */
export interface EnergyEstimate {
  complexityClass: BigO;
  complexityLabel: string; // e.g. "Quadratic"
  referenceInputSize: number; // the N used by the model
  estimatedOperations: number; // modelled op-count at N
  estimatedRuntimeMs: number; // modelled runtime at N
  estimatedEnergyJoules: number; // modelled CPU energy at N
  estimatedCo2Grams: number; // modelled grams of CO2 at N
  /** How much CO2 the suggested fixes could remove (current − optimised). */
  potentialCo2SavingGrams: number;
  /** Human-readable list of every assumption behind the numbers above. */
  assumptions: string[];
}

export interface EcoScoreBreakdownRow {
  label: string;
  points: number; // points kept
  max: number; // points available
}

export interface EcoScore {
  score: number; // 0..100
  grade: "A+" | "A" | "B" | "C" | "D" | "F";
  rating: "Excellent" | "Good" | "Fair" | "Needs Work" | "Poor";
  breakdown: EcoScoreBreakdownRow[];
}

/** The complete report for one analysis run. This is what the app stores & renders. */
export interface AnalysisReport {
  language: Language;
  filename?: string;
  size: SizeMetrics;
  complexity: ComplexityMetric;
  energy: EnergyEstimate;
  ecoScore: EcoScore;
  /** 0..100 maintainability / readability score (separate from EcoScore). */
  qualityScore: number;
  issues: CodeIssue[];
  issueCountBySeverity: Record<Severity, number>;
  /** De-duplicated, prioritised one-line green tips for the summary panel. */
  greenSuggestions: string[];
  analyzedAt: string; // ISO timestamp
  /** REAL measured wall-clock time the analysis pass took (honest metric). */
  analysisDurationMs: number;
  /** Fast content hash - used to cache AI calls and dedupe identical submissions. */
  hash: string;
}

export const SEVERITY_ORDER: Severity[] = [
  "critical",
  "high",
  "medium",
  "low",
  "info",
];

/** Points a single issue removes from the EcoScore, before its impact weight. */
export const SEVERITY_WEIGHT: Record<Severity, number> = {
  critical: 20,
  high: 12,
  medium: 6,
  low: 2.5,
  info: 0.5,
};

/**
 * Modelled grams of CO2 a single occurrence of an issue tends to waste per run,
 * before the rule's own impact weight is applied. These are deliberately small,
 * illustrative constants - the UI always labels the resulting numbers as estimates.
 */
export const CO2_BASE: Record<Severity, number> = {
  critical: 2.4,
  high: 1.2,
  medium: 0.5,
  low: 0.15,
  info: 0.03,
};
