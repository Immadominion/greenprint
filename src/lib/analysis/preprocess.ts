/**
 * Greenprint · Source pre-processing
 * ----------------------------------
 * Regex-based rules are fragile if they run over raw source: a `for` inside a
 * string or comment would be a false positive. So before any rule runs we build
 * a "clean" copy of the code where every comment and string literal is replaced
 * by blanks (spaces) — line count, indentation and braces are preserved, but the
 * distracting content is gone.
 *
 * We also compute, once, two structural signals every downstream rule reuses:
 *   • blockDepth[i]    — how deeply nested line i is (braces or indentation)
 *   • loopDepthAt[i]   — how many loops enclose line i (0 = not in a loop)
 * This is what lets us reliably flag O(n²) nested loops and "work inside a loop".
 */
import type { Language } from "./types";

type Family = "clike" | "python" | "ruby" | "sql";

interface LangTokens {
  family: Family;
  line: string[]; // line-comment starters
  block: [string, string][]; // block-comment start/end pairs
  strings: string[]; // single-line string delimiters
  template?: string; // multi-line template delimiter (JS backtick)
  triple?: string[]; // multi-line triple-quote delimiters (Python)
}

function familyOf(lang: Language): Family {
  if (lang === "python") return "python";
  if (lang === "ruby") return "ruby";
  if (lang === "sql") return "sql";
  return "clike";
}

function tokensFor(lang: Language): LangTokens {
  const family = familyOf(lang);
  if (family === "python")
    return { family, line: ["#"], block: [], strings: ['"', "'"], triple: ['"""', "'''"] };
  if (family === "ruby")
    return { family, line: ["#"], block: [], strings: ['"', "'"] };
  if (family === "sql")
    return { family, line: ["--"], block: [["/*", "*/"]], strings: ["'"] };
  // c-like family
  const template = lang === "javascript" || lang === "typescript" ? "`" : undefined;
  const line = lang === "php" ? ["//", "#"] : ["//"];
  return { family, line, block: [["/*", "*/"]], strings: ['"', "'"], template };
}

function startsWith(s: string, i: number, tok: string): boolean {
  return s.startsWith(tok, i);
}

export interface Preprocessed {
  language: Language;
  family: Family;
  rawLines: string[];
  cleanLines: string[];
  lineKinds: ("blank" | "comment" | "code")[];
  blockDepth: number[]; // enclosing block depth per line
  loopDepthAt: number[]; // enclosing loop count per line
  loopHeaderLines: number[]; // 0-based indices of loop headers
  nestedLoopLines: number[]; // 0-based indices of loops that sit inside another loop
  maxBlockDepth: number;
  maxLoopNesting: number;
}

/** Char-level state machine that blanks comments & strings. */
function stripCommentsAndStrings(code: string, t: LangTokens) {
  const n = code.length;
  const cleanChars: string[] = new Array(n);
  // kind: 'c' code, 's' string, 'm' comment, ' ' whitespace/other
  const kinds: string[] = new Array(n);

  type Mode = "normal" | "line" | "block" | "string" | "template" | "triple";
  let mode: Mode = "normal";
  let endTok = "";
  let strDelim = "";
  let escaped = false;

  for (let i = 0; i < n; i++) {
    const ch = code[i];
    if (mode === "normal") {
      if (ch === "\n") {
        cleanChars[i] = ch;
        kinds[i] = " ";
        continue;
      }
      // block comments
      let matched = false;
      for (const [open, close] of t.block) {
        if (startsWith(code, i, open)) {
          mode = "block";
          endTok = close;
          for (let k = 0; k < open.length; k++) {
            cleanChars[i + k] = " ";
            kinds[i + k] = "m";
          }
          i += open.length - 1;
          matched = true;
          break;
        }
      }
      if (matched) continue;
      // line comments
      for (const lc of t.line) {
        if (startsWith(code, i, lc)) {
          mode = "line";
          matched = true;
          cleanChars[i] = " ";
          kinds[i] = "m";
          break;
        }
      }
      if (matched) continue;
      // triple-quote strings (python)
      if (t.triple) {
        for (const tq of t.triple) {
          if (startsWith(code, i, tq)) {
            mode = "triple";
            endTok = tq;
            for (let k = 0; k < tq.length; k++) {
              cleanChars[i + k] = " ";
              kinds[i + k] = "s";
            }
            i += tq.length - 1;
            matched = true;
            break;
          }
        }
      }
      if (matched) continue;
      // template literal (JS backtick)
      if (t.template && ch === t.template) {
        mode = "template";
        cleanChars[i] = " ";
        kinds[i] = "s";
        continue;
      }
      // normal strings
      if (t.strings.includes(ch)) {
        mode = "string";
        strDelim = ch;
        escaped = false;
        cleanChars[i] = " ";
        kinds[i] = "s";
        continue;
      }
      // plain character
      cleanChars[i] = ch;
      kinds[i] = /\s/.test(ch) ? " " : "c";
    } else if (mode === "line") {
      cleanChars[i] = ch === "\n" ? "\n" : " ";
      kinds[i] = ch === "\n" ? " " : "m";
      if (ch === "\n") mode = "normal";
    } else if (mode === "block") {
      if (startsWith(code, i, endTok)) {
        for (let k = 0; k < endTok.length; k++) {
          cleanChars[i + k] = " ";
          kinds[i + k] = "m";
        }
        i += endTok.length - 1;
        mode = "normal";
      } else {
        cleanChars[i] = ch === "\n" ? "\n" : " ";
        kinds[i] = ch === "\n" ? " " : "m";
      }
    } else if (mode === "triple") {
      if (startsWith(code, i, endTok)) {
        for (let k = 0; k < endTok.length; k++) {
          cleanChars[i + k] = " ";
          kinds[i + k] = "s";
        }
        i += endTok.length - 1;
        mode = "normal";
      } else {
        cleanChars[i] = ch === "\n" ? "\n" : " ";
        kinds[i] = ch === "\n" ? " " : "s";
      }
    } else if (mode === "template") {
      if (ch === "\\" && !escaped) {
        escaped = true;
        cleanChars[i] = " ";
        kinds[i] = "s";
        continue;
      }
      if (t.template && ch === t.template && !escaped) {
        mode = "normal";
      }
      cleanChars[i] = ch === "\n" ? "\n" : " ";
      kinds[i] = ch === "\n" ? " " : "s";
      escaped = false;
    } else {
      // string
      if (ch === "\\" && !escaped) {
        escaped = true;
        cleanChars[i] = " ";
        kinds[i] = "s";
        continue;
      }
      if (ch === "\n") {
        // unterminated single-line string — recover at newline
        cleanChars[i] = "\n";
        kinds[i] = " ";
        mode = "normal";
        escaped = false;
        continue;
      }
      if (ch === strDelim && !escaped) {
        mode = "normal";
      }
      cleanChars[i] = " ";
      kinds[i] = "s";
      escaped = false;
    }
  }
  // Keep newlines aligned between `clean` and `kinds` so line-splitting matches.
  for (let i = 0; i < n; i++) {
    if (cleanChars[i] === "\n") kinds[i] = "\n";
  }
  return { clean: cleanChars.join(""), kinds: kinds.join("") };
}

function lineKindsFromChars(rawLines: string[], clean: string, kinds: string): ("blank" | "comment" | "code")[] {
  const cleanLines = clean.split("\n");
  const kindLines = kinds.split("\n");
  return rawLines.map((raw, idx) => {
    if (raw.trim() === "") return "blank";
    const kl = kindLines[idx] ?? "";
    const sawCode = kl.includes("c");
    const sawComment = kl.includes("m");
    const sawString = kl.includes("s");
    if (sawCode || sawString) return "code";
    if (sawComment) return "comment";
    return "blank";
  });
}

/** Convert Python/Ruby indentation into consistent integer block levels. */
function indentDepths(cleanLines: string[], lineKinds: ("blank" | "comment" | "code")[]): number[] {
  const depths = new Array(cleanLines.length).fill(0);
  const indentStack: number[] = [0];
  let current = 0;
  for (let i = 0; i < cleanLines.length; i++) {
    if (lineKinds[i] !== "code") {
      depths[i] = current;
      continue;
    }
    const match = cleanLines[i].match(/^[ \t]*/);
    const indent = match ? match[0].replace(/\t/g, "    ").length : 0;
    const top = indentStack[indentStack.length - 1];
    if (indent > top) {
      indentStack.push(indent);
    } else if (indent < top) {
      while (indentStack.length > 1 && indent < indentStack[indentStack.length - 1]) {
        indentStack.pop();
      }
    }
    current = indentStack.length - 1;
    depths[i] = current;
  }
  return depths;
}

/** Running brace depth for c-like / SQL languages. */
function braceDepths(cleanLines: string[]): number[] {
  const depths = new Array(cleanLines.length).fill(0);
  let current = 0;
  for (let i = 0; i < cleanLines.length; i++) {
    depths[i] = current; // depth BEFORE this line's own braces
    for (const ch of cleanLines[i]) {
      if (ch === "{") current++;
      else if (ch === "}") current = Math.max(0, current - 1);
    }
  }
  return depths;
}

function isLoopHeader(cleanLine: string, family: Family): boolean {
  const l = cleanLine;
  if (family === "python") return /^\s*(for|while)\b/.test(l);
  if (family === "ruby")
    return /^\s*(for|while|loop)\b/.test(l) || /\.\s*(each|times|map|select)\b.*\bdo\b|\.\s*(each|times)\b/.test(l);
  // c-like / sql
  return /(^|[^\w.])(for|while|foreach)\s*\(/.test(l);
}

export function preprocess(code: string, language: Language): Preprocessed {
  const t = tokensFor(language);
  const rawLines = code.split("\n");
  const { clean, kinds } = stripCommentsAndStrings(code, t);
  const cleanLines = clean.split("\n");
  // guard: keep array lengths aligned with rawLines
  while (cleanLines.length < rawLines.length) cleanLines.push("");
  const lineKinds = lineKindsFromChars(rawLines, clean, kinds);

  const blockDepth =
    t.family === "python" || t.family === "ruby"
      ? indentDepths(cleanLines, lineKinds)
      : braceDepths(cleanLines);

  // ---- loop context (the stack algorithm described in the file header) ----
  const loopDepthAt = new Array(rawLines.length).fill(0);
  const loopHeaderLines: number[] = [];
  const nestedLoopLines: number[] = [];
  const loopStack: number[] = [];
  let maxLoopNesting = 0;

  for (let i = 0; i < cleanLines.length; i++) {
    if (lineKinds[i] === "blank" || lineKinds[i] === "comment") {
      loopDepthAt[i] = loopStack.length;
      continue;
    }
    const d = blockDepth[i];
    while (loopStack.length && loopStack[loopStack.length - 1] >= d) loopStack.pop();
    loopDepthAt[i] = loopStack.length;
    if (isLoopHeader(cleanLines[i], t.family)) {
      if (loopStack.length > 0) nestedLoopLines.push(i);
      loopHeaderLines.push(i);
      loopStack.push(d);
      maxLoopNesting = Math.max(maxLoopNesting, loopStack.length);
    }
  }

  return {
    language,
    family: t.family,
    rawLines,
    cleanLines,
    lineKinds,
    blockDepth,
    loopDepthAt,
    loopHeaderLines,
    nestedLoopLines,
    maxBlockDepth: blockDepth.length ? Math.max(...blockDepth) : 0,
    maxLoopNesting,
  };
}
