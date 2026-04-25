// ═══════════════════════════════════════════════════════════════
// DATABASE STORE — persistance centrale Kaleido via localStorage
// ═══════════════════════════════════════════════════════════════

const DB_KEY = "kaleido_database";
const DB_BACKUP_KEY = "kaleido_database_backup";

const asArray = (value) => (Array.isArray(value) ? value : []);

const canUseStorage = () => {
  try {
    return typeof window !== "undefined" && typeof localStorage !== "undefined";
  } catch {
    return false;
  }
};

const safeParseJSON = (value) => {
  try {
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};

const readStorageJSON = (key) => {
  if (!canUseStorage()) return null;
  return safeParseJSON(localStorage.getItem(key));
};

const writeStorageJSON = (key, value) => {
  if (!canUseStorage()) return false;

  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn("[KALEIDO] writeStorageJSON error:", error);
    return false;
  }
};

const toSafeNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

export const getDefaultDatabase = () => ({
  projectsPersonal: [
    { id: 1, name: "Écharpe hiver", rang: 42, total: 80, colorIdx: 0, image: null, type: "tricot", laine: "", outil: "", notes: "", parties: [] },
    { id: 2, name: "Tuque Noël", rang: 15, total: 30, colorIdx: 1, image: null, type: "crochet", laine: "", outil: "", notes: "", parties: [] },
    { id: 3, name: "Mitaines bébé", rang: 8, total: 20, colorIdx: 2, image: null, type: "tricot", laine: "", outil: "", notes: "", parties: [] },
  ],
  projectsPro: [],
  patrons: [],
  settings: { lastProjectId: 3, lastPatronId: 0 },
});

const computeLastProjectId = (projectsPersonal, projectsPro, fallback = 0) => {
  const ids = [...asArray(projectsPersonal), ...asArray(projectsPro)]
    .map((project) => Number(project?.id))
    .filter((id) => Number.isFinite(id));
  return Math.max(fallback, 0, ...ids);
};

const computeLastPatronId = (patrons, fallback = 0) => {
  const ids = asArray(patrons)
    .map((patron) => Number(patron?.id))
    .filter((id) => Number.isFinite(id));
  return Math.max(fallback, 0, ...ids);
};

const isLikelyInlineMedia = (value) => {
  if (typeof value !== "string") return false;
  return value.startsWith("data:") || value.length > 1200;
};

const cleanImageReference = (image) => {
  if (!image) return null;

  // Ancien format : image directement en base64 dans la base.
  // La migration App.jsx doit déjà l'avoir transférée dans IndexedDB.
  if (typeof image === "string") {
    return isLikelyInlineMedia(image) ? null : image;
  }

  if (!image || typeof image !== "object") return null;

  const clean = {};
  if (image.imageId) clean.imageId = image.imageId;
  if (image.pos && typeof image.pos === "object") clean.pos = image.pos;
  if (image.scale != null) clean.scale = image.scale;

  // Ne jamais conserver preview/src/data dans localStorage : trop lourd sur Safari iOS.
  return clean.imageId ? clean : null;
};

const stripHeavyMediaFields = (item) => {
  if (!item || typeof item !== "object") return item;

  const clean = { ...item };

  clean.image = cleanImageReference(clean.image);

  delete clean.preview;
  delete clean.src;
  delete clean.data;
  delete clean.pdf;
  delete clean.pdfData;
  delete clean.pdfSrc;
  delete clean.pdfBase64;
  delete clean.pdfs;
  delete clean.images;

  return clean;
};

export const normalizeDatabase = (input) => {
  const raw = input?.database && typeof input.database === "object" ? input.database : input;
  const defaults = getDefaultDatabase();

  if (!raw || typeof raw !== "object") {
    return defaults;
  }

  // Ancien format éventuel : { projects: [...], settings: {...} }
  const legacyProjects = Array.isArray(raw.projects) ? raw.projects : null;

  const projectsPersonalRaw = Array.isArray(raw.projectsPersonal)
    ? raw.projectsPersonal
    : (legacyProjects || []);

  const projectsProRaw = Array.isArray(raw.projectsPro) ? raw.projectsPro : [];
  const patronsRaw = Array.isArray(raw.patrons) ? raw.patrons : [];

  const projectsPersonal = projectsPersonalRaw.map(stripHeavyMediaFields);
  const projectsPro = projectsProRaw.map(stripHeavyMediaFields);
  const patrons = patronsRaw.map(stripHeavyMediaFields);

  const rawSettings = raw.settings && typeof raw.settings === "object" ? raw.settings : {};
  const lastProjectId = computeLastProjectId(
    projectsPersonal,
    projectsPro,
    toSafeNumber(rawSettings.lastProjectId, 0)
  );
  const lastPatronId = computeLastPatronId(
    patrons,
    toSafeNumber(rawSettings.lastPatronId, 0)
  );

  return {
    projectsPersonal,
    projectsPro,
    patrons,
    settings: {
      ...rawSettings,
      lastProjectId,
      lastPatronId,
    },
  };
};

export const isValidDatabase = (data) => {
  return !!data
    && typeof data === "object"
    && Array.isArray(data.projectsPersonal)
    && Array.isArray(data.projectsPro)
    && Array.isArray(data.patrons)
    && !!data.settings
    && typeof data.settings === "object";
};

export const saveDatabase = (data) => {
  if (!canUseStorage()) return false;

  const normalized = normalizeDatabase(data);

  if (!isValidDatabase(normalized)) {
    console.warn("[KALEIDO] saveDatabase ignoré: base invalide après normalisation.");
    return false;
  }

  try {
    const current = readStorageJSON(DB_KEY);
    if (current && isValidDatabase(normalizeDatabase(current))) {
      // Sauvegarder un backup déjà nettoyé, jamais un backup lourd.
      writeStorageJSON(DB_BACKUP_KEY, normalizeDatabase(current));
    }

    const ok = writeStorageJSON(DB_KEY, normalized);
    if (!ok) return false;

    const reread = normalizeDatabase(readStorageJSON(DB_KEY));
    return isValidDatabase(reread);
  } catch (error) {
    console.warn("[KALEIDO] saveDatabase error:", error);
    return false;
  }
};

export const loadDatabase = () => {
  if (!canUseStorage()) return getDefaultDatabase();

  const saved = readStorageJSON(DB_KEY);
  if (saved) {
    const normalized = normalizeDatabase(saved);
    if (isValidDatabase(normalized)) return normalized;
  }

  const backup = readStorageJSON(DB_BACKUP_KEY);
  if (backup) {
    const normalizedBackup = normalizeDatabase(backup);
    if (isValidDatabase(normalizedBackup)) {
      writeStorageJSON(DB_KEY, normalizedBackup);
      return normalizedBackup;
    }
  }

  return getDefaultDatabase();
};

export const importDatabase = (data) => {
  const normalized = normalizeDatabase(data);
  const saved = saveDatabase(normalized);

  if (!saved) {
    throw new Error("La base restaurée n’a pas pu être sauvegardée dans le navigateur. Le fichier est peut-être encore trop lourd pour Safari.");
  }

  return normalized;
};

