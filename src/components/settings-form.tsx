"use client";

import { useActionState } from "react";

import type { User } from "@/db/schema";
import { updateSettingsAction, type ActionState } from "@/lib/actions";
import { SubmitButton } from "./submit-button";

export function SettingsForm({ user }: { user: User }) {
  const [state, formAction] = useActionState<ActionState, FormData>(updateSettingsAction, {});

  return (
    <form action={formAction} className="sheet flex flex-col gap-4 p-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="sf-name">
            Your name
          </label>
          <input id="sf-name" name="name" required defaultValue={user.name} className="input" />
        </div>
        <div>
          <label className="field-label" htmlFor="sf-business">
            Business name <span className="font-normal text-muted">— optional</span>
          </label>
          <input
            id="sf-business"
            name="businessName"
            defaultValue={user.businessName ?? ""}
            className="input"
            placeholder="Northside Strength"
          />
        </div>
      </div>

      <div>
        <label className="field-label" htmlFor="sf-threshold">
          Warn me when a client has this many sessions left
        </label>
        <input
          id="sf-threshold"
          name="lowThreshold"
          type="number"
          min={1}
          max={20}
          required
          defaultValue={user.lowThreshold}
          className="input sm:max-w-[8rem]"
        />
        <p className="mt-1 text-xs text-muted">
          Packs at or below this number show as &ldquo;nearly out&rdquo; and enter your renewal
          queue.
        </p>
      </div>

      <label className="flex items-start gap-2.5">
        <input
          type="checkbox"
          name="dailyDigest"
          defaultChecked={user.dailyDigest}
          className="mt-0.5 h-4 w-4 accent-ink"
        />
        <span>
          <span className="text-sm font-medium">Daily digest email</span>
          <span className="block text-xs text-muted">
            Each morning, a short email listing who needs a renewal message. Only sent when
            there&apos;s someone on the list.
          </span>
        </span>
      </label>

      <div className="flex items-center gap-2">
        <SubmitButton pendingLabel="Saving…">Save settings</SubmitButton>
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
