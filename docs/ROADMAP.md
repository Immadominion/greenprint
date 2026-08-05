# Greenprint - Build Roadmap & Engineering Principles

Greenprint (*Sustainable AI Code Assistant Dashboard*) - SOE 508 · Special Topics in
Software Engineering · Group 3 · Federal University of Technology, Owerri (FUTO).

This document records **how the app was built** (the phases, in the order they were
completed) and the **working rules** the team holds itself to. It is the companion to
`docs/ARCHITECTURE.md` (what the system *is*) and `.github/copilot-instructions.md` (how to
work in the repo day-to-day).

---

## Part A - Build roadmap (completed phases)

The project was built engine-first: prove the offline analysis is real and defensible,
then wrap it in a polished, gamified product. Each phase left the app in a runnable state.

### Phase 1 - Analysis engine (the core) ✅
`src/lib/analysis/`. Built the pure, dependency-free pipeline
(`detectLanguage → preprocess → metrics → rules → estimate → score`) with a strong type
model (`types.ts`), the comment/string-stripping pre-processor and loop/block-nesting
analysis (`preprocess.ts`), size + complexity + maintainability metrics (`metrics.ts`), the
rule catalogue (`rules.ts`, `RULE_CATALOG`), the Big-O + energy/CO₂ model and EcoScore
(`estimate.ts`), and the `analyzeCode()` orchestrator (`index.ts`). Validated with
`scripts/smoke-analysis.ts` (`npm run smoke`).

### Phase 2 - Design system ✅
`brand.md` + `src/app/globals.css` (Tailwind v4 `@theme` tokens: orange brand + emerald
`eco`, light default + `.dark`), shadcn/ui primitives (`src/components/ui/`, Radix Nova),
and the branded component kit (`src/components/greenprint/`: EcoScoreGauge, severity/grade/
complexity badges, XpBar, TrendChart, CountUp, motion helpers, theme toggle, logo).

### Phase 3 - Auth + database ✅
Better Auth email/password (`src/lib/auth.ts`, `auth-client.ts`, `session.ts`, the
`/api/auth/[...all]` handler, and the `(auth)/login|signup` pages) over Drizzle + libSQL.
Schema (`src/lib/db/schema.ts`), runtime migrations (`migrate.ts`), and the one-command
`setup.ts` that makes `npm run dev` self-provisioning (`.env` + migrate + seed).

### Phase 4 - Workspace ✅
`src/app/(app)/workspace` + `WorkspaceClient`: CodeMirror 6 editor (`code-editor.tsx`),
language picker, file upload, built-in examples (`src/lib/examples.ts`), and the
`analyzeAndSaveAction` write path (analyse → persist → XP → streak → badges), with results
(`analysis-results.tsx`) and issue cards.

### Phase 5 - Dashboard ✅
`src/app/(app)/dashboard`: greeting hero + XP bar, stat tiles, EcoScore trend chart
(Recharts), badges, and a live "green engineering" panel (cache hits + team CO₂ saved).
Backed by the read-only, column-lean queries in `src/lib/data.ts`.

### Phase 6 - Gamification ✅
`src/lib/game/` (XP formula, level curve `60·L·(L−1)`, tree-growth ranks, 12 badges,
streaks) wired into the action layer, the `RewardOverlay` celebration, and the team
`/leaderboard` (podium + ranked list).

### Phase 7 - AI layer ✅
`src/lib/ai/index.ts`: Claude "explain" + "auto-document", cached in SQLite by code hash
(`ai_cache`), with a deterministic **demo fallback** so the app is fully usable with no API
key. Surfaced via `ai-panel.tsx` and the `explainCodeAction` / `generateDocsAction`.

### Phase 8 - Reports & export ✅
`src/components/app/export-buttons.tsx`: full **PDF** (jsPDF, branded) and **CSV** reports
for any analysis, available in the workspace and on `/history/[id]`.

### Phase 9 - Landing & polish ✅
`src/app/page.tsx`: marketing landing that renders a *real* demo analysis, the 8 product
features and 6 "green by design" features, live global-impact counters, plus the `/team`
roster and the `/rules` "How it works" reference (pipeline + energy model + `RULE_CATALOG`).

### Phase 10 - Documentation ✅
`docs/ARCHITECTURE.md`, `docs/ROADMAP.md`, `.github/copilot-instructions.md`.

---

## Part B - Working rules / engineering principles

These are the non-negotiables the team applies to every change.

1. **Use the latest, non-deprecated tech - and verify versions before adding anything.**
   Confirm the current package version and API before introducing or upgrading a dependency;
   heed deprecation notices (Next.js 16 in particular differs from older references - check
   `node_modules/next/dist/docs/` and the repo `AGENTS.md`). Don't code against remembered
   APIs.

2. **Keep the UI consistent with the existing design system.** Style through the tokens in
   `src/app/globals.css` (Tailwind v4 `@theme`) - orange brand, emerald `eco` accent used
   sparingly as the "planet payoff", light default + `.dark`. Reuse `src/components/ui` and
   `src/components/greenprint` before building anything new; never hard-code colors or hex.

3. **Never present modelled estimates as measured fact.** Energy, CO₂, runtime and ops are a
   transparent teaching model (constants in `src/lib/analysis/estimate.ts`) - always label
   them "estimated"/"modelled" and keep the assumptions visible. The only genuinely measured
   number is `analysisDurationMs`; treat it honestly as such.

4. **The core analysis engine stays offline and dependency-free.** `src/lib/analysis/*` must
   remain pure, synchronous TypeScript with no network, database, API key or npm imports, so
   it runs identically on server, browser or worker. New detection logic goes into the rule
   catalogue in `rules.ts` (which also powers the `/rules` page).

5. **AI is optional and cached.** Every Claude feature must (a) work with no API key via a
   deterministic demo fallback, and (b) cache by code hash in `ai_cache` so identical code is
   never billed twice. Default to the smallest capable model (Haiku) - that is itself a
   sustainability choice.

6. **Keep the app installable by non-technical teammates with a single `npm run dev`.**
   `src/lib/db/setup.ts` must keep provisioning everything (env + migrations + seed) on first
   run; no manual database, environment, or API-key steps may become required. If a change
   would break the zero-config clone-and-run flow, it isn't done.
