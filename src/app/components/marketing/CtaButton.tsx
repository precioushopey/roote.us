import { ReactNode } from 'react';
import { Link } from 'react-router';
import { cn } from '@/app/components/ui/utils';

interface CtaButtonProps {
  to: string;
  children: ReactNode;
  size?: 'md' | 'lg';
}

export function CtaButton({ to, children, size = 'md' }: CtaButtonProps) {
  const sizeClasses = size === 'lg' ? 'px-8 py-4 text-sm' : 'px-6 py-3 text-sm';

  return (
    <Link
      to={to}
      className={cn(
        'inline-flex items-center rounded-full bg-primary text-primary-foreground tracking-wide',
        sizeClasses,
      )}
    >
      {children}
    </Link>
  );
}
