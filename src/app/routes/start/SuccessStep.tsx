import { useState } from 'react';
import { Package, CheckCircle2, Bell, Camera, Copy, Check, type LucideIcon } from 'lucide-react';
import { useT, useLocalizedPath } from '@/i18n/LocaleProvider';
import { useSession } from '@/store/sessionStore';
import { DisplayTitle, Button } from '@/app/components/roote';
import type { MessageKey } from '@/i18n/messages';

/** What actually happens after checkout, in the order it happens — mirrors
 *  the real post-purchase flow (AccountPreDelivery's confirm-delivery gate,
 *  Today's routine reminders, Progress's photo tracking), not marketing
 *  copy invented for this screen. */
const STEPS: { icon: LucideIcon; titleKey: MessageKey; bodyKey: MessageKey }[] = [
  { icon: Package, titleKey: 'start.success.step1.title', bodyKey: 'start.success.step1.body' },
  { icon: CheckCircle2, titleKey: 'start.success.step2.title', bodyKey: 'start.success.step2.body' },
  { icon: Bell, titleKey: 'start.success.step3.title', bodyKey: 'start.success.step3.body' },
  { icon: Camera, titleKey: 'start.success.step4.title', bodyKey: 'start.success.step4.body' },
];

export function SuccessStep() {
  const t = useT();
  const withLocale = useLocalizedPath();
  const session = useSession();
  const program = session.program;
  const [copied, setCopied] = useState(false);
  if (!program) return null;
  const orderId = program.orderId;

  function copyOrderId() {
    navigator.clipboard.writeText(orderId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 text-center">
      <DisplayTitle as="h1" step="sm" align="center">
        {t('start.success.title')}
      </DisplayTitle>
      <div className="flex items-center gap-1.5">
        <p className="font-body text-sm text-muted-foreground">
          #{program.orderId} · {t('report.duration.label', { days: program.durationDays })} · {program.orderedAt}
        </p>
        <button
          type="button"
          onClick={copyOrderId}
          aria-label={copied ? t('start.success.copied') : t('start.success.copyOrderId')}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-cream-100 hover:text-foreground"
        >
          {copied ? <Check className="h-3.5 w-3.5" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
        </button>
      </div>
      <p className="font-body text-xs text-muted-foreground">{t('start.success.saveOrderNote')}</p>

      <div className="mt-4 flex w-full flex-col items-start gap-1 text-start">
        <h2 className="font-display text-md text-foreground">{t('start.success.stepsTitle')}</h2>
        <ol className="mt-2 flex w-full flex-col">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isLast = i === STEPS.length - 1;
            return (
              <li key={s.titleKey} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Icon className="h-4 w-4" aria-hidden strokeWidth={2} />
                  </span>
                  {!isLast && <span aria-hidden className="my-1 w-px flex-1 bg-border" />}
                </div>
                <div className={isLast ? 'pb-0' : 'pb-6'}>
                  <p className="font-body font-medium text-foreground">{t(s.titleKey)}</p>
                  <p className="mt-1 font-body text-sm text-muted-foreground">{t(s.bodyKey)}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      <Button to={withLocale('/account')} caps className="mt-4">
        {t('start.success.cta')}
      </Button>
    </div>
  );
}
