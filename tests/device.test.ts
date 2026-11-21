import { describe, expect, it } from 'vitest';
import { CSV_BOM, exportCsv } from '../src';
import { exportPdf } from 'app-export-kit/pdf';
import { failNext, log } from './stubs/expo-file-system';
import { printed } from './stubs/expo-print';
import { shared } from './stubs/expo-sharing';

describe('on a phone', () => {
  it('exportCsv finishes writing the file before sharing it as CSV, then deletes it', async () => {
    log.length = 0;
    await exportCsv('app-data.csv', [['a', 'b']]);
    expect(log).toEqual([
      'create cache/app-data.csv',
      `write cache/app-data.csv ${(CSV_BOM + 'a,b').length}`,
      'share cache/app-data.csv',
      'delete cache/app-data.csv',
    ]);
    expect(shared.at(-1)).toEqual({ url: 'cache/app-data.csv', options: { mimeType: 'text/csv', UTI: 'public.comma-separated-values-text' } });
  });

  it('exportPdf prints at the page size, finishes renaming the file before sharing it as PDF, then deletes it', async () => {
    log.length = 0;
    await exportPdf('app-nov.pdf', { title: 'Nov', sections: [] }, { page: 'Letter' });
    expect(printed.at(-1)).toMatchObject({ width: 612, height: 792 });
    expect(printed.at(-1)!.html).toContain('<h1>Nov</h1>');
    expect(log).toEqual(['move tmp/print-123.pdf -> cache/app-nov.pdf', 'share cache/app-nov.pdf', 'delete cache/app-nov.pdf']);
    expect(shared.at(-1)).toEqual({ url: 'cache/app-nov.pdf', options: { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' } });
  });

  it('a failed write fails exportCsv, opens no share sheet and tidies up', async () => {
    log.length = 0;
    failNext.write = new Error('disk full');
    await expect(exportCsv('app-data.csv', [['a']])).rejects.toThrow('disk full');
    expect(log).toEqual(['create cache/app-data.csv', 'delete cache/app-data.csv']);
  });

  it('a failed move fails exportPdf and opens no share sheet', async () => {
    log.length = 0;
    failNext.move = new Error('no such file');
    await expect(exportPdf('app-nov.pdf', { title: 'Nov', sections: [] })).rejects.toThrow('no such file');
    expect(log).toEqual([]);
  });
});
