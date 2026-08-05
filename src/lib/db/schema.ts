/**
 * Greenprint · Database schema (Drizzle ORM + libSQL/SQLite)
 * ---------------------------------------------------------
 * Two groups of tables:
 *   1. Auth tables required by Better Auth  (user, session, account, verification)
 *   2. Greenprint app tables                (gameProfile, analysis, userBadge, aiCache)
 *
 * SQLite keeps the whole app zero-config: the database is a single local file
 * (`greenprint.db`) created on first run - nothing to install or provision.
 */
import { sql } from "drizzle-orm";
import { integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

const uuid = () => crypto.randomUUID();

// ------------------------------------------------------------------ auth tables
export const user = sqliteTable("user", {
  id: text("id").primaryKey().$defaultFn(uuid),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("emailVerified", { mode: "boolean" }).notNull().default(false),
  image: text("image"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey().$defaultFn(uuid),
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey().$defaultFn(uuid),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: integer("accessTokenExpiresAt", { mode: "timestamp" }),
  refreshTokenExpiresAt: integer("refreshTokenExpiresAt", { mode: "timestamp" }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey().$defaultFn(uuid),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ------------------------------------------------------------- greenprint tables

/** One row per user: the gamification state (XP, level, streaks, lifetime totals). */
export const gameProfile = sqliteTable("game_profile", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  displayName: text("display_name"),
  regNumber: text("reg_number"),
  xp: integer("xp").notNull().default(0),
  level: integer("level").notNull().default(1),
  streakCount: integer("streak_count").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  lastActiveDate: text("last_active_date"), // YYYY-MM-DD (local day)
  totalAnalyses: integer("total_analyses").notNull().default(0),
  totalIssuesFixed: integer("total_issues_fixed").notNull().default(0),
  totalCo2SavedGrams: real("total_co2_saved_grams").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

/** History of every analysis run (also powers the dashboard trend charts & reports). */
export const analysis = sqliteTable("analysis", {
  id: text("id").primaryKey().$defaultFn(uuid),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title"),
  filename: text("filename"),
  language: text("language").notNull(),
  code: text("code").notNull(),
  ecoScore: integer("eco_score").notNull(),
  grade: text("grade").notNull(),
  qualityScore: integer("quality_score").notNull(),
  complexityClass: text("complexity_class").notNull(),
  issueCount: integer("issue_count").notNull().default(0),
  criticalCount: integer("critical_count").notNull().default(0),
  co2Grams: real("co2_grams").notNull().default(0),
  co2SavingGrams: real("co2_saving_grams").notNull().default(0),
  xpAwarded: integer("xp_awarded").notNull().default(0),
  report: text("report").notNull(), // full AnalysisReport JSON
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

/** Which badges a user has earned. Badge definitions live in code (game/badges.ts). */
export const userBadge = sqliteTable(
  "user_badge",
  {
    id: text("id").primaryKey().$defaultFn(uuid),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    badgeId: text("badge_id").notNull(),
    earnedAt: integer("earned_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  },
  (t) => [uniqueIndex("user_badge_unique").on(t.userId, t.badgeId)],
);

/**
 * Cache of AI results keyed by (kind + code hash). Implements the green
 * requirement "efficient caching to reduce repeated AI requests": identical code
 * never pays for the same Claude call twice.
 */
export const aiCache = sqliteTable("ai_cache", {
  id: text("id").primaryKey(), // `${kind}:${hash}`
  kind: text("kind").notNull(), // "explain" | "document"
  hash: text("hash").notNull(),
  language: text("language"),
  content: text("content").notNull(),
  model: text("model"),
  source: text("source").notNull().default("ai"), // "ai" | "demo"
  hits: integer("hits").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type User = typeof user.$inferSelect;
export type GameProfile = typeof gameProfile.$inferSelect;
export type Analysis = typeof analysis.$inferSelect;
export type UserBadge = typeof userBadge.$inferSelect;

// touch `sql` import so tree-shakers keep it available for future raw defaults
void sql;
