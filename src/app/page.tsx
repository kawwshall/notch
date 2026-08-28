import Link from "next/link";

import { MarketingFooter, MarketingHeader } from "@/components/marketing-chrome";
import { TallyMarks } from "@/components/tally";
import { getCurrentUser } from "@/lib/auth";

/** A ledger page as it actually appears in the product. */
function LedgerPreview() {
  const rows = [
    { name: "Priya Sharma", left: 1, total: 10, health: "low", note: "Ask about renewing" },
    { name: "Marcus Webb", left: 0, total: 8, health: "out", note: "Pack finished" },
    { name: "Dani Okafor", left: 6, total: 12, health: "ok", note: null },
    { name: "Rosa Delgado", left: 17, total: 20, health: "ok", note: null },
  ] as const;

  const tone = {
    ok: "text-ok",
    low: "text-low",
    out: "text-out",
  };

  return (
    <div className="sheet">
      <div className="flex items-baseline justify-between border-b border-rule px-4 py-2.5">
        <span className="label">Thursday</span>
        <span className="label">Left</span>
      </div>
      <ul>
        {rows.map((r, i) => (
          <li
            key={r.name}
            className={`flex items-center gap-4 px-4 py-3 ${i > 0 ? "rule-t" : ""}`}
          >
            <div className="min-w-0 flex-1">
              <div className="text-[0.9375rem] font-medium">{r.name}</div>
              {r.note && <div className={`text-xs ${tone[r.health]}`}>{r.note}</div>}
            </div>
            <TallyMarks
              total={r.total}
              remaining={r.left}
              health={r.health}
              scale={0.72}
              className="hidden sm:block"
            />
            <span className={`num w-7 text-right text-2xl ${tone[r.health]}`}>{r.left}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const QUESTIONS = [
  {
    q: "How many sessions has this client got left?",
    a: "One tap after each class cuts a notch. The count is always current, and it's the biggest thing on the screen — no spreadsheet, no counting backwards through your calendar.",
  },
  {
    q: "Who is nearly out?",
    a: "You set the line — two sessions left, three, whatever suits how you work. Anyone at or below it moves to the top of the page and turns amber.",
  },
  {
    q: "Who needs asking today?",
    a: "Notch writes the message in your voice and puts it in front of you. You read it, change anything you want, and send. It won't ask you about the same client twice.",
  },
];

export default async function LandingPage() {
  const user = await getCurrentUser();

  return (
    <>
      <MarketingHeader signedIn={Boolean(user)} />

      <main className="flex-1">
        {/* Asymmetric on purpose — the ledger sits lower and narrower than the claim. */}
        <section className="mx-auto grid max-w-5xl gap-10 px-5 py-16 lg:grid-cols-12 lg:gap-12 lg:py-24">
          <div className="lg:col-span-7">
            <h1 className="display text-[2.75rem] leading-[1.03] sm:text-[3.5rem]">
              Know what every client
              <br className="hidden sm:inline" /> has left.
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-ink-2">
              Notch keeps count of prepaid session packs for trainers and teachers who sell
              their time in blocks — and tells you who to ask about renewing, before the last
              session quietly goes by.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link href="/register" className="btn btn-primary px-5 py-2.5">
                Start free
              </Link>
              <Link href="/pricing" className="btn btn-secondary px-5 py-2.5">
                $9 a month
              </Link>
            </div>
            <p className="mt-3 text-sm text-muted">
              Free while we&apos;re in early access. No card.
            </p>
          </div>

          <div className="lg:col-span-5 lg:pt-3">
            <LedgerPreview />
          </div>
        </section>

        {/* Numbered ledger entries, not three cards with icons in a row. */}
        <section className="border-y border-rule bg-card">
          <div className="mx-auto max-w-5xl px-5 py-16">
            <h2 className="display max-w-xl text-3xl sm:text-4xl">
              Three questions. Nothing else.
            </h2>
            <p className="mt-3 max-w-xl text-ink-2">
              Most software for trainers wants to be your booking system, your card terminal and
              your marketing suite. Notch is deliberately small, and stays that way.
            </p>

            <dl className="mt-10">
              {QUESTIONS.map(({ q, a }, i) => (
                <div
                  key={q}
                  className="grid gap-x-6 gap-y-1.5 border-t border-rule py-6 sm:grid-cols-12"
                >
                  <dt className="sm:col-span-5">
                    <span className="num mr-3 text-2xl text-faint">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="display text-xl">{q}</span>
                  </dt>
                  <dd className="text-ink-2 sm:col-span-7">{a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-5 py-16">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <h2 className="display text-3xl sm:text-4xl">
                The last session is the one that decides.
              </h2>
              <p className="mt-4 text-ink-2">
                A client who finishes a pack without being asked doesn&apos;t usually quit. They
                drift — not because anything was wrong, but because nobody said anything and the
                slot went cold.
              </p>
              <p className="mt-3 text-ink-2">
                Catching one of those a month covers the cost of this many times over. That is
                the entire argument.
              </p>
            </div>

            <figure className="sheet p-6 lg:col-span-6">
              <span className="label">Drafted for you</span>
              <blockquote className="display mt-3 text-xl leading-snug">
                &ldquo;Hi Priya — quick note, you&apos;ve got one session left in your
                ten-session block. Happy to get the next one booked in so there&apos;s no gap in
                your Tuesdays.&rdquo;
              </blockquote>
              <figcaption className="rule-t mt-5 pt-4 text-sm text-muted">
                Sent under your name, with your address as the reply-to — so when she replies it
                lands in your inbox, not ours. Editable before it goes.
              </figcaption>
            </figure>
          </div>
        </section>

        <section className="border-t border-rule bg-ink text-paper">
          <div className="mx-auto flex max-w-5xl flex-wrap items-end gap-6 px-5 py-14">
            <div>
              <h2 className="display text-3xl sm:text-4xl">Set up in five minutes.</h2>
              <p className="mt-2 text-paper/65">
                Add your clients, enter what they&apos;ve already used, and you&apos;re current.
              </p>
            </div>
            <Link
              href="/register"
              className="btn ml-auto bg-paper px-5 py-2.5 text-ink hover:bg-white"
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
