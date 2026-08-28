import Link from "next/link";

import { MarketingFooter, MarketingHeader } from "@/components/marketing-chrome";
import { getCurrentUser } from "@/lib/auth";

export const metadata = { title: "Pricing — SessionPack" };

const INCLUDED = [
  "Unlimited clients and session packs",
  "Live sessions-remaining count for everyone",
  "Your own “nearly out” warning threshold",
  "Drafted renewal emails, sent under your name",
  "Optional daily digest of who to message",
  "Full session and renewal history per client",
];

const FAQS = [
  {
    q: "Is it really just one price?",
    a: "Yes. One plan, $9 a month, everything included. No per-client tiers and no add-ons — a tool this small doesn't need a pricing page you have to study.",
  },
  {
    q: "What does it cost right now?",
    a: "Nothing. SessionPack is in early access, so it's free and needs no card. When billing switches on you'll get plenty of notice, and you can walk away with your data.",
  },
  {
    q: "Does it handle booking or payments?",
    a: "No, and it won't. Keep taking bookings and money however you already do. SessionPack only tracks what's been used and tells you when to ask for the next pack.",
  },
  {
    q: "Do renewal emails come from SessionPack?",
    a: "They're written in your voice and sent with your email as the reply-to, so when a client hits reply it lands in your inbox, not ours.",
  },
  {
    q: "What if I already sold packs that are part-used?",
    a: "Enter the pack size, then log the sessions already taken. Two minutes per client and your numbers are current.",
  },
];

export default async function PricingPage() {
  const user = await getCurrentUser();

  return (
    <>
      <MarketingHeader signedIn={Boolean(user)} />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-14">
        <div className="max-w-2xl">
          <h1 className="display text-4xl">One plan. Nine dollars.</h1>
          <p className="mt-3 text-lg text-muted">
            Priced so that catching a single renewal you&apos;d otherwise have missed pays for the
            year.
          </p>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[22rem_1fr]">
          <div className="card p-6">
            <p className="label">SessionPack</p>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="display text-5xl">$9</span>
              <span className="text-muted">/ month</span>
            </div>
            <p className="mt-1 text-sm text-muted">Cancel any time, from inside the app.</p>

            <Link href="/register" className="btn btn-primary mt-5 w-full py-2.5">
              Start free
            </Link>
            <p className="mt-2 text-center text-xs text-muted">
              Free during early access · no card needed
            </p>

            <ul className="mt-5 flex flex-col gap-2 border-t border-line pt-5 text-sm">
              {INCLUDED.map((item) => (
                <li key={item} className="flex gap-2.5">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="card p-6">
            <h2 className="display text-2xl">Questions</h2>
            <dl className="mt-4 flex flex-col divide-y divide-line">
              {FAQS.map(({ q, a }) => (
                <div key={q} className="py-3.5 first:pt-0 last:pb-0">
                  <dt className="font-semibold">{q}</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-muted">{a}</dd>
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
