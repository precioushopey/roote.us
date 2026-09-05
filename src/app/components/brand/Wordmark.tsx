import logo from '@/assets/logo.png';
import { cn } from '@/app/components/ui/utils';

type WordmarkProps = {
  className?: string;
  /** Render a flat gold silhouette (via CSS mask on the same artwork) for
   * placement on the dark-emerald anchor surfaces (header, footer, AppShell
   * sidebar) instead of the default bronze-gradient image, which goes muddy
   * on a dark background. */
  onInk?: boolean;
};

export function Wordmark({ className, onInk = false }: WordmarkProps) {
  if (onInk) {
    return (
      <span
        role="img"
        aria-label="ROOTÉ"
        className={cn('inline-block w-32 select-none bg-gold-500', className)}
        style={{
          aspectRatio: '1400 / 435',
          WebkitMaskImage: `url(${logo})`,
          maskImage: `url(${logo})`,
          WebkitMaskSize: 'contain',
          maskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          maskPosition: 'center',
        }}
      />
    );
  }

  return (
    <img
      src={logo}
      alt="ROOTÉ"
      className={cn('h-auto w-32 select-none', className)}
    />
  );
}
