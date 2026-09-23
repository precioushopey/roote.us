import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useT, useLocale, useLocalizedPath } from '@/i18n/LocaleProvider';
import { LOCALES, type LocaleCode } from '@/i18n/locales';
import { useAuth } from '@/store/auth';
import { readOrders, type OrderRecord } from '@/store/orders';
import { getProduct, PRODUCTS, type ProductBadge } from '@/content/products';
import { pickLocalized } from '@/content/localized';
import { formatMoney } from '@/domain/report/money';
import { rooteContent } from '@/content/roote.config';
import { TREATMENT_PHOTOS } from '@/content/treatmentPhotos';
import { Badge, Button, Modal, Prose, ProductCard } from '@/app/components/roote';
import { PATHS } from '@/app/paths';
import { AccountPageHeader } from './AccountPageHeader';

const BADGE_LABEL_KEY: Record<ProductBadge, string> = {
  vegan: 'marketing.pdp.badge.vegan',
  'cruelty-free': 'marketing.pdp.badge.crueltyFree',
  'fragrance-free': 'marketing.pdp.badge.fragranceFree',
  'paraben-free': 'marketing.pdp.badge.parabenFree',
  'sulfate-free': 'marketing.pdp.badge.sulfateFree',
};

/** One purchased line, laid out exactly like a shop-grid product card
 *  (`/products` — same `ProductCard` component, same photo/name/subtitle/
 *  price treatment), plus the quantity actually bought and its free-from
 *  badge pills underneath. `item.name` is always the product's real,
 *  exact name (set from the same `resolveCartLines` that also sets `slug`)
 *  even on an order recorded before `slug` existed, so a name match is a
 *  reliable fallback there — only a genuinely unresolvable product (since
 *  removed from the catalog, or renamed) falls through to the plain
 *  name/qty line below. */
function OrderItemCard({ item, locale }: { item: NonNullable<OrderRecord['items']>[number]; locale: LocaleCode }) {
  const t = useT();
  const withLocale = useLocalizedPath();
  const product = (item.slug && getProduct(item.slug)) || PRODUCTS.find((p) => p.name === item.name);

  if (!product) {
    return (
      <div className="flex items-center justify-between gap-2 rounded-sm border border-border p-4 text-sm">
        <span className="text-foreground">{item.name}</span>
        <span className="shrink-0 text-muted-foreground tabular-nums">×{item.qty}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <ProductCard
        name={product.name}
        subtitle={pickLocalized(product.subtitle, locale)}
        to={withLocale(PATHS.product(product.slug))}
        priceLabel={product.price === null ? null : formatMoney(product.price, rooteContent.currency, locale).formatted}
        packaging={product.concern === 'gray' || product.concern === 'gray-support' ? 'women' : 'men'}
        mediaAlt={t('common.packagingAlt', { name: product.name })}
        mediaLabel={`${product.name}: product photography`}
        image={TREATMENT_PHOTOS[product.slug]}
      />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-body text-sm text-muted-foreground">
          {t('bag.checkout.qty', { qty: String(item.qty) })}
        </span>
        {product.badges.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {product.badges.map((b) => (
              <Badge key={b} tone="neutral">
                {t(BADGE_LABEL_KEY[b] as never)}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Dedicated order-history page (2026-09-23) — was a short list embedded in
 * Profile; split back out to its own page taking over the sidebar/
 * bottom-nav slot that used to be labeled "Support" (that content —
 * care-team messages, the contact form, the rescan link — moved into
 * Profile itself; see AppProfile.tsx). Each order is its own section; its
 * purchased items render in the exact same grid/card layout as the shop
 * page (`/products`, `ProductCard`) rather than a plain list — a narrow
 * per-order grid cell couldn't fit that card treatment, so each order gets
 * the full page width for its own item grid instead.
 *
 * Reachable without an active program, same as Profile: `store/orders.ts`
 * is a flat, unauthenticated list scoped to this browser, not to a program,
 * so a signed-up guest who only ever placed a cart order still needs a way
 * to see it.
 */
export function AppOrders() {
  const t = useT();
  const { locale } = useLocale();
  const withLocale = useLocalizedPath();
  const navigate = useNavigate();
  const auth = useAuth();
  const orders = useMemo(() => readOrders(), []);
  const [leaveWarningOpen, setLeaveWarningOpen] = useState(false);

  /* The only intended way out of /account is Log out — a link that browses
     away (e.g. Shop products) instead confirms first, since it's really
     asking to sign the user out to go do something else. Same rule as
     Profile's own "Shop products" link (AppProfile.tsx). */
  function confirmLeaveToShop() {
    setLeaveWarningOpen(false);
    auth.signOut();
    navigate(withLocale(PATHS.products));
  }

  return (
    <div data-animate className="flex flex-col gap-4 md:gap-8">
      <AccountPageHeader eyebrow={t('app.nav.orders')} title={t('app.profile.orders.title')} />

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setLeaveWarningOpen(true)}
          className="font-body text-sm text-accent underline"
        >
          {t('app.nav.shop')}
        </button>
      </div>

      {orders.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('app.profile.orders.empty')}</p>
      ) : (
        <div className="flex flex-col gap-8">
          {orders.map((o) => (
            <section
              key={o.id}
              className="flex flex-col gap-4 border-t border-border pt-8 first:border-t-0 first:pt-0"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <Badge tone="neutral">
                    {t(o.kind === 'program' ? 'app.profile.orders.program' : 'app.profile.orders.bag')}
                  </Badge>
                  <p className="font-body text-sm font-medium tabular-nums" dir="ltr">
                    {o.id}
                  </p>
                </div>
                <span className="text-sm text-muted-foreground">
                  {new Date(o.at).toLocaleDateString(LOCALES[locale].bcp47)}
                </span>
              </div>

              {/* Older orders (recorded before `items` existed) only ever have
                  the generic "Qty N" label — fall back to that rather than
                  showing nothing. */}
              {o.items && o.items.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {o.items.map((item, i) => (
                    <OrderItemCard key={i} item={item} locale={locale} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{o.label}</p>
              )}
            </section>
          ))}
        </div>
      )}

      <Modal
        open={leaveWarningOpen}
        onClose={() => setLeaveWarningOpen(false)}
        title={t('app.profile.leaveWarning.title')}
        footer={
          <>
            <Button variant="ghost" onClick={() => setLeaveWarningOpen(false)}>
              {t('common.back')}
            </Button>
            <Button variant="danger" onClick={confirmLeaveToShop}>
              {t('app.profile.leaveWarning.confirm')}
            </Button>
          </>
        }
      >
        <Prose>{t('app.profile.leaveWarning.body')}</Prose>
      </Modal>
    </div>
  );
}
