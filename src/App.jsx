const asArray = (value) => (Array.isArray(value) ? value : []);

const asDatabase = (database) => (database && typeof database === "object" ? database : {});

const normalizeProjectId = (project) => {
  const rawId = Number(project?.id);
  return Number.isFinite(rawId) && rawId > 0 ? rawId : Date.now();
};

export const getProProjects = (database) => asArray(database?.projectsPro);

const withCreatedProProject = (database, project) => {
  const safeDb = asDatabase(database);
  const safeProject = project && typeof project === "object" ? project : {};
  const projectId = normalizeProjectId(safeProject);
  const finalProject = { ...safeProject, id: projectId };

  return {
    ...safeDb,
    projectsPro: [...getProProjects(safeDb), finalProject],
    settings: {
      ...(safeDb.settings || {}),
      lastProjectId: Math.max(Number(safeDb.settings?.lastProjectId) || 0, projectId),
    },
  };
};

const withUpdatedProProject = (database, projectId, updates = {}) => {
  const safeDb = asDatabase(database);

  return {
    ...safeDb,
    projectsPro: getProProjects(safeDb).map((project) =>
      project.id === projectId ? { ...project, ...updates } : project
    ),
  };
};

const withDeletedProProject = (database, projectId) => {
  const safeDb = asDatabase(database);

  return {
    ...safeDb,
    projectsPro: getProProjects(safeDb).filter((project) => project.id !== projectId),
  };
};

export const createProProject = (setDatabase, saveToDatabase, project) => {
  const safeProject = project && typeof project === "object" ? project : {};
  let finalProject = { ...safeProject, id: normalizeProjectId(safeProject) };

  setDatabase((prev) => {
    finalProject = {
      ...finalProject,
      id: Number(finalProject.id) || normalizeProjectId(finalProject),
    };

    const nextDb = withCreatedProProject(prev, finalProject);
    saveToDatabase(nextDb);
    return nextDb;
  });

  return finalProject;
};

export const updateProProjectRecord = (setDatabase, saveToDatabase, projectId, updates = {}) => {
  setDatabase((prev) => {
    const nextDb = withUpdatedProProject(prev, projectId, updates);
    saveToDatabase(nextDb);
    return nextDb;
  });
};

export const deleteProProjectRecord = (setDatabase, saveToDatabase, projectId) => {
  setDatabase((prev) => {
    const nextDb = withDeletedProProject(prev, projectId);
    saveToDatabase(nextDb);
    return nextDb;
  });
};

export const findProProject = (database, projectId) => {
  return getProProjects(database).find((project) => project.id === projectId) || null;
};
