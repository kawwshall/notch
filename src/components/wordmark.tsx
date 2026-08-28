/**
 * The wordmark: four uprights and a crossing fifth — one complete tally group —
 * set against the name. The mark is the product's core device at logo scale, so
 * the brand and the interface are made of the same thing.
 *
 * `size` is the type size. The mark is sized to Erode's cap height rather than
 * the full em, because a glyph set to the em box always reads oversized next to
 * the letters it sits beside — there is no ascender or descender to absorb it.
 * The viewBox is 23×24, so width tracks height to keep the strokes square.
 */

/** Erode's cap height as a fraction of em, measured off the rendered face. */
const CAP_HEIGHT = 0.7;
const VIEWBOX_RATIO = 23 / 24;

export function Wordmark({ className = "", size = 20 }: { className?: string; size?: number }) {
  const markHeight = size * CAP_HEIGHT;
  const markWidth = markHeight * VIEWBOX_RATIO;

  return (
    <span className={`inline-flex items-center ${className}`} style={{ gap: size * 0.36 }}>
      <svg
        width={markWidth}
        height={markHeight}
        viewBox="0 0 23 24"
        fill="none"
        aria-hidden
        className="shrink-0"
      >
        {[3, 9, 15, 21].map((x) => (
          <line
            key={x}
            x1={x}
            y1={1.5}
            x2={x}
            y2={22.5}
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
          />
        ))}
        <line
          x1={0.5}
          y1={22}
          x2={22.5}
          y2={2}
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
        />
      </svg>
      <span className="display" style={{ fontSize: size }}>
        Notch
      </span>
    </span>
  );
}
