import { useSyncExternalStore } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

function subscribe(cb: () => void) {
  if (typeof matchMedia !== 'function') return () => {};
  const mq = matchMedia(QUERY);
  if (!mq || typeof mq.addEventListener !== 'function') return () => {};
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
}
function getSnapshot() {
  if (typeof matchMedia !== 'function') return true;
  return matchMedia(QUERY)?.matches ?? true;
}

export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => true);
}
