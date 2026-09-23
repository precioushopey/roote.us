import { useT, useLocale } from '@/i18n/LocaleProvider';
import { rooteContent } from '@/content/roote.config';
import { formatMoney } from '@/domain/report/money';
import type { CartTotals } from '@/domain/cart/totals';
import { PendingChip } from '@/app/components/brand/PendingChip';

/** Subtotal / shipping / total rows shared by the cart page and cart checkout
 *  summaries. A `null` amount renders as a [PENDING] chip. */
export function CartTotalRows({ totals }: { totals: CartTotals }) {
  const t = useT();
  const cl = useLocale().locale;
  const money = (amount: number) => formatMoney(amount, rooteContent.currency, cl).formatted;

  return (
    <>
      <div className="mt-4 flex items-center justify-between text-sm">
        <span>{t('cart.subtotal')}</span>
        {totals.subtotal === null ? (
          <PendingChip label="cart subtotal" />
        ) : (
          <span className="text-foreground">{money(totals.subtotal)}</span>
        )}
      </div>
      <div className="mt-1 flex items-center justify-between text-sm text-muted-foreground">
        <span>{t('bag.shipping')}</span>
        {totals.shipping === null ? (
          <PendingChip label="shipping" />
        ) : (
          <span className="text-foreground">{totals.shipping === 0 ? t('start.checkout.shippingFree') : money(totals.shipping)}</span>
        )}
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-sm font-medium">
        <span>{t('bag.total')}</span>
        {totals.total === null ? <PendingChip label="cart total" /> : <span>{money(totals.total)}</span>}
      </div>
    </>
  );
}
