# Changelog

Release notes for app-export-kit, newest first. Each version is tagged in git (`v1.0.1`).

## 2.0.0

PDF moves to its own entry. `exportPdf` now comes from `app-export-kit/pdf`, not from `app-export-kit`. An app that only exports CSV no longer loads `expo-print` at all, so it does not need the native module, a new native build, or a test stand-in for it.

Upgrade: change `import { exportPdf } from 'app-export-kit'` to `import { exportPdf } from 'app-export-kit/pdf'`. Apps that only export CSV can remove `expo-print` from their dependencies. Nothing else changes.

## 1.1.0

Phone exports now wait for the file to be fully written (CSV) or moved into place (PDF) before the share sheet opens. Since expo-file-system 56 and 58, `move()` and `write()` finish later rather than at once, and the kit did not wait for them, so the share sheet could open on an empty or missing file, the tidy-up could delete a file still being written, and a failed write went unnoticed. A failed write or move now fails the export, so the app can tell the person. The CSV file is also tidied away when writing fails.

The test stand-in for expo-file-system now finishes `write()` and `move()` later, as the real module does, so a missing wait fails the tests. The web download and the web print dialog have their own tests.

## 1.0.1

Web downloads keep their address for 30 seconds before letting it go, so Safari does not cancel them. MIT LICENSE file added, like the other kits.

## 1.0.0

First release: CSV, PDF report, share or download, file names.
