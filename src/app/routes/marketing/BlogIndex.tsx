import { Link } from 'react-router';
import { useT } from '@/i18n/LocaleProvider';
import { Section } from '@/app/components/marketing/Section';
import { DisplayHeading } from '@/app/components/marketing/DisplayHeading';
import { Prose } from '@/app/components/marketing/Prose';
import { Eyebrow } from '@/app/components/marketing/Eyebrow';

const SLUGS = [
  'understanding-the-norwood-scale',
  'what-causes-pattern-hair-loss',
  'how-ai-reads-a-scalp-photo',
  'building-a-routine-you-will-keep',
] as const;

export function BlogIndex() {
  const t = useT();
  const posts = SLUGS.map((slug, i) => ({
    slug,
    category: t(`marketing.blog.post${i + 1}.category` as never),
    title: t(`marketing.blog.post${i + 1}.title` as never),
    excerpt: t(`marketing.blog.post${i + 1}.excerpt` as never),
  }));

  return (
    <>
      <Section className="pt-28 text-center md:pt-32">
        <DisplayHeading as="h1" size="l" text={t('marketing.blog.index.title')} className="mx-auto max-w-3xl" />
        <Prose size="l" className="mx-auto mt-4 max-w-xl">{t('marketing.blog.index.body')}</Prose>
      </Section>

      <Section className="border-t border-border">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          {posts.map((post) => (
            <Link key={post.slug} to={`/blog/${post.slug}`} className="flex flex-col gap-2 rounded-xl border border-border p-6">
              <Eyebrow>{post.category}</Eyebrow>
              <p className="font-display text-lg font-medium">{post.title}</p>
              <Prose>{post.excerpt}</Prose>
              <span className="mt-2 text-sm text-accent">{t('marketing.blog.readMore')} →</span>
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
}
