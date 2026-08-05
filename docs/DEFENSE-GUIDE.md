# Greenprint: Defense & Presentation Guide

**Read this before the presentation.** It explains the whole project in plain English, then gives **each of the 18 team members their own part to present and defend**.

> Important: the lecturer can ask *anyone* about *any* part. So learn your own section deeply, and skim everyone else's so you are never caught blank. Sections 0 and 1 are things *everyone* should be able to say.

_SOE 508 · Special Topics in Software Engineering · Group 3 · Federal University of Technology, Owerri._

> Reg numbers are intentionally kept out of this public repo. They are in the team's private defense document (a local .docx). This file has names and roles only.

---

## 0. The 30 second pitch (everyone memorises this)

> Greenprint is a Sustainable AI Code Assistant. You paste in code, and it gives it an EcoScore out of 100, like a health rating for how efficient and eco-friendly the code is. It finds wasteful patterns like nested loops or database calls inside loops, estimates how much time, electricity and CO2 that code would waste, and shows a greener fix for each problem. It can also explain the code and write documentation using AI. And it is gamified: you earn XP, badges and streaks, and compete on a team leaderboard. It runs fully offline, no API key needed, so everyone can install and run it easily.

**The problem we solve:** software runs on electricity, and electricity has a carbon footprint. Inefficient code wastes both. Most tools check if code works; Greenprint checks what it costs the planet, and teaches developers to write greener code.

---

## 1. The big picture, in plain English

Think of Greenprint as three layers stacked on top of each other:

1. **The face (what you see):** the website: the landing page, the dashboard, and the Analyze workspace where you paste code. Built with Next.js and React.
2. **The brain (the analysis engine):** a set of programs that read your code and figure out how efficient it is. This is 100% offline. It does not need the internet or any AI. It is the part that makes Greenprint a software engineering project, not just a pretty website.
3. **The memory (the database):** a local file that remembers your account, your past analyses, your XP and badges, and the leaderboard. Built with SQLite (a database in a single file).

On top of that, an optional AI helper (Claude) can explain code and write documentation. If there is no AI key it falls back to a built-in demo mode, so the app always works.

**What happens when you click Analyze code:** When you click Analyze code: detect the language, clean it (remove comments and strings), measure it (size, complexity, nesting), detect problems (21 rules), estimate energy and CO2, score it (EcoScore 0 to 100), save it and award XP and badges, then show the results with greener fixes.

---

## 2. Each member's part

### Ozuzu Victor Onyedikachi

**Role:** Team Lead & Project Overview

**Your part in one sentence:** you own the story: what Greenprint is, why we built it, and how the whole team's work fits together.

**What it does:** you introduce the project, present the problem (wasteful code means wasted energy means carbon), walk through the 9 requirements and the 6 green features, and run the live demo.

**How it works (plain English):**

- Greenprint ties together four parts: a web app, an offline analysis engine, a database, and an optional AI assistant.
- Every requirement in the brief is covered; you can point to the feature table in the README.
- Everyone on the team owns one clear piece (introduce them using this guide).

**The files you own:** README.md, src/lib/team.ts (the roster and everyone's role), and the overall demo flow.

**Be ready to answer:**

- *What does this project do?* Answer: give the 30 second pitch (Section 0).
- *How did you divide the work?* Answer: 18 members, one component each (show the Team page in the app).
- *Is it finished and running?* Answer: yes; demo it live: sign in, analyze, show the EcoScore, issues and greener fixes, then the dashboard and leaderboard.

### Nwakanma Dominion Chinonso

**Role:** Architecture & System Design

**Your part in one sentence:** how the whole system is put together and why we made those choices.

**What it does:** you explain the shape of the app: how the pieces (web pages, the engine, the database, the AI) talk to each other.

**How it works (plain English):**

- We used Next.js, a full-stack framework: the same project holds both the web pages and the server logic. No separate backend server to manage.
- Pages are mostly Server Components: they run on the server, fetch what they need, and send finished HTML to the browser. That is faster and lighter (a green choice).
- When you do something (like analyze code), the browser calls a Server Action, a secure function that runs on the server. Ours analyses the code, saves it, and updates your XP and badges, all in one trip.
- We kept the analysis engine separate and dependency-free so it can run anywhere and never needs the internet. This is the key architectural decision.

**The files you own:** the folder layout under src/app (pages) and src/lib (logic), src/lib/actions.ts (the server actions), src/lib/session.ts (who is logged in), and docs/ARCHITECTURE.md.

**Be ready to answer:**

- *Why Next.js?* Answer: one codebase for frontend and backend, fast Server Components, modern and current.
- *How does the browser get data from the server?* Answer: Server Components fetch on the server; user actions call Server Actions (secure server functions).
- *Why keep the engine separate?* Answer: so it is reusable, testable, offline, and lightweight.

### Okoye Victor Ebubechukwu

**Role:** Analysis Engine: Complexity Metrics

**Your part in one sentence:** the part that measures how big and how tangled a piece of code is.

**What it does:** counts lines of code, comments and blanks; measures cyclomatic complexity (how many decision paths the code has), how deeply nested it is, how long each function is, and a maintainability index (an overall health score for readability).

**How it works (plain English):**

- Cyclomatic complexity means how many different ways can this code branch. We count decision points (every if, for, while, case, and, or) and add 1. More branches means harder to test and more tangled.
- Nesting depth is how many layers deep the code goes (a loop inside a loop inside an if). Deep nesting usually hides expensive work.
- We measure on the cleaned code (comments and strings are already stripped by the preprocessing step), so the word for inside a comment is never counted as real code.

**The files you own:** src/lib/analysis/metrics.ts.

**Be ready to answer:**

- *What is cyclomatic complexity?* Answer: a count of the independent paths through the code; higher means more complex and harder to test.
- *How do you measure it without fully understanding the code?* Answer: we count decision keywords in the cleaned source. It is an approximation, deliberately lightweight so it is fast and needs no heavy tools.
- *What is the maintainability index?* Answer: a standard 0 to 100 score combining size, complexity and comments; higher means healthier code.

### Ezeh Chibuzor Nwabueze

**Role:** Analysis Engine: Inefficiency Rules

**Your part in one sentence:** the checklist of bad habits: the rules that actually find the wasteful patterns in code.

**What it does:** scans the cleaned code against a 21-rule catalogue and flags every match with a plain explanation of why it is bad and a greener alternative. Examples: nested loops (O(n²)), a database query inside a loop (the N+1 problem), SELECT star, building a string inside a loop, exponential recursion, logging inside a loop, and more.

**How it works (plain English):**

- Each rule is a small pattern-matcher. For example, the print inside a loop rule looks for a console.log or print that sits inside a loop.
- Some rules need context (is this line inside a loop?), so the engine first works out the loop nesting of every line, and the rules reuse that.
- The flagship rule, nested loops, is what powers the O(n²) detection: a loop inside another loop multiplies the work.
- Every rule carries its own message, severity (critical, high, medium, low) and the greener fix, so the same catalogue feeds the results screen, the reports, and the in-app How it works page.

**The files you own:** src/lib/analysis/rules.ts (the rule catalogue RULE_CATALOG).

**Be ready to answer:**

- *What is the N+1 problem?* Answer: running a database query once per loop iteration turns 1 query into N; batch it into a single query instead.
- *How does it detect nested loops?* Answer: it tracks how deeply loops are nested and flags any loop that sits inside another.
- *Could it be wrong sometimes?* Answer: yes, it is heuristic (pattern-based), which we chose so it stays fast and dependency-free. It can occasionally miss or over-flag; that trade-off is documented.

### Ozieme Paul Chimusom

**Role:** Analysis Engine: Preprocessing & Language Detection

**Your part in one sentence:** the part that prepares raw code for analysis and figures out what language it is.

**What it does:** detects the programming language, cleans the code before the rest of the engine reads it (removes comments and text strings so they are not mistaken for real code), and works out the loop-nesting depth of every line that the rules rely on.

**How it works (plain English):**

- Language detection: we use the uploaded file name, or clues in the code itself (keywords and syntax), to pick the language, so the rest of the engine knows what it is reading.
- Cleaning: comments and strings are stripped out first. Without this, the word for inside a comment, or the word SELECT inside a message, would be counted as real code. This cleaning step is shared by every other part of the engine.
- Nesting map: we compute how deeply each line sits inside loops and blocks, and hand that to the rules and the metrics (for example, is this database call inside a loop?).

**The files you own:** src/lib/analysis/preprocess.ts and src/lib/analysis/languages.ts.

**Be ready to answer:**

- *How do you know what language the code is?* Answer: from the file extension when it is uploaded, or from patterns in the code when it is pasted.
- *Why remove comments and strings first?* Answer: so the analyser does not count words that are not real code, like the word for inside a comment.
- *What does the rest of the engine get from you?* Answer: clean code plus a per-line nesting depth that the rules and metrics reuse.

### Onyemauche Ifeanyichukwu Victor

**Role:** Energy & CO₂ Estimation Model

**Your part in one sentence:** the part that turns this code is inefficient into actual numbers: estimated time, electricity, and carbon.

**What it does:** works out the code's Big-O complexity class (how the work grows as input grows: O(1), O(n), O(n²), O(2ⁿ)), then estimates the operations, runtime, energy (joules) and CO₂ (grams) it would use, plus how much CO₂ the greener fixes could save.

**How it works (plain English):**

- This is a MODEL, not a measurement. Say this clearly.
- We infer the complexity class from the loops and recursion (2 nested loops is about O(n²), exponential recursion is about O(2ⁿ), and so on).
- We imagine running it on a standard-sized input of N = 10,000 items.
- From the complexity class we estimate the number of operations, then convert with documented assumptions: about 100 million operations per second, a 15 watt active CPU core, and the world-average grid carbon intensity of 475 grams of CO₂ per kilowatt-hour.
- We show every one of these assumptions on the results screen. Nothing is hidden, and we never claim the numbers are measured. It is a teaching model that makes the cost tangible.

**The files you own:** src/lib/analysis/estimate.ts (the buildEnergyEstimate part and the model constants).

**Be ready to answer:**

- *Are these real measurements?* Answer: no, they are modelled estimates from documented assumptions. We say so on every result. The point is to compare and teach, not to be lab-accurate.
- *Where does 475 g/kWh come from?* Answer: it is the commonly cited global average grid carbon intensity.
- *Why N = 10,000?* Answer: a reasonable at-scale input so the difference between O(n) and O(n²) becomes visible.

### Obi Michael Chimaobi

**Role:** EcoScore & Scoring System

**Your part in one sentence:** how we turn all the findings into a single, fair score out of 100 with a letter grade.

**What it does:** computes the EcoScore (0 to 100), the grade (A+ to F), the rating (Excellent to Poor), and a separate quality score.

**How it works (plain English):**

- The score starts at 100 and is split into four parts that add up to 100.
- Algorithmic efficiency (30 points): lose points for expensive complexity classes (O(n²) costs more than O(n)).
- Green practices (40 points): lose points for each efficiency or energy issue, weighted by how serious it is (a critical issue costs more than a low one).
- Code quality (20 points): based on the maintainability index and quality issues.
- Complexity and nesting (10 points): lose points for very high complexity or deep nesting.
- Add the parts up, and map the total to a grade (95 and above is A+, below 50 is F).

**The files you own:** src/lib/analysis/estimate.ts (computeEcoScore, computeQualityScore).

**Be ready to answer:**

- *How is the EcoScore calculated?* Answer: start from 100 across four weighted parts; subtract points for a costly complexity class and for each issue by severity.
- *Why split into parts?* Answer: so the score is explainable and fair; you can see why you lost points, not just the number.
- *What is the difference between EcoScore and quality score?* Answer: EcoScore is mostly about efficiency and sustainability; the quality score is about readability and maintainability.

### Okafor Kosisochukwu JohnPaul

**Role:** Authentication & Security

**Your part in one sentence:** how users sign up and log in securely, and how we keep private pages private.

**What it does:** email and password sign-up and login, secure password storage, sessions that keep you logged in, and protection so only signed-in users can reach the dashboard and workspace.

**How it works (plain English):**

- We use Better Auth, a modern authentication library. When you sign up, your password is hashed (scrambled one-way) before it is stored. We never keep the real password.
- On login, a session is created and stored in a secure cookie in your browser, so you stay logged in as you move around.
- Every protected page checks is this person logged in first (requireUser). If not, it redirects to the login page. The same check guards our server actions.
- All the login and signup endpoints live under one address, /api/auth.

**The files you own:** src/lib/auth.ts (server config), src/lib/auth-client.ts (browser side), src/lib/session.ts (the who is logged in helpers), src/app/api/auth/[...all]/route.ts, and the login and signup pages.

**Be ready to answer:**

- *How are passwords stored?* Answer: hashed (one-way scrambled) by Better Auth, never in plain text.
- *How does the app know I am logged in?* Answer: a secure session cookie in the browser; the server checks it on each protected request.
- *How do you stop someone reaching the dashboard without logging in?* Answer: the protected layout runs requireUser, which redirects logged-out visitors to /login.

### Enyinnia Joseph Chidubem

**Role:** Database & Data Model

**Your part in one sentence:** where and how everything is stored, and how we get it back quickly.

**What it does:** stores users, sessions, every analysis, the game profile (XP, level, streak), earned badges, and the AI cache, all in a single local database file.

**How it works (plain English):**

- The database is SQLite, an entire database living in one file (greenprint.db). No server to install; that is why teammates can just run the app.
- We describe the tables in code using Drizzle (a type-safe database toolkit). The main tables are: user, session, account and verification (for login, used by Better Auth); game_profile (your XP, level, streak and totals); analysis (every analysis you run); user_badge (badges earned); ai_cache (saved AI answers so we never pay for the same request twice).
- On first run, the app creates the tables (migrations) and seeds demo data automatically.
- For speed and to be green, our list queries only fetch the columns they show, not the whole heavy code text.

**The files you own:** src/lib/db/ (schema, migrations, seed, setup) and src/lib/data.ts (the read queries).

**Be ready to answer:**

- *Why SQLite?* Answer: zero setup, one file, runs anywhere, perfect for a demo everyone must run.
- *What is a migration?* Answer: the script that creates or updates the database tables.
- *How is the database access optimized?* Answer: list views select only the columns they display, not the heavy ones, so less data is moved and less energy is used.

### Chukwuemeka-ogu Chinalurum Michael

**Role:** AI Layer: Claude Integration & Caching

**Your part in one sentence:** the smart assistant that explains code and writes documentation, and does it efficiently.

**What it does:** two AI features, Explain this code and Auto-document, powered by Anthropic Claude, with two green tricks: it caches answers and falls back to an offline demo mode.

**How it works (plain English):**

- When you ask for an explanation, we send the code to Claude and show its reply (rendered nicely as formatted text).
- Caching (the green part): before calling Claude, we make a short fingerprint (a hash) of the code. If we have explained that exact code before, we return the saved answer instantly, with no repeat AI call, which saves money and energy. This is a required green feature.
- Demo fallback: if there is no AI key, we still produce a genuinely useful explanation built from our own offline analysis, so the app always works for everyone.
- We default to a small, efficient model (Claude Haiku 4.5) because using the smallest capable model is itself a sustainability choice.

**The files you own:** src/lib/ai/index.ts.

**Be ready to answer:**

- *Does it need an API key?* Answer: no, without one it uses demo mode; a key just upgrades the two AI panels to live Claude.
- *How does caching save energy?* Answer: identical code is never sent to the AI twice; we reuse the stored answer.
- *Why the small model?* Answer: smaller model means less computation means less energy, and it is plenty for explaining code.

### Solomon Victoria-Imaobong Conleth

**Role:** History & Activity Feed

**Your part in one sentence:** the screen that keeps a record of every analysis you have run, so you can look back at your progress.

**What it does:** lists all your past analyses (most recent first) with their EcoScore and language, and lets you open any one to see the full saved report again.

**How it works (plain English):**

- Every time you analyse code, the result is saved to the database. The History page reads that list back and shows it as a feed.
- Each row shows the essentials (title, language, EcoScore, when it was run). Clicking a row opens the full stored report on its own page, exactly as it looked the day you ran it.
- For speed and to be green, the list only loads the small summary columns, not the heavy code text, until you open a specific item.

**The files you own:** src/app/(app)/history/ (the list) and src/app/(app)/history/[id]/ (a single saved report).

**Be ready to answer:**

- *Where does the history come from?* Answer: the database; every analysis is saved and this page reads them back.
- *Can you re-open an old analysis?* Answer: yes, click it and the full saved report opens.
- *How is it kept efficient?* Answer: the list only fetches summary columns, not the full code, until you open one.

### Ukwuoma Chiemerie Gerald

**Role:** Code Workspace & Editor

**Your part in one sentence:** the main screen where you paste, upload or pick code and press Analyze.

**What it does:** provides the code editor, a language picker, file upload, one-click examples, and shows the results and AI panels after analysis.

**How it works (plain English):**

- The editor is CodeMirror, the same kind of editor used in real coding tools, with syntax highlighting and line numbers.
- You can pick a language, upload a file (we auto-detect the language from the file name), or click a ready-made example like N+1 Database Query.
- When you press Analyze, the workspace calls the server, gets the full report back, shows a smooth loading animation, then the results: the EcoScore gauge, the metrics, and every issue with its greener fix. If you level up or earn a badge, a celebration pops up.

**The files you own:** src/components/app/workspace-client.tsx, code-editor.tsx, and analysis-results.tsx.

**Be ready to answer:**

- *What editor is that?* Answer: CodeMirror 6, a modern in-browser code editor.
- *What happens when I click Analyze?* Answer: it sends the code to a server action, which runs the engine, saves the result, updates your XP, and returns everything to display.
- *Can I analyse my own file?* Answer: yes, upload it; the language is detected from the file name.

### Alajemba Paul Uzochukwu

**Role:** Dashboard & Data Visualization

**Your part in one sentence:** the home screen that turns all your data into clear numbers and graphs.

**What it does:** shows your rank and level, XP progress, key stats (analyses, average EcoScore, CO₂ saved, issues found), an EcoScore trend chart over time, an average-score gauge, recent activity, your badges, and the green-engineering panel.

**How it works (plain English):**

- When the dashboard loads, it asks the database for your totals and recent analyses, then lays them out in cards.
- The trend chart (built with Recharts) plots your EcoScore over your last several analyses so you can see yourself improving.
- The numbers count up with a little animation, and the score gauges fill in, small touches that make the data feel alive.

**The files you own:** src/app/(app)/dashboard/page.tsx, src/components/greenprint/trend-chart.tsx, stat-tile.tsx, and eco-score-gauge.tsx.

**Be ready to answer:**

- *Where do the numbers come from?* Answer: from the database; every analysis you run is saved, and the dashboard adds them up.
- *What library draws the chart?* Answer: Recharts.
- *What does the average gauge show?* Answer: your average EcoScore across all analyses, colour-coded (green is good, red is poor).

### Okereke Clement Kalu

**Role:** Gamification: XP, Levels, Badges, Streaks

**Your part in one sentence:** the game layer that makes writing greener code fun and competitive.

**What it does:** awards XP for each analysis, turns XP into levels with tree-themed ranks (Seedling, Sprout, Sapling, up to Ancient Forest), tracks daily streaks, unlocks 12 badges, and ranks everyone on the team leaderboard.

**How it works (plain English):**

- Each analysis earns XP: a base amount, plus a bonus for a high EcoScore, plus a bit for each issue you surfaced, plus a first-of-the-day bonus.
- XP adds up to a level on a curve (early levels are quick; later ones take more). Each level band has a rank name and a little tree emoji.
- Streaks: analyse on consecutive days and your streak grows; miss a day and it resets.
- Badges are specific achievements, for example N+1 Terminator (you caught a query in a loop), Loop Slayer, Week Warrior (7-day streak). We check the conditions after every analysis.
- The leaderboard sorts everyone by XP.

**The files you own:** src/lib/game/ (levels.ts, xp.ts, badges.ts) and the leaderboard page.

**Be ready to answer:**

- *How is XP earned?* Answer: base, plus EcoScore bonus, plus issues surfaced, plus a daily bonus.
- *What are the ranks?* Answer: tree-growth stages from Seedling to Ancient Forest, tied to your level.
- *How do badges work?* Answer: each has a condition (for example reach a 7-day streak); we check them after each analysis and award any newly earned.

### Ikeh-ezeji Pamela Chinaza

**Role:** UI/UX & Design System

**Your part in one sentence:** the look and feel: the colours, fonts, animations, and the reusable building blocks that keep every screen consistent.

**What it does:** defines the brand (a clean white background with a bright orange for action and green for the eco and sustainability parts), the fonts, the light and dark mode, the motion and micro-animations, and a library of shared components everyone else builds with.

**How it works (plain English):**

- All the colours, spacing and radii are defined once as design tokens in one stylesheet, so the whole app stays consistent and can switch light and dark instantly.
- We chose distinctive fonts (Hanken Grotesque for headings and body, JetBrains Mono for the metric numbers) to avoid the generic AI website look.
- Motion: numbers count up, cards lift on hover, results fade in, and there is a confetti celebration when you level up, all built with the Motion library, and all respecting reduce-motion settings for accessibility.
- The reusable components (score gauge, badges, stat tiles, buttons) mean every page looks like part of the same product.

**The files you own:** src/app/globals.css (the design tokens), brand.md (the brand spec), and src/components/greenprint/ (the shared components).

**Be ready to answer:**

- *Why orange and green?* Answer: orange is energy and action, green is the planet and the sustainability payoff; on a clean white base it looks modern and distinctive.
- *How does dark mode work?* Answer: we define two sets of colour tokens; a toggle switches between them instantly.
- *How did you make it feel polished?* Answer: consistent tokens, characterful fonts, and purposeful micro-animations (count-ups, hovers, a level-up celebration).

### Onyeukwu Light Onyeyirichi

**Role:** Testing, QA & Documentation

**Your part in one sentence:** the part that checks the engine actually works, and keeps the project documented.

**What it does:** runs the analysis engine against known sample code to confirm the results are correct (the smoke test), and maintains the written documentation the team defends from.

**How it works (plain English):**

- Smoke test: we run the engine on prepared code snippets (like an N+1 query example) and confirm it detects the expected issues and produces a sensible EcoScore. If a change ever breaks the engine, this catches it. Run it with npm run smoke.
- Documentation: the docs folder (architecture, roadmap, this guide, the project brief) and the in-app Docs page keep the project explainable, which matters for a final-year project.
- Quality: we keep the tooling current and the build clean (type-checks and lint pass) so the app is stable for everyone to run.

**The files you own:** scripts/smoke-analysis.ts (npm run smoke) and the docs/ folder.

**Be ready to answer:**

- *How do you know the engine is correct?* Answer: the smoke test runs it on known examples and checks the output.
- *What is a smoke test?* Answer: a quick sanity check that the core still works after changes.
- *Where is the project documented?* Answer: the docs folder and the in-app Docs page.

### Joseph Ayo Isaac

**Role:** Reports & Export (PDF / CSV)

**Your part in one sentence:** the buttons that turn an analysis into a shareable report.

**What it does:** exports any analysis as a professional PDF or a CSV spreadsheet, covering the EcoScore, all the metrics, the energy estimate, and every issue with its fix.

**How it works (plain English):**

- PDF: we build the document in the browser using jsPDF, with an orange header, the EcoScore, a summary of the metrics and energy estimate, and a list of every issue with its greener fix. It handles page breaks so long reports stay tidy. Click PDF and it downloads.
- CSV: we assemble the same data as rows of a spreadsheet (metric, value, then a table of issues) and download it, handy for opening in Excel or Google Sheets.
- Both run entirely in the browser, so no server round-trip is needed to make the file.

**The files you own:** src/components/app/export-buttons.tsx.

**Be ready to answer:**

- *What is in the PDF?* Answer: the EcoScore and grade, the metrics, the modelled energy and CO₂, and every issue with its suggested fix.
- *Which library makes the PDF?* Answer: jsPDF, in the browser.
- *Why also CSV?* Answer: so the data can be opened in a spreadsheet and analysed further.

### Nwali Izuchukwu Hosea

**Role:** Landing Page, Green Features & Deployment

**Your part in one sentence:** the front door of the app, the sustainability story, and how we run and ship it.

**What it does:** the public landing page that markets Greenprint, the explanation of the 6 green features (and proof they are real), and the steps to run and deploy the app.

**How it works (plain English):**

- The landing page is the first thing a visitor sees: a bold headline, a live sample analysis as the hero image, the feature list, the green by design section, and calls to action to sign up. It runs a real analysis to build its hero card; nothing is faked.
- The 6 green features are genuine, not slogans: (1) resource-intensive code detection flags the exact costly lines; (2) algorithmic optimization advice suggests a better approach, O(n²) toward O(n); (3) efficient AI caching serves repeat requests from cache; (4) optimized database access fetches only what is shown; (5) lightweight architecture, the engine has zero external dependencies and runs offline; (6) execution-time and resource measurement shows the real analysis time and the modelled runtime of your code.
- Running and deploying: locally it is one command (npm run dev, which sets up the database on first run). For the web it is deployed to Vercel with a hosted Turso database; the local build still uses the offline SQLite file, so teammates run it with zero setup.

**The files you own:** src/app/page.tsx (landing) and the deployment and run notes in the README.

**Be ready to answer:**

- *Are the green features real or just marketing?* Answer: real; point to each one in the running app (the cache counter on the dashboard, the select-only-needed-columns queries, the offline engine).
- *How do we run it?* Answer: npm install then npm run dev; it sets itself up on first run.
- *How did you deploy it?* Answer: pushed to Vercel (auto-deploys from GitHub main); the local SQLite file swaps for a hosted Turso database in production with no code change.

---

## 3. Plain-English glossary (for everyone)

- **EcoScore.** Greenprint's 0 to 100 rating of how efficient and eco-friendly the code is (like a health score). Higher is greener.
- **Big-O (for example O(n²)).** a way to describe how the work grows as the input grows. O(n) grows in a straight line; O(n²) grows much faster; O(2ⁿ) explodes. Lower is greener.
- **Cyclomatic complexity.** a count of how many different paths the code can take. Higher means more tangled and harder to test.
- **N+1 problem.** asking the database once per item in a loop instead of once for all items. Very wasteful; a top thing to fix.
- **Nested loop.** a loop inside a loop; it multiplies the work, the classic cause of slow code.
- **Cache.** a memory of past answers so we do not redo expensive work (here: AI answers).
- **Server Component / Server Action.** pages and functions that run on the server (fast, secure, and lighter for the browser).
- **Migration.** a script that sets up the database tables.
- **Hash / fingerprint.** a short code that uniquely represents some text; we use it to recognise identical code and reuse cached answers.

---

## 4. Suggested live-demo script (2 to 3 minutes)

1. Landing page: point out the real sample analysis in the hero, and the green features.
2. Sign in with a demo account (victor.ozuzu@greenprint.demo, password greenprint).
3. Dashboard: EcoScore trend, stats, badges, the green-engineering panel.
4. Analyze: load the N+1 Database Query example, click Analyze code, show the EcoScore (F, 39), the O(n²) class, the 4 issues each with a greener fix, and the energy and CO₂ estimate.
5. Click Explain this code: show the AI explanation.
6. Click PDF: show the exported report.
7. Leaderboard: show the team competing; toggle dark mode.

---

_This app was designed and built by Group 3 for SOE 508, Federal University of Technology, Owerri._
