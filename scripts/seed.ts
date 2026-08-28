/**
 * Demo data: `npx tsx scripts/seed.ts`
 * Creates a trainer with clients spanning every pack health state.
 * Login: demo@sessionpack.app / demo1234
 */
import "dotenv/config";

import bcrypt from "bcryptjs";
import Database from "better-sqlite3";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";

import * as schema from "../src/db/schema";
import { clients, packs, sessions, users } from "../src/db/schema";

const sqlite = new Database(process.env.DATABASE_URL ?? "sessionpack.db");
sqlite.pragma("foreign_keys = ON");
const db = drizzle(sqlite, { schema });

const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000);

async function main() {
  const email = "demo@sessionpack.app";

  // Idempotent: cascade wipes the demo user's clients, packs and sessions.
  await db.delete(users).where(eq(users.email, email));

  const [trainer] = await db
    .insert(users)
    .values({
      email,
      name: "Alex Rivera",
      businessName: "Northside Strength",
      passwordHash: await bcrypt.hash("demo1234", 12),
      lowThreshold: 2,
    })
    .returning();

  const roster = [
    // name, email, packSize, sessionsUsed, label, expiresInDays
    ["Priya Sharma", "priya@example.com", 10, 9, "10-session PT block", null],
    ["Marcus Webb", "marcus@example.com", 8, 8, "8-session block", null],
    ["Dani Okafor", "dani@example.com", 12, 6, "12-week programme", 45],
    ["Yuki Tanaka", "yuki@example.com", 5, 4, "Intro 5-pack", 10],
    ["Sam Ellis", null, 10, 9, "10-session block", null], // no email → can't nudge
    ["Rosa Delgado", "rosa@example.com", 20, 3, "20-session block", 120],
  ] as const;

  for (const [name, clientEmail, total, used, label, expiresIn] of roster) {
    const [client] = await db
      .insert(clients)
      .values({ userId: trainer.id, name, email: clientEmail })
      .returning();

    const [pack] = await db
      .insert(packs)
      .values({
        userId: trainer.id,
        clientId: client.id,
        label,
        totalSessions: total,
        priceMinor: total * 5000,
        purchasedAt: daysAgo(used * 7 + 7),
        expiresAt: expiresIn === null ? null : new Date(Date.now() + expiresIn * 86_400_000),
      })
      .returning();

    // Weekly cadence, most recent session last week.
    for (let i = 0; i < used; i++) {
      await db.insert(sessions).values({
        userId: trainer.id,
        packId: pack.id,
        occurredAt: daysAgo((used - i) * 7),
      });
    }
  }

  console.log(`Seeded ${roster.length} clients for ${email} (password: demo1234)`);
}

main();
