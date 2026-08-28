import Link from "next/link";

import { MarketingFooter, MarketingHeader } from "@/components/marketing-chrome";
import { getCurrentUser } from "@/lib/auth";

/** A static, non-interactive preview of the dashboard for the hero. */
function DashboardPreview() {
  const rows = [
    { name: "Priya Sharma", left: 1, total: 10, tone: "low", note: "Needs a message" },
    { name: "Marcus Webb", left: 0, total: 8, tone: "out", note: "Pack finished" },
    { name: "Dani Okafor", left: 6, total: 12, tone: "ok", note: "On track" },
  ] as const;

  const tone = {
    ok: { text: "text-ok", bar: "bg-ok", chip: "bg-ok-soft text-ok" },
    low: { text: "text-low", bar: "bg-low", chip: "bg-low-soft text-low" },
    out: { text: "text-out", bar: "bg-out", chip: "bg-out-soft text-out" },
  };

  return (
    <div className="card overflow-hidden shadow-sm">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <span className="display text-lg">Today</span>
        <span className="pill bg-brand-soft text-brand-ink">2 to message</span>
      </div>
      <ul className="divide-y divide-line">
        {rows.map((r) => {
          const t = tone[r.tone];
          return (
            <li key={r.name} className="flex items-center gap-4 px-4 py-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{r.name}</span>
                  <span className={`pill ${t.chip}`}>{r.note}</span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-line">
                  <div
                    className={`h-full rounded-full ${t.bar}`}
                    style={{ width: `${(r.left / r.total) * 100}%` }}
                  />
                </div>
              </div>
              <div className="text-right">
                <div className={`display text-2xl tabular-nums ${t.text}`}>{r.left}</div>
                <div className="label">of {r.total} left</div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

const QUESTIONS = [
  {
    q: "How many sessions does this client have left?",
    a: "Every client shows a live count. You log a session with one tap after each class, and the number goes down. No spreadsheet, no counting back through your calendar.",
  },
  {
    q: "Who is nearly out?",
    a: "Set your own warning line — two sessions left, three, whatever fits your business. Anyone at or below it moves to the top of your dashboard in amber.",
  },
  {
    q: "Who needs a renewal message today?",
    a: "SessionPack drafts the message in your own voice, you glance at it and hit send. It won't ask you twice about the same client until their count drops again.",
  },
];

export default async function LandingPage() {
  const user = await getCurrentUser();

  return (
    <>
      <MarketingHeader signedIn={Boolean(user)} />

      <main className="flex-1">
        <section className="mx-auto grid max-w-5xl items-center gap-10 px-4 py-14 lg:grid-cols-2 lg:py-20">
          <div>
            <p className="label">Prepaid session tracking</p>
            <h1 className="display mt-2 text-4xl leading-[1.1] sm:text-5xl">
              Never lose track of a session pack again.
            </h1>
            <p className="mt-4 text-lg text-muted">
              For independent trainers and teachers who sell sessions in blocks. See what every
              client has left, get warned when they&apos;re nearly out, and send a renewal message
              before the final session.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link href="/register" className="btn btn-primary px-5 py-2.5">
                Start free
              </Link>
              <Link href="/pricing" className="btn btn-secondary px-5 py-2.5">
                See pricing
              </Link>
            </div>
            <p className="mt-3 text-sm text-muted">
              $9/month once billing goes live. Free during early access — no card needed.
            </p>
          </div>

          <DashboardPreview />
        </section>

        <section className="border-y border-line bg-card">
          <div className="mx-auto max-w-5xl px-4 py-14">
            <h2 className="display text-3xl">It answers three questions. That&apos;s all.</h2>
            <p className="mt-2 max-w-2xl text-muted">
              Most software for trainers wants to be your booking system, your payment processor
              and your marketing suite. SessionPack is deliberately tiny.
            </p>
            <div className="mt-8 grid gap-6 sm:grid-cols-3">
              {QUESTIONS.map(({ q, a }, i) => (
                <div key={q}>
                  <div className="display text-2xl text-brand">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <h3 className="mt-1 font-semibold">{q}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-14">
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <h2 className="display text-3xl">The renewal you keep forgetting</h2>
              <p className="mt-3 text-muted">
                The last session is the moment a client decides whether to carry on. Miss it and
                they drift — not because they were unhappy, but because nobody asked.
              </p>
              <p className="mt-3 text-muted">
                One saved renewal a month covers the cost of this many times over. That&apos;s the
                whole pitch.
              </p>
              <ul className="mt-5 flex flex-col gap-2 text-sm">
                {[
                  "One tap to log a session, with an undo if you mis-tap",
                  "Drafted renewal emails that read like you wrote them",
                  "An optional morning digest of who to message",
                  "Never nudges the same client twice for the same count",
                ].map((item) => (
                  <li key={item} className="flex gap-2.5">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <figure className="card p-6">
              <blockquote className="display text-xl leading-snug">
                &ldquo;Hi Priya — quick note, you have 1 session left in your 10-session block.
                Happy to get the next pack booked in so there&apos;s no gap in your schedule.&rdquo;
              </blockquote>
              <figcaption className="mt-4 text-sm text-muted">
                A renewal message SessionPack drafts for you. Editable before it sends, and
                replies come straight back to your inbox.
              </figcaption>
            </figure>
          </div>
        </section>

        <section className="border-t border-line bg-brand text-white">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-6 px-4 py-12">
            <div>
              <h2 className="display text-3xl">Set it up in about five minutes.</h2>
              <p className="mt-1 text-white/75">
                Add your clients, enter what they&apos;ve already used, and you&apos;re current.
              </p>
            </div>
            <Link
              href="/register"
              className="btn ml-auto bg-white px-5 py-2.5 text-brand-ink hover:bg-white/90"
            >
              Start free
            </Link>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </>
  );
}
