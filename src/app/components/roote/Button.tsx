import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Link } from 'react-router';
import { cn } from '@/app/components/ui/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'quiet' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

const VARIANT: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-primary-foreground hover:bg-deep-900',
  secondary: 'border border-border bg-transparent text-foreground hover:border-deep-700',
  ghost: 'bg-transparent text-foreground hover:bg-cream-100',
  quiet: 'bg-cream-100 text-foreground hover:bg-cream-200',
  danger: 'bg-destructive text-destructive-foreground hover:opacity-90',
};

const SIZE: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-6 text-sm',
  lg: 'h-13 px-8 text-base',
};

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-full font-body font-medium tracking-wide ' +
  'transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ' +
  'focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-40';

type CommonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** render label in CSS uppercase on Latin locales (brand CTA style) */
  caps?: boolean;
  block?: boolean;
  /** Placement on a dark-emerald anchor surface (Header, Footer CTA — same
   * surfaces `Wordmark({ onInk })` targets). The default `primary` fill
   * (bg-primary / hover:bg-deep-900) is emerald-800/900 — both read as
   * near-invisible against the emerald-950 `ink` background (~1.5:1 /
   * ~1.2:1), well under the WCAG 1.4.11 3:1 boundary-contrast minimum. This
   * swaps to a lighter emerald-600 fill (~3.2:1 against ink) with a
   * gold-ringed emerald-700 hover — darkening the fill alone on hover still
   * fails 3:1 (~2:1), so the gold-500 ring supplies the boundary contrast. */
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
  const { variant = 'primary', size = 'md', caps = false, block = false, onInk = false, className, children } = props;
  const classes = cn(
    BASE,
    VARIANT[variant],
    variant === 'primary' && onInk && 'bg-deep-600 hover:bg-deep-700 hover:ring-2 hover:ring-gold-500',
    SIZE[size],
    block && 'w-full',
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
    size: _s,
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
  const box = size === 'sm' ? 'h-9 w-9' : size === 'lg' ? 'h-12 w-12' : 'h-10 w-10';
  return (
    <button
      type={type}
      aria-label={label}
      className={cn(
        'inline-flex items-center justify-center rounded-full text-foreground transition-colors',
        'hover:bg-cream-100 outline-none focus-visible:ring-2 focus-visible:ring-ring',
        box,
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
