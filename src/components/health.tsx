import type { PackHealth } from "@/lib/packs";

const TONE: Record<PackHealth, { bg: string; fg: string; word: string }> = {
  ok: { bg: "bg-ok-soft", fg: "text-ok", word: "On track" },
  low: { bg: "bg-low-soft", fg: "text-low", word: "Nearly out" },
  out: { bg: "bg-out-soft", fg: "text-out", word: "Out" },
};

/** A squared-off mark in the margin, like a stamp on a ledger entry. */
export function StatusStamp({ health, label }: { health: PackHealth; label?: string }) {
  const tone = TONE[health];
  return <span className={`stamp ${tone.bg} ${tone.fg}`}>{label ?? tone.word}</span>;
}
