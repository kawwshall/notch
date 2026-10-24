# Notch

Live: https://notch.beingkaushal01.workers.dev/

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
# Create .dev.vars with AUTH_SECRET set to a random string of at least 32 characters
npm run db:migrate:local
npm run dev
```

Optional demo data — a trainer with clients in every pack state:

```bash
npm run seed              # demo@notch.app / demo1234
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
Notch stays quiet until the count drops to 1, then 0 — so nobody gets the
same message twice for the same pack state. Failed sends are recorded but don't
suppress a retry, since only `status = "sent"` rows count.

Renewal emails are written in the trainer's voice, sent with their address as
`reply-to`, and always editable before they go out.

## Design system — "Coach's Ledger"

A notch is a mark cut to count something, so the tally mark is the product's
primary information device rather than a decoration. Three rules hold it
together, and they're worth keeping if you extend the UI:

1. **Ink is the brand.** Primary buttons, the wordmark and focus rings are all
   near-black. Saturated colour is reserved *entirely* for the three pack
   states — if something is coloured, it is telling you something.
2. **Rules, not shadows.** Surfaces are separated by hairlines like a ledger
   page. No drop shadows, no pill corners (`--radius-ledger` is 3px).
3. **Numerals are typeset.** The sessions-left count is the most important
   thing on any screen: large, tabular, in Erode, never competing with a
   coloured button.

Type is **Erode** (display and numerals) with **Switzer** (UI), self-hosted
from Fontshare under the ITF Free Font License. Both are deliberate choices
against the Inter / Instrument-Serif-on-off-white default that most generated
interfaces land on. The licence forbids subsetting, so `next/font/local` serves
the variable files whole — don't add a subsetting step.

`TallyMarks` draws used and remaining as two *separate* well-formed tallies
rather than one run that changes colour partway. Pack sizes are nearly always
multiples of five, so a single run renders the common "one session left" state
as a lone diagonal — the least legible mark in the set.

> **If this repo goes public**, remove `src/fonts/*.woff2` from version control.
> The ITF licence permits self-hosting for your own site but not redistribution,
> and a public repo arguably counts. Fetch them at build time instead.

### Layout

```
src/db/schema.ts      users, clients, packs, sessions, nudges
src/lib/packs.ts      the domain core — remaining, health, who needs a nudge
src/lib/actions.ts    all mutations as server actions, each re-checking ownership
src/lib/email.ts      Resend transport + the message templates
src/lib/auth.ts       bcrypt + signed-cookie sessions via jose
src/components/tally.tsx  the tally device + the headline session count
src/app/globals.css   design tokens and the component layer
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

Cloudflare D1 stores application data persistently in production. Local development uses Wrangler’s local D1 simulation. Drizzle uses the same SQLite schema in both environments; database bindings are resolved per request.

## Not built yet

Stripe billing. Every account is on free early access, and `/app/settings` says
so. The `$9/month` on the marketing pages is the intended price, not a live
charge.

## Deploy on Cloudflare

This app uses OpenNext on Cloudflare Workers and a D1 database. No paid plan is required for a small portfolio deployment within the free-tier limits.

```bash
npm ci
npx wrangler login
npm run cf:types
npm run db:migrate:local
npm run cf:build
npx opennextjs-cloudflare preview
```

Create `.dev.vars` with an `AUTH_SECRET` of at least 32 random characters for local development. Never commit it.

For production, set `AUTH_SECRET` with `npx wrangler secret put AUTH_SECRET`, then run:

```bash
npm run db:migrate:remote
npm run deploy
```

The D1 binding and database ID are in `wrangler.jsonc`. Apply migrations before publishing schema changes. `npm run cf:types` regenerates the binding types after configuration changes.

Optional email delivery needs `RESEND_API_KEY`, `RESEND_FROM`, and `APP_URL`. The daily digest also requires `CRON_SECRET` and an external scheduler. Email sends report a configuration error until credentials are supplied; billing remains free early access.

The original `npm run seed` script targets a separate local SQLite file and is not run against D1 automatically.
