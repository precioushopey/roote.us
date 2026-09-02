import { useParams, Navigate } from 'react-router';
import { useT } from '@/i18n/LocaleProvider';
import { Section } from '@/app/components/marketing/Section';
import { DisplayHeading } from '@/app/components/marketing/DisplayHeading';
import { Prose } from '@/app/components/marketing/Prose';
import { Eyebrow } from '@/app/components/marketing/Eyebrow';
import { CtaBand } from '@/app/components/marketing/CtaBand';

const POSTS: Record<string, number> = {
  'understanding-the-norwood-scale': 1,
  'what-causes-pattern-hair-loss': 2,
  'how-ai-reads-a-scalp-photo': 3,
  'building-a-routine-you-will-keep': 4,
};

export function BlogPost() {
  const { slug } = useParams();
  const t = useT();
  const n = slug ? POSTS[slug] : undefined;

  if (!n) return <Navigate to="/blog" replace />;

  return (
    <>
      <Section className="pt-28 md:pt-32">
        <Eyebrow>{t(`marketing.blog.post${n}.category` as never)}</Eyebrow>
        <DisplayHeading as="h1" size="l" text={t(`marketing.blog.post${n}.title` as never)} className="mt-3 max-w-3xl" />
        <Prose size="l" className="mt-6 max-w-2xl">{t(`marketing.blog.post${n}.excerpt` as never)}</Prose>
      </Section>
      <CtaBand headingKey="marketing.cta.default.title" bodyKey="marketing.cta.default.body" />
    </>
  );
}
