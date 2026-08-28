/**
 * The wordmark: four uprights and a crossing fifth — one complete tally group —
 * set against the name. The mark is the product's core device at logo scale,
 * so the brand and the interface are made of the same thing.
 */
export function Wordmark({ className = "", size = 20 }: { className?: string; size?: number }) {
  const height = size;
  const width = size * 1.15;

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        width={width}
        height={height}
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
            strokeWidth={2.2}
            strokeLinecap="round"
          />
        ))}
        <line
          x1={0.5}
          y1={22}
          x2={22.5}
          y2={2}
          stroke="currentColor"
          strokeWidth={2.2}
          strokeLinecap="round"
        />
      </svg>
      <span className="display" style={{ fontSize: size * 1.05 }}>
        Notch
      </span>
    </span>
  );
}
