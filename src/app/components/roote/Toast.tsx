import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { cn } from '@/app/components/ui/utils';

type ToastTone = 'neutral' | 'success' | 'error';
type ToastItem = { id: number; message: string; tone: ToastTone };

type ToastCtx = { show: (message: string, tone?: ToastTone) => void };
const Ctx = createContext<ToastCtx | null>(null);

/**
 * Minimal in-app toast — no external library (brief §30). Auto-dismisses;
 * announced via an `aria-live` region. Mount `<ToastProvider>` once near the app
 * root and call `useToast().show(...)`.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const show = useCallback((message: string, tone: ToastTone = 'neutral') => {
    setItems((prev) => [...prev, { id: Date.now() + Math.random(), message, tone }]);
  }, []);

  const value = useMemo(() => ({ show }), [show]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4"
      >
        {items.map((t) => (
          <ToastRow key={t.id} item={t} onDone={() => setItems((p) => p.filter((x) => x.id !== t.id))} />
        ))}
      </div>
    </Ctx.Provider>
  );
}

function ToastRow({ item, onDone }: { item: ToastItem; onDone: () => void }) {
  useEffect(() => {
    const id = setTimeout(onDone, 4000);
    return () => clearTimeout(id);
  }, [onDone]);
  return (
    <div
      role="status"
      className={cn(
        'pointer-events-auto max-w-sm rounded-full px-4 py-2.5 font-body text-sm shadow-lg',
        item.tone === 'success' && 'bg-deep-950 text-cream-100',
        item.tone === 'error' && 'bg-destructive text-destructive-foreground',
        item.tone === 'neutral' && 'bg-foreground text-background',
      )}
    >
      {item.message}
    </div>
  );
}

export function useToast(): ToastCtx {
  return useContext(Ctx) ?? { show: () => {} };
}
