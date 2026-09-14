import { Navigate, useLocation, useNavigate } from 'react-router';
import { useT, useLocalizedPath } from '@/i18n/LocaleProvider';
import { Section, DisplayTitle, Prose, Button } from '@/app/components/roote';
import { PATHS } from '@/app/paths';
import { useAuth } from '@/store/auth';

type SuccessState = { orderId?: string } | null;

export function BagSuccess() {
  const t = useT();
  const location = useLocation();
  const navigate = useNavigate();
  const withLocale = useLocalizedPath();
  const auth = useAuth();
  const orderId = (location.state as SuccessState)?.orderId;

  if (!orderId) return <Navigate to={withLocale('/products')} replace />;

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

      <div className="flex flex-wrap gap-4">
        <Button
          onClick={() => {
            if (auth.email) {
              navigate(withLocale(PATHS.accountSection('profile')));
            } else {
              navigate(withLocale('/signup'), { state: { orderId } });
            }
          }}
        >
          {t('bag.success.trackOrder')}
        </Button>
        <Button to={withLocale('/products')} variant="secondary">{t('bag.success.continue')}</Button>
        <Button to={withLocale('/')} variant="secondary">{t('bag.success.home')}</Button>
      </div>
    </Section>
  );
}
