export type PendingMarker = { __pending: true; label: string };
export type PendingItem = { path: string; label: string };

export const PENDING = (label: string): PendingMarker => ({ __pending: true, label });

export function isPending(v: unknown): v is PendingMarker {
  return typeof v === 'object' && v !== null && (v as PendingMarker).__pending === true;
}

export function collectPending(node: unknown, basePath = ''): PendingItem[] {
  if (isPending(node)) return [{ path: basePath, label: node.label }];
  if (node === null) return [{ path: basePath, label: basePath || 'value' }];
  if (Array.isArray(node)) {
    return node.flatMap((child, i) =>
      collectPending(child, basePath ? `${basePath}.${i}` : String(i)));
  }
  if (typeof node === 'object') {
    return Object.entries(node as Record<string, unknown>).flatMap(([k, v]) =>
      collectPending(v, basePath ? `${basePath}.${k}` : k));
  }
  return [];
}

/** Paths in rooteContent expected to be unresolved as of P0/P1 — reconcile when the client supplies values (P2a). */
export const KNOWN_PENDING: string[] = [
  'currency (placeholder ILS — confirm)',
  'programDurations.0.price', 'programDurations.1.price', 'programDurations.2.price',
  'programDurations.3.price', 'programDurations.4.price',
  'claims.effectiveness.value', 'claims.timeToVisibleResults.value',
  'claims.rescanWindow.value', 'claims.doctorFollowUpCost.value',
];
