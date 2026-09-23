import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useT, useLocalizedPath } from '@/i18n/LocaleProvider';
import { useAuth } from '@/store/auth';
import { useSession } from '@/store/sessionStore';
import { PasswordField } from '@/app/components/roote';
import { funnelField, funnelHeading, funnelPrimaryBtn } from '@/app/components/funnel/funnelStyles';
import { PATHS } from '@/app/paths';
import heroImage from '@/assets/heroes/Hero.png';

const ERROR_KEYS: Record<string, string> = {
  'not-found': 'auth.login.error.notFound',
  'wrong-password': 'auth.login.error.wrongPassword',
  'no-password': 'auth.login.error.noPassword',
  'order-not-found': 'auth.login.error.orderNotFound',
};

export function LoginPage() {
  const t = useT();
  const withLocale = useLocalizedPath();
  const navigate = useNavigate();
  const auth = useAuth();
  const session = useSession();
  const [email, setEmail] = useState(auth.email ?? '');
  const [password, setPassword] = useState('');
  const [orderId, setOrderId] = useState('');
  // Guest checkout means most customers never set a password — the order number
  // from their confirmation + their email is the other way in (Mischa review).
  const [mode, setMode] = useState<'password' | 'order'>('password');
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const result =
      mode === 'order' ? auth.signInWithOrder(email, orderId) : auth.signIn(email.trim(), password);
    if (!result.ok) {
      setError(t(ERROR_KEYS[result.error] as never));
      return;
    }
    // Program owners land on their dashboard; shop-only customers on their orders.
    navigate(withLocale(session.program ? PATHS.account : PATHS.accountSection('profile')));
  }

  function switchMode(next: 'password' | 'order') {
    setMode(next);
    setError(null);
  }

  return (
    <div className="mx-auto grid w-full max-w-5xl items-center gap-12 px-6 py-16 lg:grid-cols-2">
      <img
        src={heroImage}
        alt={t('marketing.home.hero.mediaAlt')}
        loading="lazy"
        className="hidden aspect-square w-full object-contain shadow-product lg:block"
      />
      <div className="mx-auto flex w-full max-w-sm flex-col gap-4">
        <h1 className={funnelHeading}>{t('auth.login.title')}</h1>
        <form className="flex flex-col gap-4" onSubmit={submit}>
          <label className="flex flex-col gap-2 text-sm">
            {t('start.account.emailLabel')}
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={funnelField}
            />
          </label>
          {mode === 'password' ? (
            <label className="flex flex-col gap-2 text-sm">
              {t('start.account.passwordLabel')}
              <PasswordField
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                inputClassName={funnelField}
              />
            </label>
          ) : (
            <label className="flex flex-col gap-2 text-sm">
              {t('auth.login.orderLabel')}
              <input
                required
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                autoComplete="off"
                className={funnelField}
              />
              <span className="text-sm text-muted-foreground">{t('auth.login.orderHint')}</span>
            </label>
          )}
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <button type="submit" className={funnelPrimaryBtn}>{t('auth.login.submit')}</button>
          <button
            type="button"
            onClick={() => switchMode(mode === 'password' ? 'order' : 'password')}
            className="text-sm text-accent underline"
          >
            {mode === 'password' ? t('auth.login.withOrder') : t('auth.login.withPassword')}
          </button>
        </form>
        <p className="text-sm text-muted-foreground">
          {t('auth.login.noAccount')}{' '}
          <Link to={withLocale(PATHS.analysis)} className="text-accent underline">
            {t('auth.login.startCta')}
          </Link>
        </p>
      </div>
    </div>
  );
}
