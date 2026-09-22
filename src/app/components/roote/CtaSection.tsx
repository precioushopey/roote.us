import type { ReactNode } from 'react';
import { useT, useLocalizedPath } from '@/i18n/LocaleProvider';
import { PATHS } from '@/app/paths';
import { cn } from '@/app/components/ui/utils';
import { Button } from './Button';
import { DisplayTitle, Prose } from './Text';
import { Section } from './Section';
import type { DisplayStep } from '@/app/components/marketing/displayScale';
import { useFitTitle } from '@/app/lib/useFitTitle';

export type CtaSectionImage = {
  src: string;
  alt: string;
  className?: string;
};

export type CtaSectionProps = {
  title: ReactNode;
  titleStep?: DisplayStep;
  body?: ReactNode;
  /** Benefit checklist rendered under `body` — only meaningful in the
   *  `image` variant (Home's is the one caller that needs it). */
  items?: ReactNode[];
  /** Defaults cover every current call site: they all point to ROOTÉ's own
   *  analysis flow with the same label. */
  ctaLabel?: ReactNode;
  ctaHref?: string;
  external?: boolean;
  /** Presence switches to the two-column, image-right layout (Home's
   *  richer closing CTA); omit for the centered heading+body+button band
   *  used everywhere else. */
  image?: CtaSectionImage;
  className?: string;
};

/**
 * The site's one closing-CTA band — a `<Section tone="teal">` with a
 * heading, optional body, and a button, used to end a marketing page.
 * Every page's closing CTA should render through this rather than
 * hand-rolling the same markup again.
 */
export function CtaSection({
  title,
  titleStep = 'lg',
  body,
  items,
  ctaLabel,
  ctaHref,
  external = false,
  image,
  className,
}: CtaSectionProps) {
  const t = useT();
  const withLocale = useLocalizedPath();
  const titleRef = useFitTitle<HTMLHeadingElement>(3);
  const label = ctaLabel ?? t('marketing.nav.cta');
  const href = ctaHref ?? withLocale(PATHS.analysis);

  if (image) {
    return (
      <Section tone="teal" width="content" className={cn('border-b border-accent', className)}>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="flex flex-col items-start gap-4">
            <DisplayTitle ref={titleRef} as="h2" step={titleStep}>
              {title}
            </DisplayTitle>
            {body ? <Prose className="text-ink-foreground">{body}</Prose> : null}
            {items?.length ? (
              <ul className="flex flex-col gap-4">
                {items.map((item, i) => (
                  <li key={i} className="flex items-start gap-4">
                    {item}
                  </li>
                ))}
              </ul>
            ) : null}
            <Button to={href} external={external} caps className="w-full sm:w-auto mt-4">
              {label}
            </Button>
          </div>
          <img src={image.src} alt={image.alt} loading="lazy" className={cn('w-full object-contain shadow-product', image.className)} />
        </div>
      </Section>
    );
  }

  return (
    <Section tone="teal" width="content" className={cn('border-b border-accent text-center', className)}>
      <div className="flex flex-col items-center gap-4">
        <DisplayTitle ref={titleRef} as="h2" step={titleStep} align="center">
          {title}
        </DisplayTitle>
        {body ? <Prose className="mx-auto text-center text-ink-foreground">{body}</Prose> : null}
        <Button to={href} external={external} caps className="w-full sm:w-auto mt-4">
          {label}
        </Button>
      </div>
    </Section>
  );
}
