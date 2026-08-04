/**
 * Greenprint · Rule engine
 * ------------------------
 * The catalogue of "green" and efficiency rules. Each rule looks for one
 * wasteful pattern and, when it fires, produces a {@link CodeIssue} that
 * explains — in plain English — what is wrong, WHY it costs energy, and the
 * greener alternative. This file is the source of truth for the in-app
 * "How detection works" reference page too (see {@link RULE_CATALOG}).
 *
 * Detection is heuristic (regex over pre-processed, comment/string-stripped
 * source, plus the loop-nesting context). Heuristics can occasionally miss or
 * over-fire; that is an accepted trade-off for a zero-dependency engine and is
 * documented for the defense.
 */
import type { CodeIssue, IssueCategory, Language, Severity } from "./types";
import { CO2_BASE } from "./types";
import type { Preprocessed } from "./preprocess";
import { getFunctionBlocks } from "./metrics";

/** Metadata describing a rule. Rendered on the reference page and in reports. */
export interface RuleMeta {
  id: string;
  title: string;
  category: IssueCategory;
  severity: Severity;
  impact: number; // 0..1 relative energy impact
  why: string;
  suggestion: string;
  betterExample?: string;
  languages: Language[] | "all";
}

type Detector = (pre: Preprocessed) => number[]; // returns 0-based matching line indices

interface Rule extends RuleMeta {
  detect: Detector;
}

// ---------------------------------------------------------------------------
// Small detection helpers
// ---------------------------------------------------------------------------

const insideLoop = (pre: Preprocessed, i: number) => pre.loopDepthAt[i] > 0;

/** Scan every code line and keep the ones the predicate accepts. */
function scan(pre: Preprocessed, test: (line: string, i: number) => boolean): number[] {
  const out: number[] = [];
  for (let i = 0; i < pre.cleanLines.length; i++) {
    if (pre.lineKinds[i] !== "code") continue;
    if (test(pre.cleanLines[i], i)) out.push(i);
  }
  return out;
}

/** Language-specific print / logging call. */
function printRegex(lang: Language): RegExp {
  switch (lang) {
    case "python": return /\bprint\s*\(/;
    case "java": return /System\.out\.(print|println)|\.printf\s*\(/;
    case "csharp": return /Console\.(Write|WriteLine)\s*\(/;
    case "cpp": return /\b(cout\s*<<|printf\s*\()/;
    case "c": return /\bprintf\s*\(/;
    case "go": return /\bfmt\.(Print|Println|Printf)\s*\(/;
    case "php": return /\b(echo|print_r|var_dump)\b/;
    case "ruby": return /\b(puts|print)\b/;
    case "rust": return /\bprintln!\s*\(/;
    default: return /\bconsole\.(log|debug|info|warn|error)\s*\(/;
  }
}

const DB_CALL =
  /(\.(query|execute|exec|findOne|findMany|find|aggregate|save|insert|insertOne|update|updateOne|delete|deleteOne)\s*\()|(\b(SELECT|INSERT\s+INTO|UPDATE|DELETE\s+FROM)\b)/i;
const NETWORK_CALL =
  /\b(fetch|axios|requests\.(get|post|put|delete|patch)|urllib\.request|http\.(get|post)|HttpClient|XMLHttpRequest|\$\.ajax)\b/;

// ---------------------------------------------------------------------------
// The rule catalogue (generic, regex-driven rules)
// ---------------------------------------------------------------------------

const RULES: Rule[] = [
  {
    id: "db-query-in-loop",
    title: "Database call inside a loop (N+1)",
    category: "database",
    severity: "critical",
    impact: 0.95,
    why: "Running a query once per iteration turns one round-trip into N. Each query has fixed network, parsing and connection overhead, so this dominates runtime and energy at scale.",
    suggestion: "Fetch everything in a single batched query before the loop (e.g. a JOIN or WHERE id IN (...)), then work in memory.",
    betterExample: "const users = await db.query('SELECT * FROM users WHERE id IN (?)', [ids]);\nfor (const u of users) { /* ... */ }",
    languages: "all",
    detect: (pre) => scan(pre, (l, i) => insideLoop(pre, i) && DB_CALL.test(l)),
  },
  {
    id: "network-in-loop",
    title: "Network request inside a loop",
    category: "resource",
    severity: "high",
    impact: 0.85,
    why: "Sequential network calls stack their latency and keep the CPU and radio awake far longer than necessary — one of the biggest real-world energy costs in an app.",
    suggestion: "Batch the requests, paginate, or fire them together with Promise.all / async gather so they overlap.",
    betterExample: "const results = await Promise.all(ids.map((id) => fetch(`/api/item/${id}`)));",
    languages: "all",
    detect: (pre) => scan(pre, (l, i) => insideLoop(pre, i) && NETWORK_CALL.test(l)),
  },
  {
    id: "string-concat-in-loop",
    title: "String built by concatenation in a loop",
    category: "resource",
    severity: "medium",
    impact: 0.6,
    why: "Strings are immutable in most languages, so `s += x` allocates a brand-new string every iteration — O(n²) memory traffic and lots of garbage-collection work.",
    suggestion: "Push pieces into a list/array and join once at the end (or use a StringBuilder / bytes buffer).",
    betterExample: "const parts = [];\nfor (…) parts.push(piece);\nconst result = parts.join('');",
    languages: "all",
    detect: (pre) =>
      scan(pre, (l, i) => insideLoop(pre, i) && (/\w+\s*\+=\s*[^;]*["'`]/.test(l) || /\w+\s*=\s*\w+\s*\+\s*[^;]*["'`]/.test(l))),
  },
  {
    id: "print-in-loop",
    title: "Logging / printing inside a loop",
    category: "energy",
    severity: "low",
    impact: 0.35,
    why: "Console and stdout writes are synchronous and flush on every call. In a hot loop they can cost more than the actual work and stall the whole program.",
    suggestion: "Collect output and log once after the loop, or remove debug prints from production paths.",
    languages: "all",
    detect: (pre) => {
      const re = printRegex(pre.language);
      return scan(pre, (l, i) => insideLoop(pre, i) && re.test(l));
    },
  },
  {
    id: "select-star",
    title: "SELECT * fetches unused columns",
    category: "database",
    severity: "medium",
    impact: 0.45,
    why: "`SELECT *` pulls every column over the wire and into memory even when you need two of them — wasted I/O, bandwidth and energy on every query.",
    suggestion: "List only the columns you actually use.",
    betterExample: "SELECT id, name FROM users WHERE active = true;",
    languages: "all",
    // Scans RAW lines: SQL usually lives inside string literals (stripped from clean lines).
    detect: (pre) => {
      const out: number[] = [];
      pre.rawLines.forEach((l, i) => {
        if (/\bSELECT\s+\*/i.test(l)) out.push(i);
      });
      return out;
    },
  },
  {
    id: "regex-compile-in-loop",
    title: "Regex compiled inside a loop",
    category: "resource",
    severity: "medium",
    impact: 0.5,
    why: "Compiling a regular expression is expensive. Doing it every iteration throws away that work each time instead of reusing the compiled pattern.",
    suggestion: "Compile the pattern once, outside the loop, and reuse it.",
    languages: "all",
    detect: (pre) => scan(pre, (l, i) => insideLoop(pre, i) && /\b(re\.compile|new RegExp|Pattern\.compile|regexp\.MustCompile)\s*\(/.test(l)),
  },
  {
    id: "json-in-loop",
    title: "JSON parse/stringify inside a loop",
    category: "resource",
    severity: "low",
    impact: 0.4,
    why: "Serialising or parsing JSON walks the whole object graph. Repeating it each iteration multiplies allocation and CPU work.",
    suggestion: "Move the parse/serialise out of the loop, or transform the data in one pass.",
    languages: "all",
    detect: (pre) => scan(pre, (l, i) => insideLoop(pre, i) && /\b(JSON\.(parse|stringify)|json\.(loads|dumps))\s*\(/.test(l)),
  },
  {
    id: "dom-query-in-loop",
    title: "DOM query inside a loop",
    category: "resource",
    severity: "medium",
    impact: 0.55,
    why: "Each DOM query can force the browser to recalculate layout. Querying repeatedly inside a loop causes layout thrashing that drains battery and jank.",
    suggestion: "Query the element once before the loop and reuse the reference; batch DOM writes.",
    languages: ["javascript", "typescript"],
    detect: (pre) => scan(pre, (l, i) => insideLoop(pre, i) && /\bdocument\.(querySelector|querySelectorAll|getElementById|getElementsBy\w+)\s*\(/.test(l)),
  },
  {
    id: "membership-in-list",
    title: "Membership test against a list",
    category: "algorithmic",
    severity: "medium",
    impact: 0.5,
    why: "`x in a_list` scans the whole list — O(n). Inside a loop that becomes O(n²). A set (hash) answers the same question in O(1).",
    suggestion: "Convert the list to a set once, then test membership against the set.",
    betterExample: "seen = set(items)\nfor x in data:\n    if x in seen:  # O(1)\n        ...",
    languages: ["python"],
    detect: (pre) => scan(pre, (l, i) => insideLoop(pre, i) && /^\s*(if|while|elif)\b.*\bin\s+\w+/.test(l) && !/^\s*for\b/.test(l)),
  },
  {
    id: "front-insertion",
    title: "Inserting at the front of a list/array",
    category: "algorithmic",
    severity: "medium",
    impact: 0.5,
    why: "Inserting at index 0 shifts every existing element one place — O(n) each time. In a loop that is quadratic.",
    suggestion: "Append to the end (O(1)) and reverse once, or use a deque/linked structure built for front inserts.",
    languages: "all",
    detect: (pre) => scan(pre, (l) => /\.(unshift|insert)\s*\(\s*0\s*,|\.insert\s*\(\s*0\s*,|\.unshift\s*\(/.test(l)),
  },
  {
    id: "read-entire-file",
    title: "Reading an entire file into memory",
    category: "resource",
    severity: "medium",
    impact: 0.55,
    why: "Loading a whole file at once holds all of it in RAM. For large files this spikes memory and can trigger swapping — expensive in time and energy.",
    suggestion: "Stream the file or iterate it line by line so only a small window is in memory at a time.",
    languages: "all",
    detect: (pre) => scan(pre, (l) => /\b(readFileSync|ReadAllText|ReadAllBytes|readAllBytes|ioutil\.ReadFile|os\.ReadFile|\.readlines\s*\(\s*\)|open\s*\([^)]*\)\s*\.\s*read\s*\(\s*\))/.test(l)),
  },
  {
    id: "blocking-sleep",
    title: "Blocking sleep",
    category: "energy",
    severity: "medium",
    impact: 0.45,
    why: "A synchronous sleep pins a thread doing nothing. The core cannot be parked or reused, so it keeps drawing power for no work.",
    suggestion: "Use asynchronous scheduling (await, timers, callbacks) so the runtime can do other work or idle the core.",
    languages: "all",
    detect: (pre) => scan(pre, (l) => /\b(time\.sleep|Thread\.sleep|Task\.Delay|this_thread::sleep|usleep|Sleep)\s*\(/.test(l)),
  },
  {
    id: "infinite-loop",
    title: "Unbounded loop",
    category: "energy",
    severity: "low",
    impact: 0.4,
    why: "A `while(true)` with no yield can spin the CPU at 100% and never let the core rest — a classic battery killer.",
    suggestion: "Add a clear exit condition, and await / sleep briefly each iteration so the core can idle.",
    languages: "all",
    detect: (pre) => scan(pre, (l) => /\bwhile\s*\(\s*(true|1)\s*\)|while\s+True\s*:/.test(l)),
  },
  {
    id: "import-all",
    title: "Importing an entire library",
    category: "resource",
    severity: "low",
    impact: 0.3,
    why: "Wildcard/whole-library imports pull in code you never call. The bundle ships bigger, so every user downloads, parses and runs more — repeated energy cost across all devices.",
    suggestion: "Import only the specific functions you use so tree-shaking can drop the rest.",
    betterExample: "import { debounce } from 'lodash-es';",
    languages: "all",
    detect: (pre) => scan(pre, (l) => /^\s*from\s+\S+\s+import\s+\*|^\s*import\s+\*\s+as\s+\w+\s+from|require\(\s*['"]lodash['"]\s*\)|from\s+['"]lodash['"]/.test(l)),
  },
  {
    id: "loose-equality",
    title: "Loose equality (==)",
    category: "quality",
    severity: "low",
    impact: 0.15,
    why: "Loose equality triggers type coercion, which is slower and a frequent source of bugs.",
    suggestion: "Use strict equality (=== / !==).",
    languages: ["javascript", "typescript", "php"],
    detect: (pre) => scan(pre, (l) => /[^=!<>]==[^=]/.test(l) || /![^=]=[^=]/.test(l)),
  },
  {
    id: "var-keyword",
    title: "Legacy `var` declaration",
    category: "quality",
    severity: "low",
    impact: 0.1,
    why: "`var` is function-scoped and hoisted, which leads to subtle bugs; modern engines optimise block-scoped bindings better.",
    suggestion: "Use `const` by default and `let` when you must reassign.",
    languages: ["javascript", "typescript"],
    detect: (pre) => scan(pre, (l) => /(^|[^.\w])var\s+\w+/.test(l)),
  },
  {
    id: "todo-marker",
    title: "Unfinished work marker",
    category: "quality",
    severity: "info",
    impact: 0.05,
    why: "TODO/FIXME/HACK markers flag incomplete or fragile code that may hide inefficiencies.",
    suggestion: "Resolve the marker or track it in your issue tracker before shipping.",
    languages: "all",
    // NB: scans RAW lines because markers live in comments (stripped from clean lines).
    detect: (pre) => {
      const out: number[] = [];
      pre.rawLines.forEach((l, i) => {
        if (/\b(TODO|FIXME|HACK|XXX)\b/.test(l)) out.push(i);
      });
      return out;
    },
  },
];

/** Public metadata list for the reference/documentation page and reports. */
export const RULE_CATALOG: RuleMeta[] = RULES.map(({ detect, ...meta }) => meta).concat([
  {
    id: "nested-loops",
    title: "Nested loops (quadratic or worse)",
    category: "algorithmic",
    severity: "high",
    impact: 0.9,
    why: "A loop inside a loop multiplies the work: two levels is O(n²), three is O(n³). This is the single most common cause of code that is fast on small inputs and unusably slow (and power-hungry) on large ones.",
    suggestion: "Replace the inner scan with a hash map/set lookup, pre-compute a grouping, or use a smarter algorithm (sort + two-pointer, etc.).",
    betterExample: "const index = new Map(b.map((x) => [x.id, x]));\nfor (const a of arr) { const match = index.get(a.id); }",
    languages: "all",
  },
  {
    id: "exponential-recursion",
    title: "Exponential recursion (missing memoization)",
    category: "algorithmic",
    severity: "critical",
    impact: 0.98,
    why: "A function that calls itself two or more times on overlapping sub-problems (e.g. naive Fibonacci) recomputes the same values exponentially often — O(2ⁿ). This is astronomically wasteful of CPU and energy.",
    suggestion: "Cache results (memoization) or rewrite bottom-up with a loop so each sub-problem is solved once.",
    betterExample: "const memo = new Map();\nfunction fib(n){ if(n<2) return n; if(memo.has(n)) return memo.get(n);\n  const v = fib(n-1)+fib(n-2); memo.set(n,v); return v; }",
    languages: "all",
  },
  {
    id: "long-function",
    title: "Overly long function",
    category: "quality",
    severity: "medium",
    impact: 0.25,
    why: "Very long functions are hard to reason about, test and optimise; compilers and JITs also inline and optimise small functions more effectively.",
    suggestion: "Split the function into smaller, single-purpose helpers.",
    languages: "all",
  },
  {
    id: "deep-nesting",
    title: "Deeply nested control flow",
    category: "quality",
    severity: "medium",
    impact: 0.3,
    why: "Deep nesting hides the expensive paths and makes complexity hard to see. It usually signals work that could be flattened or short-circuited earlier.",
    suggestion: "Use early returns / guard clauses and extract inner blocks into named functions.",
    languages: "all",
  },
]);

// ---------------------------------------------------------------------------
// Special-cased rules (dynamic severity / need structural context)
// ---------------------------------------------------------------------------

function issue(meta: RuleMeta, pre: Preprocessed, idx: number, overrides?: Partial<CodeIssue>): CodeIssue {
  const severity = overrides?.severity ?? meta.severity;
  const impact = overrides?.impact ?? meta.impact;
  return {
    id: meta.id,
    ruleTitle: meta.title,
    category: meta.category,
    severity,
    line: idx + 1,
    snippet: pre.rawLines[idx]?.trim() ?? "",
    message: overrides?.message ?? meta.title,
    why: meta.why,
    suggestion: meta.suggestion,
    betterExample: meta.betterExample,
    impact,
    co2SavingGrams: Math.round(impact * CO2_BASE[severity] * 1000) / 1000,
  };
}

function metaById(id: string): RuleMeta {
  const m = RULE_CATALOG.find((r) => r.id === id);
  if (!m) throw new Error(`Unknown rule ${id}`);
  return m;
}

function detectNestedLoops(pre: Preprocessed): CodeIssue[] {
  const meta = metaById("nested-loops");
  return pre.nestedLoopLines.map((idx) => {
    const level = pre.loopDepthAt[idx] + 1; // this loop's own nesting level
    const severity: Severity = level >= 3 ? "critical" : "high";
    const bigO = level >= 3 ? "O(n³) or worse" : "O(n²)";
    return issue(meta, pre, idx, {
      severity,
      impact: Math.min(1, 0.75 + level * 0.08),
      message: `Loop nested ${level} levels deep — roughly ${bigO} work.`,
    });
  });
}

function detectExponentialRecursion(pre: Preprocessed): CodeIssue[] {
  const meta = metaById("exponential-recursion");
  const out: CodeIssue[] = [];
  for (const block of getFunctionBlocks(pre)) {
    if (!block.name) continue;
    const body = pre.cleanLines.slice(block.start, block.start + block.length).join("\n");
    const calls = body.match(new RegExp(`\\b${block.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\(`, "g"));
    // header itself contains one occurrence, so 3+ total means 2+ recursive calls
    if (calls && calls.length >= 3) {
      out.push(issue(meta, pre, block.start, { message: `\`${block.name}\` calls itself multiple times — exponential blow-up.` }));
    }
  }
  return out;
}

function detectLongFunctions(pre: Preprocessed): CodeIssue[] {
  const meta = metaById("long-function");
  const out: CodeIssue[] = [];
  for (const block of getFunctionBlocks(pre)) {
    if (block.length > 60) {
      out.push(issue(meta, pre, block.start, {
        severity: block.length > 120 ? "high" : "medium",
        message: `Function ${block.name ? `\`${block.name}\` ` : ""}is ${block.length} lines long.`,
      }));
    }
  }
  return out;
}

function detectDeepNesting(pre: Preprocessed): CodeIssue[] {
  const meta = metaById("deep-nesting");
  const threshold = pre.family === "python" || pre.family === "ruby" ? 5 : 6;
  // Report only the first line that crosses the threshold to avoid noise.
  for (let i = 0; i < pre.blockDepth.length; i++) {
    if (pre.lineKinds[i] === "code" && pre.blockDepth[i] >= threshold) {
      return [issue(meta, pre, i, { message: `Control flow is nested ${pre.blockDepth[i]} levels deep here.` })];
    }
  }
  return [];
}

/** Run every rule and return a flat, de-duplicated list of issues. */
export function runRules(pre: Preprocessed): CodeIssue[] {
  const issues: CodeIssue[] = [];

  for (const rule of RULES) {
    if (rule.languages !== "all" && !rule.languages.includes(pre.language)) continue;
    for (const idx of rule.detect(pre)) issues.push(issue(rule, pre, idx));
  }

  issues.push(...detectNestedLoops(pre));
  issues.push(...detectExponentialRecursion(pre));
  issues.push(...detectLongFunctions(pre));
  issues.push(...detectDeepNesting(pre));

  // De-dupe: one issue per (rule id + line).
  const seen = new Set<string>();
  return issues.filter((it) => {
    const key = `${it.id}:${it.line}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
