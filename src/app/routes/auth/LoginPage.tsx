import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useT, useLocalizedPath } from '@/i18n/LocaleProvider';
import { useAuth } from '@/store/auth';
import { useSession } from '@/store/sessionStore';
import { funnelField, funnelHeading, funnelPrimaryBtn } from '@/app/components/funnel/funnelStyles';
import { EXTERNAL_ASSESSMENT_URL } from '@/app/paths';
import heroImage from '@/assets/heroes/Hero.png';

const ERROR_KEYS: Record<string, string> = {
  'not-found': 'auth.login.error.notFound',
  'wrong-password': 'auth.login.error.wrongPassword',
};

export function LoginPage() {
  const t = useT();
  const withLocale = useLocalizedPath();
  const navigate = useNavigate();
  const auth = useAuth();
  const session = useSession();
  const [email, setEmail] = useState(auth.email ?? '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const result = auth.signIn(email.trim(), password);
    if (!result.ok) {
      setError(t(ERROR_KEYS[result.error] as never));
      return;
    }
    navigate(withLocale(session.program ? '/account' : '/'));
  }

  return (
    <div className="mx-auto grid w-full max-w-5xl items-center gap-10 px-6 py-16 lg:grid-cols-2">
      <img
        src={heroImage}
        alt={t('marketing.home.hero.mediaAlt')}
        className="hidden aspect-square w-full object-contain drop-shadow-[0_30px_40px_rgba(6,46,49,0.18)] lg:block"
      />
      <div className="mx-auto flex w-full max-w-sm flex-col gap-4">
        <h1 className={funnelHeading}>{t('auth.login.title')}</h1>
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
          <button type="submit" className={funnelPrimaryBtn}>{t('auth.login.submit')}</button>
        </form>
        <p className="text-sm text-muted-foreground">
          {t('auth.login.noAccount')}{' '}
          <a href={EXTERNAL_ASSESSMENT_URL} target="_blank" rel="noopener noreferrer" className="text-accent underline">
            {t('auth.login.startCta')}
          </a>
        </p>
      </div>
    </div>
  );
}
