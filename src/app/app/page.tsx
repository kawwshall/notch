import Link from "next/link";

import { PackCard } from "@/components/pack-card";
import { requireUser } from "@/lib/auth";
import { listPacks, summarize } from "@/lib/packs";

export const dynamic = "force-dynamic";

/** Counts sit on the ruled header strip, not in four boxed cards. */
function Tallies({ items }: { items: { value: number; label: string; tone: string }[] }) {
  return (
    <dl className="flex flex-wrap gap-x-10 gap-y-4">
      {items.map(({ value, label, tone }) => (
        <div key={label}>
          <dd className={`num text-3xl ${tone}`}>{value}</dd>
          <dt className="label mt-0.5">{label}</dt>
        </div>
      ))}
    </dl>
  );
}

export default async function DashboardPage() {
  const user = await requireUser();
  const views = await listPacks(user.id, user.lowThreshold, { onlyActive: true });
  const { needsNudge, runningLow, out, healthy, sessionsOutstanding } = summarize(views);

  if (views.length === 0) {
    return (
      <div className="mx-auto max-w-md py-10 text-center">
        <h1 className="display text-4xl">Start with one client.</h1>
        <p className="mt-3 text-ink-2">
          Add someone, give them a pack of sessions, and Notch will keep the count and tell you
          when they&apos;re nearly out.
        </p>
        <Link href="/app/clients" className="btn btn-primary mt-6 px-5 py-2.5">
          Add a client
        </Link>
      </div>
    );
  }

  // No pack should appear twice: anything already in the ask queue is excluded below.
  const queued = new Set(needsNudge.map((v) => v.pack.id));
  const attention = [...out, ...runningLow].filter((v) => !queued.has(v.pack.id));

  return (
    <div className="flex flex-col gap-10">
      <section>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="display text-4xl">Today</h1>
            <p className="mt-1 text-ink-2">
              {needsNudge.length === 0
                ? "Nobody needs asking right now."
                : `${needsNudge.length} ${needsNudge.length === 1 ? "person" : "people"} to ask about renewing.`}
            </p>
          </div>
          <Link href="/app/clients" className="btn btn-secondary">
            Add client or pack
          </Link>
        </div>

        <div className="rule-t mt-6 pt-5">
          <Tallies
            items={[
              { value: needsNudge.length, label: "To ask", tone: "text-ink" },
              { value: runningLow.length, label: "Nearly out", tone: "text-low" },
              { value: out.length, label: "Out", tone: "text-out" },
              { value: sessionsOutstanding, label: "Sessions owed", tone: "text-ink" },
            ]}
          />
        </div>
      </section>

      {needsNudge.length > 0 && (
        <section>
          <h2 className="label border-b border-rule pb-2">Ask about renewing</h2>
          <div className="mt-3 flex flex-col gap-3">
            {needsNudge.map((view) => (
              <PackCard key={view.pack.id} view={view} user={user} />
            ))}
          </div>
        </section>
      )}

      {attention.length > 0 && (
        <section>
          <h2 className="label border-b border-rule pb-2">Also nearly out</h2>
          <div className="mt-3 flex flex-col gap-3">
            {attention.map((view) => (
              <PackCard key={view.pack.id} view={view} user={user} />
            ))}
          </div>
        </section>
      )}

      {healthy.length > 0 && (
        <section>
          <h2 className="label border-b border-rule pb-2">On track</h2>
          <div className="mt-3 flex flex-col gap-3">
            {healthy.map((view) => (
              <PackCard key={view.pack.id} view={view} user={user} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
