"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import type { Client } from "@/db/schema";
import { createClientAction, updateClientAction, type ActionState } from "@/lib/actions";
import { SubmitButton } from "./submit-button";

export function ClientForm({ client }: { client?: Client }) {
  const editing = Boolean(client);
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState<ActionState, FormData>(
    editing ? updateClientAction : createClientAction,
    {},
  );
  const formRef = useRef<HTMLFormElement>(null);

  // Collapse the edit panel on a successful save. Adjusting state during render
  // is React's recommended alternative to a setState-in-effect here.
  const [handledOk, setHandledOk] = useState<string | undefined>(undefined);
  if (editing && state.ok !== handledOk) {
    setHandledOk(state.ok);
    if (state.ok) setOpen(false);
  }

  // On create, clear the fields so the next client can be typed straight in.
  useEffect(() => {
    if (state.ok && !editing) formRef.current?.reset();
  }, [state.ok, editing]);

  if (editing && !open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="btn btn-secondary">
        Edit details
      </button>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="sheet p-4 sm:p-5">
      {client && <input type="hidden" name="clientId" value={client.id} />}
      <h2 className="display text-xl">{editing ? "Edit client" : "Add a client"}</h2>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="cf-name">
            Name
          </label>
          <input
            id="cf-name"
            name="name"
            required
            defaultValue={client?.name}
            className="input"
            placeholder="Priya Sharma"
          />
        </div>
        <div>
          <label className="field-label" htmlFor="cf-email">
            Email <span className="font-normal text-muted">— needed for renewal messages</span>
          </label>
          <input
            id="cf-email"
            name="email"
            type="email"
            defaultValue={client?.email ?? ""}
            className="input"
            placeholder="priya@example.com"
          />
        </div>
        <div>
          <label className="field-label" htmlFor="cf-phone">
            Phone <span className="font-normal text-muted">— optional</span>
          </label>
          <input
            id="cf-phone"
            name="phone"
            defaultValue={client?.phone ?? ""}
            className="input"
            placeholder="+91 98765 43210"
          />
        </div>
        <div>
          <label className="field-label" htmlFor="cf-notes">
            Notes <span className="font-normal text-muted">— optional</span>
          </label>
          <input
            id="cf-notes"
            name="notes"
            defaultValue={client?.notes ?? ""}
            className="input"
            placeholder="Tuesdays 7am, knee injury"
          />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <SubmitButton pendingLabel="Saving…">{editing ? "Save changes" : "Add client"}</SubmitButton>
        {editing && (
          <button type="button" onClick={() => setOpen(false)} className="btn btn-ghost">
            Cancel
          </button>
        )}
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
