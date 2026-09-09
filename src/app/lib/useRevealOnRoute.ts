import { useEffect } from 'react';
import { useLocation } from 'react-router';

// Runs once at import, before React's first paint, so `[data-animate]` elements
// start hidden without a flash. Without JS (or with reduced motion, handled in
// CSS) the gate class is simply absent and nothing is hidden.
if (typeof document !== 'undefined') {
  document.documentElement.classList.add('reveal-enabled');
}

/**
 * Reveals every `[data-animate]` element with a smooth rise-up as it enters the
 * viewport, and replays the effect on each route change. Call once from a layout
 * shell.
 */
export function useRevealOnRoute() {
  const { pathname } = useLocation();

  // Every route change (nav item, footer link, CTA) lands at the top of the page,
  // unless the URL targets an in-page anchor — then scroll that element into
  // view instead (rAF so it runs after the new route's DOM has painted).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.location.hash) {
      const id = window.location.hash.slice(1);
      const raf = requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView();
      });
      return () => cancelAnimationFrame(raf);
    }
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    if (typeof IntersectionObserver !== 'function') return;

    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-animate]'));
    if (els.length === 0) return;

    // Re-navigating to the same section tree should play the animation again.
    els.forEach((el) => el.classList.remove('is-visible'));

    const io = new IntersectionObserver(
      (entries, obs) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );

    // Observe on the next frame so elements already in view transition in
    // rather than appearing instantly.
    const raf = requestAnimationFrame(() => els.forEach((el) => io.observe(el)));

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [pathname]);
}
