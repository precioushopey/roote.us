import { Link } from 'react-router';
import { useT, useLocalizedPath } from '@/i18n/LocaleProvider';
import { rooteContent } from '@/content/roote.config';

/** Accepted card brands. Generic wordmark badges (not the brands' official logo artwork,
 *  which needs licensed assets) — swap for the real marks if the client supplies them. */
const CARD_BRANDS = ['VISA', 'Mastercard', 'AMEX', 'Discover', 'JCB', 'Diners', 'UnionPay'] as const;

/**
 * "Secure and trusted checkout" block under the Place order button (client request, 2026-10-02):
 * accepted-card strip, support contact, and the order-consent line. The consent copy is
 * pending formal legal review (see the `checkout.consent.*` keys).
 */
export function CheckoutTrust() {
  const t = useT();
  const withLocale = useLocalizedPath();
  const { email } = rooteContent.company.support;
  const link = 'text-accent underline';

  return (
    <div className="mt-2 flex flex-col gap-4 border-t border-border pt-4 text-center">
      <p className="u-caps text-xs font-medium text-foreground">{t('checkout.secureTitle')}</p>
      <ul className="flex flex-wrap items-center justify-center gap-2" aria-label={t('checkout.secureTitle')}>
        {CARD_BRANDS.map((brand) => (
          <li
            key={brand}
            className="rounded-md border border-border bg-background px-2 py-1 font-body text-[0.6875rem] font-semibold tracking-wide text-muted-foreground"
          >
            {brand}
          </li>
        ))}
      </ul>
      <p className="text-sm text-muted-foreground">
        {t('checkout.questions')}{' '}
        <a href={`mailto:${email}`} dir="ltr" className={link}>
          {email}
        </a>
      </p>
      <p className="text-sm text-muted-foreground">
        {t('checkout.consent.lead')}{' '}
        <Link to={withLocale('/terms')} className={link}>{t('checkout.consent.terms')}</Link>{' '}
        {t('checkout.consent.joiner')}{' '}
        <Link to={withLocale('/privacy')} className={link}>{t('checkout.consent.privacy')}</Link>.
      </p>
    </div>
  );
}
