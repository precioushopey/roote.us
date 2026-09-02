// src/app/routes/start/CheckoutStep.tsx
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useT, useLocale } from '@/i18n/LocaleProvider';
import { useSession } from '@/store/sessionStore';
import { buildReport } from '@/domain/report/buildReport';
import { rooteContent } from '@/content/roote.config';
import { PendingChip } from '@/app/components/brand/PendingChip';
import { isPending } from '@/content/pending';
import { submitPayment, type Order } from '@/store/checkout';
import { buildProgram } from '@/store/program';
import type { ProgramDurationDays } from '@/domain/program/types';

const CARD_RE = /^\d{13,19}$/;
const EXPIRY_RE = /^(0[1-9]|1[0-2])\/\d{2}$/;
const CVC_RE = /^\d{3,4}$/;

export function CheckoutStep() {
  const t = useT();
  const { locale } = useLocale();
  const navigate = useNavigate();
  const session = useSession();

  const model = useMemo(() => {
    if (!session.analysis || !session.reportId) return null;
    return buildReport({ diagnosis: session.diagnosis, analysis: session.analysis, content: rooteContent, locale, reportId: session.reportId });
  }, [session.diagnosis, session.analysis, session.reportId, locale]);

  const days = (session.draftDurationDays ?? model?.recommendedDuration.days) as ProgramDurationDays | undefined;
  const row = model?.pricing.compareAll.find((r) => r.days === days);

  const [name, setName] = useState('');
  const [email, setEmail] = useState(session.account.email ?? '');
  const [phone, setPhone] = useState('');
  const [country] = useState('IL'); // TODO: confirm with client — IL vs international shipping
  const [city, setCity] = useState('');
  const [postal, setPostal] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardName, setCardName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!model || !days || !row) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!CARD_RE.test(cardNumber.replace(/\s+/g, ''))) return setError(t('start.checkout.error.card'));
    if (!EXPIRY_RE.test(expiry)) return setError(t('start.checkout.error.expiry'));
    if (!CVC_RE.test(cvc)) return setError(t('start.checkout.error.cvc'));

    setSubmitting(true);
    const order: Order = {
      reportId: model!.meta.reportId,
      durationDays: days!,
      contact: { name, email, phone, country, city, postal },
      card: { last4: cardNumber.replace(/\s+/g, '').slice(-4), expiry },
    };
    try {
      const result = await submitPayment(order);
      const program = buildProgram({
        orderId: result.orderId,
        reportId: model!.meta.reportId,
        analysis: session.analysis!,
        durationDays: days!,
        plan: model!.plan,
      });
      session.setProgram(program);
      navigate('/start/success');
    } catch {
      setError(t('start.checkout.error.payment'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <section className="rounded-lg border border-border p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">{t('start.checkout.summaryTitle')}</h2>
          <Link to="/start/plan" className="text-xs text-accent underline">{t('start.checkout.change')}</Link>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span>{row.label}</span>
          {isPending(row.price) ? <PendingChip label={row.price.label} /> : <span>{row.price.formatted}</span>}
        </div>
        <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
          <span>{t('report.pricing.perDayLabel')}</span>
          {isPending(model.pricing.perDay) ? <PendingChip label={model.pricing.perDay.label} /> : <span>{model.pricing.perDay.formatted}</span>}
        </div>
        <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
          <span>{t('start.checkout.shipping')}</span>
          <PendingChip label="shipping" />
        </div>
        <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
          <span>{t('start.checkout.total')}</span>
          <PendingChip label="total" />
        </div>
      </section>

      <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
        <h2 className="text-sm font-medium">{t('start.checkout.contactTitle')}</h2>
        <label className="flex flex-col gap-1 text-sm">
          {t('start.checkout.name')}
          <input required value={name} onChange={(e) => setName(e.target.value)} className="rounded-md border border-border bg-input-background px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          {t('start.account.emailLabel')}
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-md border border-border bg-input-background px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          {t('start.checkout.phone')}
          <input required value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-md border border-border bg-input-background px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          {t('start.checkout.city')}
          <input required value={city} onChange={(e) => setCity(e.target.value)} className="rounded-md border border-border bg-input-background px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          {t('start.checkout.postal')}
          <input required value={postal} onChange={(e) => setPostal(e.target.value)} className="rounded-md border border-border bg-input-background px-3 py-2" />
        </label>

        <h2 className="mt-2 text-sm font-medium">{t('start.checkout.paymentTitle')}</h2>
        <p className="text-xs text-muted-foreground">{t('start.checkout.testNotice')}</p>
        <label className="flex flex-col gap-1 text-sm">
          {t('start.checkout.cardName')}
          <input required value={cardName} onChange={(e) => setCardName(e.target.value)} className="rounded-md border border-border bg-input-background px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          {t('start.checkout.cardNumber')}
          <input required value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} className="rounded-md border border-border bg-input-background px-3 py-2" />
        </label>
        <div className="flex gap-3">
          <label className="flex flex-1 flex-col gap-1 text-sm">
            {t('start.checkout.expiry')}
            <input required placeholder="MM/YY" value={expiry} onChange={(e) => setExpiry(e.target.value)} className="rounded-md border border-border bg-input-background px-3 py-2" />
          </label>
          <label className="flex flex-1 flex-col gap-1 text-sm">
            {t('start.checkout.cvc')}
            <input required value={cvc} onChange={(e) => setCvc(e.target.value)} className="rounded-md border border-border bg-input-background px-3 py-2" />
          </label>
        </div>
        {/* TODO: confirm with client — which alternate payment methods to actually offer */}
        <button type="button" disabled className="rounded-md border border-border px-4 py-2 text-xs text-muted-foreground opacity-50">
          {t('start.checkout.altPayment')}
        </button>

        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <button type="submit" disabled={submitting} className="rounded-md bg-primary px-6 py-3 text-sm text-primary-foreground disabled:opacity-50">
          {submitting ? t('start.checkout.submitting') : t('start.checkout.submit')}
        </button>
      </form>
    </div>
  );
}
