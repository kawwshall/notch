import Link from "next/link";

export function MarketingHeader({ signedIn }: { signedIn: boolean }) {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-4">
        <Link href="/" className="display text-xl">
          Session<span className="text-brand">Pack</span>
        </Link>
        <nav className="ml-auto flex items-center gap-1 sm:gap-2">
          <Link href="/pricing" className="btn btn-ghost">
            Pricing
          </Link>
          {signedIn ? (
            <Link href="/app" className="btn btn-primary">
              Open SessionPack
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
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-6 text-sm text-muted">
        <span className="display text-base text-ink">
          Session<span className="text-brand">Pack</span>
        </span>
        <Link href="/pricing" className="hover:text-ink">
          Pricing
        </Link>
        <Link href="/login" className="hover:text-ink">
          Sign in
        </Link>
        <span className="ml-auto">Built for people who teach one person at a time.</span>
      </div>
    </footer>
  );
}
