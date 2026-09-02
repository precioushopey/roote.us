import { useState } from 'react';
import { Link } from 'react-router';
import { useT } from '@/i18n/LocaleProvider';
import { Section } from '@/app/components/marketing/Section';
import { Eyebrow } from '@/app/components/marketing/Eyebrow';
import { DisplayHeading } from '@/app/components/marketing/DisplayHeading';
import { Prose } from '@/app/components/marketing/Prose';
import { CtaButton } from '@/app/components/marketing/CtaButton';
import { CtaBand } from '@/app/components/marketing/CtaBand';
import { rooteContent } from '@/content/roote.config';
import heroPeople from '@/assets/hero-people.png';
import stepQuiz from '@/assets/step-quiz.jpg';
import stepPhotoScan from '@/assets/step-photo-scan.jpg';
import scanDevice from '@/assets/scan-device.jpg';
import bannerSquare from '@/assets/BANNERS/BANNER SQUARE SIZE.png';
import objectiveMeasurement4 from '@/assets/OBJECTIVE MEASUREMENT/OBJECTIVE MEASUREMENT 4.png';
import productLineup from '@/assets/product-lineup.png';
import hairCuticle from '@/assets/hair-cuticle.jpg';
import productPhoto from '@/assets/product.png';
import productBg from '@/assets/product_bg.jpg';
import beforeResult from '@/assets/BEFORE AND AFTER RESULT/BEFORE.png';
import afterResult from '@/assets/BEFORE AND AFTER RESULT/AFTER.png';
import beforeResult1 from '@/assets/BEFORE AND AFTER RESULT/BEFORE 1.png';
import afterResult1 from '@/assets/BEFORE AND AFTER RESULT/AFTER 1.png';
import beforeResult2 from '@/assets/BEFORE AND AFTER RESULT/BEFORE 2.png';
import afterResult2 from '@/assets/BEFORE AND AFTER RESULT/AFTER 2.png';

const ROLE_KEYS = {
  'regrowth-stimulant': 'marketing.home.products.role.regrowth-stimulant',
  'dht-blocker': 'marketing.home.products.role.dht-blocker',
  'dht-support': 'marketing.home.products.role.dht-support',
  'proprietary-support': 'marketing.home.products.role.proprietary-support',
} as const;

function Hero() {
  const t = useT();
  return (
    <Section tone="ink" className="overflow-hidden pt-20 md:pt-24">
      <div className="flex flex-col items-center">
        <Eyebrow onInk className="text-[0.625rem] tracking-[0.12em] sm:text-xs sm:tracking-[0.18em]">
          {t('marketing.home.hero.eyebrow')}
        </Eyebrow>
        <h1
          className="mt-2 select-none text-center font-display font-medium uppercase leading-[0.9] tracking-[-0.02em] text-ink-foreground"
          style={{ fontSize: 'clamp(3.5rem, 13vw, 11rem)' }}
        >
          {t('marketing.home.hero.title')}
        </h1>

        <div className="relative -mt-10 w-full max-w-4xl sm:-mt-16 md:-mt-24">
          <img
            src={heroPeople}
            alt=""
            className="img-editorial w-full rounded-2xl object-cover"
            style={{ aspectRatio: '16 / 10' }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-t from-ink via-ink/70 to-transparent"
          />
          {/* Overlay copy group: nudge vertical position with the bottom-* utilities below. */}
          <div className="absolute inset-x-0 -bottom-12 flex flex-col items-center gap-2 px-4 text-center sm:-bottom-6 sm:gap-3 sm:px-10 md:bottom-0 md:gap-4 lg:bottom-4">
            <p className="font-display text-base font-medium uppercase tracking-wide text-ink-foreground sm:text-2xl md:text-3xl">
              {t('marketing.home.hero.titleGhost')}
            </p>
            <Prose size="l" onInk className="max-w-md text-xs sm:text-base md:text-[1.0625rem]">
              {t('marketing.home.hero.body')}
            </Prose>
            <CtaButton to="/diagnosis" size="lg" className="w-full sm:w-auto">
              {t('marketing.nav.cta')}
            </CtaButton>
          </div>
        </div>
      </div>
    </Section>
  );
}

function FeaturedFormula() {
  const t = useT();
  return (
    <Section className="overflow-hidden">
      <div className="grid grid-cols-3 items-center">
        <Link to="/products" className="justify-self-start">
          <Eyebrow>{t('marketing.home.featured.eyebrowLeft')}</Eyebrow>
        </Link>
        <span aria-hidden className="text-center text-2xl tracking-[0.18em] text-accent">01</span>
        <Link to="/science" className="justify-self-end">
          <Eyebrow className="text-end">{t('marketing.home.featured.eyebrowRight')}</Eyebrow>
        </Link>
      </div>
      <h2
        className="mt-4 select-none whitespace-normal text-center font-display font-medium uppercase leading-none tracking-[-0.02em] text-foreground sm:whitespace-nowrap"
        style={{ fontSize: 'clamp(1.5rem, 8.5vw, 7.125rem)' }}
      >
        {t('marketing.home.featured.title')}
      </h2>

      <div className="relative mt-8 grid grid-cols-1 items-center gap-8 md:mt-4 md:grid-cols-[0.8fr_1.2fr_0.8fr] md:gap-6">
        <div className="flex flex-col items-start gap-3">
          <img
            src={bannerSquare}
            alt=""
            className="img-editorial mt-6 aspect-[4/5] w-full rounded-xl object-cover shadow-sm sm:mt-10 sm:max-w-[220px] md:mt-14"
          />
          <Prose>{t('marketing.home.featured.item1.label')}</Prose>
        </div>

        <div className="relative z-10 -mt-6 sm:-mt-10 md:-mt-16">
          <img
            src={productLineup}
            alt=""
            className="img-editorial mx-auto w-full max-w-lg rounded-2xl object-cover shadow-lg"
          />
        </div>

        <div className="flex flex-col-reverse items-start gap-3 md:flex-col md:items-end md:text-end">
          <Prose className="md:ms-auto">{t('marketing.home.featured.item2.label')}</Prose>
          <img
            src={objectiveMeasurement4}
            alt=""
            className="img-editorial aspect-[4/5] w-full rounded-xl object-cover shadow-sm sm:max-w-[220px]"
          />
        </div>
      </div>
    </Section>
  );
}

function HowItWorksSteps() {
  const t = useT();
  const steps = [
    { photo: stepQuiz, title: t('marketing.home.how.step1.title'), body: t('marketing.home.how.step1.body') },
    { photo: stepPhotoScan, title: t('marketing.home.how.step2.title'), body: t('marketing.home.how.step2.body') },
    { photo: scanDevice, title: t('marketing.home.how.step3.title'), body: t('marketing.home.how.step3.body') },
    { photo: productBg, title: t('marketing.home.how.step4.title'), body: t('marketing.home.how.step4.body') },
  ];
  return (
    <Section className="pt-0">
      <div className="flex items-center justify-between gap-4">
        <span aria-hidden className="text-2xl tracking-[0.18em] text-accent">02</span>
        <Link to="/how-it-works" className="shrink-0">
          <Eyebrow>{t('marketing.home.how.cta')}</Eyebrow>
        </Link>
      </div>
      <h2
        className="mt-4 select-none whitespace-normal text-start font-display font-medium uppercase leading-none tracking-[-0.02em] text-foreground sm:whitespace-nowrap"
        style={{ fontSize: 'clamp(2rem, 10vw, 7.125rem)' }}
      >
        {t('marketing.home.how.title')}
      </h2>
      <ol className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, i) => (
          <li key={step.title} className="flex flex-col gap-3">
            <img src={step.photo} alt="" className="img-editorial aspect-square w-full rounded-xl object-cover" />
            <div className="flex flex-row items-baseline gap-2 sm:flex-col sm:gap-1">
              <span className="text-xs font-medium tracking-[0.18em] text-accent">0{i + 1}</span>
              <p className="font-display text-lg font-medium">{step.title}</p>
            </div>
            <Prose>{step.body}</Prose>
          </li>
        ))}
      </ol>
      <div className="mt-12 flex justify-center">
        <CtaButton to="/diagnosis" size="lg">{t('marketing.home.how.getStarted')}</CtaButton>
      </div>
    </Section>
  );
}

const BEFORE_AFTER_PAIRS = [
  { before: beforeResult, after: afterResult },
  { before: beforeResult1, after: afterResult1 },
  { before: beforeResult2, after: afterResult2 },
];

const ARROW_CLASS =
  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ink-foreground/30 text-ink-foreground transition-colors hover:border-ink-foreground';

function ClinicalResults() {
  const t = useT();
  const [active, setActive] = useState(0);
  const pair = BEFORE_AFTER_PAIRS[active];
  const prev = () => setActive((i) => (i - 1 + BEFORE_AFTER_PAIRS.length) % BEFORE_AFTER_PAIRS.length);
  const next = () => setActive((i) => (i + 1) % BEFORE_AFTER_PAIRS.length);

  return (
    <Section tone="ink">
      <div className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <span aria-hidden className="text-2xl tracking-[0.18em] text-accent">03</span>
          <DisplayHeading
            as="h2"
            size="m"
            onInk
            text={`${t('marketing.home.clinical.title')} ${t('marketing.home.clinical.titleGhost')}`}
            className="uppercase leading-none tracking-[-0.02em]"
          />
        </div>
        <div className="hidden shrink-0 items-center gap-2 sm:flex">
          <button type="button" onClick={prev} aria-label={t('marketing.home.clinical.prev')} className={ARROW_CLASS}>
            ‹
          </button>
          <button type="button" onClick={next} aria-label={t('marketing.home.clinical.next')} className={ARROW_CLASS}>
            ›
          </button>
        </div>
      </div>
      <Prose size="l" onInk className="mt-4 max-w-xl">{t('marketing.home.clinical.body')}</Prose>

      <div className="relative mt-10">
        <div className="grid grid-cols-2 gap-3 sm:gap-6">
          <div className="relative">
            <img
              src={pair.before}
              alt={t('marketing.home.research.beforeLabel')}
              className="img-editorial aspect-[4/3] w-full rounded-xl object-cover"
            />
            <span className="absolute bottom-4 end-4 rounded-full bg-background/90 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-foreground shadow-sm">
              {t('marketing.home.research.beforeLabel')}
            </span>
          </div>
          <div className="relative">
            <img
              src={pair.after}
              alt={t('marketing.home.research.afterLabel')}
              className="img-editorial aspect-[4/3] w-full rounded-xl object-cover"
            />
            <span className="absolute bottom-4 end-4 rounded-full bg-background/90 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-foreground shadow-sm">
              {t('marketing.home.research.afterLabel')}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={prev}
          aria-label={t('marketing.home.clinical.prev')}
          className={`${ARROW_CLASS} sm:hidden`}
        >
          ‹
        </button>
        {BEFORE_AFTER_PAIRS.map((p, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`${t('marketing.home.clinical.goTo')} ${i + 1}`}
            aria-current={i === active}
            className={`h-10 w-10 shrink-0 overflow-hidden rounded-full ring-2 transition-colors ${i === active ? 'ring-accent' : 'ring-transparent'}`}
          >
            <img src={p.before} alt="" className="img-editorial h-full w-full object-cover" />
          </button>
        ))}
        <button
          type="button"
          onClick={next}
          aria-label={t('marketing.home.clinical.next')}
          className={`${ARROW_CLASS} sm:hidden`}
        >
          ›
        </button>
      </div>
    </Section>
  );
}

function ProductComponents() {
  const t = useT();
  const profiles = [
    t('marketing.home.rootCause.profile1.label'),
    t('marketing.home.rootCause.profile2.label'),
    t('marketing.home.rootCause.profile3.label'),
  ];
  const roles = rooteContent.formula.ingredients.map((ing) => t(ROLE_KEYS[ing.role as keyof typeof ROLE_KEYS]));
  return (
    <Section className="text-center">
      <div className="flex items-center justify-between gap-6">
        <div className="shrink-0 whitespace-nowrap">
          <Link to="/products">
            <Eyebrow>{t('marketing.home.products.cta')}</Eyebrow>
          </Link>
        </div>
        <span aria-hidden className="text-2xl tracking-[0.18em] text-accent">04</span>
      </div>
      <h2
        className="mt-4 select-none whitespace-normal text-end font-display font-medium uppercase leading-none tracking-[-0.02em] text-foreground sm:whitespace-nowrap"
        style={{ fontSize: 'clamp(1.5rem, 7.2vw, 5.9rem)' }}
      >
        {t('marketing.home.products.title')}
      </h2>
      <Prose size="l" className="ms-auto mt-4 max-w-xl text-end">{t('marketing.home.products.body')}</Prose>
      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {rooteContent.formula.ingredients.map((ing) => (
          <div key={ing.key} className="rounded-xl border border-border bg-background p-6 text-start">
            <p className="font-display text-lg font-medium">{ing.name}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.1em] text-muted-foreground">
              {t(ROLE_KEYS[ing.role as keyof typeof ROLE_KEYS])}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {profiles.map((label) => (
          <div key={label} className="rounded-xl border border-border bg-background p-6 text-start">
            <p className="font-display text-base font-medium">{label}</p>
            <p className="mt-3 text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
              {t('marketing.home.rootCause.addresses')}
            </p>
            <ul className="mt-2 flex flex-col gap-1">
              {roles.map((role) => (
                <li key={role} className="text-sm text-foreground">{role}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}

function Research() {
  const t = useT();
  return (
    <Section className="overflow-hidden border-t border-border pt-0">
      <div className="flex justify-end">
        <Link to="/science">
          <Eyebrow>{t('marketing.nav.science')}</Eyebrow>
        </Link>
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-2">
        <span aria-hidden className="shrink-0 text-2xl tracking-[0.18em] text-accent">05</span>
        <h2
          className="select-none whitespace-nowrap text-end font-display font-medium uppercase leading-none tracking-[-0.02em] text-foreground"
          style={{ fontSize: 'clamp(1.75rem, 8.5vw, 7.125rem)' }}
        >
          {t('marketing.home.research.title')}
        </h2>
      </div>
      <div className="relative z-10 mt-8 grid grid-cols-1 items-center gap-8 lg:-mt-6 lg:grid-cols-2">
        <div className="flex flex-col items-start gap-4">
          <Prose size="l" className="max-w-md">{t('marketing.home.research.body')}</Prose>
        </div>
        <img
          src={hairCuticle}
          alt={t('marketing.home.research.imageAlt')}
          className="img-editorial mx-auto w-full max-w-md rounded-2xl object-cover shadow-lg lg:ms-auto"
        />
      </div>
    </Section>
  );
}

export function Home() {
  return (
    <>
      <Hero />
      <FeaturedFormula />
      <HowItWorksSteps />
      <ClinicalResults />
      <ProductComponents />
      <Research />
      <CtaBand
        headingKey="marketing.cta.default.title"
        checklistKeys={['marketing.cta.default.item1', 'marketing.cta.default.item2', 'marketing.cta.default.item3']}
        image={productPhoto}
      />
    </>
  );
}
