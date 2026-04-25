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

export const normalizeDatabase = (input) => {
  const raw = input?.database && typeof input.database === "object" ? input.database : input;
  const defaults = getDefaultDatabase();

  if (!raw || typeof raw !== "object") {
    return defaults;
  }

  // Ancien format éventuel : { projects: [...], settings: {...} }
  const legacyProjects = Array.isArray(raw.projects) ? raw.projects : null;

  const projectsPersonal = Array.isArray(raw.projectsPersonal)
    ? raw.projectsPersonal
    : (legacyProjects || []);

  const projectsPro = Array.isArray(raw.projectsPro) ? raw.projectsPro : [];
  const patrons = Array.isArray(raw.patrons) ? raw.patrons : [];

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
    throw new Error("La base restaurée n’a pas pu être sauvegardée dans le navigateur.");
  }

  return normalized;
};
