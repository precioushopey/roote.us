import { useT } from '@/i18n/LocaleProvider';
import type { Question, QuestionId } from './questions';

export function QuestionCard({
  question, index, total, value, onSelect,
}: {
  question: Question;
  index: number;
  total: number;
  value: string | undefined;
  onSelect: (id: QuestionId, value: string) => void;
}) {
  const t = useT();
  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <p className="font-body text-xs font-medium uppercase tracking-[0.18em] text-accent">
        {t('q.counter', { index: index + 1, total })}
      </p>
      <h2 className="font-display text-2xl font-medium tracking-[-0.01em]">{t(question.promptKey as never)}</h2>
      <div className="grid gap-3">
        {question.options.map((o) => (
          <button
            key={o.value}
            type="button"
            aria-pressed={value === o.value}
            onClick={() => onSelect(question.id, o.value)}
            className={
              'rounded-xl border px-4 py-3.5 text-start text-sm transition-colors ' +
              (value === o.value
                ? 'border-accent bg-accent/5'
                : 'border-border bg-background hover:border-accent')
            }
          >
            {t(o.labelKey as never)}
          </button>
        ))}
      </div>
    </div>
  );
}
