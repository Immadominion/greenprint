/**
 * Greenprint · Metrics
 * --------------------
 * Turns the pre-processed source into hard numbers:
 *   • Size      - lines of code, comments, blanks, duplication.
 *   • Complexity- McCabe cyclomatic complexity, nesting, function sizes,
 *                 and a simplified Maintainability Index (MI).
 *
 * Everything is an approximation computed WITHOUT a full parser - that is a
 * deliberate trade-off so the engine stays tiny, dependency-free and fast
 * (the "lightweight architecture" green requirement). The approximations are
 * standard and are documented so they can be defended.
 */
import type { ComplexityMetric, Language, SizeMetrics } from "./types";
import type { Preprocessed } from "./preprocess";

export function computeSizeMetrics(pre: Preprocessed): SizeMetrics {
  let codeLines = 0;
  let commentLines = 0;
  let blankLines = 0;
  for (const k of pre.lineKinds) {
    if (k === "code") codeLines++;
    else if (k === "comment") commentLines++;
    else blankLines++;
  }
  const characters = pre.rawLines.reduce((sum, l) => sum + l.length, 0);

  // Duplicate detection: groups of 2+ identical, non-trivial code lines.
  const counts = new Map<string, number>();
  pre.rawLines.forEach((line, i) => {
    if (pre.lineKinds[i] !== "code") return;
    const key = line.trim();
    if (key.length < 12) return; // ignore `}` , `return` , etc.
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });
  let duplicateLineGroups = 0;
  for (const n of counts.values()) if (n >= 2) duplicateLineGroups++;

  return {
    totalLines: pre.rawLines.length,
    codeLines,
    commentLines,
    blankLines,
    commentRatio: codeLines === 0 ? 0 : Math.min(1, commentLines / codeLines),
    characters,
    duplicateLineGroups,
  };
}

/** Per-language regexes for the decision points that add a branch (McCabe +1 each). */
function decisionPatterns(language: Language): RegExp[] {
  switch (language) {
    case "python":
      return [/\bif\b/g, /\belif\b/g, /\bfor\b/g, /\bwhile\b/g, /\bexcept\b/g, /\band\b/g, /\bor\b/g];
    case "ruby":
      return [/\bif\b/g, /\belsif\b/g, /\bunless\b/g, /\bwhile\b/g, /\bfor\b/g, /\bwhen\b/g, /\brescue\b/g, /&&/g, /\|\|/g];
    case "sql":
      return [/\bWHERE\b/gi, /\bCASE\b/gi, /\bWHEN\b/gi, /\bAND\b/gi, /\bOR\b/gi, /\bJOIN\b/gi];
    default: // c-like
      return [/\bif\b/g, /\bfor\b/g, /\bwhile\b/g, /\bcase\b/g, /\bcatch\b/g, /&&/g, /\|\|/g, /\?\?/g];
  }
}

function cyclomaticComplexity(pre: Preprocessed): number {
  const clean = pre.cleanLines.join("\n");
  let decisions = 0;
  for (const re of decisionPatterns(pre.language)) {
    const matches = clean.match(re);
    if (matches) decisions += matches.length;
  }
  return 1 + decisions;
}

const CONTROL_KEYWORDS = new Set([
  "if", "for", "while", "switch", "catch", "return", "else", "do", "case", "with", "try",
]);

/** Regexes that mark the *start* of a function/method for each language. */
function functionHeaderRegexes(language: Language): RegExp[] {
  switch (language) {
    case "python":
      return [/^\s*def\s+\w+\s*\(/];
    case "ruby":
      return [/^\s*def\s+\w+/];
    case "go":
      return [/\bfunc\s+(\([^)]*\)\s*)?\w+\s*\(/];
    case "rust":
      return [/\bfn\s+\w+\s*[(<]/];
    case "php":
      return [/\bfunction\s+\w+\s*\(/, /\bfunction\s*\(/];
    case "java":
    case "csharp":
      return [/(public|private|protected|internal|static|final|virtual|override|async|\s)+[\w<>\[\],]+\s+\w+\s*\([^;{]*\)\s*\{?/];
    case "c":
    case "cpp":
      return [/^[\w:<>*&,\s]+\s+\w+\s*\([^;{]*\)\s*\{?/];
    default: // javascript / typescript
      return [
        /\bfunction\s*\*?\s*\w*\s*\(/,
        /\b\w+\s*=\s*(async\s+)?\([^)]*\)\s*=>/,
        /\b\w+\s*=\s*(async\s+)?function\b/,
        /^\s*(public\s+|private\s+|protected\s+|static\s+|async\s+|get\s+|set\s+)*\w+\s*\([^)]*\)\s*\{/,
      ];
  }
}

function firstIdentifier(line: string): string {
  const m = line.trim().match(/[A-Za-z_$][\w$]*/);
  return m ? m[0] : "";
}

/** Length (in lines) of a brace-delimited block that begins at/after `start`. */
function braceBlockLength(cleanLines: string[], start: number): number {
  let depth = 0;
  let started = false;
  for (let i = start; i < cleanLines.length; i++) {
    for (const ch of cleanLines[i]) {
      if (ch === "{") {
        depth++;
        started = true;
      } else if (ch === "}") {
        depth--;
        if (started && depth <= 0) return i - start + 1;
      }
    }
  }
  return cleanLines.length - start;
}

/** Length (in lines) of an indentation-delimited Python/Ruby block. */
function indentBlockLength(pre: Preprocessed, start: number): number {
  const headerIndent = leadingWidth(pre.cleanLines[start]);
  let end = start;
  for (let i = start + 1; i < pre.cleanLines.length; i++) {
    if (pre.lineKinds[i] !== "code") continue;
    if (leadingWidth(pre.cleanLines[i]) <= headerIndent) break;
    end = i;
  }
  return end - start + 1;
}

function leadingWidth(line: string): number {
  const m = line.match(/^[ \t]*/);
  return m ? m[0].replace(/\t/g, "    ").length : 0;
}

export interface FunctionBlock {
  name: string;
  start: number; // 0-based line index of the header
  length: number; // number of lines in the function body (inclusive)
}

function extractFunctionName(line: string): string {
  let m = line.match(/(?:function|def|fn|func)\s+\*?\s*([A-Za-z_$][\w$]*)/);
  if (m) return m[1];
  m = line.match(/([A-Za-z_$][\w$]*)\s*=\s*(?:async\s+)?(?:\(|function)/);
  if (m) return m[1];
  m = line.match(/([A-Za-z_$][\w$]*)\s*\(/);
  if (m && !CONTROL_KEYWORDS.has(m[1])) return m[1];
  return "";
}

/** Locate every function/method with its source range - shared by metrics and rules. */
export function getFunctionBlocks(pre: Preprocessed): FunctionBlock[] {
  const regexes = functionHeaderRegexes(pre.language);
  const usesIndent = pre.family === "python" || pre.family === "ruby";
  const blocks: FunctionBlock[] = [];
  for (let i = 0; i < pre.cleanLines.length; i++) {
    if (pre.lineKinds[i] !== "code") continue;
    const line = pre.cleanLines[i];
    if (CONTROL_KEYWORDS.has(firstIdentifier(line))) continue;
    if (regexes.some((re) => re.test(line))) {
      const length = usesIndent ? indentBlockLength(pre, i) : braceBlockLength(pre.cleanLines, i);
      blocks.push({ name: extractFunctionName(line), start: i, length });
    }
  }
  return blocks;
}

function functionSizes(pre: Preprocessed): number[] {
  return getFunctionBlocks(pre).map((b) => b.length);
}

/**
 * Simplified Maintainability Index (0..100, higher = healthier).
 * Based on the classic MI formula, with Halstead Volume approximated from code
 * size (we intentionally avoid a full token/operator count to stay lightweight):
 *   MI = 171 − 5.2·ln(V) − 0.23·G − 16.2·ln(LOC),  normalised to 0..100.
 * A small bonus rewards a healthy comment ratio.
 */
function maintainabilityIndex(codeLines: number, cyclomatic: number, commentRatio: number): number {
  const loc = Math.max(1, codeLines);
  const volume = loc * 4.2; // documented proxy for Halstead Volume
  let mi = 171 - 5.2 * Math.log(volume) - 0.23 * cyclomatic - 16.2 * Math.log(loc);
  mi = (mi * 100) / 171;
  mi += Math.min(12, commentRatio * 50); // comments help maintainability, capped
  return Math.max(0, Math.min(100, Math.round(mi)));
}

export function computeComplexityMetrics(pre: Preprocessed, size: SizeMetrics): ComplexityMetric {
  const cyclomatic = cyclomaticComplexity(pre);
  const sizes = functionSizes(pre);
  const functionCount = sizes.length;
  const longestFunctionLines = sizes.length ? Math.max(...sizes) : size.codeLines;
  const averageFunctionLines = sizes.length
    ? Math.round(sizes.reduce((a, b) => a + b, 0) / sizes.length)
    : size.codeLines;

  return {
    cyclomatic,
    maxNestingDepth: pre.maxBlockDepth,
    maxLoopNesting: pre.maxLoopNesting,
    functionCount,
    longestFunctionLines,
    averageFunctionLines,
    maintainabilityIndex: maintainabilityIndex(size.codeLines, cyclomatic, size.commentRatio),
  };
}
