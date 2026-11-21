import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import type { FileKind } from './types';

// expo-file-system's write() and move() return Promises (move since 56, write since 58). Each one is awaited, so the
// share sheet only opens on a finished file, a failed write or move fails the export instead of going unnoticed,
// and the tidy-up never deletes a file that is still being written. On older versions they return nothing, and
// awaiting that is harmless.

/** Phones: write the file, open the share sheet (Save to Files, AirDrop, Mail, WhatsApp …), then tidy up. */
export async function saveText(name: string, content: string, kind: FileKind): Promise<void> {
  const file = new File(Paths.cache, name);
  file.create({ overwrite: true });
  try {
    await file.write(content);
    await share(file, kind);
  } finally {
    tidy(file);
  }
}

/** Phones: share a file that already exists (such as a printed PDF) under a friendly name. */
export async function saveUri(name: string, uri: string, kind: FileKind): Promise<void> {
  const named = new File(Paths.cache, name);
  await new File(uri).move(named, { overwrite: true });
  try {
    await share(named, kind);
  } finally {
    tidy(named);
  }
}

const share = (file: File, kind: FileKind) => Sharing.shareAsync(file.uri, { mimeType: kind.mime, UTI: kind.uti });

function tidy(file: File) {
  try {
    file.delete();
  } catch {
    // Already gone: nothing to tidy.
  }
}
