import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { useLocale } from '@/i18n/LocaleProvider';
import { useReducedMotion } from './useReducedMotion';

/**
 * Drives the hero-wordmark-to-navbar-wordmark scroll "merge" on the bare
 * homepage: 0 means the hero's own large overlapping wordmark is fully
 * shown and the navbar's is hidden; 1 means the reverse (normal navbar).
 * Every other route, and reduced-motion, are pinned at 1 (always-normal
 * navbar, no oversized hero wordmark) — both the Header and the Home hero
 * call this same hook independently, so their crossfade stays in sync
 * without any shared state between them.
 */
export function useHeroLogoReveal(distance = 320): number {
  const { pathname } = useLocation();
  const { localeRegion } = useLocale();
  const reducedMotion = useReducedMotion();
  const isHome = pathname === `/${localeRegion}`;
  const [reveal, setReveal] = useState(1);

  useEffect(() => {
    if (!isHome || reducedMotion) {
      setReveal(1);
      return;
    }
    const onScroll = () => setReveal(Math.min(1, Math.max(0, window.scrollY / distance)));
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHome, reducedMotion, distance]);

  return reveal;
}
