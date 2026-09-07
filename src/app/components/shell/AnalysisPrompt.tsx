import { useEffect, useState } from 'react';
import { useT, useLocalizedPath } from '@/i18n/LocaleProvider';
import { Modal, Button } from '@/app/components/roote';
import { track } from '@/analytics/analytics';
import { PATHS } from '@/app/paths';

const DISMISS_KEY = 'roote.popup.analysis.dismissed';

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/** Returning visitor if a session or an auth session already exists on-device. */
function isReturning(): boolean {
  const session = safeGet('roote.session');
  if (session && (session.includes('"reportId":"') || session.includes('"gender":"'))) return true;
  return safeGet('roote.authSession') != null;
}

/**
 * Homepage exit aid (brief §34). Never a discount pop-up. Does not interrupt the
 * hero on first load — it waits for a delay, meaningful scroll depth, or an
 * exit-intent gesture, and only shows once (dismissal is remembered). Reads
 * on-device state directly so it has no provider dependency.
 */
export function AnalysisPrompt() {
  const t = useT();
  const withLocale = useLocalizedPath();
  const [open, setOpen] = useState(false);
  const [returning, setReturning] = useState(false);

  useEffect(() => {
    if (safeGet(DISMISS_KEY) === '1') return;
    let done = false;

    const trigger = () => {
      if (done) return;
      done = true;
      cleanup();
      setReturning(isReturning());
      setOpen(true);
      track('hero_analysis_clicked', { source: 'exit_prompt_shown' });
    };

    const onScroll = () => {
      const max = Math.max(1, document.body.scrollHeight - window.innerHeight);
      if (window.scrollY / max > 0.45) trigger();
    };
    const onMouseOut = (e: MouseEvent) => {
      if (e.clientY <= 0) trigger();
    };
    const timer = window.setTimeout(trigger, 30000);
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('mouseout', onMouseOut);

    function cleanup() {
      window.clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('mouseout', onMouseOut);
    }
    return cleanup;
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      /* ignore */
    }
    setOpen(false);
  };

  return (
    <Modal open={open} onClose={dismiss} title={t('marketing.popup.title')} hideTitle>
      <div className="flex flex-col items-center gap-3 text-center">
        <p className="font-body text-sm text-muted-foreground">{t('marketing.popup.eyebrow')}</p>
        <h2 className="font-display text-xl text-foreground">{t('marketing.popup.title')}</h2>
        <p className="max-w-sm font-body text-sm text-muted-foreground">{t('marketing.popup.body')}</p>
        <Button to={withLocale(PATHS.analysis)} caps block className="mt-2" onClick={dismiss}>
          {returning ? t('marketing.popup.continueCta') : t('marketing.popup.cta')}
        </Button>
        <button
          type="button"
          onClick={dismiss}
          className="font-body text-xs text-muted-foreground underline underline-offset-4"
        >
          {t('marketing.popup.dismiss')}
        </button>
      </div>
    </Modal>
  );
}
