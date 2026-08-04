"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

export function Markdown({ children }: { children: string }) {
  return (
    <div className="text-sm">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: (p) => <h1 className="mb-2 mt-4 font-display text-lg font-bold first:mt-0" {...p} />,
          h2: (p) => <h2 className="mb-1.5 mt-4 font-display text-base font-semibold first:mt-0" {...p} />,
          h3: (p) => <h3 className="mb-1 mt-3 font-display text-sm font-semibold first:mt-0" {...p} />,
          p: (p) => <p className="my-2 leading-relaxed text-foreground/90" {...p} />,
          ul: (p) => <ul className="my-2 list-disc space-y-1 pl-5" {...p} />,
          ol: (p) => <ol className="my-2 list-decimal space-y-1 pl-5" {...p} />,
          li: (p) => <li className="leading-relaxed text-foreground/90" {...p} />,
          a: (p) => <a className="font-medium text-brand hover:underline" {...p} />,
          strong: (p) => <strong className="font-semibold text-foreground" {...p} />,
          blockquote: (p) => (
            <blockquote className="my-2 border-l-2 border-brand/30 pl-3 text-muted-foreground italic" {...p} />
          ),
          pre: (p) => <pre className="my-2 overflow-x-auto rounded-lg bg-muted p-3 font-mono text-xs" {...p} />,
          code: ({ className, children, ...props }) => {
            const isBlock = /language-/.test(className ?? "");
            return isBlock ? (
              <code className={cn("font-mono", className)} {...props}>
                {children}
              </code>
            ) : (
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.8em]" {...props}>
                {children}
              </code>
            );
          },
          table: (p) => <table className="my-2 w-full border-collapse text-xs" {...p} />,
          th: (p) => <th className="border border-border bg-muted px-2 py-1 text-left font-semibold" {...p} />,
          td: (p) => <td className="border border-border px-2 py-1" {...p} />,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
