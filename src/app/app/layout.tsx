import Link from "next/link";

import { logoutAction } from "@/lib/actions";
import { requireUser } from "@/lib/auth";
import { NavLink } from "@/components/nav-link";

export default async function AppLayout({ children }: LayoutProps<"/app">) {
  const user = await requireUser();

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-line bg-card">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3">
          <Link href="/app" className="display text-lg">
            Session<span className="text-brand">Pack</span>
          </Link>

          <nav className="flex items-center gap-1">
            <NavLink href="/app">Today</NavLink>
            <NavLink href="/app/clients">Clients</NavLink>
            <NavLink href="/app/settings">Settings</NavLink>
          </nav>

          <form action={logoutAction} className="ml-auto flex items-center gap-3">
            <span className="hidden text-sm text-muted sm:inline">{user.name}</span>
            <button type="submit" className="btn btn-ghost">
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:py-8">{children}</main>
    </div>
  );
}
