import { ReactNode } from 'react';
import { Link } from 'react-router';

interface ArrowLinkProps {
  to: string;
  children: ReactNode;
}

export function ArrowLink({ to, children }: ArrowLinkProps) {
  return (
    <Link
      to={to}
      className="group inline-flex items-center gap-2 font-body text-sm text-foreground"
    >
      <span className="border-b border-accent/50 group-hover:border-accent">{children}</span>
      <svg
        aria-hidden="true"
        className="h-4 w-4 shrink-0 rtl:-scale-x-100 transition-transform group-hover:translate-x-1"
        viewBox="0 0 24 24"
      >
        <path
          d="M5 12h14M13 6l6 6-6 6"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Link>
  );
}
