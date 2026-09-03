import { useT } from '@/i18n/LocaleProvider';
import type { Question, QuestionId } from './questions';

export function QuestionCard({
  question, index, total, value, onSelect, onBack,
}: {
  question: Question;
  index: number;
  total: number;
  value: string | undefined;
  onSelect: (id: QuestionId, value: string) => void;
  onBack?: () => void;
}) {
  const t = useT();
  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <div className="flex items-center gap-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <span aria-hidden className="inline-block rtl:rotate-180">&larr;</span>
            {t('common.back')}
          </button>
        )}
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-accent/12 px-3 py-1 font-body text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-accent">
          {t('q.counter', { index: index + 1, total })}
        </span>
      </div>
      <h2 className="font-display text-[1.65rem] font-medium leading-[1.15] tracking-[-0.01em] sm:text-3xl">
        {t(question.promptKey as never)}
      </h2>
      <div className="grid gap-3">
        {question.options.map((o) => {
          const selected = value === o.value;
          return (
            <button
              key={o.value}
              type="button"
              aria-pressed={selected}
              onClick={() => onSelect(question.id, o.value)}
              className={
                'group flex items-center justify-between gap-3 rounded-2xl border px-5 py-4 text-start text-[0.95rem] font-medium transition-all duration-200 active:scale-[0.99] ' +
                (selected
                  ? 'border-accent bg-accent text-accent-foreground shadow-lg shadow-accent/25'
                  : 'border-border bg-card text-foreground shadow-sm hover:-translate-y-0.5 hover:border-accent hover:bg-accent/10 hover:shadow-md hover:shadow-accent/10')
              }
            >
              <span>{t(o.labelKey as never)}</span>
              <span
                aria-hidden
                className={
                  'flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors ' +
                  (selected ? 'border-accent-foreground/70' : 'border-border group-hover:border-accent')
                }
              >
                <span
                  className={
                    'size-2 rounded-full transition-transform duration-200 ' +
                    (selected ? 'scale-100 bg-accent-foreground' : 'scale-0 bg-accent')
                  }
                />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
