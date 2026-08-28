import Link from "next/link";

import { PackCard } from "@/components/pack-card";
import { requireUser } from "@/lib/auth";
import { listPacks, summarize } from "@/lib/packs";

export const dynamic = "force-dynamic";

function Stat({ value, label, tone = "" }: { value: number; label: string; tone?: string }) {
  return (
    <div className="card px-4 py-3">
      <div className={`display text-3xl tabular-nums ${tone}`}>{value}</div>
      <div className="label mt-0.5">{label}</div>
    </div>
  );
}

export default async function DashboardPage() {
  const user = await requireUser();
  const views = await listPacks(user.id, user.lowThreshold, { onlyActive: true });
  const { needsNudge, runningLow, out, healthy, sessionsOutstanding } = summarize(views);

  if (views.length === 0) {
    return (
      <div className="card mx-auto max-w-lg p-8 text-center">
        <h1 className="display text-3xl">Let&apos;s add your first client</h1>
        <p className="mt-2 text-muted">
          Add a client, give them a pack of sessions, and SessionPack will tell you when
          they&apos;re nearly out.
        </p>
        <Link href="/app/clients" className="btn btn-primary mt-5">
          Add a client
        </Link>
      </div>
    );
  }

  // "Attention" is everything low or out, minus the ones already surfaced above
  // in the nudge queue — no pack should appear in two sections.
  const nudgeIds = new Set(needsNudge.map((v) => v.pack.id));
  const attention = [...out, ...runningLow].filter((v) => !nudgeIds.has(v.pack.id));

  return (
    <div className="flex flex-col gap-8">
      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="display text-3xl">Today</h1>
            <p className="text-muted">
              {needsNudge.length === 0
                ? "Nobody needs a renewal message right now."
                : `${needsNudge.length} client${needsNudge.length === 1 ? "" : "s"} to message.`}
            </p>
          </div>
          <Link href="/app/clients" className="btn btn-secondary">
            Add client or pack
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat value={needsNudge.length} label="To message" tone="text-brand" />
          <Stat value={runningLow.length} label="Nearly out" tone="text-low" />
          <Stat value={out.length} label="Out" tone="text-out" />
          <Stat value={sessionsOutstanding} label="Sessions owed" />
        </div>
      </section>

      {needsNudge.length > 0 && (
        <section>
          <h2 className="label">Needs a renewal message</h2>
          <div className="mt-2 flex flex-col gap-3">
            {needsNudge.map((view) => (
              <PackCard key={view.pack.id} view={view} user={user} />
            ))}
          </div>
        </section>
      )}

      {attention.length > 0 && (
        <section>
          <h2 className="label">Also nearly out</h2>
          <div className="mt-2 flex flex-col gap-3">
            {attention.map((view) => (
              <PackCard key={view.pack.id} view={view} user={user} />
            ))}
          </div>
        </section>
      )}

      {healthy.length > 0 && (
        <section>
          <h2 className="label">On track</h2>
          <div className="mt-2 flex flex-col gap-3">
            {healthy.map((view) => (
              <PackCard key={view.pack.id} view={view} user={user} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
