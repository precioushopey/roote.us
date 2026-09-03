import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useT, useLocale } from '@/i18n/LocaleProvider';
import { useSession } from '@/store/sessionStore';
import { useAuth } from '@/store/auth';
import { readOrders } from '@/store/orders';

const PW_ERROR_KEYS: Record<string, string> = {
  'not-signed-in': 'app.profile.password.error.wrong',
  'wrong-password': 'app.profile.password.error.wrong',
  'weak-password': 'app.profile.password.error.weak',
};

export function AppProfile() {
  const t = useT();
  const { locale } = useLocale();
  const navigate = useNavigate();
  const auth = useAuth();
  const program = useSession().program!;

  const orders = useMemo(() => readOrders(), []);

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
    navigate('/');
  }

  const memberSince = auth.since ? new Date(auth.since).toLocaleDateString() : '—';
  const fieldClass =
    'rounded-md border border-input bg-input-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-accent';

  return (
    <div data-animate className="flex max-w-2xl flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-medium lg:text-4xl">{t('app.profile.title')}</h1>
      </header>

      <section className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-sm">
        <h2 className="font-display text-lg font-medium">{t('app.profile.account.title')}</h2>
        <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          <div className="flex flex-col">
            <dt className="text-xs uppercase tracking-[0.1em] text-muted-foreground">{t('app.profile.email')}</dt>
            <dd>{auth.email}</dd>
          </div>
          <div className="flex flex-col">
            <dt className="text-xs uppercase tracking-[0.1em] text-muted-foreground">{t('app.profile.memberSince')}</dt>
            <dd>{memberSince}</dd>
          </div>
        </dl>
      </section>

      <section className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-sm">
        <h2 className="font-display text-lg font-medium">{t('app.profile.program.title')}</h2>
        <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          <div className="flex flex-col">
            <dt className="text-xs uppercase tracking-[0.1em] text-muted-foreground">{t('app.profile.orderId')}</dt>
            <dd className="tabular-nums">{program.orderId}</dd>
          </div>
          <div className="flex flex-col">
            <dt className="text-xs uppercase tracking-[0.1em] text-muted-foreground">{t('app.profile.duration')}</dt>
            <dd>{t('report.duration.label', { days: program.durationDays })}</dd>
          </div>
          <div className="flex flex-col sm:col-span-2">
            <dt className="text-xs uppercase tracking-[0.1em] text-muted-foreground">{t('app.profile.dates')}</dt>
            <dd>{program.startDate} → {program.endDate}</dd>
          </div>
        </dl>
        <Link to={`/report/${program.reportId}`} className="w-fit text-sm text-accent underline">
          {t('app.profile.viewReport')}
        </Link>
      </section>

      <section className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-sm">
        <h2 className="font-display text-lg font-medium">{t('app.profile.orders.title')}</h2>
        {orders.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('app.profile.orders.empty')}</p>
        ) : (
          <ul className="flex flex-col divide-y divide-border text-sm">
            {orders.map((o) => (
              <li key={o.id} className="flex items-center justify-between gap-3 py-2.5">
                <span className="flex flex-col">
                  <span className="tabular-nums" dir="ltr">{o.id}</span>
                  <span className="text-xs text-muted-foreground">
                    {t(o.kind === 'program' ? 'app.profile.orders.program' : 'app.profile.orders.bag')} · {o.label}
                  </span>
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {new Date(o.at).toLocaleDateString(locale === 'he' ? 'he-IL' : 'en-US')}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-sm">
        <h2 className="font-display text-lg font-medium">{t('app.profile.password.title')}</h2>
        <form className="flex flex-col gap-3" onSubmit={changePassword}>
          <label className="flex flex-col gap-1 text-sm">
            {t('app.profile.password.currentLabel')}
            <input
              type="password"
              required
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
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

      <button
        type="button"
        onClick={logout}
        className="inline-flex w-fit items-center justify-center rounded-full border border-border px-6 py-3 text-sm text-foreground transition-colors hover:border-accent"
      >
        {t('app.profile.logout')}
      </button>
    </div>
  );
}
