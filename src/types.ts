/** How a file is described to the phone's share sheet. */
export interface FileKind {
  mime: string;
  /** Apple's type id, so the share sheet offers the right apps. */
  uti: string;
}

export const CSV: FileKind = { mime: 'text/csv', uti: 'public.comma-separated-values-text' };
export const PDF: FileKind = { mime: 'application/pdf', uti: 'com.adobe.pdf' };

/** Page sizes in points (1/72 inch), as the phone's printer wants them. */
export const PAGE_POINTS = { A4: { width: 595, height: 842 }, Letter: { width: 612, height: 792 } } as const;
