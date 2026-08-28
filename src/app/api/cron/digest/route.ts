import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { digestMessage, sendEmail } from "@/lib/email";
import { listPacks, summarize } from "@/lib/packs";

export const dynamic = "force-dynamic";

/**
 * Daily digest: emails each opted-in trainer the list of clients who need a
 * renewal message. Silent for anyone with an empty queue — an email that says
 * "nothing to do" trains people to ignore the next one.
 *
 * Schedule externally (Vercel Cron, fly machines, cron + curl) with:
 *   Authorization: Bearer $CRON_SECRET
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET is not configured" }, { status: 503 });
  }
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const recipients = await db.select().from(users).where(eq(users.dailyDigest, true));

  let sent = 0;
  let skipped = 0;
  const failures: string[] = [];

  for (const user of recipients) {
    const views = await listPacks(user.id, user.lowThreshold, { onlyActive: true });
    const { needsNudge } = summarize(views);

    if (needsNudge.length === 0) {
      skipped++;
      continue;
    }

    const { subject, text } = digestMessage(needsNudge, user);
    const result = await sendEmail({ to: user.email, subject, text });

    if (result.ok) sent++;
    else failures.push(`${user.email}: ${result.error}`);
  }

  return NextResponse.json({
    recipients: recipients.length,
    sent,
    skipped,
    failures,
  });
}
