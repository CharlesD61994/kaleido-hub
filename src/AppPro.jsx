import React from "react";

export default function AppPro({ children, mode, projects, totalRangs, termines }) {
  return (
    <div data-kaleido-pro-root="true" style={{ position: "relative" }}>
      {children}
    </div>
  );
}
