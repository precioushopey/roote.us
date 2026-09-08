import { Section, DisplayTitle, Prose, Eyebrow, Button } from '@/app/components/roote';
import { useT } from '@/i18n/LocaleProvider';
import { EXTERNAL_ASSESSMENT_URL } from '@/app/paths';

/**
 * Branded stand-in for a route whose full build lands in a later work package.
 * Keeps the IA navigable and every URL resolving. `wp` shows which package will
 * replace it (dev only).
 */
export function PagePlaceholder({
  eyebrow,
  title,
  body,
  wp,
}: {
  eyebrow?: string;
  title: string;
  body?: string;
  wp?: string;
}) {
  const t = useT();
  return (
    <Section tone="cream" width="readable">
      <div className="flex flex-col items-center gap-5 py-10 text-center">
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <DisplayTitle as="h1" step="lg" align="center">
          {title}
        </DisplayTitle>
        {body ? <Prose className="mx-auto text-center">{body}</Prose> : null}
        {wp && import.meta.env?.DEV ? (
          <p className="rounded-full bg-cream-200 px-3 py-1 font-body text-2xs text-muted-foreground">
            Full build: {wp}
          </p>
        ) : null}
        <Button to={EXTERNAL_ASSESSMENT_URL} external caps className="mt-2">
          {t('marketing.nav.cta')}
        </Button>
      </div>
    </Section>
  );
}
