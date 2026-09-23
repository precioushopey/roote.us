import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Link } from 'react-router';
import { cn } from '@/app/components/ui/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'quiet' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

const VARIANT: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-primary-foreground hover:bg-ochre-900',
  // Primary is yellow ochre with a cream label: it reads on both cream and the taupe hero band
  // (bright gold washed into the taupe). Secondary labels use deep-900 and the border
  // deep-600: bright gold is only ~2.3:1 on cream and ~1.5:1 on the taupe band, too faint for either.
  secondary: 'border border-deep-600 bg-transparent text-deep-900 hover:border-cream-200',
  ghost: 'bg-transparent text-foreground hover:bg-cream-100',
  quiet: 'bg-cream-100 text-foreground hover:bg-cream-200',
  danger: 'bg-destructive text-destructive-foreground hover:opacity-90',
};

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-full font-body font-medium px-4 md:px-6 py-3 text-sm text-center ' +
  'transition-[color,background-color,border-color,opacity,transform] duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ' +
  'focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-40 ' +
  'active:scale-[0.97] active:opacity-90 active:duration-100';

type CommonProps = {
  variant?: ButtonVariant;
  /** render label in CSS uppercase on Latin locales (brand CTA style) */
  caps?: boolean;
  block?: boolean;
  /** Placement on a dark-emerald anchor surface. Unused since the 2026-09-08
   * retint dropped the site's dark "anchor" surfaces (Header, Footer, hero
   * bands are a light taupe now, not near-black) — kept in case a future
   * dark surface needs it; the default `primary` fill has poor contrast
   * against a genuinely dark background, which is what this compensates for. */
  onInk?: boolean;
  children: ReactNode;
  className?: string;
};

type ButtonAsButton = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> & { to?: undefined };
type ButtonAsLink = CommonProps & {
  to: string;
  external?: boolean;
  onClick?: () => void;
  'aria-label'?: string;
};

export type ButtonProps = ButtonAsButton | ButtonAsLink;

/** The one filled action per screen should be `primary`; everything else steps down. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(props, ref) {
  const { variant = 'primary', caps = false, block = false, onInk = false, className, children } = props;
  const classes = cn(
    BASE,
    VARIANT[variant],
    variant === 'primary' && onInk && 'bg-deep-600 hover:bg-deep-700 hover:ring-2 hover:ring-accent',
    block && 'w-full',
    // `.u-caps` sets a wide 0.14em letter-spacing meant for small eyebrow
    // labels; on button-sized text that reads as too spaced out, so pull it
    // back to the button's own normal tracking (the `!` is needed — .u-caps
    // is a plain, unlayered rule in marketing.css and beats a plain Tailwind
    // utility regardless of class order).
    caps && 'u-caps',
    className,
  );

  if ('to' in props && props.to !== undefined) {
    const { to, external, onClick } = props;
    const ariaLabel = props['aria-label'];
    if (external) {
      return (
        <a href={to} className={classes} rel="noopener noreferrer" target="_blank" onClick={onClick} aria-label={ariaLabel}>
          {children}
        </a>
      );
    }
    return (
      <Link to={to} className={classes} onClick={onClick} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  }

  // button branch — strip the styling props so they don't hit the DOM
  const {
    variant: _v,
    caps: _c,
    block: _b,
    onInk: _oi,
    className: _cn,
    children: _ch,
    type = 'button',
    ...rest
  } = props as ButtonAsButton;
  return (
    <button ref={ref} type={type} className={classes} {...rest}>
      {children}
    </button>
  );
});

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  children: ReactNode;
  size?: ButtonSize;
};

export function IconButton({ label, children, size = 'md', className, type = 'button', ...rest }: IconButtonProps) {
  // Sized to iOS HIG's 44x44pt minimum tap target at `md` (the default) and up;
  // `sm` (40px) stays under it deliberately for dense spots (e.g. table rows).
  const box = size === 'sm' ? 'h-10 w-10' : size === 'lg' ? 'h-[3.25rem] w-[3.25rem]' : 'h-11 w-11';
  return (
    <button
      type={type}
      aria-label={label}
      className={cn(
        'inline-flex items-center justify-center rounded-full text-foreground transition-[background-color,opacity,transform] duration-150',
        'hover:bg-cream-100 outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'active:scale-[0.97] active:opacity-90 active:duration-100 disabled:cursor-not-allowed disabled:opacity-40',
        box,
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
