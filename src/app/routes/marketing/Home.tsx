import { useT, useContentLocale, useLocalizedPath } from '@/i18n/LocaleProvider';
import {
  Section,
  DisplayTitle,
  Prose,
  Eyebrow,
  Button,
  StrandMark,
  MediaPlaceholder,
  ConcernCard,
  IngredientCard,
  ProgramCard,
  ScanCard,
  Accordion,
  Timeline,
  BeforeAfterSlider,
  Card,
} from '@/app/components/roote';
import { PATHS } from '@/app/paths';
import { pickLocalized } from '@/content/localized';
import { brandLines, systemSteps } from '@/content/brand';
import { CONCERN_OPTIONS } from '@/content/assessment';
import { getProduct } from '@/content/products';
import { getSolution } from '@/content/solutions';
import { PROGRAM_DURATIONS, HEADLINE_DURATIONS, DURATION_TIER_LABEL } from '@/content/programs';
import { HOME_FAQS } from '@/content/faqs';

/* 1 — Hero ----------------------------------------------------------------- */
function Hero() {
  const t = useT();
  const cl = useContentLocale();
  const withLocale = useLocalizedPath();
  const [line1, line2] = pickLocalized(brandLines.headline, cl).split('\n');
  return (
    <Section tone="teal" width="content" animate={false} className="overflow-hidden">
      <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="flex flex-col items-start gap-6">
          <Eyebrow onDark>{t('marketing.home.hero.eyebrow')}</Eyebrow>
          <h1
            className="text-display font-semibold text-cream-100"
            style={{ fontSize: 'clamp(2.75rem, 7vw, 5rem)' }}
          >
            {line1}
            <br />
            <span className="text-cream-100/55">{line2}</span>
          </h1>
          <Prose onDark size="lg" className="max-w-xl">
            {t('marketing.home.hero.support')}
          </Prose>
          <div className="flex flex-wrap items-center gap-3">
            <Button to={withLocale(PATHS.analysis)} size="lg" caps>
              {t('marketing.nav.cta')}
            </Button>
            <Button
              to={withLocale(PATHS.howItWorks)}
              size="lg"
              variant="secondary"
              className="border-cream-100/30 text-cream-100 hover:border-cream-100"
            >
              {t('marketing.nav.secondaryCta')}
            </Button>
          </div>
        </div>
        <div className="relative">
          <MediaPlaceholder
            kind="image"
            tone="cream"
            ratio="4 / 5"
            alt={t('marketing.home.hero.mediaAlt')}
            label="ROOTÉ hero product system, dark-teal men's pack + cream women's pack, clinical studio light"
          />
          <StrandMark
            size={64}
            variant="solid"
            className="absolute -bottom-6 -start-6 text-accent drop-shadow-lg"
          />
        </div>
      </div>
    </Section>
  );
}

/* 2 — Trust / system strip ---------------------------------------------- */
function SystemStrip() {
  const t = useT();
  const items = [
    t('marketing.home.strip.item1'),
    t('marketing.home.strip.item2'),
    t('marketing.home.strip.item3'),
    t('marketing.home.strip.item4'),
  ];
  return (
    <Section tone="plain" space="tight" width="content" animate={false}>
      <ul className="grid gap-x-8 gap-y-3 font-body text-sm text-muted-foreground sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent" />
            {item}
          </li>
        ))}
      </ul>
    </Section>
  );
}

/* 3 — Choose your concern --------------------------------------------- */
function Concern() {
  const t = useT();
  const cl = useContentLocale();
  const withLocale = useLocalizedPath();
  const media: Record<string, string> = {
    thinning: t('marketing.home.concern.thinningMediaAlt'),
    gray: t('marketing.home.concern.grayMediaAlt'),
    both: t('marketing.home.concern.bothMediaAlt'),
  };
  return (
    <Section tone="cream" width="content">
      <DisplayTitle as="h2" step="lg">
        {t('marketing.home.concern.heading')}
      </DisplayTitle>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {CONCERN_OPTIONS.map((c) => (
          <ConcernCard
            key={c.value}
            title={pickLocalized(c.title, cl)}
            description={pickLocalized(c.description, cl)}
            to={withLocale(`${PATHS.analysis}?concern=${c.value}`)}
            cta={t('marketing.home.concern.cta')}
            mediaAlt={media[c.value]}
            mediaLabel={`${pickLocalized(c.title, cl)} — clinical crop, no face`}
          />
        ))}
      </div>
    </Section>
  );
}

/* 4 — How ROOTÉ works (the 5-step sequence) --------------------------- */
function HowItWorksSection() {
  const t = useT();
  const cl = useContentLocale();
  return (
    <Section tone="grid" width="content">
      <Eyebrow>{t('marketing.home.how.eyebrow')}</Eyebrow>
      <DisplayTitle as="h2" step="lg" className="mt-2 max-w-2xl">
        {t('marketing.home.how.heading')}
      </DisplayTitle>
      <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
        {systemSteps.map((step) => (
          <li key={step.key} className="flex flex-col gap-2">
            <span className="font-display text-2xl text-accent">{String(step.n).padStart(2, '0')}</span>
            <p className="font-display text-md text-foreground">{pickLocalized(step.title, cl)}</p>
            <p className="font-body text-sm text-muted-foreground">{pickLocalized(step.body, cl)}</p>
          </li>
        ))}
      </ol>
      <MediaPlaceholder
        kind="animation"
        tone="cream"
        ratio="21 / 9"
        className="mt-12"
        alt={t('marketing.home.how.mediaAlt')}
        label="Analyze → Understand → Personalize → Treat → Track, animated"
      />
    </Section>
  );
}

/* 5 — ROOTÉ hair analysis (data-as-surface) -------------------------- */
function Analysis() {
  const t = useT();
  const withLocale = useLocalizedPath();
  return (
    <Section tone="teal" width="content">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div className="flex flex-col items-start gap-4">
          <Eyebrow onDark>{t('marketing.home.analysis.eyebrow')}</Eyebrow>
          <DisplayTitle as="h2" step="lg" onDark>
            {t('marketing.home.analysis.heading')}
          </DisplayTitle>
          <Prose onDark size="lg" className="max-w-lg">
            {t('marketing.home.analysis.body')}
          </Prose>
          <Button to={withLocale(PATHS.analysis)} caps className="mt-2">
            {t('marketing.nav.cta')}
          </Button>
        </div>
        <ScanCard
          tone="dark"
          title={t('marketing.home.analysis.cardTitle')}
          rows={[
            { label: t('marketing.home.analysis.rowDensity'), value: null, pendingLabel: 'density' },
            { label: t('marketing.home.analysis.rowPattern'), value: null, pendingLabel: 'pattern' },
            { label: t('marketing.home.analysis.rowProgression'), value: null, pendingLabel: 'progression' },
          ]}
          footnote={t('marketing.home.analysis.disclaimer')}
        />
      </div>
    </Section>
  );
}

/* 6 — Personalized system (men teal / women cream) ------------------ */
function PersonalizedSystem() {
  const t = useT();
  return (
    <Section tone="cream" width="content">
      <Eyebrow>{t('marketing.home.system.eyebrow')}</Eyebrow>
      <DisplayTitle as="h2" step="lg" className="mt-2 max-w-2xl">
        {t('marketing.home.system.heading')}
      </DisplayTitle>
      <Prose className="mt-4 max-w-2xl">{t('marketing.home.system.body')}</Prose>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <Card padded={false} className="overflow-hidden" data-pack="men">
          <MediaPlaceholder
            tone="teal"
            ratio="4 / 3"
            rounded="none"
            alt={t('marketing.home.system.menMediaAlt')}
            label="Men's dark-teal ROOTÉ system"
          />
          <p className="p-5 font-display text-md text-foreground">{t('marketing.home.system.men')}</p>
        </Card>
        <Card padded={false} className="overflow-hidden" data-pack="women">
          <MediaPlaceholder
            tone="cream"
            ratio="4 / 3"
            rounded="none"
            alt={t('marketing.home.system.womenMediaAlt')}
            label="Women's cream ROOTÉ system"
          />
          <p className="p-5 font-display text-md text-foreground">{t('marketing.home.system.women')}</p>
        </Card>
      </div>
    </Section>
  );
}

/* 7 — Density system (severity levels, no auto-prescription) -------- */
function DensitySystem() {
  const t = useT();
  const cl = useContentLocale();
  const thinning = getSolution('thinning')!;
  return (
    <Section tone="grid" width="content">
      <Eyebrow>{t('marketing.home.density.eyebrow')}</Eyebrow>
      <DisplayTitle as="h2" step="lg" className="mt-2 max-w-2xl">
        {t('marketing.home.density.heading')}
      </DisplayTitle>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {thinning.severityLevels.map((lvl) => (
          <Card key={lvl.id}>
            <p className="font-display text-md text-foreground">{pickLocalized(lvl.title, cl)}</p>
            <p className="mt-2 font-body text-sm text-muted-foreground">{pickLocalized(lvl.description, cl)}</p>
          </Card>
        ))}
      </div>
      <p className="mt-6 max-w-2xl font-body text-xs text-muted-foreground">{t('marketing.home.density.note')}</p>
    </Section>
  );
}

/* 8 — Gray system ---------------------------------------------------- */
function GraySystem() {
  const t = useT();
  const cl = useContentLocale();
  const support = getProduct('gray-support')!;
  const serum = getProduct('gray-serum')!;
  return (
    <Section tone="cream" width="content">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div>
          <Eyebrow>{t('marketing.home.gray.eyebrow')}</Eyebrow>
          <DisplayTitle as="h2" step="lg" className="mt-2">
            {t('marketing.home.gray.heading')}
          </DisplayTitle>
          <Prose className="mt-4 max-w-lg">{t('marketing.home.gray.body')}</Prose>
          <div className="mt-6 flex flex-col gap-3">
            {[support, serum].map((p) => (
              <div key={p.slug} className="rounded-lg border border-border bg-card p-4">
                <p className="font-display text-sm text-foreground">{p.name}</p>
                <p className="mt-0.5 font-body text-xs text-muted-foreground">{pickLocalized(p.subtitle, cl)}</p>
              </div>
            ))}
            <p className="font-body text-xs text-muted-foreground">{t('marketing.home.gray.bundle')}</p>
          </div>
        </div>
        <MediaPlaceholder
          tone="cream"
          ratio="4 / 5"
          alt={t('marketing.home.gray.mediaAlt')}
          label="Gray Support supplement + Gray Serum bundle"
        />
      </div>
    </Section>
  );
}

/* 9 — Science / formula ------------------------------------------------ */
function ScienceSection() {
  const t = useT();
  const cl = useContentLocale();
  const groups: Array<{ label: string; slug: string }> = [
    { label: t('marketing.home.science.groupDensity'), slug: 'density-10' },
    { label: t('marketing.home.science.groupGray'), slug: 'gray-serum' },
    { label: t('marketing.home.science.groupShampoo'), slug: 'regrowth-shampoo' },
  ];
  return (
    <Section tone="teal" width="content">
      <Eyebrow onDark>{t('marketing.home.science.eyebrow')}</Eyebrow>
      <DisplayTitle as="h2" step="lg" onDark className="mt-2">
        {t('marketing.home.science.heading')}
      </DisplayTitle>
      <div className="mt-10 flex flex-col gap-10">
        {groups.map((g) => {
          const product = getProduct(g.slug)!;
          return (
            <div key={g.slug}>
              <p className="u-caps font-body text-2xs font-semibold text-cream-100/60">{g.label}</p>
              <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {product.ingredients.slice(0, 4).map((ing) => (
                  <IngredientCard
                    key={ing.name}
                    name={ing.name}
                    note={pickLocalized(ing.note, cl)}
                    status={ing.claimStatus}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-8 font-body text-xs text-cream-100/60">{t('marketing.home.science.note')}</p>
    </Section>
  );
}

/* 10 — ROOTÉ Progress ---------------------------------------------- */
function ProgressSection() {
  const t = useT();
  const withLocale = useLocalizedPath();
  const milestones = [
    { id: 'd0', dayLabel: 'Day 0', title: t('marketing.home.progress.baseline'), state: 'done' as const },
    { id: 'd30', dayLabel: 'Day 30', title: t('marketing.home.progress.progressPhoto'), state: 'done' as const },
    { id: 'd60', dayLabel: 'Day 60', title: t('marketing.home.progress.progressPhoto'), state: 'current' as const },
    { id: 'd90', dayLabel: 'Day 90', title: t('marketing.home.progress.progressScan'), state: 'upcoming' as const },
    { id: 'd180', dayLabel: 'Day 180', title: t('marketing.home.progress.finalScan'), state: 'upcoming' as const },
  ];
  return (
    <Section tone="cream" width="content">
      <Eyebrow>{t('marketing.home.progress.eyebrow')}</Eyebrow>
      <DisplayTitle as="h2" step="lg" className="mt-2 max-w-2xl">
        {t('marketing.home.progress.heading')}
      </DisplayTitle>
      <Prose className="mt-4 max-w-2xl">{t('marketing.home.progress.body')}</Prose>
      <div className="mt-10 grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <Timeline milestones={milestones} />
        <div>
          <BeforeAfterSlider
            ariaLabel={`${t('marketing.home.progress.before')} / ${t('marketing.home.progress.after')}`}
            beforeLabel={t('marketing.home.progress.before')}
            afterLabel={t('marketing.home.progress.after')}
            before={
              <MediaPlaceholder
                tone="cream"
                ratio="4 / 3"
                rounded="none"
                alt={t('marketing.home.progress.beforeMediaAlt')}
                label="Baseline scan"
              />
            }
            after={
              <MediaPlaceholder
                tone="teal"
                ratio="4 / 3"
                rounded="none"
                alt={t('marketing.home.progress.afterMediaAlt')}
                label="Final scan"
              />
            }
          />
          <p className="mt-2 font-body text-xs text-muted-foreground">{t('marketing.home.progress.compareCaption')}</p>
          <Button to={withLocale(PATHS.system)} variant="secondary" size="sm" className="mt-4">
            {t('marketing.home.progress.cta')}
          </Button>
        </div>
      </div>
    </Section>
  );
}

/* 11 — Program durations ------------------------------------------- */
function Durations() {
  const t = useT();
  const cl = useContentLocale();
  const includes = [
    t('marketing.home.durations.includesDensity'),
    t('marketing.home.durations.includesShampoo'),
    t('marketing.home.durations.includesTracking'),
  ];
  const headline = PROGRAM_DURATIONS.filter((d) => HEADLINE_DURATIONS.includes(d.days));
  return (
    <Section tone="grid" width="content">
      <Eyebrow>{t('marketing.home.durations.eyebrow')}</Eyebrow>
      <DisplayTitle as="h2" step="lg" className="mt-2 max-w-2xl">
        {t('marketing.home.durations.heading')}
      </DisplayTitle>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {headline.map((d) => (
          <ProgramCard
            key={d.days}
            durationLabel={pickLocalized(d.label, cl)}
            tierLabel={pickLocalized(DURATION_TIER_LABEL[d.tier], cl)}
            emphasised={d.tier === 'recommended'}
            priceLabel={d.price === null ? null : String(d.price)}
            perDayLabel={d.perDay === null ? null : String(d.perDay)}
            includes={includes}
            selectLabel={t('marketing.nav.cta')}
          />
        ))}
      </div>
      <p className="mt-6 font-body text-xs text-muted-foreground">{t('marketing.home.durations.note')}</p>
    </Section>
  );
}

/* 12 — Results / proof (placeholders only) ----------------------- */
function Results() {
  const t = useT();
  return (
    <Section tone="cream" width="content">
      <Eyebrow>{t('marketing.home.results.eyebrow')}</Eyebrow>
      <DisplayTitle as="h2" step="lg" className="mt-2 max-w-2xl">
        {t('marketing.home.results.heading')}
      </DisplayTitle>
      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex flex-col gap-2">
            <MediaPlaceholder
              tone="card"
              ratio="4 / 3"
              alt={t('marketing.home.results.mediaAlt')}
              label="Verified ROOTÉ before / after — reserved"
            />
            <p className="font-body text-xs text-muted-foreground">{t('marketing.home.results.empty')}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* 13 — FAQ -------------------------------------------------------- */
function Faqs() {
  const t = useT();
  const cl = useContentLocale();
  return (
    <Section tone="plain" width="readable">
      <Eyebrow>{t('marketing.home.faq.eyebrow')}</Eyebrow>
      <DisplayTitle as="h2" step="md" className="mt-2">
        {t('marketing.home.faq.heading')}
      </DisplayTitle>
      <Accordion
        className="mt-8"
        items={HOME_FAQS.map((f) => ({
          id: f.id,
          title: pickLocalized(f.q, cl),
          body: pickLocalized(f.a, cl),
        }))}
      />
    </Section>
  );
}

/* 14 — Final CTA ------------------------------------------------- */
function FinalCta() {
  const t = useT();
  const withLocale = useLocalizedPath();
  return (
    <Section tone="teal" width="readable" className="text-center">
      <div className="flex flex-col items-center gap-5">
        <StrandMark size={48} variant="solid" className="text-accent" />
        <DisplayTitle as="h2" step="xl" onDark align="center">
          {t('marketing.home.finalCta.heading')}
        </DisplayTitle>
        <Prose onDark size="lg" className="mx-auto text-center">
          {t('marketing.home.finalCta.body')}
        </Prose>
        <Button to={withLocale(PATHS.analysis)} size="lg" caps>
          {t('marketing.nav.cta')}
        </Button>
      </div>
    </Section>
  );
}

export function Home() {
  return (
    <>
      <Hero />
      <SystemStrip />
      <Concern />
      <HowItWorksSection />
      <Analysis />
      <PersonalizedSystem />
      <DensitySystem />
      <GraySystem />
      <ScienceSection />
      <ProgressSection />
      <Durations />
      <Results />
      <Faqs />
      <FinalCta />
    </>
  );
}
