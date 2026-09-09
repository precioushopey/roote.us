import { Link } from 'react-router';
import { useT, useContentLocale, useLocalizedPath } from '@/i18n/LocaleProvider';
import { useCart } from '@/store/cart';
import { findProduct } from '@/content/catalog';
import { pickLocalized } from '@/content/localized';
import { rooteContent } from '@/content/roote.config';
import { formatMoney } from '@/domain/report/money';
import { Section, DisplayTitle, Prose, Button } from '@/app/components/roote';
import { PendingChip } from '@/app/components/brand/PendingChip';

export function BagPage() {
  const t = useT();
  const cl = useContentLocale();
  const withLocale = useLocalizedPath();
  const cart = useCart();

  const lines = cart.lines
    .map((l) => ({ line: l, product: findProduct(l.sku) }))
    .filter((x): x is { line: typeof x.line; product: NonNullable<typeof x.product> } => !!x.product);
  // Subtotal is real arithmetic on each SKU's own already-supplied price — not
  // invented — but only when every line has one; a single unpriced SKU means
  // the true subtotal isn't knowable yet, so it (and the total, which also
  // depends on the still-unset shipping rate below) stay [PENDING].
  const subtotal = lines.every(({ product }) => product.price !== null)
    ? lines.reduce((sum, { line, product }) => sum + product.price! * line.qty, 0)
    : null;

  return (
    <Section tone="cream" className="pt-28 md:pt-32">
      <DisplayTitle as="h1" step="xl">
        {t('bag.title')}
      </DisplayTitle>

      {lines.length === 0 ? (
        <div className="mt-10 flex flex-col items-start gap-4">
          <Prose size="lg">{t('cart.empty')}</Prose>
          <Button to={withLocale('/products')}>{t('cart.browse')}</Button>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1.6fr_1fr]">
          <ul className="flex flex-col divide-y divide-border">
            {lines.map(({ line, product }) => (
              <li key={line.sku} className="flex gap-4 py-6">
                <div className="h-24 w-24 shrink-0 rounded-lg bg-cream-100" />
                <div className="flex flex-1 flex-col gap-2">
                  <p className="font-display text-lg font-medium">{product.name}</p>
                  <p className="text-sm text-muted-foreground">{pickLocalized(product.subtitle, cl)}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-4">
                    <div className="inline-flex items-center rounded-xs border border-border">
                      <button
                        type="button"
                        aria-label={t('cart.decrease')}
                        onClick={() => cart.setQty(line.sku, line.qty - 1)}
                        className="px-3 py-1.5 text-sm"
                      >
                        –
                      </button>
                      <span className="min-w-7 text-center text-sm tabular-nums">{line.qty}</span>
                      <button
                        type="button"
                        aria-label={t('cart.increase')}
                        onClick={() => cart.setQty(line.sku, line.qty + 1)}
                        className="px-3 py-1.5 text-sm"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => cart.remove(line.sku)}
                      className="text-sm text-muted-foreground underline"
                    >
                      {t('cart.remove')}
                    </button>
                    {product.price === null ? (
                      <PendingChip label={`${product.name} price`} />
                    ) : (
                      <span className="font-body text-sm font-medium text-foreground">
                        {formatMoney(product.price * line.qty, rooteContent.currency, cl).formatted}
                      </span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <aside className="h-fit rounded-xl border border-border bg-background p-6">
            <h2 className="font-display text-lg font-medium">{t('bag.summary')}</h2>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span>{t('cart.subtotal')}</span>
              {subtotal === null ? (
                <PendingChip label="bag subtotal" />
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
              <PendingChip label="bag total" />
            </div>
            <Button to={withLocale('/bag/checkout')} block className="mt-5">
              {t('bag.checkout')}
            </Button>
            <Link to={withLocale('/products')} className="mt-3 block text-center text-sm text-muted-foreground underline">
              {t('bag.continue')}
            </Link>
          </aside>
        </div>
      )}
    </Section>
  );
}
