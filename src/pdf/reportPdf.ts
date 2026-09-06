/**
 * Client-side PDF generation for the two ROOTÉ reports (PO decision #18):
 *   - "Personalized Hair Report" (initial, from /report/:id)
 *   - "ROOTÉ Program Results Report" (final, from /account/results)
 *
 * `src/pdf/` is a dumb renderer: it takes already-resolved, already-localized
 * strings and lays them out. No config, no i18n provider, no domain imports.
 *
 * [TODO] Hebrew PDF: jsPDF's built-in fonts are Latin-only. An RTL/Hebrew report
 * needs an embedded font (e.g. Heebo .ttf via `doc.addFont`) + `doc.setR2L(true)`.
 * Until then the PDF is generated from the English content locale.
 * [TODO] "Email report" needs a backend mail service — the button is stubbed.
 */

export type PdfSection = {
  heading: string;
  /** two-column rows */
  rows?: Array<[string, string]>;
  /** free lines */
  lines?: string[];
};

const MARGIN = 56;
const PAGE_W = 595.28; // A4 pt
const PAGE_H = 841.89;
const CONTENT_W = PAGE_W - MARGIN * 2;

export async function buildRootePdf(input: {
  title: string;
  subtitle?: string;
  sections: PdfSection[];
  disclaimer?: string;
  filename: string;
}): Promise<void> {
  // dynamic import so jsPDF (+ its optional canvas deps) stays out of the main bundle
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  let y = MARGIN;

  const ink = '#2a2320';
  const muted = '#6b5f57';

  const ensure = (needed: number) => {
    if (y + needed > PAGE_H - MARGIN) {
      doc.addPage();
      y = MARGIN;
    }
  };
  const text = (s: string, size: number, color: string, opts: { bold?: boolean; gap?: number } = {}) => {
    doc.setFont('helvetica', opts.bold ? 'bold' : 'normal');
    doc.setFontSize(size);
    doc.setTextColor(color);
    const lines = doc.splitTextToSize(s, CONTENT_W) as string[];
    for (const line of lines) {
      ensure(size + 4);
      doc.text(line, MARGIN, y);
      y += size + 4;
    }
    y += opts.gap ?? 0;
  };

  text(input.title, 20, ink, { bold: true, gap: 2 });
  if (input.subtitle) text(input.subtitle, 10, muted, { gap: 10 });

  doc.setDrawColor('#d9cfc4');
  ensure(12);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 18;

  for (const section of input.sections) {
    text(section.heading, 12, ink, { bold: true, gap: 4 });
    for (const [k, v] of section.rows ?? []) {
      ensure(16);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(muted);
      doc.text(k, MARGIN, y);
      doc.setTextColor(ink);
      const vLines = doc.splitTextToSize(v, CONTENT_W / 2) as string[];
      doc.text(vLines, PAGE_W - MARGIN, y, { align: 'right' });
      y += Math.max(16, vLines.length * 14);
    }
    for (const line of section.lines ?? []) text(`•  ${line}`, 10, ink);
    y += 12;
  }

  if (input.disclaimer) {
    ensure(20);
    doc.setDrawColor('#d9cfc4');
    doc.line(MARGIN, y, PAGE_W - MARGIN, y);
    y += 14;
    text(input.disclaimer, 8, muted);
  }

  doc.save(input.filename);
}
