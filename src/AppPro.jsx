import React from "react";

export default function AppPro({ projectsPro = [], onProjectClick, onCreateProject }) {
  return (
    <div style={{ padding: "10px 12px 120px" }}>

      <h1 style={{ color: "#F1F0EE", marginBottom: 6 }}>Professionnel</h1>
      <p style={{ color: "#6B6A7A", marginBottom: 10 }}>
        Projets professionnels enregistrés dans la base actuelle.
      </p>

      <div style={{ color: "#6B6A7A", marginBottom: 16 }}>
        {projectsPro.length} projets
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          rowGap: 16,
          columnGap: 16,
          justifyItems: "center",
          alignItems: "start",
        }}
      >
        {projectsPro.map((project) => (
          <div key={project.id} style={{ textAlign: "center" }}>
            <div
              onClick={() => onProjectClick(project)}
              style={{
                width: 90,
                height: 90,
                borderRadius: "50%",
                background: project.color || "#7C3AED",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 20px rgba(124,58,237,0.5)",
                cursor: "pointer",
              }}
            >
              🧶
            </div>

            <div style={{ marginTop: 8, color: "#F1F0EE", fontSize: 13 }}>
              {project.name}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onCreateProject}
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
          boxShadow: "0 4px 20px #7C3AED88",
        }}
      >
        +
      </button>
    </div>
  );
}
