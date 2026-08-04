"use client";

import { useMemo } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";
import { EditorView } from "@codemirror/view";
import type { Extension } from "@codemirror/state";
import { useTheme } from "next-themes";
import type { Language } from "@/lib/analysis";

function languageExtension(language: Language): Extension[] {
  switch (language) {
    case "javascript":
      return [javascript({ jsx: true })];
    case "typescript":
      return [javascript({ jsx: true, typescript: true })];
    case "python":
      return [python()];
    case "java":
      return [java()];
    case "c":
    case "cpp":
      return [cpp()];
    default:
      return [];
  }
}

const baseTheme = EditorView.theme({
  "&": { backgroundColor: "transparent", fontSize: "13px" },
  ".cm-gutters": { backgroundColor: "transparent", border: "none", color: "var(--muted-foreground)" },
  ".cm-content": { fontFamily: "var(--font-mono-code), ui-monospace, monospace", padding: "12px 0" },
  ".cm-activeLine": { backgroundColor: "color-mix(in oklch, var(--muted) 40%, transparent)" },
  ".cm-activeLineGutter": { backgroundColor: "transparent" },
  "&.cm-focused": { outline: "none" },
  ".cm-scroller": { fontFamily: "var(--font-mono-code), ui-monospace, monospace" },
});

export function CodeEditor({
  value,
  onChange,
  language,
  height = "460px",
  editable = true,
}: {
  value: string;
  onChange?: (v: string) => void;
  language: Language;
  height?: string;
  editable?: boolean;
}) {
  const { resolvedTheme } = useTheme();
  const extensions = useMemo(() => [...languageExtension(language), baseTheme, EditorView.lineWrapping], [language]);

  return (
    <CodeMirror
      value={value}
      onChange={onChange}
      height={height}
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      extensions={extensions}
      editable={editable}
      basicSetup={{ foldGutter: false, highlightActiveLineGutter: true, lineNumbers: true }}
      className="overflow-hidden rounded-xl border border-border bg-card text-sm"
    />
  );
}
