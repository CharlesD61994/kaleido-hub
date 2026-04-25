// ═══════════════════════════════════════════════════════════════
// PATRON STORE — gestion des patrons + brouillons d'éditeur
// ═══════════════════════════════════════════════════════════════

const PATRON_BACKUP_KEY = "kaleido_patron_backup";

const asArray = (value) => (Array.isArray(value) ? value : []);

const asDatabase = (database) => (database && typeof database === "object" ? database : {});

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

const clearStorageKey = (key) => {
  if (!canUseStorage()) return false;

  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn("[KALEIDO] clearStorageKey error:", error);
    return false;
  }
};

const computeCustomTotal = (patron) => Math.max(
  1,
  asArray(patron?.parties).reduce(
    (sum, partie) => sum + asArray(partie?.rangs).filter((rang) => !rang?.isNote).length,
    0
  )
);

const normalizePatronId = (patron) => {
  const rawId = Number(patron?.id);
  return Number.isFinite(rawId) && rawId > 0 ? rawId : Date.now();
};

const getPatrons = (database) => asArray(database?.patrons);

const syncLinkedProjectFromPatron = (project, patronId, updatedPatron) => {
  if (!project || typeof project !== "object") return project;
  if (project.patronId !== patronId || !updatedPatron || project.linkMode === "detached") return project;

  if (updatedPatron.projectType === "custom") {
    return {
      ...project,
      name: updatedPatron.name,
      colorIdx: updatedPatron.colorIdx,
      image: updatedPatron.image || null,
      projectType: "custom",
      type: updatedPatron.type,
      laine: updatedPatron.laine,
      outil: updatedPatron.outil,
      notes: updatedPatron.notes,
      parties: updatedPatron.parties || [],
      total: computeCustomTotal(updatedPatron),
    };
  }

  return {
    ...project,
    name: updatedPatron.name,
    colorIdx: updatedPatron.colorIdx,
    image: updatedPatron.image || null,
    projectType: "pdf",
    pdfId: updatedPatron.pdfId,
    pdfParties: updatedPatron.pdfParties || [],
    total: updatedPatron.total || 1,
  };
};

const detachProjectFromPatron = (project, patronId) => {
  if (!project || typeof project !== "object") return project;
  if (project.patronId !== patronId) return project;

  return {
    ...project,
    patronId: null,
    linkMode: "detached",
  };
};

export const addPatronRecord = (setDatabase, saveDatabase, patron) => {
  const safePatron = patron && typeof patron === "object" ? patron : {};
  const patronId = normalizePatronId(safePatron);
  const finalPatron = { ...safePatron, id: patronId };

  setDatabase((prev) => {
    const safeDb = asDatabase(prev);
    const nextDb = {
      ...safeDb,
      patrons: [...getPatrons(safeDb), finalPatron],
      settings: {
        ...(safeDb.settings || {}),
        lastPatronId: Math.max(Number(safeDb.settings?.lastPatronId) || 0, patronId),
      },
    };

    saveDatabase(nextDb);
    return nextDb;
  });

  return finalPatron;
};

export const updatePatronRecord = (setDatabase, saveDatabase, patronId, updates = {}) => {
  setDatabase((prev) => {
    const safeDb = asDatabase(prev);
    const updatedPatrons = getPatrons(safeDb).map((patron) =>
      patron.id === patronId ? { ...patron, ...(updates || {}) } : patron
    );
    const updatedPatron = updatedPatrons.find((patron) => patron.id === patronId);

    const syncProject = (project) => syncLinkedProjectFromPatron(project, patronId, updatedPatron);

    const nextDb = {
      ...safeDb,
      patrons: updatedPatrons,
      projectsPersonal: asArray(safeDb.projectsPersonal).map(syncProject),
      projectsPro: asArray(safeDb.projectsPro).map(syncProject),
    };

    saveDatabase(nextDb);
    return nextDb;
  });

  return updates;
};

export const deletePatronRecord = (setDatabase, saveDatabase, patronId) => {
  setDatabase((prev) => {
    const safeDb = asDatabase(prev);

    const nextDb = {
      ...safeDb,
      patrons: getPatrons(safeDb).filter((patron) => patron.id !== patronId),
      projectsPersonal: asArray(safeDb.projectsPersonal).map((project) => detachProjectFromPatron(project, patronId)),
      projectsPro: asArray(safeDb.projectsPro).map((project) => detachProjectFromPatron(project, patronId)),
    };

    saveDatabase(nextDb);
    return nextDb;
  });
};

export const updatePatronDeep = (setDatabase, saveDatabase, patronId, updater) => {
  if (typeof updater !== "function") return null;

  let persistedPatron = null;

  setDatabase((prev) => {
    const safeDb = asDatabase(prev);

    const updatedPatrons = getPatrons(safeDb).map((patron) => {
      if (patron.id !== patronId) return patron;

      const updated = updater(patron);
      if (!updated || typeof updated !== "object") return patron;

      persistedPatron = {
        ...patron,
        ...updated,
        id: patron.id,
      };

      return persistedPatron;
    });

    if (!persistedPatron) return safeDb;

    const syncProject = (project) => syncLinkedProjectFromPatron(project, patronId, persistedPatron);

    const nextDb = {
      ...safeDb,
      patrons: updatedPatrons,
      projectsPersonal: asArray(safeDb.projectsPersonal).map(syncProject),
      projectsPro: asArray(safeDb.projectsPro).map(syncProject),
    };

    saveDatabase(nextDb);
    return nextDb;
  });

  return persistedPatron;
};

export const loadPatronDraft = ({ sourceId, mode } = {}) => {
  const payload = readStorageJSON(PATRON_BACKUP_KEY);
  if (!payload || typeof payload !== "object") return null;
  if ((payload.mode || null) !== mode) return null;
  if ((payload.sourceId ?? null) !== (sourceId ?? null)) return null;
  return payload.patron && typeof payload.patron === "object" ? payload.patron : null;
};

export const savePatronDraft = ({ label, mode, sourceId, patron } = {}) => {
  return writeStorageJSON(PATRON_BACKUP_KEY, {
    label,
    savedAt: new Date().toISOString(),
    mode,
    sourceId,
    patron,
  });
};

export const clearPatronDraft = ({ sourceId, mode } = {}) => {
  const payload = readStorageJSON(PATRON_BACKUP_KEY);
  if (!payload || typeof payload !== "object") return false;
  if ((payload.mode || null) !== mode) return false;
  if ((payload.sourceId ?? null) !== (sourceId ?? null)) return false;
  return clearStorageKey(PATRON_BACKUP_KEY);
};
