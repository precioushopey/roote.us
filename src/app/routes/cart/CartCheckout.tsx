import { Link, Navigate, useNavigate } from 'react-router';
import { useT, useLocale, useLocalizedPath } from '@/i18n/LocaleProvider';
import { useCart } from '@/store/cart';
import { resolveCartLines } from '@/store/cartLines';
import { useAuth } from '@/store/auth';
import { rooteContent } from '@/content/roote.config';
import { formatMoney } from '@/domain/report/money';
import { CheckoutFields } from '@/app/components/checkout/CheckoutFields';
import { submitPayment, type CartOrder, type Contact, type CardRef } from '@/store/checkout';
import { recordOrder } from '@/store/orders';
import { Section, DisplayTitle } from '@/app/components/roote';
import { PendingChip } from '@/app/components/brand/PendingChip';
import { PATHS } from '@/app/paths';
import { useState } from 'react';

export function CartCheckout() {
  const t = useT();
  const cl = useLocale().locale;
  const navigate = useNavigate();
  const withLocale = useLocalizedPath();
  const cart = useCart();
  const auth = useAuth();

  const lines = resolveCartLines(cart.lines, cl);
  // See CartPage.tsx — real arithmetic on already-supplied per-line prices, not
  // invented; stays [PENDING] if any line lacks one, or (for the total) since
  // shipping has no supplied rate yet.
  const subtotal = lines.every((l) => l.price !== null)
    ? lines.reduce((sum, l) => sum + l.price! * l.qty, 0)
    : null;

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState(false);

  // Once the order is placed we clear the cart, so the empty-cart guard below
  // must not fire during that same render and bounce us back to /cart.
  if (lines.length === 0 && !placed) return <Navigate to={withLocale(PATHS.cart)} replace />;

  async function onSubmit({ contact, card }: { contact: Contact; card: CardRef }) {
    setError(null);
    setSubmitting(true);
    const itemCount = cart.lines.reduce((n, l) => n + l.qty, 0);
    const order: CartOrder = { kind: 'cart', lines: cart.lines, contact, card };
    try {
      const result = await submitPayment(order);
      setPlaced(true);
      recordOrder({
        id: result.orderId,
        kind: 'cart',
        at: new Date().toISOString(),
        label: t('bag.checkout.qty', { qty: String(itemCount) }),
        // `lines` is already resolved against the catalog (real names, not
        // raw skus/bundle ids) — captured here, before `cart.clear()` below,
        // so order history can show exactly what was bought. `slug` (SKU
        // lines only) lets order history render the product's real photo/
        // subtitle/badges, not just its name.
        items: lines.map((l) => ({ name: l.name, qty: l.qty, slug: l.sku })),
      });
      navigate(withLocale(PATHS.cartSuccess), { state: { orderId: result.orderId } });
      cart.clear();
    } catch {
      setError(t('bag.checkout.error.payment'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Section tone="cream" className="pt-28 md:pt-32" gap={12}>
      <DisplayTitle as="h1" step="xl">
        {t('bag.checkout.title')}
      </DisplayTitle>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1fr]">
        <div className="flex flex-col gap-4">
          <CheckoutFields
            className="max-w-lg"
            submitting={submitting}
            error={error}
            defaultEmail={auth.email ?? ''}
            onSubmit={onSubmit}
          />
          <Link to={withLocale(PATHS.cart)} className="max-w-lg text-center text-sm text-muted-foreground underline">
            {t('bag.checkout.back')}
          </Link>
        </div>

        <aside className="h-fit rounded-xl border border-border bg-background p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium">{t('bag.checkout.summaryTitle')}</h2>
            <Link to={withLocale(PATHS.cart)} className="text-sm text-accent underline">{t('bag.checkout.edit')}</Link>
          </div>
          <ul className="mt-4 flex flex-col divide-y divide-border">
            {lines.map((line) => (
              <li key={line.id} className="flex items-center gap-4 py-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-cream-100" />
                <div className="flex flex-1 flex-col">
                  <span className="text-sm">{line.name}</span>
                  <span className="text-sm text-muted-foreground">{t('bag.checkout.qty', { qty: String(line.qty) })}</span>
                </div>
                {line.price === null ? (
                  <PendingChip label={`${line.name} price`} />
                ) : (
                  <span className="text-sm font-medium text-foreground">
                    {formatMoney(line.price * line.qty, rooteContent.currency, cl).formatted}
                  </span>
                )}
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between text-sm">
            <span>{t('cart.subtotal')}</span>
            {subtotal === null ? (
              <PendingChip label="cart subtotal" />
            ) : (
              <span className="text-foreground">{formatMoney(subtotal, rooteContent.currency, cl).formatted}</span>
            )}
          </div>
          <div className="mt-1 flex items-center justify-between text-sm text-muted-foreground">
            <span>{t('bag.shipping')}</span>
            <PendingChip label="shipping" />
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-sm font-medium">
            <span>{t('bag.total')}</span>
            <PendingChip label="cart total" />
          </div>
        </aside>
      </div>
    </Section>
  );
}
