import { describe, expect, it } from 'vitest';
import { CSV_BOM, exportFileName, toCsv } from '../src';

describe('toCsv', () => {
  it('quotes commas, quotes and new lines', () => {
    expect(toCsv([['a,b', 'say "hi"', 'two\nlines']])).toBe('"a,b","say ""hi""","two\nlines"');
  });
  it('stops formulas but keeps plain numbers', () => {
    expect(toCsv([['=SUM(A1)', '+cmd', '@x', '-12.50', '+3']])).toBe("'=SUM(A1),'+cmd,'@x,-12.50,+3");
  });
  it('adds the Excel marker only when asked and only with rows', () => {
    expect(toCsv([['a']], { bom: true })).toBe(`${CSV_BOM}a`);
    expect(toCsv([], { bom: true })).toBe('');
  });
});

describe('exportFileName', () => {
  it('makes safe lower-case names', () => {
    expect(exportFileName('MyApp', 'November 2026', 'pdf')).toBe('myapp-november-2026.pdf');
    expect(exportFileName('!!', '??', 'csv')).toBe('app-data.csv');
  });
});
