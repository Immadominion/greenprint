# Project Brief — the original assignment, captured

> This file preserves the **original brief** for Greenprint so the requirements are never
> lost as work progresses. It is the source of truth for "what were we asked to build?"
> Everything below is traced to a concrete deliverable in the [Requirements traceability](#requirements-traceability) table.

## The assignment

- **Course:** SOE 508 — *Special Topics in Software Engineering*
- **Group:** Group 3, Federal University of Technology, Owerri (FUTO)
- **Project 3:** **Sustainable AI Code Assistant Dashboard**
- **Nature:** a demo / prototype — **but it must genuinely work**, with a UI good enough to impress the lecturer.
- **Repository:** its own directory (`greenprint/`) with its own separate GitHub repo.

## The 9 required features

1. Secure user authentication.
2. Code editor **or** code upload.
3. AI-assisted code explanation.
4. AI-generated documentation.
5. Basic code quality analysis.
6. Detection of inefficient algorithms / coding patterns.
7. Suggestions for energy-efficient alternatives.
8. Dashboard with software-quality **and** sustainability metrics.
9. Exportable reports (PDF or CSV).

## The 6 required "green" features

1. Identify resource-intensive code.
2. Recommendations for algorithmic optimization.
3. Efficient caching to reduce repeated AI requests.
4. Optimized database access.
5. Lightweight application architecture.
6. Measurement of estimated execution time and resource usage.

## Team & presentation requirements

- 18 people listed; **15 active** (3 dropped: Solomon Victoria-Imaobong Conleth,
  Ozieme Paul Chimusom, Onyeukwu Light Onyeyirichi).
- Group leader: **Ozuzu Victor Onyedikachi**.
- **Every active member must have a distinct part to present and defend.** The defense guide must be:
  - **plain English** (graders are non-technical),
  - **granular** (one clear part per person — what it is, what they did),
  - and it must state that **defense questioning is random**, so everyone should skim everyone else's part.
- Teammates must be able to **install and run the app on their own machines**.
- The full class-list spreadsheet was used **locally only** to pull reg numbers — it is **never published**.
  Reg numbers are kept **only in the team's private Google Doc** (the defense guide) — deliberately **not** in this public repo.

## Design direction

- **Gamified**, with a very high UI/UX bar: loading states, reactiveness, micro-animations — "anything that makes a website exceptional."
- Design references imported via the Claude Design MCP:
  - **App:** *The Touchline* / *The Gaffer* (project `f12a62f7-d717-45ed-8349-0b3f43cffa3f`).
  - **Landing:** *Eddie* (project `5bf85bcd-c916-44ea-afbf-0c88cd4b7a55`).
- Our **own theme** (chosen by us): clean **white** background, bright **orange** for action, **emerald green** for the eco/sustainability accents; runtime light/dark.

## Working rules we respect (from the brief)

1. **Use only current, non-deprecated technology.** Verify package versions from the web before adopting; no outdated tech or code techniques.
2. **UI consistency.** Every edit must match the existing design system / UI patterns.
3. **Never present inferred, speculated, or deduced content as fact.** Label unverified claims `[Inference]` / `[Speculation]` / `[Unverified]`; say plainly when something cannot be verified. This is why every energy/CO₂ number in the app is labelled a **modelled estimate**, never a measurement.
4. **Proper documentation is non-negotiable** for a final-year project — an in-app docs page (**How it works** → `/rules`), technical docs (`docs/`), and the separate plain-English defense guide.
5. Generate/maintain `.github/copilot-instructions.md` for AI coding agents on this repo.
6. Be strategic and self-directed: keep a roadmap ([`docs/ROADMAP.md`](ROADMAP.md)) and re-prompt for the next best step.

## Requirements traceability

| # | Brief item | Delivered as |
|---|---|---|
| 1 | Secure authentication | Better Auth (hashed passwords, session cookies) — `src/lib/auth.ts`, `session.ts` |
| 2 | Code editor / upload | CodeMirror 6 editor + file upload + examples — `src/components/app/code-editor.tsx` |
| 3 | AI code explanation | "Explain this code" (Claude Haiku 4.5, or offline demo) — `src/lib/ai/index.ts` |
| 4 | AI documentation | "Auto-document" — `src/lib/ai/index.ts` |
| 5 | Code quality analysis | Cyclomatic complexity, nesting, maintainability index — `src/lib/analysis/metrics.ts` |
| 6 | Inefficiency detection | 21-rule catalogue — `src/lib/analysis/rules.ts` |
| 7 | Energy-efficient alternatives | Every issue ships a greener fix — `rules.ts` + results UI |
| 8 | Sustainability dashboard | EcoScore trend, CO₂ saved, quality + green metrics — `src/app/(app)/dashboard/` |
| 9 | Exportable reports | PDF + CSV — `src/components/app/export-buttons.tsx` |
| G1 | Resource-intensive code | Flags exact costly lines — `rules.ts` |
| G2 | Algorithmic optimization | O(n²) → O(n) suggestions — `rules.ts` |
| G3 | Efficient AI caching | SQLite cache keyed by content hash — `src/lib/ai/index.ts` |
| G4 | Optimized DB access | Select-only-needed-columns queries — `src/lib/data.ts` |
| G5 | Lightweight architecture | Dependency-free offline engine — `src/lib/analysis/` |
| G6 | Execution-time / resource measurement | Modelled runtime + real analysis timing — `src/lib/analysis/estimate.ts` |
| — | Per-member defense guide | [`docs/DEFENSE-GUIDE.md`](DEFENSE-GUIDE.md) (+ a Google Doc copy for the team) |
| — | Install & run on any machine | `npm install && npm run dev` (auto-sets-up DB) — see [README](../README.md) |
| — | Gamification / high-bar UI | XP, levels, badges, streaks, leaderboard; Motion animations |
| — | Own repo | https://github.com/Immadominion/greenprint |
| — | Live deployment | https://greenprint-eta.vercel.app (Vercel + Turso) |
| — | copilot-instructions | [`.github/copilot-instructions.md`](../.github/copilot-instructions.md) |

_Kept for the team so the brief is always one file away. Built by Group 3 for SOE 508, FUTO._
