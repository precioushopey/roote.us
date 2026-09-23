import systemMen6 from '@/assets/bundles/system-men-6.png';
import systemMen10 from '@/assets/bundles/system-men-10.png';
import systemMen15 from '@/assets/bundles/system-men-15.png';
import systemWomen6 from '@/assets/bundles/system-women-6.png';
import systemWomen10 from '@/assets/bundles/system-women-10.png';
import systemWomen15 from '@/assets/bundles/system-women-15.png';
import grayBundleMen from '@/assets/bundles/gray-bundle-men.png';
import grayBundleWomen from '@/assets/bundles/gray-bundle-women.png';
import regrowthBundleMen6 from '@/assets/bundles/regrowth-bundle-men-6.png';
import regrowthBundleMen10 from '@/assets/bundles/regrowth-bundle-men-10.png';
import regrowthBundleMen15 from '@/assets/bundles/regrowth-bundle-men-15.png';
import regrowthBundleWomen6 from '@/assets/bundles/regrowth-bundle-women-6.png';
import regrowthBundleWomen10 from '@/assets/bundles/regrowth-bundle-women-10.png';
import regrowthBundleWomen15 from '@/assets/bundles/regrowth-bundle-women-15.png';

/** Keyed by `ShopBundle.id` (see `content/bundles.ts`): one photo per
 *  bundle, replacing the `MediaPlaceholder` that rendered before this
 *  photography existed. Complete System and Hair Growth Bundle each have
 *  three level variants per packaging (own id, price, and photo apiece);
 *  the product-page card cycles through its own three ids as a level
 *  selector. */
export const BUNDLE_PHOTOS: Record<string, string> = {
  'complete-system-men-6': systemMen6,
  'complete-system-men-10': systemMen10,
  'complete-system-men-15': systemMen15,
  'complete-system-women-6': systemWomen6,
  'complete-system-women-10': systemWomen10,
  'complete-system-women-15': systemWomen15,
  'gray-support-bundle-men': grayBundleMen,
  'gray-support-bundle-women': grayBundleWomen,
  'hair-growth-bundle-men-6': regrowthBundleMen6,
  'hair-growth-bundle-men-10': regrowthBundleMen10,
  'hair-growth-bundle-men-15': regrowthBundleMen15,
  'hair-growth-bundle-women-6': regrowthBundleWomen6,
  'hair-growth-bundle-women-10': regrowthBundleWomen10,
  'hair-growth-bundle-women-15': regrowthBundleWomen15,
};
