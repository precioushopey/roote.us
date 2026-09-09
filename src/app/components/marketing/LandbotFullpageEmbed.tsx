import { useEffect, type ReactNode } from 'react';

const LANDBOT_SCRIPT_SRC = 'https://cdn.landbot.io/landbot-3/landbot-3.0.0.mjs';
const injectedConfigUrls = new Set<string>();

declare global {
  interface Window {
    Landbot?: { Fullpage: new (config: { configUrl: string }) => unknown };
  }
}

/**
 * Fullpage-embeds a Landbot widget for a given bot `configUrl` — see
 * docs/superpowers/specs/2026-09-08-hairhealth-landbot-integration-design.md. Used by the
 * logged-in HairHealth.ai rescan page (`AccountRescan`, `VITE_LANDBOT_RESCAN_CONFIG_URL`),
 * which is not connected to ROOTÉ's own `/analysis` flow or session state. The marketing
 * `/hair-scan` page previously embedded a second instance of this widget for anonymous
 * lead-gen (`VITE_LANDBOT_CONFIG_URL`); as of 2026-09-09 that page is a static explainer
 * instead (`HairScan.tsx`) and no longer reads that env var — every "Start free hair
 * analysis" CTA already routes to `EXTERNAL_ASSESSMENT_URL`, HairHealth.ai's own hosted
 * quiz, so an embed on this page would have been a redundant second entry point.
 *
 * Renders `placeholder` until a non-empty `configUrl` is passed in — the caller owns
 * reading its own env var so each surface can be configured (or left unconfigured)
 * independently.
 *
 * Known limitation: Landbot's public docs describe no destroy/unmount API, so navigating
 * away from a page using this in this client-routed SPA may not tear down whatever DOM
 * the widget injects. Verify once a real configUrl is connected.
 */
export function LandbotFullpageEmbed({
  configUrl,
  placeholder,
}: {
  configUrl: string | undefined;
  placeholder: ReactNode;
}) {
  const isConfigured = typeof configUrl === 'string' && configUrl.length > 0;

  useEffect(() => {
    if (!configUrl) return;
    if (injectedConfigUrls.has(configUrl)) return;
    injectedConfigUrls.add(configUrl);

    const script = document.createElement('script');
    script.type = 'module';
    script.async = true;
    script.addEventListener('load', () => {
      window.setTimeout(() => {
        new window.Landbot!.Fullpage({ configUrl });
      }, 500);
    });
    script.src = LANDBOT_SCRIPT_SRC;
    document.body.appendChild(script);
  }, [configUrl]);

  if (!isConfigured) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-cream-100 p-8 text-center">
        <p className="font-body text-sm text-muted-foreground">{placeholder}</p>
      </div>
    );
  }

  return null;
}
