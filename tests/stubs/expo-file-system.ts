// Stand-in for expo-file-system: records what the kit does to files.
export const log: string[] = [];
export class File {
  uri: string;
  constructor(...parts: (string | { uri: string })[]) {
    this.uri = parts.map((p) => (typeof p === 'string' ? p : p.uri)).join('/');
  }
  create(_o?: { overwrite?: boolean }) { log.push(`create ${this.uri}`); }
  write(content: string) { log.push(`write ${this.uri} ${content.length}`); }
  move(to: File, _o?: { overwrite?: boolean }) { log.push(`move ${this.uri} -> ${to.uri}`); this.uri = to.uri; }
  delete() { log.push(`delete ${this.uri}`); }
}
export const Paths = { cache: { uri: 'cache' } };
