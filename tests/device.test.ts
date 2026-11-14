import { describe, expect, it } from 'vitest';
import { CSV_BOM, exportCsv, exportPdf } from '../src';
import { log } from './stubs/expo-file-system';
import { printed } from './stubs/expo-print';
import { shared } from './stubs/expo-sharing';

describe('on a phone', () => {
  it('exportCsv writes the file with the Excel marker, shares it as CSV, then deletes it', async () => {
    log.length = 0;
    await exportCsv('app-data.csv', [['a', 'b']]);
    expect(log).toEqual(['create cache/app-data.csv', `write cache/app-data.csv ${(CSV_BOM + 'a,b').length}`, 'delete cache/app-data.csv']);
    expect(shared.at(-1)).toEqual({ url: 'cache/app-data.csv', options: { mimeType: 'text/csv', UTI: 'public.comma-separated-values-text' } });
  });

  it('exportPdf prints at the page size, renames the file, shares it as PDF, then deletes it', async () => {
    log.length = 0;
    await exportPdf('app-nov.pdf', { title: 'Nov', sections: [] }, { page: 'Letter' });
    expect(printed.at(-1)).toMatchObject({ width: 612, height: 792 });
    expect(printed.at(-1)!.html).toContain('<h1>Nov</h1>');
    expect(log).toEqual(['move tmp/print-123.pdf -> cache/app-nov.pdf', 'delete cache/app-nov.pdf']);
    expect(shared.at(-1)).toEqual({ url: 'cache/app-nov.pdf', options: { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' } });
  });
});
