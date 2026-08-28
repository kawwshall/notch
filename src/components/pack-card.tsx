import Link from "next/link";

import type { User } from "@/db/schema";
import { logSessionAction, setPackStatusAction, undoSessionAction } from "@/lib/actions";
import { renewalMessage } from "@/lib/email";
import type { PackView } from "@/lib/packs";
import { HealthPill, RemainingMeter } from "./health";
import { NudgeDialog } from "./nudge-dialog";
import { SubmitButton } from "./submit-button";

function expiryNote(days: number | null) {
  if (days === null) return null;
  if (days < 0) return { text: `Expired ${Math.abs(days)}d ago`, tone: "text-out" };
  if (days === 0) return { text: "Expires today", tone: "text-out" };
  if (days <= 14) return { text: `Expires in ${days}d`, tone: "text-low" };
  return { text: `Expires in ${days}d`, tone: "text-muted" };
}

export function PackCard({
  view,
  user,
  showClientLink = true,
}: {
  view: PackView;
  user: User;
  showClientLink?: boolean;
}) {
  const { pack, client, remaining, used, health, needsNudge, lastNudgeAt } = view;
  const draft = renewalMessage(view, user);
  const expiry = expiryNote(view.expiresInDays);
  const closed = pack.status !== "active";

  return (
    <article className={`card p-4 sm:p-5 ${closed ? "opacity-60" : ""}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {showClientLink ? (
              <Link
                href={`/app/clients/${client.id}`}
                className="display text-xl hover:text-brand hover:underline underline-offset-4"
              >
                {client.name}
              </Link>
            ) : (
              <span className="display text-xl">{pack.label ?? "Session pack"}</span>
            )}
            {!closed && <HealthPill health={health} />}
            {closed && <span className="pill bg-line text-muted">Closed</span>}
          </div>

          <p className="mt-1 text-sm text-muted">
            {showClientLink && pack.label ? `${pack.label} · ` : ""}
            {used} of {pack.totalSessions} used
            {expiry && (
              <>
                {" · "}
                <span className={expiry.tone}>{expiry.text}</span>
              </>
            )}
          </p>
        </div>

        <RemainingMeter remaining={remaining} total={pack.totalSessions} health={health} />
      </div>

      {!closed && (
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
          <form action={logSessionAction}>
            <input type="hidden" name="packId" value={pack.id} />
            <SubmitButton
              pendingLabel="Logging…"
              className="btn btn-primary"
              disabled={remaining <= 0}
              title={remaining <= 0 ? "This pack is fully used" : "Log a session for today"}
            >
              Log session
            </SubmitButton>
          </form>

          {used > 0 && (
            <form action={undoSessionAction}>
              <input type="hidden" name="packId" value={pack.id} />
              <SubmitButton className="btn btn-ghost" pendingLabel="…">
                Undo last
              </SubmitButton>
            </form>
          )}

          <div className="ml-auto flex items-center gap-2">
            {(needsNudge || health !== "ok") && (
              <NudgeDialog
                packId={pack.id}
                clientName={client.name}
                clientEmail={client.email}
                subject={draft.subject}
                body={draft.text}
                variant={needsNudge ? "primary" : "secondary"}
                triggerLabel={needsNudge ? "Send renewal message" : "Message again"}
              />
            )}
            {lastNudgeAt && !needsNudge && (
              <span className="text-xs text-muted">
                Nudged {lastNudgeAt.toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      )}

      {closed && (
        <form action={setPackStatusAction} className="mt-3 border-t border-line pt-3">
          <input type="hidden" name="packId" value={pack.id} />
          <input type="hidden" name="status" value="active" />
          <SubmitButton className="btn btn-ghost">Reopen pack</SubmitButton>
        </form>
      )}
    </article>
  );
}
