import { useMemo } from 'react';
import { useParams } from 'react-router';
import { useSession } from '@/store/sessionStore';
import { useLocale } from '@/i18n/LocaleProvider';
import { buildReport } from '@/domain/report/buildReport';
import { recommend } from '@/domain/recommendation/recommend';
import { rooteContent } from '@/content/roote.config';
import { ReportNotFound } from './ReportNotFound';
import { ReportView } from '@/app/components/report/ReportView';
import { useDocumentMeta } from '@/seo/useDocumentMeta';

export function ReportPage() {
  const { reportId } = useParams();
  const session = useSession();
  const { contentLocale } = useLocale();
  useDocumentMeta();

  const ready = !!reportId && reportId === session.reportId && !!session.analysis;

  const model = useMemo(() => {
    if (!ready) return null;
    return buildReport({
      diagnosis: session.diagnosis,
      analysis: session.analysis!,
      content: rooteContent,
      locale: contentLocale,
      reportId: reportId!,
    });
  }, [ready, session.diagnosis, session.analysis, contentLocale, reportId]);

  const recommendation = useMemo(() => {
    if (!ready || !session.analysis || !session.diagnosis.gender) return null;
    return recommend({
      concern: session.diagnosis.concern ?? 'thinning',
      gender: session.diagnosis.gender,
      severityBand: session.analysis.severityBand,
      planEmphasis: session.analysis.planEmphasis,
      recommendedDurationDays: session.analysis.recommendedDurationDays,
    });
  }, [ready, session.analysis, session.diagnosis.concern, session.diagnosis.gender]);

  if (!model) return <ReportNotFound />;

  return (
    <ReportView
      model={model}
      grayProfile={session.diagnosis.concern === 'gray' || session.diagnosis.concern === 'both' ? session.grayProfile : null}
      recommendation={recommendation}
    />
  );
}
