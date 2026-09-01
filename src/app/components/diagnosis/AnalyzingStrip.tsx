import { useEffect, useRef, useState } from 'react';
import { useT } from '@/i18n/LocaleProvider';

const FACETS = ['density', 'area', 'hairline', 'scalp', 'thinning'] as const;

export function AnalyzingStrip({
  running, gateReady, onComplete, facetMs = 2200,
}: {
  running: boolean;
  gateReady: boolean;
  onComplete: () => void;
  facetMs?: number;
}) {
  const t = useT();
  const [done, setDone] = useState(0); // number of completed facets (0..5)
  const firedRef = useRef(false);

  useEffect(() => {
    if (!running) return;
    if (done >= FACETS.length) return;
    // Hold on the final facet until the questionnaire gate opens.
    if (done === FACETS.length - 1 && !gateReady) return;
    const id = setTimeout(() => setDone((d) => d + 1), facetMs);
    return () => clearTimeout(id);
  }, [running, done, gateReady, facetMs]);

  useEffect(() => {
    if (done >= FACETS.length && gateReady && !firedRef.current) {
      firedRef.current = true;
      onComplete();
    }
  }, [done, gateReady, onComplete]);

  const pct = Math.min(100, Math.round((done / FACETS.length) * 100) || (running ? 8 : 0));

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{t('analysis.title')}</span>
        <span>{gateReady || done < FACETS.length - 1 ? `${pct}%` : `92%`}</span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-accent transition-all" style={{ width: `${gateReady ? pct : Math.min(pct, 92)}%` }} />
      </div>
      <ul className="mt-3 grid gap-1 text-xs">
        {FACETS.map((f, i) => (
          <li key={f} className={i < done ? 'text-foreground' : 'text-muted-foreground'}>
            {i < done ? '✓ ' : '• '}{t(`analysis.facet.${f}` as never)}
          </li>
        ))}
      </ul>
    </div>
  );
}
