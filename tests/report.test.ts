import { describe, expect, it } from 'vitest';
import { reportHtml, type Report } from '../src';

const report: Report = {
  title: 'November 2026',
  subtitle: 'Orders',
  summary: [{ label: 'Total', value: '$1,240.00' }],
  sections: [
    { heading: 'Expenses', columns: ['Date', 'Note', 'Amount'], rows: [['1 Nov', 'Rent', '$1,000.00']], align: ['left', 'left', 'right'], total: ['', 'Total', '$1,000.00'] },
    { heading: 'Removed', columns: ['Note'], rows: [], empty: 'No removed entries.' },
  ],
  footer: 'Made with MyApp',
};

describe('reportHtml', () => {
  it('has the title, summary, tables, empty note and footer', () => {
    const html = reportHtml(report, { appName: 'MyApp', brand: '#3355FF' });
    for (const text of ['<title>November 2026</title>', 'Orders', 'Total', '$1,240.00', 'Rent', 'class="total"', 'No removed entries.', 'Made with MyApp', 'MyApp</span>', '#3355FF'])
      expect(html).toContain(text);
    expect(html).toContain('<td class="r">$1,000.00</td>');
  });

  it('escapes every piece of text', () => {
    const html = reportHtml({ title: '<script>x</script>', sections: [{ heading: 'a&b', columns: ['"q"'], rows: [["<img onerror='1'>"]] }] });
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('<img onerror');
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('a&amp;b');
  });

  it('never lets a look value break out of the style sheet or the logo', () => {
    const html = reportHtml(report, { brand: 'red; } body { display:none', font: 'x; } *{', logo: 'javascript:alert(1)' });
    expect(html).not.toContain('display:none');
    expect(html).not.toContain('javascript:');
    expect(html).toContain('color: #222222');
  });

  it('uses A4 by default and Letter when asked', () => {
    expect(reportHtml(report)).toContain('size: A4');
    expect(reportHtml(report, { page: 'Letter' })).toContain('size: Letter');
  });

  it('shows a data: or https logo', () => {
    expect(reportHtml(report, { logo: 'https://x.test/l.png' })).toContain('<img src="https://x.test/l.png"');
  });
});
