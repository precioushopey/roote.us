import { Link, Navigate, useLocation } from 'react-router';
import { useT } from '@/i18n/LocaleProvider';
import { Section } from '@/app/components/marketing/Section';
import { SectionHeading } from '@/app/components/marketing/SectionHeading';
import { Prose } from '@/app/components/marketing/Prose';

type SuccessState = { orderId?: string } | null;

export function BagSuccess() {
  const t = useT();
  const location = useLocation();
  const orderId = (location.state as SuccessState)?.orderId;

  if (!orderId) return <Navigate to="/products" replace />;

  return (
    <Section className="pt-28 md:pt-32">
      <SectionHeading as="h1" clamp="clamp(1.75rem, 7vw, 5rem)">
        {t('bag.success.title')}
      </SectionHeading>
      <Prose size="l" className="mt-4 max-w-xl">{t('bag.success.body')}</Prose>

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
        <Link to="/products" className="rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground">
          {t('bag.success.continue')}
        </Link>
        <Link to="/" className="rounded-full border border-border px-6 py-3 text-sm text-foreground">
          {t('bag.success.home')}
        </Link>
      </div>
    </Section>
  );
}
