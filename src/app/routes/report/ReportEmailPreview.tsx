import { useT } from '@/i18n/LocaleProvider';
import type { ReportModel } from '@/domain/report/types';

// TODO: email backend — this component is a design reference for the real transactional
// email template; it is not sent anywhere from the client.
export function ReportEmailPreview({ model }: { model: ReportModel }) {
  const t = useT();
  return (
    <div style={{ maxWidth: 480, margin: '0 auto', fontFamily: 'Arial, sans-serif', border: '1px solid #E4D9C8', borderRadius: 8, padding: 24 }}>
      <p style={{ fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: '#6E635A' }}>ROOTÉ</p>
      <h1 style={{ fontSize: 18, margin: '8px 0' }}>{t('report.emailPreview.subject')}</h1>
      <p style={{ fontSize: 14, color: '#2A2320' }}>{t('report.emailPreview.intro')}</p>
      <p style={{ fontSize: 13, color: '#6E635A' }}>{model.meta.scaleLine}</p>
      <a
        href={`/report/${model.meta.reportId}`}
        style={{ display: 'inline-block', marginTop: 16, padding: '12px 24px', background: '#745F50', color: '#F9F6EF', borderRadius: 6, textDecoration: 'none', fontSize: 14 }}
      >
        {t('report.emailPreview.openOnSite')}
      </a>
    </div>
  );
}
