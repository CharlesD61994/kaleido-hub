import React, { useEffect, useMemo, useState } from "react";

const DB_KEY = "kaleido_database";

const KALEIDOSCOPE_COLORS = [
  { bg: "#7C3AED", light: "#A78BFA" },
  { bg: "#EC4899", light: "#F9A8D4" },
  { bg: "#F97316", light: "#FDBA74" },
  { bg: "#06B6D4", light: "#67E8F9" },
  { bg: "#10B981", light: "#6EE7B7" },
  { bg: "#EAB308", light: "#FDE68A" },
  { bg: "#3B82F6", light: "#93C5FD" },
  { bg: "#EF4444", light: "#FCA5A5" },
];

function safeParseJSON(value) {
  try {
    return value ? JSON.parse(value) : null;
  } catch (e) {
    return null;
  }
}

function readLocalDatabase() {
  if (typeof window === "undefined" || typeof localStorage === "undefined") return null;
  return safeParseJSON(localStorage.getItem(DB_KEY));
}

function writeLocalDatabase(nextDb) {
  if (typeof window === "undefined" || typeof localStorage === "undefined") return false;
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(nextDb));
    return true;
  } catch (e) {
    console.warn("[Kaleido Pro] Impossible d'écrire la base locale:", e);
    return false;
  }
}

function getProjectsFromDatabase(database) {
  if (!database || typeof database !== "object" || !Array.isArray(database.projectsPro)) {
    return [];
  }
  return database.projectsPro;
}

function computeProgress(project) {
  if (!project || typeof project !== "object") return 0;

  if (typeof project.rang === "number" && typeof project.total === "number" && project.total > 0) {
    return Math.max(0, Math.min(100, Math.round((project.rang / project.total) * 100)));
  }

  if (typeof project.progress === "number") {
    return Math.max(0, Math.min(100, Math.round(project.progress)));
  }

  return 0;
}

function getProjectSubtitle(project) {
  const parts = [];

  if (project?.client) parts.push(project.client);
  if (project?.type) parts.push(project.type);
  if (typeof project?.rang === "number" && typeof project?.total === "number") {
    parts.push(`${project.rang} / ${project.total} rangs`);
  }

  return parts.join(" • ");
}

function ProCard({ project, onOpen }) {
  const color = KALEIDOSCOPE_COLORS[(project?.colorIdx || 0) % KALEIDOSCOPE_COLORS.length];
  const progress = computeProgress(project);

  const handleOpen = () => {
    if (typeof onOpen === "function") onOpen(project);
  };

  return (
    <button
      onClick={handleOpen}
      style={{
        position: "relative",
        overflow: "hidden",
        padding: 18,
        marginBottom: 12,
        borderRadius: 22,
        background: "linear-gradient(180deg, rgba(26,26,46,0.96), rgba(20,20,36,0.96))",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "0 12px 36px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.05)",
        width: "100%",
        textAlign: "left",
        cursor: "pointer",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "auto -40px -40px auto",
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${color.bg}55 0%, ${color.bg}10 48%, transparent 72%)`,
          pointerEvents: "none",
        }}
      />

      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        <div
          style={{
            width: 54,
            height: 54,
            borderRadius: 18,
            background: `linear-gradient(135deg, ${color.bg}, ${color.light})`,
            boxShadow: `0 10px 22px ${color.bg}33, inset 0 1px 0 rgba(255,255,255,0.18)`,
            flexShrink: 0,
          }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              color: "#F6F3FF",
              fontSize: 22,
              fontWeight: 700,
              lineHeight: 1.08,
              letterSpacing: "-0.02em",
              marginBottom: 6,
            }}
          >
            {project?.name || "Projet sans nom"}
          </div>

          {getProjectSubtitle(project) ? (
            <div
              style={{
                color: color.light,
                opacity: 0.95,
                fontSize: 13,
                lineHeight: 1.35,
                marginBottom: 12,
              }}
            >
              {getProjectSubtitle(project)}
            </div>
          ) : null}

          <div
            style={{
              height: 12,
              borderRadius: 999,
              background: "rgba(255,255,255,0.08)",
              overflow: "hidden",
              marginBottom: 8,
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                borderRadius: 999,
                background: `linear-gradient(90deg, ${color.bg}, ${color.light})`,
                boxShadow: `0 0 18px ${color.light}55`,
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div style={{ color: "#B9B3C9", fontSize: 13 }}>
              Progression
            </div>
            <div style={{ color: "#FFFFFF", fontSize: 15, fontWeight: 700 }}>
              {progress}%
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

export default function AppPro({ database, onProjectOpen }) {
  const [projectsPro, setProjectsPro] = useState(() => {
    const localDb = readLocalDatabase();
    return getProjectsFromDatabase(localDb).length > 0
      ? getProjectsFromDatabase(localDb)
      : getProjectsFromDatabase(database);
  });

  useEffect(() => {
    const localDb = readLocalDatabase();
    const nextProjects =
      getProjectsFromDatabase(localDb).length > 0
        ? getProjectsFromDatabase(localDb)
        : getProjectsFromDatabase(database);

    setProjectsPro(nextProjects);
  }, [database]);

  const projectCountLabel = useMemo(() => {
    return `${projectsPro.length} projet${projectsPro.length > 1 ? "s" : ""}`;
  }, [projectsPro.length]);

  const handleCreateProProject = () => {
    const localDb = readLocalDatabase() || database;

    if (!localDb || typeof localDb !== "object") {
      alert("Impossible de lire la base locale pour créer un projet pro.");
      return;
    }

    const currentProjectsPro = Array.isArray(localDb.projectsPro) ? localDb.projectsPro : [];
    const currentSettings =
      localDb.settings && typeof localDb.settings === "object"
        ? localDb.settings
        : { lastProjectId: 0, lastPatronId: 0 };

    const nextId =
      typeof currentSettings.lastProjectId === "number"
        ? currentSettings.lastProjectId + 1
        : currentProjectsPro.reduce((maxId, p) => Math.max(maxId, Number(p?.id) || 0), 0) + 1;

    const nextProject = {
      id: nextId,
      name: `Projet pro ${nextId}`,
      client: "",
      rang: 0,
      total: 1,
      colorIdx: currentProjectsPro.length % KALEIDOSCOPE_COLORS.length,
      image: null,
      projectType: "custom",
      type: "crochet",
      laine: "",
      outil: "",
      notes: "",
      parties: [],
      patronId: null,
      linkMode: "detached",
      status: "en_cours",
      createdAt: new Date().toISOString(),
    };

    const nextDb = {
      ...localDb,
      projectsPro: [...currentProjectsPro, nextProject],
      settings: {
        ...currentSettings,
        lastProjectId: nextId,
      },
    };

    const ok = writeLocalDatabase(nextDb);
    if (!ok) {
      alert("Impossible d'enregistrer le projet pro.");
      return;
    }

    setProjectsPro(nextDb.projectsPro);
  };

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            color: "#F6F3FF",
            fontSize: 28,
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: "-0.04em",
            marginBottom: 8,
          }}
        >
          Professionnel
        </div>
        <div
          style={{
            color: "#B8B2C8",
            fontSize: 14,
            lineHeight: 1.45,
            marginBottom: 14,
          }}
        >
          Projets professionnels enregistrés dans la base actuelle.
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={handleCreateProProject}
            style={{
              padding: "12px 16px",
              minHeight: 44,
              borderRadius: 14,
              border: "none",
              background: "linear-gradient(135deg, #7C3AED, #DB2777)",
              color: "#fff",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 8px 22px rgba(124,58,237,0.24)",
            }}
          >
            Créer un projet pro
          </button>

          <div style={{ color: "#A79FB7", fontSize: 13 }}>{projectCountLabel}</div>
        </div>
      </div>

      <div style={{ padding: "4px 0 100px" }}>
        {projectsPro.length === 0 ? (
          <div
            style={{
              padding: 22,
              borderRadius: 22,
              background: "linear-gradient(180deg, rgba(26,26,46,0.96), rgba(20,20,36,0.96))",
              border: "1px solid rgba(255,255,255,0.06)",
              color: "#D7D0E7",
            }}
          >
            Aucun projet professionnel enregistré dans la base actuelle.
          </div>
        ) : (
          projectsPro.map((project) => (
            <ProCard
              key={project.id || project.name}
              project={project}
              onOpen={onProjectOpen}
            />
          ))
        )}
      </div>
    </>
  );
}
