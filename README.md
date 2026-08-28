# SessionPack

Prepaid session tracking and renewal nudges for independent personal trainers,
yoga teachers, music teachers and similar solo service professionals.

It answers three questions and deliberately nothing else:

1. **How many sessions does this client have left?**
2. **Who is nearly out?**
3. **Who needs a renewal message today?**

$9/month. No booking, no payments, no marketing suite.

## Running it

```bash
npm install
cp .env.example .env      # then fill in AUTH_SECRET (openssl rand -base64 32)
npm run db:migrate
npm run dev
```

Optional demo data — a trainer with clients in every pack state:

```bash
npm run seed              # demo@sessionpack.app / demo1234
```

## How it works

Everything keys off a **session ledger**. `sessions` holds one row per session
actually delivered, and `remaining` is always derived as
`pack.totalSessions - count(sessions)`. There is no counter column to drift out
of sync, so "undo last" and "remove from history" are just row deletes.

A pack's **health** is one of three states, and it drives every colour in the UI:

| health | meaning                            |
| ------ | ---------------------------------- |
| `ok`   | above the user's warning threshold |
| `low`  | at or below it — "nearly out"      |
| `out`  | no sessions left                   |

**Nudges fire once per level.** After emailing a client at 2 sessions left,
SessionPack stays quiet until the count drops to 1, then 0 — so nobody gets the
same message twice for the same pack state. Failed sends are recorded but don't
suppress a retry, since only `status = "sent"` rows count.

Renewal emails are written in the trainer's voice, sent with their address as
`reply-to`, and always editable before they go out.

### Layout

```
src/db/schema.ts      users, clients, packs, sessions, nudges
src/lib/packs.ts      the domain core — remaining, health, who needs a nudge
src/lib/actions.ts    all mutations as server actions, each re-checking ownership
src/lib/email.ts      Resend transport + the message templates
src/lib/auth.ts       bcrypt + signed-cookie sessions via jose
src/app/              / and /pricing public, /app/* gated
```

## Email

Renewal messages and the daily digest go out through [Resend](https://resend.com).
**Without `RESEND_API_KEY` the app still runs** — sends are logged to the console
and recorded as failed rather than throwing, so you can develop the whole flow
without credentials.

The daily digest is a plain GET endpoint, so any scheduler works:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://your-host/api/cron/digest
```

It emails each opted-in trainer the list of clients needing a renewal message,
and stays silent for anyone whose queue is empty.

## Storage

SQLite via better-sqlite3, which is plenty for the per-trainer data volume here.
The Drizzle schema is written to port to Postgres when that stops being true —
change the dialect in `drizzle.config.ts` and the driver in `src/db/index.ts`.

## Not built yet

Stripe billing. Every account is on free early access, and `/app/settings` says
so. The `$9/month` on the marketing pages is the intended price, not a live
charge.
