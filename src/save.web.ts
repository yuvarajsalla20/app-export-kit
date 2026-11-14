import type { FileKind } from './types';

/** Web: download the file. */
export async function saveText(name: string, content: string, kind: FileKind): Promise<void> {
  const url = URL.createObjectURL(new Blob([content], { type: `${kind.mime};charset=utf-8` }));
  const link = Object.assign(document.createElement('a'), { href: url, download: name });
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/** Web has no printed file to share: PDFs go through the browser's own print dialog instead (see pdf.web.ts). */
export async function saveUri(): Promise<void> {
  throw new Error('app-export-kit: saveUri is not used on the web.');
}
