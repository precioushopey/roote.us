import { Navigate } from 'react-router';
import { useT, useLocalizedPath } from '@/i18n/LocaleProvider';
import { useSession } from '@/store/sessionStore';
import { useAuth } from '@/store/auth';
import { LegalNotice, TextLink } from '@/app/components/roote';
import { LandbotFullpageEmbed } from '@/app/components/marketing/LandbotFullpageEmbed';
import { funnelHeading } from '@/app/components/funnel/funnelStyles';

/**
 * A second, separate HairHealth.ai Landbot embed (see LandbotFullpageEmbed's own
 * doc comment) for logged-in patients to do a rescan — additive to, not a
 * replacement for, the existing local guided-photo-capture flow on `/account/scans`.
 * Guarded the same way `AppShell` guards `/account/*`, but mounted as a sibling
 * route outside it: Landbot's Fullpage widget takes over the whole page, which
 * would visually break AppShell's persistent sidebar/tab chrome.
 *
 * Confirmed 2026-09-08 (Pratik, WhatsApp): results land in ROOTÉ's HubSpot the same
 * one-way way as the initial scan, keyed by the user's email — showing that data
 * back in this app needs a backend this repo doesn't have yet. Not built here; this
 * page is only the embed shell, ready for a real `VITE_LANDBOT_RESCAN_CONFIG_URL`.
 */
export function AccountRescan() {
  const t = useT();
  const withLocale = useLocalizedPath();
  const session = useSession();
  const auth = useAuth();
  const configUrl = import.meta.env.VITE_LANDBOT_RESCAN_CONFIG_URL as string | undefined;

  if (!session.program) return <Navigate to={withLocale('/')} replace />;
  if (!auth.email) return <Navigate to={withLocale('/login')} replace />;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-12">
      <div className="flex flex-col gap-3">
        <h1 className={funnelHeading}>{t('accountRescan.title')}</h1>
        <p className="font-body text-sm text-muted-foreground">{t('accountRescan.intro')}</p>
      </div>
      <LegalNotice>
        {t('accountRescan.disclosure')}{' '}
        <TextLink to={withLocale('/privacy')}>{t('hairScan.disclosureLink')}</TextLink>
      </LegalNotice>
      <LandbotFullpageEmbed configUrl={configUrl} placeholder={t('accountRescan.notConfigured')} />
    </main>
  );
}
