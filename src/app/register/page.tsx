import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth-form";
import { getCurrentUser } from "@/lib/auth";

export const metadata = { title: "Start free — SessionPack" };

export default async function RegisterPage() {
  if (await getCurrentUser()) redirect("/app");

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="display block text-center text-2xl">
          Session<span className="text-brand">Pack</span>
        </Link>
        <div className="card mt-5 p-6">
          <h1 className="display text-2xl">Start tracking packs</h1>
          <p className="mb-4 text-sm text-muted">
            Free while we&apos;re in early access. No card needed.
          </p>
          <AuthForm mode="register" />
        </div>
        <p className="mt-4 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/login" className="text-brand underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
