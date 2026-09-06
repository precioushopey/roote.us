import { cn } from '@/app/components/ui/utils';

type Props = {
  /** pixel size of the square viewBox render */
  size?: number;
  /** `line` for the medical-diagram look, `solid` for a filled badge mark */
  variant?: 'line' | 'solid';
  className?: string;
  title?: string;
};

/**
 * The ROOTÉ three-strand follicle mark — one root, three strands. Drawn once,
 * reused at every scale (favicon-adjacent badge → hero motif). Read as: hair
 * science · the three concern territories · Analyze / Treat / Track.
 *
 * Decorative by default (`aria-hidden`); pass `title` to make it a labelled image.
 */
export function StrandMark({ size = 24, variant = 'line', className, title }: Props) {
  const labelled = Boolean(title);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      role={labelled ? 'img' : undefined}
      aria-hidden={labelled ? undefined : true}
      aria-label={title}
      className={cn('shrink-0', className)}
    >
      {title ? <title>{title}</title> : null}
      {/* shared root */}
      <circle cx="16" cy="27" r="2.4" fill="currentColor" />
      {variant === 'line' ? (
        <path
          d="M16 27V17M16 17c0-5.5-4-8.5-4-13M16 17c0-5.5 4-8.5 4-13M16 17V4"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      ) : (
        <path
          d="M16 27c-1-6 .3-10-3-14-1.6-2-2-3.4-2-5 2 .6 3.6 1.8 4.6 3.6C16 5 16 3 16 1c0 2 0 4 1.4 6.2C18.4 5.4 20 4.2 22 3.6c0 1.6-.4 3-2 5-3.3 4-2 8-3 14"
          fill="currentColor"
        />
      )}
    </svg>
  );
}
