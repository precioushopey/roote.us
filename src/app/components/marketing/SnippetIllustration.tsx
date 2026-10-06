import type { LevelSnippet } from '@/content/levelComparison';

/**
 * Small decorative line illustrations for the Minoxidil / Finasteride / DHT
 * explainers. Purely visual (`aria-hidden`) — the adjacent text carries the
 * meaning. Colours come from `currentColor` so they follow the theme.
 */
export function SnippetIllustration({ id }: { id: LevelSnippet['id'] }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 120 80"
      className="h-20 w-[7.5rem] shrink-0 text-primary"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* skin line */}
      <path d="M4 40h112" opacity={0.35} />
      {id === 'minoxidil' && (
        <>
          {/* follicle + hair, with widened vessels either side */}
          <path d="M60 40v22c0 6 -10 6 -10 0V40" />
          <path d="M55 40V8" />
          <path d="M28 52c6-8 12-8 18 0" />
          <path d="M82 52c-6-8-12-8-18 0" />
          <path d="M24 60h12M84 60h12" opacity={0.5} />
        </>
      )}
      {id === 'finasteride' && (
        <>
          {/* DHT dots stopped by a bar */}
          <circle cx="22" cy="22" r="4" />
          <circle cx="38" cy="30" r="4" />
          <circle cx="22" cy="40" r="4" opacity={0.5} />
          <path d="M60 14v52" strokeWidth={4} />
          <path d="M80 40c0 8 8 14 16 14s16-6 16-14" />
        </>
      )}
      {id === 'dht' && (
        <>
          {/* a follicle that gets smaller over time */}
          <circle cx="30" cy="40" r="20" />
          <path d="M58 40h14m-5-5 5 5-5 5" />
          <circle cx="98" cy="40" r="9" />
        </>
      )}
    </svg>
  );
}
