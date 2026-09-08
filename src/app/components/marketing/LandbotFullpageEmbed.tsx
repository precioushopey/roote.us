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
 * docs/superpowers/specs/2026-09-08-hairhealth-landbot-integration-design.md. Used by
 * two independent HairHealth.ai surfaces: the marketing lead-gen page (`/hair-scan`,
 * `VITE_LANDBOT_CONFIG_URL`) and the logged-in rescan page (`VITE_LANDBOT_RESCAN_CONFIG_URL`)
 * — neither is connected to ROOTÉ's own `/analysis` flow, session state, or each other.
 *
 * Renders `placeholder` until a non-empty `configUrl` is passed in — the caller owns
 * reading its own env var so each surface can be configured (or left unconfigured)
 * independently.
 *
 * Known limitation: Landbot's public docs describe no destroy/unmount API, so navigating
 * away from a page using this in this client-routed SPA may not tear down whatever DOM
 * the widget injects — including between the two different surfaces above, if a visitor
 * reaches both in one session. Verify once real configUrls are connected.
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
