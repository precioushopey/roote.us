import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router';
import { useT, useLocalizedPath } from '@/i18n/LocaleProvider';
import { useCart } from '@/store/cart';
import { findProduct } from '@/content/catalog';
import { CheckoutFields } from '@/app/components/checkout/CheckoutFields';
import { submitPayment, type BagOrder, type Contact, type CardRef } from '@/store/checkout';
import { recordOrder } from '@/store/orders';
import { Section, DisplayTitle } from '@/app/components/roote';
import { PendingChip } from '@/app/components/brand/PendingChip';

export function BagCheckout() {
  const t = useT();
  const navigate = useNavigate();
  const withLocale = useLocalizedPath();
  const cart = useCart();

  const lines = cart.lines
    .map((l) => ({ line: l, product: findProduct(l.sku) }))
    .filter((x): x is { line: typeof x.line; product: NonNullable<typeof x.product> } => !!x.product);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState(false);

  // Once the order is placed we clear the cart, so the empty-cart guard below
  // must not fire during that same render and bounce us back to /bag.
  if (cart.lines.length === 0 && !placed) return <Navigate to={withLocale('/bag')} replace />;

  async function onSubmit({ contact, card }: { contact: Contact; card: CardRef }) {
    setError(null);
    setSubmitting(true);
    const itemCount = cart.lines.reduce((n, l) => n + l.qty, 0);
    const order: BagOrder = { kind: 'bag', lines: cart.lines, contact, card };
    try {
      const result = await submitPayment(order);
      setPlaced(true);
      recordOrder({
        id: result.orderId,
        kind: 'bag',
        at: new Date().toISOString(),
        label: t('bag.checkout.qty', { qty: String(itemCount) }),
      });
      navigate(withLocale('/bag/success'), { state: { orderId: result.orderId } });
      cart.clear();
    } catch {
      setError(t('bag.checkout.error.payment'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Section tone="cream" className="pt-28 md:pt-32">
      <DisplayTitle as="h1" step="xl">
        {t('bag.checkout.title')}
      </DisplayTitle>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1fr]">
        <div className="flex flex-col gap-3">
          <CheckoutFields className="max-w-lg" submitting={submitting} error={error} onSubmit={onSubmit} />
          <Link to={withLocale('/bag')} className="max-w-lg text-center text-xs text-muted-foreground underline">
            {t('bag.checkout.back')}
          </Link>
        </div>

        <aside className="h-fit rounded-xl border border-border bg-background p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium">{t('bag.checkout.summaryTitle')}</h2>
            <Link to={withLocale('/bag')} className="text-xs text-accent underline">{t('bag.checkout.edit')}</Link>
          </div>
          <ul className="mt-4 flex flex-col divide-y divide-border">
            {lines.map(({ line, product }) => (
              <li key={line.sku} className="flex items-center gap-3 py-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-cream-100" />
                <div className="flex flex-1 flex-col">
                  <span className="text-sm">{product.name}</span>
                  <span className="text-xs text-muted-foreground">{t('bag.checkout.qty', { qty: String(line.qty) })}</span>
                </div>
                <PendingChip label={`${product.name} price`} />
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between text-sm">
            <span>{t('cart.subtotal')}</span>
            <PendingChip label="bag subtotal" />
          </div>
          <div className="mt-1 flex items-center justify-between text-sm text-muted-foreground">
            <span>{t('bag.shipping')}</span>
            <PendingChip label="shipping" />
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-sm font-medium">
            <span>{t('bag.total')}</span>
            <PendingChip label="bag total" />
          </div>
        </aside>
      </div>
    </Section>
  );
}
