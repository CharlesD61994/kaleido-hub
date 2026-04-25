// ═══════════════════════════════════════════════════════════════
// MEDIA STORE — PDFs + Images via IndexedDB
// ═══════════════════════════════════════════════════════════════

const openIndexedDb = (dbName, storeName) => {
  let db = null;

  return () => new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB n’est pas disponible dans cet environnement."));
      return;
    }

    if (db) {
      resolve(db);
      return;
    }

    const req = indexedDB.open(dbName, 1);

    req.onupgradeneeded = (event) => {
      const database = event.target.result;
      if (!database.objectStoreNames.contains(storeName)) {
        database.createObjectStore(storeName, { keyPath: "id" });
      }
    };

    req.onsuccess = (event) => {
      db = event.target.result;
      resolve(db);
    };

    req.onerror = () => reject(req.error);
  });
};

const pdfDb = openIndexedDb("kaleido_pdfs", "pdfs");
const imageDb = openIndexedDb("kaleido_images", "images");

// Cache mémoire court terme : évite le flash quand React remonte une bulle
// pendant une navigation entre modules. IndexedDB reste la source persistante.
const mediaMemoryCache = {
  pdfs: new Map(),
  images: new Map(),
};

export const getCachedPdf = (id) => (id ? mediaMemoryCache.pdfs.get(id) || null : null);
export const getCachedImage = (id) => (id ? mediaMemoryCache.images.get(id) || null : null);

const getCacheForStore = (storeName) => storeName === "images" ? mediaMemoryCache.images : mediaMemoryCache.pdfs;

const putIntoStore = async (openDb, storeName, id, data) => {
  const db = await openDb();

  await new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    tx.objectStore(storeName).put({ id, data });
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });

  getCacheForStore(storeName).set(id, data);
  return true;
};

const getFromStore = async (openDb, storeName, id) => {
  if (!id) return null;

  const cache = getCacheForStore(storeName);
  if (cache.has(id)) return cache.get(id) || null;

  const db = await openDb();

  return await new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const req = tx.objectStore(storeName).get(id);
    req.onsuccess = () => {
      const data = req.result?.data || null;
      if (data) cache.set(id, data);
      resolve(data);
    };
    req.onerror = () => reject(req.error);
  });
};

const deleteFromStore = async (openDb, storeName, id) => {
  if (!id) return false;

  const db = await openDb();

  await new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    tx.objectStore(storeName).delete(id);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });

  getCacheForStore(storeName).delete(id);
  return true;
};

export const savePdf = async (id, data) => {
  try {
    return await putIntoStore(pdfDb, "pdfs", id, data);
  } catch (error) {
    console.error("savePdf error:", error);
    return false;
  }
};

export const loadPdf = async (id) => {
  try {
    const data = await getFromStore(pdfDb, "pdfs", id);
    return typeof data === "string" ? data : null;
  } catch (error) {
    console.error("loadPdf error:", error);
    return null;
  }
};

export const deletePdf = async (id) => {
  try {
    return await deleteFromStore(pdfDb, "pdfs", id);
  } catch (error) {
    console.error("deletePdf error:", error);
    return false;
  }
};

export const saveImage = async (id, data) => {
  try {
    return await putIntoStore(imageDb, "images", id, data);
  } catch (error) {
    console.error("saveImage error:", error);
    return false;
  }
};

export const loadImage = async (id) => {
  try {
    return await getFromStore(imageDb, "images", id);
  } catch (error) {
    console.error("loadImage error:", error);
    return null;
  }
};

export const deleteImage = async (id) => {
  try {
    return await deleteFromStore(imageDb, "images", id);
  } catch (error) {
    console.error("deleteImage error:", error);
    return false;
  }
};


