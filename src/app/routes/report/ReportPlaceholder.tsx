import { useParams } from 'react-router';
import { useSession } from '@/store/sessionStore';

export function ReportPlaceholder() {
  const { reportId } = useParams();
  const { analysis } = useSession();
  return (
    <main className="min-h-screen bg-background text-foreground p-8">
      <h1 className="text-2xl mb-4">Report</h1>
      <p className="text-sm text-muted-foreground">Report ID: {reportId}</p>
      {analysis && (
        <p className="text-sm text-muted-foreground">
          Scale {analysis.scale}, stage {analysis.stage}, {analysis.flaggedZones.length} flagged zone(s).
        </p>
      )}
      <p className="mt-6 text-sm">The full personalized report and PDF are built in the next phase (P2a).</p>
    </main>
  );
}
