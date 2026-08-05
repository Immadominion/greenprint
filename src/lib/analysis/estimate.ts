/**
 * Greenprint · Energy model & scoring
 * -----------------------------------
 * Turns metrics + issues into (a) a transparent, MODELLED energy/CO2 estimate
 * and (b) the gamified EcoScore. Every number in the energy model comes from the
 * documented constants below - it is a teaching model, not a measurement, and the
 * UI/report always say so. This satisfies the "estimated execution time and
 * resource usage" green requirement in an honest, defensible way.
 */
import type {
  BigO,
  CodeIssue,
  ComplexityMetric,
  EcoScore,
  EnergyEstimate,
  SizeMetrics,
} from "./types";
import { SEVERITY_WEIGHT } from "./types";
import type { Preprocessed } from "./preprocess";

// ---- Documented model constants -------------------------------------------
const REFERENCE_N = 10000; // the input size the model reasons about
const OPS_PER_SECOND = 1e8; // ~100M simple ops/sec (conservative interpreted-code baseline)
const CPU_ACTIVE_WATTS = 15; // one active laptop CPU core under load
const GRID_CARBON_G_PER_KWH = 475; // global average grid carbon intensity (gCO2 per kWh)
const EXPONENTIAL_N = 35; // exponential algorithms are only run on tiny inputs; model n=35
const OPS_CAP = 1e15; // clamp so display numbers never overflow

const CLASS_LABEL: Record<BigO, string> = {
  "O(1)": "Constant",
  "O(log n)": "Logarithmic",
  "O(n)": "Linear",
  "O(n log n)": "Linearithmic",
  "O(n²)": "Quadratic",
  "O(n³)": "Cubic",
  "O(2ⁿ)": "Exponential",
};

const CLASS_ORDER: BigO[] = ["O(1)", "O(log n)", "O(n)", "O(n log n)", "O(n²)", "O(n³)", "O(2ⁿ)"];

function hasSort(pre: Preprocessed): boolean {
  const src = pre.cleanLines.join("\n");
  return /\.(sort|sorted)\s*\(|\bsorted\s*\(|Arrays\.sort|Collections\.sort|\.OrderBy\s*\(|sort\.Sort\s*\(/.test(src);
}

export function inferComplexityClass(pre: Preprocessed, issues: CodeIssue[]): BigO {
  if (issues.some((i) => i.id === "exponential-recursion")) return "O(2ⁿ)";
  const loops = pre.maxLoopNesting;
  const sorted = hasSort(pre);
  if (loops >= 3) return "O(n³)";
  if (loops === 2) return "O(n²)";
  if (loops === 1) return sorted ? "O(n log n)" : "O(n)";
  return sorted ? "O(n log n)" : "O(1)";
}

function opsForClass(cls: BigO, n: number): number {
  let ops: number;
  switch (cls) {
    case "O(1)": ops = 1; break;
    case "O(log n)": ops = Math.max(1, Math.log2(n)); break;
    case "O(n)": ops = n; break;
    case "O(n log n)": ops = n * Math.log2(n); break;
    case "O(n²)": ops = n * n; break;
    case "O(n³)": ops = n * n * n; break;
    case "O(2ⁿ)": ops = Math.pow(2, EXPONENTIAL_N); break;
  }
  return Math.min(OPS_CAP, ops);
}

function costOf(cls: BigO) {
  const ops = opsForClass(cls, REFERENCE_N);
  const runtimeMs = (ops / OPS_PER_SECOND) * 1000;
  const energyJoules = (runtimeMs / 1000) * CPU_ACTIVE_WATTS;
  const co2Grams = (energyJoules / 3_600_000) * GRID_CARBON_G_PER_KWH;
  return { ops, runtimeMs, energyJoules, co2Grams };
}

/** The class we could realistically reach after applying the suggested fixes. */
function optimisedClass(cls: BigO): BigO {
  switch (cls) {
    case "O(2ⁿ)": return "O(n)"; // memoization / bottom-up
    case "O(n³)": return "O(n²)";
    case "O(n²)": return "O(n)";
    default: return cls;
  }
}

export function buildEnergyEstimate(pre: Preprocessed, issues: CodeIssue[]): EnergyEstimate {
  const cls = inferComplexityClass(pre, issues);
  const current = costOf(cls);
  const optimised = costOf(optimisedClass(cls));
  const potentialCo2SavingGrams = Math.max(0, current.co2Grams - optimised.co2Grams);

  return {
    complexityClass: cls,
    complexityLabel: CLASS_LABEL[cls],
    referenceInputSize: cls === "O(2ⁿ)" ? EXPONENTIAL_N : REFERENCE_N,
    estimatedOperations: Math.round(current.ops),
    estimatedRuntimeMs: round(current.runtimeMs, 3),
    estimatedEnergyJoules: round(current.energyJoules, 4),
    estimatedCo2Grams: round(current.co2Grams, 5),
    potentialCo2SavingGrams: round(potentialCo2SavingGrams, 5),
    assumptions: [
      `Reference input size N = ${cls === "O(2ⁿ)" ? EXPONENTIAL_N : REFERENCE_N}.`,
      `Processor throughput assumed at ${(OPS_PER_SECOND / 1e6).toFixed(0)}M operations/second.`,
      `Active CPU power draw assumed at ${CPU_ACTIVE_WATTS} W (a single busy core).`,
      `Grid carbon intensity assumed at ${GRID_CARBON_G_PER_KWH} gCO₂/kWh (global average).`,
      "Complexity class is inferred from loop nesting and recursion - a teaching model, not a measurement.",
    ],
  };
}

// ---- EcoScore --------------------------------------------------------------
const CLASS_PENALTY: Record<BigO, number> = {
  "O(1)": 0,
  "O(log n)": 0,
  "O(n)": 2,
  "O(n log n)": 4,
  "O(n²)": 16,
  "O(n³)": 26,
  "O(2ⁿ)": 30,
};

const GREEN_CATEGORIES = new Set(["energy", "resource", "loop", "database", "algorithmic"]);

export function computeEcoScore(
  complexity: ComplexityMetric,
  issues: CodeIssue[],
  cls: BigO,
): EcoScore {
  // 1. Algorithmic efficiency (30 pts)
  const algoMax = 30;
  const algoPoints = clamp(algoMax - CLASS_PENALTY[cls], 0, algoMax);

  // 2. Green / efficiency issues (40 pts)
  const greenMax = 40;
  const greenPenalty = issues
    .filter((i) => GREEN_CATEGORIES.has(i.category))
    .reduce((s, i) => s + SEVERITY_WEIGHT[i.severity] * (0.5 + i.impact * 0.5), 0);
  const greenPoints = clamp(greenMax - greenPenalty, 0, greenMax);

  // 3. Code quality (20 pts) - anchored on maintainability index
  const qualityMax = 20;
  const qualityPenalty = issues
    .filter((i) => i.category === "quality")
    .reduce((s, i) => s + SEVERITY_WEIGHT[i.severity] * 0.5, 0);
  const qualityPoints = clamp((qualityMax * complexity.maintainabilityIndex) / 100 - qualityPenalty, 0, qualityMax);

  // 4. Complexity & nesting (10 pts)
  const complexityMax = 10;
  let cxPenalty = 0;
  if (complexity.cyclomatic > 10) cxPenalty += Math.min(6, (complexity.cyclomatic - 10) * 0.4);
  if (complexity.maxNestingDepth > 5) cxPenalty += Math.min(4, (complexity.maxNestingDepth - 5) * 1.5);
  const complexityPoints = clamp(complexityMax - cxPenalty, 0, complexityMax);

  const score = Math.round(algoPoints + greenPoints + qualityPoints + complexityPoints);

  return {
    score,
    grade: gradeFor(score),
    rating: ratingFor(score),
    breakdown: [
      { label: "Algorithmic efficiency", points: Math.round(algoPoints), max: algoMax },
      { label: "Green code practices", points: Math.round(greenPoints), max: greenMax },
      { label: "Code quality", points: Math.round(qualityPoints), max: qualityMax },
      { label: "Complexity & nesting", points: Math.round(complexityPoints), max: complexityMax },
    ],
  };
}

export function computeQualityScore(complexity: ComplexityMetric, issues: CodeIssue[], size: SizeMetrics): number {
  let q = complexity.maintainabilityIndex;
  q -= issues.filter((i) => i.category === "quality").length * 2;
  if (complexity.longestFunctionLines > 120) q -= 8;
  if (complexity.maxNestingDepth > 6) q -= 5;
  if (size.duplicateLineGroups > 0) q -= Math.min(10, size.duplicateLineGroups * 2);
  if (size.commentRatio >= 0.05) q += 3;
  return clamp(Math.round(q), 0, 100);
}

function gradeFor(s: number): EcoScore["grade"] {
  if (s >= 95) return "A+";
  if (s >= 88) return "A";
  if (s >= 78) return "B";
  if (s >= 65) return "C";
  if (s >= 50) return "D";
  return "F";
}

function ratingFor(s: number): EcoScore["rating"] {
  if (s >= 88) return "Excellent";
  if (s >= 75) return "Good";
  if (s >= 60) return "Fair";
  if (s >= 45) return "Needs Work";
  return "Poor";
}

// ---- tiny math helpers -----------------------------------------------------
function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}
function round(v: number, dp: number): number {
  const f = Math.pow(10, dp);
  return Math.round(v * f) / f;
}

export { CLASS_ORDER };
