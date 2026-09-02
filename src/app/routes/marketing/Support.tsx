import { useState } from 'react';
import { useT } from '@/i18n/LocaleProvider';
import { Section } from '@/app/components/marketing/Section';
import { DisplayHeading } from '@/app/components/marketing/DisplayHeading';
import { Prose } from '@/app/components/marketing/Prose';
import { CtaButton } from '@/app/components/marketing/CtaButton';
import { ArrowLink } from '@/app/components/marketing/ArrowLink';
import { CtaBand } from '@/app/components/marketing/CtaBand';
import { PendingChip } from '@/app/components/brand/PendingChip';

// TODO: wire to support backend
function ContactForm() {
  const t = useT();
  const [submitted, setSubmitted] = useState(false);

  return (
    <form
      className="mx-auto flex max-w-lg flex-col gap-4 text-start"
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
    >
      <label className="flex flex-col gap-1 text-sm">
        {t('marketing.support.form.nameLabel')}
        <input type="text" required className="rounded-md border border-input bg-input-background px-3 py-2 text-sm" />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        {t('marketing.support.form.emailLabel')}
        <input type="email" required className="rounded-md border border-input bg-input-background px-3 py-2 text-sm" />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        {t('marketing.support.form.topicLabel')}
        <select className="rounded-md border border-input bg-input-background px-3 py-2 text-sm">
          <option>{t('marketing.support.form.topic1')}</option>
          <option>{t('marketing.support.form.topic2')}</option>
          <option>{t('marketing.support.form.topic3')}</option>
          <option>{t('marketing.support.form.topic4')}</option>
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        {t('marketing.support.form.messageLabel')}
        <textarea required rows={4} className="rounded-md border border-input bg-input-background px-3 py-2 text-sm" />
      </label>
      <button type="submit" className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground">
        {t('marketing.support.form.submit')}
      </button>
      {submitted && (
        <p role="status" className="text-sm text-muted-foreground">{t('marketing.support.form.stubNotice')}</p>
      )}
    </form>
  );
}

export function Support() {
  const t = useT();
  return (
    <>
      <Section tone="ink" className="pt-28 text-center md:pt-32">
        <DisplayHeading as="h1" size="l" onInk text={t('marketing.support.hero.title')} className="mx-auto max-w-3xl" />
        <Prose size="l" onInk className="mx-auto mt-4 max-w-xl">{t('marketing.support.hero.body')}</Prose>
      </Section>

      <Section className="text-center">
        <DisplayHeading as="h2" size="m" text={t('marketing.support.contact.title')} />
        <div className="mx-auto mt-6 flex max-w-md flex-col items-center gap-3">
          <PendingChip label="support email" />
          <PendingChip label="support hours" />
          <Prose className="mt-2">{t('marketing.support.contact.inApp')}</Prose>
        </div>
      </Section>

      <Section className="border-t border-border">
        <DisplayHeading as="h2" size="m" text={t('marketing.support.form.title')} className="text-center" />
        <div className="mt-8">
          <ContactForm />
        </div>
      </Section>

      <Section className="border-t border-border text-center">
        <DisplayHeading as="h2" size="m" text={t('marketing.support.help.title')} />
        <div className="mt-6">
          <ArrowLink to="/faq">{t('marketing.support.help.cta')}</ArrowLink>
        </div>
      </Section>

      <CtaBand headingKey="marketing.support.cta.title" />
    </>
  );
}
