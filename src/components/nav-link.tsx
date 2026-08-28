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
      // Underlined rather than pill-highlighted — a ledger marks its place with a rule.
      className={`border-b-2 px-1.5 py-1 text-sm transition-colors ${
        active
          ? "border-ink font-medium text-ink"
          : "border-transparent text-muted hover:text-ink"
      }`}
    >
      {children}
    </Link>
  );
}
