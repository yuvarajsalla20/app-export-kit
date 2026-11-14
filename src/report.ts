/** One label and value in the summary at the top, such as "Total spent" and "$1,240.00". */
export interface ReportFigure {
  label: string;
  value: string;
}

/** A table: a heading, column names and rows of text. `align` per column ('right' suits money). */
export interface ReportSection {
  heading: string;
  columns: readonly string[];
  rows: readonly (readonly string[])[];
  align?: readonly ('left' | 'right')[];
  /** A last row in bold, such as the total. */
  total?: readonly string[];
  /** Shown instead of the table when there are no rows. */
  empty?: string;
}

/** What goes in the report. Plain text only: the kit escapes everything. */
export interface Report {
  title: string;
  subtitle?: string;
  summary?: readonly ReportFigure[];
  sections: readonly ReportSection[];
  /** A small line at the bottom of every page, such as "Made with MyApp · 14 Nov 2026". */
  footer?: string;
}

/** How the report looks. The app passes its own brand; everything else has a print-friendly default. */
export interface ReportLook {
  /** The app's color: name, headings, the summary's values. */
  brand: string;
  text: string;
  muted: string;
  border: string;
  /** Tinted header row of each table. */
  headerFill: string;
  /** A CSS font list. */
  font: string;
  page: 'A4' | 'Letter';
  /** The app's name in the top row. */
  appName?: string;
  /** An image address for the logo (https or a data: URI). */
  logo?: string;
}

export const DEFAULT_REPORT_LOOK: ReportLook = {
  brand: '#222222',
  text: '#1A1A1A',
  muted: '#6B6B70',
  border: '#E3E3E6',
  headerFill: '#F5F5F7',
  font: "-apple-system, 'Helvetica Neue', Helvetica, Arial, sans-serif",
  page: 'A4',
};

const ESC: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
/** Text made safe to put inside HTML. */
export const escapeHtml = (text: string): string => text.replace(/[&<>"']/g, (ch) => ESC[ch]!);

/** Only a plain color can reach the style sheet. Anything else falls back, so a value can never break out of CSS. */
const color = (value: string, fallback: string) => (/^(#[0-9a-f]{3,8}|[a-z]+|rgba?\([\d\s.,%]+\))$/i.test(value) ? value : fallback);
const font = (value: string, fallback: string) => (/^[\w\s,'"-]+$/.test(value) ? value : fallback);
const safeLogo = (src: string | undefined) => (src && /^(https:\/\/|data:image\/(png|jpe?g|svg\+xml|webp);base64,)/i.test(src) ? src : undefined);

const table = (s: ReportSection): string => {
  if (!s.rows.length) return `<p class="empty">${escapeHtml(s.empty ?? 'Nothing to show.')}</p>`;
  const al = (i: number) => (s.align?.[i] === 'right' ? ' class="r"' : '');
  const row = (cells: readonly string[], tag: 'td' | 'th') => `<tr>${cells.map((c, i) => `<${tag}${al(i)}>${escapeHtml(c)}</${tag}>`).join('')}</tr>`;
  return `<table><thead>${row(s.columns, 'th')}</thead><tbody>${s.rows.map((r) => row(r, 'td')).join('')}${s.total ? row(s.total, 'td').replace('<tr>', '<tr class="total">') : ''}</tbody></table>`;
};

/** The report as one HTML page, ready for printing to PDF. Pure: no phone needed, so it is tested on its own. */
export function reportHtml(report: Report, look: Partial<ReportLook> = {}): string {
  const d = DEFAULT_REPORT_LOOK;
  const l = {
    brand: color(look.brand ?? d.brand, d.brand),
    text: color(look.text ?? d.text, d.text),
    muted: color(look.muted ?? d.muted, d.muted),
    border: color(look.border ?? d.border, d.border),
    headerFill: color(look.headerFill ?? d.headerFill, d.headerFill),
    font: font(look.font ?? d.font, d.font),
    page: look.page === 'Letter' ? 'Letter' : 'A4',
  };
  const logo = safeLogo(look.logo);
  const brandRow = look.appName || logo
    ? `<div class="brand">${logo ? `<img src="${escapeHtml(logo)}" alt="">` : ''}${look.appName ? `<span>${escapeHtml(look.appName)}</span>` : ''}</div>`
    : '';
  const summary = report.summary?.length
    ? `<div class="summary">${report.summary.map((f) => `<div><div class="label">${escapeHtml(f.label)}</div><div class="value">${escapeHtml(f.value)}</div></div>`).join('')}</div>`
    : '';
  const sections = report.sections.map((s) => `<h2>${escapeHtml(s.heading)}</h2>${table(s)}`).join('');
  const footer = report.footer ? `<footer>${escapeHtml(report.footer)}</footer>` : '';
  return `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(report.title)}</title><style>
@page { size: ${l.page}; margin: 18mm 16mm; }
* { box-sizing: border-box; }
body { margin: 0; font-family: ${l.font}; color: ${l.text}; font-size: 11pt; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.brand { display: flex; align-items: center; gap: 8px; color: ${l.brand}; font-weight: 600; font-size: 12pt; margin-bottom: 14px; }
.brand img { width: 28px; height: 28px; border-radius: 7px; }
h1 { font-size: 20pt; margin: 0; }
.sub { color: ${l.muted}; margin: 4px 0 0; }
.summary { display: flex; flex-wrap: wrap; gap: 24px; margin: 18px 0 6px; padding: 12px 14px; border: 1px solid ${l.border}; border-radius: 8px; }
.summary .label { color: ${l.muted}; font-size: 9pt; }
.summary .value { color: ${l.brand}; font-size: 14pt; font-weight: 700; }
h2 { font-size: 12pt; color: ${l.brand}; margin: 20px 0 6px; }
table { width: 100%; border-collapse: collapse; }
th { background: ${l.headerFill}; text-align: left; font-size: 9pt; color: ${l.muted}; font-weight: 600; }
th, td { padding: 6px 8px; border-bottom: 1px solid ${l.border}; vertical-align: top; }
tr { page-break-inside: avoid; }
.r { text-align: right; white-space: nowrap; }
.total td { font-weight: 700; border-bottom: none; }
.empty { color: ${l.muted}; }
footer { margin-top: 24px; color: ${l.muted}; font-size: 8pt; }
</style></head><body>${brandRow}<h1>${escapeHtml(report.title)}</h1>${report.subtitle ? `<p class="sub">${escapeHtml(report.subtitle)}</p>` : ''}${summary}${sections}${footer}</body></html>`;
}
