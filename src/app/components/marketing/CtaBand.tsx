import { useT } from '@/i18n/LocaleProvider';
import { Section } from './Section';
import { DisplayHeading } from './DisplayHeading';
import { Prose } from './Prose';
import { CtaButton } from './CtaButton';
import type { MessageKey } from '@/i18n/messages';

function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="shrink-0 text-accent">
      <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.3" />
      <path d="M6 10.2l2.5 2.5L14.5 6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface CtaBandProps {
  headingKey: MessageKey;
  bodyKey?: MessageKey;
  checklistKeys?: MessageKey[];
  image?: string;
}

export function CtaBand({ headingKey, bodyKey, checklistKeys, image }: CtaBandProps) {
  const t = useT();

  if (checklistKeys && image) {
    return (
      <Section tone="ink">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
          <div className="flex flex-col items-start gap-6">
            <DisplayHeading as="h2" size="m" onInk text={t(headingKey)} />
            <ul className="flex flex-col gap-3">
              {checklistKeys.map((key) => (
                <li key={key} className="flex items-center gap-3 text-sm text-ink-foreground/85">
                  <CheckIcon />
                  {t(key)}
                </li>
              ))}
            </ul>
            <CtaButton to="/diagnosis" size="lg">{t('marketing.nav.cta')}</CtaButton>
          </div>
          <img src={image} alt="" className="img-editorial mx-auto w-full max-w-md rounded-2xl object-cover shadow-lg" />
        </div>
      </Section>
    );
  }

  return (
    <Section tone="ink" className="text-center">
      <DisplayHeading as="h2" size="m" onInk text={t(headingKey)} />
      {bodyKey && (
        <Prose size="l" onInk className="mx-auto max-w-xl">
          {t(bodyKey)}
        </Prose>
      )}
      <div className="mt-8">
        <CtaButton to="/diagnosis" size="lg">{t('marketing.nav.cta')}</CtaButton>
      </div>
    </Section>
  );
}
