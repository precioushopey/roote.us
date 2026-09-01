import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { useLocale, useT } from '@/i18n/LocaleProvider';
import { useSession } from '@/store/sessionStore';
import { redirectForStep } from './guards';
import { rooteContent } from '@/content/roote.config';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ReadyStep() {
  const t = useT();
  const { locale } = useLocale();
  const navigate = useNavigate();
  const session = useSession();
  const [email, setEmailValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const redirect = redirectForStep('ready', session);
  if (redirect) return <Navigate to={redirect} replace />;

  const a = session.analysis!;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) { setError(t('ready.email.invalid')); return; }
    session.setEmail(email.trim());
    // TODO: email backend — trigger the PDF render + send here.
    navigate(`/report/${session.reportId}`);
  }

  return (
    <section className="mx-auto max-w-md text-center flex flex-col gap-6">
      <h1 className="text-2xl">{t('ready.title')}</h1>
      <p className="text-sm text-muted-foreground">
        {t('ready.teaser', {
          scale: t(`scale.${a.scale}.label` as never),
          severity: t(`severity.${a.severityBand}` as never),
          zones: a.flaggedZones.length,
        })}
      </p>
      <p className="text-xs text-accent">{rooteContent.disclaimers.demo[locale]}</p>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmailValue(e.target.value)}
          placeholder={t('ready.email.placeholder')}
          className="rounded-md border border-input bg-input-background px-4 py-3 text-sm"
          aria-label={t('ready.email.placeholder')}
        />
        <button type="submit" className="rounded-md bg-primary text-primary-foreground px-8 py-4 text-sm tracking-wide">
          {t('ready.email.submit')}
        </button>
        {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
      </form>
      <p className="text-[11px] text-muted-foreground">{t('ready.consent')}{/* TODO: confirm with client — consent/legal copy */}</p>
    </section>
  );
}
