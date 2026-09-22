import density6 from '@/assets/products/Level 6.png';
import density10 from '@/assets/products/Level 10.png';
import density15 from '@/assets/products/Level 15.png';
import graySupport from '@/assets/products/Gray Support.png';
import graySerum from '@/assets/products/Gray Serum.png';
import regrowthShampoo from '@/assets/products/Regrowth Shampoo.png';

/** Keyed exactly like `roote.config.ts`'s `treatmentRegistry` (and, not by
 *  coincidence, `content/products.ts`'s catalog slugs — same product, same
 *  key, two different content shapes) — this is the `assets` map
 *  `buildReport()` expects for `regimen.items[].photo` / `actives.items[].photo`.
 *  Without it those photos silently render as nothing (the `it.photo &&`
 *  guard in `ReportView.tsx` just skips the `<img>`), which is what shipped
 *  until this file existed: `buildReport()`'s `assets` param defaults to
 *  `{}` and none of its callers were passing anything. */
export const TREATMENT_PHOTOS: Record<string, string> = {
  'density-6': density6,
  'density-10': density10,
  'density-15': density15,
  'gray-support': graySupport,
  'gray-serum': graySerum,
  'regrowth-shampoo': regrowthShampoo,
};
