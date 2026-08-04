import { defineConfig } from "drizzle-kit";

/**
 * `drizzle-kit generate` reads this to emit SQL migrations into ./drizzle from the
 * schema. It does NOT need a live database connection to generate, which keeps the
 * setup portable. Migrations are applied at runtime by src/lib/db/migrate.ts.
 */
export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "file:greenprint.db",
  },
  verbose: true,
  strict: true,
});
