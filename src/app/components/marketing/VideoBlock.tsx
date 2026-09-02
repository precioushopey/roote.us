import { useState } from 'react';
import { useT } from '@/i18n/LocaleProvider';
import { cn } from '@/app/components/ui/utils';
import type { MessageKey } from '@/i18n/messages';

interface VideoBlockProps {
  /** Still image shown until the clip plays (and as the fallback while none exists). */
  poster: string;
  titleKey: MessageKey;
  captionKey?: MessageKey;
  /** Real clip URL. Until assets exist the block renders as a styled placeholder. */
  src?: string;
  onInk?: boolean;
  className?: string;
}

/**
 * A framed 16:9 video slot for the short explainer clips the brand calls for
 * (problem, diagnosis, ingredients, plan, follow-up). Renders the poster with a
 * play affordance; swaps in a real <video> once `src` is provided.
 */
export function VideoBlock({ poster, titleKey, captionKey, src, onInk = false, className }: VideoBlockProps) {
  const t = useT();
  const [playing, setPlaying] = useState(false);

  return (
    <figure className={cn('flex flex-col gap-3', className)}>
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-ink">
        {playing && src ? (
          <video src={src} controls autoPlay playsInline className="h-full w-full object-cover">
            <track kind="captions" />
          </video>
        ) : (
          <>
            <img src={poster} alt="" className="img-editorial h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => src && setPlaying(true)}
              aria-label={t(titleKey)}
              className="group absolute inset-0 flex items-center justify-center bg-ink/30 transition-colors hover:bg-ink/20"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-background/90 text-foreground shadow-lg transition-transform group-hover:scale-105">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="ms-1">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </button>
            <span className="absolute bottom-3 start-3 rounded-full bg-background/90 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-foreground shadow-sm">
              {t(titleKey)}
            </span>
          </>
        )}
      </div>
      {captionKey && (
        <figcaption className={cn('font-body text-sm', onInk ? 'text-ink-foreground/70' : 'text-muted-foreground')}>
          {t(captionKey)}
        </figcaption>
      )}
    </figure>
  );
}
