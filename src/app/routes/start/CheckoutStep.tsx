import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useT, useLocale, useContentLocale, useLocalizedPath } from '@/i18n/LocaleProvider';
import { useSession } from '@/store/sessionStore';
import { buildReport } from '@/domain/report/buildReport';
import { recommend } from '@/domain/recommendation/recommend';
import { rooteContent } from '@/content/roote.config';
import { isPending } from '@/content/pending';
import { pickLocalized } from '@/content/localized';
import { CONCERN_OPTIONS } from '@/content/assessment';
import { PendingChip, LegalNotice } from '@/app/components/roote';
import { CheckoutFields } from '@/app/components/checkout/CheckoutFields';
import { submitPayment, type ProgramOrder, type Contact, type CardRef } from '@/store/checkout';
import { recordOrder } from '@/store/orders';
import { buildProgram } from '@/store/program';
import { track } from '@/analytics/analytics';
import type { ProgramDurationDays } from '@/domain/program/types';

export function CheckoutStep() {
  const t = useT();
  const { contentLocale } = useLocale();
  const cl = useContentLocale();
  const withLocale = useLocalizedPath();
  const navigate = useNavigate();
  const session = useSession();
  const [subscribe, setSubscribe] = useState(false);

  const model = useMemo(() => {
    if (!session.analysis || !session.reportId) return null;
    return buildReport({
      diagnosis: session.diagnosis,
      analysis: session.analysis,
      content: rooteContent,
      locale: contentLocale,
      reportId: session.reportId,
    });
  }, [session.diagnosis, session.analysis, session.reportId, contentLocale]);

  const rec = useMemo(() => {
    if (!session.analysis || !session.diagnosis.gender) return null;
    return recommend({
      concern: session.diagnosis.concern ?? 'thinning',
      gender: session.diagnosis.gender,
      severityBand: session.analysis.severityBand,
      planEmphasis: session.analysis.planEmphasis,
      recommendedDurationDays: session.analysis.recommendedDurationDays,
    });
  }, [session.analysis, session.diagnosis.concern, session.diagnosis.gender]);

  const days = (session.draftDurationDays ?? model?.recommendedDuration.days) as ProgramDurationDays | undefined;
  const row = model?.pricing.compareAll.find((r) => r.days === days);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!model || !days || !row) return null;

  const concern = CONCERN_OPTIONS.find((c) => c.value === (session.diagnosis.concern ?? 'thinning'));
  const includes = [
    ...model.plan.core.map((c) => (isPending(c.name) ? t('app.task.pendingName') : c.name)),
    ...model.plan.supporting.map((s) => (isPending(s.name) ? t('app.task.pendingName') : s.name)),
  ];
  const packLabel = rec?.packaging === 'men' ? t('program.checkout.packMen') : t('program.checkout.packWomen');

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
      track('checkout_completed', { days: days!, subscribe });
      navigate(withLocale('/program/success'));
    } catch {
      setError(t('start.checkout.error.payment'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <section className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <h2 className="u-caps font-body text-2xs font-semibold text-muted-foreground">
            {t('program.checkout.programTitle')}
          </h2>
          <Link to={withLocale('/program/plan')} className="font-body text-xs text-deep-800 underline">
            {t('start.checkout.change')}
          </Link>
        </div>
        <dl className="mt-3 flex flex-col gap-2 font-body text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">{t('program.checkout.recommendedFor')}</dt>
            <dd className="text-end text-foreground">{concern ? pickLocalized(concern.title, cl) : '—'}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">{t('start.plan.durationLegend')}</dt>
            <dd className="text-foreground">{row.label}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">{t('program.checkout.packaging')}</dt>
            <dd className="text-foreground">{packLabel}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">{t('program.checkout.review')}</dt>
            <dd className="text-foreground">
              {rec?.requiresMedicalReview ? t('program.checkout.reviewRequired') : t('program.checkout.reviewNotRequired')}
            </dd>
          </div>
        </dl>
        <div className="mt-3 border-t border-border pt-3">
          <p className="font-body text-2xs text-muted-foreground">{t('program.checkout.includes')}</p>
          <ul className="mt-1 flex flex-col gap-0.5 font-body text-sm text-foreground">
            {includes.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </div>
        <div className="mt-3 flex flex-col gap-1.5 border-t border-border pt-3 font-body text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('start.checkout.total')}</span>
            <PendingChip label="program total" />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{t('start.checkout.shipping')}</span>
            {/* PO #2: free standard shipping is folded into the program price — no surprise charge */}
            <span className="text-foreground">{t('start.checkout.shippingFree')}</span>
          </div>
        </div>
      </section>

      <div className="rounded-xl border border-border bg-cream-100 p-4">
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={subscribe}
            onChange={(e) => setSubscribe(e.target.checked)}
            className="mt-1 h-4 w-4 accent-[var(--primary)]"
          />
          <span className="font-body text-sm">
            <span className="block text-foreground">{t('program.checkout.subscriptionOptIn')}</span>
            <span className="mt-0.5 block text-xs text-muted-foreground">{t('program.checkout.subscriptionBody')}</span>
          </span>
        </label>
        <p className="mt-2 font-body text-2xs text-muted-foreground">{t('program.checkout.noSurprise')}</p>
      </div>

      <CheckoutFields
        submitting={submitting}
        error={error}
        defaultEmail={session.account.email ?? ''}
        onSubmit={onSubmit}
      />

      <LegalNotice reviewRequired>{t('program.checkout.legal')}</LegalNotice>
    </div>
  );
}
