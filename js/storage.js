/**
 * VideoForge - Persistent Project & Gallery Storage via IndexedDB + LocalStorage fallback
 */
export const Storage = (() => {
  const DB_NAME = 'VideoForgeDB';
  const DB_VERSION = 1;
  let db = null;

  const open = () => new Promise((res) => {
    if (!window.indexedDB) { res(null); return; }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const d = e.target.result;
      if (!d.objectStoreNames.contains('projects')) d.createObjectStore('projects', { keyPath: 'id' });
      if (!d.objectStoreNames.contains('gallery')) d.createObjectStore('gallery', { keyPath: 'id' });
    };
    req.onsuccess = (e) => { db = e.target.result; res(db); };
    req.onerror = () => res(null);
  });

  const dbOp = async (store, mode, op) => {
    if (!db) await open();
    if (!db) return null;
    return new Promise((res) => {
      try {
        const tx = db.transaction(store, mode);
        const st = tx.objectStore(store);
        const req = op(st);
        req.onsuccess = () => res(req.result);
        req.onerror = () => res(null);
      } catch (e) { res(null); }
    });
  };

  // LocalStorage fallback helpers
  const lsGet = (key) => { try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; } };
  const lsSet = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} };

  const lsUpsert = (key, item) => {
    const list = lsGet(key);
    const idx = list.findIndex(x => x.id === item.id);
    // Strip blob/objectURL data for localStorage
    const safe = { ...item };
    delete safe.blobURL; delete safe.blob;
    if (idx >= 0) list[idx] = safe; else list.unshift(safe);
    lsSet(key, list);
  };
  const lsDel = (key, id) => lsSet(key, lsGet(key).filter(x => x.id !== id));

  return {
    async init() { await open(); },

    async getProjects() {
      const result = await dbOp('projects', 'readonly', (st) => st.getAll());
      return result || lsGet('vf_projects');
    },
    async saveProject(proj) {
      proj.id = proj.id || ('proj_' + Date.now());
      proj.updatedAt = Date.now();
      await dbOp('projects', 'readwrite', (st) => st.put(proj));
      lsUpsert('vf_projects', proj);
      return proj;
    },
    async deleteProject(id) {
      await dbOp('projects', 'readwrite', (st) => st.delete(id));
      lsDel('vf_projects', id);
    },

    async getGallery() {
      const result = await dbOp('gallery', 'readonly', (st) => st.getAll());
      return result || lsGet('vf_gallery');
    },
    async saveGalleryItem(item) {
      item.id = item.id || ('asset_' + Date.now());
      item.createdAt = item.createdAt || Date.now();
      await dbOp('gallery', 'readwrite', (st) => st.put(item));
      lsUpsert('vf_gallery', item);
      return item;
    },
    async deleteGalleryItem(id) {
      await dbOp('gallery', 'readwrite', (st) => st.delete(id));
      lsDel('vf_gallery', id);
    }
  };
})();
