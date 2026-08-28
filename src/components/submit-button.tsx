"use client";

import { useFormStatus } from "react-dom";

/**
 * Submit button that disables itself while its parent form is pending, so a
 * trainer tapping "Log session" twice can't double-count a session.
 */
export function SubmitButton({
  children,
  pendingLabel,
  className = "btn btn-primary",
  title,
  disabled,
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
  title?: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending || disabled} title={title}>
      {pending && pendingLabel ? pendingLabel : children}
    </button>
  );
}
