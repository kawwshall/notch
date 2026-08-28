"use client";

import { useActionState } from "react";

import { loginAction, registerAction, type ActionState } from "@/lib/actions";
import { SubmitButton } from "./submit-button";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const [state, formAction] = useActionState<ActionState, FormData>(
    mode === "login" ? loginAction : registerAction,
    {},
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      {mode === "register" && (
        <>
          <div>
            <label className="field-label" htmlFor="af-name">
              Your name
            </label>
            <input
              id="af-name"
              name="name"
              required
              autoComplete="name"
              className="input"
              placeholder="Alex Rivera"
            />
          </div>
          <div>
            <label className="field-label" htmlFor="af-business">
              Business name <span className="font-normal text-muted">— optional</span>
            </label>
            <input
              id="af-business"
              name="businessName"
              autoComplete="organization"
              className="input"
              placeholder="Northside Strength"
            />
          </div>
        </>
      )}

      <div>
        <label className="field-label" htmlFor="af-email">
          Email
        </label>
        <input
          id="af-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="input"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label className="field-label" htmlFor="af-password">
          Password
        </label>
        <input
          id="af-password"
          name="password"
          type="password"
          required
          minLength={mode === "register" ? 8 : undefined}
          autoComplete={mode === "register" ? "new-password" : "current-password"}
          className="input"
          placeholder={mode === "register" ? "At least 8 characters" : ""}
        />
      </div>

      {state.error && (
        <p className="text-sm text-out" role="alert">
          {state.error}
        </p>
      )}

      <SubmitButton className="btn btn-primary mt-1 w-full" pendingLabel="Just a moment…">
        {mode === "login" ? "Sign in" : "Create my account"}
      </SubmitButton>
    </form>
  );
}
