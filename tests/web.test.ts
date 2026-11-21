import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { exportPdf } from '../src/pdf.web';
import { saveText, saveUri } from '../src/save.web';
import { CSV } from '../src/types';

// A small stand-in for the browser page: just what save.web.ts and pdf.web.ts touch.
type FakeElement = {
  tag: string;
  href?: string;
  download?: string;
  srcdoc?: string;
  style: { cssText: string };
  click: () => void;
  remove: () => void;
  addEventListener: (type: string, fn: () => void) => void;
  contentWindow?: { focus: () => void; print: () => void };
  fire: (type: string) => void;
};

let events: string[];
let page: FakeElement[];
let blobs: Blob[];

function fakeElement(tag: string): FakeElement {
  const listeners: Record<string, (() => void)[]> = {};
  const el: FakeElement = {
    tag,
    style: { cssText: '' },
    click: () => events.push(`click ${el.download}`),
    remove: () => {
      events.push(`remove ${tag}`);
      page = page.filter((e) => e !== el);
    },
    addEventListener: (type, fn) => (listeners[type] ??= []).push(fn),
    fire: (type) => (listeners[type] ?? []).forEach((fn) => fn()),
  };
  if (tag === 'iframe') el.contentWindow = { focus: () => events.push('focus'), print: () => events.push('print') };
  return el;
}

beforeEach(() => {
  events = [];
  page = [];
  blobs = [];
  vi.useFakeTimers();
  vi.stubGlobal('document', {
    createElement: (tag: string) => fakeElement(tag),
    body: {
      appendChild: (el: FakeElement) => {
        events.push(`append ${el.tag}`);
        page.push(el);
      },
    },
  });
  vi.spyOn(URL, 'createObjectURL').mockImplementation((blob) => {
    blobs.push(blob as Blob);
    return 'blob:file-1';
  });
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation((url) => {
    events.push(`revoke ${url}`);
  });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('on the web', () => {
  it('saveText downloads the file under its name with its type, and takes its address back only after 30 seconds', async () => {
    await saveText('app-data.csv', 'a,b', CSV);
    expect(blobs).toHaveLength(1);
    expect(blobs[0].type).toBe('text/csv;charset=utf-8');
    expect(await blobs[0].text()).toBe('a,b');
    expect(events).toEqual(['append a', 'click app-data.csv', 'remove a']);
    expect(page).toEqual([]);

    vi.advanceTimersByTime(29_999);
    expect(events).not.toContain('revoke blob:file-1');
    vi.advanceTimersByTime(1);
    expect(events.at(-1)).toBe('revoke blob:file-1');
  });

  it('saveUri is not used on the web and says so', async () => {
    await expect(saveUri()).rejects.toThrow('saveUri is not used on the web');
  });

  it('exportPdf opens the print dialog with the report, titled by the file name, then removes the hidden frame', async () => {
    const done = exportPdf('app-nov <1>.pdf', { title: 'November', sections: [] }, { page: 'Letter' });
    const frame = page.find((e) => e.tag === 'iframe')!;
    expect(frame.srcdoc).toContain('<title>app-nov &lt;1&gt;</title>');
    expect(frame.srcdoc).toContain('<h1>November</h1>');
    expect(frame.style.cssText).toContain('width:0');
    expect(events).toEqual(['append iframe']);

    frame.fire('load');
    await done;
    expect(events).toEqual(['append iframe', 'focus', 'print']);
    expect(page).toEqual([frame]);

    vi.advanceTimersByTime(1000);
    expect(events.at(-1)).toBe('remove iframe');
    expect(page).toEqual([]);
  });
});
