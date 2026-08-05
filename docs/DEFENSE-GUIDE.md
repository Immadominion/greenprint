# Greenprint — Defense & Presentation Guide

**Read this before the presentation.** It explains the whole project in plain English, then
gives **each of the 15 team members their own part to present and defend**.

> ⚠️ The lecturer can ask *anyone* about *any* part. So: **learn your own section deeply**, and
> **skim everyone else's** so you're never caught blank. Sections 0 and 1 are things *everyone*
> should be able to say.

The people below are the **15 active members** of Group 3. (Three members on the class list —
Ozieme Paul Chimusom, Solomon Victoria-Imaobong Conleth, and Onyeukwu Light Onyeyirichi — dropped
and are not part of this build.)

---

## 0 · The 30-second pitch (everyone memorises this)

> "Greenprint is a **Sustainable AI Code Assistant**. You paste in code, and it gives it an
> **EcoScore** out of 100 — like a health rating for how efficient and eco-friendly the code is.
> It finds wasteful patterns like nested loops or database calls inside loops, estimates how much
> **time, electricity and CO₂** that code would waste, and shows a **greener fix** for each problem.
> It can also explain the code and write documentation using AI. And it's **gamified** — you earn
> XP, badges and streaks, and compete on a team leaderboard. It runs **fully offline** — no API key
> needed — so everyone can install and run it easily."

**The problem we solve:** software runs on electricity, and electricity has a carbon footprint.
Inefficient code wastes both. Most tools check if code *works*; Greenprint checks what it *costs
the planet* and teaches developers to write greener code.

---

## 1 · The big picture, in plain English (everyone should understand this)

Think of Greenprint as three layers stacked on top of each other:

1. **The face (what you see):** the website — the landing page, the dashboard, and the "Analyze"
   workspace where you paste code. Built with **Next.js** and **React**.
2. **The brain (the analysis engine):** a set of programs that read your code and figure out how
   efficient it is. This is **100% offline** — it does not need the internet or any AI. It's the
   part that makes Greenprint a *software engineering* project, not just a pretty website.
3. **The memory (the database):** a local file that remembers your account, your past analyses,
   your XP and badges, and the leaderboard. Built with **SQLite** (a database in a single file).

On top of that, an **optional AI helper** (Claude) can explain code and write documentation — but
if there's no AI key, it falls back to a built-in "demo mode" so the app always works.

**What happens when you click "Analyze code":**

```mermaid
flowchart LR
    A[You paste code] --> B[Detect the language]
    B --> C[Clean it: remove comments & strings]
    C --> D[Measure it: size, complexity, nesting]
    D --> E[Detect problems: 21 rules]
    E --> F[Estimate energy & CO2]
    F --> G[Score it: EcoScore 0-100]
    G --> H[Save it + award XP & badges]
    H --> I[Show results + greener fixes]
```

---

## 2 · Each member's part

Every section has the same shape: **what it is**, **how it works in plain English**, **the files
you own**, and **questions you should be ready to answer**.

---

### 👑 Ozuzu Victor Onyedikachi — Team Lead & Project Overview

**Your part in one sentence:** you own the *story* — what Greenprint is, why we built it, and how
the whole team's work fits together.

**What it does:** you introduce the project, present the problem (wasteful code = wasted energy =
carbon), walk through the 9 requirements and the 6 green features, and run the live demo.

**How it works (your talking points):**
- Greenprint ties together four parts: a **web app**, an **offline analysis engine**, a **database**,
  and an **optional AI assistant**.
- Every requirement in the brief is covered — you can point to the feature table in the README.
- Everyone on the team owns one clear piece (introduce them using this guide).

**The files you own:** `README.md`, `src/lib/team.ts` (the roster + everyone's role), and the
overall demo flow.

**Be ready to answer:**
- *"What does this project do?"* → give the 30-second pitch (Section 0).
- *"How did you divide the work?"* → 15 members, one component each (show the Team page in the app).
- *"Is it finished and running?"* → yes; demo it live: sign in → analyze → show the EcoScore, issues
  and greener fixes → show the dashboard and leaderboard.

---

### 🧭 Nwakanma Dominion Chinonso — Architecture & System Design

**Your part in one sentence:** how the whole system is put together and why we made those choices.

**What it does:** you explain the "shape" of the app — how the pieces (web pages, the engine, the
database, the AI) talk to each other.

**How it works (plain English):**
- We used **Next.js**, which is a "full-stack" framework: the same project holds both the web pages
  *and* the server logic. No separate backend server to manage.
- Pages are mostly **Server Components** — they run on the server, fetch what they need, and send
  finished HTML to the browser. That's faster and lighter (a *green* choice).
- When you *do* something (like analyze code), the browser calls a **Server Action** — a secure
  function that runs on the server. Ours is `analyzeAndSaveAction`: it analyses the code, saves it,
  and updates your XP and badges, all in one trip.
- We kept the **analysis engine separate and dependency-free** so it can run anywhere and never
  needs the internet. This is the key architectural decision.

**The files you own:** the folder layout under `src/app` (pages) and `src/lib` (logic),
`src/lib/actions.ts` (the server actions), `src/lib/session.ts` (who's logged in), and
`docs/ARCHITECTURE.md`.

**Be ready to answer:**
- *"Why Next.js?"* → one codebase for frontend + backend, fast Server Components, modern and current.
- *"How does the browser get data from the server?"* → Server Components fetch on the server; user
  actions call Server Actions (secure server functions).
- *"Why keep the engine separate?"* → so it's reusable, testable, offline, and lightweight.

---

### 📐 Okoye Victor Ebubechukwu — Analysis Engine: Complexity Metrics

**Your part in one sentence:** the part that *measures* how big and how tangled a piece of code is.

**What it does:** counts lines of code, comments and blanks; measures **cyclomatic complexity**
(how many decision paths the code has), how deeply nested it is, how long each function is, and a
**maintainability index** (an overall health score for readability).

**How it works (plain English):**
- **Cyclomatic complexity** = "how many different ways can this code branch?" We count decision
  points — every `if`, `for`, `while`, `case`, `&&`, `||` — and add 1. More branches = harder to
  test and more tangled.
- **Nesting depth** = how many layers deep the code goes (a loop inside a loop inside an `if`…).
  Deep nesting usually hides expensive work.
- Before counting, we **strip out comments and text strings** so we don't accidentally count the
  word "for" inside a comment. That cleaning step is shared by the whole engine.

**The files you own:** `src/lib/analysis/metrics.ts` and the pre-processing in
`src/lib/analysis/preprocess.ts`.

**Be ready to answer:**
- *"What is cyclomatic complexity?"* → a count of the independent paths through the code; higher =
  more complex and harder to test.
- *"How do you measure it without fully understanding the code?"* → we count decision keywords in
  the cleaned source. It's an approximation — deliberately lightweight so it's fast and needs no
  heavy tools.
- *"What is the maintainability index?"* → a standard 0–100 score combining size, complexity and
  comments; higher means healthier code.

---

### 🔍 Ezeh Chibuzor Nwabueze — Analysis Engine: Inefficiency Rules

**Your part in one sentence:** the "checklist of bad habits" — the rules that actually *find* the
wasteful patterns in code.

**What it does:** scans the cleaned code against a **21-rule catalogue** and flags every match with a plain
explanation of *why it's bad* and a *greener alternative*. Examples: nested loops (O(n²)), a
database query inside a loop (the "N+1" problem), `SELECT *`, building a string inside a loop,
exponential recursion, logging inside a loop, and more.

**How it works (plain English):**
- Each rule is a small pattern-matcher. For example, the "print inside a loop" rule looks for a
  `console.log`/`print` that sits *inside* a loop.
- Some rules need context — "is this line inside a loop?" — so the engine first works out the
  **loop nesting** of every line, and the rules reuse that.
- The flagship rule, **nested loops**, is what powers the O(n²) detection: a loop inside another
  loop multiplies the work.
- Every rule carries its own message, severity (critical/high/medium/low), and the greener fix, so
  the same catalogue feeds the results screen, the reports, *and* the in-app "How it works" page.

**The files you own:** `src/lib/analysis/rules.ts` (the rule catalogue `RULE_CATALOG`).

**Be ready to answer:**
- *"What is the N+1 problem?"* → running a database query once per loop iteration turns 1 query into
  N; batch it into a single query instead.
- *"How does it detect nested loops?"* → it tracks how deeply loops are nested and flags any loop
  that sits inside another.
- *"Could it be wrong sometimes?"* → yes — it's heuristic (pattern-based), which we chose so it stays
  fast and dependency-free. It can occasionally miss or over-flag; that trade-off is documented.

---

### ⚡ Onyemauche Ifeanyichukwu Victor — Energy & CO₂ Estimation Model

**Your part in one sentence:** the part that turns "this code is inefficient" into actual numbers —
estimated time, electricity, and carbon.

**What it does:** works out the code's **Big-O complexity class** (how the work grows as input
grows — O(1), O(n), O(n²), O(2ⁿ)…), then estimates the operations, runtime, energy (joules) and
CO₂ (grams) it would use, plus how much CO₂ the greener fixes could save.

**How it works (plain English) — this is a MODEL, not a measurement (say this clearly):**
- We infer the complexity class from the loops and recursion (2 nested loops ≈ O(n²), exponential
  recursion ≈ O(2ⁿ), etc.).
- We imagine running it on a standard-sized input: **N = 10,000 items**.
- From the complexity class we estimate the number of operations, then convert with documented
  assumptions: about **100 million operations per second**, a **15-watt** active CPU core, and the
  world-average grid carbon intensity of **475 grams of CO₂ per kilowatt-hour**.
- We show every one of these assumptions on the results screen — nothing is hidden, and we never
  claim the numbers are measured. It's a *teaching model* that makes the cost tangible.

**The files you own:** `src/lib/analysis/estimate.ts` (the `buildEnergyEstimate` part and the model
constants).

**Be ready to answer:**
- *"Are these real measurements?"* → no — they're **modelled estimates** from documented
  assumptions. We say so on every result. The point is to compare and teach, not to be lab-accurate.
- *"Where does 475 g/kWh come from?"* → it's the commonly cited global average grid carbon intensity.
- *"Why N = 10,000?"* → a reasonable "at scale" input so the differences between O(n) and O(n²)
  become visible.

---

### 🎯 Obi Michael Chimaobi — EcoScore & Scoring System

**Your part in one sentence:** how we turn all the findings into a single, fair **score out of 100**
with a letter grade.

**What it does:** computes the **EcoScore** (0–100), the **grade** (A+ to F), the **rating**
(Excellent → Poor), and a separate **quality score**.

**How it works (plain English):**
- The score is split into four "buckets" that add up to 100:
  - **Algorithmic efficiency (30 points):** lose points for expensive complexity classes (O(n²)
    costs more than O(n)).
  - **Green practices (40 points):** lose points for each efficiency/energy issue, weighted by how
    serious it is (a critical issue costs more than a low one).
  - **Code quality (20 points):** based on the maintainability index and quality issues.
  - **Complexity & nesting (10 points):** lose points for very high complexity or deep nesting.
- Add the buckets up, and map the total to a grade (95+ = A+, … below 50 = F).

**The files you own:** `src/lib/analysis/estimate.ts` (`computeEcoScore`, `computeQualityScore`).

**Be ready to answer:**
- *"How is the EcoScore calculated?"* → start from 100 across four weighted buckets; subtract points
  for a costly complexity class and for each issue by severity.
- *"Why split into buckets?"* → so the score is explainable and fair — you can see *why* you lost
  points, not just the number.
- *"What's the difference between EcoScore and quality score?"* → EcoScore is mostly about
  efficiency/sustainability; the quality score is about readability/maintainability.

---

### 🔐 Okafor Kosisochukwu JohnPaul — Authentication & Security

**Your part in one sentence:** how users sign up and log in securely, and how we keep private pages
private.

**What it does:** email + password sign-up and login, secure password storage, sessions that keep
you logged in, and protection so only signed-in users can reach the dashboard/workspace.

**How it works (plain English):**
- We use **Better Auth**, a modern authentication library. When you sign up, your password is
  **hashed** (scrambled one-way) before it's stored — we never keep the real password.
- On login, a **session** is created and stored in a secure cookie in your browser, so you stay
  logged in as you move around.
- Every protected page checks "is this person logged in?" first (`requireUser`). If not, it
  redirects to the login page. The same check guards our server actions.
- All the login/signup endpoints live under one address, `/api/auth/...`.

**The files you own:** `src/lib/auth.ts` (server config), `src/lib/auth-client.ts` (browser side),
`src/lib/session.ts` (the "who's logged in?" helpers), `src/app/api/auth/[...all]/route.ts`, and the
login/signup pages.

**Be ready to answer:**
- *"How are passwords stored?"* → hashed (one-way scrambled) by Better Auth, never in plain text.
- *"How does the app know I'm logged in?"* → a secure session cookie in the browser; the server
  checks it on each protected request.
- *"How do you stop someone reaching the dashboard without logging in?"* → the protected layout runs
  `requireUser`, which redirects logged-out visitors to `/login`.

---

### 🗄️ Enyinnia Joseph Chidubem — Database & Data Model

**Your part in one sentence:** where and how everything is stored, and how we get it back quickly.

**What it does:** stores users, sessions, every analysis, the game profile (XP/level/streak), earned
badges, and the AI cache — all in a single local database file.

**How it works (plain English):**
- The database is **SQLite** — an entire database living in one file (`greenprint.db`). No server to
  install; that's why teammates can just run the app.
- We describe the tables in code using **Drizzle** (a type-safe database toolkit). The main tables:
  - `user`, `session`, `account`, `verification` — for login (used by Better Auth).
  - `game_profile` — your XP, level, streak and lifetime totals.
  - `analysis` — every analysis you run (code, EcoScore, issues, the full report).
  - `user_badge` — which badges you've earned.
  - `ai_cache` — saved AI answers so we never pay for the same request twice.
- On first run, we **create the tables (migrations)** and **seed demo data** automatically.
- For speed and to be green, our list queries only fetch the columns they show — we don't drag the
  whole heavy code text into a list that only needs the title.

**The files you own:** `src/lib/db/` (schema, migrations, seed, setup) and `src/lib/data.ts` (the
read queries).

**Be ready to answer:**
- *"Why SQLite?"* → zero setup, one file, runs anywhere — perfect for a demo everyone must run.
- *"What is a migration?"* → the script that creates/updates the database tables.
- *"How is the database access 'optimized'?"* → list views select only the columns they display, not
  the heavy ones — less data moved, less energy.

---

### 🤖 Chukwuemeka-ogu Chinalurum Michael — AI Layer (Claude & Caching)

**Your part in one sentence:** the smart assistant that explains code and writes documentation — and
does it efficiently.

**What it does:** two AI features — **"Explain this code"** and **"Auto-document"** — powered by
Anthropic's **Claude**, with two green tricks: it **caches** answers and **falls back** to an offline
demo mode.

**How it works (plain English):**
- When you ask for an explanation, we send the code to Claude and show its reply (rendered nicely as
  formatted text).
- **Caching (the green part):** before calling Claude, we make a short "fingerprint" (a hash) of the
  code. If we've explained that exact code before, we return the saved answer instantly — no repeat
  AI call, which saves money *and* energy. This is a required green feature.
- **Demo fallback:** if there's no AI key, we still produce a genuinely useful explanation built from
  our own offline analysis — so the app always works for everyone.
- We default to a **small, efficient model** (Claude Haiku) because using the smallest capable model
  is itself a sustainability choice.

**The files you own:** `src/lib/ai/index.ts`.

**Be ready to answer:**
- *"Does it need an API key?"* → no — without one it uses demo mode; a key just upgrades the two AI
  panels to live Claude.
- *"How does caching save energy?"* → identical code is never sent to the AI twice; we reuse the
  stored answer.
- *"Why the small model?"* → smaller model = less computation = less energy, and it's plenty for
  explaining code.

---

### 💻 Ukwuoma Chiemerie Gerald — Code Workspace & Editor

**Your part in one sentence:** the main screen where you paste, upload or pick code and press
"Analyze".

**What it does:** provides the **code editor**, a language picker, file upload, one-click examples,
and shows the results and AI panels after analysis.

**How it works (plain English):**
- The editor is **CodeMirror** — the same kind of editor used in real coding tools, with syntax
  highlighting and line numbers.
- You can pick a language, upload a file (we auto-detect the language from the file name), or click a
  ready-made example like "N+1 Database Query".
- When you press **Analyze**, the workspace calls the server, gets the full report back, and shows a
  smooth loading animation, then the results — the EcoScore gauge, the metrics, and every issue with
  its greener fix. If you level up or earn a badge, a celebration pops up.

**The files you own:** `src/components/app/workspace-client.tsx`, `code-editor.tsx`, and
`analysis-results.tsx`.

**Be ready to answer:**
- *"What editor is that?"* → CodeMirror 6, a modern in-browser code editor.
- *"What happens when I click Analyze?"* → it sends the code to a server action, which runs the
  engine, saves the result, updates your XP, and returns everything to display.
- *"Can I analyse my own file?"* → yes — upload it; the language is detected from the file name.

---

### 📊 Alajemba Paul Uzochukwu — Dashboard & Data Visualization

**Your part in one sentence:** the home screen that turns all your data into clear numbers and graphs.

**What it does:** shows your rank and level, XP progress, key stats (analyses, average EcoScore, CO₂
saved, issues found), an **EcoScore trend chart** over time, an average-score gauge, recent activity,
your badges, and the green-engineering panel.

**How it works (plain English):**
- When the dashboard loads, it asks the database for your totals and recent analyses, then lays them
  out in cards.
- The **trend chart** (built with **Recharts**) plots your EcoScore over your last several analyses so
  you can see yourself improving.
- The numbers **count up** with a little animation, and the score **gauges** fill in — small touches
  that make the data feel alive.

**The files you own:** `src/app/(app)/dashboard/page.tsx`, `src/components/greenprint/trend-chart.tsx`,
`stat-tile.tsx`, and `eco-score-gauge.tsx`.

**Be ready to answer:**
- *"Where do the numbers come from?"* → from the database — every analysis you run is saved, and the
  dashboard adds them up.
- *"What library draws the chart?"* → Recharts.
- *"What does the average gauge show?"* → your average EcoScore across all analyses, colour-coded
  (green = good, red = poor).

---

### 🏆 Okereke Clement Kalu — Gamification (XP, Levels, Badges, Streaks)

**Your part in one sentence:** the game layer that makes writing greener code fun and competitive.

**What it does:** awards **XP** for each analysis, turns XP into **levels** with tree-themed ranks
(Seedling → Sprout → Sapling → … → Ancient Forest), tracks daily **streaks**, unlocks **12 badges**,
and ranks everyone on the **team leaderboard**.

**How it works (plain English):**
- Each analysis earns XP: a base amount, plus a bonus for a high EcoScore, plus a bit for each issue
  you surfaced, plus a first-of-the-day bonus.
- XP adds up to a **level** on a curve (early levels are quick; later ones take more). Each level band
  has a **rank name** and a little tree emoji.
- **Streaks:** analyse on consecutive days and your streak grows; miss a day and it resets.
- **Badges** are specific achievements — e.g. "N+1 Terminator" (you caught a query-in-a-loop),
  "Loop Slayer", "Week Warrior" (7-day streak). We check the conditions after every analysis.
- The **leaderboard** sorts everyone by XP.

**The files you own:** `src/lib/game/` (`levels.ts`, `xp.ts`, `badges.ts`) and the leaderboard page.

**Be ready to answer:**
- *"How is XP earned?"* → base + EcoScore bonus + issues surfaced + a daily bonus.
- *"What are the ranks?"* → tree-growth stages from Seedling to Ancient Forest, tied to your level.
- *"How do badges work?"* → each has a condition (e.g. reach a 7-day streak); we check them after
  each analysis and award any newly earned.

---

### 🎨 Ikeh-ezeji Pamela Chinaza — UI/UX & Design System

**Your part in one sentence:** the look and feel — the colours, fonts, animations, and the reusable
building blocks that keep every screen consistent.

**What it does:** defines the brand (a clean **white** background with a bright **orange** for action
and **green** for the eco/sustainability parts), the fonts, the light/dark mode, the motion and
micro-animations, and a library of shared components everyone else builds with.

**How it works (plain English):**
- All the colours, spacing and radii are defined once as **design tokens** in one stylesheet, so the
  whole app stays consistent and can switch **light/dark** instantly.
- We chose distinctive fonts (**Bricolage Grotesque** for headings, **Geist** for text) to avoid the
  generic "AI website" look.
- **Motion:** numbers count up, cards lift on hover, results fade in, and there's a confetti
  celebration when you level up — all built with the **Motion** library, and all respecting
  "reduce motion" settings for accessibility.
- The reusable components (score gauge, badges, stat tiles, buttons) mean every page looks like part
  of the same product.

**The files you own:** `src/app/globals.css` (the design tokens), `brand.md` (the brand spec), and
`src/components/greenprint/` (the shared components).

**Be ready to answer:**
- *"Why orange and green?"* → orange = energy/action, green = the planet/sustainability payoff; on a
  clean white base it looks modern and distinctive.
- *"How does dark mode work?"* → we define two sets of colour tokens; a toggle switches between them
  instantly.
- *"How did you make it feel polished?"* → consistent tokens, characterful fonts, and purposeful
  micro-animations (count-ups, hovers, a level-up celebration).

---

### 📄 Joseph Ayo Isaac — Reports & Export (PDF / CSV)

**Your part in one sentence:** the buttons that turn an analysis into a shareable report.

**What it does:** exports any analysis as a professional **PDF** or a **CSV** spreadsheet — covering
the EcoScore, all the metrics, the energy estimate, and every issue with its fix.

**How it works (plain English):**
- **PDF:** we build the document in the browser using **jsPDF** — an orange header, the EcoScore, a
  summary of the metrics and energy estimate, and a list of every issue with its greener fix. It
  handles page breaks so long reports stay tidy. Click "PDF" and it downloads.
- **CSV:** we assemble the same data as rows of a spreadsheet (metric, value… then a table of issues)
  and download it — handy for opening in Excel or Google Sheets.
- Both run entirely in the browser — no server round-trip needed to make the file.

**The files you own:** `src/components/app/export-buttons.tsx`.

**Be ready to answer:**
- *"What's in the PDF?"* → the EcoScore + grade, the metrics, the modelled energy/CO₂, and every
  issue with its suggested fix.
- *"Which library makes the PDF?"* → jsPDF, in the browser.
- *"Why also CSV?"* → so the data can be opened in a spreadsheet and analysed further.

---

### 🚀 Nwali Izuchukwu Hosea — Landing Page, Green Features & Deployment

**Your part in one sentence:** the "front door" of the app, the sustainability story, and how we run
and ship it.

**What it does:** the public landing page that markets Greenprint, the explanation of the **6 green
features** (and proof they're real), and the steps to run/deploy the app.

**How it works (plain English):**
- The **landing page** is the first thing a visitor sees: a bold headline, a live sample analysis as
  the hero image, the feature list, the "green by design" section, and calls-to-action to sign up.
  It even runs a *real* analysis to build its hero card — nothing is faked.
- **The 6 green features are genuine, not slogans:**
  1. *Resource-intensive code detection* — the engine flags the exact costly lines.
  2. *Algorithmic optimization advice* — every issue suggests a better approach (O(n²) → O(n)).
  3. *Efficient AI caching* — repeat AI requests are served from cache.
  4. *Optimized database access* — queries fetch only what's shown.
  5. *Lightweight architecture* — the engine has zero external dependencies and runs offline.
  6. *Execution-time & resource measurement* — we show the real time our analysis took *and* the
     modelled runtime of your code.
- **Running/deploying:** locally it's one command (`npm run dev`, which auto-sets-up the database).
  For the web it can be deployed to a host like Vercel; the database can stay as the local file or be
  swapped for a hosted one.

**The files you own:** `src/app/page.tsx` (landing) and the deployment/run notes in the README.

**Be ready to answer:**
- *"Are the green features real or just marketing?"* → real — point to each one in the running app
  (the cache counter on the dashboard, the "select only needed columns" queries, the offline engine).
- *"How do we run it?"* → `npm install` then `npm run dev`; it sets itself up on first run.
- *"How would you deploy it?"* → push to a host like Vercel; keep the local SQLite file or move to a
  hosted database.

---

## 3 · Plain-English glossary (for everyone)

- **EcoScore** — Greenprint's 0–100 rating of how efficient/eco-friendly the code is (like a health
  score). Higher is greener.
- **Big-O (e.g. O(n²))** — a way to describe how the work grows as the input grows. O(n) = grows in a
  straight line; O(n²) = grows much faster; O(2ⁿ) = explodes. Lower is greener.
- **Cyclomatic complexity** — a count of how many different paths the code can take. Higher = more
  tangled and harder to test.
- **N+1 problem** — asking the database once *per item* in a loop instead of once for all items. Very
  wasteful; a top thing to fix.
- **Nested loop** — a loop inside a loop; multiplies the work, the classic cause of slow code.
- **Cache** — a memory of past answers so we don't redo expensive work (here: AI answers).
- **Server Component / Server Action** — pages and functions that run on the server (fast, secure,
  and lighter for the browser).
- **Migration** — a script that sets up the database tables.
- **Hash / fingerprint** — a short code that uniquely represents some text; we use it to recognise
  identical code and reuse cached answers.

---

## 4 · Suggested live-demo script (2–3 minutes)

1. **Landing page** → point out the *real* sample analysis in the hero, and the green features.
2. **Sign in** with a demo account (`victor.ozuzu@greenprint.demo` / `greenprint`).
3. **Dashboard** → EcoScore trend, stats, badges, the green-engineering panel.
4. **Analyze** → load the "N+1 Database Query" example → click **Analyze code** → show the EcoScore
   (F/39), the O(n²) class, the 4 issues each with a greener fix, and the energy/CO₂ estimate.
5. Click **Explain this code** → show the AI (demo mode) explanation.
6. Click **PDF** → show the exported report.
7. **Leaderboard** → show the team competing; toggle **dark mode**.

---

_This app was designed and built by Group 3 for SOE 508, Federal University of Technology, Owerri._
