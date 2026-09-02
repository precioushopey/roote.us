import { useSyncExternalStore } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

function subscribe(cb: () => void) {
  if (typeof matchMedia !== 'function') return () => {};
  const mq = matchMedia(QUERY);
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
}
function getSnapshot() {
  return typeof matchMedia === 'function' ? matchMedia(QUERY).matches : true;
}

export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => true);
}
