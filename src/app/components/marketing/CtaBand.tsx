import { useT } from '@/i18n/LocaleProvider';
import { Section } from './Section';
import { DisplayHeading } from './DisplayHeading';
import { Prose } from './Prose';
import { CtaButton } from './CtaButton';
import type { MessageKey } from '@/i18n/messages';

export function CtaBand({ headingKey, bodyKey }: { headingKey: MessageKey; bodyKey?: MessageKey }) {
  const t = useT();
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
