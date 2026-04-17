import React, { useMemo } from "react";

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

function computeProgress(project) {
  if (!project) return 0;
  if (project.rang && project.total) {
    return Math.round((project.rang / project.total) * 100);
  }
  return project.progress || 0;
}

function ProBubble({ project, onOpen }) {
  const color = KALEIDOSCOPE_COLORS[(project?.colorIdx || 0) % KALEIDOSCOPE_COLORS.length];
  const progress = computeProgress(project);

  const size = "clamp(86px, 24vw, 98px)";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div
        onClick={() => onOpen(project)}
        style={{
          position: "relative",
          width: size,
          height: size,
          borderRadius: "50%",
          cursor: "pointer",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${color.bg}66, transparent 70%)`,
            boxShadow: `0 0 20px ${color.bg}`,
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: "10%",
            borderRadius: "50%",
            background: color.bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: 24,
          }}
        >
          🧶
        </div>

        <svg viewBox="0 0 110 110" style={{ position: "absolute", inset: 0 }}>
          <circle cx="55" cy="55" r="50" stroke="rgba(255,255,255,0.1)" strokeWidth="4" fill="none" />
          <circle
            cx="55"
            cy="55"
            r="50"
            stroke={color.light}
            strokeWidth="4"
            fill="none"
            strokeDasharray={314}
            strokeDashoffset={314 * (1 - progress / 100)}
            transform="rotate(-90 55 55)"
          />
        </svg>
      </div>

      <div style={{ color: "#F1F0EE", fontSize: 12 }}>{project.name}</div>
    </div>
  );
}

export default function AppPro({ projectsPro = [], onProjectOpen, onCreateProProject }) {
  const label = useMemo(() => `${projectsPro.length} projets`, [projectsPro.length]);

  return (
    <>
      <div style={{ marginBottom: 12 }}>
        <h1 style={{ color: "#F1F0EE" }}>Professionnel</h1>
        <div style={{ color: "#6B6A7A" }}>{label}</div>
      </div>

      <div style={{ padding: "4px 10px 100px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            rowGap: 18,
            columnGap: 22,
            justifyItems: "center",
            alignItems: "start",
            padding: "0 10px",
          }}
        >
          {projectsPro.map((project) => (
            <ProBubble key={project.id} project={project} onOpen={onProjectOpen} />
          ))}
        </div>
      </div>

      <button
        onClick={onCreateProProject}
        style={{
          position: "fixed",
          bottom: 28,
          right: 20,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #7C3AED, #EC4899)",
          border: "none",
          color: "#fff",
          fontSize: 28,
          cursor: "pointer",
        }}
      >
        +
      </button>
    </>
  );
}
