import { useT, useLocale, useLocalizedPath } from '@/i18n/LocaleProvider';
import { readOrders } from '@/store/orders';
import { DisplayTitle, Prose, Button, Card } from '@/app/components/roote';
import { PATHS } from '@/app/paths';

export function AccountOrders() {
  const t = useT();
  const { locale } = useLocale();
  const withLocale = useLocalizedPath();
  const orders = readOrders();
  const fmt = (iso: string) => new Date(iso).toLocaleDateString(locale === 'he' ? 'he-IL' : 'en-US');

  return (
    <div data-animate className="flex flex-col gap-6">
      <DisplayTitle as="h1" step="sm">
        {t('app.orders.title')}
      </DisplayTitle>

      {orders.length === 0 ? (
        <Card>
          <Prose>{t('app.orders.empty')}</Prose>
          <Button to={withLocale(PATHS.products)} variant="secondary" size="sm" className="mt-4">
            {t('app.nav.shop')}
          </Button>
        </Card>
      ) : (
        <ul className="flex flex-col divide-y divide-border rounded-xl border border-border bg-card">
          {orders.map((o) => (
            <li key={o.id} className="flex items-center justify-between gap-4 p-4">
              <div>
                <p className="font-body text-sm text-foreground">{o.label}</p>
                <p className="font-body text-sm text-muted-foreground">
                  {t(o.kind === 'program' ? 'app.orders.kindProgram' : 'app.orders.kindBag')} · #{o.id.slice(0, 8)}
                </p>
              </div>
              <span className="font-body text-sm text-muted-foreground">{fmt(o.at)}</span>
            </li>
          ))}
        </ul>
      )}
      <p className="font-body text-sm text-muted-foreground">{t('app.orders.note')}</p>
    </div>
  );
}
