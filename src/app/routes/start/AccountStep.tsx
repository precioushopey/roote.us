// src/app/routes/start/AccountStep.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useT } from '@/i18n/LocaleProvider';
import { useSession } from '@/store/sessionStore';
import { useAuth } from '@/store/auth';
import { funnelField, funnelHeading, funnelPrimaryBtn } from '@/app/components/funnel/funnelStyles';

const ERROR_KEYS: Record<string, string> = {
  'invalid-email': 'start.account.error.invalidEmail',
  'weak-password': 'start.account.error.weakPassword',
  'duplicate-email': 'start.account.error.duplicateEmail',
};

export function AccountStep() {
  const t = useT();
  const navigate = useNavigate();
  const session = useSession();
  const auth = useAuth();
  const [email, setEmail] = useState(session.account.email ?? '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = auth.signUp(email, password);
    if (!result.ok) {
      setError(t(ERROR_KEYS[result.error] as never));
      return;
    }
    session.setEmail(email);
    navigate('/start/plan');
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-4">
      <h1 className={funnelHeading}>{t('start.account.title')}</h1>
      <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
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
        <button type="submit" className={funnelPrimaryBtn}>
          {t('start.account.submit')}
        </button>
        {/* TODO: confirm with client — magic-link sign-in as an alternative to password auth */}
        <button type="button" disabled className="text-xs text-muted-foreground underline opacity-50">
          {t('start.account.magicLink')}
        </button>
      </form>
      <p className="text-xs text-muted-foreground">
        {t('start.account.haveAccount')}{' '}
        <Link to="/login" className="text-accent underline">{t('start.account.signInCta')}</Link>
      </p>
    </div>
  );
}
