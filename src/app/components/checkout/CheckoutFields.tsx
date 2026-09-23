import { useId, useRef, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { Link } from 'react-router';
import { Loader2 } from 'lucide-react';
import { useT, useLocalizedPath } from '@/i18n/LocaleProvider';
import { cn } from '@/app/components/ui/utils';
import { RadioCard } from '@/app/components/roote';
import { funnelField, funnelPrimaryBtn } from '@/app/components/funnel/funnelStyles';
import type { Address, Contact, CardRef } from '@/store/checkout';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Country is locked to United States (91 ENTERPRISE LLC is a US entity, currency is USD —
// see Address in store/checkout.ts) — so phone/postal validate against US shapes, not
// arbitrary digit counts (Mischa review, 2026-09-23).
const US_PHONE_RE = /^\(\d{3}\) \d{3}-\d{4}$/;
const US_POSTAL_RE = /^\d{5}$/;
const CARD_RE = /^\d{13,19}$/;
const EXPIRY_RE = /^(0[1-9]|1[0-2])\/\d{2}$/;
const CVC_RE = /^\d{3,4}$/;

/** "4242424242424242" → "4242 4242 4242 4242" as the customer types (digits only, max 19). */
function formatCardNumber(value: string): string {
  return value.replace(/\D/g, '').slice(0, 19).replace(/(\d{4})(?=\d)/g, '$1 ');
}

/** Digits → "MM/YY", inserting the slash for the customer. A leading 2–9 can only be a
 *  single-digit month, so it becomes "0X/". The slash is only auto-added while typing
 *  forward (`prev` shorter), so backspacing over it isn't blocked. */
function formatExpiry(value: string, prev: string): string {
  let d = value.replace(/\D/g, '').slice(0, 4);
  if (d.length === 1 && d > '1') d = `0${d}`;
  if (d.length >= 3) return `${d.slice(0, 2)}/${d.slice(2)}`;
  if (d.length === 2 && value.length > prev.length) return `${d}/`;
  return d;
}

/** Digits → "(XXX) XXX-XXXX" as the customer types (max 10 digits — US mobile only). */
function formatUSPhone(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 10);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

const EMPTY_ADDRESS: Address = { addressLine1: '', addressLine2: '', city: '', state: '', postal: '', country: 'US' };

/** Every field this form can report an error on, in DOM order — the order `validate()`
 *  below checks them in, so "first invalid field" and "first field on the page" agree. */
type FieldKey =
  | 'firstName' | 'lastName' | 'email' | 'mobile'
  | 'billingAddressLine1' | 'billingCity' | 'billingState' | 'billingPostal'
  | 'shippingAddressLine1' | 'shippingCity' | 'shippingState' | 'shippingPostal'
  | 'cardName' | 'cardNumber' | 'expiry' | 'cvc';

/** Required-field marker (client instruction: every mandatory field needs one, only
 *  Mobile is optional) — a single visual convention, not a per-field ad hoc string. */
function Req() {
  return (
    <span aria-hidden className="text-destructive">
      {' *'}
    </span>
  );
}

/** One labeled input: asterisk when required, inline hint text (never a "?" popup —
 *  client instruction), and its own inline error instead of relying on a single
 *  bottom-of-form banner. `refCb` feeds the field into the parent's scroll-to-error map. */
function TextField({
  label,
  required,
  hint,
  error,
  refCb,
  className,
  ...inputProps
}: {
  label: ReactNode;
  required?: boolean;
  hint?: ReactNode;
  error?: string;
  refCb?: (el: HTMLInputElement | null) => void;
  className?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'className'>) {
  const id = useId();
  return (
    <label htmlFor={id} className={cn('flex flex-col gap-2 text-sm', className)}>
      <span>
        {label}
        {required && <Req />}
      </span>
      <input
        id={id}
        ref={refCb}
        aria-required={required}
        aria-invalid={error ? true : undefined}
        className={cn(funnelField, error && 'border-destructive focus:border-destructive')}
        {...inputProps}
      />
      {error ? (
        <span role="alert" className="text-sm text-destructive">
          {error}
        </span>
      ) : hint ? (
        <span className="text-sm text-muted-foreground">{hint}</span>
      ) : null}
    </label>
  );
}

/**
 * The one contact + billing/shipping + card-details form shared by the program checkout
 * (`/program/checkout`) and the cart checkout (`/cart/checkout`).
 * It owns its field state and does client-side-only validation; on a valid submit it hands
 * the caller `{ contact, card }` where `card` is the last four digits + expiry only — the
 * full number and CVC never leave this component. Payment-level failures (the payment stub
 * itself failing) come back via the `error` prop, separate from this form's own field errors.
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

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState(defaultEmail);
  const [mobile, setMobile] = useState('');

  const [billing, setBilling] = useState<Address>(EMPTY_ADDRESS);
  const [shippingSameAsBilling, setShippingSameAsBilling] = useState(true);
  const [shipping, setShipping] = useState<Address>(EMPTY_ADDRESS);

  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const fieldRefs = useRef<Partial<Record<FieldKey, HTMLInputElement>>>({});
  const refCb = (key: FieldKey) => (el: HTMLInputElement | null) => {
    if (el) fieldRefs.current[key] = el;
  };

  /** Runs every check in page order and stops at the first failure — scrolling to and
   *  focusing that field (client instruction) instead of leaving the customer to hunt for
   *  what "Place order" silently rejected. Returns the resolved contact on success. */
  function validate(): Contact | null {
    const checks: { key: FieldKey; invalid: boolean; message: string }[] = [
      { key: 'firstName', invalid: !firstName.trim(), message: t('checkout.error.required') },
      { key: 'lastName', invalid: !lastName.trim(), message: t('checkout.error.required') },
      { key: 'email', invalid: !EMAIL_RE.test(email.trim()), message: t('checkout.error.email') },
      { key: 'mobile', invalid: mobile.trim() !== '' && !US_PHONE_RE.test(mobile), message: t('checkout.error.mobile') },
      { key: 'billingAddressLine1', invalid: !billing.addressLine1.trim(), message: t('checkout.error.required') },
      { key: 'billingCity', invalid: !billing.city.trim(), message: t('checkout.error.required') },
      { key: 'billingState', invalid: !billing.state.trim(), message: t('checkout.error.required') },
      { key: 'billingPostal', invalid: !US_POSTAL_RE.test(billing.postal), message: t('checkout.error.postal') },
      ...(shippingSameAsBilling
        ? []
        : [
            { key: 'shippingAddressLine1' as const, invalid: !shipping.addressLine1.trim(), message: t('checkout.error.required') },
            { key: 'shippingCity' as const, invalid: !shipping.city.trim(), message: t('checkout.error.required') },
            { key: 'shippingState' as const, invalid: !shipping.state.trim(), message: t('checkout.error.required') },
            { key: 'shippingPostal' as const, invalid: !US_POSTAL_RE.test(shipping.postal), message: t('checkout.error.postal') },
          ]),
      { key: 'cardName', invalid: !cardName.trim(), message: t('checkout.error.required') },
      { key: 'cardNumber', invalid: !CARD_RE.test(cardNumber.replace(/\s+/g, '')), message: t('checkout.error.card') },
      { key: 'expiry', invalid: !EXPIRY_RE.test(expiry), message: t('checkout.error.expiry') },
      { key: 'cvc', invalid: !CVC_RE.test(cvc), message: t('checkout.error.cvc') },
    ];

    const firstInvalid = checks.find((c) => c.invalid);
    if (firstInvalid) {
      setFieldErrors({ [firstInvalid.key]: firstInvalid.message });
      const el = fieldRefs.current[firstInvalid.key];
      el?.focus();
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return null;
    }
    setFieldErrors({});
    return {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      mobile,
      billing,
      shipping: shippingSameAsBilling ? billing : shipping,
    };
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const contact = validate();
    if (!contact) return;
    const digits = cardNumber.replace(/\s+/g, '');
    onSubmit({ contact, card: { last4: digits.slice(-4), expiry } });
  }

  /** Renders one address's fields — called once for billing, once for shipping when it
   *  isn't "same as billing". Never includes a Name field (client instruction: the
   *  customer already gave their name once, in Contact, above). */
  function addressFields(addr: Address, setAddr: (a: Address) => void, prefix: 'billing' | 'shipping') {
    const err = (suffix: 'AddressLine1' | 'City' | 'State' | 'Postal') => fieldErrors[`${prefix}${suffix}`];
    return (
      <>
        <TextField
          label={t('checkout.addressLine1')}
          required
          error={err('AddressLine1')}
          refCb={refCb(`${prefix}AddressLine1`)}
          value={addr.addressLine1}
          onChange={(e) => setAddr({ ...addr, addressLine1: e.target.value })}
        />
        <TextField
          label={t('checkout.addressLine2')}
          value={addr.addressLine2}
          onChange={(e) => setAddr({ ...addr, addressLine2: e.target.value })}
        />
        <div className="flex flex-col gap-4 sm:flex-row">
          <TextField
            className="flex-[2]"
            label={t('checkout.city')}
            required
            error={err('City')}
            refCb={refCb(`${prefix}City`)}
            value={addr.city}
            onChange={(e) => setAddr({ ...addr, city: e.target.value })}
          />
          <TextField
            className="flex-1"
            label={t('checkout.state')}
            required
            error={err('State')}
            refCb={refCb(`${prefix}State`)}
            value={addr.state}
            onChange={(e) => setAddr({ ...addr, state: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-4 sm:flex-row">
          <TextField
            className="flex-1"
            label={t('checkout.postal')}
            required
            error={err('Postal')}
            refCb={refCb(`${prefix}Postal`)}
            inputMode="numeric"
            dir="ltr"
            maxLength={5}
            value={addr.postal}
            onChange={(e) => setAddr({ ...addr, postal: e.target.value.replace(/\D/g, '').slice(0, 5) })}
          />
          <label className="flex flex-1 flex-col gap-2 text-sm">
            {t('checkout.country')}
            <input
              disabled
              dir="ltr"
              value={t('checkout.countryUS')}
              className={cn(funnelField, 'cursor-not-allowed text-muted-foreground')}
            />
          </label>
        </div>
      </>
    );
  }

  return (
    <form className={cn('flex flex-col gap-4', className)} onSubmit={handleSubmit} noValidate>
      <h2 className="text-sm font-medium">{t('checkout.contactTitle')}</h2>
      <div className="flex flex-col gap-4 sm:flex-row">
        <TextField
          className="flex-1"
          label={t('checkout.firstName')}
          required
          error={fieldErrors.firstName}
          refCb={refCb('firstName')}
          autoComplete="given-name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <TextField
          className="flex-1"
          label={t('checkout.lastName')}
          required
          error={fieldErrors.lastName}
          refCb={refCb('lastName')}
          autoComplete="family-name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-4 sm:flex-row">
        <TextField
          className="flex-1"
          label={t('checkout.email')}
          required
          error={fieldErrors.email}
          refCb={refCb('email')}
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          className="flex-1"
          label={t('checkout.mobile')}
          hint={t('checkout.mobileHint')}
          error={fieldErrors.mobile}
          refCb={refCb('mobile')}
          inputMode="tel"
          autoComplete="tel"
          dir="ltr"
          value={mobile}
          onChange={(e) => setMobile(formatUSPhone(e.target.value))}
        />
      </div>

      <h2 className="mt-2 text-sm font-medium">{t('checkout.billingTitle')}</h2>
      {addressFields(billing, setBilling, 'billing')}

      <h2 className="mt-2 text-sm font-medium">{t('checkout.shippingTitle')}</h2>
      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={shippingSameAsBilling}
          onChange={(e) => setShippingSameAsBilling(e.target.checked)}
          className="h-4 w-4 accent-[var(--primary)]"
        />
        {t('checkout.shippingSameAsBilling')}
      </label>
      {!shippingSameAsBilling && addressFields(shipping, setShipping, 'shipping')}

      <h2 className="mt-2 text-sm font-medium">{t('checkout.paymentTitle')}</h2>
      <p className="text-sm text-muted-foreground">{t('checkout.testNotice')}</p>
      <TextField
        label={t('checkout.cardName')}
        required
        error={fieldErrors.cardName}
        refCb={refCb('cardName')}
        autoComplete="cc-name"
        value={cardName}
        onChange={(e) => setCardName(e.target.value)}
      />
      <TextField
        label={t('checkout.cardNumber')}
        required
        error={fieldErrors.cardNumber}
        refCb={refCb('cardNumber')}
        inputMode="numeric"
        autoComplete="cc-number"
        dir="ltr"
        maxLength={23}
        value={cardNumber}
        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
      />
      <div className="flex flex-col gap-4 sm:flex-row">
        <TextField
          className="flex-1"
          label={t('checkout.expiry')}
          required
          error={fieldErrors.expiry}
          refCb={refCb('expiry')}
          inputMode="numeric"
          autoComplete="cc-exp"
          dir="ltr"
          placeholder="MM/YY"
          maxLength={5}
          value={expiry}
          onChange={(e) => setExpiry(formatExpiry(e.target.value, expiry))}
        />
        <TextField
          className="flex-1"
          label={t('checkout.cvc')}
          required
          error={fieldErrors.cvc}
          refCb={refCb('cvc')}
          inputMode="numeric"
          autoComplete="cc-csc"
          dir="ltr"
          maxLength={4}
          value={cvc}
          onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
        />
      </div>

      <h3 className="mt-1 text-sm font-medium">{t('checkout.paymentMethodTitle')}</h3>
      <div className="flex flex-col gap-2">
        <RadioCard name="paymentMethod" value="card" checked title={t('checkout.paymentMethod.card')} />
        {/* TODO: confirm with client — which alternate payment methods to actually offer */}
        <RadioCard name="paymentMethod" value="alt" disabled title={t('checkout.altPayment')} />
      </div>

      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <p className="text-sm text-muted-foreground">
        {t('checkout.termsAgree')}{' '}
        <Link to={withLocale('/terms')} className="text-accent underline">{t('marketing.legal.terms.title')}</Link>.
      </p>
      <button type="submit" disabled={submitting} className={funnelPrimaryBtn}>
        {submitting && <Loader2 aria-hidden className="h-4 w-4 animate-spin" strokeWidth={2} />}
        {submitting ? t('checkout.submitting') : t('checkout.submit')}
      </button>
    </form>
  );
}
