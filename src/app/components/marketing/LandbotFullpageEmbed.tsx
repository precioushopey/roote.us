import { useEffect } from 'react';
import { useT } from '@/i18n/LocaleProvider';

const LANDBOT_SCRIPT_SRC = 'https://cdn.landbot.io/landbot-3/landbot-3.0.0.mjs';
const LANDBOT_SCRIPT_ID = 'landbot-fullpage-sdk';
const CONFIG_URL = import.meta.env.VITE_LANDBOT_CONFIG_URL as string | undefined;

declare global {
  interface Window {
    Landbot?: { Fullpage: new (config: { configUrl: string }) => unknown };
  }
}

/** True only when a Landbot bot config URL is set via Vite env vars. */
export function isLandbotConfigured(): boolean {
  const configUrl = import.meta.env.VITE_LANDBOT_CONFIG_URL as string | undefined;
  return typeof configUrl === 'string' && configUrl.length > 0;
}

/**
 * Fullpage-embeds HairHealth.ai's Landbot lead-gen widget — see
 * docs/superpowers/specs/2026-09-08-hairhealth-landbot-integration-design.md.
 * This captures leads into ROOTÉ's HubSpot via HairHealth.ai; it is NOT connected to
 * ROOTÉ's own /analysis flow or session state in any way. Renders a placeholder until
 * `VITE_LANDBOT_CONFIG_URL` is set.
 *
 * Known limitation: Landbot's public docs describe no destroy/unmount API, so
 * navigating away from this route in this client-routed SPA may not tear down
 * whatever DOM the widget injects. Verify once a real configUrl is connected.
 */
export function LandbotFullpageEmbed() {
  const t = useT();

  useEffect(() => {
    if (!isLandbotConfigured()) return;
    if (document.getElementById(LANDBOT_SCRIPT_ID)) return;

    const configUrl = import.meta.env.VITE_LANDBOT_CONFIG_URL as string;
    const script = document.createElement('script');
    script.id = LANDBOT_SCRIPT_ID;
    script.type = 'module';
    script.async = true;
    script.addEventListener('load', () => {
      window.setTimeout(() => {
        new window.Landbot!.Fullpage({ configUrl });
      }, 500);
    });
    script.src = LANDBOT_SCRIPT_SRC;
    document.body.appendChild(script);
  }, []);

  if (!isLandbotConfigured()) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-cream-100 p-8 text-center">
        <p className="font-body text-sm text-muted-foreground">{t('hairScan.notConfigured')}</p>
      </div>
    );
  }

  return null;
}
