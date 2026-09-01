import { useMemo } from 'react';
import { useParams } from 'react-router';
import { useSession } from '@/store/sessionStore';
import { useLocale } from '@/i18n/LocaleProvider';
import { buildReport } from '@/domain/report/buildReport';
import { rooteContent } from '@/content/roote.config';
import { ReportNotFound } from './ReportNotFound';
import {
  ReportHeader, ReportPhotos, ReportAnalysis, ReportHairLossType, ReportCurrentSituation,
} from '@/app/components/report/ReportSectionsA';
import {
  ReportPlan, ReportDuration, ReportPricing, ReportClaims, ReportCta, ReportFooter,
} from '@/app/components/report/ReportSectionsB';

export function ReportPage() {
  const { reportId } = useParams();
  const session = useSession();
  const { locale } = useLocale();

  const ready = !!reportId && reportId === session.reportId && !!session.analysis;

  const model = useMemo(() => {
    if (!ready) return null;
    return buildReport({
      diagnosis: session.diagnosis,
      analysis: session.analysis!,
      content: rooteContent,
      locale,
      reportId: reportId!,
    });
  }, [ready, session.diagnosis, session.analysis, locale, reportId]);

  if (!model) return <ReportNotFound />;

  return (
    <main className="mx-auto max-w-[640px] bg-background pb-12">
      <ReportHeader model={model} />
      <ReportPhotos model={model} />
      <ReportAnalysis model={model} />
      <ReportHairLossType model={model} />
      <ReportCurrentSituation model={model} />
      <ReportPlan model={model} />
      <ReportDuration model={model} />
      <ReportPricing model={model} />
      <ReportClaims model={model} />
      <ReportCta model={model} />
      <ReportFooter model={model} />
    </main>
  );
}
