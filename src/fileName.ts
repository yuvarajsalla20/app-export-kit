export type ExportExtension = 'csv' | 'pdf';

const slug = (text: string): string => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

/** File-safe names like myapp-november-2026.pdf. A name with no letters or digits falls back to "app" / "data". */
export const exportFileName = (appName: string, stem: string, ext: ExportExtension): string => `${slug(appName) || 'app'}-${slug(stem) || 'data'}.${ext}`;
