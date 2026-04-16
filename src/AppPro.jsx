import React, { useState } from "react";

export default function AppPro() {
  const [projectsPro, setProjectsPro] = useState([
    {
      id: 1,
      name: "Projet client test",
      progress: 0,
    },
  ]);

  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ color: "white" }}>Module Professionnel</h1>

      <div style={{ marginTop: 20 }}>
        {projectsPro.map((project) => (
          <div
            key={project.id}
            style={{
              padding: 15,
              marginBottom: 10,
              borderRadius: 12,
              background: "#1e1e2f",
              color: "white",
            }}
          >
            <div style={{ fontWeight: "bold" }}>{project.name}</div>
            <div style={{ opacity: 0.6 }}>
              Progression : {project.progress}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
