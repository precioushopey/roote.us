import { useParams } from 'react-router';
import { useT, useLocale, useLocalizedPath } from '@/i18n/LocaleProvider';
import {
  Section,
  SectionIntro,
  Button,
  Card,
  ProductCard,
  Hero,
  CtaSection,
  MediaCaption,
} from '@/app/components/roote';
import { PATHS } from '@/app/paths';
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
  const cl = useLocale().locale;
  const withLocale = useLocalizedPath();
  const solution = slug ? getSolution(slug) : undefined;

  if (!solution) return <PagePlaceholder title="Solution" body="This solution page could not be found." />;

  const program = PROGRAMS[solution.relatedProgram];
  const products = solution.relatedProducts.map(getProduct).filter((p): p is NonNullable<typeof p> => !!p);

  return (
    <>
      {/* hero */}
      <Hero
        title={pickLocalized(solution.hero.title, cl)}
        body={pickLocalized(solution.hero.body, cl)}
        cta={
          <Button to={withLocale(PATHS.analysis)} caps className="w-full sm:w-auto">
            {t('marketing.nav.cta')}
          </Button>
        }
        image={{
          src: SOLUTION_PHOTOS[solution.slug],
          alt: solution.media[0].alt,
          className: 'aspect-[4/3] w-full rounded-sm object-cover',
        }}
      />

      {/* education */}
      <Section tone="cream" width="content" gap={8}>
        <SectionIntro
          titleStep="md"
          title={t('marketing.sol.understandHeading')}
          body={t('marketing.sol.understandBody')}
        />
        <div className="grid sm:grid-cols-3 gap-4 sm:gap-8">
          {solution.education.map((e, i) => {
            const photo = EDUCATION_PHOTOS[`${solution.slug}:${e.id}`];
            return (
              <div key={e.id} className="flex flex-col gap-4 lg:gap-8">
                <img src={photo} alt="" aria-hidden loading="lazy" className="aspect-square w-full rounded-sm object-cover" />
                <div className="flex flex-col gap-1">
                  <div className="flex flex-row items-baseline gap-2">
                    <span className="shrink-0 font-display text-lg lg:text-xl text-accent">{i + 1}.</span>
                    <p className="font-display text-lg lg:text-xl text-foreground">{pickLocalized(e.title, cl)}</p>
                  </div>
                  <p className="font-body text-sm lg:text-base text-muted-foreground">{pickLocalized(e.body, cl)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* severity levels */}
      <Section tone="grid" width="content" gap={8} className="-mt-24">
        <SectionIntro
          titleStep="md"
          title={pickLocalized(solution.severityHeading, cl)}
          body={pickLocalized(solution.severityNote, cl)}
        />
        <div className="grid sm:grid-cols-3 gap-4 sm:gap-8">
          {solution.severityLevels.map((lvl) => {
            const photo = SEVERITY_PHOTOS[`${solution.slug}:${lvl.id}`];
            return (
              <MediaCaption
                key={lvl.id}
                media={<img src={photo} alt="" aria-hidden loading="lazy" className="aspect-square w-full rounded-sm object-cover" />}
                title={pickLocalized(lvl.title, cl)}
                description={pickLocalized(lvl.description, cl)}
              />
            );
          })}
        </div>
      </Section>

      {/* the system + related products */}
      <Section tone="cream" width="content" gap={8} className="-mt-24">
        <SectionIntro
          titleStep="md"
          eyebrow={t('marketing.sol.systemEyebrow')}
          title={pickLocalized(program.name, cl)}
          body={pickLocalized(program.summary, cl)}
        />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
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
      <CtaSection title={t('marketing.sol.ctaHeading')} />
    </>
  );
}

/** `/solutions` hub. */
export function SolutionsIndex() {
  const t = useT();
  const cl = useLocale().locale;
  const withLocale = useLocalizedPath();
  const solutions = (['thinning', 'gray-hair'] as const).map(getSolution).filter((s): s is NonNullable<typeof s> => !!s);
  return (
    <>
      <Hero
        titleWeight="normal"
        title={t('marketing.sol.indexHeading')}
        body={t('marketing.sol.indexBody')}
      />
      
      <Section tone="cream" width="content">
        <div className="grid gap-8 md:grid-cols-2">
          {solutions.map((s) => (
            <Card key={s.slug} padded={false} className="overflow-hidden">
              <img src={SOLUTION_PHOTOS[s.slug]} alt={s.media[0].alt} loading="lazy" className="aspect-video w-full object-cover" />
              <div className="p-6">
                <h2 className="font-display text-lg text-foreground">{pickLocalized(s.hero.title, cl)}</h2>
                <p className="mt-2 font-body text-sm text-muted-foreground">{pickLocalized(s.hero.body, cl)}</p>
                <Button
                  to={withLocale(s.slug === 'thinning' ? PATHS.solutionThinning : PATHS.solutionGray)}
                  variant="secondary"
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
