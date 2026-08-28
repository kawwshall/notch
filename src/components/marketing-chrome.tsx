import Link from "next/link";

import { Wordmark } from "./wordmark";

export function MarketingHeader({ signedIn }: { signedIn: boolean }) {
  return (
    <header className="border-b border-rule">
      <div className="mx-auto flex max-w-5xl items-center gap-4 px-5 py-4">
        <Link href="/" aria-label="Notch home">
          <Wordmark size={19} />
        </Link>
        <nav className="ml-auto flex items-center gap-2 sm:gap-3">
          <Link href="/pricing" className="btn btn-ghost">
            Pricing
          </Link>
          {signedIn ? (
            <Link href="/app" className="btn btn-primary">
              Open Notch
            </Link>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost">
                Sign in
              </Link>
              <Link href="/register" className="btn btn-primary">
                Start free
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export function MarketingFooter() {
  return (
    <footer className="border-t border-rule">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-3 px-5 py-7 text-sm text-muted">
        <Wordmark size={15} className="text-ink" />
        <Link href="/pricing" className="hover:text-ink">
          Pricing
        </Link>
        <Link href="/login" className="hover:text-ink">
          Sign in
        </Link>
        <span className="ml-auto">For people who teach one person at a time.</span>
      </div>
    </footer>
  );
}
