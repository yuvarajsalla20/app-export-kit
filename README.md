# app-export-kit

Data export for any React Native / Expo app (iOS, Android, web).
Excel-safe CSV, a PDF report built from a plain description, and saving the file: the share sheet on phones (Save to Files, AirDrop, Mail …), a download or the print dialog on the web.

It has no screens, no app words and no app colors. Your app decides what goes in a report, who may export it, and how it looks. It works for any kind of data: expenses, orders, attendance, scores.

## What you get

| Piece | What it does |
|---|---|
| `exportCsv(name, rows)` | Rows of text as a CSV file that opens safely in Excel, Numbers and Google Sheets, then shared or downloaded |
| `exportPdf(name, report, look)` | The report as a PDF: printed on the phone with `expo-print` and shared; on the web the browser's print dialog ("Save as PDF") |
| `toCsv(rows, { bom })` | The CSV text only: quoting, and formulas (`=`, `+`, `-`, `@`) turned into plain text so a cell can never run in a spreadsheet. Plain numbers stay numbers |
| `reportHtml(report, look)` | The report as one HTML page. Pure, so an app can test its own report without a phone |
| `exportFileName(app, stem, ext)` | File-safe names: `myapp-november-2026.pdf` |
| `saveText(name, text, kind)` | Any text file through the same share sheet or download |

## Quick start

```bash
npm install "app-export-kit@git+https://github.com/yuvarajsalla20/app-export-kit.git#v1.0.0"
npx expo install expo-file-system expo-sharing expo-print
```


```ts
import { exportCsv, exportFileName, exportPdf, type Report } from 'app-export-kit';

await exportCsv(exportFileName('MyApp', 'all-orders', 'csv'), [
  ['Date', 'Item', 'Amount'],
  ['2026-11-01', 'Desk', '250.00'],
]);

const report: Report = {
  title: 'November 2026',
  subtitle: 'Orders',
  summary: [{ label: 'Total', value: '$1,240.00' }, { label: 'Orders', value: '12' }],
  sections: [
    {
      heading: 'Orders',
      columns: ['Date', 'Item', 'Customer', 'Amount'],
      align: ['left', 'left', 'left', 'right'],
      rows: [['1 Nov', 'Desk', 'Sam', '$250.00']],
      total: ['', '', 'Total', '$1,240.00'],
      empty: 'No orders this month.',
    },
  ],
  footer: 'Made with MyApp · 14 Nov 2026',
};

await exportPdf(exportFileName('MyApp', 'November 2026', 'pdf'), report, {
  appName: 'MyApp',
  brand: '#3355FF',
  logo: 'data:image/png;base64,…',
  page: 'A4',
});
```

## The report

| `Report` field | Required | What it is |
|---|---|---|
| `title` | yes | Big heading; also the page title |
| `subtitle` | no | A line under the title |
| `summary` | no | `{ label, value }` figures in a box at the top |
| `sections` | yes | Tables: `heading`, `columns`, `rows`, optional `align` per column (`'left'`/`'right'`), `total` row, `empty` text |
| `footer` | no | A small line at the end |

All values are plain text: format numbers, money and dates in your app (in the reader's language) before passing them.

## The look

| `ReportLook` option | Default | What it is |
|---|---|---|
| `brand` | `#222222` | Your color: app name, section headings, summary values |
| `text` | `#1A1A1A` | Body text |
| `muted` | `#6B6B70` | Subtitles, labels, footer |
| `border` | `#E3E3E6` | Lines |
| `headerFill` | `#F5F5F7` | Table header background |
| `font` | system font | A CSS font list |
| `page` | `'A4'` | `'A4'` or `'Letter'` |
| `appName` | none | Shown with the logo at the top |
| `logo` | none | `https:` address or `data:image/…;base64` |

Pass only what differs; the rest is a print-friendly default (dark text on white).

Every word in the report is escaped. Colors must be plain colors (`#hex`, a name or `rgb()`), the font a plain font list, and the logo an `https:` address or a `data:image/…;base64` URI; anything else falls back to the default, so app data can never change the page.

## Install

Peer dependencies: `expo-file-system` and `expo-sharing` (CSV), plus `expo-print` for PDF on phones (optional if you only export CSV). Pin the kit in your app by tag or commit SHA:

```json
"app-export-kit": "git+https://github.com/yuvarajsalla20/app-export-kit.git#v1.0.0"
```

## Platforms

| | CSV | PDF |
|---|---|---|
| iPhone / Android | Share sheet (Save to Files, Mail, AirDrop …) | Printed on the phone, then the share sheet |
| Web | Download | The browser's print dialog ("Save as PDF"), file name suggested from the title |

## Folder layout

```
src/
  index.ts        the one entry
  kit.ts          KIT_NAME, KIT_VERSION (a test keeps it equal to package.json)
  csv.ts          toCsv, CSV_BOM
  fileName.ts     exportFileName
  report.ts       Report types, reportHtml, escapeHtml, DEFAULT_REPORT_LOOK
  types.ts        CSV and PDF file kinds, page sizes
  save.ts         phones: write, share, tidy up      save.web.ts   web: download
  pdf.ts          phones: expo-print, then share     pdf.web.ts    web: print dialog
  csvExport.ts    exportCsv
tests/            CSV safety, file names, report HTML and escaping, the phone paths with stand-ins in tests/stubs
```

## Versions

Every release is tagged in git (`v1.0.0`). Changes stay backward compatible within a major version: new options default to today's behavior.

### 1.0.1

Web downloads keep their address for 30 seconds before letting it go, so Safari does not cancel them. MIT LICENSE file added, like the other kits.

### 1.0.0

First release: CSV, PDF report, share or download, file names.

## Testing

```bash
npm install
npm test            # CSV safety, file names, report HTML and escaping, the phone paths with stand-ins
npm run typecheck
```
