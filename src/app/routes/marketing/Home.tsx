import { useT } from '@/i18n/LocaleProvider';
import { Section } from '@/app/components/marketing/Section';
import { Eyebrow } from '@/app/components/marketing/Eyebrow';
import { DisplayHeading } from '@/app/components/marketing/DisplayHeading';
import { Prose } from '@/app/components/marketing/Prose';
import { CtaButton } from '@/app/components/marketing/CtaButton';
import { ArrowLink } from '@/app/components/marketing/ArrowLink';
import { CtaBand } from '@/app/components/marketing/CtaBand';
import { PendingChip } from '@/app/components/brand/PendingChip';
import { rooteContent } from '@/content/roote.config';
import heroPeople from '@/assets/hero-people.png';
import stepQuiz from '@/assets/step-quiz.jpg';
import stepPhotoScan from '@/assets/step-photo-scan.jpg';
import scanDevice from '@/assets/scan-device.jpg';
import productLineup from '@/assets/product-lineup.png';
import scalpBefore from '@/assets/scalp-before.jpg';
import scalpAfter from '@/assets/scalp-after.jpg';

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
        <Eyebrow onInk>{t('marketing.home.hero.eyebrow')}</Eyebrow>
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
          <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-4 rounded-b-2xl bg-gradient-to-t from-ink via-ink/70 to-transparent px-6 pb-10 pt-40 text-center sm:px-10 sm:pt-48">
            <p className="font-display text-2xl font-medium uppercase tracking-wide text-ink-foreground sm:text-3xl">
              {t('marketing.home.hero.titleGhost')}
            </p>
            <Prose size="l" onInk className="max-w-md">
              {t('marketing.home.hero.body')}
            </Prose>
            <CtaButton to="/diagnosis" size="lg">{t('marketing.nav.cta')}</CtaButton>
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
      <div className="flex items-center justify-between">
        <Eyebrow>{t('marketing.home.featured.eyebrowLeft')}</Eyebrow>
        <Eyebrow className="text-end">{t('marketing.home.featured.eyebrowRight')}</Eyebrow>
      </div>
      <h2
        className="mt-4 select-none whitespace-nowrap text-center font-display font-medium uppercase leading-none tracking-[-0.02em] text-foreground"
        style={{ fontSize: 'clamp(2rem, 10vw, 7.125rem)' }}
      >
        {t('marketing.home.featured.title')}
      </h2>

      <div className="relative mt-8 grid grid-cols-1 items-center gap-8 md:mt-0 md:grid-cols-[0.8fr_1.2fr_0.8fr] md:gap-6">
        <div className="flex flex-col items-start gap-3">
          <img
            src={stepPhotoScan}
            alt=""
            className="img-editorial mt-6 aspect-[4/5] w-full max-w-[220px] rounded-xl object-cover shadow-sm sm:mt-10 md:mt-14"
          />
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="text-2xl text-accent">01</span>
            <span>{t('marketing.home.featured.item1.label')}</span>
          </div>
          <ArrowLink to="/how-it-works">{t('marketing.home.featured.item1.cta')}</ArrowLink>
        </div>

        <div className="relative z-10 -mt-6 sm:-mt-12 md:-mt-20">
          <img
            src={productLineup}
            alt=""
            className="img-editorial mx-auto w-full max-w-lg rounded-2xl object-cover shadow-lg"
          />
        </div>

        <div className="flex flex-col items-start gap-3 md:items-end md:text-end">
          <span className="text-2xl text-accent">02</span>
          <p className="font-display text-lg font-medium">{t('marketing.home.featured.item2.label')}</p>
          <img
            src={scanDevice}
            alt=""
            className="img-editorial mt-4 aspect-[4/5] w-full max-w-[220px] rounded-xl object-cover shadow-sm md:mt-16"
          />
        </div>
      </div>
    </Section>
  );
}

function ValueProp() {
  const t = useT();
  return (
    <Section className="text-center">
      <DisplayHeading as="h2" size="l" text={t('marketing.home.valueProp.title')} className="mx-auto max-w-3xl" />
      <Prose size="l" className="mx-auto mt-4 max-w-2xl">{t('marketing.home.valueProp.body')}</Prose>
    </Section>
  );
}

function QuizIntro() {
  const t = useT();
  const steps = [t('marketing.home.quiz.step1'), t('marketing.home.quiz.step2'), t('marketing.home.quiz.step3')];
  return (
    <Section index="01" className="text-center">
      <DisplayHeading as="h2" size="m" text={t('marketing.home.quiz.title')} className="mx-auto max-w-2xl" />
      <ol className="mx-auto mt-8 flex max-w-xl flex-col gap-4 text-start">
        {steps.map((label, i) => (
          <li key={label} className="flex items-center gap-3 text-sm text-foreground">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
              {i + 1}
            </span>
            {label}
          </li>
        ))}
      </ol>
      <div className="mt-8">
        <CtaButton to="/diagnosis">{t('marketing.home.quiz.cta')}</CtaButton>
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
    { photo: productLineup, title: t('marketing.home.how.step4.title'), body: t('marketing.home.how.step4.body') },
  ];
  return (
    <Section index="02">
      <div className="text-center">
        <DisplayHeading as="h2" size="m" text={t('marketing.home.how.title')} />
      </div>
      <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, i) => (
          <li key={step.title} className="flex flex-col gap-3">
            <img src={step.photo} alt="" className="img-editorial aspect-square w-full rounded-xl object-cover" />
            <span className="text-xs font-medium tracking-[0.18em] text-accent">0{i + 1}</span>
            <p className="font-display text-lg font-medium">{step.title}</p>
            <Prose>{step.body}</Prose>
          </li>
        ))}
      </ol>
      <div className="mt-10 flex justify-center">
        <ArrowLink to="/how-it-works">{t('marketing.home.how.cta')}</ArrowLink>
      </div>
    </Section>
  );
}

function ClinicalResults() {
  const t = useT();
  return (
    <Section tone="ink" index="03" className="text-center">
      <DisplayHeading
        as="h2"
        size="m"
        onInk
        text={t('marketing.home.clinical.title')}
        ghost={t('marketing.home.clinical.titleGhost')}
      />
      <Prose size="l" onInk className="mx-auto mt-4 max-w-xl">{t('marketing.home.clinical.body')}</Prose>
      <div className="mx-auto mt-8 grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">
        <PendingChip label="clinical improvement %" />
        <PendingChip label="time to visible results" />
        <PendingChip label="study attribution" />
      </div>
    </Section>
  );
}

function ProductComponents() {
  const t = useT();
  return (
    <Section index="04" className="text-center">
      <DisplayHeading as="h2" size="m" text={t('marketing.home.products.title')} />
      <Prose size="l" className="mx-auto mt-4 max-w-xl">{t('marketing.home.products.body')}</Prose>
      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {rooteContent.formula.ingredients.map((ing) => (
          <div key={ing.key} className="rounded-xl border border-border p-6 text-start">
            <p className="font-display text-lg font-medium">{ing.name}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.1em] text-muted-foreground">
              {t(ROLE_KEYS[ing.role as keyof typeof ROLE_KEYS])}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-10">
        <ArrowLink to="/products">{t('marketing.home.products.cta')}</ArrowLink>
      </div>
    </Section>
  );
}

function RootCause() {
  const t = useT();
  const profiles = [
    t('marketing.home.rootCause.profile1.label'),
    t('marketing.home.rootCause.profile2.label'),
    t('marketing.home.rootCause.profile3.label'),
  ];
  const roles = rooteContent.formula.ingredients.map((ing) => t(ROLE_KEYS[ing.role as keyof typeof ROLE_KEYS]));
  return (
    <Section className="text-center">
      <DisplayHeading as="h2" size="m" text={t('marketing.home.rootCause.title')} className="mx-auto max-w-2xl" />
      <Prose size="l" className="mx-auto mt-4 max-w-xl">{t('marketing.home.rootCause.body')}</Prose>
      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {profiles.map((label) => (
          <div key={label} className="rounded-xl border border-border p-6 text-start">
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
    <Section className="border-t border-border">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div className="flex flex-col items-start gap-5">
          <DisplayHeading as="h2" size="m" text={t('marketing.home.research.title')} />
          <Prose size="l">{t('marketing.home.research.body')}</Prose>
          <ArrowLink to="/science">{t('marketing.home.research.cta')}</ArrowLink>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <img src={scalpBefore} alt={t('marketing.home.research.beforeLabel')} className="img-editorial aspect-square w-full rounded-xl object-cover" />
            <span className="absolute bottom-3 start-3 rounded-full bg-background/90 px-3 py-1 text-[11px] font-medium uppercase tracking-wide shadow-sm">
              {t('marketing.home.research.beforeLabel')}
            </span>
          </div>
          <div className="relative">
            <img src={scalpAfter} alt={t('marketing.home.research.afterLabel')} className="img-editorial aspect-square w-full rounded-xl object-cover" />
            <span className="absolute bottom-3 start-3 rounded-full bg-background/90 px-3 py-1 text-[11px] font-medium uppercase tracking-wide shadow-sm">
              {t('marketing.home.research.afterLabel')}
            </span>
          </div>
        </div>
      </div>
      <p className="mt-4 text-center text-[11px] text-muted-foreground">{t('marketing.home.research.caption')}</p>
    </Section>
  );
}

export function Home() {
  return (
    <>
      <Hero />
      <FeaturedFormula />
      <ValueProp />
      <QuizIntro />
      <HowItWorksSteps />
      <ClinicalResults />
      <ProductComponents />
      <RootCause />
      <Research />
      <CtaBand headingKey="marketing.cta.default.title" bodyKey="marketing.cta.default.body" />
    </>
  );
}
