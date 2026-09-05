import { useMemo } from 'react';
import { useParams } from 'react-router';
import { useSession } from '@/store/sessionStore';
import { useLocale } from '@/i18n/LocaleProvider';
import { buildReport } from '@/domain/report/buildReport';
import { rooteContent } from '@/content/roote.config';
import { ReportNotFound } from './ReportNotFound';
import { ReportView } from '@/app/components/report/ReportView';
import { useDocumentMeta } from '@/seo/useDocumentMeta';
import productBg from '@/assets/product_bg.jpg';
import scanDevice from '@/assets/scan-device.jpg';
import productPhoto from '@/assets/product.png';
import minoxidilPhoto from '@/assets/PRODUCTS/minoxidil_roote_product_image_2026.png';
import finasteridePhoto from '@/assets/PRODUCTS/finaesteride_roote_product_image_2026.png';
import azelaicPhoto from '@/assets/PRODUCTS/azelaic acid_roote_product_image_2026.png';
import abnPhoto from '@/assets/PRODUCTS/ABN Complex_roote_product_image_2026.png';

// Maps treatment / active keys to bundled photo URLs for the report.
const REPORT_ASSETS: Record<string, string> = {
  'roote-topical': productBg,
  'derma-stim': scanDevice,
  cleanser: productPhoto,
  minoxidil: minoxidilPhoto,
  finasteride: finasteridePhoto,
  azelaic: azelaicPhoto,
  abn: abnPhoto,
};

export function ReportPage() {
  const { reportId } = useParams();
  const session = useSession();
  const { locale } = useLocale();
  useDocumentMeta();

  const ready = !!reportId && reportId === session.reportId && !!session.analysis;

  const model = useMemo(() => {
    if (!ready) return null;
    return buildReport({
      diagnosis: session.diagnosis,
      analysis: session.analysis!,
      content: rooteContent,
      locale,
      reportId: reportId!,
      assets: REPORT_ASSETS,
    });
  }, [ready, session.diagnosis, session.analysis, locale, reportId]);

  if (!model) return <ReportNotFound />;

  return <ReportView model={model} />;
}
