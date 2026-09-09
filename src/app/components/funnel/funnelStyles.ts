// Shared class strings so the diagnosis + start funnel matches the marketing
// site's branding (display headings, emerald accent, pill CTAs, editorial
// cards).

export const funnelHeading = 'font-display text-3xl font-medium md:text-4xl';

export const funnelEyebrow =
  'font-body text-sm font-medium uppercase text-accent';

export const funnelPrimaryBtn =
  'inline-flex w-full items-center justify-center rounded-xs bg-primary px-8 py-4 text-sm text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40';

export const funnelSecondaryBtn =
  'inline-flex w-full items-center justify-center rounded-xs border border-border px-8 py-4 text-sm text-foreground transition-colors hover:border-accent';

/** Selectable option / answer card. Pairs with a visually-hidden radio or a plain button. */
export const funnelOptionCard =
  'rounded-xl border border-border bg-card p-4 text-start text-sm shadow-sm transition-colors hover:border-accent has-[:checked]:border-accent has-[:checked]:bg-accent/5';

export const funnelField =
  'rounded-md border border-input bg-input-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-accent';
