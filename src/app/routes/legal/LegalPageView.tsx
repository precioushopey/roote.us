import { useParams } from 'react-router';
import { Section, DisplayTitle, Prose, LegalNotice } from '@/app/components/roote';
import { useContentLocale } from '@/i18n/LocaleProvider';
import { getLegalPage, getLegalBody } from '@/content/legal';
import { pickLocalized } from '@/content/localized';
import { rooteContent } from '@/content/roote.config';
import { PagePlaceholder } from '@/app/routes/shared/PagePlaceholder';

/**
 * Renders one policy page from the `LEGAL_PAGES` registry + `LEGAL_BODIES`
 * drafts. Everything is a draft: the review marker shows in dev, and bracketed
 * `[TODO: confirm …]` notes in the copy mark every specific counsel must set.
 */
export function LegalPageView({ slug: slugProp }: { slug?: string } = {}) {
  const params = useParams();
  const slug = slugProp ?? params.slug;
  const cl = useContentLocale();
  const page = slug ? getLegalPage(slug) : undefined;

  if (!page) {
    return <PagePlaceholder title="Policy" body="This policy page could not be found." />;
  }

  const sections = getLegalBody(page.slug);
  const { company } = rooteContent;

  return (
    <Section tone="cream" width="readable">
      <DisplayTitle as="h1" step="md">
        {pickLocalized(page.title, cl)}
      </DisplayTitle>
      <Prose className="mt-3">{pickLocalized(page.blurb, cl)}</Prose>

      <LegalNotice reviewRequired={page.reviewRequired} className="mt-6">
        This is a draft for the preview build. It has not been reviewed by legal counsel; the
        Hebrew version is additionally pending formal legal review. Bracketed “[TODO: confirm …]”
        notes mark items the operator must set.
      </LegalNotice>

      <ol className="mt-8 flex flex-col gap-6">
        {sections.map((s, i) => (
          <li key={s.id}>
            <h2 className="font-display text-md text-foreground">
              <span aria-hidden className="me-2 text-sm text-accent">
                {String(i + 1).padStart(2, '0')}
              </span>
              {pickLocalized(s.heading, cl)}
            </h2>
            <p className="mt-1 font-body text-sm leading-[1.65] text-muted-foreground">
              {pickLocalized(s.body, cl)}
            </p>
          </li>
        ))}
      </ol>

      <p className="mt-10 border-t border-border pt-6 font-body text-xs text-muted-foreground">
        {rooteContent.brand.name} is a brand of{' '}
        <span dir="ltr">
          {company.legalName} · {company.address.join(', ')} · {company.support.email}
        </span>
        <br />
        <span className="text-2xs">Last updated: {company.legalUpdated}</span>
      </p>
    </Section>
  );
}
