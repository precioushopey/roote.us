import { cn } from '@/app/components/ui/utils';

export type MediaKind = 'image' | 'video' | 'animation' | 'ui';
export type MediaTone = 'cream' | 'teal' | 'card';

interface MediaPlaceholderProps {
  /**
   * Semantic alt text describing what the real asset will show. Required.
   * Written for the end reader — never lorem ipsum, never a filename.
   */
  alt: string;
  /**
   * Art-direction note shown only in dev builds, e.g.
   * "ROOTÉ hero system, dark-teal men's pack + cream women's pack, studio light".
   */
  label: string;
  /** CSS aspect-ratio, e.g. "16 / 9", "4 / 5", "1". Prevents layout shift. */
  ratio?: string;
  kind?: MediaKind;
  tone?: MediaTone;
  className?: string;
  /** Corner rounding; matches the surrounding card radius by default. */
  rounded?: 'lg' | 'xl' | '2xl' | 'none';
}

const KIND_LABEL: Record<MediaKind, string> = {
  image: 'IMAGE PLACEHOLDER',
  video: 'VIDEO PLACEHOLDER',
  animation: 'ANIMATION PLACEHOLDER',
  ui: 'UI PLACEHOLDER',
};

const TONE_CLASS: Record<MediaTone, string> = {
  cream: 'bg-cream-100 text-deep-800',
  teal: 'bg-deep-950 text-cream-100',
  card: 'bg-card text-muted-foreground',
};

const ROUND_CLASS = {
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  none: '',
} as const;

/**
 * A labelled stand-in for a not-yet-supplied image / video / animation.
 * ROOTÉ never fetches or generates imagery — every future asset slot is a
 * `<MediaPlaceholder>` with real alt text and a fixed aspect ratio.
 */
export function MediaPlaceholder({
  alt,
  label,
  ratio = '16 / 9',
  kind = 'image',
  tone = 'cream',
  className,
  rounded = 'xl',
}: MediaPlaceholderProps) {
  const isDev = Boolean(import.meta.env?.DEV);
  return (
    <div
      role="img"
      aria-label={alt}
      data-media-placeholder={kind}
      style={{ aspectRatio: ratio }}
      className={cn(
        'relative flex w-full items-center justify-center overflow-hidden',
        TONE_CLASS[tone],
        ROUND_CLASS[rounded],
        className,
      )}
    >
      {isDev && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 p-4 text-center">
          <span className="text-2xs font-semibold uppercase tracking-[0.16em] opacity-70">
            {KIND_LABEL[kind]}
          </span>
          <span className="max-w-[42ch] text-xs leading-snug opacity-80">{label}</span>
        </div>
      )}
    </div>
  );
}
