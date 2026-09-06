import {
  type AnalyticsEvent,
  type AnalyticsEventName,
  type AnalyticsProps,
} from './events';

/**
 * Analytics seam (brief §32). ROOTÉ emits normalized events through `track()`;
 * where they go is an adapter concern. No vendor SDK is bundled — a real
 * integration (GA4 / Segment / PostHog / server sink) implements
 * `AnalyticsAdapter` and is installed once at app start via `setAnalyticsAdapter`.
 *
 * TODO: wire a real adapter (analytics backend) — see docs/TECHNICAL-SPECIFICATION.md.
 */
export interface AnalyticsAdapter {
  track(event: AnalyticsEvent): void;
  /** Optional: associate subsequent events with an anonymous/known id. */
  identify?(id: string, traits?: AnalyticsProps): void;
}

/** Default adapter: swallow everything. Used in production until one is chosen. */
export const noopAnalyticsAdapter: AnalyticsAdapter = {
  track() {},
};

/** Dev adapter: log to the console so the event stream is visible while building. */
export const consoleAnalyticsAdapter: AnalyticsAdapter = {
  track(event) {
    console.info(`[analytics] ${event.name}`, event.props ?? {});
  },
  identify(id, traits) {
    console.info(`[analytics] identify ${id}`, traits ?? {});
  },
};

let adapter: AnalyticsAdapter =
  typeof import.meta !== 'undefined' && import.meta.env?.DEV
    ? consoleAnalyticsAdapter
    : noopAnalyticsAdapter;

export function setAnalyticsAdapter(next: AnalyticsAdapter): void {
  adapter = next;
}

export function getAnalyticsAdapter(): AnalyticsAdapter {
  return adapter;
}

/** Fire a normalized event. Never throws — analytics must not break a flow. */
export function track(name: AnalyticsEventName, props?: AnalyticsProps): void {
  try {
    adapter.track({ name, props, at: Date.now() });
  } catch {
    /* analytics is best-effort */
  }
}

export function identify(id: string, traits?: AnalyticsProps): void {
  try {
    adapter.identify?.(id, traits);
  } catch {
    /* best-effort */
  }
}
