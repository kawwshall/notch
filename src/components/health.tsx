import type { PackHealth } from "@/lib/packs";

const TONE: Record<PackHealth, { bg: string; fg: string; dot: string; word: string }> = {
  ok: { bg: "bg-ok-soft", fg: "text-ok", dot: "bg-ok", word: "On track" },
  low: { bg: "bg-low-soft", fg: "text-low", dot: "bg-low", word: "Nearly out" },
  out: { bg: "bg-out-soft", fg: "text-out", dot: "bg-out", word: "Out" },
};

export function HealthPill({ health, label }: { health: PackHealth; label?: string }) {
  const tone = TONE[health];
  return (
    <span className={`pill ${tone.bg} ${tone.fg}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} aria-hidden />
      {label ?? tone.word}
    </span>
  );
}

/**
 * The number that matters most in the whole app: sessions left. Rendered big,
 * with a progress bar underneath so remaining reads against the pack size.
 */
export function RemainingMeter({
  remaining,
  total,
  health,
  compact = false,
}: {
  remaining: number;
  total: number;
  health: PackHealth;
  compact?: boolean;
}) {
  const tone = TONE[health];
  const clamped = Math.max(0, remaining);
  const pct = total > 0 ? Math.round((clamped / total) * 100) : 0;

  return (
    <div className={compact ? "" : "min-w-[7rem]"}>
      <div className="flex items-baseline gap-1">
        <span className={`display ${compact ? "text-2xl" : "text-4xl"} ${tone.fg} tabular-nums`}>
          {clamped}
        </span>
        <span className="text-sm text-muted">/ {total} left</span>
      </div>
      <div
        className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-line"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={`${clamped} of ${total} sessions remaining`}
      >
        <div className={`h-full rounded-full ${tone.dot}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
