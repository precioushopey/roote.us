import type { ReactNode } from 'react';
import { cn } from '@/app/components/ui/utils';
import { DisplayTitle, Prose } from './Text';
import { Section } from './Section';
import type { DisplayStep } from '@/app/components/marketing/displayScale';
import { useFitTitle } from '@/app/lib/useFitTitle';

export type HeroImage = {
  src: string;
  alt: string;
  /** Pass for aspect-ratio/object-fit/shadow — product photography is cropped
   *  differently per page. */
  className?: string;
};

export type HeroProps = {
  /** Plain text everywhere except Home, which needs inline `<em>` emphasis —
   *  ReactNode covers both. */
  title: ReactNode;
  titleStep?: DisplayStep;
  titleWeight?: 'normal' | 'medium';
  body?: ReactNode;
  /** Small print under the body — a "last updated" line, etc. Caller supplies
   *  its own top margin since it's optional and order-sensitive. */
  meta?: ReactNode;
  /** Omit to render the hero with no call to action. */
  cta?: ReactNode;
  /** Presence switches the whole hero to the two-column, image-right layout;
   *  omit for the centered, no-image layout. */
  image?: HeroImage;
  className?: string;
};

/**
 * The site's one hero band — a page's opening `<Section tone="teal">`.
 * Two variants: pass `image` for the two-column product-shot layout, omit it
 * for the centered, text-only layout. Every marketing page's top section
 * should render through this rather than hand-rolling the same markup again.
 */
export function Hero({
  title,
  titleStep = 'xl',
  titleWeight = 'medium',
  body,
  meta,
  cta,
  image,
  className,
}: HeroProps) {
  // `.display-heading`'s own weight is 400 (no bolding) — 'normal' and
  // 'medium' currently render identically; kept as two branches in case a
  // heavier weight is wanted here again later.
  const titleClassName = titleWeight === 'normal' ? '!font-normal' : undefined;
  const titleRef = useFitTitle<HTMLHeadingElement>(3);

  if (image) {
    return (
      <Section tone="teal" width="content" className={cn(className)}>
        <div className="flex flex-col items-center gap-12 lg:flex-row">
          <div className="flex w-full flex-col items-start gap-4 text-start lg:w-1/2">
            <DisplayTitle ref={titleRef} as="h1" step={titleStep} className={titleClassName}>
              {title}
            </DisplayTitle>
            {body ? (
              <Prose className="text-ink-foreground">
                {body}
              </Prose>
            ) : null}
            {meta}
            <div className="w-full sm:w-auto mt-4">{cta}</div>
          </div>
          <img src={image.src} alt={image.alt} loading="lazy" className={cn('w-full lg:w-1/2', image.className)} />
        </div>
      </Section>
    );
  }

  return (
    <Section tone="teal" width="content" className={cn('text-center', className)} innerClassName="items-center">
      <DisplayTitle ref={titleRef} as="h1" step={titleStep} align="center" className={titleClassName}>
        {title}
      </DisplayTitle>
      {body ? (
        <Prose className="text-center text-ink-foreground">
          {body}
        </Prose>
      ) : null}
      {meta}
      {cta ? (
        <div className="flex w-full justify-center sm:w-auto mt-4">{cta}</div>
      ) : null}
    </Section>
  );
}
