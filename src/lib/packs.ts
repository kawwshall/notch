import "server-only";

import { and, asc, count, desc, eq, isNull, max, sql } from "drizzle-orm";

import { db } from "@/db";
import { clients, nudges, packs, sessions, type Client, type Pack } from "@/db/schema";

/** How close to empty a pack is. Drives every colour and sort order in the UI. */
export type PackHealth = "out" | "low" | "ok";

export type PackView = {
  pack: Pack;
  client: Client;
  used: number;
  remaining: number;
  health: PackHealth;
  /** Null when the pack has no expiry date. Negative means already expired. */
  expiresInDays: number | null;
  /** Sessions remaining the last time we emailed this client about this pack. */
  lastNudgeRemaining: number | null;
  lastNudgeAt: Date | null;
  /** True when a renewal message is warranted and not already sent at this level. */
  needsNudge: boolean;
};

export function healthOf(remaining: number, lowThreshold: number): PackHealth {
  if (remaining <= 0) return "out";
  if (remaining <= lowThreshold) return "low";
  return "ok";
}

function daysUntil(date: Date | null): number | null {
  if (!date) return null;
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - startOfToday.getTime()) / 86_400_000);
}

/**
 * We nudge once per "level" of remaining sessions. After emailing at 2 left we
 * stay quiet until it drops to 1, then 0 — so a client never gets the same
 * message twice for the same pack state.
 */
function shouldNudge(args: {
  remaining: number;
  lowThreshold: number;
  clientEmail: string | null;
  packStatus: string;
  lastNudgeRemaining: number | null;
}): boolean {
  const { remaining, lowThreshold, clientEmail, packStatus, lastNudgeRemaining } = args;
  if (packStatus !== "active") return false;
  if (!clientEmail) return false;
  if (remaining > lowThreshold) return false;
  if (lastNudgeRemaining === null) return true;
  return remaining < lastNudgeRemaining;
}

const usedSubquery = db
  .select({
    packId: sessions.packId,
    used: count(sessions.id).as("used"),
  })
  .from(sessions)
  .groupBy(sessions.packId)
  .as("used_counts");

const lastNudgeSubquery = db
  .select({
    packId: nudges.packId,
    // Latest send wins; remainingAtSend is monotonically decreasing per pack.
    lastRemaining: sql<number>`min(${nudges.remainingAtSend})`.as("last_remaining"),
    lastSentAt: max(nudges.sentAt).as("last_sent_at"),
  })
  .from(nudges)
  .where(eq(nudges.status, "sent"))
  .groupBy(nudges.packId)
  .as("last_nudges");

/**
 * Every pack for a user, newest first, with usage and nudge state resolved in
 * one query. `onlyActive` hides packs the trainer has manually closed.
 */
export async function listPacks(
  userId: number,
  lowThreshold: number,
  opts: { onlyActive?: boolean; clientId?: number } = {},
): Promise<PackView[]> {
  const filters = [eq(packs.userId, userId), isNull(clients.archivedAt)];
  if (opts.onlyActive) filters.push(eq(packs.status, "active"));
  if (opts.clientId !== undefined) filters.push(eq(packs.clientId, opts.clientId));

  const rows = await db
    .select({
      pack: packs,
      client: clients,
      used: usedSubquery.used,
      lastRemaining: lastNudgeSubquery.lastRemaining,
      lastSentAt: lastNudgeSubquery.lastSentAt,
    })
    .from(packs)
    .innerJoin(clients, eq(clients.id, packs.clientId))
    .leftJoin(usedSubquery, eq(usedSubquery.packId, packs.id))
    .leftJoin(lastNudgeSubquery, eq(lastNudgeSubquery.packId, packs.id))
    .where(and(...filters))
    .orderBy(desc(packs.purchasedAt), desc(packs.id));

  return rows.map(({ pack, client, used, lastRemaining, lastSentAt }) => {
    const usedCount = used ?? 0;
    const remaining = pack.totalSessions - usedCount;
    const lastNudgeRemaining = lastRemaining ?? null;

    return {
      pack,
      client,
      used: usedCount,
      remaining,
      health: healthOf(remaining, lowThreshold),
      expiresInDays: daysUntil(pack.expiresAt),
      lastNudgeRemaining,
      lastNudgeAt: lastSentAt ? new Date(lastSentAt) : null,
      needsNudge: shouldNudge({
        remaining,
        lowThreshold,
        clientEmail: client.email,
        packStatus: pack.status,
        lastNudgeRemaining,
      }),
    };
  });
}

export async function getPackView(
  userId: number,
  packId: number,
  lowThreshold: number,
): Promise<PackView | null> {
  const all = await listPacks(userId, lowThreshold);
  return all.find((p) => p.pack.id === packId) ?? null;
}

/** The three dashboard numbers, plus the buckets the UI renders. */
export function summarize(views: PackView[]) {
  const active = views.filter((v) => v.pack.status === "active");
  return {
    needsNudge: active.filter((v) => v.needsNudge),
    runningLow: active.filter((v) => v.health === "low"),
    out: active.filter((v) => v.health === "out"),
    healthy: active.filter((v) => v.health === "ok"),
    sessionsOutstanding: active.reduce((sum, v) => sum + Math.max(0, v.remaining), 0),
  };
}

export async function listClientsWithTotals(userId: number, lowThreshold: number) {
  const views = await listPacks(userId, lowThreshold);
  const rows = await db
    .select()
    .from(clients)
    .where(and(eq(clients.userId, userId), isNull(clients.archivedAt)))
    .orderBy(asc(clients.name));

  return rows.map((client) => {
    const mine = views.filter((v) => v.client.id === client.id && v.pack.status === "active");
    const remaining = mine.reduce((sum, v) => sum + Math.max(0, v.remaining), 0);
    return {
      client,
      activePacks: mine.length,
      remaining,
      health: mine.length ? healthOf(remaining, lowThreshold) : ("ok" as PackHealth),
      needsNudge: mine.some((v) => v.needsNudge),
    };
  });
}

/** Recent session log across all packs — the "what did I do this week" view. */
export async function recentSessions(userId: number, limit = 20) {
  return db
    .select({ session: sessions, pack: packs, client: clients })
    .from(sessions)
    .innerJoin(packs, eq(packs.id, sessions.packId))
    .innerJoin(clients, eq(clients.id, packs.clientId))
    .where(eq(sessions.userId, userId))
    .orderBy(desc(sessions.occurredAt), desc(sessions.id))
    .limit(limit);
}
