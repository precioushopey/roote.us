import { describe, it, expect, afterEach } from 'vitest';
import { ANALYTICS_EVENTS } from './events';
import {
  track,
  identify,
  setAnalyticsAdapter,
  noopAnalyticsAdapter,
  type AnalyticsAdapter,
} from './analytics';

afterEach(() => setAnalyticsAdapter(noopAnalyticsAdapter));

describe('analytics seam', () => {
  it('routes track() to the installed adapter with a timestamp', () => {
    const seen: unknown[] = [];
    const spy: AnalyticsAdapter = { track: (e) => seen.push(e) };
    setAnalyticsAdapter(spy);

    track('gender_selected', { gender: 'female' });

    expect(seen).toHaveLength(1);
    expect(seen[0]).toMatchObject({ name: 'gender_selected', props: { gender: 'female' } });
    expect((seen[0] as { at: number }).at).toBeTypeOf('number');
  });

  it('never throws when the adapter throws', () => {
    setAnalyticsAdapter({
      track: () => {
        throw new Error('sink down');
      },
    });
    expect(() => track('report_viewed')).not.toThrow();
  });

  it('identify() is optional on the adapter', () => {
    setAnalyticsAdapter({ track: () => {} });
    expect(() => identify('anon-1', { plan: '180' })).not.toThrow();
  });

  it('event vocabulary has no duplicates', () => {
    expect(new Set(ANALYTICS_EVENTS).size).toBe(ANALYTICS_EVENTS.length);
  });

  it('covers the full journey the brief enumerates', () => {
    for (const name of [
      'hero_analysis_clicked',
      'analysis_completed',
      'checkout_completed',
      'final_scan_completed',
      'subscription_cancel_completed',
    ] as const) {
      expect(ANALYTICS_EVENTS).toContain(name);
    }
  });
});
