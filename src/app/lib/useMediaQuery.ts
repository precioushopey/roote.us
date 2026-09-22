import { useSyncExternalStore } from 'react';

function subscribe(query: string) {
  return (cb: () => void) => {
    if (typeof matchMedia !== 'function') return () => {};
    const mq = matchMedia(query);
    if (!mq || typeof mq.addEventListener !== 'function') return () => {};
    mq.addEventListener('change', cb);
    return () => mq.removeEventListener('change', cb);
  };
}

/** Reactive `matchMedia` — same `useSyncExternalStore` shape as
 *  `useReducedMotion`. SSR/no-`matchMedia` snapshot defaults to `false`. */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    subscribe(query),
    () => (typeof matchMedia === 'function' ? matchMedia(query).matches : false),
    () => false,
  );
}
