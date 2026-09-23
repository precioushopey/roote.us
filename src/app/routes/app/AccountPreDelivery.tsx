import { useState } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, ArrowRight, Check, Sparkles, Map as MapIcon } from 'lucide-react';
import { useT, useLocale, useLocalizedPath } from '@/i18n/LocaleProvider';
import { useSession } from '@/store/sessionStore';
import { useAuth } from '@/store/auth';
import { confirmDelivery } from '@/store/program';
import { Wordmark } from '@/app/components/brand/Wordmark';
import { DisplayTitle, Prose, Button, LanguagePicker, PendingChip, Accordion } from '@/app/components/roote';
import type { AccordionItem } from '@/app/components/roote';
import { rooteContent } from '@/content/roote.config';
import { isPending } from '@/content/pending';
import { formatMoney } from '@/domain/report/money';
import type { Program } from '@/domain/program/types';
import type { MessageKey } from '@/i18n/messages';

type View = 'landing' | 'shipping' | 'refund' | 'refundSent' | 'contact' | 'help';

const BACK_TARGET: Record<Exclude<View, 'landing'>, View> = {
  shipping: 'landing',
  refund: 'shipping',
  refundSent: 'shipping',
  contact: 'shipping',
  help: 'shipping',
};

const VIEW_TITLE_KEY: Record<Exclude<View, 'landing'>, MessageKey> = {
  shipping: 'app.preDelivery.shipping.title',
  refund: 'app.preDelivery.refund.title',
  refundSent: 'app.preDelivery.refundSent.title',
  contact: 'app.preDelivery.contact.title',
  help: 'app.preDelivery.help.title',
};

const REFUND_REASON_KEYS = [
  'app.preDelivery.refund.reasonDamaged',
  'app.preDelivery.refund.reasonNotExpected',
  'app.preDelivery.refund.reasonNoLongerNeeded',
  'app.preDelivery.refund.reasonOther',
] as const satisfies readonly MessageKey[];

function PlanTreatmentList({ program }: { program: Program }) {
  if (program.plan.core.length === 0) return null;
  return (
    <ul className="flex flex-col gap-1 font-body text-sm text-muted-foreground">
      {program.plan.core.map((tr, i) => (
        <li key={i}>{isPending(tr.name) ? <PendingChip label={tr.name.label} /> : tr.name}</li>
      ))}
    </ul>
  );
}

/** A tappable row in the "support center" list — a title + trailing arrow,
 *  no different from a `<button>`, just styled to read as a navigable row. */
function SupportRow({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between gap-4 px-1 py-3 text-start font-body text-sm text-foreground hover:bg-cream-100"
    >
      <span>{label}</span>
      <ArrowRight aria-hidden className="h-4 w-4 shrink-0 text-muted-foreground rtl:-scale-x-100" strokeWidth={1.75} />
    </button>
  );
}

/** Shown by `AppShell` in place of the whole account app while
 *  `program.startDate` is `null` — checkout has happened but the customer
 *  hasn't confirmed their package arrived yet, so there's no real "Day 1" to
 *  show. No live shipping/carrier data exists in this build, so this only
 *  ever shows what's actually known: the frozen plan, the order date, real
 *  support contact info, and a self-report "it arrived" action, plus a small
 *  support sub-flow (refund/return request, contact, help) reachable from
 *  the shipping-information screen. */
export function AccountPreDelivery({ program }: { program: Program }) {
  const t = useT();
  const cl = useLocale().locale;
  const session = useSession();
  const auth = useAuth();
  const { locale, setLocale } = useLocale();
  const withLocale = useLocalizedPath();
  const { support } = rooteContent.company;
  const [view, setView] = useState<View>('landing');
  const [refundReason, setRefundReason] = useState<MessageKey | null>(null);
  const [refundDetails, setRefundDetails] = useState('');
  const [showPlanUsage, setShowPlanUsage] = useState(false);

  const priceRow = rooteContent.programDurations.find((d) => d.days === program.durationDays);

  function confirm() {
    session.setProgram(confirmDelivery(program));
  }

  function logout() {
    auth.signOut();
  }

  function submitRefund(e: React.FormEvent) {
    e.preventDefault();
    setView('refundSent');
  }

  const helpItems: AccordionItem[] = [
    { id: 'q1', title: t('app.preDelivery.help.q1'), body: t('app.preDelivery.help.a1') },
    { id: 'q2', title: t('app.preDelivery.help.q2'), body: t('app.preDelivery.help.a2') },
    { id: 'q3', title: t('app.preDelivery.help.q3'), body: t('app.preDelivery.help.a3') },
    { id: 'q4', title: t('app.preDelivery.help.q4'), body: t('app.preDelivery.help.a4') },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-4">
          {view === 'landing' ? (
            <Link to={withLocale('/')} aria-label="ROOTÉ">
              <Wordmark className="w-28" />
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setView(BACK_TARGET[view])}
              className="flex items-center gap-2 font-body text-sm font-medium text-foreground"
            >
              <ArrowLeft aria-hidden className="h-4 w-4 shrink-0 rtl:-scale-x-100" strokeWidth={1.75} />
              {t(VIEW_TITLE_KEY[view])}
            </button>
          )}
          <div className="flex items-center gap-2">
            <LanguagePicker compact locale={locale} onChange={setLocale} />
            <button type="button" onClick={logout} className="font-body text-sm text-muted-foreground underline">
              {t('app.profile.logout')}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-6 py-8 md:gap-8">
        {view === 'landing' && (
          <>
            <div className="flex flex-col gap-2">
              <DisplayTitle as="h1" step="sm">
                {t('app.preDelivery.title')}
              </DisplayTitle>
              <Prose className="text-sm">{t('app.preDelivery.subtitle')}</Prose>
            </div>

            <section className="flex gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent-ghost text-deep-800">
                <Sparkles aria-hidden className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <div className="flex flex-col gap-3">
                <p className="text-sm font-medium uppercase text-accent">{t('app.preDelivery.planReady')}</p>
                <p className="font-display text-lg font-medium text-foreground">
                  {t('report.duration.label', { days: program.durationDays })}
                </p>
                <PlanTreatmentList program={program} />
              </div>
            </section>

            <section className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-sm">
              <p className="font-display text-lg font-medium text-foreground">{t('app.preDelivery.orderTitle')}</p>
              <p className="font-body text-sm text-muted-foreground">
                {t('app.preDelivery.orderedOn', { date: program.orderedAt })}
              </p>

              {/* Placeholder, not a real map: no carrier integration exists in this
                   build to plot an actual shipment, so the caption says tracking will
                   appear later rather than showing a live-looking map with invented
                   positions. */}
              <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-accent bg-cream-100">
                <MapIcon aria-hidden className="h-6 w-6 text-accent" strokeWidth={1.5} />
                <p className="px-4 text-center font-body text-sm text-muted-foreground">{t('app.preDelivery.mapCaption')}</p>
              </div>

              {/* Honest 2-stage progress — no live carrier tracking exists in this
                   build, so this only ever claims what's actually known: the order
                   was placed, and it's now somewhere in preparation/shipping. No
                   fabricated "in transit" / "arriving" stages or ETA dates. */}
              <div className="flex items-center gap-2 py-1">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-deep-800 bg-deep-800 text-cream-50">
                  <Check className="h-3 w-3" strokeWidth={2.5} aria-hidden />
                </span>
                <span className="font-body text-sm text-muted-foreground">{t('app.preDelivery.orderedStage')}</span>
                <span aria-hidden className="mx-1 h-px w-6 bg-deep-800" />
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-deep-800 font-body text-sm font-semibold text-deep-900">
                  2
                </span>
                <span className="font-body text-sm text-foreground">{t('app.preDelivery.preparingStage')}</span>
              </div>

              <p className="font-body text-sm text-muted-foreground">{t('app.preDelivery.shippingNote')}</p>
              <button
                type="button"
                onClick={() => setView('shipping')}
                className="mt-1 flex w-fit items-center gap-1.5 font-body text-sm font-medium text-accent underline"
              >
                {t('app.preDelivery.viewShipping')}
                <ArrowRight aria-hidden className="h-3.5 w-3.5 shrink-0 rtl:-scale-x-100" strokeWidth={1.75} />
              </button>
            </section>

            <section className="flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm">
              <p className="mb-2 font-display text-lg font-medium text-foreground">
                {t('app.preDelivery.whileYouWaitTitle')}
              </p>
              <div className="flex flex-col divide-y divide-border">
                <SupportRow label={t('app.preDelivery.reviewPlanRow')} onClick={() => setShowPlanUsage((v) => !v)} />
                <SupportRow label={t('app.preDelivery.viewShipping')} onClick={() => setView('shipping')} />
                <SupportRow label={t('app.preDelivery.contactRow')} onClick={() => setView('contact')} />
              </div>
              {showPlanUsage && (
                <div className="mt-3 flex flex-col gap-3 rounded-lg bg-cream-100 p-4">
                  <p className="font-body text-sm font-medium text-foreground">{t('app.preDelivery.reviewPlanTitle')}</p>
                  {[...program.plan.core, ...program.plan.supporting].map((tr, i) => (
                    <div key={i} className="font-body text-sm">
                      <p className="text-foreground">{isPending(tr.name) ? <PendingChip label={tr.name.label} /> : tr.name}</p>
                      <p className="text-muted-foreground">
                        {tr.usage} · {tr.frequency}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <Button onClick={confirm} caps className="mt-2 w-full">
              {t('app.preDelivery.confirmCta')}
            </Button>
          </>
        )}

        {view === 'shipping' && (
          <>
            <section className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-sm">
              <p className="font-body text-sm text-muted-foreground">
                {t('app.preDelivery.orderedOn', { date: program.orderedAt })}
              </p>

              {/* Same placeholder as the landing screen — no carrier integration
                   exists in this build, so no real map/route to show. */}
              <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-accent bg-cream-100">
                <MapIcon aria-hidden className="h-6 w-6 text-accent" strokeWidth={1.5} />
                <p className="px-4 text-center font-body text-sm text-muted-foreground">{t('app.preDelivery.mapCaption')}</p>
              </div>

              <div className="flex items-center gap-2 py-1">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-deep-800 bg-deep-800 text-cream-50">
                  <Check className="h-3 w-3" strokeWidth={2.5} aria-hidden />
                </span>
                <span className="font-body text-sm text-muted-foreground">{t('app.preDelivery.orderedStage')}</span>
                <span aria-hidden className="mx-1 h-px w-6 bg-deep-800" />
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-deep-800 font-body text-sm font-semibold text-deep-900">
                  2
                </span>
                <span className="font-body text-sm text-foreground">{t('app.preDelivery.preparingStage')}</span>
              </div>

              <p className="font-body text-sm text-muted-foreground">{t('app.preDelivery.shippingNote')}</p>
            </section>

            <section className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-sm">
              <p className="font-display text-lg font-medium text-foreground">
                {t('app.preDelivery.shipping.orderSummary')}
              </p>
              <p className="font-body text-sm text-foreground">
                {t('report.duration.label', { days: program.durationDays })}
              </p>
              <PlanTreatmentList program={program} />
              <div className="flex items-center justify-between border-t border-border pt-3 font-body text-sm">
                <span className="text-muted-foreground">{t('app.preDelivery.shipping.priceLabel')}</span>
                {priceRow && priceRow.price !== null ? (
                  <span className="font-medium text-foreground">
                    {formatMoney(priceRow.price, rooteContent.currency, cl).formatted}
                  </span>
                ) : (
                  <PendingChip label="order total" />
                )}
              </div>
            </section>

            <section className="flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm">
              <p className="mb-2 font-display text-lg font-medium text-foreground">
                {t('app.preDelivery.shipping.supportCenter')}
              </p>
              <div className="flex flex-col divide-y divide-border">
                <SupportRow label={t('app.preDelivery.shipping.refundRow')} onClick={() => setView('refund')} />
                <SupportRow label={t('app.preDelivery.shipping.contactRow')} onClick={() => setView('contact')} />
                <SupportRow label={t('app.preDelivery.shipping.helpRow')} onClick={() => setView('help')} />
              </div>
            </section>
          </>
        )}

        {view === 'refund' && (
          <form onSubmit={submitRefund} className="flex flex-col gap-6">
            <Prose className="text-sm">{t('app.preDelivery.refund.intro')}</Prose>

            <div className="flex flex-col gap-2">
              <p className="font-body text-sm font-medium text-foreground">{t('app.preDelivery.refund.reasonLabel')}</p>
              <div className="grid grid-cols-2 gap-2">
                {REFUND_REASON_KEYS.map((key) => (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={refundReason === key}
                    onClick={() => setRefundReason(key)}
                    className={
                      'rounded-lg border px-4 py-2.5 text-start font-body text-sm transition-colors ' +
                      (refundReason === key
                        ? 'border-deep-800 bg-deep-800 text-cream-50'
                        : 'border-border text-foreground hover:border-deep-700')
                    }
                  >
                    {t(key)}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex flex-col gap-2 text-sm">
              {t('app.preDelivery.refund.detailsLabel')}
              <textarea
                rows={4}
                value={refundDetails}
                onChange={(e) => setRefundDetails(e.target.value)}
                placeholder={t('app.preDelivery.refund.detailsPlaceholder')}
                className="rounded-md border border-input bg-input-background px-3 py-2 text-sm outline-none focus:border-accent"
              />
            </label>

            <Button type="submit" caps className="w-full" disabled={!refundReason}>
              {t('app.preDelivery.refund.submit')}
            </Button>
          </form>
        )}

        {view === 'refundSent' && (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-cream-100 text-accent">
              <Check aria-hidden className="h-6 w-6" strokeWidth={2} />
            </span>
            <DisplayTitle as="h2" step="sm" align="center">
              {t('app.preDelivery.refundSent.title')}
            </DisplayTitle>
            <Prose className="max-w-sm text-sm">{t('app.preDelivery.refundSent.body')}</Prose>
            <Button onClick={() => setView('shipping')} caps>
              {t('app.preDelivery.refundSent.back')}
            </Button>
          </div>
        )}

        {view === 'contact' && (
          <section className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-sm">
            <Prose className="text-sm">{t('app.preDelivery.contact.body')}</Prose>
            <div className="flex flex-col gap-1">
              <a href={`mailto:${support.email}`} dir="ltr" className="font-body text-sm text-accent underline">
                {support.email}
              </a>
              <a href={support.phoneHref} dir="ltr" className="font-body text-sm text-accent underline">
                {support.phone}
              </a>
            </div>
          </section>
        )}

        {view === 'help' && <Accordion items={helpItems} />}
      </main>
    </div>
  );
}
