import { IndexedDBAdapter } from './indexeddb-adapter';
import type { StorageAdapter } from './types';
type Manifest = { name: string; type: string; lastModified: number; size: number; keys: string[] };
const CHUNK_SIZE = 1024 * 1024;
/** Safari may reject cloning a Photos File/Blob. Store independent byte arrays instead. */
export class ChunkedFileStore implements StorageAdapter<File> {
  private manifests: IndexedDBAdapter<Manifest>;
  private chunks: IndexedDBAdapter<{bytes: Uint8Array}>;
  constructor(directory: string) {
    this.manifests = new IndexedDBAdapter({dbName:`capcut-byte-files-${directory}`,storeName:'manifests'});
    this.chunks = new IndexedDBAdapter({dbName:`capcut-byte-chunks-${directory}`,storeName:'chunks'});
  }
  async get(key: string): Promise<File | null> {
    const manifest = await this.manifests.get(key);
    if (!manifest) return null;
    const parts: Uint8Array[] = [];
    for (const id of manifest.keys) {
      const chunk = await this.chunks.get(id);
      if (!chunk) throw new Error('Falta una parte del video guardado. Vuelve a importar el archivo.');
      parts.push(chunk.bytes);
    }
    const file = new File(parts,manifest.name,{type:manifest.type,lastModified:manifest.lastModified});
    if (file.size !== manifest.size) throw new Error('El video guardado está incompleto. Vuelve a importarlo.');
    return file;
  }
  async set({key,value}: {key:string;value:File}): Promise<void> {
    const old = await this.manifests.get(key);
    const keys: string[] = [];
    const version = crypto.randomUUID();
    try {
      for (let offset=0;offset<value.size;offset+=CHUNK_SIZE) {
        const id=`${key}:${version}:${keys.length}`;
        const bytes=new Uint8Array(await value.slice(offset,offset+CHUNK_SIZE).arrayBuffer());
        if (!bytes.length) throw new Error('No se pudo leer el video seleccionado. Descárgalo de iCloud y vuelve a seleccionarlo.');
        keys.push(id);
        await this.chunks.set({key:id,value:{bytes}});
      }
      // Publish the manifest only after every chunk is committed.
      await this.manifests.set({key,value:{name:value.name,type:value.type,lastModified:value.lastModified,size:value.size,keys}});
    } catch (error) {
      await Promise.allSettled(keys.map(id=>this.chunks.remove(id)));
      throw error;
    }
    if(old) await Promise.allSettled(old.keys.map(id=>this.chunks.remove(id)));
  }
  async remove(key: string): Promise<void> {
    const manifest=await this.manifests.get(key);
    await this.manifests.remove(key);
    if(manifest) await Promise.all(manifest.keys.map(id=>this.chunks.remove(id)));
  }
  list(){return this.manifests.list();}
  async clear(){await this.manifests.clear();await this.chunks.clear();}
}
