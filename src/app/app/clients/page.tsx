import Link from "next/link";

import { ClientForm } from "@/components/client-form";
import { HealthPill } from "@/components/health";
import { PackForm } from "@/components/pack-form";
import { requireUser } from "@/lib/auth";
import { listClientsWithTotals } from "@/lib/packs";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const user = await requireUser();
  const rows = await listClientsWithTotals(user.id, user.lowThreshold);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="display text-3xl">Clients</h1>
        <p className="text-muted">
          {rows.length} client{rows.length === 1 ? "" : "s"} · sessions left across all active
          packs
        </p>
      </div>

      {rows.length > 0 && (
        <ul className="card divide-y divide-line">
          {rows.map(({ client, remaining, activePacks, health, needsNudge }) => (
            <li key={client.id}>
              <Link
                href={`/app/clients/${client.id}`}
                className="flex items-center gap-4 px-4 py-3 hover:bg-paper"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{client.name}</span>
                    {activePacks > 0 && <HealthPill health={health} />}
                    {needsNudge && (
                      <span className="pill bg-brand-soft text-brand-ink">Needs message</span>
                    )}
                  </div>
                  <p className="truncate text-sm text-muted">
                    {client.email ?? "No email on file"}
                    {activePacks > 1 ? ` · ${activePacks} active packs` : ""}
                  </p>
                </div>

                <div className="text-right">
                  <div className="display text-2xl tabular-nums">
                    {activePacks > 0 ? remaining : "—"}
                  </div>
                  <div className="label">left</div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <ClientForm />
        <PackForm clients={rows.map((r) => r.client)} />
      </div>
    </div>
  );
}
