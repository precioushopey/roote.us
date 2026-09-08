import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LandbotFullpageEmbed } from './LandbotFullpageEmbed';

const SCRIPT_SRC = 'https://cdn.landbot.io/landbot-3/landbot-3.0.0.mjs';

function getInjectedScript() {
  return document.body.querySelector(`script[src="${SCRIPT_SRC}"]`) as HTMLScriptElement | null;
}

afterEach(() => {
  document.querySelectorAll(`script[src="${SCRIPT_SRC}"]`).forEach((el) => el.remove());
  vi.useRealTimers();
});

describe('LandbotFullpageEmbed', () => {
  it('renders the given placeholder and injects no script when configUrl is undefined', () => {
    render(<LandbotFullpageEmbed configUrl={undefined} placeholder="Not yet connected." />);
    expect(screen.getByText('Not yet connected.')).toBeInTheDocument();
    expect(getInjectedScript()).toBeNull();
  });

  it('renders the given placeholder and injects no script when configUrl is an empty string', () => {
    render(<LandbotFullpageEmbed configUrl="" placeholder="Not yet connected." />);
    expect(screen.getByText('Not yet connected.')).toBeInTheDocument();
    expect(getInjectedScript()).toBeNull();
  });

  it('injects the Landbot script and constructs Fullpage with the given configUrl when configured', () => {
    const url = 'https://landbot.example/config-a.json';
    render(<LandbotFullpageEmbed configUrl={url} placeholder="Not yet connected." />);

    const script = getInjectedScript();
    expect(script).not.toBeNull();
    expect(script!.type).toBe('module');

    const FullpageMock = vi.fn();
    (window as unknown as { Landbot: unknown }).Landbot = { Fullpage: FullpageMock };
    vi.useFakeTimers();
    script!.dispatchEvent(new Event('load'));
    vi.advanceTimersByTime(500);

    expect(FullpageMock).toHaveBeenCalledWith({ configUrl: url });
  });

  it('does not inject a second script on remount with the same configUrl', () => {
    const url = 'https://landbot.example/config-b.json';
    const { unmount } = render(<LandbotFullpageEmbed configUrl={url} placeholder="Not yet connected." />);
    expect(document.querySelectorAll(`script[src="${SCRIPT_SRC}"]`)).toHaveLength(1);
    unmount();
    render(<LandbotFullpageEmbed configUrl={url} placeholder="Not yet connected." />);
    expect(document.querySelectorAll(`script[src="${SCRIPT_SRC}"]`)).toHaveLength(1);
  });

  it('injects a separate script for a different configUrl (two independent surfaces)', () => {
    const urlA = 'https://landbot.example/config-c.json';
    const urlB = 'https://landbot.example/config-d.json';
    render(<LandbotFullpageEmbed configUrl={urlA} placeholder="Not yet connected." />);
    render(<LandbotFullpageEmbed configUrl={urlB} placeholder="Not yet connected." />);
    expect(document.querySelectorAll(`script[src="${SCRIPT_SRC}"]`)).toHaveLength(2);
  });
});
