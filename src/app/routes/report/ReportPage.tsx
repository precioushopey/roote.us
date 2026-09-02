import { useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { pdf } from '@react-pdf/renderer';
import { useSession } from '@/store/sessionStore';
import { useLocale } from '@/i18n/LocaleProvider';
import { useT } from '@/i18n/LocaleProvider';
import { buildReport } from '@/domain/report/buildReport';
import { rooteContent } from '@/content/roote.config';
import { ReportDocument } from '@/pdf/ReportDocument';
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
  const t = useT();
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

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

  async function handleDownload() {
    if (!model) return;
    setPdfError(null);
    setGenerating(true);
    try {
      const blob = await pdf(<ReportDocument model={model} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ROOTE-Hair-Report-${model.meta.reportId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setPdfError(t('report.downloadPdf') + ' failed. The web report is still available below.');
    } finally {
      setGenerating(false);
    }
  }

  if (!model) return <ReportNotFound />;

  return (
    <main className="mx-auto max-w-[640px] bg-background pb-12">
      <ReportHeader model={model} />
      <div className="flex justify-center px-4 pb-2">
        <button
          type="button"
          onClick={handleDownload}
          disabled={generating}
          className="rounded-md border border-primary px-6 py-2 text-sm text-primary disabled:opacity-50"
        >
          {t('report.downloadPdf')}
        </button>
      </div>
      {pdfError && <p role="alert" className="px-4 text-center text-xs text-destructive">{pdfError}</p>}
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
