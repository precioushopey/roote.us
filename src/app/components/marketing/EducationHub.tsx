import { useMemo, type ReactNode } from 'react';
import { useT, useLocale } from '@/i18n/LocaleProvider';
import { Section, SectionIntro, MediaPlaceholder } from '@/app/components/roote';
import { LevelComparisonSection } from '@/app/components/marketing/LevelComparison';
import {
  FollicleCompare,
  GrayInOutDiagram,
  HairCycleDiagram,
  PigmentDiagram,
  RoutineGraphic,
  SystemMap,
} from '@/app/components/marketing/ProductVisuals';
import { buildEducation, type EducationTopicId } from '@/content/education';

/**
 * The /magazine "learn" hub: short visual explainers (how hair loss happens, what
 * causes gray hair, Gray Serum vs Gray Support, how the products work together),
 * followed by the shared Level 6/10/15 comparison with its Minoxidil / Finasteride
 * / DHT explainers. Video and before/after slots are explicit pending placeholders
 * until real, approved assets are supplied.
 */
const VISUAL: Record<EducationTopicId, () => ReactNode> = {
  cycle: () => (
    <div className="flex flex-col gap-8">
      <HairCycleDiagram />
      <FollicleCompare />
    </div>
  ),
  gray: () => <PigmentDiagram />,
  'gray-system': () => <GrayInOutDiagram />,
  together: () => (
    <div className="flex flex-col gap-8">
      <SystemMap />
      <RoutineGraphic />
    </div>
  ),
};

export function EducationHub() {
  const t = useT();
  const cl = useLocale().locale;
  const model = useMemo(() => buildEducation(cl), [cl]);
  return (
    <>
      <Section id="learn" tone="cream" width="content" gap={12}>
        <SectionIntro
          eyebrow={t('marketing.learn.eyebrow')}
          title={t('marketing.learn.title')}
          body={t('marketing.learn.body')}
        />
        <div className="flex flex-col gap-8">
          {model.topics.map((topic) => (
            <article
              key={topic.id}
              id={`learn-${topic.id}`}
              className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-6 md:p-8"
            >
              <h3 className="font-display text-2xl text-foreground">{topic.title}</h3>
              <p className="max-w-[45rem] font-body text-base text-muted-foreground">{topic.body}</p>
              {VISUAL[topic.id]()}
            </article>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {model.pendingMedia.map((m) => (
            <MediaPlaceholder
              key={m.label}
              alt={m.label}
              label={m.label}
              kind={/video/i.test(m.label) ? 'video' : 'image'}
              ratio="16 / 9"
              tone="card"
            />
          ))}
        </div>
      </Section>
      <LevelComparisonSection />
    </>
  );
}
