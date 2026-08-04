/**
 * Applies the generated SQL migrations (./drizzle) to the database using the
 * libSQL migrator. Idempotent — safe to run on every startup.
 */
import { migrate } from "drizzle-orm/libsql/migrator";
import { db } from "./index";

export async function runMigrations() {
  await migrate(db, { migrationsFolder: "drizzle" });
  console.log("✓ Database migrations applied");
}
