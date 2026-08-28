"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  // "/app" should only light up on the dashboard itself, not every nested page.
  const active = href === "/app" ? pathname === "/app" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors ${
        active ? "bg-brand-soft text-brand-ink" : "text-muted hover:text-ink"
      }`}
    >
      {children}
    </Link>
  );
}
