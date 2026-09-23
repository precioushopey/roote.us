import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useT, useLocalizedPath } from '@/i18n/LocaleProvider';
import { useAuth } from '@/store/auth';
import { useSession } from '@/store/sessionStore';
import { PasswordField } from '@/app/components/roote';
import { funnelField, funnelHeading, funnelPrimaryBtn } from '@/app/components/funnel/funnelStyles';
import { PATHS } from '@/app/paths';

const ERROR_KEYS: Record<string, string> = {
  'invalid-email': 'start.account.error.invalidEmail',
  'weak-password': 'start.account.error.weakPassword',
  'duplicate-email': 'start.account.error.duplicateEmail',
};

/**
 * A standalone signup form — not part of any purchase path (checkout needs no
 * account; buyers get back in with order number + email). Order history
 * (store/orders.ts) is a flat list in this browser's localStorage, so an
 * account created here already "sees" any order placed on this device.
 */
export function SignUpPage() {
  const t = useT();
  const withLocale = useLocalizedPath();
  const navigate = useNavigate();
  const auth = useAuth();
  const session = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError(t('auth.signUp.error.mismatch'));
      return;
    }
    const result = auth.signUp(email.trim(), password);
    if (!result.ok) {
      setError(t(ERROR_KEYS[result.error] as never));
      return;
    }
    session.setEmail(email.trim());
    // Never drop a brand-new customer into an empty dashboard (Mischa review):
    // the dashboard is for program owners; everyone else goes back to the shop.
    navigate(withLocale(session.program ? PATHS.account : PATHS.products));
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-4 px-6 py-16">
      <h1 className={funnelHeading}>{t('auth.signUp.title')}</h1>
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
        <label className="flex flex-col gap-2 text-sm">
          {t('start.account.passwordLabel')}
          <PasswordField
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            inputClassName={funnelField}
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          {t('auth.signUp.confirmLabel')}
          <PasswordField
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            inputClassName={funnelField}
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
