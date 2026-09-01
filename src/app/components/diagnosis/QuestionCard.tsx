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
    <div className="mx-auto max-w-md flex flex-col gap-6">
      <p className="text-xs text-muted-foreground">{t('q.counter', { index: index + 1, total })}</p>
      <h2 className="text-xl">{t(question.promptKey as never)}</h2>
      <div className="grid gap-3">
        {question.options.map((o) => (
          <button
            key={o.value}
            type="button"
            aria-pressed={value === o.value}
            onClick={() => onSelect(question.id, o.value)}
            className={
              'rounded-lg border px-4 py-3 text-start text-sm ' +
              (value === o.value ? 'border-accent bg-accent/10' : 'border-border bg-card')
            }
          >
            {t(o.labelKey as never)}
          </button>
        ))}
      </div>
    </div>
  );
}
