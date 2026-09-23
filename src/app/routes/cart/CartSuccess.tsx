import { Navigate, useLocation } from 'react-router';
import { useT, useLocalizedPath } from '@/i18n/LocaleProvider';
import { Section, DisplayTitle, Prose, Button } from '@/app/components/roote';
import { PATHS } from '@/app/paths';
import { useSession } from '@/store/sessionStore';

type SuccessState = { orderId?: string } | null;

export function CartSuccess() {
  const t = useT();
  const location = useLocation();
  const withLocale = useLocalizedPath();
  const session = useSession();
  const orderId = (location.state as SuccessState)?.orderId;

  if (!orderId) return <Navigate to={withLocale(PATHS.products)} replace />;

  return (
    <Section tone="cream" className="pt-28 md:pt-32" gap={8}>
      <DisplayTitle as="h1" step="xl">
        {t('bag.success.title')}
      </DisplayTitle>
      <Prose>{t('bag.success.body')}</Prose>

      <div className="flex flex-col gap-1 rounded-xl border border-border bg-background p-6">
        <p className="text-sm uppercase text-muted-foreground">{t('bag.success.orderId')}</p>
        <p className="font-display text-lg font-medium tabular-nums">{orderId}</p>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="font-display text-xl font-medium">{t('bag.success.next')}</h2>
        <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
          <li>{t('bag.success.next1')}</li>
          <li>{t('bag.success.next2')}</li>
          <li>{t('bag.success.next3')}</li>
        </ul>
      </div>

      {/* Shop-first buyers skipped the analysis — offer it now that they own the
          product (Mischa review); results land in the account they're already
          signed into (CartCheckout signs guests in after payment). */}
      {!session.analysis && (
        <div className="flex flex-col items-start gap-3 rounded-xl border border-border bg-background p-6">
          <h2 className="font-display text-xl font-medium">{t('bag.success.analysisTitle')}</h2>
          <Prose>{t('bag.success.analysisBody')}</Prose>
          <Button to={withLocale(PATHS.analysis)} variant="secondary" caps>
            {t('marketing.nav.cta')}
          </Button>
        </div>
      )}

      <div className="flex flex-wrap gap-4">
        <Button to={withLocale(PATHS.accountSection('profile'))}>{t('bag.success.trackOrder')}</Button>
        <Button to={withLocale(PATHS.products)} variant="secondary">{t('bag.success.continue')}</Button>
        <Button to={withLocale(PATHS.home)} variant="secondary">{t('bag.success.home')}</Button>
      </div>
    </Section>
  );
}
