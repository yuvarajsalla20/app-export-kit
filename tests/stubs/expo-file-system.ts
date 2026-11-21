// Stand-in for expo-file-system: records what the kit does to files.
// Like the real module (58.x), write() and move() return Promises and only finish later, so a missing `await`
// shows up in the log order; create() and delete() stay synchronous, as they are there.
export const log: string[] = [];

/** Set to make the next write() or move() fail, as a full disk or a missing file would. */
export const failNext: { write?: Error; move?: Error } = {};

const later = () => new Promise<void>((resolve) => setTimeout(resolve, 5));

export class File {
  uri: string;
  constructor(...parts: (string | { uri: string })[]) {
    this.uri = parts.map((p) => (typeof p === 'string' ? p : p.uri)).join('/');
  }
  create(_o?: { overwrite?: boolean }): void { log.push(`create ${this.uri}`); }
  async write(content: string | Uint8Array | ArrayBuffer): Promise<void> {
    await later();
    const error = failNext.write;
    delete failNext.write;
    if (error) throw error;
    log.push(`write ${this.uri} ${typeof content === 'string' ? content.length : content.byteLength}`);
  }
  writeSync(content: string | Uint8Array | ArrayBuffer): void {
    log.push(`write ${this.uri} ${typeof content === 'string' ? content.length : content.byteLength}`);
  }
  async move(to: File, _o?: { overwrite?: boolean }): Promise<void> {
    await later();
    const error = failNext.move;
    delete failNext.move;
    if (error) throw error;
    log.push(`move ${this.uri} -> ${to.uri}`);
    this.uri = to.uri;
  }
  moveSync(to: File, _o?: { overwrite?: boolean }): void { log.push(`move ${this.uri} -> ${to.uri}`); this.uri = to.uri; }
  delete(): void { log.push(`delete ${this.uri}`); }
}
export const Paths = { cache: { uri: 'cache' } };
