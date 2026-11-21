import { log } from './expo-file-system';

export const shared: { url: string; options?: { mimeType?: string; UTI?: string } }[] = [];
export async function shareAsync(url: string, options?: { mimeType?: string; UTI?: string }): Promise<void> {
  log.push(`share ${url}`);
  shared.push({ url, options });
}
