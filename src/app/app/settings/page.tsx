import { SettingsForm } from "@/components/settings-form";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="display text-3xl">Settings</h1>
        <p className="text-muted">Your name is what clients see on renewal messages.</p>
      </div>

      <SettingsForm user={user} />

      <div className="card p-5">
        <h2 className="display text-xl">Your plan</h2>
        <p className="mt-1 text-sm text-muted">
          You&apos;re on the early-access plan — everything unlocked, nothing to pay yet. When
          billing goes live it&apos;ll be $9/month, and we&apos;ll email you well before anything
          changes.
        </p>
        <p className="mt-3 text-sm text-muted">
          Signed in as <span className="text-ink">{user.email}</span>
        </p>
      </div>
    </div>
  );
}
