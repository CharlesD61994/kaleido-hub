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
      aria-hidden="true"
    >
      <circle cx="12" cy="11.5" r="6.8" />
      <path d="M7.8 8.8c1.1-.9 2.6-1.4 4.2-1.4 1.8 0 3.4.6 4.5 1.7" />
      <path d="M6.8 11.7c1.4-1.2 3.2-1.9 5.2-1.9 2 0 3.7.7 5.1 2" />
      <path d="M7.6 14.7c1.2-.8 2.7-1.3 4.4-1.3 1.7 0 3.2.4 4.5 1.3" />
      <path d="M8 18.2c1.2-.7 2.5-1 4-1" />
      <path d="M5.6 17.9c1.9.1 3.5.9 4.9 2.6" />
    </svg>
  );
}

function ProBubble({ project, onOpen, onMenuOpen }) {
  const color = KALEIDOSCOPE_COLORS[(project?.colorIdx || 0) % KALEIDOSCOPE_COLORS.length];
  const progress = computeProgress(project);
  const size = "clamp(94px, 27vw, 108px)";

  const handleOpen = () => {
    if (typeof onOpen === "function") onOpen(project);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "10px 4px 14px" }}>
      <button
        onClick={handleOpen}
        style={{
          position: "relative",
          width: size,
          height: size,
          overflow: "visible",
          isolation: "isolate",
          background: "none",
          border: "none",
          padding: 0,
          cursor: "pointer",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            pointerEvents: "none",
            zIndex: 0,
            background: `radial-gradient(circle, ${color.bg}66 0%, ${color.bg}2A 40%, transparent 66%)`,
            boxShadow: `0 0 10px ${color.bg}66, 0 0 22px ${color.bg}33`,
          }}
        />

        <div
          style={{
            width: "86%",
            height: "86%",
            borderRadius: "50%",
            background: `radial-gradient(circle at 35% 35%, ${color.light}38, ${color.bg}CC)`,
            boxShadow:
              `0 2px 21px rgba(0,0,0,0.20), 0 0 0 1px ${color.light}22, inset 0 1px 2px rgba(255,255,255,0.08)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 1,
          }}
        >
          {project?.image ? (
            <img
              src={project.image?.preview || project.image?.src || project.image}
              alt={project?.name || "Projet"}
              loading="lazy"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "50%",
                display: "block",
              }}
            />
          ) : (
            <span style={{ color: "#F8F7FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <YarnGlyph />
            </span>
          )}
        </div>

        <svg
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 2 }}
          viewBox="0 0 110 110"
        >
          <circle cx="55" cy="55" r="51" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
          <circle
            cx="55"
            cy="55"
            r="51"
            fill="none"
            stroke={color.light}
            strokeWidth="5"
            strokeDasharray={2 * Math.PI * 51}
            strokeDashoffset={2 * Math.PI * 51 * (1 - progress / 100)}
            strokeLinecap="round"
            transform="rotate(-90 55 55)"
            style={{
              transition: "stroke-dashoffset 0.56s cubic-bezier(0.22, 1, 0.36, 1)",
              filter: `drop-shadow(0 0 4px ${color.light})`,
            }}
          />
        </svg>

        {typeof onMenuOpen === "function" ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMenuOpen(project, e);
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
              e.currentTarget.style.transform = "translate(12%, -20%) scale(0.92)";
              e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.30)";
              e.currentTarget.style.filter = "brightness(1.04)";
            }}
            onTouchEnd={(e) => {
              e.currentTarget.style.transform = "translate(12%, -20%) scale(1)";
              e.currentTarget.style.boxShadow = "0 6px 14px rgba(0,0,0,0.35)";
              e.currentTarget.style.filter = "brightness(1)";
            }}
            onTouchCancel={(e) => {
              e.currentTarget.style.transform = "translate(12%, -20%) scale(1)";
              e.currentTarget.style.boxShadow = "0 6px 14px rgba(0,0,0,0.35)";
              e.currentTarget.style.filter = "brightness(1)";
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              e.currentTarget.style.transform = "translate(12%, -20%) scale(0.94)";
              e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.30)";
              e.currentTarget.style.filter = "brightness(1.04)";
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = "translate(12%, -20%) scale(1)";
              e.currentTarget.style.boxShadow = "0 6px 14px rgba(0,0,0,0.35)";
              e.currentTarget.style.filter = "brightness(1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translate(12%, -20%) scale(1)";
              e.currentTarget.style.boxShadow = "0 6px 14px rgba(0,0,0,0.35)";
              e.currentTarget.style.filter = "brightness(1)";
            }}
            style={{
              position: "absolute",
              top: -6,
              right: -6,
              transform: "translate(12%, -20%)",
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${color.light}, ${color.bg})`,
              border: "2.5px solid #0D0D1A",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontStyle: "italic",
              fontWeight: 700,
              color: "#fff",
              boxShadow: "0 6px 14px rgba(0,0,0,0.35)",
              transition: "transform 220ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 220ms cubic-bezier(0.22, 1, 0.36, 1), filter 220ms ease",
              zIndex: 10,
              padding: 0,
            }}
          >
            i
          </button>
        ) : null}
      </button>

      <button
        onClick={handleOpen}
        style={{
          background: "none",
          border: "none",
          padding: 0,
          cursor: "pointer",
          textAlign: "center",
          width: size,
          maxWidth: 112,
        }}
      >
        <div
          style={{
            color: "#F1F0EE",
            fontSize: "clamp(10px, 2.8vw, 12px)",
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 500,
          }}
        >
          {project?.name || "Projet sans nom"}
        </div>

        {project?.client ? (
          <div
            style={{
              color: color.light,
              fontSize: 10,
              marginTop: 1,
              fontFamily: "monospace",
            }}
          >
            {project.client}
          </div>
        ) : null}
      </button>
    </div>
  );
}

export default function AppPro({
  projectsPro = [],
  onProjectOpen,
  onCreateProProject,
  onProjectMenuOpen,
}) {
  const projects = [...(projectsPro || [])]
    .filter((p) => p && p.id != null)
    .sort((a, b) => a.id - b.id);

  const projectCountLabel = useMemo(() => {
    return `${projects.length} projet${projects.length > 1 ? "s" : ""}`;
  }, [projects.length]);

  return (
    <>
      <div style={{ marginBottom: 10 }}>
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
            marginBottom: 10,
          }}
        >
          Projets professionnels enregistrés dans la base actuelle.
        </div>

        <div style={{ color: "#A79FB7", fontSize: 13 }}>
          {projectCountLabel}
        </div>
      </div>

      <div style={{ padding: "4px 10px 100px" }}>
        {projects.length === 0 ? (
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
          <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 108px)",
                columnGap: 24,
                rowGap: 32,
                justifyItems: "center",
                alignItems: "start",
                width: "max-content",
                margin: "0 auto",
              }}
            >
              {projects.map((project) => (
                <div key={project.id || project.name}>
                  <ProBubble project={project} onOpen={onProjectOpen} onMenuOpen={onProjectMenuOpen} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ position: "fixed", bottom: 28, right: "calc(50% - 200px)", zIndex: 50 }}>
        <button
          onClick={onCreateProProject}
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #7C3AED, #EC4899)",
            border: "none",
            cursor: "pointer",
            fontSize: 28,
            color: "#fff",
            boxShadow: "0 4px 20px #7C3AED88",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          +
        </button>
      </div>
    </>
  );
}
