import { and, desc, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ClientForm } from "@/components/client-form";
import { PackCard } from "@/components/pack-card";
import { PackForm } from "@/components/pack-form";
import { SubmitButton } from "@/components/submit-button";
import { db } from "@/db";
import { clients, nudges, packs, sessions } from "@/db/schema";
import { archiveClientAction, deleteSessionAction } from "@/lib/actions";
import { requireUser } from "@/lib/auth";
import { listPacks } from "@/lib/packs";

export const dynamic = "force-dynamic";

export default async function ClientDetailPage({ params }: PageProps<"/app/clients/[id]">) {
  const user = await requireUser();
  const clientId = Number((await params).id);
  if (!Number.isInteger(clientId)) notFound();

  const client = await db.query.clients.findFirst({
    where: and(eq(clients.id, clientId), eq(clients.userId, user.id)),
  });
  if (!client) notFound();

  const [views, history, nudgeLog] = await Promise.all([
    listPacks(user.id, user.lowThreshold, { clientId }),
    db
      .select({ session: sessions, pack: packs })
      .from(sessions)
      .innerJoin(packs, eq(packs.id, sessions.packId))
      .where(and(eq(sessions.userId, user.id), eq(packs.clientId, clientId)))
      .orderBy(desc(sessions.occurredAt), desc(sessions.id))
      .limit(50),
    db
      .select()
      .from(nudges)
      .where(and(eq(nudges.userId, user.id), eq(nudges.clientId, clientId)))
      .orderBy(desc(nudges.sentAt))
      .limit(10),
  ]);

  const active = views.filter((v) => v.pack.status === "active");
  const closed = views.filter((v) => v.pack.status !== "active");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/app/clients" className="text-sm text-muted hover:text-ink">
          ← All clients
        </Link>
        <div className="mt-1 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="display text-3xl">{client.name}</h1>
            <p className="text-muted">
              {[client.email, client.phone].filter(Boolean).join(" · ") || "No contact details"}
            </p>
            {client.notes && <p className="mt-1 text-sm text-muted italic">{client.notes}</p>}
          </div>
          <ClientForm client={client} />
        </div>
      </div>

      <section>
        <h2 className="label">Active packs</h2>
        <div className="mt-2 flex flex-col gap-3">
          {active.length === 0 && (
            <p className="sheet p-4 text-sm text-muted">
              No active packs. Add one below to start tracking sessions.
            </p>
          )}
          {active.map((view) => (
            <PackCard key={view.pack.id} view={view} user={user} showClientLink={false} />
          ))}
        </div>
      </section>

      <PackForm clients={[client]} defaultClientId={client.id} />

      {history.length > 0 && (
        <section>
          <h2 className="label">Session history</h2>
          <ul className="sheet mt-2 divide-y divide-rule-soft">
            {history.map(({ session, pack }) => (
              <li key={session.id} className="flex items-center gap-3 px-4 py-2.5">
                <span className="w-28 shrink-0 text-sm tabular-nums text-muted">
                  {session.occurredAt.toLocaleDateString(undefined, {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm">
                  {pack.label ?? `Pack of ${pack.totalSessions}`}
                  {session.note && <span className="text-muted"> — {session.note}</span>}
                </span>
                <form action={deleteSessionAction}>
                  <input type="hidden" name="sessionId" value={session.id} />
                  <SubmitButton className="btn btn-ghost text-xs">Remove</SubmitButton>
                </form>
              </li>
            ))}
          </ul>
        </section>
      )}

      {nudgeLog.length > 0 && (
        <section>
          <h2 className="label">Renewal messages sent</h2>
          <ul className="sheet mt-2 divide-y divide-rule-soft">
            {nudgeLog.map((n) => (
              <li key={n.id} className="px-4 py-2.5 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="tabular-nums text-muted">
                    {n.sentAt.toLocaleDateString()}
                  </span>
                  <span className="font-medium">{n.subject}</span>
                  {n.status === "failed" && (
                    <span className="stamp bg-out-soft text-out">Failed</span>
                  )}
                </div>
                {n.error && <p className="mt-0.5 text-xs text-out">{n.error}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {closed.length > 0 && (
        <section>
          <h2 className="label">Closed packs</h2>
          <div className="mt-2 flex flex-col gap-3">
            {closed.map((view) => (
              <PackCard key={view.pack.id} view={view} user={user} showClientLink={false} />
            ))}
          </div>
        </section>
      )}

      <form action={archiveClientAction} className="border-t border-rule pt-5">
        <input type="hidden" name="clientId" value={client.id} />
        <SubmitButton className="btn btn-ghost text-out">Archive this client</SubmitButton>
        <p className="mt-1 text-xs text-muted">
          Hides them from your lists. Their history is kept.
        </p>
      </form>
    </div>
  );
}
