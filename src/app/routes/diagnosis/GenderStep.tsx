import { useNavigate } from 'react-router';
import { useT } from '@/i18n/LocaleProvider';
import { useSession } from '@/store/sessionStore';
import type { Gender } from '@/domain/analysis/types';

// TODO: confirm with client — whether a third / "prefer not to say" option is needed.
const OPTIONS: Gender[] = ['male', 'female'];

export function GenderStep() {
  const t = useT();
  const navigate = useNavigate();
  const { setGender } = useSession();

  const choose = (g: Gender) => {
    setGender(g);
    navigate('/diagnosis/photos');
  };

  return (
    <section className="mx-auto max-w-md text-center flex flex-col gap-8">
      <h1 className="text-2xl">{t('diagnosis.gender.title')}</h1>
      <div className="grid grid-cols-2 gap-4">
        {OPTIONS.map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => choose(g)}
            className="rounded-xl border border-border bg-card px-4 py-10 text-lg hover:border-accent"
          >
            {t(`diagnosis.gender.${g}` as never)}
          </button>
        ))}
      </div>
    </section>
  );
}
