import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

const now = sql`(unixepoch())`;

/** The trainer / teacher. One user == one small business. */
export const users = sqliteTable(
  "users",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    name: text("name").notNull(),
    businessName: text("business_name"),
    /** Packs at or below this many sessions are "nearly out". */
    lowThreshold: integer("low_threshold").notNull().default(2),
    /** Opt-in to the daily digest of who needs a renewal message. */
    dailyDigest: integer("daily_digest", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(now),
  },
  (t) => [uniqueIndex("users_email_idx").on(t.email)],
);

export const clients = sqliteTable(
  "clients",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    email: text("email"),
    phone: text("phone"),
    notes: text("notes"),
    /** Soft delete — keeps history intact for past packs. */
    archivedAt: integer("archived_at", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(now),
  },
  (t) => [index("clients_user_idx").on(t.userId)],
);

/** A block of prepaid sessions. Remaining is always derived from the ledger. */
export const packs = sqliteTable(
  "packs",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    clientId: integer("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    label: text("label"),
    totalSessions: integer("total_sessions").notNull(),
    /** Minor units (paise / cents) to avoid float money. Nullable — price is optional. */
    priceMinor: integer("price_minor"),
    currency: text("currency").notNull().default("USD"),
    purchasedAt: integer("purchased_at", { mode: "timestamp" }).notNull().default(now),
    expiresAt: integer("expires_at", { mode: "timestamp" }),
    /** "active" | "closed" — closed hides it from the dashboard regardless of remaining. */
    status: text("status").notNull().default("active"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(now),
  },
  (t) => [index("packs_user_idx").on(t.userId), index("packs_client_idx").on(t.clientId)],
);

/** One row per session actually delivered. The single source of truth for usage. */
export const sessions = sqliteTable(
  "sessions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    packId: integer("pack_id")
      .notNull()
      .references(() => packs.id, { onDelete: "cascade" }),
    occurredAt: integer("occurred_at", { mode: "timestamp" }).notNull().default(now),
    note: text("note"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(now),
  },
  (t) => [index("sessions_pack_idx").on(t.packId), index("sessions_user_idx").on(t.userId)],
);

/** Audit trail of renewal nudges, so we never spam the same client twice. */
export const nudges = sqliteTable(
  "nudges",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    clientId: integer("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    packId: integer("pack_id")
      .notNull()
      .references(() => packs.id, { onDelete: "cascade" }),
    /** Sessions left at the moment we sent — lets us re-nudge when it drops further. */
    remainingAtSend: integer("remaining_at_send").notNull(),
    channel: text("channel").notNull().default("email"),
    toEmail: text("to_email").notNull(),
    subject: text("subject").notNull(),
    body: text("body").notNull(),
    /** "sent" | "failed" */
    status: text("status").notNull().default("sent"),
    error: text("error"),
    sentAt: integer("sent_at", { mode: "timestamp" }).notNull().default(now),
  },
  (t) => [index("nudges_pack_idx").on(t.packId), index("nudges_user_idx").on(t.userId)],
);

export type User = typeof users.$inferSelect;
export type Client = typeof clients.$inferSelect;
export type Pack = typeof packs.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type Nudge = typeof nudges.$inferSelect;
