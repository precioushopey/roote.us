import { useCallback, useState, type ReactNode } from 'react';
import { useT, useLocale, useLocalizedPath } from '@/i18n/LocaleProvider';
import { Button, Drawer } from '@/app/components/roote';
import { PendingChip } from '@/app/components/brand/PendingChip';
import { getProduct } from '@/content/products';
import { findBundle } from '@/content/bundles';
import { pickLocalized } from '@/content/localized';
import { rooteContent } from '@/content/roote.config';
import { TREATMENT_PHOTOS } from '@/content/treatmentPhotos';
import { formatMoney } from '@/domain/report/money';
import { PATHS } from '@/app/paths';

type Added = ({ kind: 'sku'; slug: string } | { kind: 'bundle'; bundleId: string }) & { qty: number };

/** Resolves either kind of added line to the same display shape — a bundle
 *  has no `TREATMENT_PHOTOS` entry (no bundle photography exists yet, see
 *  Products.tsx's `BUNDLE_PHOTOS`), so `photo` is simply absent for one. */
function resolveAdded(added: Added, locale: ReturnType<typeof useLocale>['locale']) {
  if (added.kind === 'sku') {
    const product = getProduct(added.slug);
    if (!product) return null;
    return { name: product.name, subtitle: pickLocalized(product.subtitle, locale), price: product.price, photo: TREATMENT_PHOTOS[added.slug] };
  }
  const bundle = findBundle(added.bundleId);
  if (!bundle) return null;
  return { name: pickLocalized(bundle.name, locale), subtitle: pickLocalized(bundle.summary, locale), price: bundle.price, photo: undefined };
}

/**
 * Post-add confirmation (Mischa review, Douglas.de pattern): instead of a toast
 * that leaves the customer hunting for the header cart icon, slide in a panel
 * with what was just added and two explicit choices — go straight to the cart
 * page, or keep shopping. The caller does the `cart.add()`/`cart.addBundle()`
 * and then `show()`/`showBundle()`.
 */
export function useAddedToCartPanel(): {
  show: (slug: string, qty: number) => void;
  showBundle: (bundleId: string, qty: number) => void;
  panel: ReactNode;
} {
  const [added, setAdded] = useState<Added | null>(null);
  // Stable identity: Drawer's dismiss/focus-trap effect depends on onClose, and
  // a fresh function each render would re-run it (re-stealing focus) every render.
  const close = useCallback(() => setAdded(null), []);
  return {
    show: (slug, qty) => setAdded({ kind: 'sku', slug, qty }),
    showBundle: (bundleId, qty) => setAdded({ kind: 'bundle', bundleId, qty }),
    panel: <AddedToCartPanel added={added} onClose={close} />,
  };
}

function AddedToCartPanel({ added, onClose }: { added: Added | null; onClose: () => void }) {
  const t = useT();
  const cl = useLocale().locale;
  const withLocale = useLocalizedPath();
  const item = added ? resolveAdded(added, cl) : null;

  return (
    <Drawer open={Boolean(added && item)} onClose={onClose} title={t('cart.added')}>
      {added && item && (
        <div className="flex flex-col gap-6">
          <div className="flex gap-4">
            {item.photo ? (
              <img
                src={item.photo}
                alt=""
                className="h-24 w-24 shrink-0 rounded-lg bg-cream-100 object-contain"
              />
            ) : (
              <div className="h-24 w-24 shrink-0 rounded-lg bg-cream-100" />
            )}
            <div className="flex min-w-0 flex-col gap-1">
              <p className="font-display text-base font-medium text-foreground">{item.name}</p>
              <p className="font-body text-sm text-muted-foreground">{item.subtitle}</p>
              <p className="font-body text-sm text-muted-foreground">
                {t('bag.checkout.qty', { qty: String(added.qty) })}
              </p>
              {item.price === null ? (
                <PendingChip label={`${item.name} price`} />
              ) : (
                <p className="font-body text-sm font-medium text-foreground">
                  {formatMoney(item.price * added.qty, rooteContent.currency, cl).formatted}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Button to={withLocale(PATHS.cart)} caps block onClick={onClose}>
              {t('cart.goToCart')}
            </Button>
            <Button variant="secondary" caps block onClick={onClose}>
              {t('bag.continue')}
            </Button>
          </div>
        </div>
      )}
    </Drawer>
  );
}
