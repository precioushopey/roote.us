import { ReactNode } from 'react';

interface EyebrowProps {
  children: ReactNode;
}

export function Eyebrow({ children }: EyebrowProps) {
  return (
    <p className="font-body text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
      {children}
    </p>
  );
}
