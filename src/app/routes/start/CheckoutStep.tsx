// src/app/routes/start/CheckoutStep.tsx
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useT, useLocale } from '@/i18n/LocaleProvider';
import { useSession } from '@/store/sessionStore';
import { buildReport } from '@/domain/report/buildReport';
import { rooteContent } from '@/content/roote.config';
import { PendingChip } from '@/app/components/brand/PendingChip';
import { isPending } from '@/content/pending';
import { CheckoutFields } from '@/app/components/checkout/CheckoutFields';
import { submitPayment, type ProgramOrder, type Contact, type CardRef } from '@/store/checkout';
import { recordOrder } from '@/store/orders';
import { buildProgram } from '@/store/program';
import type { ProgramDurationDays } from '@/domain/program/types';

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

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!model || !days || !row) return null;

  async function onSubmit({ contact, card }: { contact: Contact; card: CardRef }) {
    setError(null);
    setSubmitting(true);
    const order: ProgramOrder = { kind: 'program', reportId: model!.meta.reportId, durationDays: days!, contact, card };
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
      recordOrder({ id: result.orderId, kind: 'program', at: new Date().toISOString(), label: row!.label });
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

      <CheckoutFields
        submitting={submitting}
        error={error}
        defaultEmail={session.account.email ?? ''}
        onSubmit={onSubmit}
      />
    </div>
  );
}
