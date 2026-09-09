import { useState } from 'react';
import { useT } from '@/i18n/LocaleProvider';
import { Section, DisplayTitle, Prose, Button } from '@/app/components/roote';
import { rooteContent } from '@/content/roote.config';

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
      <label className="flex flex-col gap-1 text-sm">
        {t('marketing.support.form.nameLabel')}
        <input type="text" required className={FIELD_CLASS} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        {t('marketing.support.form.emailLabel')}
        <input type="email" required className={FIELD_CLASS} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        {t('marketing.support.form.topicLabel')}
        <select className={FIELD_CLASS}>
          <option>{t('marketing.support.form.topic1')}</option>
          <option>{t('marketing.support.form.topic2')}</option>
          <option>{t('marketing.support.form.topic3')}</option>
          <option>{t('marketing.support.form.topic4')}</option>
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        {t('marketing.support.form.messageLabel')}
        <textarea required rows={5} className={FIELD_CLASS} />
      </label>
      <Button type="submit" className="mt-1 w-full sm:w-auto sm:self-start">
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
  const { company } = rooteContent;
  return (
    <>
      <Section tone="teal" width="content" animate={false} className="text-center">
        <DisplayTitle as="h1" step="lg" align="center" className="mx-auto max-w-2xl">
          {t('marketing.support.hero.title')}
        </DisplayTitle>
        <Prose size="lg" className="mx-auto mt-4 text-center">
          {t('marketing.support.hero.body')}
        </Prose>
      </Section>

      <Section tone="cream" width="content">
        <DisplayTitle as="h2" step="md" className="max-w-2xl">
          {t('marketing.support.contact.title')}
        </DisplayTitle>
        <div className="mt-8 flex max-w-md flex-col items-start gap-4">
          <dl className="flex flex-col gap-3 text-sm">
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs uppercase tracking-[0.1em] text-muted-foreground">
                {t('marketing.support.contact.emailLabel')}
              </dt>
              <dd dir="ltr">
                <a href={`mailto:${company.support.email}`} className="text-accent underline">
                  {company.support.email}
                </a>
              </dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs uppercase tracking-[0.1em] text-muted-foreground">
                {t('marketing.support.contact.phoneLabel')}
              </dt>
              <dd dir="ltr">
                <a href={company.support.phoneHref} className="text-accent underline">
                  {company.support.phone}
                </a>
              </dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs uppercase tracking-[0.1em] text-muted-foreground">
                {t('marketing.support.contact.hoursLabel')}
              </dt>
              <dd>{t('marketing.support.contact.hours')}</dd>
            </div>
          </dl>
          <Prose className="mt-1">{t('marketing.support.contact.inApp')}</Prose>
        </div>
      </Section>

      <Section tone="teal" width="content">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col items-start gap-4">
            <DisplayTitle as="h2" step="md" className="max-w-sm">
              {t('marketing.support.form.title')}
            </DisplayTitle>
            <Prose size="lg" className="max-w-sm">{t('marketing.support.hero.body')}</Prose>
          </div>
          <div className="rounded-2xl border border-ink-foreground/15 bg-background p-6 text-foreground sm:p-8">
            <ContactForm />
          </div>
        </div>
      </Section>
    </>
  );
}
