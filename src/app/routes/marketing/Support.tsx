import { useState } from 'react';
import { useT } from '@/i18n/LocaleProvider';
import { Section } from '@/app/components/marketing/Section';
import { SectionHeading } from '@/app/components/marketing/SectionHeading';
import { DisplayHeading } from '@/app/components/marketing/DisplayHeading';
import { Prose } from '@/app/components/marketing/Prose';
import { ArrowLink } from '@/app/components/marketing/ArrowLink';
import { CtaBand } from '@/app/components/marketing/CtaBand';
import { PendingChip } from '@/app/components/brand/PendingChip';

// TODO: wire to support backend
function ContactForm() {
  const t = useT();
  const [submitted, setSubmitted] = useState(false);

  return (
    <form
      className="flex max-w-lg flex-col gap-4 text-start"
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
      <button
        type="submit"
        className="inline-flex w-full items-center justify-center rounded-full bg-primary px-8 py-4 text-sm tracking-wide text-primary-foreground sm:w-auto"
      >
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
      <Section tone="ink" className="overflow-hidden pt-28 text-center md:pt-32">
        <div className="relative flex flex-col items-center">
          <div
            aria-hidden
            className="absolute left-1/2 top-1/2 -z-10 aspect-square w-[85%] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/25 blur-3xl"
          />
          <DisplayHeading as="h1" size="l" onInk text={t('marketing.support.hero.title')} className="mx-auto max-w-3xl" />
          <Prose size="l" onInk className="mx-auto mt-4 max-w-xl">{t('marketing.support.hero.body')}</Prose>
        </div>
      </Section>

      <Section>
        <SectionHeading index="01" clamp="clamp(1.75rem, 7vw, 5rem)">
          {t('marketing.support.contact.title')}
        </SectionHeading>
        <div className="mt-8 flex max-w-md flex-col items-start gap-3">
          <PendingChip label="support email" />
          <PendingChip label="support hours" />
          <Prose className="mt-2">{t('marketing.support.contact.inApp')}</Prose>
        </div>
      </Section>

      <Section tone="ink">
        <SectionHeading index="02" onInk align="end" clamp="clamp(1.75rem, 7vw, 5rem)">
          {t('marketing.support.form.title')}
        </SectionHeading>
        <div className="mt-10 flex justify-end">
          <ContactForm />
        </div>
      </Section>

      <Section className="pt-0">
        <SectionHeading index="03" clamp="clamp(1.75rem, 7vw, 5rem)">
          {t('marketing.support.help.title')}
        </SectionHeading>
        <div className="mt-6">
          <ArrowLink to="/faq">{t('marketing.support.help.cta')}</ArrowLink>
        </div>
      </Section>

      <CtaBand headingKey="marketing.support.cta.title" />
    </>
  );
}
