import { useId, useState, type ReactNode } from 'react';
import { cn } from '@/app/components/ui/utils';

type Props = {
  before: ReactNode;
  after: ReactNode;
  beforeLabel: string;
  afterLabel: string;
  /** accessible name for the range control, e.g. "Reveal before / after" */
  ariaLabel: string;
  /** 0–100, default 50 */
  initial?: number;
  className?: string;
};

/**
 * Accessible before / after comparison. The reveal is driven by a native
 * `<input type="range">` so it works with pointer, touch, and keyboard
 * (arrows / Home / End) for free, and announces position via `aria-valuetext`.
 * User-driven only — no auto motion.
 */
export function BeforeAfterSlider({
  before,
  after,
  beforeLabel,
  afterLabel,
  ariaLabel,
  initial = 50,
  className,
}: Props) {
  const [pos, setPos] = useState(Math.min(100, Math.max(0, initial)));
  const id = useId();

  return (
    <figure className={cn('relative select-none overflow-hidden rounded-xl border border-border', className)}>
      {/* after fills the frame */}
      <div className="relative">
        {after}
        <span className="pointer-events-none absolute bottom-3 end-3 rounded-full bg-cream-50/90 px-2.5 py-1 font-body text-sm font-semibold text-foreground">
          {afterLabel}
        </span>
      </div>

      {/* before clipped to `pos` from the start edge */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
        aria-hidden
      >
        {before}
        <span className="pointer-events-none absolute bottom-3 start-3 rounded-full bg-cream-50/90 px-2.5 py-1 font-body text-sm font-semibold text-foreground">
          {beforeLabel}
        </span>
      </div>

      {/* handle line */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 w-0.5 bg-cream-50 shadow-[0_0_0_1px_rgba(6,46,49,0.25)]"
        style={{ insetInlineStart: `${pos}%` }}
      >
        <span className="absolute top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-deep-800 bg-cream-50 rtl:translate-x-1/2" />
      </span>

      <label htmlFor={id} className="sr-only">
        {ariaLabel}
      </label>
      <input
        id={id}
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-valuetext={`${pos}% ${beforeLabel}, ${100 - pos}% ${afterLabel}`}
        className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
      />
      <figcaption className="sr-only">
        {beforeLabel} / {afterLabel} comparison
      </figcaption>
    </figure>
  );
}
