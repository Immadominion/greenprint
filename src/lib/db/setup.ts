/**
 * One-command project setup. Run automatically by `npm run dev`:
 *   1. ensure a `.env` exists (creates one with a fresh secret if missing)
 *   2. apply database migrations
 *   3. seed demo data if the database is empty
 *
 * This is why a teammate can clone the repo and just run `npm run dev` — no
 * manual database or environment steps.
 */
import { config } from "dotenv";
import { existsSync, writeFileSync, unlinkSync } from "node:fs";
import { randomBytes } from "node:crypto";

/** `--reset` deletes the local SQLite file for a clean reseed (cross-platform). */
function maybeReset() {
  if (!process.argv.includes("--reset")) return;
  for (const f of ["greenprint.db", "greenprint.db-shm", "greenprint.db-wal"]) {
    if (existsSync(f)) {
      unlinkSync(f);
      console.log("• removed", f);
    }
  }
}

function ensureEnv() {
  if (!existsSync(".env")) {
    const secret = randomBytes(32).toString("hex");
    const content = [
      "DATABASE_URL=file:greenprint.db",
      "BETTER_AUTH_URL=http://localhost:3000",
      `BETTER_AUTH_SECRET=${secret}`,
      "NEXT_PUBLIC_APP_URL=http://localhost:3000",
      "ANTHROPIC_MODEL=claude-haiku-4-5-20251001",
      "",
    ].join("\n");
    writeFileSync(".env", content);
    console.log("✓ Created .env with a fresh secret");
  }
  config();
  process.env.DATABASE_URL ??= "file:greenprint.db";
  process.env.BETTER_AUTH_SECRET ??= randomBytes(32).toString("hex");
  process.env.BETTER_AUTH_URL ??= "http://localhost:3000";
}

async function main() {
  ensureEnv();
  maybeReset();
  // Dynamic imports so the DB client reads env AFTER we have loaded it.
  const { runMigrations } = await import("./migrate");
  const { runSeed } = await import("./seed");
  await runMigrations();
  await runSeed();
  console.log("✓ Setup complete");
  process.exit(0);
}

main().catch((err) => {
  console.error("Setup failed:", err);
  process.exit(1);
});
