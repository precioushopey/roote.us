import { useState } from 'react';
import { useT, useLocalizedPath } from '@/i18n/LocaleProvider';
import { Section, Prose, SectionIntro, Button, Hero } from '@/app/components/roote';
import { rooteContent } from '@/content/roote.config';
import { PATHS } from '@/app/paths';

const FIELD_CLASS =
  'rounded-md border border-input bg-input-background px-3 py-2 text-sm outline-none focus:border-accent';

// TODO: wire to support backend
function ContactForm() {
  const t = useT();
  const [submitted, setSubmitted] = useState(false);

  return (
    <form
      className="flex w-full flex-col gap-4 text-start"
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
    >
      <label className="flex flex-col gap-2 text-sm">
        {t('marketing.support.form.nameLabel')}
        <input type="text" required className={FIELD_CLASS} />
      </label>
      <label className="flex flex-col gap-2 text-sm">
        {t('marketing.support.form.emailLabel')}
        <input type="email" required className={FIELD_CLASS} />
      </label>
      <label className="flex flex-col gap-2 text-sm">
        {t('marketing.support.form.topicLabel')}
        <select className={`cursor-pointer ${FIELD_CLASS}`}>
          <option>{t('marketing.support.form.topic1')}</option>
          <option>{t('marketing.support.form.topic2')}</option>
          <option>{t('marketing.support.form.topic3')}</option>
          <option>{t('marketing.support.form.topic4')}</option>
        </select>
      </label>
      <label className="flex flex-col gap-2 text-sm">
        {t('marketing.support.form.messageLabel')}
        <textarea required rows={5} className={FIELD_CLASS} />
      </label>
      <Button type="submit" className="w-full sm:w-auto sm:self-start">
        {t('marketing.support.form.submit')}
      </Button>
      {submitted && (
        <p role="status" className="text-sm text-muted-foreground">{t('marketing.support.form.stubNotice')}</p>
      )}
    </form>
  );
}

export function Support() {
  const t = useT();
  const withLocale = useLocalizedPath();
  const { company } = rooteContent;
  return (
    <>
      <Hero
        title={t('marketing.support.hero.title')}
        body={t('marketing.support.hero.body')}
        cta={
          <Button to={withLocale(PATHS.analysis)} caps className="w-full sm:w-auto">
            {t('marketing.nav.cta')}
          </Button>
        }
      />

      <Section tone="cream" width="content" gap={8}>
        <SectionIntro titleStep="md" title={t('marketing.support.contact.title')} />
        <div className="flex max-w-md flex-col items-start gap-4">
          <dl className="flex flex-col gap-4 text-sm">
            <div className="flex flex-col gap-2">
              <dt className="text-sm uppercase text-muted-foreground">
                {t('marketing.support.contact.emailLabel')}
              </dt>
              <dd dir="ltr">
                <a href={`mailto:${company.support.email}`} className="text-accent underline">
                  {company.support.email}
                </a>
              </dd>
            </div>
            <div className="flex flex-col gap-2">
              <dt className="text-sm uppercase text-muted-foreground">
                {t('marketing.support.contact.phoneLabel')}
              </dt>
              <dd dir="ltr">
                <a href={company.support.phoneHref} className="text-accent underline">
                  {company.support.phone}
                </a>
              </dd>
            </div>
            <div className="flex flex-col gap-2">
              <dt className="text-sm uppercase text-muted-foreground">
                {t('marketing.support.contact.hoursLabel')}
              </dt>
              <dd>{t('marketing.support.contact.hours')}</dd>
            </div>
          </dl>
          <Prose>{t('marketing.support.contact.inApp')}</Prose>
        </div>
      </Section>

      <Section tone="teal" width="content">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          <SectionIntro
            onInk
            titleStep="md"
            title={t('marketing.support.form.title')}
            body={t('marketing.support.hero.body')}
          />
          <div className="rounded-2xl border border-ink-foreground/15 bg-background p-6 text-foreground sm:p-8">
            <ContactForm />
          </div>
        </div>
      </Section>
    </>
  );
}
