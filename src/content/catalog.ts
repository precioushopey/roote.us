import type { MessageKey } from '@/i18n/messages';
import minoxidil5 from '@/assets/PRODUCTS/minoxidil 5_ topical treatment.png';
import peptideOil from '@/assets/PRODUCTS/peptide bond repair oil.png';
import bondShampoo from '@/assets/PRODUCTS/bond renewal shampoo.png';
import scalpShampoo from '@/assets/PRODUCTS/scalp balance shampooo.png';
import conditioner from '@/assets/PRODUCTS/repair & hydrate conditioner.png';
import growthCaps from '@/assets/PRODUCTS/growth capsules.png';
import nutrientCaps from '@/assets/PRODUCTS/nutrient restore capsules.png';
import marineCollagen from '@/assets/PRODUCTS/marine collage complex.png';
import browLashSerum from '@/assets/PRODUCTS/brow and lash serum.png';
import browDensity from '@/assets/PRODUCTS/brow density serum.png';
import lashLength from '@/assets/PRODUCTS/lash lenght serum.png';
import showerHead from '@/assets/PRODUCTS/shower head.png';
import showerHose from '@/assets/PRODUCTS/shower with hose.png';
import mountedCartridge from '@/assets/PRODUCTS/mounted filter cartridge.png';
import handheldCartridge from '@/assets/PRODUCTS/handheld filter cartridge.png';

export type CatalogProduct = {
  sku: string;
  name: string;
  descKey: MessageKey;
  photo: string;
};

export type CatalogCategory = {
  titleKey: MessageKey;
  items: CatalogProduct[];
};

export const CATALOG: CatalogCategory[] = [
  {
    titleKey: 'marketing.products.cat.growth',
    items: [
      { sku: 'minoxidil-5', name: 'Minoxidil 5% Topical Treatment', descKey: 'marketing.products.item.minoxidil5.desc', photo: minoxidil5 },
      { sku: 'peptide-repair-oil', name: 'Peptide Bond Repair Oil', descKey: 'marketing.products.item.peptideOil.desc', photo: peptideOil },
    ],
  },
  {
    titleKey: 'marketing.products.cat.wash',
    items: [
      { sku: 'bond-renewal-shampoo', name: 'Bond Renewal Shampoo', descKey: 'marketing.products.item.bondShampoo.desc', photo: bondShampoo },
      { sku: 'scalp-balance-shampoo', name: 'Scalp Balance Shampoo', descKey: 'marketing.products.item.scalpShampoo.desc', photo: scalpShampoo },
      { sku: 'repair-hydrate-conditioner', name: 'Repair & Hydrate Conditioner', descKey: 'marketing.products.item.conditioner.desc', photo: conditioner },
    ],
  },
  {
    titleKey: 'marketing.products.cat.supplements',
    items: [
      { sku: 'growth-capsules', name: 'Growth Capsules', descKey: 'marketing.products.item.growthCaps.desc', photo: growthCaps },
      { sku: 'nutrient-restore-capsules', name: 'Nutrient Restore Capsules', descKey: 'marketing.products.item.nutrientCaps.desc', photo: nutrientCaps },
      { sku: 'marine-collagen-complex', name: 'Marine Collagen Complex', descKey: 'marketing.products.item.marineCollagen.desc', photo: marineCollagen },
    ],
  },
  {
    titleKey: 'marketing.products.cat.lashBrow',
    items: [
      { sku: 'brow-lash-serum', name: 'Brow & Lash Serum', descKey: 'marketing.products.item.browLash.desc', photo: browLashSerum },
      { sku: 'brow-density-serum', name: 'Brow Density Serum', descKey: 'marketing.products.item.browDensity.desc', photo: browDensity },
      { sku: 'lash-length-serum', name: 'Lash Length Serum', descKey: 'marketing.products.item.lashLength.desc', photo: lashLength },
    ],
  },
  {
    titleKey: 'marketing.products.cat.shower',
    items: [
      { sku: 'filtered-shower-head', name: 'Filtered Shower Head', descKey: 'marketing.products.item.showerHead.desc', photo: showerHead },
      { sku: 'filtered-handheld-shower', name: 'Filtered Handheld Shower', descKey: 'marketing.products.item.showerHose.desc', photo: showerHose },
      { sku: 'mounted-filter-cartridge', name: 'Mounted Filter Cartridge', descKey: 'marketing.products.item.mountedCartridge.desc', photo: mountedCartridge },
      { sku: 'handheld-filter-cartridge', name: 'Handheld Filter Cartridge', descKey: 'marketing.products.item.handheldCartridge.desc', photo: handheldCartridge },
    ],
  },
];

const BY_SKU: Record<string, CatalogProduct> = Object.fromEntries(
  CATALOG.flatMap((c) => c.items).map((p) => [p.sku, p]),
);

export function findProduct(sku: string): CatalogProduct | undefined {
  return BY_SKU[sku];
}
