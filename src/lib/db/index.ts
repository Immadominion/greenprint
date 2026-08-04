/**
 * Greenprint · Database client (Drizzle + libSQL)
 * ----------------------------------------------
 * A single libSQL client pointed at a local file by default. libSQL ships
 * pre-built binaries for every common OS, so `npm install` "just works" with no
 * native compilation step — important because ~15 teammates must run this.
 *
 * Set DATABASE_URL to a Turso URL (libsql://…) to run against the cloud instead.
 */
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

const url = process.env.DATABASE_URL ?? "file:greenprint.db";
const authToken = process.env.DATABASE_AUTH_TOKEN;

export const client = createClient({ url, authToken });
export const db = drizzle(client, { schema });

export { schema };
