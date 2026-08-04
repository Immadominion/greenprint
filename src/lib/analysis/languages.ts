/**
 * Greenprint · Language detection
 * -------------------------------
 * We support a spread of popular languages. Detection is two-stage:
 *   1. Trust the file extension when we have a filename.
 *   2. Otherwise sniff the source with cheap, high-signal heuristics.
 * The engine still produces useful output for "unknown" — it just skips the
 * language-specific rules.
 */
import type { Language } from "./types";

const EXTENSION_MAP: Record<string, Language> = {
  js: "javascript",
  jsx: "javascript",
  mjs: "javascript",
  cjs: "javascript",
  ts: "typescript",
  tsx: "typescript",
  mts: "typescript",
  cts: "typescript",
  py: "python",
  pyw: "python",
  java: "java",
  cpp: "cpp",
  cc: "cpp",
  cxx: "cpp",
  hpp: "cpp",
  hh: "cpp",
  c: "c",
  h: "c",
  cs: "csharp",
  go: "go",
  rb: "ruby",
  php: "php",
  rs: "rust",
  sql: "sql",
};

export const LANGUAGE_LABELS: Record<Language, string> = {
  javascript: "JavaScript",
  typescript: "TypeScript",
  python: "Python",
  java: "Java",
  cpp: "C++",
  c: "C",
  csharp: "C#",
  go: "Go",
  ruby: "Ruby",
  php: "PHP",
  rust: "Rust",
  sql: "SQL",
  unknown: "Plain text",
};

/** Languages the editor + rules give first-class support to (used for the UI picker). */
export const SUPPORTED_LANGUAGES: Language[] = [
  "javascript",
  "typescript",
  "python",
  "java",
  "cpp",
  "c",
  "csharp",
  "go",
  "ruby",
  "php",
  "rust",
  "sql",
];

function fromExtension(filename?: string): Language | null {
  if (!filename) return null;
  const dot = filename.lastIndexOf(".");
  if (dot < 0) return null;
  const ext = filename.slice(dot + 1).toLowerCase();
  return EXTENSION_MAP[ext] ?? null;
}

/** Very cheap content sniffing — first match wins, ordered by signal strength. */
function fromContent(code: string): Language {
  const c = code;
  if (/^\s*<\?php/.test(c)) return "php";
  if (/#include\s*[<"]/.test(c)) return /\b(std::|cout|template<|class\s+\w+)/.test(c) ? "cpp" : "c";
  if (/\bpackage\s+main\b|\bfunc\s+\w+\s*\(|:=/.test(c)) return "go";
  if (/\bfn\s+\w+\s*\(|\blet\s+mut\b|println!/.test(c)) return "rust";
  if (/\b(public|private|protected)\s+(static\s+)?(class|void|int|String)\b|System\.out\./.test(c)) return "java";
  if (/\busing\s+System\b|Console\.(Write|Read)|\bnamespace\s+\w+/.test(c)) return "csharp";
  if (/\bdef\s+\w+\s*\(|^\s*import\s+\w+|:\s*$|print\(/m.test(c) && !/[;{]/.test(c)) return "python";
  if (/\bdef\s+\w+|\bputs\b|\bend\b\s*$/m.test(c)) return "ruby";
  if (/\b(SELECT|INSERT|UPDATE|DELETE|CREATE\s+TABLE)\b/i.test(c) && !/\bfunction\b/.test(c)) return "sql";
  if (/\binterface\s+\w+|\btype\s+\w+\s*=|:\s*(string|number|boolean)\b/.test(c)) return "typescript";
  if (/\bfunction\b|=>|\bconst\b|\blet\b|console\.(log|error)/.test(c)) return "javascript";
  return "unknown";
}

export function detectLanguage(code: string, filename?: string): Language {
  return fromExtension(filename) ?? fromContent(code);
}
