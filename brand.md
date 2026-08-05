# Greenprint - Brand & Design System

**Product:** Greenprint - a Sustainable AI Code Assistant Dashboard.
**One-liner:** _A green blueprint for your code._ Write software the planet can afford.
**Tone/voice:** Encouraging, sharp, a little playful. We coach, we don't scold. Every
problem comes with a fix. We celebrate progress (levels, streaks, badges).

## Palette (source of truth - mirrored in `globals.css`)

Light theme is the default and primary personality. Runtime light/dark toggle ships.

| Token | Light | Meaning |
|---|---|---|
| `background` | near-white, whisper of warmth | the canvas - always bright |
| `foreground` | warm near-black | text |
| `primary` | **orange (orange-600 ≈ #E85D0C)** | energy, action, CTAs - white text (AA) |
| `brand-bright` | **vivid orange ≈ #FF7A2E** | glows, gradients, highlights (decorative only) |
| `eco` | **emerald ≈ #1FB365** | sustainability signals: EcoScore, CO₂ saved, "greener" |
| `warn` | amber | medium-severity warnings |
| `destructive` | red | critical issues |

Rule of thumb: **orange = the app / energy / do-this. green = the planet payoff.**
Never flood the page with green - it's an accent that rewards good behaviour.

## Type
- **Display / headings:** Bricolage Grotesque (`font-heading` / `font-display`) - characterful, modern, non-generic.
- **UI / body:** Geist (`font-sans`).
- **Code / numbers:** JetBrains Mono (`font-mono`) - also used for metrics/stat values.

## Shape & feel
- Squircle radii (generous `--radius`), soft layered shadows, hairline borders.
- Micro-animations everywhere: count-ups, spring hovers, staggered entrances, a
  celebratory burst on level-up / high EcoScore. All respect `prefers-reduced-motion`.
- Loading = skeletons + shimmer, never a bare spinner where content will land.

## Gamification language
Levels are trees growing: **Seedling → Sapling → Sprout → Oak → Ancient Forest**.
Currency is **XP** (earned by analysing & improving code). Streaks are 🔥 days in a row.
Badges reward specific wins (e.g. "Loop Slayer", "N+1 Terminator", "Zero Waste").
