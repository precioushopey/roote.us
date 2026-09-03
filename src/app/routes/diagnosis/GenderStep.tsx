import { useNavigate } from 'react-router';
import { useT } from '@/i18n/LocaleProvider';
import { useSession } from '@/store/sessionStore';
import { funnelHeading } from '@/app/components/funnel/funnelStyles';
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
    <section data-animate className="mx-auto flex max-w-md flex-col gap-8 text-center">
      <h1 className={funnelHeading}>{t('diagnosis.gender.title')}</h1>
      <div className="grid grid-cols-2 gap-4">
        {OPTIONS.map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => choose(g)}
            className="rounded-2xl border border-border bg-card px-4 py-12 font-display text-lg font-medium shadow-sm transition-colors hover:border-accent hover:bg-accent/5"
          >
            {t(`diagnosis.gender.${g}` as never)}
          </button>
        ))}
      </div>
    </section>
  );
}
