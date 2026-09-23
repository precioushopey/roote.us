import { Link } from 'react-router';
import { useT, useLocale, useLocalizedPath } from '@/i18n/LocaleProvider';
import { useCart } from '@/store/cart';
import { resolveCartLines } from '@/store/cartLines';
import { rooteContent } from '@/content/roote.config';
import { formatMoney } from '@/domain/report/money';
import { cartTotals } from '@/domain/cart/totals';
import { CartTotalRows } from '@/app/components/cart/CartTotalRows';
import { Section, DisplayTitle, Prose, Button } from '@/app/components/roote';
import { PendingChip } from '@/app/components/brand/PendingChip';
import { PATHS } from '@/app/paths';

export function CartPage() {
  const t = useT();
  const cl = useLocale().locale;
  const withLocale = useLocalizedPath();
  const cart = useCart();

  const lines = resolveCartLines(cart.lines, cl);
  const totals = cartTotals(lines, rooteContent.shipping);

  return (
    <Section tone="cream" className="pt-28 md:pt-32" gap={12}>
      <DisplayTitle as="h1" step="xl">
        {t('cart.title')}
      </DisplayTitle>

      {lines.length === 0 ? (
        <div className="flex flex-col items-start gap-4">
          <Prose>{t('cart.empty')}</Prose>
          <Button to={withLocale(PATHS.products)}>{t('cart.browse')}</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.6fr_1fr]">
          <ul className="flex flex-col divide-y divide-border">
            {lines.map((line) => (
              <li key={line.id} className="flex gap-4 py-6">
                {line.photo ? (
                  <img
                    src={line.photo}
                    alt=""
                    className="h-24 w-24 shrink-0 rounded-lg bg-cream-100 object-contain"
                  />
                ) : (
                  <div className="h-24 w-24 shrink-0 rounded-lg bg-cream-100" />
                )}
                <div className="flex flex-1 flex-col gap-2">
                  <p className="font-display text-lg font-medium">{line.name}</p>
                  <p className="text-sm text-muted-foreground">{line.subtitle}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-4">
                    <div className="inline-flex items-center rounded-full border border-border">
                      <button
                        type="button"
                        aria-label={t('cart.decrease')}
                        onClick={() => cart.setQty(line.id, line.qty - 1)}
                        className="px-3 py-1.5 text-sm"
                      >
                        –
                      </button>
                      <span className="min-w-7 text-center text-sm tabular-nums">{line.qty}</span>
                      <button
                        type="button"
                        aria-label={t('cart.increase')}
                        onClick={() => cart.setQty(line.id, line.qty + 1)}
                        className="px-3 py-1.5 text-sm"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => cart.remove(line.id)}
                      className="text-sm text-muted-foreground underline"
                    >
                      {t('cart.remove')}
                    </button>
                    {line.price === null ? (
                      <PendingChip label={`${line.name} price`} />
                    ) : (
                      <span className="font-body text-sm font-medium text-foreground">
                        {formatMoney(line.price * line.qty, rooteContent.currency, cl).formatted}
                      </span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <aside className="h-fit rounded-xl border border-border bg-background p-6">
            <h2 className="font-display text-lg font-medium">{t('bag.summary')}</h2>
            <CartTotalRows totals={totals} />
            <Button to={withLocale(PATHS.cartCheckout)} block className="mt-5">
              {t('bag.checkout')}
            </Button>
            <Link to={withLocale(PATHS.products)} className="mt-3 block text-center text-sm text-muted-foreground underline">
              {t('bag.continue')}
            </Link>
          </aside>
        </div>
      )}
    </Section>
  );
}
