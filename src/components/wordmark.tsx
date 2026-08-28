/**
 * The wordmark: a single rank chevron set against the name.
 *
 * "Notch" is read as the idiom — top-notch, taking it up a notch — so the mark
 * rises. The chevron is the insignia sense of a notch: rank earned, a stripe on
 * a sleeve. That suits a product for people whose job is making someone better.
 *
 * Drawn deliberately unlike the UI caret it could otherwise be mistaken for:
 * broader than tall (3:2), heavier in the stroke, with a mitred apex and cut
 * ends rather than rounded ones — closer to something stamped or carved than to
 * something you click. Nothing else in this product uses a chevron, so there is
 * no control for it to collide with.
 *
 * Sized to cap height rather than the em: a mark set to the full em box reads
 * oversized beside the letters, having no ascender or descender to absorb it.
 */

/*
 * Angle and weight were compared at real header size before settling here. A
 * shallow 3:2 chevron on a light stroke reads as a UI caret; at 6:5 with a 3.8
 * stroke it reads as a stamped stripe. Heavier than this starts to outweigh
 * Erode's stems and the lockup comes apart.
 */
/** Chevron height as a fraction of the type size. */
const MARK_HEIGHT = 0.66;
/** viewBox is 24×20 — width must track height or the apex skews. */
const VIEWBOX_RATIO = 24 / 20;

export function Wordmark({ className = "", size = 20 }: { className?: string; size?: number }) {
  const markHeight = size * MARK_HEIGHT;
  const markWidth = markHeight * VIEWBOX_RATIO;

  return (
    <span className={`inline-flex items-center ${className}`} style={{ gap: size * 0.34 }}>
      <svg
        width={markWidth}
        height={markHeight}
        viewBox="0 0 24 20"
        fill="none"
        aria-hidden
        className="shrink-0"
      >
        <path
          d="M3 17 12 3.6l9 13.4"
          stroke="currentColor"
          strokeWidth={3.8}
          strokeLinejoin="miter"
          strokeLinecap="butt"
        />
      </svg>
      <span className="display" style={{ fontSize: size }}>
        Notch
      </span>
    </span>
  );
}
