import type { StorageAdapter } from "./types";
import { OPFSAdapter } from "./opfs-adapter";
import { IndexedDBAdapter } from "./indexeddb-adapter";

type StoredFile = { blob: Blob; name: string; type: string; lastModified: number };

/** Keep existing OPFS files readable; use IndexedDB when file-system writes fail. */
export class MediaFileAdapter implements StorageAdapter<File> {
  private primary: StorageAdapter<File>;
  private fallback: IndexedDBAdapter<StoredFile>;
  constructor(directoryName: string) {
    this.primary = new OPFSAdapter(directoryName);
    this.fallback = new IndexedDBAdapter<StoredFile>({
      dbName: `video-editor-file-fallback-${directoryName}`, storeName: "files",
    });
  }
  async get(key: string): Promise<File | null> {
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
      if ((error as Error).name === "QuotaExceededError") throw error;
      // Blob structured cloning works without FileSystemWritableFileStream.
      await this.fallback.set({key, value: {
        blob: value, name: value.name, type: value.type, lastModified: value.lastModified,
      }});
      return;
    }
    await this.fallback.remove(key);
  }
  async remove(key: string): Promise<void> {
    await this.fallback.remove(key);
    if (OPFSAdapter.isSupported()) await this.primary.remove(key);
  }
  async list(): Promise<string[]> {
    const fallbackKeys = await this.fallback.list();
    const primaryKeys = OPFSAdapter.isSupported() ? await this.primary.list() : [];
    return [...new Set([...primaryKeys, ...fallbackKeys])];
  }
  async clear(): Promise<void> {
    await this.fallback.clear();
    if (OPFSAdapter.isSupported()) await this.primary.clear();
  }
}
