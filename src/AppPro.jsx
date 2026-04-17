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
  if (!project || typeof project !== "object") return 0;

  if (typeof project.rang === "number" && typeof project.total === "number" && project.total > 0) {
    return Math.max(0, Math.min(100, Math.round((project.rang / project.total) * 100)));
  }

  if (typeof project.progress === "number") {
    return Math.max(0, Math.min(100, Math.round(project.progress)));
  }

  return 0;
}

function YarnGlyph() {
  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="11.5" r="6.8" />
    </svg>
  );
}

function ProBubble({ project, onOpen }) {
  const color = KALEIDOSCOPE_COLORS[(project?.colorIdx || 0) % KALEIDOSCOPE_COLORS.length];
  const progress = computeProgress(project);
  const size = "clamp(94px, 27vw, 108px)"; // 👈 inchangé

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "10px 4px 14px" }}>
      
      <button
        onClick={() => onOpen(project)}
        style={{
          position: "relative",
          width: size,
          height: size,
          background: "none",
          border: "none",
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
      </button>

      <div style={{ color: "#F1F0EE", fontSize: 12 }}>
        {project.name}
      </div>
    </div>
  );
}

export default function AppPro({
  projectsPro = [],
  onProjectOpen,
  onCreateProProject,
}) {
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

            // ✅ SEULE MODIF
            rowGap: 20,
            columnGap: 24,
            padding: "0 12px",

            justifyItems: "center",
            alignItems: "start",
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