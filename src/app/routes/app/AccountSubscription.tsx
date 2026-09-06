import { useState } from 'react';
import { useT } from '@/i18n/LocaleProvider';
import { useSession } from '@/store/sessionStore';
import { DisplayTitle, Prose, Button, Card, LegalNotice, Badge } from '@/app/components/roote';
import { track } from '@/analytics/analytics';

/**
 * Manage the recurring program (brief §25). Clear disclosure, no dark patterns —
 * the recurring terms and the cancel route are always visible. The reorder
 * mechanics themselves are a backend concern (still stubbed); this screen owns
 * the disclosure + the user-facing controls.
 */
export function AccountSubscription() {
  const t = useT();
  const session = useSession();
  const program = session.program!;
  // No real subscription store yet — local UI state stands in.
  const [active, setActive] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  return (
    <div data-animate className="flex flex-col gap-6">
      <DisplayTitle as="h1" step="sm">
        {t('app.subscription.title')}
      </DisplayTitle>

      <Card>
        <div className="flex items-center justify-between gap-4">
          <p className="font-body text-sm text-foreground">{t('app.subscription.status')}</p>
          <Badge tone={active ? 'success' : 'neutral'}>
            {active ? t('app.subscription.on') : t('app.subscription.off')}
          </Badge>
        </div>
        <dl className="mt-4 flex flex-col gap-2 font-body text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">{t('app.subscription.cadence')}</dt>
            <dd className="text-foreground">{t('report.duration.label', { days: program.durationDays })}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">{t('app.subscription.nextCharge')}</dt>
            <dd className="text-foreground">{program.endDate}</dd>
          </div>
        </dl>
        <div className="mt-5 flex flex-wrap gap-3">
          {active ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setCancelling(true);
                track('subscription_cancel_started');
              }}
            >
              {t('app.subscription.cancel')}
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => {
                setActive(true);
                track('subscription_manage_opened', { action: 'enable' });
              }}
            >
              {t('app.subscription.enable')}
            </Button>
          )}
        </div>
      </Card>

      {cancelling && (
        <Card tone="cream">
          <Prose>{t('app.subscription.cancelConfirmBody')}</Prose>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                setActive(false);
                setCancelling(false);
                track('subscription_cancel_completed');
              }}
            >
              {t('app.subscription.cancelConfirm')}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setCancelling(false)}>
              {t('common.back')}
            </Button>
          </div>
        </Card>
      )}

      <LegalNotice reviewRequired>{t('app.subscription.legal')}</LegalNotice>
    </div>
  );
}
