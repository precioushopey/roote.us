import { useLayoutEffect, useRef } from 'react';

/** Read by `DisplayTitle`'s inline `fontSize` (`calc(... * var(--roote-title-fit, 1))`). */
export const FIT_TITLE_VAR = '--roote-title-fit';

const SCALE_STEP = 0.05;
const MIN_SCALE = 0.7;

/**
 * Shrinks a heading element in `SCALE_STEP` increments (down to `MIN_SCALE`)
 * until its text wraps to at most `maxLines` lines. The base size still
 * comes from `displayScale`'s viewport-fluid `clamp()` — this only claws
 * back an extra line for translations that are longer than English at the
 * same font size (headline copy varies a lot across the six locales).
 * Re-measures on mount and whenever the element's box resizes.
 */
export function useFitTitle<T extends HTMLElement>(maxLines: number) {
  const ref = useRef<T>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    let frame = 0;

    const fit = () => {
      let scale = 1;
      el.style.setProperty(FIT_TITLE_VAR, String(scale));
      el.offsetHeight; // flush the reset before measuring

      for (let i = 0; i < 20 && scale > MIN_SCALE; i++) {
        const style = getComputedStyle(el);
        const fontSize = parseFloat(style.fontSize);
        const lineHeight = parseFloat(style.lineHeight) || fontSize * 1.05;
        // Round rather than a hard height ceiling — sub-pixel line-height
        // rounding can otherwise read an exact-fit title as one line over.
        const lines = Math.round(el.scrollHeight / lineHeight);
        if (lines <= maxLines) break;
        scale = Math.max(MIN_SCALE, scale - SCALE_STEP);
        el.style.setProperty(FIT_TITLE_VAR, String(scale));
        el.offsetHeight;
      }
    };

    fit();

    // The display face loads via Google Fonts `display=swap` (index.html) —
    // this first pass can measure the fallback serif's metrics before it
    // swaps in, over-shrinking. Re-measure once the real font is ready.
    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) fit();
    });

    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(fit);
    });
    observer.observe(el);

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  });

  return ref;
}
