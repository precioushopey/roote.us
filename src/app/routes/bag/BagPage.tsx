import { Link } from 'react-router';
import { useT, useContentLocale, useLocalizedPath } from '@/i18n/LocaleProvider';
import { useCart } from '@/store/cart';
import { findProduct } from '@/content/catalog';
import { pickLocalized } from '@/content/localized';
import { Section } from '@/app/components/marketing/Section';
import { SectionHeading } from '@/app/components/marketing/SectionHeading';
import { Prose } from '@/app/components/marketing/Prose';
import { PendingChip } from '@/app/components/brand/PendingChip';
import { StrandMark } from '@/app/components/roote';

export function BagPage() {
  const t = useT();
  const cl = useContentLocale();
  const withLocale = useLocalizedPath();
  const cart = useCart();

  const lines = cart.lines
    .map((l) => ({ line: l, product: findProduct(l.sku) }))
    .filter((x): x is { line: typeof x.line; product: NonNullable<typeof x.product> } => !!x.product);

  return (
    <Section className="pt-28 md:pt-32">
      <SectionHeading as="h1" clamp="clamp(1.75rem, 7vw, 5rem)">
        {t('bag.title')}
      </SectionHeading>

      {lines.length === 0 ? (
        <div className="mt-10 flex flex-col items-start gap-4">
          <Prose size="l">{t('cart.empty')}</Prose>
          <Link to={withLocale('/products')} className="rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground">
            {t('cart.browse')}
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1.6fr_1fr]">
          <ul className="flex flex-col divide-y divide-border">
            {lines.map(({ line, product }) => (
              <li key={line.sku} className="flex gap-4 py-6">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-lg bg-cream-100">
                  <StrandMark size={30} className="text-accent" />
                </div>
                <div className="flex flex-1 flex-col gap-2">
                  <p className="font-display text-lg font-medium">{product.name}</p>
                  <p className="text-sm text-muted-foreground">{pickLocalized(product.subtitle, cl)}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-4">
                    <div className="inline-flex items-center rounded-full border border-border">
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
                      className="text-xs text-muted-foreground underline"
                    >
                      {t('cart.remove')}
                    </button>
                    <PendingChip label={`${product.name} price`} />
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <aside className="h-fit rounded-xl border border-border bg-background p-6">
            <h2 className="font-display text-lg font-medium">{t('bag.summary')}</h2>
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
            <Link
              to={withLocale('/bag/checkout')}
              className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-primary px-6 py-3.5 text-sm tracking-wide text-primary-foreground"
            >
              {t('bag.checkout')}
            </Link>
            <Link to={withLocale('/products')} className="mt-3 block text-center text-xs text-muted-foreground underline">
              {t('bag.continue')}
            </Link>
          </aside>
        </div>
      )}
    </Section>
  );
}
