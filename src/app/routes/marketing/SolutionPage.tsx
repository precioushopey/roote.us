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
import thinningHero from '@/assets/heroes/thinning-hero.png';
import grayHairHero from '@/assets/heroes/gray-hair-hero.png';
import concernThinning from '@/assets/concerns/concern-thinning.png';
import concernGray from '@/assets/concerns/concern-gray.png';
import solutionThinningCrown from '@/assets/concerns/solution-thinning-crown.png';
import solutionThinningDiffuse from '@/assets/concerns/solution-thinning-diffuse.png';
import solutionGrayPigmentation from '@/assets/concerns/solution-gray-pigmentation.png';
import solutionGrayRoutine from '@/assets/concerns/solution-gray-routine.png';
import solutionGrayEarly from '@/assets/concerns/solution-gray-early.png';
import solutionGrayModerate from '@/assets/concerns/solution-gray-moderate.png';
import solutionGrayAdvanced from '@/assets/concerns/solution-gray-advanced.png';
import scanBaseline from '@/assets/scans/scan-baseline.png';
import scanProgress from '@/assets/scans/scan-progress.png';
import scanFinal from '@/assets/scans/scan-final.png';
import level6 from '@/assets/products/Level 6.png';
import level10 from '@/assets/products/Level 10.png';
import level15 from '@/assets/products/Level 15.png';
import graySupport from '@/assets/products/Gray Support.png';
import graySerum from '@/assets/products/Gray Serum.png';
import regrowthShampoo from '@/assets/products/Regrowth Shampoo.png';

const SOLUTION_PHOTOS: Record<string, string> = {
  thinning: thinningHero,
  'gray-hair': grayHairHero,
};

/** Education cards, keyed by `${solution.slug}:${education.id}`. Thinning's
 *  three cards each have a distinct real close-up crop (concern-thinning.png
 *  for the hairline macro, solution-thinning-crown.png and
 *  solution-thinning-diffuse.png for the other two). Gray-hair's three real
 *  macro crops match: concern-gray.png (progression), a root-transition
 *  macro (pigmentation), and a dropper-application macro (routine). */
const EDUCATION_PHOTOS: Record<string, string> = {
  'thinning:hairline': concernThinning,
  'thinning:crown': solutionThinningCrown,
  'thinning:diffuse': solutionThinningDiffuse,
  'gray-hair:progression': concernGray,
  'gray-hair:pigmentation': solutionGrayPigmentation,
  'gray-hair:routine': solutionGrayRoutine,
};

/** Severity-level cards. Thinning's three real top-down scan crops form a
 *  genuine progression (fullest → thinnest), so they map cleanly to
 *  higher/moderate/advanced. Gray-hair's three real macro crops form a
 *  matching progression (mostly-pigmented → fully gray). */
const SEVERITY_PHOTOS: Record<string, string> = {
  'thinning:higher': scanFinal,
  'thinning:moderate': scanProgress,
  'thinning:advanced': scanBaseline,
  'gray-hair:early': solutionGrayEarly,
  'gray-hair:moderate': solutionGrayModerate,
  'gray-hair:advanced': solutionGrayAdvanced,
};

const PRODUCT_PHOTOS: Record<string, string> = {
  'density-6': level6,
  'density-10': level10,
  'density-15': level15,
  'gray-support': graySupport,
  'gray-serum': graySerum,
  'regrowth-shampoo': regrowthShampoo,
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
      <Section tone="teal" width="content" animate={false} className="py-12 md:py-12">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="flex flex-col items-start gap-5">
            <DisplayTitle as="h1" step="lg" className="!font-medium">
              {pickLocalized(solution.hero.title, cl)}
            </DisplayTitle>
            <Prose size="lg" className="max-w-lg text-ink-foreground/75">
              {pickLocalized(solution.hero.body, cl)}
            </Prose>
            <Button to={EXTERNAL_ASSESSMENT_URL} external size="lg" caps className="w-full text-sm sm:w-auto">
              {t('marketing.nav.cta')}
            </Button>
          </div>
          <img
            src={SOLUTION_PHOTOS[solution.slug]}
            alt={solution.media[0].alt}
            className="aspect-[4/3] w-full rounded-sm object-cover"
          />
        </div>
      </Section>

      {/* education */}
      <Section tone="cream" width="content">
        <DisplayTitle as="h2" step="md">
          {t('marketing.sol.understandHeading')}
        </DisplayTitle>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {solution.education.map((e, i) => {
            const photo = EDUCATION_PHOTOS[`${solution.slug}:${e.id}`];
            return (
              <div key={e.id} className="flex flex-col gap-3">
                <img src={photo} alt="" aria-hidden className="aspect-[4/3] w-full rounded-sm object-cover" />
                <div className="flex flex-row items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-accent font-display text-sm text-accent">
                    {i + 1}
                  </span>
                  <p className="font-display text-md text-foreground">{pickLocalized(e.title, cl)}</p>
                </div>
                <p className="font-body text-sm text-muted-foreground">{pickLocalized(e.body, cl)}</p>
              </div>
            );
          })}
        </div>
      </Section>

      {/* severity levels */}
      <Section tone="grid" width="content">
        <DisplayTitle as="h2" step="md" className="max-w-2xl">
          {pickLocalized(solution.severityHeading, cl)}
        </DisplayTitle>
        <Prose className="mt-4 max-w-2xl">{pickLocalized(solution.severityNote, cl)}</Prose>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {solution.severityLevels.map((lvl) => {
            const photo = SEVERITY_PHOTOS[`${solution.slug}:${lvl.id}`];
            return (
              <div key={lvl.id} className="flex flex-col gap-4 text-center">
                <img src={photo} alt="" aria-hidden className="aspect-[3/4] w-full rounded-sm object-cover" />
                <div className="flex flex-col gap-2">
                  <h3 className="u-caps font-body text-sm text-foreground">{pickLocalized(lvl.title, cl)}</h3>
                  <p className="font-body text-sm text-muted-foreground">{pickLocalized(lvl.description, cl)}</p>
                </div>
              </div>
            );
          })}
        </div>
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
              mediaLabel={`${p.name}: product photography`}
              image={PRODUCT_PHOTOS[p.slug]}
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
          <Button to={EXTERNAL_ASSESSMENT_URL} external size="lg" caps className="w-full sm:w-auto">
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
      <Section tone="teal" width="content" animate={false} className="py-12 md:py-24 text-center">
        <DisplayTitle as="h1" step="md" align="center" className="mx-auto !font-normal max-w-2xl">
          {t('marketing.sol.indexHeading')}
        </DisplayTitle>
        <Prose size="lg" className="mx-auto mt-4 text-center text-ink-foreground/75">
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
