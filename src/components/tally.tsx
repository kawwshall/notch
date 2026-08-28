import type { PackHealth } from "@/lib/packs";

/*
 * The brand device. Sessions are drawn as real tally marks — groups of four
 * uprights crossed by a fifth diagonal, the way anyone counts on paper.
 *
 * Used and remaining are drawn as two *separate* well-formed tallies rather
 * than one run that changes colour partway. That matters: pack sizes are
 * nearly always multiples of five, so a single run would render the common
 * "one session left" state as a lone diagonal slash — the least legible mark
 * in the set. Split into two tallies, the remainder always starts at the first
 * upright of its own group and reads cleanly at any count.
 */

const GEOMETRY = {
  /** Horizontal pitch between uprights inside a group. */
  step: 6,
  /** Gap between one group of five and the next. */
  groupGap: 11,
  /** Diagonal overhang either side of the four uprights. */
  overhang: 3,
  height: 24,
  strokeWidth: 2,
};

const GROUP_SPAN = GEOMETRY.step * 3 + GEOMETRY.overhang * 2;
const GROUP_PITCH = GROUP_SPAN + GEOMETRY.groupGap;

/** Past this many sessions the marks stop being scannable, so we don't draw them. */
export const TALLY_LIMIT = 40;

const HEALTH_STROKE: Record<PackHealth, string> = {
  ok: "var(--color-ok)",
  low: "var(--color-low)",
  out: "var(--color-out)",
};

function groupWidth(count: number) {
  const groups = Math.ceil(count / 5);
  return groups === 0 ? 0 : groups * GROUP_PITCH - GEOMETRY.groupGap;
}

/** One run of `count` tally marks in a single colour, starting at x = offset. */
function Run({ count, color, offset }: { count: number; color: string; offset: number }) {
  const { height, step, overhang, strokeWidth } = GEOMETRY;

  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const groupX = offset + Math.floor(i / 5) * GROUP_PITCH;
        const positionInGroup = i % 5;

        // The fifth mark in a group is the diagonal struck across the other four.
        if (positionInGroup === 4) {
          return (
            <line
              key={i}
              x1={groupX}
              y1={height - 2}
              x2={groupX + step * 3 + overhang * 2}
              y2={2}
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
          );
        }

        const x = groupX + overhang + positionInGroup * step;
        return (
          <line
            key={i}
            x1={x}
            y1={1}
            x2={x}
            y2={height - 1}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        );
      })}
    </>
  );
}

export function TallyMarks({
  total,
  remaining,
  health,
  scale = 1,
  className = "",
}: {
  total: number;
  remaining: number;
  health: PackHealth;
  scale?: number;
  className?: string;
}) {
  if (total > TALLY_LIMIT) return null;

  const left = Math.min(total, Math.max(0, remaining));
  const used = total - left;

  const usedWidth = groupWidth(used);
  // Space between the spent run and the remaining run, when both are present.
  const divide = used > 0 && left > 0 ? GEOMETRY.groupGap + 5 : 0;
  const width = usedWidth + divide + groupWidth(left);
  const { height } = GEOMETRY;

  return (
    <svg
      className={className}
      width={Math.max(width, 1) * scale}
      height={height * scale}
      viewBox={`0 0 ${Math.max(width, 1)} ${height}`}
      fill="none"
      role="img"
      aria-label={`${left} of ${total} sessions remaining`}
    >
      <Run count={used} color="var(--color-rule)" offset={0} />
      <Run count={left} color={HEALTH_STROKE[health]} offset={usedWidth + divide} />
    </svg>
  );
}

/**
 * The headline count. Big Erode numeral over the tally, or — for packs too
 * large to draw — a plain rule so the layout doesn't collapse.
 */
export function SessionCount({
  remaining,
  total,
  health,
  size = "lg",
}: {
  remaining: number;
  total: number;
  health: PackHealth;
  size?: "lg" | "sm";
}) {
  const clamped = Math.max(0, remaining);
  const tone = { ok: "text-ok", low: "text-low", out: "text-out" }[health];

  return (
    <div className="flex shrink-0 flex-col items-end gap-2.5">
      <div className="flex items-baseline gap-1.5">
        <span className={`num ${size === "lg" ? "text-5xl" : "text-3xl"} ${tone}`}>
          {clamped}
        </span>
        <span className="text-sm text-muted">of {total} left</span>
      </div>
      {total <= TALLY_LIMIT ? (
        <TallyMarks
          total={total}
          remaining={clamped}
          health={health}
          scale={size === "lg" ? 0.92 : 0.72}
        />
      ) : (
        <div className="h-px w-24 bg-rule" />
      )}
    </div>
  );
}
