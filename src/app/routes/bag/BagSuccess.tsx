import { Link, Navigate, useLocation } from 'react-router';
import { useT, useLocalizedPath } from '@/i18n/LocaleProvider';
import { Section, DisplayTitle, Prose, Button } from '@/app/components/roote';

type SuccessState = { orderId?: string } | null;

export function BagSuccess() {
  const t = useT();
  const location = useLocation();
  const withLocale = useLocalizedPath();
  const orderId = (location.state as SuccessState)?.orderId;

  if (!orderId) return <Navigate to={withLocale('/products')} replace />;

  return (
    <Section tone="cream" className="pt-28 md:pt-32">
      <DisplayTitle as="h1" step="xl">
        {t('bag.success.title')}
      </DisplayTitle>
      <Prose size="lg" className="mt-4 max-w-xl">{t('bag.success.body')}</Prose>

      <div className="mt-8 rounded-xl border border-border bg-background p-6">
        <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{t('bag.success.orderId')}</p>
        <p className="mt-1 font-display text-lg font-medium tabular-nums">{orderId}</p>
      </div>

      <h2 className="mt-10 font-display text-xl font-medium">{t('bag.success.next')}</h2>
      <ul className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
        <li>{t('bag.success.next1')}</li>
        <li>{t('bag.success.next2')}</li>
        <li>{t('bag.success.next3')}</li>
      </ul>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button to={withLocale('/products')}>{t('bag.success.continue')}</Button>
        <Button to={withLocale('/')} variant="secondary">{t('bag.success.home')}</Button>
      </div>
    </Section>
  );
}
