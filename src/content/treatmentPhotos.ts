import density6 from '@/assets/products/Level 6.png';
import density10 from '@/assets/products/Level 10.png';
import density15 from '@/assets/products/Level 15.png';

/** Keyed exactly like `roote.config.ts`'s `treatmentRegistry` (and, not by
 *  coincidence, `content/products.ts`'s catalog slugs — same product, same
 *  key, two different content shapes) — this is the `assets` map
 *  `buildReport()` expects for `regimen.items[].photo` / `actives.items[].photo`.
 *  Without it those photos silently render as nothing (the `it.photo &&`
 *  guard in `ReportView.tsx` just skips the `<img>`), which is what shipped
 *  until this file existed: `buildReport()`'s `assets` param defaults to
 *  `{}` and none of its callers were passing anything.
 *
 *  `regrowth-shampoo` / `gray-support` / `gray-serum` are deliberately
 *  omitted — the client-supplied packaging renders for those three SKUs was
 *  a placeholder mockup, not final photography, so it was pulled project-wide
 *  (2026-09-22). `ReportView.tsx` renders a `MediaPlaceholder` for any
 *  regimen item missing here rather than skipping the image slot. */
export const TREATMENT_PHOTOS: Record<string, string> = {
  'density-6': density6,
  'density-10': density10,
  'density-15': density15,
};
