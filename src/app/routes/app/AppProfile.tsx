import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useT, useLocale, useLocalizedPath } from '@/i18n/LocaleProvider';
import { LOCALES } from '@/i18n/locales';
import { useSession } from '@/store/sessionStore';
import { useAuth } from '@/store/auth';
import { useCart } from '@/store/cart';
import { readOrders } from '@/store/orders';
import { Button, Card, Badge, LegalNotice, Prose, LanguagePicker, Modal } from '@/app/components/roote';
import { CartLink } from '@/app/components/shell/CartLink';
import { PATHS } from '@/app/paths';
import { track } from '@/analytics/analytics';
import { AccountPageHeader } from './AccountPageHeader';

const PW_ERROR_KEYS: Record<string, string> = {
  'not-signed-in': 'app.profile.password.error.wrong',
  'wrong-password': 'app.profile.password.error.wrong',
  'weak-password': 'app.profile.password.error.weak',
};

/** Reachable without an active program too — a guest who only bought from the
 *  à-la-carte bag lands here to see their order (see AppShell's route guard). */
export function AppProfile() {
  const t = useT();
  const { locale, setLocale } = useLocale();
  const withLocale = useLocalizedPath();
  const navigate = useNavigate();
  const auth = useAuth();
  const cart = useCart();
  const program = useSession().program;

  const orders = useMemo(() => readOrders(), []);
  const [subActive, setSubActive] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [leaveWarningOpen, setLeaveWarningOpen] = useState(false);

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

  function logout() {
    auth.signOut();
    navigate(withLocale('/'));
  }

  /* The only intended way out of /account is Log out — a link that browses
     away (e.g. Shop products) instead confirms first, since it's really
     asking to sign the user out to go do something else. */
  function confirmLeaveToShop() {
    setLeaveWarningOpen(false);
    auth.signOut();
    navigate(withLocale(PATHS.products));
  }

  const memberSince = auth.since ? new Date(auth.since).toLocaleDateString() : '-';
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
          <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
            <h2 className="font-display text-lg font-medium">{t('app.profile.account.title')}</h2>
            <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
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
              <h2 className="font-display text-lg font-medium">{t('app.subscription.title')}</h2>
              <Card>
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

          <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="font-display text-lg font-medium">{t('app.profile.orders.title')}</h2>
              <button
                type="button"
                onClick={() => setLeaveWarningOpen(true)}
                className="font-body text-sm text-accent underline"
              >
                {t('app.nav.shop')}
              </button>
            </div>
            {orders.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('app.profile.orders.empty')}</p>
            ) : (
              <ul className="flex flex-col divide-y divide-border text-sm">
                {orders.map((o) => (
                  <li key={o.id} className="flex items-center justify-between gap-4 py-2.5">
                    <span className="flex flex-col">
                      <span className="tabular-nums" dir="ltr">{o.id}</span>
                      <span className="text-sm text-muted-foreground">
                        {t(o.kind === 'program' ? 'app.profile.orders.program' : 'app.profile.orders.bag')} · {o.label}
                      </span>
                    </span>
                    <span className="shrink-0 text-sm text-muted-foreground">
                      {new Date(o.at).toLocaleDateString(LOCALES[locale].bcp47)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="flex flex-col gap-4 md:gap-8">
          {program && (
            <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
              <h2 className="font-display text-lg font-medium">{t('app.profile.program.title')}</h2>
              <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
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
                <input
                  type="password"
                  required
                  value={current}
                  onChange={(e) => setCurrent(e.target.value)}
                  className={fieldClass}
                />
              </label>
              <label className="flex flex-col gap-2 text-sm">
                {t('app.profile.password.newLabel')}
                <input
                  type="password"
                  required
                  value={next}
                  onChange={(e) => setNext(e.target.value)}
                  className={fieldClass}
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

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-1">
              <CartLink label={t('cart.open')} count={cart.count} />
              <LanguagePicker compact locale={locale} onChange={setLocale} />
            </div>
            <button
              type="button"
              onClick={logout}
              className="inline-flex w-fit items-center justify-center rounded-full border border-border px-6 py-3 text-sm text-foreground transition-colors hover:border-accent"
            >
              {t('app.profile.logout')}
            </button>
          </div>
        </div>
      </div>

      <Modal
        open={leaveWarningOpen}
        onClose={() => setLeaveWarningOpen(false)}
        title={t('app.profile.leaveWarning.title')}
        footer={
          <>
            <Button variant="ghost" onClick={() => setLeaveWarningOpen(false)}>
              {t('common.back')}
            </Button>
            <Button variant="danger" onClick={confirmLeaveToShop}>
              {t('app.profile.leaveWarning.confirm')}
            </Button>
          </>
        }
      >
        <Prose>{t('app.profile.leaveWarning.body')}</Prose>
      </Modal>
    </div>
  );
}
