import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth-form";
import { getCurrentUser } from "@/lib/auth";

export const metadata = { title: "Sign in — SessionPack" };

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/app");

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="display block text-center text-2xl">
          Session<span className="text-brand">Pack</span>
        </Link>
        <div className="card mt-5 p-6">
          <h1 className="display text-2xl">Welcome back</h1>
          <p className="mb-4 text-sm text-muted">Pick up where you left off.</p>
          <AuthForm mode="login" />
        </div>
        <p className="mt-4 text-center text-sm text-muted">
          No account yet?{" "}
          <Link href="/register" className="text-brand underline underline-offset-4">
            Start free
          </Link>
        </p>
      </div>
    </div>
  );
}
