import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth-form";
import { Wordmark } from "@/components/wordmark";
import { getCurrentUser } from "@/lib/auth";

export const metadata = { title: "Sign in — Notch" };

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/app");

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex justify-center" aria-label="Notch home">
          <Wordmark size={22} />
        </Link>
        <div className="sheet mt-5 p-6">
          <h1 className="display text-2xl">Welcome back</h1>
          <p className="mb-4 text-sm text-muted">Pick up where you left off.</p>
          <AuthForm mode="login" />
        </div>
        <p className="mt-4 text-center text-sm text-muted">
          No account yet?{" "}
          <Link href="/register" className="font-medium text-ink underline underline-offset-4">
            Start free
          </Link>
        </p>
      </div>
    </div>
  );
}
