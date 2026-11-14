import { CSV_BOM, toCsv } from './csv';
import { saveText } from './save';
import { CSV } from './types';

/** Rows as an Excel-safe CSV file: the share sheet on phones, a download on the web. */
export const exportCsv = (name: string, rows: readonly (readonly string[])[]): Promise<void> => saveText(name, CSV_BOM + toCsv(rows), CSV);
