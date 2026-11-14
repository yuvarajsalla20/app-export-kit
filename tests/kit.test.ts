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
