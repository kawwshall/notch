import Link from "next/link";

import { NavLink } from "@/components/nav-link";
import { Wordmark } from "@/components/wordmark";
import { logoutAction } from "@/lib/actions";
import { requireUser } from "@/lib/auth";

export default async function AppLayout({ children }: LayoutProps<"/app">) {
  const user = await requireUser();

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-rule bg-card">
        <div className="mx-auto flex max-w-4xl items-center gap-5 px-5 py-3">
          <Link href="/app" aria-label="Notch home">
            <Wordmark size={17} />
          </Link>

          <nav className="flex items-center gap-1">
            <NavLink href="/app">Today</NavLink>
            <NavLink href="/app/clients">Clients</NavLink>
            <NavLink href="/app/settings">Settings</NavLink>
          </nav>

          <form action={logoutAction} className="ml-auto flex items-center gap-4">
            <span className="hidden text-sm text-muted sm:inline">{user.name}</span>
            <button type="submit" className="btn btn-ghost">
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-5 py-7 sm:py-10">{children}</main>
    </div>
  );
}
