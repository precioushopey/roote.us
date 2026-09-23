import { useState } from 'react';
import { Link } from 'react-router';
import { useT, useLocalizedPath } from '@/i18n/LocaleProvider';
import { useSession } from '@/store/sessionStore';
import { useAuth } from '@/store/auth';
import { Button, Card, Badge, LegalNotice, Prose, PasswordField } from '@/app/components/roote';
import { track } from '@/analytics/analytics';
import { AccountPageHeader } from './AccountPageHeader';
import { CARE_MESSAGES, isoToday, programDay } from './programProgress';
import type { MessageKey } from '@/i18n/messages';

const PW_ERROR_KEYS: Record<string, string> = {
  'not-signed-in': 'app.profile.password.error.wrong',
  'wrong-password': 'app.profile.password.error.wrong',
  'weak-password': 'app.profile.password.error.weak',
};

/** Reachable without an active program too — a signed-up guest lands here to
 *  manage their account even before a program exists (see AppShell's route
 *  guard). Order history moved to its own page (AppOrders.tsx, 2026-09-23);
 *  what used to be the separate Care/Support page lives here now instead —
 *  see the "Care team" section below, gated on `program` like every other
 *  program-dependent section on this page. */
export function AppProfile() {
  const t = useT();
  const withLocale = useLocalizedPath();
  const auth = useAuth();
  const program = useSession().program;

  const [subActive, setSubActive] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [careSent, setCareSent] = useState(false);

  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwOk, setPwOk] = useState(false);

  function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError(null);
    setPwOk(false);
    const result = auth.changePassword(current, next);
    if (!result.ok) {
      setPwError(t(PW_ERROR_KEYS[result.error] as never));
      return;
    }
    setCurrent('');
    setNext('');
    setPwOk(true);
  }

  const memberSince = auth.since ? new Date(auth.since).toLocaleDateString() : '-';
  // Care messages unlock by program day — only meaningful once a program
  // exists, so the section below this is gated on `program` entirely.
  const unlockedCareMessages = program ? CARE_MESSAGES.filter((m) => m.day <= programDay(program, isoToday())) : [];
  const fieldClass =
    'rounded-md border border-input bg-input-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-accent';

  return (
    <div data-animate className="flex flex-col gap-4 md:gap-8">
      <AccountPageHeader eyebrow={t('app.nav.profile')} title={t('app.profile.title')} />

      {/* Two independent column stacks, not a shared CSS grid — a grid row's
          height is set by its tallest cell, so a short card (e.g. Notifications)
          next to a tall one (e.g. Subscription) would sit pinned at the top of
          a too-tall row, leaving a dead gap above the next row. Each column
          flowing on its own avoids that. */}
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 lg:items-start">
        <div className="flex flex-col gap-4 md:gap-8">
          {program && (
            <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
              <h2 className="font-display text-lg font-medium">{t('app.subscription.title')}</h2>
              {/* padded={false}: this card is borderless and shares the section's own
                  background, so its default p-6 only stacked on the section's p-5. */}
              <Card padded={false}>
                <div className="flex items-center justify-between gap-4">
                  <p className="font-body text-sm text-foreground">{t('app.subscription.status')}</p>
                  <Badge tone={subActive ? 'success' : 'neutral'}>
                    {subActive ? t('app.subscription.on') : t('app.subscription.off')}
                  </Badge>
                </div>
                <dl className="mt-4 flex flex-col gap-2 font-body text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">{t('app.subscription.cadence')}</dt>
                    <dd className="text-foreground">{t('report.duration.label', { days: program.durationDays })}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">{t('app.subscription.nextCharge')}</dt>
                    <dd className="text-foreground">{program.endDate}</dd>
                  </div>
                </dl>
                <div className="mt-5 flex flex-wrap gap-4">
                  {subActive ? (
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setCancelling(true);
                        track('subscription_cancel_started');
                      }}
                    >
                      {t('app.subscription.cancel')}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        setSubActive(true);
                        track('subscription_manage_opened', { action: 'enable' });
                      }}
                    >
                      {t('app.subscription.enable')}
                    </Button>
                  )}
                </div>
              </Card>
              {cancelling && (
                <Card tone="cream">
                  <Prose>{t('app.subscription.cancelConfirmBody')}</Prose>
                  <div className="mt-4 flex flex-wrap gap-4">
                    <Button
                      variant="danger"
                      onClick={() => {
                        setSubActive(false);
                        setCancelling(false);
                        track('subscription_cancel_completed');
                      }}
                    >
                      {t('app.subscription.cancelConfirm')}
                    </Button>
                    <Button variant="ghost" onClick={() => setCancelling(false)}>
                      {t('common.back')}
                    </Button>
                  </div>
                </Card>
              )}
              <LegalNotice>{t('app.subscription.legal')}</LegalNotice>
            </section>
          )}

          {program && (
            <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
              <h2 className="font-display text-lg font-medium">{t('app.care.title')}</h2>
              <p className="text-sm text-muted-foreground">{t('app.care.subtitle')}</p>

              {unlockedCareMessages.length > 0 && (
                <div className="flex flex-col gap-4">
                  {unlockedCareMessages.map((m) => (
                    <article key={m.key} className="rounded-xl border border-border bg-background p-4">
                      <p className="text-sm font-medium uppercase text-accent">
                        {t('app.care.dayTag', { day: m.day })}
                      </p>
                      <p className="mt-1 text-sm">{t(m.key as MessageKey)}</p>
                    </article>
                  ))}
                </div>
              )}

              <form
                className="flex flex-col gap-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  setCareSent(true);
                }}
              >
                <label className="flex flex-col gap-2 text-sm">
                  {t('app.care.compose.title')}
                  <textarea
                    required
                    rows={4}
                    className="rounded-md border border-input bg-input-background px-3 py-2 text-sm outline-none focus:border-accent"
                  />
                </label>
                <Button type="submit">{t('app.care.compose.send')}</Button>
                {careSent && (
                  <p role="status" className="text-sm text-muted-foreground">
                    {t('app.care.compose.stub')}
                  </p>
                )}
              </form>

              <Link to={withLocale('/account/rescan')} className="w-fit text-sm text-accent underline">
                {t('app.care.rescanLink')}
              </Link>
            </section>
          )}
        </div>

        <div className="flex flex-col gap-4 md:gap-8">
          <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
            <h2 className="font-display text-lg font-medium">{t('app.profile.account.title')}</h2>
            <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2 lg:grid-cols-1">
              <div className="flex flex-col">
                <dt className="text-sm uppercase text-muted-foreground">{t('app.profile.email')}</dt>
                <dd>{auth.email}</dd>
              </div>
              <div className="flex flex-col">
                <dt className="text-sm uppercase text-muted-foreground">{t('app.profile.memberSince')}</dt>
                <dd>{memberSince}</dd>
              </div>
            </dl>
          </section>

          {program && (
            <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
              <h2 className="font-display text-lg font-medium">{t('app.profile.program.title')}</h2>
              <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2 lg:grid-cols-1">
                <div className="flex flex-col">
                  <dt className="text-sm uppercase text-muted-foreground">{t('app.profile.orderId')}</dt>
                  <dd className="tabular-nums">{program.orderId}</dd>
                </div>
                <div className="flex flex-col">
                  <dt className="text-sm uppercase text-muted-foreground">{t('app.profile.duration')}</dt>
                  <dd>{t('report.duration.label', { days: program.durationDays })}</dd>
                </div>
                <div className="flex flex-col sm:col-span-2">
                  <dt className="text-sm uppercase text-muted-foreground">{t('app.profile.dates')}</dt>
                  <dd>{program.startDate} → {program.endDate}</dd>
                </div>
              </dl>
              <Link to={withLocale(`/report/${program.reportId}`)} className="w-fit text-sm text-accent underline">
                {t('app.profile.viewReport')}
              </Link>
            </section>
          )}

          {program && (
            <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
              <h2 className="font-display text-lg font-medium">{t('app.reminders.title')}</h2>
              <p className="text-sm text-muted-foreground">{t('app.reminders.subtitle')}</p>
              <Link to={withLocale('/account/reminders')} className="w-fit text-sm text-accent underline">
                {t('app.reminders.manage')}
              </Link>
            </section>
          )}

          <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
            <h2 className="font-display text-lg font-medium">{t('app.profile.password.title')}</h2>
            <form className="flex flex-col gap-4" onSubmit={changePassword}>
              <label className="flex flex-col gap-2 text-sm">
                {t('app.profile.password.currentLabel')}
                <PasswordField
                  required
                  value={current}
                  onChange={(e) => setCurrent(e.target.value)}
                  inputClassName={fieldClass}
                />
              </label>
              <label className="flex flex-col gap-2 text-sm">
                {t('app.profile.password.newLabel')}
                <PasswordField
                  required
                  value={next}
                  onChange={(e) => setNext(e.target.value)}
                  inputClassName={fieldClass}
                />
              </label>
              {pwError && <p role="alert" className="text-sm text-destructive">{pwError}</p>}
              {pwOk && <p role="status" className="text-sm text-muted-foreground">{t('app.profile.password.success')}</p>}
              <button
                type="submit"
                className="inline-flex w-fit items-center justify-center rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground"
              >
                {t('app.profile.password.submit')}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
