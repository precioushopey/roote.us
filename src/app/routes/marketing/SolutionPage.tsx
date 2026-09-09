import { useParams } from 'react-router';
import { useT, useContentLocale, useLocalizedPath } from '@/i18n/LocaleProvider';
import {
  Section,
  DisplayTitle,
  Prose,
  Eyebrow,
  Button,
  Card,
  ProductCard,
} from '@/app/components/roote';
import { PATHS, EXTERNAL_ASSESSMENT_URL } from '@/app/paths';
import { pickLocalized } from '@/content/localized';
import { getSolution } from '@/content/solutions';
import { getProduct } from '@/content/products';
import { PROGRAMS } from '@/content/programs';
import { rooteContent } from '@/content/roote.config';
import { formatMoney } from '@/domain/report/money';
import { PagePlaceholder } from '@/app/routes/shared/PagePlaceholder';
import thinningHero from '@/assets/images/thinning-hero.png';
import grayHairHero from '@/assets/images/gray-hair-hero.png';

const SOLUTION_PHOTOS: Record<string, string> = {
  thinning: thinningHero,
  'gray-hair': grayHairHero,
};

/** Thinning + gray-hair solution pages (brief §18, §19). Educate → route to the
 *  assessment. Severity levels are an assessment visualization, never a tier map. */
export function SolutionPage({ slug: slugProp }: { slug?: 'thinning' | 'gray-hair' } = {}) {
  const params = useParams();
  const slug = slugProp ?? params.slug;
  const t = useT();
  const cl = useContentLocale();
  const withLocale = useLocalizedPath();
  const solution = slug ? getSolution(slug) : undefined;

  if (!solution) return <PagePlaceholder title="Solution" body="This solution page could not be found." />;

  const program = PROGRAMS[solution.relatedProgram];
  const products = solution.relatedProducts.map(getProduct).filter((p): p is NonNullable<typeof p> => !!p);

  return (
    <>
      {/* hero */}
      <Section tone="teal" width="content" animate={false}>
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="flex flex-col items-start gap-5">
            <Eyebrow className="rounded-full border border-accent px-4 py-1.5">
              {pickLocalized(solution.hero.eyebrow, cl)}
            </Eyebrow>
            <DisplayTitle as="h1" step="lg">
              {pickLocalized(solution.hero.title, cl)}
            </DisplayTitle>
            <Prose size="lg" className="max-w-lg">
              {pickLocalized(solution.hero.body, cl)}
            </Prose>
            <div className="flex flex-wrap gap-3">
              <Button to={EXTERNAL_ASSESSMENT_URL} external caps>
                {t('marketing.nav.cta')}
              </Button>
              <Button to={withLocale(PATHS.system)} variant="secondary">
                {t('marketing.sol.exploreSystem')}
              </Button>
            </div>
          </div>
          <img
            src={SOLUTION_PHOTOS[solution.slug]}
            alt={solution.media[0].alt}
            className="aspect-[4/3] w-full rounded-xl object-cover"
          />
        </div>
      </Section>

      {/* education */}
      <Section tone="cream" width="content">
        <DisplayTitle as="h2" step="md">
          {t('marketing.sol.understandHeading')}
        </DisplayTitle>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {solution.education.map((e, i) => (
            <Card key={e.id}>
              <span className="font-display text-xl text-accent">{String(i + 1).padStart(2, '0')}</span>
              <p className="mt-1 font-display text-md text-foreground">{pickLocalized(e.title, cl)}</p>
              <p className="mt-2 font-body text-sm text-muted-foreground">{pickLocalized(e.body, cl)}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* severity levels */}
      <Section tone="grid" width="content">
        <DisplayTitle as="h2" step="md" className="max-w-2xl">
          {pickLocalized(solution.severityHeading, cl)}
        </DisplayTitle>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {solution.severityLevels.map((lvl) => (
            <Card key={lvl.id}>
              <p className="font-display text-md text-foreground">{pickLocalized(lvl.title, cl)}</p>
              <p className="mt-2 font-body text-sm text-muted-foreground">{pickLocalized(lvl.description, cl)}</p>
            </Card>
          ))}
        </div>
        <p className="mt-6 max-w-2xl font-body text-xs text-muted-foreground">
          {pickLocalized(solution.severityNote, cl)}
        </p>
      </Section>

      {/* the system + related products */}
      <Section tone="cream" width="content">
        <Eyebrow>{t('marketing.sol.systemEyebrow')}</Eyebrow>
        <DisplayTitle as="h2" step="md" className="mt-2">
          {pickLocalized(program.name, cl)}
        </DisplayTitle>
        <Prose className="mt-3 max-w-2xl">{pickLocalized(program.summary, cl)}</Prose>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard
              key={p.slug}
              name={p.name}
              subtitle={pickLocalized(p.subtitle, cl)}
              to={withLocale(PATHS.product(p.slug))}
              priceLabel={p.price === null ? null : formatMoney(p.price, rooteContent.currency, cl).formatted}
              mediaAlt={`${p.name} packaging`}
              mediaLabel={`${p.name} — product photography`}
            />
          ))}
        </div>
      </Section>

      {/* closing CTA */}
      <Section tone="teal" width="readable" className="border-b border-accent text-center">
        <DisplayTitle as="h2" step="lg" align="center">
          {t('marketing.sol.ctaHeading')}
        </DisplayTitle>
        <div className="mt-6 flex justify-center">
          <Button to={EXTERNAL_ASSESSMENT_URL} external size="lg" caps>
            {t('marketing.nav.cta')}
          </Button>
        </div>
      </Section>
    </>
  );
}

/** `/solutions` hub. */
export function SolutionsIndex() {
  const t = useT();
  const cl = useContentLocale();
  const withLocale = useLocalizedPath();
  const solutions = (['thinning', 'gray-hair'] as const).map(getSolution).filter((s): s is NonNullable<typeof s> => !!s);
  return (
    <>
      <Section tone="teal" width="content" animate={false} className="text-center">
        <Eyebrow className="rounded-full border border-accent px-4 py-1.5">
          {t('marketing.nav.solutions')}
        </Eyebrow>
        <DisplayTitle as="h1" step="lg" align="center" className="mx-auto mt-2 max-w-2xl">
          {t('marketing.sol.indexHeading')}
        </DisplayTitle>
        <Prose size="lg" className="mx-auto mt-4 text-center">
          {t('marketing.sol.indexBody')}
        </Prose>
      </Section>
      <Section tone="cream" width="content">
        <div className="grid gap-6 md:grid-cols-2">
          {solutions.map((s) => (
            <Card key={s.slug} padded={false} className="overflow-hidden">
              <img src={SOLUTION_PHOTOS[s.slug]} alt={s.media[0].alt} className="aspect-video w-full object-cover" />
              <div className="p-6">
                <h2 className="font-display text-lg text-foreground">{pickLocalized(s.hero.title, cl)}</h2>
                <p className="mt-2 font-body text-sm text-muted-foreground">{pickLocalized(s.hero.body, cl)}</p>
                <Button
                  to={withLocale(s.slug === 'thinning' ? PATHS.solutionThinning : PATHS.solutionGray)}
                  variant="secondary"
                  size="sm"
                  className="mt-4"
                >
                  {t('marketing.sol.explore')}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </Section>
    </>
  );
}
