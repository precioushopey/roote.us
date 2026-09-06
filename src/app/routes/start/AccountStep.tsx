import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useT, useLocalizedPath } from '@/i18n/LocaleProvider';
import { useSession } from '@/store/sessionStore';
import { useAuth } from '@/store/auth';
import { DisplayTitle, Button, TextLink } from '@/app/components/roote';
import { track } from '@/analytics/analytics';

const ERROR_KEYS: Record<string, string> = {
  'invalid-email': 'start.account.error.invalidEmail',
  'weak-password': 'start.account.error.weakPassword',
  'duplicate-email': 'start.account.error.duplicateEmail',
};

const FIELD = 'rounded-md border border-input bg-input-background px-3 py-2.5 font-body text-sm outline-none focus:border-accent';

export function AccountStep() {
  const t = useT();
  const withLocale = useLocalizedPath();
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
    track('account_activated');
    navigate(withLocale('/program/plan'));
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6">
      <DisplayTitle as="h1" step="sm">
        {t('start.account.title')}
      </DisplayTitle>
      <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-1 font-body text-sm">
          {t('start.account.emailLabel')}
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={FIELD} />
        </label>
        <label className="flex flex-col gap-1 font-body text-sm">
          {t('start.account.passwordLabel')}
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={FIELD}
          />
        </label>
        {error && (
          <p role="alert" className="font-body text-sm text-destructive">
            {error}
          </p>
        )}
        <Button block type="submit">
          {t('start.account.submit')}
        </Button>
        {/* TODO: confirm with client — magic-link sign-in as an alternative to password auth */}
        <button type="button" disabled className="font-body text-xs text-muted-foreground underline opacity-50">
          {t('start.account.magicLink')}
        </button>
      </form>
      <p className="font-body text-xs text-muted-foreground">
        {t('start.account.haveAccount')} <TextLink to={withLocale('/login')}>{t('start.account.signInCta')}</TextLink>
      </p>
    </div>
  );
}
