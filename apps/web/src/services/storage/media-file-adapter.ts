import { ChunkedFileStore } from "./chunked-file-store";
import type { StorageAdapter } from "./types";
import { OPFSAdapter } from "./opfs-adapter";
import { IndexedDBAdapter } from "./indexeddb-adapter";

type StoredFile = { blob: Blob; name: string; type: string; lastModified: number };

/** Keep existing OPFS files readable; use IndexedDB when file-system writes fail. */
export class MediaFileAdapter implements StorageAdapter<File> {
  private primary: StorageAdapter<File>;
  private fallback: IndexedDBAdapter<StoredFile>;
  private bytes: ChunkedFileStore;
  constructor(directoryName: string) {
    this.primary = new OPFSAdapter(directoryName);
    this.bytes = new ChunkedFileStore(directoryName);
    this.fallback = new IndexedDBAdapter<StoredFile>({
      dbName: `video-editor-file-fallback-${directoryName}`, storeName: "files",
    });
  }
  async get(key: string): Promise<File | null> {
    const byteFile = await this.bytes.get(key);
    if (byteFile) return byteFile;
    const saved = await this.fallback.get(key);
    if (saved) return new File([saved.blob], saved.name, {type: saved.type, lastModified: saved.lastModified});
    try { return await this.primary.get(key); }
    catch (error) {
      if (!OPFSAdapter.isSupported() || error instanceof TypeError || (error as Error).name === "NotSupportedError") return null;
      throw error;
    }
  }
  async set({key, value}: {key: string; value: File}): Promise<void> {
    try {
      await this.primary.set({key, value});
    } catch (error) {
      // Use byte chunks, not a structured-cloned Photos File or Blob.
      await this.bytes.set({key,value});
      return;
    }
    // A housekeeping failure must not reject a successfully saved video.
    await Promise.allSettled([this.fallback.remove(key),this.bytes.remove(key)]);
  }

  async remove(key: string): Promise<void> {
    await this.fallback.remove(key);
    await this.bytes.remove(key);
    if (OPFSAdapter.isSupported()) await this.primary.remove(key);
  }
  async list(): Promise<string[]> {
    const fallbackKeys = [...await this.fallback.list(), ...await this.bytes.list()];
    const primaryKeys = OPFSAdapter.isSupported() ? await this.primary.list() : [];
    return [...new Set([...primaryKeys, ...fallbackKeys])];
  }
  async clear(): Promise<void> {
    await this.fallback.clear();
    await this.bytes.clear();
    if (OPFSAdapter.isSupported()) await this.primary.clear();
  }
}
