"use client";

import { useActionState, useEffect, useRef } from "react";

import { createPackAction, type ActionState } from "@/lib/actions";
import { SubmitButton } from "./submit-button";

const COMMON_SIZES = [5, 8, 10, 12, 20];

/** Today as yyyy-mm-dd in the browser's own timezone, for date input defaults. */
function todayValue() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}

export function PackForm({
  clients,
  defaultClientId,
  currency = "USD",
}: {
  clients: { id: number; name: string }[];
  defaultClientId?: number;
  currency?: string;
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(createPackAction, {});
  const formRef = useRef<HTMLFormElement>(null);
  const sessionsRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  if (clients.length === 0) {
    return (
      <div className="sheet p-5 text-sm text-muted">
        Add a client first, then you can sell them a pack.
      </div>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="sheet p-4 sm:p-5">
      <h2 className="display text-xl">Add a session pack</h2>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {defaultClientId ? (
          <input type="hidden" name="clientId" value={defaultClientId} />
        ) : (
          <div>
            <label className="field-label" htmlFor="pf-client">
              Client
            </label>
            <select id="pf-client" name="clientId" required className="input">
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="field-label" htmlFor="pf-sessions">
            Number of sessions
          </label>
          <input
            id="pf-sessions"
            ref={sessionsRef}
            name="totalSessions"
            type="number"
            min={1}
            max={500}
            required
            defaultValue={10}
            className="input"
          />
          <div className="mt-1.5 flex flex-wrap gap-1">
            {COMMON_SIZES.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => {
                  if (sessionsRef.current) sessionsRef.current.value = String(n);
                }}
                className="rounded-md border border-rule px-2 py-0.5 text-xs text-muted hover:border-ink hover:text-ink"
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="field-label" htmlFor="pf-label">
            Label <span className="font-normal text-muted">— optional</span>
          </label>
          <input
            id="pf-label"
            name="label"
            className="input"
            placeholder="10-session PT block"
          />
        </div>

        <div>
          <label className="field-label" htmlFor="pf-price">
            Price paid <span className="font-normal text-muted">— optional</span>
          </label>
          <input
            id="pf-price"
            name="price"
            type="number"
            min={0}
            step="0.01"
            className="input"
            placeholder="400"
          />
          <input type="hidden" name="currency" value={currency} />
        </div>

        <div>
          <label className="field-label" htmlFor="pf-purchased">
            Purchased on
          </label>
          <input
            id="pf-purchased"
            name="purchasedAt"
            type="date"
            defaultValue={todayValue()}
            className="input"
          />
        </div>

        <div>
          <label className="field-label" htmlFor="pf-expires">
            Expires <span className="font-normal text-muted">— optional</span>
          </label>
          <input id="pf-expires" name="expiresAt" type="date" className="input" />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <SubmitButton pendingLabel="Adding…">Add pack</SubmitButton>
        {state.error && (
          <span className="text-sm text-out" role="alert">
            {state.error}
          </span>
        )}
        {state.ok && (
          <span className="text-sm text-ok" role="status">
            {state.ok}
          </span>
        )}
      </div>
    </form>
  );
}
