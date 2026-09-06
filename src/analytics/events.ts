/**
 * Normalized analytics event vocabulary (brief §32). One name per meaningful
 * step of the journey. Views and components emit these through `track()`; no
 * vendor is wired — swap the adapter in `analytics.ts` when one is chosen.
 */

export const ANALYTICS_EVENTS = [
  // marketing → funnel entry
  'hero_analysis_clicked',
  'concern_selected',
  // assessment
  'analysis_started',
  'gender_selected',
  'photo_upload_started',
  'photo_uploaded',
  'analysis_processing',
  'question_answered',
  'analysis_completed',
  'email_result_submitted',
  // report → program
  'report_viewed',
  'program_viewed',
  'program_duration_selected',
  'checkout_started',
  'checkout_completed',
  'account_activated',
  // post-purchase app
  'treatment_marked_complete',
  'progress_photo_uploaded',
  'progress_scan_started',
  'progress_scan_completed',
  'final_scan_completed',
  'before_after_viewed',
  'program_results_viewed',
  'next_program_started',
  // subscription management
  'subscription_manage_opened',
  'subscription_cancel_started',
  'subscription_cancel_completed',
] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[number];

export type AnalyticsProps = Record<string, string | number | boolean | null | undefined>;

export type AnalyticsEvent = {
  name: AnalyticsEventName;
  props?: AnalyticsProps;
  /** epoch ms — stamped by `track()` */
  at: number;
};
