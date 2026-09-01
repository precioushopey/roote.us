import { cn } from '@/app/components/ui/utils';

export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn('select-none', className)}
      style={{ fontFamily: "'Libre Franklin', serif", letterSpacing: '0.08em', fontWeight: 600 }}
    >
      ROOTÉ
    </span>
  );
}
