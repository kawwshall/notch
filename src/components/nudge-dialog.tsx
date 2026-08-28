"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import { sendNudgeAction, type ActionState } from "@/lib/actions";
import { SubmitButton } from "./submit-button";

/**
 * Renewal message composer. The draft arrives pre-written from the server so
 * the common case is one click — but it stays editable, because the message
 * goes out under the trainer's own name.
 */
export function NudgeDialog({
  packId,
  clientName,
  clientEmail,
  subject,
  body,
  variant = "primary",
  triggerLabel = "Send renewal message",
}: {
  packId: number;
  clientName: string;
  clientEmail: string | null;
  subject: string;
  body: string;
  variant?: "primary" | "secondary";
  triggerLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState<ActionState, FormData>(sendNudgeAction, {});
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Close the composer once a send succeeds. Adjusting state during render is
  // React's recommended alternative to a setState-in-effect here.
  const [handledOk, setHandledOk] = useState<string | undefined>(undefined);
  if (state.ok !== handledOk) {
    setHandledOk(state.ok);
    if (state.ok) setOpen(false);
  }

  // Syncing the native <dialog> element is a genuine external-system effect.
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  if (!clientEmail) {
    return (
      <span className="text-xs text-muted" title="Add an email address to send renewal messages">
        No email on file
      </span>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`btn btn-${variant}`}
      >
        {triggerLabel}
      </button>

      {state.error && !open && (
        <p className="mt-1 text-xs text-out" role="alert">
          {state.error}
        </p>
      )}
      {state.ok && (
        <p className="mt-1 text-xs text-ok" role="status">
          {state.ok}
        </p>
      )}

      <dialog
        ref={dialogRef}
        onClose={() => setOpen(false)}
        className="sheet m-auto w-[min(38rem,92vw)] p-0 backdrop:bg-ink/40"
      >
        <form action={formAction} className="flex flex-col">
          <input type="hidden" name="packId" value={packId} />

          <header className="border-b border-rule px-5 py-4">
            <h2 className="display text-xl">Renewal message</h2>
            <p className="mt-0.5 text-sm text-muted">
              To {clientName} &lt;{clientEmail}&gt; — replies come straight back to you.
            </p>
          </header>

          <div className="flex flex-col gap-3 px-5 py-4">
            <div>
              <label className="field-label" htmlFor={`subject-${packId}`}>
                Subject
              </label>
              <input
                id={`subject-${packId}`}
                name="subject"
                defaultValue={subject}
                className="input"
              />
            </div>
            <div>
              <label className="field-label" htmlFor={`body-${packId}`}>
                Message
              </label>
              <textarea
                id={`body-${packId}`}
                name="body"
                defaultValue={body}
                rows={11}
                className="input resize-y font-sans leading-relaxed"
              />
            </div>
            {state.error && (
              <p className="text-sm text-out" role="alert">
                {state.error}
              </p>
            )}
          </div>

          <footer className="flex justify-end gap-2 border-t border-rule bg-paper px-5 py-3">
            <button type="button" onClick={() => setOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <SubmitButton pendingLabel="Sending…">Send message</SubmitButton>
          </footer>
        </form>
      </dialog>
    </>
  );
}
