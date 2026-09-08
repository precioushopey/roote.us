import { useT, useLocalizedPath } from '@/i18n/LocaleProvider';
import { LegalNotice, TextLink } from '@/app/components/roote';
import { LandbotFullpageEmbed } from '@/app/components/marketing/LandbotFullpageEmbed';
import { funnelHeading } from '@/app/components/funnel/funnelStyles';

export function HairScan() {
  const t = useT();
  const withLocale = useLocalizedPath();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-12">
      <div className="flex flex-col gap-3">
        <h1 className={funnelHeading}>{t('hairScan.title')}</h1>
        <p className="font-body text-sm text-muted-foreground">{t('hairScan.intro')}</p>
      </div>
      <LegalNotice>
        {t('hairScan.disclosure')}{' '}
        <TextLink to={withLocale('/privacy')}>{t('hairScan.disclosureLink')}</TextLink>
      </LegalNotice>
      <LandbotFullpageEmbed />
    </main>
  );
}
