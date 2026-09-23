import { useParams } from 'react-router';
import { Section, DisplayTitle, Prose } from '@/app/components/roote';
import { useLocale, useT } from '@/i18n/LocaleProvider';
import { getLegalPage, getLegalBody } from '@/content/legal';
import { pickLocalized } from '@/content/localized';
import { rooteContent } from '@/content/roote.config';
import { PagePlaceholder } from '@/app/routes/shared/PagePlaceholder';

/**
 * Renders one policy page from the `LEGAL_PAGES` registry + `LEGAL_BODIES`
 * drafts. Everything is a draft: bracketed `[TODO: confirm …]` notes in the
 * copy mark every specific counsel must set.
 */
export function LegalPageView({ slug: slugProp }: { slug?: string } = {}) {
  const params = useParams();
  const slug = slugProp ?? params.slug;
  const cl = useLocale().locale;
  const t = useT();
  const page = slug ? getLegalPage(slug) : undefined;

  if (!page) {
    return <PagePlaceholder title={t('notFound.policy.title')} body={t('notFound.policy.body')} />;
  }

  const sections = getLegalBody(page.slug);
  const { company } = rooteContent;

  return (
    <Section tone="cream" width="readable" gap={8}>
      <DisplayTitle as="h1" step="md">
        {pickLocalized(page.title, cl)}
      </DisplayTitle>
      <Prose>{pickLocalized(page.blurb, cl)}</Prose>

      <ol className="flex flex-col gap-8">
        {sections.map((s, i) => (
          <li key={s.id}>
            <h2 className="font-display text-md text-foreground">
              <span aria-hidden className="me-2 text-accent">
                {i + 1}.
              </span>
              {pickLocalized(s.heading, cl)}
            </h2>
            <p className="mt-1 font-body text-sm leading-[1.65] text-muted-foreground">
              {pickLocalized(s.body, cl)}
            </p>
          </li>
        ))}
      </ol>

      <p className="border-t border-border pt-6 font-body text-sm text-muted-foreground">
        {t('common.brandOf')}{' '}
        <span dir="ltr">
          {company.legalName} · {company.address.join(', ')} · {company.support.email}
        </span>
        <br />
        <span className="text-sm">{t('marketing.legal.updated')}: {company.legalUpdated}</span>
      </p>
    </Section>
  );
}
