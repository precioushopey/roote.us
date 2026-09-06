import { useState } from 'react';
import { Link } from 'react-router';
import { useT, useLocalizedPath } from '@/i18n/LocaleProvider';
import { cn } from '@/app/components/ui/utils';
import { funnelField, funnelPrimaryBtn } from '@/app/components/funnel/funnelStyles';
import type { Contact, CardRef } from '@/store/checkout';

const CARD_RE = /^\d{13,19}$/;
const EXPIRY_RE = /^(0[1-9]|1[0-2])\/\d{2}$/;
const CVC_RE = /^\d{3,4}$/;

/**
 * The one contact + card-details form shared by the program checkout (`/start/checkout`)
 * and the bag checkout (`/bag/checkout`). It owns its field state and does shape-only
 * card validation; on a valid submit it hands the caller `{ contact, card }` where `card`
 * is the last four digits + expiry only — the full number and CVC never leave this component.
 * Payment-level failures come back via the `error` prop.
 */
export function CheckoutFields({
  submitting,
  error,
  defaultEmail = '',
  className,
  onSubmit,
}: {
  submitting: boolean;
  error: string | null;
  defaultEmail?: string;
  className?: string;
  onSubmit: (data: { contact: Contact; card: CardRef }) => void;
}) {
  const t = useT();
  const withLocale = useLocalizedPath();
  const [name, setName] = useState('');
  const [email, setEmail] = useState(defaultEmail);
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [postal, setPostal] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [shapeError, setShapeError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setShapeError(null);
    const digits = cardNumber.replace(/\s+/g, '');
    if (!CARD_RE.test(digits)) return setShapeError(t('checkout.error.card'));
    if (!EXPIRY_RE.test(expiry)) return setShapeError(t('checkout.error.expiry'));
    if (!CVC_RE.test(cvc)) return setShapeError(t('checkout.error.cvc'));
    onSubmit({
      // TODO: confirm with client — IL vs international shipping (country is fixed for now)
      contact: { name, email, phone, country: 'IL', city, postal },
      card: { last4: digits.slice(-4), expiry },
    });
  }

  const shown = shapeError ?? error;

  return (
    <form className={cn('flex flex-col gap-3', className)} onSubmit={handleSubmit}>
      <h2 className="text-sm font-medium">{t('checkout.contactTitle')}</h2>
      <label className="flex flex-col gap-1 text-sm">
        {t('checkout.name')}
        <input required value={name} onChange={(e) => setName(e.target.value)} className={funnelField} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        {t('checkout.email')}
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={funnelField} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        {t('checkout.phone')}
        <input required value={phone} onChange={(e) => setPhone(e.target.value)} className={funnelField} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        {t('checkout.city')}
        <input required value={city} onChange={(e) => setCity(e.target.value)} className={funnelField} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        {t('checkout.postal')}
        <input required value={postal} onChange={(e) => setPostal(e.target.value)} className={funnelField} />
      </label>

      <h2 className="mt-2 text-sm font-medium">{t('checkout.paymentTitle')}</h2>
      <p className="text-xs text-muted-foreground">{t('checkout.testNotice')}</p>
      <label className="flex flex-col gap-1 text-sm">
        {t('checkout.cardName')}
        <input required value={cardName} onChange={(e) => setCardName(e.target.value)} className={funnelField} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        {t('checkout.cardNumber')}
        <input required inputMode="numeric" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} className={funnelField} />
      </label>
      <div className="flex gap-3">
        <label className="flex flex-1 flex-col gap-1 text-sm">
          {t('checkout.expiry')}
          <input required placeholder="MM/YY" value={expiry} onChange={(e) => setExpiry(e.target.value)} className={funnelField} />
        </label>
        <label className="flex flex-1 flex-col gap-1 text-sm">
          {t('checkout.cvc')}
          <input required inputMode="numeric" value={cvc} onChange={(e) => setCvc(e.target.value)} className={funnelField} />
        </label>
      </div>
      {/* TODO: confirm with client — which alternate payment methods to actually offer */}
      <button type="button" disabled className="rounded-md border border-border px-4 py-2 text-xs text-muted-foreground opacity-50">
        {t('checkout.altPayment')}
      </button>

      {shown && <p role="alert" className="text-sm text-destructive">{shown}</p>}
      <p className="text-xs text-muted-foreground">
        {t('checkout.termsAgree')}{' '}
        <Link to={withLocale('/terms-of-sale')} className="text-accent underline">{t('marketing.footer.termsOfSale')}</Link>.
      </p>
      <button type="submit" disabled={submitting} className={funnelPrimaryBtn}>
        {submitting ? t('checkout.submitting') : t('checkout.submit')}
      </button>
    </form>
  );
}
