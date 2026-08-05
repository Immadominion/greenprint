# Greenprint - AI agent instructions

Greenprint is a **Sustainable AI Code Assistant Dashboard** (SOE 508 · Group 3 · FUTO):
paste code → get an offline static analysis (EcoScore, issues, greener fixes, modelled
energy/CO₂) with optional AI explain/document and gamification (XP, levels, badges,
streaks, leaderboard). See `docs/ARCHITECTURE.md` for the full picture.

## Big-picture architecture
- One **Next.js 16** app (App Router, Turbopack, React 19, TS). Server-first: read data in
  Server Components via `src/lib/data.ts` (`server-only`); mutate via **Server Actions** in
  `src/lib/actions.ts` - never add API routes for app logic (the only route handler is
  Better Auth's `src/app/api/auth/[...all]/route.ts`).
- **`src/lib/analysis/`** is the heart: pure, synchronous, **dependency-free, offline**
  TypeScript. `analyzeCode()` runs `detectLanguage → preprocess → metrics → rules →
  estimate → score`. Do not add imports (no network, no DB, no npm deps) here - it must keep
  running identically on server, browser or worker. `src/lib/analysis/rules.ts`'s
  `RULE_CATALOG` also feeds the `/rules` page, so add rules there, not ad hoc.
- **`src/lib/game/`** (levels·xp·badges) and **`src/lib/ai/`** (Claude + SQLite cache +
  demo fallback) are the other two pure-ish libraries. `analyzeAndSaveAction` is the one
  write path that ties analysis + persistence + XP + streak + badges together.
- Data: **Drizzle ORM + libSQL**, a local `greenprint.db` file. Schema in
  `src/lib/db/schema.ts` (8 tables). Auth: **Better Auth** email/password
  (`src/lib/auth.ts`, session helpers in `src/lib/session.ts` → `getSession`/`requireUser`).

## Critical workflows
- `npm run dev` auto-runs `src/lib/db/setup.ts` **before** `next dev`: it creates `.env`
  (fresh `BETTER_AUTH_SECRET`) if missing, applies migrations (`db/migrate.ts`), and seeds
  the 15-member team + history if the DB is empty (`db/seed.ts`). So a teammate just clones
  and runs `npm run dev` - keep it that way.
- `npm run db:reset` deletes the SQLite files and reseeds. `npm run db:generate` emits SQL
  migrations from the schema (run after editing `schema.ts`, then reset). `npm run smoke`
  runs `scripts/smoke-analysis.ts` to sanity-check the engine. `npm run build` / `start`
  are standard. Demo login: any member email in `src/lib/team.ts`, password `greenprint`.
- **Next.js 16 has breaking changes vs. older training data** - see the repo's `AGENTS.md`;
  when unsure about an App Router API, check `node_modules/next/dist/docs/`.

## Project-specific conventions
- Import alias **`@/`** → `src/` (tsconfig `paths`). Use it, not deep relative paths.
- **Honesty about numbers:** energy/CO₂ are a *modelled teaching estimate*, never a
  measurement - always label them "estimated/modelled". The only real timing is
  `report.analysisDurationMs`. Model constants live in `src/lib/analysis/estimate.ts`
  (N=10,000; ~100M ops/s; 15 W; 475 gCO₂/kWh).
- **Design tokens** live in `src/app/globals.css` (Tailwind v4 `@theme`, not a JS config).
  Brand = **orange** primary (`--brand`/`bg-brand`/`text-brand`) on a white canvas, with an
  **emerald `eco`** accent (`--eco`/`bg-eco`/`text-eco-strong`) reserved for the "planet
  payoff"; `warn` amber and `destructive` red for severities. Light is the default; dark is
  the `.dark` class (runtime toggle). Don't hard-code hex - use the tokens. Fonts are wired
  via `next/font` in `src/app/layout.tsx` (display/body/mono CSS variables).
- **Reuse components:** shadcn/ui primitives in `src/components/ui/` (Radix Nova style,
  `components.json`), branded pieces in `src/components/greenprint/` (EcoScoreGauge, badges,
  XpBar, TrendChart, CountUp, motion helpers), feature blocks in `src/components/app/`.
  Prefer composing these over new one-offs; animations use `motion` and must respect
  `prefers-reduced-motion` (already handled globally in `globals.css`).
- Server Actions must start by verifying the session and return a discriminated result
  (`{ ok: true, ... } | { ok: false, error }`); follow the existing shape in `actions.ts`.

## Integration points
- **Anthropic (optional):** set `ANTHROPIC_API_KEY` to upgrade the two AI panels from demo
  to live Claude; default model `ANTHROPIC_MODEL=claude-haiku-4-5-20251001`. All AI calls go
  through `src/lib/ai/index.ts` and **must** cache by code hash (`ai_cache`) and keep the
  deterministic demo fallback so the app works with no key.
- **DB target:** `DATABASE_URL` (default `file:greenprint.db`) can point at a Turso
  `libsql://` URL; don't assume a server DB - everything must work from the local file.
