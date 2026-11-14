export const printed: { html: string; width?: number; height?: number }[] = [];
export async function printToFileAsync(o: { html: string; width?: number; height?: number }): Promise<{ uri: string }> {
  printed.push(o);
  return { uri: 'tmp/print-123.pdf' };
}
