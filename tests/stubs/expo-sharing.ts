export const shared: { url: string; options?: { mimeType?: string; UTI?: string } }[] = [];
export async function shareAsync(url: string, options?: { mimeType?: string; UTI?: string }): Promise<void> {
  shared.push({ url, options });
}
