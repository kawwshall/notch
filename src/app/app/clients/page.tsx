import Link from "next/link";

import { ClientForm } from "@/components/client-form";
import { StatusStamp } from "@/components/health";
import { PackForm } from "@/components/pack-form";
import { requireUser } from "@/lib/auth";
import { listClientsWithTotals } from "@/lib/packs";

export const dynamic = "force-dynamic";

const TONE = { ok: "text-ok", low: "text-low", out: "text-out" } as const;

export default async function ClientsPage() {
  const user = await requireUser();
  const rows = await listClientsWithTotals(user.id, user.lowThreshold);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="display text-4xl">Clients</h1>
        <p className="mt-1 text-ink-2">
          {rows.length} on the books · sessions left across all their active packs
        </p>
      </div>

      {rows.length > 0 && (
        <ul className="sheet">
          {rows.map(({ client, remaining, activePacks, health, needsNudge }, i) => (
            <li key={client.id} className={i > 0 ? "rule-t" : ""}>
              <Link
                href={`/app/clients/${client.id}`}
                className="flex items-center gap-4 px-4 py-3 hover:bg-paper-sunk"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{client.name}</span>
                    {activePacks > 0 && <StatusStamp health={health} />}
                    {needsNudge && <StatusStamp health="ok" label="To ask" />}
                  </div>
                  <p className="truncate text-sm text-muted">
                    {client.email ?? "No email on file"}
                    {activePacks > 1 ? ` · ${activePacks} active packs` : ""}
                  </p>
                </div>

                {/* No tally here: this number sums several packs, so a
                    proportional mark would imply a pack size that isn't real. */}
                <span
                  className={`num w-8 text-right text-2xl ${
                    activePacks > 0 ? TONE[health] : "text-faint"
                  }`}
                >
                  {activePacks > 0 ? remaining : "—"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <ClientForm />
        <PackForm clients={rows.map((r) => r.client)} />
      </div>
    </div>
  );
}
