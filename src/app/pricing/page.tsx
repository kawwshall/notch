import Link from "next/link";

import { MarketingFooter, MarketingHeader } from "@/components/marketing-chrome";
import { TallyMarks } from "@/components/tally";
import { getCurrentUser } from "@/lib/auth";

export const metadata = { title: "Pricing — Notch" };

const INCLUDED = [
  "Unlimited clients and session packs",
  "A live count for everyone on your books",
  "Your own “nearly out” warning line",
  "Renewal emails drafted in your voice",
  "Optional morning digest of who to ask",
  "Full session and renewal history per client",
];

const FAQS = [
  {
    q: "Is it really just one price?",
    a: "Yes. One plan, $9 a month, everything included. No per-client tiers, no add-ons. A tool this small shouldn't need a pricing page you have to study.",
  },
  {
    q: "What does it cost right now?",
    a: "Nothing. Notch is in early access, so it's free and needs no card. When billing switches on you'll get plenty of notice, and you can walk away with your data.",
  },
  {
    q: "Does it do booking or take payments?",
    a: "No, and it won't. Keep taking bookings and money however you already do. Notch only keeps the count and tells you when to ask about the next pack.",
  },
  {
    q: "Who do the renewal emails come from?",
    a: "You. They're written in your voice and sent with your address as the reply-to, so when a client hits reply it lands in your inbox, not ours.",
  },
  {
    q: "I've already sold packs that are part-used.",
    a: "Enter the pack size, then log the sessions already taken. About two minutes per client and your numbers are current.",
  },
];

export default async function PricingPage() {
  const user = await getCurrentUser();

  return (
    <>
      <MarketingHeader signedIn={Boolean(user)} />

      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-16">
        <div className="max-w-xl">
          <h1 className="display text-4xl sm:text-5xl">One plan. Nine dollars.</h1>
          <p className="mt-4 text-lg text-ink-2">
            Priced so that catching a single renewal you&apos;d otherwise have missed pays for
            the year.
          </p>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="sheet p-6">
              <span className="label">Notch</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="num text-6xl">$9</span>
                <span className="text-muted">a month</span>
              </div>
              <p className="mt-1 text-sm text-muted">Cancel any time, from inside the app.</p>

              <TallyMarks total={9} remaining={9} health="ok" scale={0.8} className="mt-5" />

              <Link href="/register" className="btn btn-primary mt-6 w-full py-2.5">
                Start free
              </Link>
              <p className="mt-2 text-center text-xs text-muted">
                Free during early access · no card
              </p>

              <ul className="rule-t mt-6 flex flex-col gap-2.5 pt-5 text-sm">
                {INCLUDED.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-1.5 h-4 w-px shrink-0 bg-ink" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="lg:col-span-7">
            <h2 className="label border-b border-rule pb-2">Questions</h2>
            <dl>
              {FAQS.map(({ q, a }) => (
                <div key={q} className="rule-t py-5 first:border-t-0">
                  <dt className="display text-xl">{q}</dt>
                  <dd className="mt-1.5 leading-relaxed text-ink-2">{a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </main>

      <MarketingFooter />
    </>
  );
}
