import { parseProgram } from './program-loader.js';

// 编辑器、音乐和发布会共用目录、解析与缓存，配置只引用目录中的 ID。
export class StageProgramLibrary {
  constructor(base, fetcher = url => fetch(url)) { this.base = base; this.fetcher = fetcher; this.entries = null; this.pendingCatalog = null; this.cache = new Map(); }
  async catalog() {
    if (this.entries) return this.entries;
    if (!this.pendingCatalog) {
      this.pendingCatalog = (async () => {
        const response = await this.fetcher(new URL('shows/catalog.json', this.base));
        if (!response.ok) throw new Error('效果目录加载失败');
        this.entries = await response.json(); return this.entries;
      })().finally(() => { this.pendingCatalog = null; });
    }
    return this.pendingCatalog;
  }
  async get(id) {
    const entry = (await this.catalog()).find(entry => entry.id === id);
    if (!entry) throw new Error(`当前效果库没有节目：${id}`);
    if (!this.cache.has(id)) {
      const promise = (async () => {
        const response = await this.fetcher(new URL(entry.file, this.base));
        if (!response.ok) throw new Error(`效果加载失败：${entry.name}`);
        return parseProgram(await response.arrayBuffer(), entry);
      })();
      this.cache.set(id, promise);
      promise.catch(() => { if (this.cache.get(id) === promise) this.cache.delete(id); });
    }
    return this.cache.get(id);
  }
  async load(ids) { return new Map(await Promise.all([...new Set(ids)].map(async id => [id, await this.get(id)]))); }
}
