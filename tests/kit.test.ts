import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { KIT_NAME, KIT_VERSION } from '../src';

describe('kit info', () => {
  it('matches package.json', () => {
    const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
    expect(KIT_NAME).toBe(pkg.name);
    expect(KIT_VERSION).toBe(pkg.version);
  });
});

describe('entries', () => {
  it('keeps PDF out of the main entry, so CSV-only apps never load expo-print', async () => {
    const main = await import('../src');
    expect('exportPdf' in main).toBe(false);
    const src = readFileSync(new URL('../src/index.ts', import.meta.url), 'utf8');
    expect(src).not.toMatch(/['"]\.\/pdf['"]/);
  });

  it('publishes app-export-kit/pdf', async () => {
    const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
    expect(pkg.exports['.']).toBe('./src/index.ts');
    expect(pkg.exports['./pdf']).toBe('./pdf.ts');
    expect(pkg.files).toContain('pdf.ts');
    const pdf = await import('app-export-kit/pdf');
    expect(typeof pdf.exportPdf).toBe('function');
  });
});
