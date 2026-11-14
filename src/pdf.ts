import * as Print from 'expo-print';
import { reportHtml, type Report, type ReportLook } from './report';
import { saveUri } from './save';
import { PAGE_POINTS, PDF } from './types';

/** Phones: print the report to a PDF on the phone, then open the share sheet with it. */
export async function exportPdf(name: string, report: Report, look: Partial<ReportLook> = {}): Promise<void> {
  const { width, height } = PAGE_POINTS[look.page === 'Letter' ? 'Letter' : 'A4'];
  const { uri } = await Print.printToFileAsync({ html: reportHtml(report, look), width, height });
  await saveUri(name, uri, PDF);
}
