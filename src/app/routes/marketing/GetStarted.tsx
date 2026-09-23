import { Link } from 'react-router';
import { useT, useLocalizedPath } from '@/i18n/LocaleProvider';
import { Section, DisplayTitle, Prose, Button } from '@/app/components/roote';
import { PATHS } from '@/app/paths';

/** Where the header's account icon sends a guest with no `auth.email` (see
 *  Header.tsx). A tracking account isn't something you sign up for
 *  standalone here, it's created by completing the free hair analysis and
 *  checkout (brief's marketing → diagnosis → report → account+plan+checkout
 *  flow), so this nudges toward that instead of a bare signup form. Same
 *  chrome as CartPage.tsx (cream Section, DisplayTitle heading); the two
 *  are siblings under MarketingShell. */
export function GetStarted() {
  const t = useT();
  const withLocale = useLocalizedPath();

  return (
    <Section tone="cream" className="pt-28 md:pt-32" gap={12}>
      <DisplayTitle as="h1" step="xl">
        {t('getStarted.title')}
      </DisplayTitle>
      <div className="flex flex-col items-start gap-4">
        <Prose>{t('getStarted.body')}</Prose>
        <Button to={withLocale(PATHS.analysis)} caps>
          {t('marketing.nav.cta')}
        </Button>
        <p className="font-body text-sm text-muted-foreground">
          {t('getStarted.haveAccount')}{' '}
          <Link to={withLocale(PATHS.login)} className="text-accent underline">
            {t('getStarted.logIn')}
          </Link>
        </p>
      </div>
    </Section>
  );
}
