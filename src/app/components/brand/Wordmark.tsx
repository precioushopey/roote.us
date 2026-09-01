import logo from '@/assets/logo.png';
import { cn } from '@/app/components/ui/utils';

export function Wordmark({ className }: { className?: string }) {
  return (
    <img
      src={logo}
      alt="ROOTÉ"
      className={cn('h-auto w-32 select-none', className)}
    />
  );
}
