import { escapeHtml, reportHtml, type Report, type ReportLook } from './report';

/**
 * Web: open the browser's print dialog with the report, where "Save as PDF" makes the file. The page title (the file
 * name without .pdf) becomes the suggested file name.
 */
export async function exportPdf(name: string, report: Report, look: Partial<ReportLook> = {}): Promise<void> {
  const html = reportHtml(report, look).replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(name.replace(/\.pdf$/i, ''))}</title>`);
  const frame = Object.assign(document.createElement('iframe'), { srcdoc: html });
  frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
  document.body.appendChild(frame);
  await new Promise<void>((resolve) => frame.addEventListener('load', () => resolve(), { once: true }));
  frame.contentWindow?.focus();
  frame.contentWindow?.print();
  // Printing blocks until the dialog closes in most browsers; give the rest a moment before tidying up.
  setTimeout(() => frame.remove(), 1000);
}
