import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { LocaleProvider } from '@/i18n/LocaleProvider';

const SCRIPT_ID = 'landbot-fullpage-sdk';
const SCRIPT_SRC = 'https://cdn.landbot.io/landbot-3/landbot-3.0.0.mjs';

afterEach(() => {
  vi.unstubAllEnvs();
  document.getElementById(SCRIPT_ID)?.remove();
  vi.useRealTimers();
});

async function renderEmbed() {
  const { LandbotFullpageEmbed } = await import('./LandbotFullpageEmbed');
  const router = createMemoryRouter(
    [{ path: '/', element: <LocaleProvider localeRegion="en-us"><LandbotFullpageEmbed /></LocaleProvider> }],
    { initialEntries: ['/'] },
  );
  render(<RouterProvider router={router} />);
}

describe('LandbotFullpageEmbed', () => {
  it('renders a placeholder and injects no script when unconfigured', async () => {
    vi.stubEnv('VITE_LANDBOT_CONFIG_URL', '');
    await renderEmbed();
    expect(screen.getByText('Our AI chat is being connected — please check back soon.')).toBeInTheDocument();
    expect(document.getElementById(SCRIPT_ID)).toBeNull();
  });

  it('injects the Landbot script and constructs Fullpage with configUrl when configured', async () => {
    vi.stubEnv('VITE_LANDBOT_CONFIG_URL', 'https://landbot.example/config.json');
    await renderEmbed();

    const script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    expect(script).not.toBeNull();
    expect(script!.src).toBe(SCRIPT_SRC);
    expect(script!.type).toBe('module');

    const FullpageMock = vi.fn();
    (window as unknown as { Landbot: unknown }).Landbot = { Fullpage: FullpageMock };
    vi.useFakeTimers();
    script!.dispatchEvent(new Event('load'));
    vi.advanceTimersByTime(500);

    expect(FullpageMock).toHaveBeenCalledWith({ configUrl: 'https://landbot.example/config.json' });
  });

  it('does not inject a second script tag on repeated mounts', async () => {
    vi.stubEnv('VITE_LANDBOT_CONFIG_URL', 'https://landbot.example/config.json');
    await renderEmbed();
    expect(document.querySelectorAll(`#${SCRIPT_ID}`)).toHaveLength(1);
    await renderEmbed();
    expect(document.querySelectorAll(`#${SCRIPT_ID}`)).toHaveLength(1);
  });
});
