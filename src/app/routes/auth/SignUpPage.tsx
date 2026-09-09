import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useT, useLocalizedPath } from '@/i18n/LocaleProvider';
import { useAuth } from '@/store/auth';
import { useSession } from '@/store/sessionStore';
import { funnelField, funnelHeading, funnelPrimaryBtn } from '@/app/components/funnel/funnelStyles';
import { PATHS } from '@/app/paths';

const ERROR_KEYS: Record<string, string> = {
  'invalid-email': 'start.account.error.invalidEmail',
  'weak-password': 'start.account.error.weakPassword',
  'duplicate-email': 'start.account.error.duplicateEmail',
};

type SignUpState = { orderId?: string } | null;

/**
 * A standalone signup form — not part of the /program assessment funnel.
 * Reached from BagSuccess's "Track my order" CTA for a guest who checked out
 * via the bag without an account. Order history (store/orders.ts) is a flat,
 * unauthenticated list in this browser's localStorage, so any account
 * created here already "sees" the order that was just placed — no explicit
 * linking step needed, just an account to view /account/orders through.
 */
export function SignUpPage() {
  const t = useT();
  const withLocale = useLocalizedPath();
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();
  const session = useSession();
  const orderId = (location.state as SignUpState)?.orderId;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const result = auth.signUp(email.trim(), password);
    if (!result.ok) {
      setError(t(ERROR_KEYS[result.error] as never));
      return;
    }
    session.setEmail(email.trim());
    navigate(withLocale(PATHS.accountSection('orders')));
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-4 px-6 py-16">
      <h1 className={funnelHeading}>{t('auth.signUp.title')}</h1>
      {orderId ? <p className="font-body text-sm text-muted-foreground">{t('auth.signUp.orderNote', { orderId })}</p> : null}
      <form className="flex flex-col gap-3" onSubmit={submit}>
        <label className="flex flex-col gap-1 text-sm">
          {t('start.account.emailLabel')}
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={funnelField}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          {t('start.account.passwordLabel')}
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={funnelField}
          />
        </label>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <button type="submit" className={funnelPrimaryBtn}>{t('start.account.submit')}</button>
      </form>
      <p className="text-sm text-muted-foreground">
        {t('start.account.haveAccount')}{' '}
        <Link to={withLocale('/login')} className="text-accent underline">{t('start.account.signInCta')}</Link>
      </p>
    </div>
  );
}
