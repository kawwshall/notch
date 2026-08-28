import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth-form";
import { Wordmark } from "@/components/wordmark";
import { getCurrentUser } from "@/lib/auth";

export const metadata = { title: "Start free — Notch" };

export default async function RegisterPage() {
  if (await getCurrentUser()) redirect("/app");

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex justify-center" aria-label="Notch home">
          <Wordmark size={22} />
        </Link>
        <div className="sheet mt-5 p-6">
          <h1 className="display text-2xl">Start tracking packs</h1>
          <p className="mb-4 text-sm text-muted">
            Free while we&apos;re in early access. No card needed.
          </p>
          <AuthForm mode="register" />
        </div>
        <p className="mt-4 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-ink underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
