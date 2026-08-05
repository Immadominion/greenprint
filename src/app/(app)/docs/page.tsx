import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  Code2,
  Cpu,
  Database,
  Download,
  FileText,
  Gauge,
  Layers,
  Leaf,
  Lock,
  PenLine,
  Rocket,
  ScanSearch,
  Server,
  Sparkles,
  Terminal,
  Wand2,
  Zap,
} from "lucide-react";
import { COURSE } from "@/lib/team";
import { FadeIn, Stagger, StaggerItem } from "@/components/greenprint/motion";

export const metadata: Metadata = { title: "Docs" };

const REPO = "https://github.com/Immadominion/greenprint";
const LIVE = "https://greenprint-eta.vercel.app";

const LAYERS = [
  {
    icon: Layers,
    title: "The face",
    detail:
      "The website you see — landing page, dashboard, and the Analyze workspace. Built with Next.js (App Router) and React, mostly as fast Server Components.",
  },
  {
    icon: Cpu,
    title: "The brain",
    detail:
      "The analysis engine — pure, dependency-free TypeScript that reads your code and scores it. Runs 100% offline; this is the software-engineering core.",
  },
  {
    icon: Database,
    title: "The memory",
    detail:
      "A single SQLite file (local) or Turso (in production) that remembers accounts, past analyses, XP, badges, the leaderboard, and the AI cache.",
  },
];

const PIPELINE = [
  "Detect language",
  "Clean (strip comments & strings)",
  "Measure (size, complexity, nesting)",
  "Detect 21 inefficiency rules",
  "Estimate energy & CO₂ (modelled)",
  "Score → EcoScore 0–100",
  "Save + award XP & badges",
  "Show results + greener fixes",
];

const FEATURES = [
  { icon: Lock, title: "Secure authentication", detail: "Email + password via Better Auth — hashed passwords, session cookies, guarded routes." },
  { icon: FileText, title: "Code editor / upload", detail: "CodeMirror 6 editor, file upload with language auto-detect, and one-click examples." },
  { icon: Wand2, title: "AI code explanation", detail: "Explain this code — Claude Haiku 4.5 when a key is set, an offline demo otherwise." },
  { icon: PenLine, title: "AI documentation", detail: "Auto-document generates clean per-function documentation for the snippet." },
  { icon: Gauge, title: "Code quality analysis", detail: "Cyclomatic complexity, nesting depth, function length, and a maintainability index." },
  { icon: ScanSearch, title: "Inefficiency detection", detail: "A 21-rule catalogue: nested loops, N+1 queries, SELECT *, exponential recursion, and more." },
  { icon: Leaf, title: "Greener alternatives", detail: "Every detected issue ships a specific, energy-efficient fix with an example." },
  { icon: Sparkles, title: "Sustainability dashboard", detail: "EcoScore trend, CO₂ saved, and combined quality + green metrics with charts." },
  { icon: Download, title: "Exportable reports", detail: "Download any analysis as a professional PDF or a CSV spreadsheet." },
];

const GREEN = [
  { title: "Resource-intensive code detection", detail: "The engine flags the exact costly lines." },
  { title: "Algorithmic optimization advice", detail: "Every issue suggests a better approach — O(n²) toward O(n)." },
  { title: "Efficient AI caching", detail: "Identical code is fingerprinted; repeat AI requests are served from cache." },
  { title: "Optimized database access", detail: "List queries fetch only the columns they display — less data moved." },
  { title: "Lightweight architecture", detail: "The analysis engine has zero external dependencies and runs offline." },
  { title: "Execution-time & resource measurement", detail: "Real analysis timing plus a modelled runtime and energy estimate for your code." },
];

const STACK = [
  "Next.js 16", "React 19", "TypeScript", "Tailwind CSS v4", "shadcn/ui",
  "Better Auth", "Drizzle ORM", "libSQL / SQLite", "Turso", "Anthropic Claude",
  "Motion", "CodeMirror 6", "Recharts", "jsPDF",
];

const RESOURCES = [
  { icon: BookOpen, title: "How it works", detail: "The analysis methodology and the full rule catalogue, in the app.", href: "/rules", external: false },
  { icon: Code2, title: "Source code", detail: "The complete repository on GitHub.", href: REPO, external: true },
  { icon: Rocket, title: "Live demo", detail: "The deployed app on Vercel.", href: LIVE, external: true },
  { icon: FileText, title: "Defense guide", detail: "Plain-English guide — one part per team member.", href: `${REPO}/blob/main/docs/DEFENSE-GUIDE.md`, external: true },
  { icon: Server, title: "Architecture", detail: "How the system is put together (technical).", href: `${REPO}/blob/main/docs/ARCHITECTURE.md`, external: true },
  { icon: FileText, title: "Project brief", detail: "The original assignment + requirements traceability.", href: `${REPO}/blob/main/docs/PROJECT-BRIEF.md`, external: true },
];

function SectionTitle({ icon: Icon, children }: { icon: typeof Layers; children: ReactNode }) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <div className="grid size-8 place-items-center rounded-lg bg-brand-soft text-brand">
        <Icon className="size-[18px]" />
      </div>
      <h2 className="font-display text-lg font-bold tracking-tight">{children}</h2>
    </div>
  );
}

export default function DocsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-10">
      {/* Hero */}
      <FadeIn>
        <div className="rounded-2xl border border-border bg-gradient-to-br from-brand-soft/60 to-card p-6 shadow-soft sm:p-8">
          <div className="flex items-center gap-2 text-brand">
            <FileText className="size-5" />
            <span className="text-sm font-semibold">Documentation</span>
          </div>
          <h1 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">Greenprint, end to end</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            What Greenprint is, how it is built, how to run it, and where to read more. For the plain-English,
            per-member presentation notes, see the defense guide linked at the bottom.
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            {COURSE.code} · {COURSE.title} · {COURSE.group} · {COURSE.institution}
          </p>
        </div>
      </FadeIn>

      {/* What it is */}
      <section>
        <SectionTitle icon={Sparkles}>What Greenprint is</SectionTitle>
        <div className="rounded-2xl border border-border bg-card p-5 text-sm leading-relaxed text-muted-foreground shadow-soft">
          Most tools tell you whether your code <span className="font-medium text-foreground">works</span>. Greenprint
          tells you what it <span className="font-medium text-foreground">costs the planet</span>. Paste or upload a
          snippet and it instantly, and fully offline, gives it an <span className="font-medium text-eco-strong">EcoScore</span>{" "}
          out of 100, detects wasteful patterns, estimates the time, energy and CO₂ it would burn, and hands you a
          greener fix for every problem — then turns improving your code into a game with XP, badges and a team
          leaderboard.
        </div>
      </section>

      {/* Architecture */}
      <section>
        <SectionTitle icon={Layers}>Architecture — three layers</SectionTitle>
        <Stagger className="grid gap-3 sm:grid-cols-3">
          {LAYERS.map((l) => (
            <StaggerItem key={l.title}>
              <div className="h-full rounded-2xl border border-border bg-card p-5 shadow-soft">
                <div className="grid size-10 place-items-center rounded-xl bg-brand-soft text-brand">
                  <l.icon className="size-5" />
                </div>
                <div className="mt-3 font-semibold">{l.title}</div>
                <p className="mt-1 text-sm text-muted-foreground">{l.detail}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
        <div className="mt-3 flex items-start gap-3 rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-eco-soft text-eco-strong">
            <Wand2 className="size-5" />
          </div>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Optional AI helper.</span> Claude can explain code and write
            documentation. With no key it falls back to a built-in demo mode, so the whole app works for everyone with
            zero configuration.
          </p>
        </div>
      </section>

      {/* Pipeline */}
      <section>
        <SectionTitle icon={Zap}>How an analysis flows</SectionTitle>
        <div className="flex flex-wrap items-center gap-2">
          {PIPELINE.map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs font-medium shadow-soft">
                <span className="grid size-5 place-items-center rounded-md bg-brand-soft font-mono text-[0.65rem] font-bold text-brand">
                  {i + 1}
                </span>
                {step}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 9 features */}
      <section>
        <SectionTitle icon={Gauge}>The nine required features</SectionTitle>
        <Stagger className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <StaggerItem key={f.title}>
              <div className="h-full rounded-2xl border border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift">
                <div className="grid size-9 place-items-center rounded-lg bg-brand-soft text-brand">
                  <f.icon className="size-[18px]" />
                </div>
                <div className="mt-3 text-sm font-semibold">{f.title}</div>
                <p className="mt-1 text-xs text-muted-foreground">{f.detail}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* 6 green features */}
      <section>
        <SectionTitle icon={Leaf}>The six green features</SectionTitle>
        <Stagger className="grid gap-3 sm:grid-cols-2">
          {GREEN.map((g, i) => (
            <StaggerItem key={g.title}>
              <div className="flex h-full items-start gap-3 rounded-2xl border border-eco/30 bg-eco-soft/40 p-5 shadow-soft">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-eco text-primary-foreground font-mono text-xs font-bold">
                  {i + 1}
                </span>
                <div>
                  <div className="text-sm font-semibold text-eco-strong">{g.title}</div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{g.detail}</p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* Tech stack */}
      <section>
        <SectionTitle icon={Cpu}>Tech stack</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {STACK.map((t) => (
            <span key={t} className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium shadow-soft">
              {t}
            </span>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Every package is current, non-deprecated tooling as of the build date.</p>
      </section>

      {/* Run it */}
      <section>
        <SectionTitle icon={Terminal}>Run it on your machine</SectionTitle>
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
          <div className="flex items-center gap-1.5 border-b border-border px-4 py-2.5">
            <span className="size-2.5 rounded-full bg-red-400" />
            <span className="size-2.5 rounded-full bg-amber-400" />
            <span className="size-2.5 rounded-full bg-emerald-400" />
            <span className="ml-2 text-xs text-muted-foreground">terminal</span>
          </div>
          <pre className="overflow-x-auto p-4 font-mono text-xs leading-6 text-foreground">
            <span className="text-muted-foreground"># 1 · get the code</span>{"\n"}
            git clone {REPO}.git{"\n"}
            cd greenprint{"\n\n"}
            <span className="text-muted-foreground"># 2 · install</span>{"\n"}
            npm install{"\n\n"}
            <span className="text-muted-foreground"># 3 · run (first run creates the DB, migrates & seeds)</span>{"\n"}
            npm run dev
          </pre>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Then open <span className="font-mono text-foreground">http://localhost:3000</span>. Prerequisite: Node.js 20.9+.
          Sign in with any seeded account (e.g. <span className="font-mono text-foreground">victor.ozuzu@greenprint.demo</span>)
          using the password <span className="font-mono text-foreground">greenprint</span>, or click{" "}
          <span className="font-medium text-foreground">Create an account</span>. Live Claude AI is optional — add an{" "}
          <span className="font-mono text-foreground">ANTHROPIC_API_KEY</span> to <span className="font-mono text-foreground">.env</span>.
        </p>
      </section>

      {/* Resources */}
      <section>
        <SectionTitle icon={BookOpen}>Read more</SectionTitle>
        <Stagger className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {RESOURCES.map((r) => (
            <StaggerItem key={r.title}>
              <Link
                href={r.href}
                target={r.external ? "_blank" : undefined}
                rel={r.external ? "noreferrer" : undefined}
                className="group flex h-full items-start gap-3 rounded-2xl border border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-lift"
              >
                <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-foreground transition-colors group-hover:bg-brand-soft group-hover:text-brand">
                  <r.icon className="size-[18px]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1 text-sm font-semibold">
                    {r.title}
                    <ArrowUpRight className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{r.detail}</p>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <p className="pt-2 text-center text-xs text-muted-foreground">
        Built by {COURSE.group} — {COURSE.institution} · {COURSE.code}.
      </p>
    </div>
  );
}
