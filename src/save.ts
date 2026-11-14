import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import type { FileKind } from './types';

/** Phones: write the file, open the share sheet (Save to Files, AirDrop, Mail, WhatsApp …), then tidy up. */
export async function saveText(name: string, content: string, kind: FileKind): Promise<void> {
  const file = new File(Paths.cache, name);
  file.create({ overwrite: true });
  file.write(content);
  await shareFile(file, kind);
}

/** Phones: share a file that already exists (such as a printed PDF) under a friendly name. */
export async function saveUri(name: string, uri: string, kind: FileKind): Promise<void> {
  const named = new File(Paths.cache, name);
  new File(uri).move(named, { overwrite: true });
  await shareFile(named, kind);
}

const shareFile = (file: File, kind: FileKind) =>
  Sharing.shareAsync(file.uri, { mimeType: kind.mime, UTI: kind.uti }).finally(() => {
    try {
      file.delete();
    } catch {
      // Already gone: nothing to tidy.
    }
  });
