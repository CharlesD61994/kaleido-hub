import React, { useState, useEffect, useRef } from "react";
const VIEWS = { HUB: 'hub', LIBRARY: 'library', PATRON_EDITOR: 'patron_editor', ROW_COUNTER: 'row_counter', PDF_VIEWER: 'pdf_viewer' };
const KALEIDOSCOPE_COLORS = [
{ bg: "#7C3AED", light: "#A78BFA" }, // violet
{ bg: "#EC4899", light: "#F9A8D4" }, // rose vif
{ bg: "#F97316", light: "#FDBA74" }, // orange vif
{ bg: "#06B6D4", light: "#67E8F9" }, // cyan
{ bg: "#10B981", light: "#6EE7B7" }, // vert menthe
{ bg: "#EAB308", light: "#FDE68A" }, // jaune doré
{ bg: "#3B82F6", light: "#93C5FD" }, // bleu clair
{ bg: "#EF4444", light: "#FCA5A5" }, // corail rouge
];

const GLOBAL_MOTION_CSS = `
  button, [data-kaleido-pressable="true"] {
    transition: transform 140ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 220ms ease, filter 180ms ease, opacity 180ms ease;
    will-change: transform, filter;
  }
  button:active, [data-kaleido-pressable="true"]:active {
    transform: scale(0.94) translateY(1px);
    filter: brightness(1.08);
  }
  [data-kaleido-modal-backdrop="true"] {
    animation: kaleidoFadeIn 220ms ease both;
    backdrop-filter: blur(3px);
  }
  [data-kaleido-modal-card="true"] {
    animation: kaleidoModalIn 260ms cubic-bezier(0.22, 1, 0.36, 1) both;
    transform-origin: center center;
  }
  [data-kaleido-screen="true"] {
    min-height: 100vh;
  }
  @keyframes kaleidoFadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes kaleidoModalIn {
    from { opacity: 0; transform: translateY(14px) scale(0.975); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes kaleidoScreenInRight {
    from { opacity: 1; transform: translate3d(0, 0, 0); }
    to { opacity: 1; transform: translate3d(0, 0, 0); }
  }
  @keyframes kaleidoScreenInLeft {
    from { opacity: 1; transform: translate3d(0, 0, 0); }
    to { opacity: 1; transform: translate3d(0, 0, 0); }
  }
  @keyframes kaleidoScreenFade {
    from { opacity: 1; transform: translate3d(0, 0, 0); }
    to { opacity: 1; transform: translate3d(0, 0, 0); }
  }
  @keyframes kaleidoParallaxFloat {
    0%, 100% { transform: translate3d(var(--kx, 0px), var(--ky, 0px), 0); }
    50% { transform: translate3d(calc(var(--kx, 0px) * 1.35), calc(var(--ky, 0px) * 1.35 - 2px), 0); }
  }
  @keyframes kaleidoProgressBreath {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.018); }
  }
  @keyframes kaleidoProgressPulse {
    0% { transform: scale(0.965); filter: brightness(0.98); }
    55% { transform: scale(1.085); filter: brightness(1.1); }
    100% { transform: scale(1); filter: brightness(1); }
  }
  @keyframes kaleidoProgressArcNudge {
    0% { stroke-dashoffset: var(--ring-final); }
    44% { stroke-dashoffset: var(--ring-overshoot); }
    100% { stroke-dashoffset: var(--ring-final); }
  }
  @keyframes kaleidoProgressCleanPulse {
    0%, 100% { transform: scale(1); }
    42% { transform: scale(1.012); }
  }
  @keyframes kaleidoProgressCleanGlow {
    0%, 100% { filter: drop-shadow(0 0 0 rgba(255,255,255,0)); }
    42% { filter: drop-shadow(0 0 5px currentColor) drop-shadow(0 0 9px currentColor); }
  }
  @keyframes kaleidoBarCleanPulse {
    0%, 100% { transform: scaleX(1); }
    42% { transform: scaleX(1.0045); }
  }
  @keyframes kaleidoBarCleanGlow {
    0%, 100% { box-shadow: 0 0 0 rgba(255,255,255,0); }
    42% { box-shadow: 0 0 7px rgba(255,255,255,0.10), 0 0 12px currentColor; }
  }
`;

const getViewMotionStyle = (transitionName) => {
  return { animation: 'none' };
};

const Icon = ({ name, size = 20, stroke = 1.9, color = "currentColor", style = {} }) => {
const common = {
width: size,
height: size,
viewBox: "0 0 24 24",
fill: "none",
stroke: color,
strokeWidth: stroke,
strokeLinecap: "round",
strokeLinejoin: "round",
style,
"aria-hidden": true,
};

switch (name) {
case "library":
return (
<svg {...common}>
<rect x="4" y="4" width="6.5" height="6.5" rx="1.5" />
<rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" />
<rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" />
<rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" />
</svg>
);
case "book":
return (
<svg {...common}>
<path d="M6.5 5.5A2.5 2.5 0 0 1 9 3h8.5v17H9a2.5 2.5 0 0 0-2.5 2" />
<path d="M6.5 5.5v15" />
<path d="M9.5 7.5h5.5" />
<path d="M9.5 11h5.5" />
</svg>
);
case "bookOpen":
return (
<svg {...common}>
<path d="M12 6.5c-1.5-1.2-3.4-1.8-5.5-1.8H4.5V18h2c2.1 0 4 .6 5.5 1.8" />
<path d="M12 6.5c1.5-1.2 3.4-1.8 5.5-1.8h2V18h-2c-2.1 0-4 .6-5.5 1.8" />
<path d="M12 6.5V19.8" />
</svg>
);
case "settings":
return (
<svg {...common}>
<circle cx="12" cy="12" r="3.2" />
<path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a2 2 0 1 1-4 0v-.2a1 1 0 0 0-.7-.9 1 1 0 0 0-1.1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a2 2 0 1 1 0-4h.2a1 1 0 0 0 .9-.7 1 1 0 0 0-.2-1.1l-.1-.1a2 2 0 0 1 2.8-2.8l.1.1a1 1 0 0 0 1.1.2 1 1 0 0 0 .6-.9V4a2 2 0 1 1 4 0v.2a1 1 0 0 0 .7.9 1 1 0 0 0 1.1-.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1 1 0 0 0-.2 1.1 1 1 0 0 0 .9.6h.2a2 2 0 1 1 0 4h-.2a1 1 0 0 0-.9.7Z" />
</svg>
);
case "search":
return (
<svg {...common}>
<circle cx="11" cy="11" r="6.5" />
<path d="m16 16 4 4" />
</svg>
);
case "edit":
return (
<svg {...common}>
<path d="M12 20h9" />
<path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L8 18l-4 1 1-4 11.5-11.5Z" />
</svg>
);
case "image":
return (
<svg {...common}>
<rect x="3.5" y="5" width="17" height="14" rx="2.5" />
<circle cx="9" cy="10" r="1.3" />
<path d="m20.5 16-4.5-4.5L7 20" />
</svg>
);
case "trash":
return (
<svg {...common}>
<path d="M3 6h18" />
<path d="M8 6V4.8A1.8 1.8 0 0 1 9.8 3h4.4A1.8 1.8 0 0 1 16 4.8V6" />
<path d="M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14" />
<path d="M10 10v7" />
<path d="M14 10v7" />
</svg>
);
case "yarn":
return (
<svg {...common}>
<circle cx="12" cy="11.5" r="6.8" />
<path d="M7.8 8.8c1.1-.9 2.6-1.4 4.2-1.4 1.8 0 3.4.6 4.5 1.7" />
<path d="M6.8 11.7c1.4-1.2 3.2-1.9 5.2-1.9 2 0 3.7.7 5.1 2" />
<path d="M7.6 14.7c1.2-.8 2.7-1.3 4.4-1.3 1.7 0 3.2.4 4.5 1.3" />
<path d="M8 18.2c1.2-.7 2.5-1 4-1" />
<path d="M5.6 17.9c1.9.1 3.5.9 4.9 2.6" />
</svg>
);
case "note":
return (
<svg {...common}>
<path d="M7 3.5h7l4 4V20a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 20V5A1.5 1.5 0 0 1 7.5 3.5Z" />
<path d="M14 3.5V8h4" />
<path d="M9 12h6" />
<path d="M9 15.5h6" />
</svg>
);
case "file":
return (
<svg {...common}>
<path d="M8 3.5h6l4 4V20a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 20V5A1.5 1.5 0 0 1 7.5 3.5Z" />
<path d="M14 3.5V8h4" />
</svg>
);
case "checkCircle":
return (
<svg {...common}>
<circle cx="12" cy="12" r="8.5" />
<path d="m8.7 12 2.2 2.3 4.5-4.8" />
</svg>
);
case "square":
return (
<svg {...common}>
<rect x="4.5" y="4.5" width="15" height="15" rx="3" />
</svg>
);
case "download":
return (
<svg {...common}>
<path d="M12 3v12" />
<path d="M7 10l5 5 5-5" />
<path d="M5 21h14" />
</svg>
);
case "upload":
return (
<svg {...common}>
<path d="M12 21V9" />
<path d="M17 14l-5-5-5 5" />
<path d="M5 3h14" />
</svg>
);
case "sparkles":
return (
<svg {...common}>
<path d="m12 3 1.1 3.3L16.5 7.5l-3.4 1.2L12 12l-1.1-3.3L7.5 7.5l3.4-1.2L12 3Z" />
<path d="m18.5 13.5.7 2.1 2.1.7-2.1.7-.7 2.1-.7-2.1-2.1-.7 2.1-.7.7-2.1Z" />
<path d="m5.5 14.5.7 2.1 2.1.7-2.1.7-.7 2.1-.7-2.1-2.1-.7 2.1-.7.7-2.1Z" />
</svg>
);
case "grid":
return (
<svg {...common}>
<rect x="4" y="4" width="6.5" height="6.5" rx="1.5" />
<rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" />
<rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" />
<rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" />
</svg>
);
case "projects":
return (
<svg {...common}>
<rect x="4.5" y="5" width="11" height="14" rx="2.2" />
<path d="M8 9h4" />
<path d="M8 12.5h4.5" />
<path d="M16.5 8.5h3" />
<path d="M16.5 12h3" />
<path d="M16.5 15.5h3" />
</svg>
);
case "chart":
return (
<svg {...common}>
<path d="M5 19.5h14" />
<path d="M7.5 16V11" />
<path d="M12 16V7.5" />
<path d="M16.5 16v-5" />
</svg>
);
case "checkBadge":
return (
<svg {...common}>
<path d="M12 3.5 9.8 5 7 4.6l-.8 2.7L4 9l1.5 2.4-.2 2.8 2.7.8L9.7 17l2.3 1.5 2.3-1.5 2.7.4.8-2.7L20 15l-.4-2.7L21 9.9l-2.1-1.6-.8-2.7-2.8.4L12 3.5Z" />
<path d="m9.3 12 1.7 1.8 3.7-4" />
</svg>
);
case "camera":
return (
<svg {...common}>
<path d="M4.5 8.5h3l1.2-2h6.6l1.2 2h3a1.8 1.8 0 0 1 1.8 1.8v7.2a1.8 1.8 0 0 1-1.8 1.8h-15a1.8 1.8 0 0 1-1.8-1.8v-7.2A1.8 1.8 0 0 1 4.5 8.5Z" />
<circle cx="12" cy="13" r="3.2" />
</svg>
);
case "undo":
return (
<svg {...common}>
<path d="M9 9 5.5 12.5 9 16" />
<path d="M6 12.5h7a4.5 4.5 0 1 1 0 9h-2.5" />
</svg>
);
case "alert":
return (
<svg {...common}>
<path d="M12 4 4.5 18h15L12 4Z" />
<path d="M12 9v4.5" />
<path d="M12 17h.01" />
</svg>
);
default:
return null;
}
};

const IconBadge = ({ name, size = 18, tone = "violet", background, color, badgeSize = 44 }) => {
const tones = {
violet: { background: "linear-gradient(135deg, #7C3AED, #A78BFA)", color: "#fff" },
pink: { background: "linear-gradient(135deg, #DB2777, #F472B6)", color: "#fff" },
blue: { background: "linear-gradient(135deg, #0891B2, #22D3EE)", color: "#fff" },
green: { background: "linear-gradient(135deg, #059669, #34D399)", color: "#fff" },
amber: { background: "linear-gradient(135deg, #D97706, #FCD34D)", color: "#fff" },
slate: { background: "linear-gradient(135deg, #2A2A3E, #4C4C6A)", color: "#fff" },
};
const resolved = tones[tone] || tones.violet;
return (
<div style={{
width: badgeSize,
height: badgeSize,
borderRadius: 12,
background: background || resolved.background,
display: "flex",
alignItems: "center",
justifyContent: "center",
flexShrink: 0,
boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12), 0 10px 24px rgba(0,0,0,0.22)"
}}>
<Icon name={name} size={size} color={color || resolved.color} />
</div>
);
};

const DB_KEY = 'kaleido_database';
const DB_BACKUP_KEY = 'kaleido_database_backup';
const PATRON_BACKUP_KEY = 'kaleido_patron_backup';
const debug = (...args) => {
if (typeof window !== "undefined" && window.KALEIDO_DEBUG) {
console.log("[KALEIDO]", ...args);
}
};
const canUseStorage = () => {
  try {
    return typeof window !== "undefined" && typeof localStorage !== "undefined";
  } catch (e) {
    return false;
  }
};
const safeParseJSON = (value) => {
try { return value ? JSON.parse(value) : null; } catch (e) { return null; }
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
  } catch (e) {
    console.warn("[KALEIDO] writeStorageJSON error:", e);
    return false;
  }
};
const clearStorageKey = (key) => {
  if (!canUseStorage()) return false;
  try {
    localStorage.removeItem(key);
    return true;
  } catch (e) {
    console.warn("[KALEIDO] clearStorageKey error:", e);
    return false;
  }
};
const isValidDatabase = (data) => {
if (!data || typeof data !== "object") return false;
return Array.isArray(data.projectsPersonal)
&& Array.isArray(data.projectsPro)
&& Array.isArray(data.patrons)
&& data.settings
&& typeof data.settings === "object";
};
const getDefaultDatabase = () => ({
projectsPersonal: [
{ id: 1, name: "Écharpe hiver", rang: 42, total: 80, colorIdx: 0, image: null, type: "tricot", laine: "", outil: "", notes: "", parties: [] },
{ id: 2, name: "Tuque Noël", rang: 15, total: 30, colorIdx: 1, image: null, type: "crochet", laine: "", outil: "", notes: "", parties: [] },
{ id: 3, name: "Mitaines bébé", rang: 8, total: 20, colorIdx: 2, image: null, type: "tricot", laine: "", outil: "", notes: "", parties: [] },
],
projectsPro: [],
patrons: [],
settings: { lastProjectId: 3, lastPatronId: 0 }
});

const initDatabase = () => {
try {
if (!canUseStorage()) return getDefaultDatabase();
const saved = readStorageJSON(DB_KEY);
if (isValidDatabase(saved)) return saved;

const backup = readStorageJSON(DB_BACKUP_KEY);
if (isValidDatabase(backup)) {
  debug("Base principale invalide, restauration depuis le backup.");
  writeStorageJSON(DB_KEY, backup);
  return backup;
}

} catch(e) {
console.warn("[KALEIDO] initDatabase error:", e);
}
return getDefaultDatabase();
};
const saveToDatabase = (data) => {
try {
if (!canUseStorage()) return false;
if (!isValidDatabase(data)) {
console.warn("[KALEIDO] saveToDatabase ignoré: base invalide.");
return false;
}
const currentRaw = localStorage.getItem(DB_KEY);
if (currentRaw) {
  const currentData = safeParseJSON(currentRaw);
  if (currentData) writeStorageJSON(DB_BACKUP_KEY, currentData);
}
writeStorageJSON(DB_KEY, data);
return true;
} catch(e) {
console.warn("[KALEIDO] saveToDatabase error:", e);
return false;
}
};
const loadPatronDraft = ({ sourceId, mode }) => {
  const payload = readStorageJSON(PATRON_BACKUP_KEY);
  if (!payload || typeof payload !== "object") return null;
  if ((payload.mode || null) !== mode) return null;
  if ((payload.sourceId ?? null) !== (sourceId ?? null)) return null;
  return payload.patron && typeof payload.patron === "object" ? payload.patron : null;
};
const savePatronDraft = ({ label, mode, sourceId, patron }) => {
  return writeStorageJSON(PATRON_BACKUP_KEY, {
    label,
    savedAt: new Date().toISOString(),
    mode,
    sourceId,
    patron
  });
};
const clearPatronDraft = ({ sourceId, mode }) => {
  const payload = readStorageJSON(PATRON_BACKUP_KEY);
  if (!payload || typeof payload !== "object") return false;
  if ((payload.mode || null) !== mode) return false;
  if ((payload.sourceId ?? null) !== (sourceId ?? null)) return false;
  return clearStorageKey(PATRON_BACKUP_KEY);
};
// ═══════════════════════════════════════════════════════════════
// STOCKAGE PDFs — IndexedDB
// ═══════════════════════════════════════════════════════════════
const _pdfDb = (() => {
let db = null;
return () => new Promise((resolve, reject) => {
if (db) { resolve(db); return; }
const req = indexedDB.open('kaleido_pdfs', 1);
req.onupgradeneeded = e => e.target.result.createObjectStore('pdfs', { keyPath: 'id' });
req.onsuccess = e => { db = e.target.result; resolve(db); };
req.onerror = () => reject(req.error);
});
})();
const savePdf = async (id, data) => {
try {
const db = await _pdfDb();
await new Promise((resolve, reject) => {
const tx = db.transaction('pdfs', 'readwrite');
tx.objectStore('pdfs').put({ id, data });
tx.oncomplete = resolve;
tx.onerror = () => reject(tx.error);
});
return true;
} catch(e) {
console.error('savePdf error:', e);
return false;
}
};
const loadPdf = async (id) => {
try {
if (!id) return null;
const db = await _pdfDb();
return await new Promise((resolve, reject) => {
const tx = db.transaction('pdfs', 'readonly');
const req = tx.objectStore('pdfs').get(id);
req.onsuccess = () => {
const data = req.result?.data || null;
if (!data || typeof data !== "string") {
resolve(null);
return;
}
resolve(data);
};
req.onerror = () => reject(req.error);
});
} catch(e) {
console.error('loadPdf error:', e);
return null;
}
};
const deletePdf = async (id) => {
try {
const db = await _pdfDb();
await new Promise((resolve) => {
const tx = db.transaction('pdfs', 'readwrite');
tx.objectStore('pdfs').delete(id);
tx.oncomplete = resolve;
});
} catch(e) {}
};
// ═══════════════════════════════════════════════════════════════
// COMPOSANTS HUB
// ═══════════════════════════════════════════════════════════════
function ProjectBubble({ project, onMenuOpen, onProjectClick, mode }) {
const color = KALEIDOSCOPE_COLORS[project.colorIdx % KALEIDOSCOPE_COLORS.length];
const isLibrary = mode === "library";
const size = isLibrary ? "clamp(96px, 28vw, 110px)" : "clamp(94px, 27vw, 108px)";
const glowOpacity = isLibrary ? 0.2 : 0.42;
const glowNear = isLibrary ? 8 : 10;
const glowFar = isLibrary ? 16 : 22;
const ringShadow = isLibrary ? 8 : 5;
const bubbleLift = isLibrary ? 3 : 2;
return (
<div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: isLibrary ? "12px 4px 14px" : "10px 4px 14px", cursor: "default" }}>
  <div style={{ position: "relative", width: size, height: size, overflow: "visible", isolation: "isolate" }}>
    <div
      style={{ position: "absolute", inset: 0, transition: "transform 170ms cubic-bezier(0.22, 1, 0.36, 1), filter 180ms ease", filter: "saturate(1.02)" }}
      onClick={() => onProjectClick && onProjectClick(project)}
      onTouchStart={(e) => { e.currentTarget.style.transform = "scale(0.94) translateY(3px)"; e.currentTarget.style.filter = "saturate(1.1) brightness(1.07)"; }}
      onTouchEnd={(e) => { e.currentTarget.style.transform = "scale(1) translateY(0)"; e.currentTarget.style.filter = "saturate(1.02)"; }}
      onTouchCancel={(e) => { e.currentTarget.style.transform = "scale(1) translateY(0)"; e.currentTarget.style.filter = "saturate(1.02)"; }}
      onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.944) translateY(3px)"; e.currentTarget.style.filter = "saturate(1.1) brightness(1.07)"; }}
      onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1) translateY(0)"; e.currentTarget.style.filter = "saturate(1.02)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1) translateY(0)"; e.currentTarget.style.filter = "saturate(1.02)"; }}
    >
      <div style={{ position: "relative", width: size, height: size, overflow: "visible", isolation: "isolate" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "100%", height: "100%", borderRadius: "50%", pointerEvents: "none", zIndex: 0, background: isLibrary ? `radial-gradient(circle, ${color.bg}55 0%, ${color.bg}20 42%, transparent 70%)` : `radial-gradient(circle, ${color.bg}${Math.round(glowOpacity * 255).toString(16).padStart(2, "0")} 0%, ${color.bg}2a 40%, transparent 66%)`, boxShadow: isLibrary ? `0 0 ${glowNear}px ${color.bg}55, 0 0 ${glowFar}px ${color.bg}20` : `0 0 ${glowNear}px ${color.bg}66, 0 0 ${glowFar}px ${color.bg}33`, willChange: "transform, opacity, box-shadow" }} />
        <div style={{ width: isLibrary ? "88%" : "86%", height: isLibrary ? "88%" : "86%", borderRadius: "50%", background: isLibrary ? "linear-gradient(180deg, rgba(255,255,255,0.14), rgba(255,255,255,0.04))" : `radial-gradient(circle at 35% 35%, ${color.light}38, ${color.bg}cc)`, boxShadow: isLibrary ? `0 ${bubbleLift}px ${18 + ringShadow}px rgba(0,0,0,0.24), 0 0 0 1.5px rgba(255,255,255,0.16), inset 0 1px 0 rgba(255,255,255,0.26), inset 0 -16px 24px rgba(0,0,0,0.1)` : `0 ${bubbleLift}px ${16 + ringShadow}px rgba(0,0,0,0.20), 0 0 0 1px ${color.light}22, inset 0 1px 2px rgba(255,255,255,0.08)`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", transition: "transform 160ms ease, box-shadow 200ms ease", willChange: "transform, box-shadow", zIndex: 1, backdropFilter: isLibrary ? "blur(10px)" : "none" }}>
          {project.image ? <img src={project.image?.preview || project.image?.src || project.image} alt={project.name} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%", display: "block", filter: isLibrary ? "saturate(1.02) contrast(1.03)" : "none" }} /> : <span style={{ color: "#F8F7FF", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="yarn" size={36} color="#F8F7FF" /></span>}
          {isLibrary && <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0.03) 36%, rgba(255,255,255,0) 56%)", pointerEvents: "none" }} />}
        </div>
        {!isLibrary && (
          <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 2 }} viewBox="0 0 110 110">
            <circle cx="55" cy="55" r="51" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
            <circle cx="55" cy="55" r="51" fill="none" stroke={color.light} strokeWidth="5"
              strokeDasharray={2 * Math.PI * 51}
              strokeDashoffset={2 * Math.PI * 51 * (1 - Math.min(project.rang / project.total, 1))}
              strokeLinecap="round" transform="rotate(-90 55 55)"
              style={{ transition: "stroke-dashoffset 0.6s ease", filter: `drop-shadow(0 0 4px ${color.light})` }} />
          </svg>
        )}
      </div>
    </div>
    {onMenuOpen && <button onClick={(e) => { e.stopPropagation(); onMenuOpen(project, e); }}
      style={{ position: "absolute", top: isLibrary ? -6 : -8, right: isLibrary ? -6 : -8, transform: "translate(25%, -25%)", width: 24, height: 24, borderRadius: "50%", background: `linear-gradient(135deg, ${color.light}, ${color.bg})`, border: "2.5px solid #0D0D1A", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontStyle: "italic", fontWeight: 700, color: "#fff", boxShadow: "0 6px 14px rgba(0,0,0,0.35)", animation: "infoBob 2.6s ease-in-out infinite", transition: "transform 160ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 180ms ease, filter 180ms ease", zIndex: 10 }}
      onTouchStart={(e) => { e.stopPropagation(); e.currentTarget.style.transform = "translate(25%, -25%) scale(0.92)"; e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.30)"; e.currentTarget.style.filter = "brightness(1.04)"; }}
      onTouchEnd={(e) => { e.currentTarget.style.transform = "translate(25%, -25%) scale(1)"; e.currentTarget.style.boxShadow = "0 6px 14px rgba(0,0,0,0.35)"; e.currentTarget.style.filter = "brightness(1)"; }}
      onTouchCancel={(e) => { e.currentTarget.style.transform = "translate(25%, -25%) scale(1)"; e.currentTarget.style.boxShadow = "0 6px 14px rgba(0,0,0,0.35)"; e.currentTarget.style.filter = "brightness(1)"; }}
      onMouseDown={(e) => { e.stopPropagation(); e.currentTarget.style.transform = "translate(25%, -25%) scale(0.94)"; e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.30)"; e.currentTarget.style.filter = "brightness(1.04)"; }}
      onMouseUp={(e) => { e.currentTarget.style.transform = "translate(25%, -25%) scale(1)"; e.currentTarget.style.boxShadow = "0 6px 14px rgba(0,0,0,0.35)"; e.currentTarget.style.filter = "brightness(1)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "translate(25%, -25%) scale(1)"; e.currentTarget.style.boxShadow = "0 6px 14px rgba(0,0,0,0.35)"; e.currentTarget.style.filter = "brightness(1)"; }}>i</button>}
  </div>
  <div
    style={{ textAlign: "center", width: size, maxWidth: 112, transition: "transform 170ms cubic-bezier(0.22, 1, 0.36, 1), filter 180ms ease", filter: "saturate(1.02)" }}
    onClick={() => onProjectClick && onProjectClick(project)}
    onTouchStart={(e) => { e.currentTarget.style.transform = "scale(0.94) translateY(3px)"; e.currentTarget.style.filter = "saturate(1.1) brightness(1.07)"; }}
    onTouchEnd={(e) => { e.currentTarget.style.transform = "scale(1) translateY(0)"; e.currentTarget.style.filter = "saturate(1.02)"; }}
    onTouchCancel={(e) => { e.currentTarget.style.transform = "scale(1) translateY(0)"; e.currentTarget.style.filter = "saturate(1.02)"; }}
    onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.944) translateY(3px)"; e.currentTarget.style.filter = "saturate(1.1) brightness(1.07)"; }}
    onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1) translateY(0)"; e.currentTarget.style.filter = "saturate(1.02)"; }}
    onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1) translateY(0)"; e.currentTarget.style.filter = "saturate(1.02)"; }}
  >
    <div style={{ color: "#F1F0EE", fontSize: "clamp(10px, 2.8vw, 12px)", fontFamily: "'DM Sans', sans-serif", fontWeight: isLibrary ? 500 : 500, letterSpacing: isLibrary ? "-0.01em" : "normal", textShadow: isLibrary ? "0 1px 12px rgba(0,0,0,0.28)" : "none" }}>{project.name}</div>
    {mode === "pro" && project.client && <div style={{ color: color.light, fontSize: 10, marginTop: 1, fontFamily: "monospace" }}>{project.client}</div>}
  </div>
</div>
);
}
function ContextMenu({ project, position, onClose, onRename, onDelete, onChangePhoto, onChangeColor }) {
if (!project) return null;
const color = KALEIDOSCOPE_COLORS[project.colorIdx % KALEIDOSCOPE_COLORS.length];
const [showColors, setShowColors] = useState(false);
return (
<>
<div onClick={e => { e.stopPropagation(); onClose(); }} style={{ position: "fixed", inset: 0, zIndex: 100 }} />
<div style={{ position: "fixed", top: Math.min(position.y, window.innerHeight - 260), left: Math.min(position.x - 10, window.innerWidth - 200), zIndex: 101, background: "#1A1A2E", border: `1px solid ${color.light}44`, borderRadius: 16, padding: "8px 0", minWidth: 200, boxShadow: "0 8px 40px rgba(0,0,0,0.6)" }}>
<div style={{ padding: "8px 16px 6px", borderBottom: `1px solid ${color.light}22`, marginBottom: 4 }}>
<div style={{ color: color.light, fontSize: 11, fontFamily: "monospace", textTransform: "uppercase" }}>{project.name}</div>
</div>
{[
{ icon: <Icon name="edit" size={21} color="#E2E0DC" />, label: "Renommer", action: onRename },
{ icon: <Icon name="image" size={21} color="#E2E0DC" />, label: "Changer la photo", action: onChangePhoto },
].map(item => (
<button key={item.label} onClick={item.action} style={{ display: "flex", alignItems: "center", gap: 14, width: "100%", padding: "12px 16px", background: "none", border: "none", cursor: "pointer", color: "#E2E0DC", fontSize: 14, fontFamily: "'DM Sans', sans-serif", textAlign: "left" }}>
<span>{item.icon}</span><span>{item.label}</span>
</button>
))}
{/* Couleur de la bulle */}
<button onClick={() => setShowColors(s => !s)} style={{ display: "flex", alignItems: "center", gap: 14, width: "100%", padding: "12px 16px", background: "none", border: "none", cursor: "pointer", color: "#E2E0DC", fontSize: 14, fontFamily: "'DM Sans', sans-serif", textAlign: "left" }}>
<div style={{ width: 18, height: 18, borderRadius: "50%", background: `linear-gradient(135deg, ${color.bg}, ${color.light})`, flexShrink: 0 }} />
<span>Couleur de la bulle</span>
</button>
{showColors && (
<div style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: "8px 16px 10px" }}>
{KALEIDOSCOPE_COLORS.map((c, i) => (
<div key={i} onClick={() => { onChangeColor(i); onClose(); }}
style={{ width: 28, height: 28, borderRadius: "50%", background: `linear-gradient(135deg, ${c.bg}, ${c.light})`, cursor: "pointer", border: project.colorIdx === i ? "3px solid #fff" : "2px solid transparent", boxSizing: "border-box" }} />
))}
</div>
)}
<button onClick={onDelete} style={{ display: "flex", alignItems: "center", gap: 14, width: "100%", padding: "12px 16px", background: "none", border: "none", cursor: "pointer", color: "#F87171", fontSize: 14, fontFamily: "'DM Sans', sans-serif", textAlign: "left" }}>
<span><Icon name="trash" size={21} color="#F87171" /></span><span>Supprimer</span>
</button>
</div>
</>
);
}
function RenameModal({ project, onConfirm, onClose }) {
const [val, setVal] = useState(project?.name || "");
const [cardTop, setCardTop] = useState(null);
const inputRef = useRef(null);
const cardRef = useRef(null);

useEffect(() => {
  if (!project) return;
  setVal(project?.name || "");
  const timer = setTimeout(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, 60);
  return () => clearTimeout(timer);
}, [project]);

useEffect(() => {
  if (!project) return;

  let rafId = 0;

  const updateCardTop = () => {
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      const vv = window.visualViewport;
      const viewportTop = vv ? vv.offsetTop : 0;
      const viewportHeight = vv ? vv.height : window.innerHeight;
      const viewportWidth = vv ? vv.width : window.innerWidth;
      const cardHeight = cardRef.current?.offsetHeight || 0;
      const keyboardHeight = Math.max(0, window.innerHeight - viewportHeight - viewportTop);
      const isKeyboardOpen = keyboardHeight > 120;
      const topMargin = 24;
      const bottomMargin = 16;

      if (!cardHeight) {
        setCardTop(viewportTop + (isKeyboardOpen ? 40 : Math.max(topMargin, viewportHeight * 0.18)));
        return;
      }

      const centeredTop = viewportTop + Math.max(topMargin, (viewportHeight - cardHeight) / 2);
      const bottomAnchoredTop = viewportTop + viewportHeight - cardHeight - bottomMargin;
      const maxAllowedTop = viewportTop + viewportHeight - cardHeight - bottomMargin;

      const resolvedTop = isKeyboardOpen
        ? Math.max(topMargin, Math.min(bottomAnchoredTop, maxAllowedTop))
        : Math.max(topMargin, Math.min(centeredTop, maxAllowedTop));

      setCardTop(resolvedTop);
    });
  };

  updateCardTop();

  const vv = window.visualViewport;
  vv?.addEventListener("resize", updateCardTop);
  vv?.addEventListener("scroll", updateCardTop);
  window.addEventListener("resize", updateCardTop);

  return () => {
    cancelAnimationFrame(rafId);
    vv?.removeEventListener("resize", updateCardTop);
    vv?.removeEventListener("scroll", updateCardTop);
    window.removeEventListener("resize", updateCardTop);
  };
}, [project, val]);

if (!project) return null;
const color = KALEIDOSCOPE_COLORS[project.colorIdx % KALEIDOSCOPE_COLORS.length];
return (
<div data-kaleido-modal-backdrop="true" style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.75)" }} onClick={onClose}>
<div
  style={{
    position: "fixed",
    top: cardTop ?? "18vh",
    left: "50%",
    transform: "translateX(-50%)",
    width: "calc(100% - 40px)",
    maxWidth: 340
  }}
>
<div
  ref={cardRef}
  onClick={e => e.stopPropagation()}
  data-kaleido-modal-card="true"
  style={{
    background: "#1A1A2E",
    borderRadius: 18,
    padding: 24,
    width: "100%",
    boxSizing: "border-box"
  }}
>
<h3 style={{ color: "#F1F0EE", fontFamily: "'DM Sans', sans-serif", margin: "0 0 16px" }}>Renommer le projet</h3>
<input ref={inputRef} autoFocus value={val} onFocus={e => e.target.select()} onChange={e => setVal(e.target.value)} onKeyDown={e => e.key === "Enter" && onConfirm(val)}
style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: `1px solid ${color.light}44`, background: "#0D0D1A", color: "#F1F0EE", fontSize: 16, outline: "none", boxSizing: "border-box" }} />
<div style={{ display: "flex", gap: 10, marginTop: 16, justifyContent: "flex-end", flexWrap: "wrap" }}>
<button onClick={onClose} style={{ padding: "12px 20px", minHeight: 44, borderRadius: 12, border: "1px solid #333", background: "none", color: "#999", cursor: "pointer", fontSize: 15 }}>Annuler</button>
<button onClick={() => onConfirm(val)} style={{ padding: "12px 20px", minHeight: 44, borderRadius: 12, border: "none", background: "linear-gradient(135deg, #7C3AED, #DB2777)", color: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 15 }}>Confirmer</button>
</div>
</div>
</div>
</div>
);
}

function DeleteModal({ project, onConfirm, onClose }) {
if (!project) return null;
return (
<div data-kaleido-modal-backdrop="true" style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
<div onClick={e => e.stopPropagation()} data-kaleido-modal-card="true" style={{ background: "#1A1A2E", borderRadius: 18, padding: 24, width: "100%", maxWidth: 340 }}>
<h3 style={{ color: "#F1F0EE", fontFamily: "'DM Sans', sans-serif", margin: "0 0 10px" }}>Supprimer "{project.name}" ?</h3>
<p style={{ color: "#999", fontSize: 13, margin: "0 0 20px" }}>Cette action est irréversible.</p>
<div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
<button onClick={onClose} style={{ padding: "12px 20px", minHeight: 44, borderRadius: 12, border: "1px solid #333", background: "none", color: "#999", cursor: "pointer", fontSize: 15 }}>Annuler</button>
<button onClick={onConfirm} style={{ padding: "12px 20px", minHeight: 44, borderRadius: 12, border: "none", background: "#EF4444", color: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 15 }}>Supprimer</button>
</div>
</div>
</div>
);
}
// ═══════════════════════════════════════════════════════════════
// PHOTO CROP MODAL
// ═══════════════════════════════════════════════════════════════
function PhotoCropModal({ onClose, onConfirm, existingImage }) {
const [imgSrc, setImgSrc] = useState(existingImage?.src || existingImage || null);
const [pos, setPos] = useState(existingImage?.pos || { x: 0, y: 0 });
const [scale, setScale] = useState(existingImage?.scale || 1);
const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
const [isDragging, setIsDragging] = useState(false);
const lastTouch = useRef(null);
const lastDist = useRef(null);
const lastScale = useRef(1);
const lastPos = useRef({ x: 0, y: 0 });
const CROP_SIZE = 260;
const handleFile = (e) => {
const file = e.target.files[0];
if (!file) return;
const reader = new FileReader();
reader.onload = (ev) => {
setImgSrc(ev.target.result);
setPos({ x: 0, y: 0 });
setScale(1);
setNaturalSize({ width: 0, height: 0 });
};
reader.readAsDataURL(file);
};
const getDist = (t1, t2) => Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
const onTouchStart = (e) => {
if (e.touches.length === 1) {
lastTouch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
lastPos.current = pos;
setIsDragging(true);
} else if (e.touches.length === 2) {
lastDist.current = getDist(e.touches[0], e.touches[1]);
lastScale.current = scale;
}
};
const onTouchMove = (e) => {
e.preventDefault();
if (e.touches.length === 1 && isDragging && lastTouch.current) {
const dx = e.touches[0].clientX - lastTouch.current.x;
const dy = e.touches[0].clientY - lastTouch.current.y;
setPos({ x: lastPos.current.x + dx, y: lastPos.current.y + dy });
} else if (e.touches.length === 2 && lastDist.current) {
const dist = getDist(e.touches[0], e.touches[1]);
const newScale = Math.min(5, Math.max(0.2, lastScale.current * (dist / lastDist.current)));
setScale(newScale);
}
};
const onTouchEnd = () => { setIsDragging(false); lastTouch.current = null; };
const previewBaseScale = naturalSize.width && naturalSize.height
? Math.max(CROP_SIZE / naturalSize.width, CROP_SIZE / naturalSize.height)
: 1;
const handleConfirm = () => {
if (!imgSrc) return;
const img = new Image();
img.onload = () => {
const OUT = 300;
const canvas = document.createElement('canvas');
canvas.width = OUT; canvas.height = OUT;
const ctx = canvas.getContext('2d');
ctx.beginPath();
ctx.arc(OUT/2, OUT/2, OUT/2, 0, Math.PI*2);
ctx.clip();
// baseScale : l'image doit COUVRIR le cercle entièrement à scale=1
const baseScale = Math.max(CROP_SIZE / img.width, CROP_SIZE / img.height);
const finalScale = baseScale * scale;
// Taille affichée dans le canvas de sortie
const w = img.width * finalScale * (OUT / CROP_SIZE);
const h = img.height * finalScale * (OUT / CROP_SIZE);
ctx.drawImage(img,
(OUT - w) / 2 + pos.x * (OUT / CROP_SIZE),
(OUT - h) / 2 + pos.y * (OUT / CROP_SIZE),
w, h
);
onConfirm({
src: imgSrc,
pos,
scale,
preview: canvas.toDataURL('image/png')
});
};
img.src = imgSrc;
};
return (
<div data-kaleido-modal-backdrop="true" style={{ position: "fixed", inset: 0, zIndex: 300, background: "#000", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif" }}>
{!imgSrc ? (
<div style={{ textAlign: "center", padding: 32 }}>
<div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}><IconBadge name="camera" tone="pink" size={28} badgeSize={64} /></div>
<h3 style={{ color: "#F1F0EE", fontSize: 20, fontFamily: "'Syne', sans-serif", margin: "0 0 8px" }}>Ajouter une photo</h3>
<p style={{ color: "#6B6A7A", fontSize: 14, margin: "0 0 28px" }}>Choisis une photo depuis ta galerie</p>
<label style={{ background: "linear-gradient(135deg, #7C3AED, #EC4899)", borderRadius: 16, padding: "14px 32px", color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer", display: "inline-block" }}>
Choisir une photo
<input type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
</label>
<div style={{ marginTop: 20 }}>
<button onClick={onClose} style={{ background: "#1E1E32", border: "1px solid #555", borderRadius: 12, padding: "10px 24px", color: "#F1F0EE", fontSize: 14, cursor: "pointer" }}>Annuler</button>
</div>
</div>
) : (
<div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", height: "100vh", overflow: "hidden" }}>
{/* Overlay sombre autour du cercle — ne couvre PAS les boutons */}
<div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 0 }} />
{/* Texte */}
<div style={{ position: "relative", zIndex: 2, marginTop: 60, marginBottom: 20 }}>
<p style={{ color: "#fff", fontSize: 14, margin: 0, textAlign: "center" }}>Déplace et zoome pour recadrer</p>
</div>
{/* Zone de recadrage */}
<div style={{ position: "relative", zIndex: 2, width: CROP_SIZE, height: CROP_SIZE, borderRadius: "50%", overflow: "hidden", border: "3px solid #A78BFA", cursor: "grab", touchAction: "none", flexShrink: 0 }}
onTouchStart={onTouchStart}
onTouchMove={onTouchMove}
onTouchEnd={onTouchEnd}>
<img
src={imgSrc}
alt="crop"
onLoad={(e) => {
const { naturalWidth, naturalHeight } = e.currentTarget;
if (naturalWidth && naturalHeight && (
naturalWidth !== naturalSize.width || naturalHeight !== naturalSize.height
)) {
setNaturalSize({ width: naturalWidth, height: naturalHeight });
}
}}
style={{
position: "absolute",
top: "50%",
left: "50%",
width: naturalSize.width ? `${naturalSize.width * previewBaseScale}px` : "auto",
height: naturalSize.height ? `${naturalSize.height * previewBaseScale}px` : "auto",
transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px)) scale(${scale})`,
transformOrigin: "center",
userSelect: "none",
pointerEvents: "none"
}}
draggable={false}
/>
</div>
{/* Boutons — toujours visibles, z-index élevé */}
<div style={{ position: "relative", zIndex: 2, display: "flex", gap: 14, marginTop: 36 }}>
<button onClick={onClose} style={{ padding: "14px 30px", borderRadius: 14, border: "2px solid #555", background: "#2A2A3E", color: "#F1F0EE", fontSize: 16, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>Annuler</button>
<button onClick={handleConfirm} style={{ padding: "14px 30px", borderRadius: 14, border: "none", background: "linear-gradient(135deg, #7C3AED, #EC4899)", color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Confirmer ✓</button>
</div>
<div style={{ position: "relative", zIndex: 2, marginTop: 16 }}>
<label style={{ color: "#ccc", fontSize: 14, cursor: "pointer", textDecoration: "underline" }}>
Changer de photo
<input type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
</label>
</div>
</div>
)}
</div>
);
}
// ═══════════════════════════════════════════════════════════════
// COMPOSANTS PATRON EDITOR
// ═══════════════════════════════════════════════════════════════
function RangItem({ rang, rangIndex, onUpdate, onDelete, onDuplicate, onMoveUp, onMoveDown, isFirst, isLast }) {
const [isEditing, setIsEditing] = useState(false);
const [tempInstruction, setTempInstruction] = useState(rang.instruction);
const [tempMailles, setTempMailles] = useState(rang.mailles || "");
const [isSwipedOpen, setIsSwipedOpen] = useState(false);
const [swipeStartX, setSwipeStartX] = useState(0);
const [swipeCurrentX, setSwipeCurrentX] = useState(0);
const isNote = rang.isNote === true;
const handleSave = (e) => { e.preventDefault(); e.stopPropagation(); onUpdate(rang.id, { instruction: tempInstruction, mailles: tempMailles ? parseInt(tempMailles) : null }); setIsEditing(false); };
const handleCancel = (e) => { e.preventDefault(); e.stopPropagation(); setTempInstruction(rang.instruction); setTempMailles(rang.mailles || ""); setIsEditing(false); };
const handleEditClick = (e) => { if (isEditing || isSwipedOpen) return; e.preventDefault(); e.stopPropagation(); setIsEditing(true); };
const handleActionClick = (e, action) => { e.preventDefault(); e.stopPropagation(); setIsSwipedOpen(false); action(); };
// Carte note/texte
if (isNote) {
return (
<div onTouchStart={e => { setSwipeStartX(e.touches[0].clientX); setSwipeCurrentX(e.touches[0].clientX); }}
onTouchMove={e => setSwipeCurrentX(e.touches[0].clientX)}
onTouchEnd={() => { const d = swipeStartX - swipeCurrentX; if (d > 50) setIsSwipedOpen(true); else if (d < -50) setIsSwipedOpen(false); }}
onClick={() => { if (isSwipedOpen) setIsSwipedOpen(false); }}
style={{ background: "#1A1A2E", border: "1px dashed #D9770644", borderRadius: 12, padding: 12, marginBottom: 8, position: "relative", overflow: "hidden" }}>
<div style={{ display: "flex", alignItems: "flex-start", gap: 12, transform: isSwipedOpen ? "translateX(-80px)" : "translateX(0)", transition: "transform 0.3s ease" }}>
<div style={{ background: "#D9770622", borderRadius: 8, padding: "8px 10px", flexShrink: 0 }}>
<Icon name="note" size={16} color="#FCD34D" />
</div>
<div style={{ flex: 1 }}>
{isEditing ? (
<div>
<textarea value={tempInstruction} onChange={e => setTempInstruction(e.target.value)} onFocus={e => e.target.select()} rows={3} autoFocus
style={{ width: "100%", background: "#0D0D1A", border: "1px solid #D9770644", borderRadius: 8, padding: 12, color: "#F1F0EE", fontSize: 16, outline: "none", resize: "vertical", boxSizing: "border-box", marginBottom: 8 }} />
<div style={{ display: "flex", gap: 8 }}>
<button onClick={handleSave} style={{ background: "#D97706", border: "none", borderRadius: 8, padding: "8px 16px", color: "#fff", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>Sauvegarder</button>
<button onClick={handleCancel} style={{ background: "#666", border: "none", borderRadius: 8, padding: "8px 16px", color: "#fff", fontSize: 13, cursor: "pointer" }}>Annuler</button>
</div>
</div>
) : (
<div onClick={handleEditClick} style={{ cursor: "pointer" }}>
<div style={{ color: "#FCD34D", fontSize: 14, lineHeight: 1.5, wordWrap: "break-word" }}>{rang.instruction}</div>
<div style={{ color: "#D97706", fontSize: 10, marginTop: 4, fontStyle: "italic" }}>Note • Ne compte pas comme un rang</div>
</div>
)}
</div>
<div style={{ display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>
<button onClick={e => { e.stopPropagation(); onMoveUp(rang.id); }} disabled={isFirst} style={{ background: isFirst ? "#333" : "#D97706", border: "none", borderRadius: 6, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, cursor: isFirst ? "not-allowed" : "pointer" }}>↑</button>
<button onClick={e => { e.stopPropagation(); onMoveDown(rang.id); }} disabled={isLast} style={{ background: isLast ? "#333" : "#D97706", border: "none", borderRadius: 6, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, cursor: isLast ? "not-allowed" : "pointer" }}>↓</button>
</div>
</div>
<div style={{ position: "absolute", top: 12, right: isSwipedOpen ? 12 : -80, display: "flex", flexDirection: "column", gap: 4, transition: "right 0.3s ease", zIndex: 10 }}>
<button onClick={e => handleActionClick(e, () => onUpdate(rang.id, { isNote: false }))} style={{ background: "#7C3AED", border: "none", borderRadius: 6, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, cursor: "pointer" }}><Icon name="undo" size={16} color="#fff" /></button>
<button onClick={e => handleActionClick(e, () => onDelete(rang.id))} style={{ background: "#DC2626", border: "none", borderRadius: 6, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, cursor: "pointer" }}>✗</button>
</div>
</div>
);
}
// Carte rang normal
return (
<div onTouchStart={e => { if (!isEditing) { setSwipeStartX(e.touches[0].clientX); setSwipeCurrentX(e.touches[0].clientX); } }}
onTouchMove={e => { if (!isEditing) setSwipeCurrentX(e.touches[0].clientX); }}
onTouchEnd={() => { if (!isEditing) { const d = swipeStartX - swipeCurrentX; if (d > 50) setIsSwipedOpen(true); else if (d < -50) setIsSwipedOpen(false); } }}
onClick={() => { if (isSwipedOpen && !isEditing) setIsSwipedOpen(false); }}
style={{ background: "#13131F", border: isSwipedOpen ? "1px solid #7C3AED44" : "1px solid #ffffff0A", borderRadius: 12, padding: 12, marginBottom: 8, position: "relative", overflow: "hidden" }}>
<div style={{ display: "flex", alignItems: "flex-start", gap: 12, transform: isSwipedOpen ? "translateX(-76px)" : "translateX(0)", transition: "transform 0.3s ease" }}>
<div style={{ background: "#7C3AED22", borderRadius: 8, padding: "8px 12px", minWidth: 40, textAlign: "center", flexShrink: 0 }}>
<span style={{ color: "#A78BFA", fontFamily: "monospace", fontSize: 14, fontWeight: 700 }}>{rangIndex + 1}</span>
</div>
<div style={{ flex: 1 }}>
{isEditing ? (
<div style={{ width: "100%" }}>
<textarea value={tempInstruction} onChange={e => setTempInstruction(e.target.value)} onFocus={e => e.target.select()} placeholder="Instruction du rang..." rows={3} autoFocus
style={{ width: "100%", background: "#0D0D1A", border: "1px solid #A78BFA44", borderRadius: 8, padding: "12px", color: "#F1F0EE", fontSize: 16, fontFamily: "'DM Sans', sans-serif", outline: "none", resize: "vertical", boxSizing: "border-box", marginBottom: 10 }} />
<div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
<input value={tempMailles} onChange={e => setTempMailles(e.target.value)} placeholder="Nb mailles" type="number"
style={{ background: "#0D0D1A", border: "1px solid #A78BFA44", borderRadius: 8, padding: "10px 12px", color: "#F1F0EE", fontSize: 16, width: 100, outline: "none" }} />
<button onClick={handleSave} style={{ background: "#059669", border: "none", borderRadius: 8, padding: "8px 16px", color: "#fff", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>Sauvegarder</button>
<button onClick={handleCancel} style={{ background: "#666", border: "none", borderRadius: 8, padding: "8px 16px", color: "#fff", fontSize: 13, cursor: "pointer" }}>Annuler</button>
</div>
</div>
) : (
<div style={{ width: "100%", cursor: "pointer" }} onClick={handleEditClick}>
<div style={{ color: "#F1F0EE", fontSize: 14, lineHeight: 1.5, marginBottom: 6, wordWrap: "break-word" }}>{rang.instruction}</div>
{rang.mailles && <div style={{ color: "#A78BFA", fontSize: 12, fontFamily: "monospace", marginBottom: 4 }}>{rang.mailles} mailles</div>}
<div style={{ color: "#666", fontSize: 11, fontStyle: "italic" }}>Swipe ← pour actions • Clic pour modifier</div>
</div>
)}
</div>
<div style={{ display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>
<button onClick={(e) => { e.stopPropagation(); onMoveUp(rang.id); }} disabled={isFirst} style={{ background: isFirst ? "#333" : "#7C3AED", border: "none", borderRadius: 6, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, cursor: isFirst ? "not-allowed" : "pointer" }}>↑</button>
<button onClick={(e) => { e.stopPropagation(); onMoveDown(rang.id); }} disabled={isLast} style={{ background: isLast ? "#333" : "#7C3AED", border: "none", borderRadius: 6, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, cursor: isLast ? "not-allowed" : "pointer" }}>↓</button>
</div>
</div>
<div style={{ position: "absolute", top: "50%", right: isSwipedOpen ? 8 : -80, transform: "translateY(-50%)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, transition: "right 0.3s ease", zIndex: 10, width: 72 }}>
<button onClick={(e) => handleActionClick(e, () => onUpdate(rang.id, { isNote: true }))} style={{ background: "#D97706", border: "none", borderRadius: 6, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14, cursor: "pointer" }}><Icon name="note" size={15} color="#fff" /></button>
<button onClick={(e) => handleActionClick(e, () => onDuplicate(rang.id))} style={{ background: "#0891B2", border: "none", borderRadius: 6, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, cursor: "pointer" }}>⧉</button>
<button onClick={(e) => handleActionClick(e, () => onDelete(rang.id))} style={{ background: "#DC2626", border: "none", borderRadius: 6, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, cursor: "pointer" }}>✗</button>
</div>
</div>
);
}
function PartieSection({ partie, onUpdate, onDelete, onDuplicate, onMoveUp, onMoveDown, isFirst, isLast, onAddRang, onUpdateRang, onDeleteRang, onDuplicateRang, onMoveRangUp, onMoveRangDown }) {
const [isCollapsed, setIsCollapsed] = useState(false);
const [isEditingNom, setIsEditingNom] = useState(false);
const [showColorPicker, setShowColorPicker] = useState(false);
const [tempNom, setTempNom] = useState(partie.nom);
const [displayNom, setDisplayNom] = useState(partie.nom || "Nouvelle partie");
const color = KALEIDOSCOPE_COLORS[partie.colorIdx % KALEIDOSCOPE_COLORS.length];
useEffect(() => {
const syncedNom = partie.nom || "Nouvelle partie";
setTempNom(syncedNom);
setDisplayNom(syncedNom);
}, [partie.nom]);
const handleSaveNom = () => {
const cleanNom = (tempNom || "").trim();
const finalNom = cleanNom || "Nouvelle partie";
setTempNom(finalNom);
setDisplayNom(finalNom);
onUpdate(partie.id, { nom: finalNom });
setIsEditingNom(false);
};
const handleStartEditNom = (e) => {
e.preventDefault();
e.stopPropagation();
setTempNom(displayNom || partie.nom || "Nouvelle partie");
setIsEditingNom(true);
};
const act = (e, fn) => { e.preventDefault(); e.stopPropagation(); fn(); };
return (
<div style={{ background: "#1A1A2E", border: `1px solid ${color.light}22`, borderRadius: 16, padding: 16, marginBottom: 16 }}>
{/* Header partie */}
<div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: isCollapsed ? 0 : 12 }}>
{/* Rond couleur cliquable */}
<div style={{ position: "relative", flexShrink: 0 }}>
<div onClick={() => setShowColorPicker(s => !s)}
style={{ width: 24, height: 24, borderRadius: "50%", background: `linear-gradient(135deg, ${color.bg}, ${color.light})`, cursor: "pointer", border: "2px solid rgba(255,255,255,0.3)", flexShrink: 0 }} />
{showColorPicker && (
<>
<div onClick={e => { e.stopPropagation(); setShowColorPicker(false); }} style={{ position: "fixed", inset: 0, zIndex: 50 }} />
<div onClick={e => e.stopPropagation()} style={{ position: "absolute", top: 30, left: 0, zIndex: 51, background: "#1A1A2E", border: `1px solid ${color.light}44`, borderRadius: 14, padding: 10, display: "flex", flexWrap: "wrap", gap: 8, width: 152, boxShadow: "0 8px 24px rgba(0,0,0,0.6)" }}>
{KALEIDOSCOPE_COLORS.map((c, i) => (
<div key={i} onClick={() => { onUpdate(partie.id, { colorIdx: i }); setShowColorPicker(false); }}
style={{ width: 28, height: 28, borderRadius: "50%", background: `linear-gradient(135deg, ${c.bg}, ${c.light})`, cursor: "pointer", border: partie.colorIdx === i ? "3px solid #fff" : "2px solid transparent", boxSizing: "border-box" }} />
))}
</div>
</>
)}
</div>
{/* Nom centré + rangs centré — deux colonnes */}
<div style={{ flex: 1, display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
<div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", minWidth: 0 }}>
{isEditingNom
? <input value={tempNom} onChange={e => { const nextNom = e.target.value; setTempNom(nextNom); setDisplayNom(nextNom || "Nouvelle partie"); }} onKeyDown={e => { e.stopPropagation(); if (e.key === "Enter") handleSaveNom(); if (e.key === "Escape") { const fallbackNom = partie.nom || "Nouvelle partie"; setTempNom(fallbackNom); setDisplayNom(fallbackNom); setIsEditingNom(false); } }} onBlur={handleSaveNom} onClick={e => e.stopPropagation()} onFocus={e => { e.stopPropagation(); e.target.select(); }} autoFocus style={{ background: "none", border: "none", outline: "none", color: "#F1F0EE", fontSize: 15, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", textAlign: "center", width: "100%" }} />
: <h3 onClick={handleStartEditNom} style={{ color: "#F1F0EE", margin: 0, fontSize: 15, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", textAlign: "center", wordBreak: "break-word" }}>{displayNom}</h3>
}
</div>
<div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
<span style={{ color: "#F1F0EE", fontSize: 15, fontWeight: 700, fontFamily: "'Syne', sans-serif" }}>{partie.rangs.filter(r => !r.isNote).length}</span>
<span style={{ color: color.light, fontSize: 10, fontFamily: "monospace" }}>rangs</span>
</div>
</div>
<button onClick={() => setIsCollapsed(!isCollapsed)} style={{ background: "none", border: "none", color: color.light, fontSize: 14, cursor: "pointer", padding: 4, flexShrink: 0 }}>{isCollapsed ? "▼" : "▲"}</button>
<div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
{[
{ icon: "↑", dis: isFirst, fn: () => onMoveUp(partie.id), bg: isFirst ? "#333" : color.bg },
{ icon: "↓", dis: isLast, fn: () => onMoveDown(partie.id), bg: isLast ? "#333" : color.bg },
{ icon: "⧉", dis: false, fn: () => onDuplicate(partie.id), bg: color.bg },
{ icon: "✗", dis: false, fn: () => onDelete(partie.id), bg: "#DC2626" },
].map((b, i) => (
<button key={i} onClick={e => act(e, b.fn)} disabled={b.dis} style={{ background: b.bg, border: "none", borderRadius: 6, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, cursor: b.dis ? "not-allowed" : "pointer" }}>{b.icon}</button>
))}
</div>
</div>
{!isCollapsed && (
<>
<div style={{ color: "#666", fontSize: 11, marginBottom: 12, fontStyle: "italic", textAlign: "center", padding: "6px 12px", background: `${color.bg}11`, borderRadius: 6, border: `1px dashed ${color.light}22` }}>
Swipe vers la gauche sur les rangs pour dupliquer ⧉ et supprimer ✗
</div>
<div style={{ marginBottom: 12 }}>
{(() => {
let rangCounter = 0;
return partie.rangs.map((rang, index) => {
const isNote = rang.isNote === true;
const displayIndex = isNote ? -1 : rangCounter++;
return (
<RangItem key={rang.id} rang={rang} rangIndex={displayIndex}
onUpdate={(rangId, updates) => onUpdateRang(partie.id, rangId, updates)}
onDelete={(rangId) => onDeleteRang(partie.id, rangId)}
onDuplicate={(rangId) => onDuplicateRang(partie.id, rangId)}
onMoveUp={(rangId) => onMoveRangUp(partie.id, rangId)}
onMoveDown={(rangId) => onMoveRangDown(partie.id, rangId)}
isFirst={index === 0} isLast={index === partie.rangs.length - 1} />
);
});
})()}
</div>
<button onClick={() => onAddRang(partie.id)} style={{ width: "100%", padding: "12px", borderRadius: 12, background: `${color.bg}22`, border: `1px dashed ${color.light}44`, color: color.light, fontSize: 14, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
+ Ajouter un rang
</button>
</>
)}
</div>
);
}
// ═══════════════════════════════════════════════════════════════
// COMPTEUR WIDGET (indépendant, swipe corrigé)
// ═══════════════════════════════════════════════════════════════
function CounterWidget({ counter, onUpdate, onDelete, onAddNew, globalRangCount }) {
const [isEditing, setIsEditing] = useState(false);
const [tempName, setTempName] = useState(counter.name);
const [isSwipedOpen, setIsSwipedOpen] = useState(false);
const [swipeStartX, setSwipeStartX] = useState(0);
const [isEditingMax, setIsEditingMax] = useState(false);
const [tempMax, setTempMax] = useState("");
const col = KALEIDOSCOPE_COLORS[counter.colorIdx % KALEIDOSCOPE_COLORS.length];
const displayValue = counter.syncWithGlobal ? ((globalRangCount - 1) % (counter.maxRepeats || 4)) + 1 : counter.value;
// Swipe handlers — séparés pour éviter les conflits
const onTS = (e) => { if (!isEditing && !isEditingMax) setSwipeStartX(e.touches[0].clientX); };
const onTM = (e) => { if (!isEditing && !isEditingMax && swipeStartX - e.touches[0].clientX > 30) setIsSwipedOpen(true); };
const onTE = (e) => { const t = e.changedTouches?.[0]; if (t && !isEditing && !isEditingMax && swipeStartX - t.clientX < -30) setIsSwipedOpen(false); };
// Action bouton: stopPropagation pour ne pas fermer le menu
const doAction = (e, fn) => { e.stopPropagation(); fn(); };
return (
<div onTouchStart={onTS} onTouchMove={onTM} onTouchEnd={onTE}
onClick={e => { if (isSwipedOpen && !isEditing && !isEditingMax) { e.stopPropagation(); setIsSwipedOpen(false); } }}
style={{ background: "rgba(30,30,50,0.8)", backdropFilter: "blur(10px)", border: `1px solid ${col.light}44`, borderRadius: 12, padding: 12, textAlign: "center", position: "relative", overflow: "hidden" }}>
<div style={{ transform: isSwipedOpen ? "translateX(-95px)" : "translateX(0)", transition: "transform 0.3s ease" }}>
<div style={{ marginBottom: 8 }}>
{isEditing
? <input value={tempName} onChange={e => setTempName(e.target.value)}
onKeyDown={e => e.key === "Enter" && (onUpdate({ name: tempName }), setIsEditing(false))}
onBlur={() => (onUpdate({ name: tempName }), setIsEditing(false))}
onFocus={e => e.target.select()} autoFocus style={{ background: "rgba(0,0,0,0.5)", border: `1px solid ${col.light}44`, borderRadius: 6, padding: "4px 8px", color: "#F1F0EE", fontSize: 16, outline: "none", textAlign: "center", fontFamily: "'DM Sans', sans-serif", width: "100%", fontWeight: 600 }} />
: <div onClick={e => { e.stopPropagation(); setIsEditing(true); }} style={{ color: col.light, fontSize: 13, textTransform: "uppercase", letterSpacing: 1, cursor: "pointer", fontWeight: 600 }}>{counter.name}</div>
}
</div>
<div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
<button onClick={e => { e.stopPropagation(); if (!counter.syncWithGlobal) onUpdate({ value: counter.value <= 1 ? (counter.maxRepeats || 4) : counter.value - 1 }); }} disabled={counter.syncWithGlobal}
style={{ background: counter.syncWithGlobal ? "#333" : col.bg, border: "none", borderRadius: "50%", width: 32, height: 32, color: "#fff", fontSize: 16, cursor: counter.syncWithGlobal ? "not-allowed" : "pointer", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
<span style={{ color: "#F1F0EE", fontSize: 24, fontWeight: 700, fontFamily: "monospace", minWidth: 50, textAlign: "center" }}>{displayValue}</span>
<button onClick={e => { e.stopPropagation(); if (!counter.syncWithGlobal) onUpdate({ value: counter.value >= (counter.maxRepeats || 4) ? 1 : counter.value + 1 }); }} disabled={counter.syncWithGlobal}
style={{ background: counter.syncWithGlobal ? "#333" : col.bg, border: "none", borderRadius: "50%", width: 32, height: 32, color: "#fff", fontSize: 16, cursor: counter.syncWithGlobal ? "not-allowed" : "pointer", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center" }} aria-label="Nouveau projet">+</button>
</div>
{counter.syncWithGlobal && <div style={{ color: "#666", fontSize: 10, marginTop: 6, fontStyle: "italic" }}>Sync • Reset après {counter.maxRepeats || 4}</div>}
</div>
{/* Actions swipe — stopPropagation sur chaque bouton */}
<div style={{ position: "absolute", top: "50%", right: isSwipedOpen ? 6 : -95, transform: "translateY(-50%)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, transition: "right 0.3s ease", zIndex: 10, width: 85 }}>
<button onClick={e => doAction(e, () => onUpdate({ syncWithGlobal: !counter.syncWithGlobal }))}
style={{ background: counter.syncWithGlobal ? col.bg : "#666", border: "none", borderRadius: 6, padding: "4px 5px", color: "#fff", fontSize: 9, cursor: "pointer", fontWeight: 600, height: 28 }}>SYNC</button>
{isEditingMax
? <input value={tempMax} onChange={e => setTempMax(e.target.value)}
onKeyDown={e => { if (e.key === "Enter") { onUpdate({ maxRepeats: Math.max(2, Math.min(20, parseInt(tempMax) || 4)) }); setIsEditingMax(false); setTempMax(""); setIsSwipedOpen(false); } }}
onBlur={() => { onUpdate({ maxRepeats: Math.max(2, Math.min(20, parseInt(tempMax) || 4)) }); setIsEditingMax(false); setTempMax(""); }}
onFocus={e => e.target.select()} autoFocus type="number" min="2" max="20"
onClick={e => e.stopPropagation()}
style={{ background: "#333", border: `1px solid ${col.light}44`, borderRadius: 6, padding: "4px 5px", color: "#F1F0EE", fontSize: 16, outline: "none", textAlign: "center", width: "100%", height: 28 }} />
: <button onClick={e => doAction(e, () => { setTempMax(String(counter.maxRepeats || 4)); setIsEditingMax(true); })}
style={{ background: "#7C3AED", border: "none", borderRadius: 6, padding: "4px 5px", color: "#fff", fontSize: 9, cursor: "pointer", fontWeight: 600, height: 28 }}>MAX {counter.maxRepeats || 4}</button>
}
{onAddNew && <button onClick={e => doAction(e, () => { onAddNew(); setIsSwipedOpen(false); })}
style={{ background: "#059669", border: "none", borderRadius: 6, padding: "4px 5px", color: "#fff", fontSize: 9, cursor: "pointer", fontWeight: 600, height: 28 }}>ADD</button>}
<button onClick={e => doAction(e, onDelete)}
style={{ background: "#DC2626", border: "none", borderRadius: 6, padding: "4px 5px", color: "#fff", fontSize: 9, cursor: "pointer", fontWeight: 600, height: 28 }}>DEL</button>
</div>
{isSwipedOpen && <div style={{ position: "absolute", bottom: 6, right: 8, color: col.light, fontSize: 8, opacity: 0.7 }}>→</div>}
</div>
);
}
// ═══════════════════════════════════════════════════════════════
// COMPTEUR DE RANGS (composant indépendant — corrige le bug reset)
// ═══════════════════════════════════════════════════════════════
function ProgressionSwipeCard({ currentPartieColor, currentIndex, totalRangs, circ_r, circ_c, currentPartie, currentPartieRangIndex, currentPartieTotal, onAddCounter, currentCountIndex }) {
const [swiped, setSwiped] = useState(false);
const [startX, setStartX] = useState(0);
return (
<div
onTouchStart={e => setStartX(e.touches[0].clientX)}
onTouchMove={e => { if (startX - e.touches[0].clientX > 40) setSwiped(true); }}
onTouchEnd={e => { if (startX - e.changedTouches[0].clientX < -40) setSwiped(false); }}
onClick={() => swiped && setSwiped(false)}
style={{ display: "flex", alignItems: "center", gap: 16, paddingBottom: 12, position: "relative", overflow: "hidden" }}>
<div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1, transform: swiped ? "translateX(-110px)" : "translateX(0)", transition: "transform 0.3s ease" }}>
{/* Cercle */}
<div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, flexShrink: 0 }}>
<div style={{ color: currentPartieColor.light, fontSize: 13, fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>Global</div>
<div key={`progress-${currentCountIndex}-${totalRangs}`} style={{ position: "relative", width: 95, height: 95, filter: `drop-shadow(0 0 10px ${currentPartieColor.bg}33)`, transformOrigin: "center", animation: "kaleidoProgressCleanPulse 340ms cubic-bezier(0.25, 0.9, 0.35, 1)" }}>
<svg width="95" height="95" style={{ transform: "rotate(-90deg)" }}>
<circle cx="47.5" cy="47.5" r={circ_r} stroke="rgba(255,255,255,0.1)" strokeWidth="4" fill="none" />
<circle cx="47.5" cy="47.5" r={circ_r} stroke="url(#kg)" strokeWidth="4" fill="none"
strokeDasharray={circ_c} strokeDashoffset={circ_c * (1 - Math.max(0, currentCountIndex + 1) / totalRangs)}
strokeLinecap="round" style={{
  transition: "stroke-dashoffset 0.56s cubic-bezier(0.22, 1, 0.36, 1)",
  color: currentPartieColor.light,
  filter: "drop-shadow(0 0 4px currentColor)",
  animation: "kaleidoProgressCleanGlow 340ms cubic-bezier(0.25, 0.9, 0.35, 1)"
}} />
<defs><linearGradient id="kg" x1="0%" y1="0%" x2="100%" y2="100%">
<stop offset="0%" stopColor={currentPartieColor.bg} />
<stop offset="100%" stopColor={currentPartieColor.light} />
</linearGradient></defs>
</svg>
<div style={{ position: "absolute", top:0, left:0, right:0, bottom:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
<div style={{ color: "#F1F0EE", fontSize: 26, fontWeight: 700, fontFamily: "'Syne', sans-serif", lineHeight: 1 }}>{Math.max(0, currentCountIndex + 1)}</div>
<div style={{ color: currentPartieColor.light, fontSize: 12, fontFamily: "monospace", marginTop: 3 }}>/ {totalRangs}</div>
</div>
</div>
<div style={{ color: "#6B6A7A", fontSize: 10, fontFamily: "monospace" }}>{Math.round(Math.max(0, currentCountIndex + 1)/totalRangs*100)}%</div>
</div>
{/* Barre partie */}
<div style={{ flex: 1 }}>
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
<div style={{ color: "#F1F0EE", fontSize: 15, fontWeight: 600 }}>{currentPartie?.nom}</div>
<div style={{ color: currentPartieColor.light, fontSize: 13, fontFamily: "monospace", fontWeight: 600 }}>{currentPartieRangIndex + 1}/{currentPartieTotal}</div>
</div>
<div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 12, height: 8, overflow: "hidden" }}>
<div style={{ background: `linear-gradient(90deg, ${currentPartieColor.bg}, ${currentPartieColor.light})`, width: `${(currentPartieRangIndex + 1) / currentPartieTotal * 100}%`, height: "100%", transition: "width 0.56s cubic-bezier(0.22, 1, 0.36, 1)", boxShadow: `0 0 18px ${currentPartieColor.bg}44` }} />
</div>
</div>
</div>
{/* Bouton swipe */}
<div style={{ position: "absolute", top: "50%", right: swiped ? 0 : -120, transform: "translateY(-60%)", transition: "right 0.3s ease", zIndex: 10 }}>
<button onClick={e => { e.stopPropagation(); onAddCounter(); setSwiped(false); }}
style={{ background: "#059669", border: "none", borderRadius: 8, padding: "10px 14px", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>+ Compteur</button>
</div>
{swiped && <div style={{ position: "absolute", bottom: 14, right: 4, color: currentPartieColor.light, fontSize: 8, opacity: 0.6 }}>→</div>}
</div>
);
}
function CompteurRangsView({ project, onNavigateHub, onNavigateEditor, onSaveProgress }) {
const goBackToHub = () => { if (typeof onNavigateHub === "function") { onNavigateHub(); } };

const patron = {
nom: project?.name || "Projet",
technique: project?.type || "crochet",
outil: project?.outil || "",
parties: project?.parties || [],
};
const hasParties = patron.parties.length > 0 && patron.parties.some(p => p.rangs.length > 0);
const allRangs = patron.parties.flatMap((p, pi) => p.rangs.map((r, ri) => ({ ...r, partieId: p.id, globalId: `${pi}-${ri}` })));
const allRangsForCount = allRangs.filter(r => !r.isNote);
const totalRangsForCount = allRangsForCount.length;
const savedCountableIndex = Math.max(0, Math.min((project?.rang || 1) - 1, Math.max(0, allRangsForCount.length - 1)));
const savedGlobalId = allRangsForCount[savedCountableIndex]?.globalId || allRangs[0]?.globalId || null;
const savedIndex = Math.max(0, allRangs.findIndex(r => r.globalId === savedGlobalId));
const [currentRangId, setCurrentRangId] = useState(savedGlobalId);
const currentRangIdRef = useRef(savedGlobalId);
const currentIndexRef = useRef(savedIndex);
const [startTime, setStartTime] = useState(Date.now() - (project?.elapsedTime || 0));
const [elapsedTime, setElapsedTime] = useState(project?.elapsedTime || 0);
const [isTimerRunning, setIsTimerRunning] = useState(true);
const [counters, setCounters] = useState([]);
useEffect(() => {
if (!isTimerRunning) return;
const interval = setInterval(() => setElapsedTime(Date.now() - startTime), 1000);
return () => clearInterval(interval);
}, [isTimerRunning, startTime]);
const formatTime = (ms) => {
const s = Math.floor(ms / 1000), m = Math.floor(s / 60), h = Math.floor(m / 60);
return `${String(h).padStart(2,'0')}:${String(m%60).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
};
const toggleTimer = () => { if (isTimerRunning) setIsTimerRunning(false); else { setStartTime(Date.now() - elapsedTime); setIsTimerRunning(true); } };
const resetTimer = () => { setStartTime(Date.now()); setElapsedTime(0); setIsTimerRunning(true); };
const [showNextPartieModal, setShowNextPartieModal] = useState(false);
const [showPrevPartieModal, setShowPrevPartieModal] = useState(false);
const currentIndex = allRangs.findIndex(r => r.globalId === currentRangId);
useEffect(() => {
  currentRangIdRef.current = currentRangId;
  currentIndexRef.current = currentIndex;
}, [currentRangId, currentIndex]);
const currentRang = allRangs[currentIndex];
const totalRangs = allRangsForCount.length;
const currentCountIndex = currentRang?.isNote
? allRangs.slice(0, currentIndex).filter(r => !r.isNote).length - 1
: allRangs.slice(0, currentIndex + 1).filter(r => !r.isNote).length - 1;
const currentPartie = currentRang ? patron.parties.find(p => p.id === currentRang.partieId) : null;
const partieRangsOnly = currentPartie ? currentPartie.rangs.filter(r => !r.isNote) : [];
// Si on est sur une note, trouver le dernier rang normal avant la note dans la partie
const currentPartieRangIndex = currentPartie ? (() => {
if (!currentRang?.isNote) return partieRangsOnly.findIndex(r => r.id === currentRang?.id);
// On est sur une note — chercher le dernier rang normal avant dans la partie
const idxInAll = currentPartie.rangs.findIndex(r => r.id === currentRang?.id);
const lastNormalBefore = currentPartie.rangs.slice(0, idxInAll).filter(r => !r.isNote);
if (lastNormalBefore.length === 0) return -1;
return partieRangsOnly.findIndex(r => r.id === lastNormalBefore[lastNormalBefore.length - 1].id);
})() : 0;
const currentPartieTotal = partieRangsOnly.length || 1;
const currentPartieColor = currentPartie
? KALEIDOSCOPE_COLORS[currentPartie.colorIdx % KALEIDOSCOPE_COLORS.length]
: KALEIDOSCOPE_COLORS[(project?.colorIdx || 0) % KALEIDOSCOPE_COLORS.length];
const getPartieFirstCountableGlobalId = (partieId) => {
if (!partieId) return null;
const firstCountable = allRangs.find(r => r.partieId === partieId && !r.isNote);
if (firstCountable) return firstCountable.globalId;
const firstAny = allRangs.find(r => r.partieId === partieId);
return firstAny?.globalId || null;
};
const isLastRangOfPartie = () => {
if (!currentPartie) return false;
const nextR = allRangs[currentIndex + 1];
return nextR && nextR.partieId !== currentPartie.id;
};
const isFirstRangOfPartie = () => {
if (!currentPartie) return false;
const prevR = allRangs[currentIndex - 1];
return prevR && prevR.partieId !== currentPartie.id;
};
const nextRang = () => {
const liveIndex = currentIndexRef.current;
if (liveIndex >= allRangs.length - 1) return;
const liveCurrent = allRangs[liveIndex];
const liveNext = allRangs[liveIndex + 1];
const liveIsLastOfPartie = !!liveCurrent && !!liveNext && liveNext.partieId !== liveCurrent.partieId;
if (liveIsLastOfPartie) {
setShowNextPartieModal(true);
} else {
currentRangIdRef.current = liveNext.globalId;
currentIndexRef.current = liveIndex + 1;
setCurrentRangId(liveNext.globalId);
if (typeof onSaveProgress === "function") onSaveProgress(allRangs.slice(0, liveIndex + 2).filter(r => !r.isNote).length, totalRangsForCount, elapsedTime);
if (navigator.vibrate) navigator.vibrate(15);
}
};
const confirmNextPartie = () => {
const liveIndex = currentIndexRef.current;
const nextPartieId = allRangs[liveIndex + 1]?.partieId;
const targetGlobalId = getPartieFirstCountableGlobalId(nextPartieId) || allRangs[liveIndex + 1]?.globalId || null;
if (targetGlobalId) {
  currentRangIdRef.current = targetGlobalId;
  currentIndexRef.current = allRangs.findIndex(r => r.globalId === targetGlobalId);
  setCurrentRangId(targetGlobalId);
  if (typeof onSaveProgress === "function") onSaveProgress(allRangs.slice(0, Math.max(0, currentIndexRef.current) + 1).filter(r => !r.isNote).length, totalRangsForCount, elapsedTime);
}
setShowNextPartieModal(false);
setCounters(prev => prev.map(c => ({ ...c, value: 1 })));
if (navigator.vibrate) navigator.vibrate(20);
};
const prevRang = () => {
const liveIndex = currentIndexRef.current;
if (liveIndex <= 0) return;
const liveCurrent = allRangs[liveIndex];
const livePrev = allRangs[liveIndex - 1];
const liveIsFirstOfPartie = !!liveCurrent && !!livePrev && livePrev.partieId !== liveCurrent.partieId;
if (liveIsFirstOfPartie) {
setShowPrevPartieModal(true);
} else {
currentRangIdRef.current = livePrev.globalId;
currentIndexRef.current = liveIndex - 1;
setCurrentRangId(livePrev.globalId);
if (typeof onSaveProgress === "function") onSaveProgress(allRangs.slice(0, liveIndex).filter(r => !r.isNote).length, totalRangsForCount, elapsedTime);
if (navigator.vibrate) navigator.vibrate(15);
}
};
const confirmPrevPartie = () => {
const liveIndex = currentIndexRef.current;
const target = allRangs[liveIndex - 1];
if (target) {
  currentRangIdRef.current = target.globalId;
  currentIndexRef.current = liveIndex - 1;
  setCurrentRangId(target.globalId);
  if (typeof onSaveProgress === "function") onSaveProgress(allRangs.slice(0, liveIndex).filter(r => !r.isNote).length, totalRangsForCount, elapsedTime);
}
setShowPrevPartieModal(false);
setCounters(prev => prev.map(c => ({ ...c, value: 1 })));
if (navigator.vibrate) navigator.vibrate(20);
};
const goToPartie = (partieId) => {
const targetGlobalId = getPartieFirstCountableGlobalId(partieId);
if (targetGlobalId) {
  currentRangIdRef.current = targetGlobalId;
  currentIndexRef.current = allRangs.findIndex(r => r.globalId === targetGlobalId);
  setCurrentRangId(targetGlobalId);
  if (typeof onSaveProgress === "function") onSaveProgress(allRangs.slice(0, Math.max(0, currentIndexRef.current) + 1).filter(r => !r.isNote).length, totalRangsForCount, elapsedTime);
}
setCounters(prev => prev.map(c => ({ ...c, value: 1 })));
};
const addCounter = () => setCounters(prev => [...prev, { id: Date.now(), name: `Compteur ${prev.length + 1}`, value: 1, maxRepeats: 4, syncWithGlobal: false, colorIdx: Math.floor(Math.random() * KALEIDOSCOPE_COLORS.length) }]);
const updateCounter = (id, updates) => setCounters(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
const deleteCounter = (id) => setCounters(prev => prev.filter(c => c.id !== id));
if (!hasParties) return (
<div style={{ background: "#0D0D1A", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", color: "#F1F0EE", maxWidth: 430, margin: "0 auto", padding: 20 }}>
<div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 30 }}>
<button data-kaleido-back-button="true" onClick={() => { if (typeof onSaveProgress === "function") { try { onSaveProgress(typeof rang !== "undefined" ? rang : allRangs.slice(0, currentIndex + 1).filter(r => !r.isNote).length, typeof total !== "undefined" ? total : totalRangsForCount, typeof elapsedTime !== "undefined" ? elapsedTime : undefined); } catch (e) {} } goBackToHub(); }} style={{ background: "#1E1E32", border: "none", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", color: "#A78BFA", fontSize: 16, cursor: "pointer" }}>←</button>
<h1 style={{ color: "#F1F0EE", margin: 0, fontSize: 18, fontFamily: "'Syne', sans-serif" }}>{patron.nom}</h1>
</div>
<div style={{ textAlign: "center", padding: "60px 20px", color: "#6B6A7A" }}>
<div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}><IconBadge name="yarn" tone="violet" size={24} badgeSize={52} /></div>
<div style={{ fontSize: 16, marginBottom: 8, color: "#F1F0EE" }}>Aucun patron créé</div>
<div style={{ fontSize: 13, marginBottom: 24 }}>Crée d'abord tes parties et rangs dans l'éditeur de patron</div>
<button onClick={() => onNavigateEditor(project)} style={{ background: "linear-gradient(135deg, #7C3AED, #EC4899)", border: "none", borderRadius: 12, padding: "12px 24px", color: "#fff", fontSize: 14, cursor: "pointer", fontWeight: 600 }}>Ouvrir l'éditeur</button>
</div>
</div>
);
const circ_r = 43.5, circ_c = 2 * Math.PI * circ_r;
return (
<div style={{ background: "#0D0D1A", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", maxWidth: 430, margin: "0 auto", position: "relative", overflow: "hidden" }}>
<style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap'); ${GLOBAL_MOTION_CSS} ::-webkit-scrollbar { width: 0; } * { -webkit-tap-highlight-color: transparent; } input, textarea, select { font-size: 16px !important; } @keyframes gradientShift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} } .kgbg { background: linear-gradient(-45deg, #0D0D1A, #1A0A2E, #0D0D1A, #1E1E32); background-size: 400% 400%; animation: gradientShift 18s linear infinite; } @keyframes float { 0%,100%{transform:translateY(0) rotate(0deg);opacity:0.1} 50%{transform:translateY(-20px) rotate(180deg);opacity:0.3} }
@keyframes bubblePulse {
  0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.82; }
  50% { transform: translate(-50%, -50%) scale(1.045); opacity: 1; }
}
@keyframes bubbleBreath {
  0%, 100% { transform: translate(-50%, -50%) scale(1); }
  50% { transform: translate(-50%, -50%) scale(1.018); }
}
@keyframes infoBob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-1px); }
}`}</style>
<div className="kgbg" style={{ position: "absolute", top:0, left:0, right:0, bottom:0 }} />
{Array.from({ length: 6 }).map((_, i) => (
<div key={i} style={{ position: "absolute", top: `${20+i*15}%`, left: `${10+i*12}%`, width: 20, height: 20, borderRadius: "50%", background: `${currentPartieColor.light}22`, animation: `float ${3+i*0.5}s ease-in-out infinite`, animationDelay: `${i*0.3}s` }} />
))}
{/* Header */}
<div style={{ position: "relative", zIndex: 10, padding: "44px 20px 0", background: "rgba(13,13,26,0.95)", backdropFilter: "blur(10px)" }}>
<div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
<button data-kaleido-back-button="true" onClick={() => { onSaveProgress(allRangs.slice(0, Math.max(0, currentIndexRef.current) + 1).filter(r => !r.isNote).length, totalRangsForCount, elapsedTime); onNavigateHub(); }} style={{ background: "#1E1E32", border: "none", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", color: "#A78BFA", fontSize: 16, cursor: "pointer" }}>←</button>
<div style={{ flex: 1 }}>
<h1 style={{ color: "#F1F0EE", margin: 0, fontSize: 16, fontWeight: 700, fontFamily: "'Syne', sans-serif" }}>{patron.nom}</h1>
<div style={{ color: "#A78BFA", fontSize: 11, fontFamily: "monospace", marginTop: 2 }}>{patron.technique}{patron.outil ? ` • ${patron.outil}` : ""}</div>
</div>
<div style={{ background: "linear-gradient(135deg, #1E1E32, #2A2A3E)", border: "2px solid #7C3AED44", borderRadius: 16, padding: "12px 16px", boxShadow: "0 6px 20px rgba(124,58,237,0.4)", minWidth: 140 }}>
<div style={{ color: "#F1F0EE", fontSize: 22, fontFamily: "monospace", fontWeight: 700, textAlign: "center", marginBottom: 4 }}>{formatTime(elapsedTime)}</div>
<div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
<button onClick={toggleTimer} style={{ background: isTimerRunning ? "#DC2626" : "#059669", border: "none", borderRadius: 10, padding: "5px 11px", color: "#fff", fontSize: 11, cursor: "pointer", fontWeight: 600 }}>{isTimerRunning ? "PAUSE" : "PLAY"}</button>
<button onClick={resetTimer} style={{ background: "#7C3AED", border: "none", borderRadius: 10, padding: "5px 11px", color: "#fff", fontSize: 11, cursor: "pointer", fontWeight: 600 }}>RESET</button>
</div>
</div>
</div>
{/* Progression avec swipe pour ajouter compteur */}
<ProgressionSwipeCard
currentPartieColor={currentPartieColor}
currentIndex={currentIndex} totalRangs={totalRangs}
circ_r={circ_r} circ_c={circ_c}
currentPartie={currentPartie}
currentPartieRangIndex={currentPartieRangIndex}
currentPartieTotal={currentPartieTotal}
onAddCounter={addCounter}
currentCountIndex={currentCountIndex}
/>
</div>
{/* Compteurs */}
<div style={{ position: "relative", zIndex: 10, padding: "0 20px 12px" }}>
{counters.length > 0 && (
<div style={{ display: "grid", gridTemplateColumns: counters.length === 1 ? "1fr" : "repeat(auto-fit, minmax(150px, 1fr))", gap: 8 }}>
{counters.map(c => <CounterWidget key={c.id} counter={c} onUpdate={u => updateCounter(c.id, u)} onDelete={() => deleteCounter(c.id)} onAddNew={addCounter} globalRangCount={currentPartieRangIndex + 1} />)}
</div>
)}
</div>
{/* Parties */}
<div style={{ position: "relative", zIndex: 10, padding: "0 20px 12px" }}>
<div style={{ display: "flex", gap: 10, overflowX: "auto", paddingLeft: 6, paddingBottom: 4 }}>
{patron.parties.map(p => {
const col = KALEIDOSCOPE_COLORS[p.colorIdx % KALEIDOSCOPE_COLORS.length];
const isActive = currentPartie?.id === p.id;
return (
<button key={p.id} onClick={() => goToPartie(p.id)}
style={{ background: isActive ? `linear-gradient(135deg, ${col.bg}, ${col.light})` : "#1E1E32", border: "none", borderRadius: 18, padding: "6px 18px", color: isActive ? "#fff" : col.light, fontSize: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, cursor: "pointer", transition: "all 0.2s ease", transform: isActive ? "scale(1.05)" : "scale(1)", textTransform: "uppercase", letterSpacing: 0.5, boxShadow: isActive ? `0 4px 12px ${col.bg}44` : "none", minWidth: 75, height: 32, lineHeight: "20px", display: "inline-flex", alignItems: "center", justifyContent: "center", marginLeft: isActive ? 2 : 0, whiteSpace: "nowrap", flexShrink: 0 }}>
{p.nom}
</button>
);
})}
</div>
</div>
{/* Instruction courante */}
<div style={{ position: "relative", zIndex: 10, padding: "0 20px 12px" }}>
<div style={{ background: "rgba(30,30,50,0.9)", backdropFilter: "blur(20px)", border: `2px solid ${currentPartieColor.light}44`, borderRadius: 20, padding: "16px 20px", textAlign: "center", boxShadow: `0 8px 32px ${currentPartieColor.bg}33` }}>
<div style={{ background: `linear-gradient(135deg, ${currentPartieColor.bg}, ${currentPartieColor.light})`, borderRadius: 12, padding: "10px 16px", display: "inline-block", marginBottom: 12, boxShadow: `0 4px 16px ${currentPartieColor.bg}66` }}>
<span style={{ color: "#fff", fontSize: 15, fontWeight: 700, fontFamily: "'Syne', sans-serif" }}>{currentRang?.isNote ? "Note" : `Rang ${Math.max(1, currentPartieRangIndex + 1)}`}</span>
</div>
<div style={{ color: "#F1F0EE", fontSize: 19, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5, padding: "0 8px", marginBottom: 10 }}>{currentRang?.instruction}</div>
{currentRang?.mailles && (
<div style={{ background: `${currentPartieColor.bg}22`, borderRadius: 10, padding: "8px 16px", display: "inline-block", border: `1px solid ${currentPartieColor.light}44` }}>
<span style={{ color: currentPartieColor.light, fontSize: 14, fontFamily: "monospace", fontWeight: 600 }}>{currentRang.mailles} mailles</span>
</div>
)}
</div>
</div>
{/* Précédent / Suivant */}
<div style={{ position: "relative", zIndex: 10, padding: "0 20px 12px" }}>
<div style={{ display: "flex", gap: 16, alignItems: "center", justifyContent: "center", paddingTop: 2 }}>
<button
onClick={prevRang}
disabled={currentIndex === 0}
style={{ background: currentIndex === 0 ? "#333" : "#1E1E32", color: currentIndex === 0 ? "#666" : currentPartieColor.light, border: "none", borderRadius: 20, padding: "16px 28px", fontSize: 16, minWidth: 140, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, cursor: currentIndex === 0 ? "not-allowed" : "pointer", transition: "all 0.15s ease", display: "flex", alignItems: "center", justifyContent: "center" }}>
← Précédent
</button>
<button
onClick={nextRang}
disabled={currentIndex === allRangs.length - 1}
style={{ background: currentIndex === allRangs.length - 1 ? "#333" : `linear-gradient(135deg, ${currentPartieColor.bg}, ${currentPartieColor.light})`, color: currentIndex === allRangs.length - 1 ? "#666" : "#fff", border: "none", borderRadius: 20, padding: "16px 28px", fontSize: 16, minWidth: 140, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, cursor: currentIndex === allRangs.length - 1 ? "not-allowed" : "pointer", transition: "all 0.15s ease", display: "flex", alignItems: "center", justifyContent: "center" }}>
Suivant →
</button>
</div>
</div>
{/* Prochain rang - seulement si on reste dans la même partie */}
{currentIndex < allRangs.length - 1 && (
<div style={{ position: "relative", zIndex: 10, padding: "0 20px 12px" }}>
<div style={{ background: "rgba(13,13,26,0.8)", border: "1px solid #ffffff0A", borderRadius: 16, padding: 16 }}>
<div style={{ color: "#666", fontSize: 12, marginBottom: 8, textAlign: "center" }}>Prochain rang</div>
<div style={{ color: "#A78BFA", fontSize: 14, fontFamily: "'DM Sans', sans-serif", textAlign: "center", lineHeight: 1.4 }}>{allRangs[currentIndex + 1]?.instruction}</div>
</div>
</div>
)}
{/* Modale passage à la partie suivante */}
{showNextPartieModal && (() => {
const nextPartie = patron.parties.find(p => p.id === allRangs[currentIndex + 1]?.partieId);
const nextColor = nextPartie ? KALEIDOSCOPE_COLORS[nextPartie.colorIdx % KALEIDOSCOPE_COLORS.length] : currentPartieColor;
return (
<div data-kaleido-modal-backdrop="true" style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
<div data-kaleido-modal-card="true" style={{ background: "#1A1A2E", borderRadius: 22, padding: 28, width: "100%", maxWidth: 360, textAlign: "center", border: `1px solid ${currentPartieColor.light}33` }}>
<div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}><IconBadge name="sparkles" tone="amber" size={24} badgeSize={56} /></div>
<div style={{ color: currentPartieColor.light, fontSize: 13, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Partie terminée !</div>
<h2 style={{ color: "#F1F0EE", fontSize: 20, fontFamily: "'Syne', sans-serif", margin: "0 0 8px" }}>{currentPartie?.nom}</h2>
<p style={{ color: "#6B6A7A", fontSize: 14, margin: "0 0 24px" }}>Tu veux passer à la partie suivante ?</p>
<div style={{ background: `${nextColor.bg}22`, border: `1px solid ${nextColor.light}44`, borderRadius: 14, padding: "12px 16px", marginBottom: 24 }}>
<div style={{ color: nextColor.light, fontSize: 12, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Prochaine partie</div>
<div style={{ color: "#F1F0EE", fontSize: 17, fontWeight: 700, fontFamily: "'Syne', sans-serif" }}>{nextPartie?.nom}</div>
<div style={{ color: "#6B6A7A", fontSize: 12, marginTop: 4 }}>{nextPartie?.rangs.length} rangs</div>
</div>
<div style={{ display: "flex", gap: 12 }}>
<button onClick={() => setShowNextPartieModal(false)}
style={{ flex: 1, padding: "14px", borderRadius: 14, border: "1px solid #333", background: "none", color: "#999", fontSize: 14, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
Rester ici
</button>
<button onClick={confirmNextPartie}
style={{ flex: 1, padding: "14px", borderRadius: 14, border: "none", background: `linear-gradient(135deg, ${nextColor.bg}, ${nextColor.light})`, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
Continuer →
</button>
</div>
</div>
</div>
);
})()}
{/* Modale retour à la partie précédente */}
{showPrevPartieModal && (() => {
const prevPartie = patron.parties.find(p => p.id === allRangs[currentIndex - 1]?.partieId);
const prevColor = prevPartie ? KALEIDOSCOPE_COLORS[prevPartie.colorIdx % KALEIDOSCOPE_COLORS.length] : currentPartieColor;
return (
<div data-kaleido-modal-backdrop="true" style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
<div data-kaleido-modal-card="true" style={{ background: "#1A1A2E", borderRadius: 22, padding: 28, width: "100%", maxWidth: 360, textAlign: "center", border: `1px solid ${currentPartieColor.light}33` }}>
<div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}><IconBadge name="undo" tone="slate" size={22} badgeSize={56} /></div>
<div style={{ color: currentPartieColor.light, fontSize: 13, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Revenir en arrière ?</div>
<h2 style={{ color: "#F1F0EE", fontSize: 20, fontFamily: "'Syne', sans-serif", margin: "0 0 8px" }}>{currentPartie?.nom}</h2>
<p style={{ color: "#6B6A7A", fontSize: 14, margin: "0 0 24px" }}>Tu veux retourner à la partie précédente ?</p>
<div style={{ background: `${prevColor.bg}22`, border: `1px solid ${prevColor.light}44`, borderRadius: 14, padding: "12px 16px", marginBottom: 24 }}>
<div style={{ color: prevColor.light, fontSize: 12, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Partie précédente</div>
<div style={{ color: "#F1F0EE", fontSize: 17, fontWeight: 700, fontFamily: "'Syne', sans-serif" }}>{prevPartie?.nom}</div>
<div style={{ color: "#6B6A7A", fontSize: 12, marginTop: 4 }}>{prevPartie?.rangs.length} rangs</div>
</div>
<div style={{ display: "flex", gap: 12 }}>
<button onClick={() => setShowPrevPartieModal(false)}
style={{ flex: 1, padding: "14px", borderRadius: 14, border: "1px solid #333", background: "none", color: "#999", fontSize: 14, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
Rester ici
</button>
<button onClick={confirmPrevPartie}
style={{ flex: 1, padding: "14px", borderRadius: 14, border: "none", background: `linear-gradient(135deg, ${prevColor.bg}, ${prevColor.light})`, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
← Retourner
</button>
</div>
</div>
</div>
);
})()}
</div>
);
}
// ═══════════════════════════════════════════════════════════════
// IMPORT PDF MODAL
// ═══════════════════════════════════════════════════════════════
function ImportPdfModal({ onClose, onCreate }) {
const [name, setName] = useState("");
const [pdfData, setPdfData] = useState(null);
const [pdfName, setPdfName] = useState("");
const [loading, setLoading] = useState(false);
const [configRangs, setConfigRangs] = useState(false);
const [totalRangs, setTotalRangs] = useState("");
const [parties, setParties] = useState([]);
const handleFile = (e) => {
const file = e.target.files[0];
if (!file || file.type !== "application/pdf") return;
setLoading(true); setPdfName(file.name);
if (!name) setName(file.name.replace(".pdf", ""));
const reader = new FileReader();
reader.onload = (ev) => { setPdfData(ev.target.result); setLoading(false); };
reader.readAsDataURL(file);
};
const addPartie = () => setParties(prev => [...prev, { id: Date.now(), nom: "", rangs: "" }]);
const updatePartie = (id, field, val) => setParties(prev => prev.map(p => p.id === id ? { ...p, [field]: val } : p));
const removePartie = (id) => setParties(prev => prev.filter(p => p.id !== id));
const totalFromParties = parties.reduce((s, p) => s + (parseInt(p.rangs) || 0), 0);
const total = configRangs ? (parties.length > 0 ? totalFromParties : parseInt(totalRangs) || 0) : 0;
const canCreate = name.trim() && pdfData && !loading;
return (
<div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "flex-end", justifyContent: "center", fontFamily: "'DM Sans', sans-serif" }}>
<div onClick={e => e.stopPropagation()} style={{ background: "#1A1A2E", borderRadius: "24px 24px 0 0", padding: "24px 20px 40px", width: "100%", maxWidth: 430, maxHeight: "90vh", overflowY: "auto", border: "1px solid #0891B244" }}>
<div style={{ width: 36, height: 4, background: "#333", borderRadius: 2, margin: "0 auto 20px" }} />
<h3 style={{ color: "#F1F0EE", fontFamily: "'Syne', sans-serif", fontSize: 18, margin: "0 0 20px", textAlign: "center" }}>Importer un patron PDF</h3>
{/* Nom */}
<div style={{ marginBottom: 14 }}>
<label style={{ color: "#22D3EE", fontSize: 11, fontFamily: "monospace", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Nom du projet</label>
<input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Tuque Noël, Écharpe hiver..."
style={{ width: "100%", background: "#13131F", border: "1px solid #0891B244", borderRadius: 10, padding: "12px 14px", color: "#F1F0EE", fontSize: 16, outline: "none", boxSizing: "border-box" }} />
</div>
{/* Upload PDF */}
<div style={{ marginBottom: 20 }}>
<label style={{ color: "#22D3EE", fontSize: 11, fontFamily: "monospace", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Fichier PDF</label>
<label style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: pdfData ? "rgba(8,145,178,0.15)" : "#13131F", border: `1px dashed ${pdfData ? "#22D3EE" : "#0891B244"}`, borderRadius: 10, cursor: "pointer" }}>
<span style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>{loading ? <Icon name="settings" size={18} color="#22D3EE" style={{ opacity: 0.9 }} /> : pdfData ? <Icon name="checkCircle" size={18} color="#22D3EE" /> : <Icon name="file" size={18} color="#6B6A7A" />}</span>
<div>
<div style={{ color: pdfData ? "#22D3EE" : "#6B6A7A", fontSize: 14, fontWeight: pdfData ? 600 : 400 }}>
{loading ? "Chargement..." : pdfData ? pdfName : "Appuyer pour choisir un PDF"}
</div>
{pdfData && <div style={{ color: "#6B6A7A", fontSize: 11, marginTop: 2 }}>PDF chargé ✓</div>}
</div>
<input type="file" accept="application/pdf" onChange={handleFile} style={{ display: "none" }} />
</label>
</div>
{/* Toggle configurer rangs */}
<div style={{ marginBottom: configRangs ? 16 : 24 }}>
<button onClick={() => setConfigRangs(r => !r)} style={{ width: "100%", padding: "12px 16px", borderRadius: 12, background: configRangs ? "rgba(8,145,178,0.15)" : "#13131F", border: `1px solid ${configRangs ? "#22D3EE44" : "#ffffff11"}`, color: configRangs ? "#22D3EE" : "#6B6A7A", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 10, fontFamily: "'DM Sans', sans-serif" }}>
<span>{configRangs ? <Icon name="checkCircle" size={16} color="#22D3EE" /> : <Icon name="square" size={16} color="#6B6A7A" />}</span>
<span>Configurer les rangs et parties <span style={{ color: "#6B6A7A", fontSize: 12 }}>(optionnel)</span></span>
</button>
</div>
{/* Section rangs optionnelle */}
{configRangs && (
<div style={{ marginBottom: 24, padding: 16, background: "#13131F", borderRadius: 14, border: "1px solid #0891B233" }}>
{/* Total rangs (seulement si pas de parties) */}
{parties.length === 0 && (
<div style={{ marginBottom: 14 }}>
<label style={{ color: "#22D3EE", fontSize: 11, fontFamily: "monospace", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Nombre total de rangs</label>
<input value={totalRangs} onChange={e => setTotalRangs(e.target.value)} placeholder="Ex: 120" type="number"
style={{ width: "100%", background: "#1A1A2E", border: "1px solid #0891B244", borderRadius: 10, padding: "11px 14px", color: "#F1F0EE", fontSize: 16, outline: "none", boxSizing: "border-box" }} />
</div>
)}
{/* Parties */}
<label style={{ color: "#22D3EE", fontSize: 11, fontFamily: "monospace", display: "block", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>Parties <span style={{ color: "#6B6A7A", textTransform: "none", letterSpacing: 0 }}>(optionnel)</span></label>
{parties.map((p, i) => (
<div key={p.id} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center", width: "100%", minWidth: 0 }}>
<div style={{ width: 20, height: 20, borderRadius: "50%", background: `linear-gradient(135deg, ${KALEIDOSCOPE_COLORS[i % KALEIDOSCOPE_COLORS.length].bg}, ${KALEIDOSCOPE_COLORS[i % KALEIDOSCOPE_COLORS.length].light})`, flexShrink: 0 }} />
<input value={p.nom} onChange={e => updatePartie(p.id, "nom", e.target.value)} placeholder={`Partie ${i + 1}`}
style={{ flex: 1, minWidth: 0, background: "rgba(255,255,255,0.06)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "10px 12px", color: "#F1F0EE", fontSize: 15, outline: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.25)" }} />
<input value={p.rangs} onChange={e => updatePartie(p.id, "rangs", e.target.value)} placeholder="Rangs" type="number"
style={{ width: 64, flexShrink: 0, background: "rgba(255,255,255,0.06)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "10px 8px", color: "#F1F0EE", fontSize: 15, outline: "none", textAlign: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.25)" }} />
<button onClick={() => removePartie(p.id)} style={{ width: 28, height: 28, borderRadius: 6, background: "#DC262633", border: "none", color: "#F87171", fontSize: 14, cursor: "pointer", flexShrink: 0 }}>✕</button>
</div>
))}
<button onClick={addPartie} style={{ width: "100%", padding: "10px", borderRadius: 10, background: "none", border: "1px dashed #0891B244", color: "#22D3EE", fontSize: 13, cursor: "pointer", marginTop: 4 }}>
+ Ajouter une partie
</button>
{parties.length > 0 && (
<div style={{ color: "#6B6A7A", fontSize: 12, textAlign: "center", marginTop: 10 }}>Total : {totalFromParties} rangs</div>
)}
</div>
)}
<div style={{ display: "flex", gap: 12 }}>
<button onClick={onClose} style={{ flex: 1, padding: "14px", borderRadius: 14, border: "1px solid #333", background: "none", color: "#999", fontSize: 14, cursor: "pointer" }}>Annuler</button>
<button onClick={() => canCreate && onCreate(name.trim(), pdfData, total, parties)} disabled={!canCreate}
style={{ flex: 1, padding: "14px", borderRadius: 14, border: "none", background: canCreate ? "linear-gradient(135deg, #0891B2, #22D3EE)" : "#333", color: canCreate ? "#fff" : "#666", fontSize: 14, fontWeight: 700, cursor: canCreate ? "pointer" : "not-allowed" }}>
Créer la bulle
</button>
</div>
</div>
</div>
);
}
// ═══════════════════════════════════════════════════════════════
// PDF ZOOM ZONE — pinch-zoom maison, indépendant du header
// ═══════════════════════════════════════════════════════════════
function PdfZoomZone({ loading, loadError, pages, zoom }) {
const [scale, setScale] = useState(1);
const [offset, setOffset] = useState({ x: 0, y: 0 });
const lastDist = useRef(null);
const lastScale = useRef(1);
const lastOffset = useRef({ x: 0, y: 0 });
const lastMid = useRef(null);
const containerRef = useRef(null);
const getDist = (t1, t2) => Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
const getMid = (t1, t2) => ({ x: (t1.clientX + t2.clientX) / 2, y: (t1.clientY + t2.clientY) / 2 });
const onTouchStart = (e) => {
if (e.touches.length === 2) {
e.preventDefault();
lastDist.current = getDist(e.touches[0], e.touches[1]);
lastMid.current = getMid(e.touches[0], e.touches[1]);
lastScale.current = scale;
lastOffset.current = offset;
}
};
const onTouchMove = (e) => {
if (e.touches.length === 2) {
e.preventDefault();
const dist = getDist(e.touches[0], e.touches[1]);
const mid = getMid(e.touches[0], e.touches[1]);
const newScale = Math.min(5, Math.max(1, lastScale.current * (dist / lastDist.current)));
// Ajuster l'offset pour zoomer centré sur le point de pinch
const dx = mid.x - lastMid.current.x;
const dy = mid.y - lastMid.current.y;
const newX = lastOffset.current.x + dx;
const newY = lastOffset.current.y + dy;
setScale(newScale);
// Limiter l'offset quand scale = 1
if (newScale <= 1) {
setOffset({ x: 0, y: 0 });
} else {
setOffset({ x: newX, y: newY });
}
}
};
const onTouchEnd = (e) => {
if (e.touches.length < 2) {
lastDist.current = null;
if (scale <= 1) setOffset({ x: 0, y: 0 });
}
};
return (
<div
ref={containerRef}
onTouchStart={onTouchStart}
onTouchMove={onTouchMove}
onTouchEnd={onTouchEnd}
style={{ flex: 1, overflow: scale > 1 ? "hidden" : "auto", background: "#111", WebkitOverflowScrolling: "touch", position: "relative" }}>
<div style={{
transform: `scale(${scale}) translate(${offset.x / scale}px, ${offset.y / scale}px)`,
transformOrigin: "top center",
transition: lastDist.current ? "none" : "transform 0.15s ease",
width: "100%",
}}>
{loading ? (
<div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 16 }}>
<div style={{ fontSize: 40 }}>⏳</div>
<div style={{ fontSize: 15, color: "#A78BFA" }}>Rendu du PDF en cours...</div>
<div style={{ fontSize: 12, color: "#6B6A7A" }}>Cela peut prendre quelques secondes</div>
</div>
) : loadError ? (
<div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 12 }}>
<div style={{ fontSize: 48 }}>

</div>
            <div style={{ fontSize: 14, color: "#F87171" }}>PDF introuvable</div>
            <div style={{ fontSize: 12, color: "#6B6A7A", textAlign: "center", padding: "0 40px" }}>Le fichier n'a pas pu être chargé</div>
          </div>
        ) : (
          pages.map((src, i) => (
            <div key={i} style={{ borderBottom: "2px solid #222" }}>
              <img src={src} alt={`Page ${i + 1}`} style={{ width: `${zoom}%`, display: "block", margin: "0 auto" }} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
// ═══════════════════════════════════════════════════════════════
// LECTEUR PDF
// ═══════════════════════════════════════════════════════════════
function PdfCounterCard({ color, currentPartie, totalPartieCourante, rangDansPartie, rang, total, pct, decrementRang, incrementRang, addCounter, resetRang }) {
  const [swiped, setSwiped] = useState(false);
  const [startX, setStartX] = useState(0);
  return (
    <div
      onTouchStart={e => setStartX(e.touches[0].clientX)}
      onTouchMove={e => { if (startX - e.touches[0].clientX > 40) setSwiped(true); }}
      onTouchEnd={e => { if (startX - e.changedTouches[0].clientX < -40) setSwiped(false); }}
      onClick={() => swiped && setSwiped(false)}
      style={{ background: "#1A1A2E", borderRadius: 14, border: `1px solid ${color.light}22`, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, position: "relative", overflow: "hidden" }}>
      {/* Contenu principal */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, transform: swiped ? "translateX(-100px)" : "translateX(0)", transition: "transform 0.3s ease" }}>
        {/* Cercle — progression globale */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, width: 80, flexShrink: 0 }}>
          <div style={{ color: color.light, fontSize: 14, fontFamily: "'DM Sans', sans-serif", letterSpacing: 0.3, textAlign: "center", lineHeight: 1.2, fontWeight: 700 }}>Global</div>
          <div key={`pdf-progress-${rang}-${total}`} style={{ position: "relative", width: 64, height: 64, filter: `drop-shadow(0 0 10px ${color.bg}30)`, transformOrigin: "center", animation: "kaleidoProgressCleanPulse 320ms cubic-bezier(0.25, 0.9, 0.35, 1)" }}>
            <svg width="64" height="64" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="32" cy="32" r="27" stroke="rgba(255,255,255,0.08)" strokeWidth="3.5" fill="none" />
              <circle cx="32" cy="32" r="27" stroke="url(#pgc)" strokeWidth="3.5" fill="none"
                strokeDasharray={2 * Math.PI * 27}
                strokeDashoffset={2 * Math.PI * 27 * (total > 0 ? 1 - rang / total : 1)}
                strokeLinecap="round" style={{
                  transition: "stroke-dashoffset 0.52s cubic-bezier(0.22, 1, 0.36, 1)",
                  color: color.light,
                  filter: "drop-shadow(0 0 4px currentColor)",
                  animation: "kaleidoProgressCleanGlow 320ms cubic-bezier(0.25, 0.9, 0.35, 1)"
                }} />
              <defs><linearGradient id="pgc" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={color.bg} /><stop offset="100%" stopColor={color.light} />
              </linearGradient></defs>
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#F1F0EE", fontSize: 19, fontWeight: 700, fontFamily: "'Syne', sans-serif", lineHeight: 1 }}>{rang}</span>
              <span style={{ color: color.light, fontSize: 11, fontFamily: "monospace", marginTop: 1 }}>/{total > 0 ? total : "—"}</span>
            </div>
          </div>
          {total > 0 && <span style={{ color: "#6B6A7A", fontSize: 9, fontFamily: "monospace" }}>{pct}%</span>}
        </div>
        {/* Colonne droite */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "flex-start", marginTop: -4 }}>
          {currentPartie ? (<>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: color.light, fontSize: 14, fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>{currentPartie.nom}</span>
              <span style={{ color: color.light, fontSize: 14, fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>{rangDansPartie}/{totalPartieCourante}</span>
            </div>
            <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 6, height: 4, overflow: "hidden", marginTop: 2, marginBottom: 16 }}>
              <div style={{ background: `linear-gradient(90deg, ${color.bg}, ${color.light})`, width: `${totalPartieCourante > 0 ? Math.round(rangDansPartie / totalPartieCourante * 100) : 0}%`, height: "100%", transition: "width 0.4s ease" }} />
            </div>
          </>) : total > 0 ? (<>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: color.light, fontSize: 14, fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>Progression</span>
              <span style={{ color: "#6B6A7A", fontSize: 10, fontFamily: "monospace" }}>{rang}/{total}</span>
            </div>
            <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 6, height: 4, overflow: "hidden", marginTop: 2, marginBottom: 16 }}>
              <div style={{ background: `linear-gradient(90deg, ${color.bg}, ${color.light})`, width: `${pct}%`, height: "100%", transition: "width 0.4s ease" }} />
            </div>
          </>) : <div style={{ marginBottom: 16 }} />}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, transform: "translateX(-16px)" }}>
            <button onClick={decrementRang} style={{ width: 42, height: 42, borderRadius: "50%", background: `${color.bg}33`, border: `1.5px solid ${color.light}44`, color: color.light, fontSize: 22, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
            <span style={{ color: "#F1F0EE", fontSize: 34, fontWeight: 700, fontFamily: "'Syne', sans-serif", minWidth: 44, textAlign: "center", lineHeight: 1 }}>{currentPartie ? rangDansPartie : rang}</span>
            <button onClick={incrementRang} style={{ width: 42, height: 42, borderRadius: "50%", background: `linear-gradient(135deg, ${color.bg}, ${color.light})`, border: "none", color: "#fff", fontSize: 22, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 3px 10px ${color.bg}55` }}>+</button>
          </div>
        </div>
      </div>
      {/* Menu swipe */}
      <div style={{ position: "absolute", top: "50%", right: swiped ? 10 : -110, transform: "translateY(-50%)", transition: "right 0.3s ease", zIndex: 10, display: "flex", flexDirection: "column", gap: 6 }}>
        <button onClick={e => { e.stopPropagation(); addCounter(); setSwiped(false); }}
          style={{ background: "#059669", border: "none", borderRadius: 8, padding: "8px 12px", color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>+ Compteur</button>
        <button onClick={e => { e.stopPropagation(); resetRang(); setSwiped(false); }}
          style={{ background: "#DC2626", border: "none", borderRadius: 8, padding: "8px 12px", color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>↺ Reset</button>
      </div>
      {swiped && <div style={{ position: "absolute", bottom: 4, right: 8, color: color.light, fontSize: 8, opacity: 0.6 }}>→</div>}
    </div>
  );
}
function PdfViewerView({ project, onNavigateHub, onSaveProgress }) {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [loadErrorMessage, setLoadErrorMessage] = useState("Le fichier n'a pas pu être chargé");
  // Rangs
  const pdfParties = project?.pdfParties || [];
  const hasParties = pdfParties.length > 0;
  const [currentPartieIdx, setCurrentPartieIdx] = useState(0);
  const [rang, setRang] = useState(project?.rang || 0);
  const rangRef = useRef(project?.rang || 0);
  const [counters, setCounters] = useState([]);
  const countersRef = useRef([]);
  const stableAddCounter = () => {
    const newC = { id: Date.now(), name: `Compteur ${countersRef.current.length + 1}`, value: 1, maxRepeats: 4, syncWithGlobal: false, colorIdx: Math.floor(Math.random() * KALEIDOSCOPE_COLORS.length) };
    countersRef.current = [...countersRef.current, newC];
    setCounters([...countersRef.current]);
  };
  const addCounter = stableAddCounter;
  const updateCounter = (id, updates) => { countersRef.current = countersRef.current.map(c => c.id === id ? { ...c, ...updates } : c); setCounters([...countersRef.current]); };
  const deleteCounter = (id) => { countersRef.current = countersRef.current.filter(c => c.id !== id); setCounters([...countersRef.current]); };
  useEffect(() => {
    rangRef.current = rang;
  }, [rang]);
  const currentPartie = hasParties ? pdfParties[currentPartieIdx] : null;
  const rangDansPartie = hasParties ? (() => {
    let offset = 0;
    for (let i = 0; i < currentPartieIdx; i++) offset += pdfParties[i].totalRangs;
    return Math.max(0, rang - offset);
  })() : rang;
  const totalPartieCourante = currentPartie?.totalRangs || 0;
  const color = currentPartie
    ? KALEIDOSCOPE_COLORS[currentPartie.colorIdx % KALEIDOSCOPE_COLORS.length]
    : KALEIDOSCOPE_COLORS[(project?.colorIdx || 0) % KALEIDOSCOPE_COLORS.length];
  // Timer
  const [startTime, setStartTime] = useState(Date.now() - (project?.elapsedTime || 0));
  const [elapsedTime, setElapsedTime] = useState(project?.elapsedTime || 0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  useEffect(() => {
    if (!isTimerRunning) return;
    const interval = setInterval(() => setElapsedTime(Date.now() - startTime), 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning, startTime]);
  const formatTime = (ms) => {
    const s = Math.floor(ms / 1000), m = Math.floor(s / 60), h = Math.floor(m / 60);
    return `${String(h).padStart(2,'0')}:${String(m%60).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
  };
  const toggleTimer = () => { if (isTimerRunning) setIsTimerRunning(false); else { setStartTime(Date.now() - elapsedTime); setIsTimerRunning(true); } };
  const resetTimer = () => { setStartTime(Date.now()); setElapsedTime(0); setIsTimerRunning(true); };
  // Incrémenter rang et changer de partie si nécessaire
  const incrementRang = () => {
    const liveRang = rangRef.current;
    // Bloquer si on est au maximum global
    if (total > 0 && liveRang >= total) return;
    const newRang = liveRang + 1;
    rangRef.current = newRang;
    rangRef.current = newRang;
    setRang(newRang);
    if (typeof onSaveProgress === "function") onSaveProgress(newRang, total);
    if (hasParties && currentPartie) {
      let offset = 0;
      for (let i = 0; i < currentPartieIdx; i++) offset += pdfParties[i].totalRangs;
      const rangLocal = newRang - offset;
      if (rangLocal >= currentPartie.totalRangs) {
        if (currentPartieIdx < pdfParties.length - 1) {
          setShowNextPartieModal(true);
        } else if (total > 0 && newRang >= total) {
          setShowFinModal(true);
        }
      }
    } else if (total > 0 && newRang >= total) {
      setShowFinModal(true);
    }
  };
  const decrementRang = () => {
    const liveRang = rangRef.current;
    if (liveRang <= 0) return;
    const newRang = liveRang - 1;
    // Détecter si on revient à la partie précédente
    if (hasParties && currentPartieIdx > 0) {
      let offset = 0;
      for (let i = 0; i < currentPartieIdx; i++) offset += pdfParties[i].totalRangs;
      if (newRang < offset) {
        setShowPrevPartieModal(true);
        return; // Ne pas décrémenter encore, attendre confirmation
      }
    }
    setRang(newRang);
    if (typeof onSaveProgress === "function") onSaveProgress(newRang, total);
  };
  const [showNextPartieModal, setShowNextPartieModal] = useState(false);
  const [showPrevPartieModal, setShowPrevPartieModal] = useState(false);
  const [showFinModal, setShowFinModal] = useState(false);
  // Sauvegarde en quittant
  const handleBack = () => {
    onSaveProgress(rangRef.current, project?.total || 0, elapsedTime);
    onNavigateHub();
  };
  // Chargement PDF — rendu page par page progressif
  useEffect(() => {
    let cancelled = false;
    setPages([]);
    setLoading(true);
    setLoadError(false);
    setLoadErrorMessage("Le fichier n'a pas pu être chargé");
    if (!project?.pdfId) {
      setLoadErrorMessage("Aucun PDF n'est associé à ce projet.");
      setLoadError(true);
      setLoading(false);
      return;
    }
    loadPdf(project.pdfId).then(async (data) => {
      if (!data) {
        setLoadErrorMessage("Le PDF est manquant ou illisible.");
        setLoadError(true);
        setLoading(false);
        return;
      }
      try {
        // Charger pdf.js si pas encore chargé
        if (!window.pdfjsLib) {
          await new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
            s.onload = resolve; s.onerror = reject;
            document.head.appendChild(s);
          });
          window.pdfjsLib.GlobalWorkerOptions.workerSrc =
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }
        // Décoder le base64 en chunks pour éviter le crash mémoire sur gros PDFs
        const base64 = data.includes(',') ? data.split(',')[1] : data;
        const chunkSize = 32768;
        const chunks = [];
        for (let i = 0; i < base64.length; i += chunkSize) {
          const chunk = atob(base64.slice(i, i + chunkSize));
          const bytes = new Uint8Array(chunk.length);
          for (let j = 0; j < chunk.length; j++) bytes[j] = chunk.charCodeAt(j);
          chunks.push(bytes);
        }
        const totalLen = chunks.reduce((s, c) => s + c.length, 0);
        const arr = new Uint8Array(totalLen);
        let offset = 0;
        for (const chunk of chunks) { arr.set(chunk, offset); offset += chunk.length; }
        const pdf = await window.pdfjsLib.getDocument({ data: arr }).promise;
        if (cancelled) return;
        setLoading(false); // Afficher le conteneur dès que le PDF est parsé
        // Scale adapté selon le nombre de pages — moins de mémoire pour les gros PDFs
        const dpr = window.devicePixelRatio || 2;
        const scale = pdf.numPages > 30 ? 1.5 : pdf.numPages > 15 ? dpr * 1.5 : dpr * 2;
        for (let i = 1; i <= pdf.numPages; i++) {
          if (cancelled) return;
          try {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale });
            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const ctx = canvas.getContext('2d');
            await page.render({ canvasContext: ctx, viewport }).promise;
            const imgData = canvas.toDataURL('image/jpeg', 0.85); // JPEG compressé = moins de mémoire
            // Libérer le canvas immédiatement
            canvas.width = 0; canvas.height = 0;
            if (!cancelled) {
              setPages(prev => [...prev, imgData]);
            }
          } catch (pageErr) {
            console.warn(`Page ${i} échouée:`, pageErr);
            // Continuer avec les autres pages même si une échoue
          }
        }
      } catch(e) {
        console.error('PDF error:', e);
        if (!cancelled) {
          setLoadErrorMessage("Le rendu du PDF a échoué.");
          setLoadError(true);
          setLoading(false);
        }
      }
    }).catch((e) => {
      console.error('PDF load error:', e);
      if (!cancelled) {
        setLoadErrorMessage("Le chargement du PDF a échoué.");
        setLoadError(true);
        setLoading(false);
      }
    });
    return () => { cancelled = true; }; // Cleanup si on quitte avant la fin
  }, [project?.pdfId]);
  const total = project?.total || 0;
  const pct = total > 0 ? Math.min(100, Math.round((rang / total) * 100)) : 0;
  const circ_r = 26, circ_c = 2 * Math.PI * circ_r;
  return (
    <div style={{ background: "#0D0D1A", height: "100vh", fontFamily: "'DM Sans', sans-serif", maxWidth: 430, margin: "0 auto", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        ::-webkit-scrollbar{width:0} * { -webkit-tap-highlight-color: transparent; }
        @keyframes gradientShift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
      `}</style>
      {/* ══ BARRE FIXE ══════════════════════════════════════════ */}
      <div style={{ flexShrink: 0, background: "linear-gradient(180deg, #1A0A2E 0%, #0D0D1A 100%)", zIndex: 10, padding: "48px 16px 12px" }}>
        {/* Ligne header : retour + titre + timer */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <button data-kaleido-back-button="true" onClick={handleBack} style={{ background: "#1E1E32", border: "none", borderRadius: 10, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", color: color.light, fontSize: 15, cursor: "pointer", flexShrink: 0 }}>←</button>
          <h1 style={{ color: "#F1F0EE", margin: 0, fontSize: 15, fontWeight: 700, fontFamily: "'Syne', sans-serif", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{project?.name}</h1>
          <div style={{ background: "linear-gradient(135deg, #1E1E32, #2A2A3E)", border: "2px solid #7C3AED44", borderRadius: 14, padding: "8px 12px", display: "flex", alignItems: "center", gap: 8, flexShrink: 0, boxShadow: "0 4px 14px rgba(124,58,237,0.3)" }}>
            <span style={{ color: "#F1F0EE", fontSize: 20, fontFamily: "monospace", fontWeight: 700 }}>{formatTime(elapsedTime)}</span>
            <button onClick={toggleTimer} style={{ background: isTimerRunning ? "#DC2626" : "#059669", border: "none", borderRadius: 9, padding: "5px 9px", color: "#fff", fontSize: 11, cursor: "pointer", fontWeight: 700 }}>{isTimerRunning ? "PAUSE" : "PLAY"}</button>
            <button onClick={resetTimer} style={{ background: "#7C3AED", border: "none", borderRadius: 9, padding: "5px 9px", color: "#fff", fontSize: 11, cursor: "pointer", fontWeight: 700 }}>RESET</button>
          </div>
        </div>
        {/* Carte compteur avec swipe pour ajouter compteur secondaire */}
        <PdfCounterCard color={color} currentPartie={currentPartie} totalPartieCourante={totalPartieCourante}
          rangDansPartie={rangDansPartie} rang={rang} total={total} pct={pct}
          decrementRang={decrementRang} incrementRang={incrementRang} addCounter={addCounter}
          resetRang={() => setRang(0)} />
      </div>
      {/* ══ COMPTEURS SECONDAIRES ══════════════════════════════ */}
      {counters.length > 0 && (
        <div style={{ padding: "0px 16px 12px", background: "#0D0D1A", flexShrink: 0 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {counters.map(counter => (
              <div key={counter.id} style={{ flex: "1 1 calc(50% - 4px)", minWidth: 140 }}>
                <CounterWidget counter={counter}
                  onUpdate={updates => updateCounter(counter.id, updates)}
                  onDelete={() => deleteCounter(counter.id)}
                  onAddNew={null}
                  globalRangCount={rang} />
              </div>
            ))}
          </div>
        </div>
      )}
      {/* ══ ZONE PDF ═════════════════════════════════════════════ */}
      <div style={{ flex: 1, overflowY: "auto", background: "#111", WebkitOverflowScrolling: "touch" }}>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "50vh", gap: 14 }}>
            <div style={{ fontSize: 36 }}>
</div>
            <div style={{ fontSize: 14, color: "#A78BFA" }}>Chargement du PDF...</div>
          </div>
        ) : loadError ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "50vh", gap: 12 }}>
            <div style={{ fontSize: 44 }}>
</div>
            <div style={{ fontSize: 14, color: "#F87171" }}>PDF introuvable</div>
          </div>
        ) : (
          pages.map((src, i) => (
            <div key={i} style={{ borderBottom: "2px solid #1A1A2E" }}>
              <img src={src} alt={`Page ${i + 1}`} style={{ width: "100%", display: "block" }} />
            </div>
          ))
        )}
      </div>
      {/* Modale partie suivante */}
      {showNextPartieModal && (() => {
        const nextPartie = pdfParties[currentPartieIdx + 1];
        const nextColor = nextPartie ? KALEIDOSCOPE_COLORS[nextPartie.colorIdx % KALEIDOSCOPE_COLORS.length] : color;
        return (
          <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <div style={{ background: "#1A1A2E", borderRadius: 24, padding: 28, width: "100%", maxWidth: 360, textAlign: "center", border: `1px solid ${color.light}33` }}>
              <div style={{ fontSize: 42, marginBottom: 12 }}>
</div>
              <div style={{ color: color.light, fontSize: 13, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Partie terminée !</div>
              <h2 style={{ color: "#F1F0EE", fontSize: 20, fontFamily: "'Syne', sans-serif", margin: "0 0 8px" }}>{currentPartie?.nom}</h2>
              <p style={{ color: "#6B6A7A", fontSize: 14, margin: "0 0 24px" }}>Tu veux passer à la partie suivante ?</p>
              {nextPartie && (
                <div style={{ background: `${nextColor.bg}22`, border: `1px solid ${nextColor.light}44`, borderRadius: 14, padding: "12px 16px", marginBottom: 24 }}>
                  <div style={{ color: nextColor.light, fontSize: 12, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Prochaine partie</div>
                  <div style={{ color: "#F1F0EE", fontSize: 17, fontWeight: 700, fontFamily: "'Syne', sans-serif" }}>{nextPartie.nom}</div>
                  <div style={{ color: "#6B6A7A", fontSize: 12, marginTop: 4 }}>{nextPartie.totalRangs} rangs</div>
                </div>
              )}
              <div style={{ display: "flex", gap: 12 }}>
                <button onClick={() => setShowNextPartieModal(false)}
                  style={{ flex: 1, padding: "14px", borderRadius: 14, border: "1px solid #333", background: "none", color: "#999", fontSize: 14, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                  Rester ici
                </button>
                <button onClick={() => {
                  // Calculer l'offset de la prochaine partie et mettre rang à son premier rang
                  let offset = 0;
                  for (let i = 0; i <= currentPartieIdx; i++) offset += pdfParties[i].totalRangs;
                  setRang(offset + 1);
                  setCurrentPartieIdx(i => i + 1);
                  setShowNextPartieModal(false);
                }}
                  style={{ flex: 1, padding: "14px", borderRadius: 14, border: "none", background: `linear-gradient(135deg, ${nextColor.bg}, ${nextColor.light})`, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                  Continuer →
                </button>
              </div>
            </div>
          </div>
        );
      })()}
      {/* Modale partie précédente */}
      {showPrevPartieModal && (() => {
        const prevPartie = pdfParties[currentPartieIdx - 1];
        const prevColor = prevPartie ? KALEIDOSCOPE_COLORS[prevPartie.colorIdx % KALEIDOSCOPE_COLORS.length] : color;
        return (
          <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <div style={{ background: "#1A1A2E", borderRadius: 24, padding: 28, width: "100%", maxWidth: 360, textAlign: "center", border: `1px solid ${color.light}33` }}>
              <div style={{ fontSize: 42, marginBottom: 12 }}>
</div>
              <div style={{ color: color.light, fontSize: 13, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Revenir en arrière ?</div>
              <h2 style={{ color: "#F1F0EE", fontSize: 20, fontFamily: "'Syne', sans-serif", margin: "0 0 8px" }}>{currentPartie?.nom}</h2>
              <p style={{ color: "#6B6A7A", fontSize: 14, margin: "0 0 24px" }}>Tu veux retourner à la partie précédente ?</p>
              {prevPartie && (
                <div style={{ background: `${prevColor.bg}22`, border: `1px solid ${prevColor.light}44`, borderRadius: 14, padding: "12px 16px", marginBottom: 24 }}>
                  <div style={{ color: prevColor.light, fontSize: 12, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Partie précédente</div>
                  <div style={{ color: "#F1F0EE", fontSize: 17, fontWeight: 700, fontFamily: "'Syne', sans-serif" }}>{prevPartie.nom}</div>
                  <div style={{ color: "#6B6A7A", fontSize: 12, marginTop: 4 }}>{prevPartie.totalRangs} rangs</div>
                </div>
              )}
              <div style={{ display: "flex", gap: 12 }}>
                <button onClick={() => setShowPrevPartieModal(false)}
                  style={{ flex: 1, padding: "14px", borderRadius: 14, border: "1px solid #333", background: "none", color: "#999", fontSize: 14, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                  Rester ici
                </button>
                <button onClick={() => {
                  // Calculer le dernier rang de la partie précédente
                  let offset = 0;
                  for (let i = 0; i < currentPartieIdx - 1; i++) offset += pdfParties[i].totalRangs;
                  setRang(offset + (prevPartie?.totalRangs || 1) - 1);
                  setCurrentPartieIdx(i => i - 1);
                  setShowPrevPartieModal(false);
                }}
                  style={{ flex: 1, padding: "14px", borderRadius: 14, border: "none", background: `linear-gradient(135deg, ${prevColor.bg}, ${prevColor.light})`, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                  ← Retourner
                </button>
              </div>
            </div>
          </div>
        );
      })()}
      {/* Modale projet terminé */}
      {showFinModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ background: "#1A1A2E", borderRadius: 24, padding: 28, width: "100%", maxWidth: 360, textAlign: "center", border: `1px solid ${color.light}33` }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>
</div>
            <div style={{ color: color.light, fontSize: 13, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Projet terminé !</div>
            <h2 style={{ color: "#F1F0EE", fontSize: 20, fontFamily: "'Syne', sans-serif", margin: "0 0 8px" }}>{project?.name}</h2>
            <p style={{ color: "#6B6A7A", fontSize: 14, margin: "0 0 24px" }}>Félicitations, tu as complété tous les rangs ! 
</p>
            <button onClick={() => setShowFinModal(false)}
              style={{ width: "100%", padding: "14px", borderRadius: 14, border: "none", background: `linear-gradient(135deg, ${color.bg}, ${color.light})`, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
              Super ! 
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
// ═══════════════════════════════════════════════════════════════
// BIBLIOTHÈQUE DE PATRONS
// ═══════════════════════════════════════════════════════════════
function LibraryView({ database, onNavigateHub, onEditPatron, onNewCustomPatron, onNewPdfPatron, onDeletePatron, onRenamePatron, onChangePatronColor, onUpdatePatron, onChangePatronPhoto, editingPdfPatron, setEditingPdfPatron }) {
  const [search, setSearch] = useState("");
  const [menuPatron, setMenuPatron] = useState(null);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const [renamePatron, setRenamePatron] = useState(null);
  const [deletePatron, setDeletePatron] = useState(null);
  const [showNewMenu, setShowNewMenu] = useState(false);
  const patrons = database.patrons || [];
  const filtered = patrons.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  const handleMenuOpen = (patron, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPos({ x: rect.right, y: rect.bottom });
    setMenuPatron(patron);
  };
  return (
    <div style={{ background: "#0D0D1A", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        ::-webkit-scrollbar { width: 0; }
        * { -webkit-tap-highlight-color: transparent; }
        input, textarea, select { font-size: 16px !important; }
        @keyframes fadeIn { from { opacity:1; transform:none; } to { opacity:1; transform:none; } }
        @keyframes slideInRight { from { transform: translateX(16px); } to { transform: translateX(0); } }
        @keyframes slideInLeft { from { transform: translateX(-16px); } to { transform: translateX(0); } }
      `}</style>
      {/* Header */}
      <div style={{ padding: "52px 20px 16px", background: "linear-gradient(180deg, #1A0A2E 0%, #0D0D1A 100%)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <button data-kaleido-back-button="true" onClick={() => { if (typeof onNavigateHub === "function") onNavigateHub(); }} style={{ background: "#1E1E32", border: "none", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", color: "#A78BFA", fontSize: 16, cursor: "pointer", flexShrink: 0 }}>←</button>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, background: "linear-gradient(135deg, #A78BFA, #F472B6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}><span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><Icon name="library" size={26} color="#A78BFA" />Bibliothèque</span></span>
          <div style={{ flex: 1 }} />
          <div style={{ background: "#1E1E3288", borderRadius: 10, padding: "6px 12px" }}>
            <span style={{ color: "#6B6A7A", fontSize: 12, fontFamily: "monospace" }}>{patrons.length} patron{patrons.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
        {/* Recherche */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#1E1E32", borderRadius: 12, padding: "10px 14px" }}>
          <span style={{ color: "#6B6A7A", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="search" size={16} color="#6B6A7A" /></span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un patron..."
            style={{ background: "none", border: "none", outline: "none", color: "#F1F0EE", flex: 1, fontFamily: "'DM Sans', sans-serif", fontSize: 16 }} />
        </div>
      </div>
      {/* Grille bulles */}
      <div style={{ padding: "12px 6px 100px" }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", color: "#6B6A7A", padding: "60px 20px" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}><IconBadge name="yarn" tone="violet" size={24} badgeSize={52} /></div>
            <div style={{ fontSize: 16, color: "#F1F0EE", marginBottom: 8 }}>Aucun patron</div>
            <div style={{ fontSize: 13 }}>Crée ou importe un patron avec le bouton +</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", rowGap: 4, columnGap: 0 }}>
            {filtered.map((patron, idx) => (
              <div key={patron.id} style={{ animation: `fadeIn 0.3s ease ${idx * 0.04}s both` }}>
                <ProjectBubble
                  project={{ ...patron, rang: patron.projectType === 'pdf' ? 0 : (patron.parties?.reduce((s, p) => s + p.rangs.length, 0) || 0), total: patron.projectType === 'pdf' ? Math.max(1, patron.total||1) : Math.max(1, patron.parties?.reduce((s, p) => s + p.rangs.length, 0) || 1) }}
                  onMenuOpen={handleMenuOpen}
                  onProjectClick={() => {
                    if (patron.projectType === 'pdf') {
                      // Lire directement depuis database.patrons pour avoir pdfParties frais
                      const fresh = (database.patrons || []).find(p => p.id === patron.id);
                      setEditingPdfPatron(fresh ? { ...fresh } : { ...patron });
                    }
                    else onEditPatron(patron);
                  }}
                  mode="library"
                />
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Bouton + */}
      <div style={{ position: "fixed", bottom: 28, right: "calc(50% - 200px)", zIndex: 50 }}>
        <button onClick={() => setShowNewMenu(true)} style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg, #7C3AED, #EC4899)", border: "none", cursor: "pointer", fontSize: 28, color: "#fff", boxShadow: "0 4px 20px #7C3AED88", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
      </div>
      {/* Menu contextuel */}
      <ContextMenu project={menuPatron} position={menuPos} onClose={() => setMenuPatron(null)}
        onRename={() => { setRenamePatron(menuPatron); setMenuPatron(null); }}
        onDelete={() => { setDeletePatron(menuPatron); setMenuPatron(null); }}
        onChangePhoto={() => { onChangePatronPhoto(menuPatron.id); setMenuPatron(null); }}
        onChangeColor={(idx) => onChangePatronColor(menuPatron.id, idx)} />
      <RenameModal project={renamePatron} onConfirm={(name) => { onRenamePatron(renamePatron.id, name); setRenamePatron(null); }} onClose={() => setRenamePatron(null)} />
      <DeleteModal project={deletePatron} onConfirm={() => { onDeletePatron(deletePatron.id); setDeletePatron(null); }} onClose={() => setDeletePatron(null)} />
      {/* Menu nouveau patron */}
      {showNewMenu && (
        <div onClick={() => setShowNewMenu(false)} data-kaleido-modal-backdrop="true" style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <div onClick={e => e.stopPropagation()} data-kaleido-modal-card="true" style={{ background: "#1A1A2E", borderRadius: "24px 24px 0 0", padding: "24px 20px 40px", width: "100%", maxWidth: 430 }}>
            <div style={{ width: 36, height: 4, background: "#333", borderRadius: 2, margin: "0 auto 24px" }} />
            <h3 style={{ color: "#F1F0EE", fontFamily: "'Syne', sans-serif", fontSize: 18, margin: "0 0 20px", textAlign: "center" }}>Nouveau patron</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <button onClick={() => { setShowNewMenu(false); onNewCustomPatron(); }} style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 20px", borderRadius: 16, background: "linear-gradient(135deg, #7C3AED22, #DB277722)", border: "1px solid #7C3AED44", cursor: "pointer", textAlign: "left" }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg, #7C3AED, #DB2777)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                  <Icon name="edit" size={22} color="#fff" />
                </div>
                <div>
                  <div style={{ color: "#F1F0EE", fontSize: 16, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", marginBottom: 4 }}>Créer un patron</div>
                  <div style={{ color: "#6B6A7A", fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>Saisis tes parties et rangs manuellement</div>
                </div>
              </button>
              <button onClick={() => { setShowNewMenu(false); onNewPdfPatron(); }} style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 20px", borderRadius: 16, background: "linear-gradient(135deg, #0891B222, #22D3EE22)", border: "1px solid #0891B244", cursor: "pointer", textAlign: "left" }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg, #0891B2, #22D3EE)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                  <Icon name="file" size={22} color="#fff" />
                </div>
                <div>
                  <div style={{ color: "#F1F0EE", fontSize: 16, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", marginBottom: 4 }}>Importer un patron PDF</div>
                  <div style={{ color: "#6B6A7A", fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>Télécharge un PDF et donne un nom</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
// ═══════════════════════════════════════════════════════════════
// EDIT PDF PATRON MODAL
// ═══════════════════════════════════════════════════════════════
function EditPdfPatronModal({ patron, onClose, onSave }) {
  const [name, setName] = useState(patron.name || "");
  const [configRangs, setConfigRangs] = useState((patron.pdfParties||[]).length > 0 || (patron.total||0) > 0);
  const [totalRangs, setTotalRangs] = useState(String(patron.total || ""));
  const [parties, setParties] = useState((patron.pdfParties || []).map(p => ({ id: p.id, nom: p.nom, rangs: String(p.totalRangs) })));
  const addPartie = () => setParties(prev => [...prev, { id: Date.now(), nom: "", rangs: "" }]);
  const updatePartie = (id, field, val) => setParties(prev => prev.map(p => p.id === id ? { ...p, [field]: val } : p));
  const removePartie = (id) => setParties(prev => prev.filter(p => p.id !== id));
  const totalFromParties = parties.reduce((s, p) => s + (parseInt(p.rangs) || 0), 0);
  const total = configRangs ? (parties.length > 0 ? totalFromParties : parseInt(totalRangs) || 0) : 0;
  const handleSave = () => {
    const pdfParties = parties
      .filter(p => p.nom.trim())
      .map((p, i) => ({ id: i+1, nom: p.nom.trim(), totalRangs: parseInt(p.rangs)||0, colorIdx: i % KALEIDOSCOPE_COLORS.length }));
    const updates = { name: name.trim(), total, pdfParties };
    onSave(updates);
  };
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "flex-end", justifyContent: "center", fontFamily: "'DM Sans', sans-serif" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#1A1A2E", borderRadius: "24px 24px 0 0", padding: "24px 20px 40px", width: "100%", maxWidth: 430, maxHeight: "90vh", overflowY: "auto", border: "1px solid #0891B244" }}>
        <div style={{ width: 36, height: 4, background: "#333", borderRadius: 2, margin: "0 auto 20px" }} />
        <h3 style={{ color: "#F1F0EE", fontFamily: "'Syne', sans-serif", fontSize: 18, margin: "0 0 20px", textAlign: "center" }}>Modifier le patron PDF</h3>
        <div style={{ marginBottom: 14 }}>
          <label style={{ color: "#22D3EE", fontSize: 11, fontFamily: "monospace", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Nom du patron</label>
          <input value={name} onChange={e => setName(e.target.value)}
            style={{ width: "100%", background: "#13131F", border: "1px solid #0891B244", borderRadius: 10, padding: "12px 14px", color: "#F1F0EE", fontSize: 16, outline: "none", boxSizing: "border-box" }} />
        </div>
        <button onClick={() => setConfigRangs(r => !r)} style={{ width: "100%", padding: "12px 16px", borderRadius: 12, background: configRangs ? "rgba(8,145,178,0.15)" : "#13131F", border: `1px solid ${configRangs ? "#22D3EE44" : "#ffffff11"}`, color: configRangs ? "#22D3EE" : "#6B6A7A", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 10, marginBottom: configRangs ? 16 : 24 }}>
          <span>{configRangs ? <Icon name="checkCircle" size={16} color="#22D3EE" /> : <Icon name="square" size={16} color="#6B6A7A" />}</span>
          <span>Configurer les rangs et parties</span>
        </button>
        {configRangs && (
          <div style={{ marginBottom: 24, padding: 16, background: "#13131F", borderRadius: 14, border: "1px solid #0891B233" }}>
            {parties.length === 0 && (
              <div style={{ marginBottom: 14 }}>
                <label style={{ color: "#22D3EE", fontSize: 11, fontFamily: "monospace", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Nombre total de rangs</label>
                <input value={totalRangs} onChange={e => setTotalRangs(e.target.value)} type="number"
                  style={{ width: "100%", background: "#1A1A2E", border: "1px solid #0891B244", borderRadius: 10, padding: "11px 14px", color: "#F1F0EE", fontSize: 16, outline: "none", boxSizing: "border-box" }} />
              </div>
            )}
            <label style={{ color: "#22D3EE", fontSize: 11, fontFamily: "monospace", display: "block", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>Parties</label>
            {parties.map((p, i) => (
              <div key={p.id} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center", width: "100%", minWidth: 0 }}>
                <div style={{ width: 18, height: 18, borderRadius: "50%", background: `linear-gradient(135deg, ${KALEIDOSCOPE_COLORS[i%KALEIDOSCOPE_COLORS.length].bg}, ${KALEIDOSCOPE_COLORS[i%KALEIDOSCOPE_COLORS.length].light})`, flexShrink: 0 }} />
                <input value={p.nom} onChange={e => updatePartie(p.id, "nom", e.target.value)} placeholder={`Partie ${i+1}`}
                  style={{ flex: 1, minWidth: 0, background: "rgba(255,255,255,0.06)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "10px 12px", color: "#F1F0EE", fontSize: 15, outline: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.25)" }} />
                <input value={p.rangs} onChange={e => updatePartie(p.id, "rangs", e.target.value)} placeholder="Rangs" type="number"
                  style={{ width: 64, flexShrink: 0, background: "rgba(255,255,255,0.06)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "10px 8px", color: "#F1F0EE", fontSize: 15, outline: "none", textAlign: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.25)" }} />
                <button onClick={() => removePartie(p.id)} style={{ width: 28, height: 28, borderRadius: 6, background: "#DC262633", border: "none", color: "#F87171", fontSize: 14, cursor: "pointer", flexShrink: 0 }}>✕</button>
              </div>
            ))}
            <button onClick={addPartie} style={{ width: "100%", padding: "10px", borderRadius: 10, background: "none", border: "1px dashed #0891B244", color: "#22D3EE", fontSize: 13, cursor: "pointer", marginTop: 4 }}>+ Ajouter une partie</button>
            {parties.length > 0 && <div style={{ color: "#6B6A7A", fontSize: 12, textAlign: "center", marginTop: 10 }}>Total : {totalFromParties} rangs</div>}
          </div>
        )}
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "14px", borderRadius: 14, border: "1px solid #333", background: "none", color: "#999", fontSize: 14, cursor: "pointer" }}>Annuler</button>
          <button onClick={handleSave} disabled={!name.trim()}
            style={{ flex: 1, padding: "14px", borderRadius: 14, border: "none", background: name.trim() ? "linear-gradient(135deg, #0891B2, #22D3EE)" : "#333", color: name.trim() ? "#fff" : "#666", fontSize: 14, fontWeight: 700, cursor: name.trim() ? "pointer" : "not-allowed" }}>
            Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );
}
export default function KaleidoHub() {
  const [currentView, setCurrentView] = useState(VIEWS.HUB);
  const [prevView, setPrevView] = useState(null);
  const [viewTransition, setViewTransition] = useState('none'); // 'slide-in' | 'slide-out' | 'none'
  const [showSplash, setShowSplash] = useState(true);
  const [splashFading, setSplashFading] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [currentPatron, setCurrentPatron] = useState(null);
  const [database, setDatabase] = useState(() => initDatabase());
  const [mode, setMode] = useState("personal");
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [exportData, setExportData] = useState('');
  const [showExportData, setShowExportData] = useState(false);
  const [showDataImportModal, setShowDataImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("Tous");
  const [hubParallax, setHubParallax] = useState({ x: 0, y: 0 });
  const [menuProject, setMenuProject] = useState(null);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const [renameProject, setRenameProject] = useState(null);
  const [deleteProject, setDeleteProject] = useState(null);
  const [showNewMenu, setShowNewMenu] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showLibraryImportModal, setShowLibraryImportModal] = useState(false);
  const [edgeSwipeActive, setEdgeSwipeActive] = useState(false);
  const [edgeSwipeProgress, setEdgeSwipeProgress] = useState(0);
  const [edgeSwipeDragging, setEdgeSwipeDragging] = useState(false);
  const [photoTarget, setPhotoTarget] = useState(null); // { id, context: "project"|"patron" }
  const [showSelectPatronModal, setShowSelectPatronModal] = useState(false);
  const [editingPdfPatron, setEditingPdfPatron] = useState(null);
  const databaseRef = useRef(database);
  // Projets selon le mode actif

  useEffect(() => {
    databaseRef.current = database;
  }, [database]);

  useEffect(() => {
    saveToDatabase(database);
  }, [database]);

  useEffect(() => {
    const flushDatabase = () => {
      saveToDatabase(databaseRef.current);
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        flushDatabase();
      }
    };

    window.addEventListener("pagehide", flushDatabase);
    window.addEventListener("beforeunload", flushDatabase);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.removeEventListener("pagehide", flushDatabase);
      window.removeEventListener("beforeunload", flushDatabase);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);
  // Splash screen effect
  useEffect(() => {
    const t1 = setTimeout(() => setSplashFading(true), 1800);
    const t2 = setTimeout(() => setShowSplash(false), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

const projectsKey = mode === 'pro' ? 'projectsPro' : 'projectsPersonal';
const projects = database[projectsKey] || [];
const updateProject = (projectId, updates) => {
setDatabase(prev => {
  const prevProjectsKey = mode === 'pro' ? 'projectsPro' : 'projectsPersonal';
  const nextDb = {
    ...prev,
    [prevProjectsKey]: (prev[prevProjectsKey] || []).map(p => p.id === projectId ? { ...p, ...updates } : p)
  };
  saveToDatabase(nextDb);
  return nextDb;
});
};
const deleteProjectFromDB = (projectId) => {
setDatabase(prev => {
  const prevProjectsKey = mode === 'pro' ? 'projectsPro' : 'projectsPersonal';
  const nextDb = {
    ...prev,
    [prevProjectsKey]: (prev[prevProjectsKey] || []).filter(p => p.id !== projectId)
  };
  saveToDatabase(nextDb);
  return nextDb;
});
};
const addProjectToDB = (project) => {
let createdDb = null;
setDatabase(prev => {
  const prevProjectsKey = mode === 'pro' ? 'projectsPro' : 'projectsPersonal';
  const nextDb = {
    ...prev,
    [prevProjectsKey]: [...(prev[prevProjectsKey] || []), project],
    settings: { ...prev.settings, lastProjectId: project.id }
  };
  createdDb = nextDb;
  saveToDatabase(nextDb);
  return nextDb;
});
return createdDb;
};
const filtered = projects.filter(p => {
if (!p.name.toLowerCase().includes(search.toLowerCase())) return false;
if (activeFilter === "Tous") return true;
if (activeFilter === "En cours") return p.rang < p.total;
if (activeFilter === "Termin\u00e9s") return p.rang >= p.total && p.total > 0;
if (activeFilter === "PDF") return p.projectType === "pdf";
if (activeFilter === "Crochet") return p.type === "crochet";
if (activeFilter === "Tricot") return p.type === "tricot";
return true;
});
const totalRangs = projects.reduce((s, p) => s + p.rang, 0);
const termines = projects.filter(p => p.rang >= p.total).length;
// ─── PATRONS CRUD ─────────────────────────────────────────────
const addPatron = (patron) => {
const newDb = { ...database, patrons: [...(database.patrons || []), patron], settings: { ...database.settings, lastPatronId: patron.id } };
setDatabase(newDb); saveToDatabase(newDb);
};
const updatePatron = (patronId, updates) => {
const updatedPatrons = (database.patrons || []).map(p => p.id === patronId ? { ...p, ...updates } : p);
const updatedPatron = updatedPatrons.find(p => p.id === patronId);

const computeCustomTotal = (patron) => Math.max(
  1,
  (patron?.parties || []).reduce(
    (sum, partie) => sum + ((partie?.rangs || []).filter(r => !r?.isNote).length),
    0
  )
);

const syncProjectFromPatron = (project) => {
  if (project.patronId !== patronId || !updatedPatron || project.linkMode === 'detached') return project;

  if (updatedPatron.projectType === 'custom') {
    return {
      ...project,
      name: updatedPatron.name,
      colorIdx: updatedPatron.colorIdx,
      image: updatedPatron.image || null,
      projectType: 'custom',
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
    projectType: 'pdf',
    pdfId: updatedPatron.pdfId,
    pdfParties: updatedPatron.pdfParties || [],
    total: updatedPatron.total || 1,
  };
};

const newDb = {
  ...database,
  patrons: updatedPatrons,
  projectsPersonal: (database.projectsPersonal || []).map(syncProjectFromPatron),
  projectsPro: (database.projectsPro || []).map(syncProjectFromPatron),
};
setDatabase(newDb); saveToDatabase(newDb);

};
const deletePatronFromDB = (patronId) => {
const detachProjectFromPatron = (project) => {
  if (project.patronId !== patronId) return project;
  return {
    ...project,
    patronId: null,
    linkMode: 'detached',
  };
};
const newDb = {
  ...database,
  patrons: (database.patrons || []).filter(p => p.id !== patronId),
  projectsPersonal: (database.projectsPersonal || []).map(detachProjectFromPatron),
  projectsPro: (database.projectsPro || []).map(detachProjectFromPatron),
};
setDatabase(newDb); saveToDatabase(newDb);
};
const navigateToHub = () => {
setPrevView(currentView);
setViewTransition('slide-out');
setTimeout(() => { setCurrentView(VIEWS.HUB); setCurrentProject(null); setViewTransition('slide-in'); setTimeout(() => setViewTransition('none'), 350); }, 0);
};
const navigateToLibrary = () => {
setPrevView(currentView);
setViewTransition('slide-in-right');
setTimeout(() => setViewTransition('none'), 350);
setCurrentView(VIEWS.LIBRARY);
};
const navigateToPatronEditor = (project) => {
if (!project) {
console.warn("[KALEIDO] navigateToPatronEditor ignoré: projet manquant.");
return;
}
setPrevView(currentView);
setViewTransition('slide-in-right');
setTimeout(() => setViewTransition('none'), 350);
setCurrentProject(project); setCurrentView(VIEWS.PATRON_EDITOR);
};
const navigateToRowCounter = (project) => {
if (!project) {
console.warn("[KALEIDO] navigateToRowCounter ignoré: projet manquant.");
return;
}
setPrevView(currentView);
setViewTransition('slide-in-right');
setTimeout(() => setViewTransition('none'), 350);
setCurrentProject(project); setCurrentView(VIEWS.ROW_COUNTER);
};
const navigateToPdfViewer = async (project) => {
if (!project) {
console.warn("[KALEIDO] navigateToPdfViewer ignoré: projet manquant.");
return;
}
if (!project.pdfId) {
alert("Ce PDF est introuvable pour ce projet.");
return;
}
const data = await loadPdf(project.pdfId);
if (!data) {
alert("Impossible d'ouvrir ce PDF. Le fichier semble manquant ou corrompu.");
return;
}
setPrevView(currentView);
setCurrentProject(project);
setCurrentView(VIEWS.PDF_VIEWER);
};
const handleNewProject = () => setShowNewMenu(true);
const handleNewCustomPatron = () => {
const newId = (database.settings.lastPatronId || 0) + 1;
const colorIdx = Math.floor(Math.random() * KALEIDOSCOPE_COLORS.length);
const newPatron = { id: newId, name: "Nouveau patron", colorIdx, image: null, projectType: "custom", type: "crochet", laine: "", outil: "", notes: "", parties: [], createdAt: new Date().toISOString() };
addPatron(newPatron);
setCurrentPatron(newPatron);
setCurrentView(VIEWS.PATRON_EDITOR);
};
const handleNewPdfPatron = () => {
setShowLibraryImportModal(true);
};
const handleCreateCustom = () => {
const newId = database.settings.lastProjectId + 1;
const colorIdx = Math.floor(Math.random() * KALEIDOSCOPE_COLORS.length);
const newProject = { id: newId, name: "Nouveau projet", rang: 0, total: 20, colorIdx, image: null, projectType: "custom", type: "crochet", laine: "", outil: "", notes: "", parties: [], createdAt: new Date().toISOString(), status: "en_cours" };
addProjectToDB(newProject);
setShowNewMenu(false);
navigateToPatronEditor(newProject);
};
const handleMenuOpen = (project, e) => {
const rect = e.currentTarget.getBoundingClientRect();
setMenuPos({ x: rect.right, y: rect.bottom }); setMenuProject(project);
};
const handleRename = (newName) => { updateProject(renameProject.id, { name: newName }); setRenameProject(null); };
const handleDelete = () => { deleteProjectFromDB(deleteProject.id); setDeleteProject(null); };
useEffect(() => {
  if (currentView !== VIEWS.HUB) return undefined;
  const handlePointerMove = (e) => {
    const w = window.innerWidth || 1;
    const h = window.innerHeight || 1;
    const x = ((e.clientX / w) - 0.5) * 8;
    const y = ((e.clientY / h) - 0.5) * 6;
    setHubParallax({ x, y });
  };
  const resetParallax = () => setHubParallax({ x: 0, y: 0 });
  window.addEventListener('pointermove', handlePointerMove, { passive: true });
  window.addEventListener('pointerleave', resetParallax);
  window.addEventListener('blur', resetParallax);
  return () => {
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerleave', resetParallax);
    window.removeEventListener('blur', resetParallax);
  };
}, [currentView]);

useEffect(() => {
  if (currentView === VIEWS.HUB) return undefined;

  let startX = 0;
  let startY = 0;
  let tracking = false;
  let gestureLocked = false;
  let consumed = false;

  const EDGE_ZONE = 22;
  const LOCK_DX = 12;
  const LOCK_DY = 24;
  const MAX_DY = 64;
  const COMPLETE_THRESHOLD = 0.56;

  const isInteractiveTarget = (target) => {
    if (!(target instanceof Element)) return false;
    return Boolean(
      target.closest('input, textarea, select, button, a, [contenteditable="true"], [data-kaleido-no-edge-back="true"]')
    );
  };

  const findVisibleBackButton = () => {
    const buttons = Array.from(document.querySelectorAll('[data-kaleido-back-button="true"]'));
    return buttons.find((btn) => {
      const style = window.getComputedStyle(btn);
      const rect = btn.getBoundingClientRect();
      return style.display !== 'none'
        && style.visibility !== 'hidden'
        && rect.width > 0
        && rect.height > 0
        && btn.offsetParent !== null;
    }) || null;
  };

  const resetPreview = (animated = true) => {
    setEdgeSwipeDragging(false);
    setEdgeSwipeProgress(0);
    if (!animated) {
      setEdgeSwipeActive(false);
      return;
    }
    window.setTimeout(() => {
      setEdgeSwipeActive(false);
    }, 220);
  };

  const onTouchStart = (e) => {
    if (!e.touches || e.touches.length !== 1) return;
    if (isInteractiveTarget(e.target)) return;

    const touch = e.touches[0];
    if (touch.clientX > EDGE_ZONE) return;

    startX = touch.clientX;
    startY = touch.clientY;
    tracking = true;
    gestureLocked = false;
    consumed = false;
    setEdgeSwipeActive(false);
    setEdgeSwipeDragging(false);
    setEdgeSwipeProgress(0);
  };

  const onTouchMove = (e) => {
    if (!tracking || !e.touches || e.touches.length !== 1) return;

    const touch = e.touches[0];
    const dx = Math.max(0, touch.clientX - startX);
    const dy = Math.abs(touch.clientY - startY);

    if (!gestureLocked) {
      if (dx > LOCK_DX && dy < LOCK_DY) {
        gestureLocked = true;
        setEdgeSwipeActive(true);
        setEdgeSwipeDragging(true);
      } else if (dy > LOCK_DY && dy > dx * 1.45) {
        tracking = false;
        resetPreview(false);
        return;
      }
    }

    if (!gestureLocked) return;

    e.preventDefault();

    if (dy > 92) {
      tracking = false;
      resetPreview(true);
      return;
    }

    const width = Math.max(window.innerWidth || 1, 1);
    const rawProgress = dx / width;
    const easedProgress = rawProgress < 0.16
      ? rawProgress * 0.7
      : 0.112 + (rawProgress - 0.16) * 0.9;
    const nextProgress = Math.max(0, Math.min(1, easedProgress));

    setEdgeSwipeProgress(nextProgress);

    if (nextProgress >= COMPLETE_THRESHOLD && dy < MAX_DY && !consumed) {
      const backButton = findVisibleBackButton();
      if (backButton) {
        consumed = true;
        tracking = false;
        setEdgeSwipeDragging(false);
        setEdgeSwipeProgress(1);
        window.setTimeout(() => {
          backButton.click();
          setEdgeSwipeActive(false);
          setEdgeSwipeProgress(0);
        }, 180);
      }
    }
  };

  const onTouchEnd = () => {
    if (!consumed) {
      resetPreview(true);
    }
    tracking = false;
    gestureLocked = false;
    consumed = false;
  };

  window.addEventListener('touchstart', onTouchStart, { passive: true });
  window.addEventListener('touchmove', onTouchMove, { passive: false });
  window.addEventListener('touchend', onTouchEnd, { passive: true });
  window.addEventListener('touchcancel', onTouchEnd, { passive: true });

  return () => {
    window.removeEventListener('touchstart', onTouchStart);
    window.removeEventListener('touchmove', onTouchMove);
    window.removeEventListener('touchend', onTouchEnd);
    window.removeEventListener('touchcancel', onTouchEnd);
  };
}, [currentView]);

useEffect(() => {
  setEdgeSwipeActive(false);
  setEdgeSwipeProgress(0);
  setEdgeSwipeDragging(false);
}, [currentView]);
// ─── VUE HUB ──────────────────────────────────────────────
const HubView = () => (
<div data-kaleido-screen="true" style={{ background: "#0D0D1A", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>
<style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap'); ${GLOBAL_MOTION_CSS} @keyframes fadeIn { from { opacity:1; transform:none; } to { opacity:1; transform:none; } } ::-webkit-scrollbar { width: 0; } * { -webkit-tap-highlight-color: transparent; } input, textarea, select { font-size: 16px !important; }`}</style>
<div style={{ padding: "44px 20px 12px", background: "linear-gradient(180deg, #1A0A2E 0%, #0D0D1A 100%)" }}>
{/* Header : logo + titre + boutons */}
<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
<div style={{ display: "flex", alignItems: "center", gap: 10 }}>
<img src="data:image/jpeg;base64,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" alt="Kaleido" style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }} />
<span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 22, background: "linear-gradient(135deg, #A78BFA, #F472B6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Kaleido</span>
</div>
<div style={{ display: "flex", gap: 8 }}>
<button onClick={navigateToLibrary} aria-label="Ouvrir la bibliothèque de patrons" style={{ background: "#1E1E32", border: "none", borderRadius: 10, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", color: "#A78BFA", cursor: "pointer" }}><Icon name="library" size={24} stroke={2.2} color="#A78BFA" /></button>
<button onClick={() => setShowSettingsModal(true)} aria-label="Paramètres" style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#A78BFA" }}><Icon name="settings" size={24} stroke={2.1} color="#A78BFA" /></button>
</div>
</div>
{/* Toggle Personnel / Professionnel */}
<div style={{ display: "flex", background: "#1E1E32", borderRadius: 14, padding: 4, marginBottom: 10 }}>
{["personal", "pro"].map(m => (
<button key={m} onClick={() => setMode(m)} style={{ flex: 1, padding: "9px 0", borderRadius: 11, border: "none", background: mode === m ? "linear-gradient(135deg, #7C3AED, #DB2777)" : "none", color: mode === m ? "#fff" : "#6B6A7A", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "all 0.2s ease" }}>
{m === "personal" ? "Personnel" : "Professionnel"}
</button>
))}
</div>
{/* Stats */}
<div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
{[
{ label: "PROJETS", value: projects.length, icon: <Icon name="projects" size={28} stroke={2.2} color="#A78BFA" />, border: "#7C3AED", glow: "#7C3AED" },
{ label: "RANGS", value: totalRangs > 999 ? `${(totalRangs/1000).toFixed(1)}k` : totalRangs, icon: <Icon name="chart" size={28} stroke={2.2} color="#22D3EE" />, border: "#0891B2", glow: "#0891B2" },
{ label: "TERMINÉS", value: termines, icon: <Icon name="checkBadge" size={28} stroke={2.2} color="#34D399" />, border: "#059669", glow: "#059669" },
].map(stat => (
<div key={stat.label} style={{ flex: 1, background: "#111128", borderRadius: 14, padding: "12px 8px", textAlign: "center", border: `1px solid ${stat.border}88`, boxShadow: `0 0 14px ${stat.glow}44, inset 0 0 12px ${stat.glow}11` }}>
<div style={{ height: 28, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 4 }}>{stat.icon}</div>
<div style={{ color: "#F1F0EE", fontWeight: 700, fontSize: 20 }}>{stat.value}</div>
<div style={{ color: "#6B6A7A", fontSize: 10, marginTop: 2, fontFamily: "monospace", letterSpacing: 0.5 }}>{stat.label}</div>
</div>
))}
</div>
{/* Recherche */}
<div style={{ display: "flex", alignItems: "center", gap: 10, background: "#1A1A2E", borderRadius: 14, padding: "12px 14px", marginBottom: 8, border: "1px solid rgba(255,255,255,0.12)" }}>
<span style={{ color: "#6B6A7A", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="search" size={16} color="#6B6A7A" /></span>
<input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un projet..."
style={{ background: "none", border: "none", outline: "none", color: "#F1F0EE", flex: 1, fontFamily: "'DM Sans', sans-serif", fontSize: 15 }} />
</div>
{/* Filtres */}
<div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2 }}>
{["Tous", "En cours", "Terminés", "PDF", "Crochet", "Tricot"].map(f => (
<button key={f} onClick={() => setActiveFilter(f)} style={{ padding: "5px 12px", borderRadius: 9999, border: `1px solid ${activeFilter === f ? "#A78BFA" : "#333"}`, background: activeFilter === f ? "#7C3AED33" : "none", color: activeFilter === f ? "#A78BFA" : "#6B6A7A", fontSize: 11, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "'DM Sans', sans-serif" }}>{f}</button>
))}
</div>
</div>
<div style={{ padding: "4px 10px 100px" }}>
<div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", rowGap: 10, columnGap: 6, justifyItems: "center", alignItems: "start" }}>
{filtered.map((project, idx) => (
<div key={project.id}>
<ProjectBubble project={project} onMenuOpen={handleMenuOpen} onProjectClick={p => p.projectType === "pdf" ? navigateToPdfViewer(p) : navigateToRowCounter(p)} mode={mode} />
</div>
))}
</div>
{filtered.length === 0 && <div style={{ textAlign: "center", color: "#6B6A7A", padding: "40px 0", fontSize: 14 }}>Aucun projet trouvé</div>}
</div>
<div style={{ position: "fixed", bottom: 28, right: "calc(50% - 200px)", zIndex: 50 }}>
<button onClick={handleNewProject} style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg, #7C3AED, #EC4899)", border: "none", cursor: "pointer", fontSize: 28, color: "#fff", boxShadow: "0 4px 20px #7C3AED88", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
</div>
<ContextMenu project={menuProject} position={menuPos} onClose={() => setMenuProject(null)}
onRename={() => { setRenameProject(menuProject); setMenuProject(null); }}
onDelete={() => { setDeleteProject(menuProject); setMenuProject(null); }}
onChangePhoto={() => { setPhotoTarget({ id: menuProject.id, context: "project" }); setMenuProject(null); }}
onChangeColor={(idx) => updateProject(menuProject.id, { colorIdx: idx })} />
<RenameModal project={renameProject} onConfirm={handleRename} onClose={() => setRenameProject(null)} />
<DeleteModal project={deleteProject} onConfirm={handleDelete} onClose={() => setDeleteProject(null)} />
{photoTarget && (
<PhotoCropModal
existingImage={photoTarget.context === 'project'
? projects.find(p => p.id === photoTarget.id)?.image
: (database.patrons||[]).find(p => p.id === photoTarget.id)?.image}
onClose={() => setPhotoTarget(null)}
onConfirm={(imgData) => {
if (photoTarget.context === 'project') updateProject(photoTarget.id, { image: imgData });
else updatePatron(photoTarget.id, { image: imgData });
setPhotoTarget(null);
}}
/>
)}
{/* Modale import */}
{showDataImportModal && (
<div onClick={() => setShowDataImportModal(false)} style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "flex-start", padding: 20, paddingTop: "max(72px, 10vh)" }}>
<div onClick={e => e.stopPropagation()} data-kaleido-modal-card="true" style={{ background: "#1A1A2E", borderRadius: 22, padding: 20, width: "100%", maxWidth: 390, maxHeight: "85vh", display: "flex", flexDirection: "column" }}>
<h3 style={{ color: "#F1F0EE", fontFamily: "'Syne', sans-serif", margin: "0 0 6px", fontSize: 16 }}>
Importer tes projets</h3>
<p style={{ color: "#6B6A7A", fontSize: 12, margin: "0 0 12px" }}>Colle ici le texte copié depuis l'export. <span style={{ color: "#F87171" }}>Attention : tes projets actuels seront remplacés.</span></p>
<textarea value={importText} onFocus={e => e.target.select()} onChange={e => setImportText(e.target.value)}
placeholder="Colle ton texte de sauvegarde ici..."
style={{ flex: 1, minHeight: 180, background: "#0D0D1A", border: "1px solid #05966944", borderRadius: 10, padding: 12, color: "#F1F0EE", fontSize: 13, fontFamily: "monospace", outline: "none", resize: "none" }} />
<div style={{ display: "flex", gap: 10, marginTop: 12 }}>
<button onClick={async () => {
try {
const imported = JSON.parse(importText.trim());
if (imported.projects && imported.settings) {
setDatabase(imported);
saveToDatabase(imported);
setShowDataImportModal(false);
setShowSettingsModal(false);
const pdfCount = imported.projects.filter(p => p.projectType === 'pdf').length;
alert("✅ Projets restaurés !" + (pdfCount > 0 ? `\n\n${pdfCount} projet(s) PDF — tu devras réimporter les fichiers PDF manuellement depuis ton téléphone.` : ""));
} else {
alert("❌ Texte invalide — assure-toi de coller une sauvegarde Kaleido.");
}
} catch { alert("❌ Erreur — le texte ne semble pas valide."); }
}} style={{ flex: 1, padding: "12px 20px", minHeight: 44, borderRadius: 12, background: "linear-gradient(135deg, #059669, #34D399)", border: "none", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
Restaurer</button>
<button onClick={() => setShowDataImportModal(false)}
style={{ padding: "12px 20px", minHeight: 44, borderRadius: 12, background: "#333", border: "none", color: "#999", fontSize: 15, cursor: "pointer" }}>Annuler</button>
</div>
</div>
</div>
)}
{/* Modale données export */}
{showExportData && (
<div onClick={() => setShowExportData(false)} style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "flex-start", padding: 20, paddingTop: "max(72px, 10vh)" }}>
<div onClick={e => e.stopPropagation()} data-kaleido-modal-card="true" style={{ background: "#1A1A2E", borderRadius: 22, padding: 20, width: "100%", maxWidth: 390, maxHeight: "85vh", display: "flex", flexDirection: "column" }}>
<h3 style={{ color: "#F1F0EE", fontFamily: "'Syne', sans-serif", margin: "0 0 6px", fontSize: 16 }}>
Sauvegarde de tes projets</h3>
<p style={{ color: "#6B6A7A", fontSize: 12, margin: "0 0 4px" }}>Ce texte contient <span style={{ color: "#A78BFA", fontWeight: 700 }}>tous tes projets, rangs et données</span>.</p>
<p style={{ color: "#6B6A7A", fontSize: 12, margin: "0 0 12px" }}>1. Appuie sur <strong style={{ color: "#F1F0EE" }}>Copier</strong> → 2. Ouvre <strong style={{ color: "#F1F0EE" }}>Notes</strong> → 3. Colle et sauvegarde. Pour restaurer, copie ce texte et utilise <strong style={{ color: "#F1F0EE" }}>Importer</strong> dans ⚙️.</p>
<textarea readOnly value={exportData} onClick={e => { e.target.select(); }}
style={{ flex: 1, minHeight: 160, background: "#0D0D1A", border: "1px solid #7C3AED44", borderRadius: 10, padding: 12, color: "#A78BFA", fontSize: 11, fontFamily: "monospace", outline: "none", resize: "none" }} />
<div style={{ display: "flex", gap: 10, marginTop: 12 }}>
<button onClick={() => {
if (navigator.clipboard?.writeText) {
navigator.clipboard.writeText(exportData).then(() => alert("✅ Copié dans le presse-papier !")).catch(() => alert("Sélectionne le texte manuellement et copie-le."));
} else { alert("Sélectionne le texte dans le champ et copie-le manuellement."); }
}} style={{ flex: 1, padding: "12px 20px", minHeight: 44, borderRadius: 12, background: "linear-gradient(135deg, #7C3AED, #A78BFA)", border: "none", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
Copier</button>
<button onClick={() => setShowExportData(false)}
style={{ padding: "12px 20px", minHeight: 44, borderRadius: 12, background: "#333", border: "none", color: "#999", fontSize: 15, cursor: "pointer" }}>Fermer</button>
</div>
</div>
</div>
)}
{showSettingsModal && (
<div onClick={() => setShowSettingsModal(false)} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
<div onClick={e => e.stopPropagation()} style={{ background: "#1A1A2E", borderRadius: "24px 24px 0 0", padding: "24px 20px 40px", width: "100%", maxWidth: 430 }}>
<div style={{ width: 36, height: 4, background: "#333", borderRadius: 2, margin: "0 auto 20px" }} />
<h2 style={{ color: "#F1F0EE", fontFamily: "'Syne', sans-serif", fontSize: 18, margin: "0 0 20px", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}><Icon name="settings" size={18} color="#A78BFA" />Paramètres</h2>
{/* Export — télécharge un fichier .json */}
<button onClick={async () => {
try {
const allProjects = [...(database.projectsPersonal||[]), ...(database.projectsPro||[])];
const pdfProjects = allProjects.filter(p => p.projectType === 'pdf' && p.pdfId);
const patronPdfs = (database.patrons||[]).filter(p => p.projectType === 'pdf' && p.pdfId);
const pdfs = {};
for (const p of [...pdfProjects, ...patronPdfs]) {
const data = await loadPdf(p.pdfId);
if (data) pdfs[p.pdfId] = data;
}
const fullExport = JSON.stringify({ ...database, pdfs });
const blob = new Blob([fullExport], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `kaleido-backup-${new Date().toISOString().split('T')[0]}.json`;
a.click();
URL.revokeObjectURL(url);
} catch(e) { alert('Erreur export : ' + e.message); }
}} style={{ width: "100%", padding: "16px", borderRadius: 14, background: "linear-gradient(135deg, #7C3AED22, #A78BFA22)", border: "1px solid #7C3AED44", cursor: "pointer", display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
<IconBadge name="download" tone="violet" size={24} />
<div style={{ textAlign: "left" }}>
<div style={{ color: "#F1F0EE", fontSize: 16, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", marginBottom: 2 }}>Exporter mes données</div>
<div style={{ color: "#6B6A7A", fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}>Télécharge un fichier <strong style={{ color: "#A78BFA" }}>.json</strong> avec tous tes projets et PDFs</div>
</div>
</button>
{/* Import — charge depuis un fichier .json */}
<label style={{ width: "100%", maxWidth: "100%", boxSizing: "border-box", padding: "16px", borderRadius: 14, background: "linear-gradient(135deg, #05966922, #34D39922)", border: "1px solid #05966944", cursor: "pointer", display: "flex", alignItems: "center", gap: 14 }}>
<IconBadge name="upload" tone="green" size={24} />
<div style={{ textAlign: "left" }}>
<div style={{ color: "#F1F0EE", fontSize: 16, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", marginBottom: 2 }}>Importer mes données</div>
<div style={{ color: "#6B6A7A", fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}>Charge un fichier <strong style={{ color: "#34D399" }}>.json</strong> pour tout restaurer</div>
</div>
<input type="file" accept=".json,application/json" style={{ display: "none" }} onChange={async (e) => {
const file = e.target.files[0];
if (!file) return;
try {
const text = await file.text();
const data = JSON.parse(text);
// Restaurer les PDFs dans IndexedDB
if (data.pdfs) {
for (const [pdfId, pdfData] of Object.entries(data.pdfs)) {
await savePdf(pdfId, pdfData);
}
}
// Restaurer la base de données
const { pdfs, ...dbData } = data;
setDatabase(dbData);
saveToDatabase(dbData);
setShowSettingsModal(false);
alert('✅ Données restaurées avec succès !');
} catch(e) {
alert('Erreur import : ' + e.message);
}
}} />
</label>
</div>
</div>
)}
{/* Menu nouveau projet */}
{showNewMenu && (
<div onClick={() => setShowNewMenu(false)} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
<div onClick={e => e.stopPropagation()} style={{ background: "#1A1A2E", borderRadius: "24px 24px 0 0", padding: "24px 20px 40px", width: "100%", maxWidth: 430 }}>
<div style={{ width: 36, height: 4, background: "#333", borderRadius: 2, margin: "0 auto 24px" }} />
<h3 style={{ color: "#F1F0EE", fontFamily: "'Syne', sans-serif", fontSize: 18, margin: "0 0 20px", textAlign: "center" }}>Nouveau projet</h3>
<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
{/* Choisir un patron existant */}
{(database.patrons || []).length > 0 && (
<button onClick={() => { setShowNewMenu(false); setShowSelectPatronModal(true); }}
style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 20px", borderRadius: 16, background: "linear-gradient(135deg, #05966922, #34D39922)", border: "1px solid #05966944", cursor: "pointer", textAlign: "left" }}>
<IconBadge name="bookOpen" tone="green" size={24} />
<div>
<div style={{ color: "#F1F0EE", fontSize: 16, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", marginBottom: 4, display: "flex", alignItems: "center", gap: 10 }}>Choisir un patron</div>
<div style={{ color: "#6B6A7A", fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>{(database.patrons || []).length} patron{(database.patrons||[]).length > 1 ? 's' : ''} dans ta bibliothèque</div>
</div>
</button>
)}
{/* Aller créer un patron */}
<button onClick={() => { setShowNewMenu(false); navigateToLibrary(); }}
style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 20px", borderRadius: 16, background: "linear-gradient(135deg, #7C3AED22, #A78BFA22)", border: "1px solid #7C3AED44", cursor: "pointer", textAlign: "left" }}>
<IconBadge name="library" tone="violet" size={24} />
<div>
<div style={{ color: "#F1F0EE", fontSize: 16, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", marginBottom: 4, display: "flex", alignItems: "center", gap: 10 }}>Aller à la bibliothèque</div>
<div style={{ color: "#6B6A7A", fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>Crée ou importe un patron d'abord</div>
</div>
</button>
</div>
</div>
</div>
)}
{/* Sélection patron — grille de bulles */}
{showSelectPatronModal && (
<div onClick={() => setShowSelectPatronModal(false)} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
<div onClick={e => e.stopPropagation()} style={{ background: "#1A1A2E", borderRadius: "24px 24px 0 0", padding: "20px 6px 40px", width: "100%", maxWidth: 430, maxHeight: "80vh", display: "flex", flexDirection: "column" }}>
<div style={{ width: 36, height: 4, background: "#333", borderRadius: 2, margin: "0 auto 16px" }} />
<h3 style={{ color: "#F1F0EE", fontFamily: "'Syne', sans-serif", fontSize: 18, margin: "0 0 4px", textAlign: "center" }}>Choisir un patron</h3>
<p style={{ color: "#6B6A7A", fontSize: 12, textAlign: "center", margin: "0 0 16px", fontFamily: "'DM Sans', sans-serif" }}>Appuie sur une bulle pour créer le projet</p>
<div style={{ overflowY: "auto", flex: 1 }}>
<div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", rowGap: 4, columnGap: 0 }}>
{(database.patrons || []).map((patron, idx) => (
<div key={patron.id} style={{ animation: `fadeIn 0.3s ease ${idx * 0.04}s both` }}>
<ProjectBubble
project={{
...patron,
rang: patron.projectType === 'pdf' ? 0 : (patron.parties?.reduce((s,p) => s + p.rangs?.length, 0) || 0),
total: patron.projectType === 'pdf' ? 1 : Math.max(1, patron.parties?.reduce((s,p) => s + p.rangs?.length, 0) || 1),
}}
onMenuOpen={null}
onProjectClick={() => {
const newId = database.settings.lastProjectId + 1;
const newProject = {
id: newId, name: patron.name, rang: 0,
total: patron.total || 0,
colorIdx: patron.colorIdx, image: patron.image || null, // image synced via updatePatron
projectType: patron.projectType, patronId: patron.id, linkMode: 'mirror',
...(patron.projectType === 'custom'
? { type: patron.type, laine: patron.laine, outil: patron.outil, notes: patron.notes, parties: patron.parties }
: { pdfId: patron.pdfId, pdfParties: patron.pdfParties }),
elapsedTime: 0, createdAt: new Date().toISOString(), status: "en_cours"
};
addProjectToDB(newProject);
setShowSelectPatronModal(false);
}}
mode="personal"
/>
</div>
))}
</div>
</div>
</div>
</div>
)}
{/* Modale import PDF */}
{showImportModal && <ImportPdfModal onClose={() => setShowImportModal(false)} onCreate={async (name, pdfData, total, partiesConfig) => {
const newId = database.settings.lastProjectId + 1;
const colorIdx = Math.floor(Math.random() * KALEIDOSCOPE_COLORS.length);
const pdfId = `pdf_${newId}`;
const saved = await savePdf(pdfId, pdfData);
if (!saved) { alert("Erreur: impossible de sauvegarder le PDF."); return; }
// Construire les parties avec colorIdx
const pdfParties = partiesConfig.filter(p => p.nom.trim()).map((p, i) => ({
id: i + 1,
nom: p.nom.trim(),
totalRangs: parseInt(p.rangs) || 0,
colorIdx: i % KALEIDOSCOPE_COLORS.length,
}));
// Recalculer le total depuis les parties si elles existent
const realTotal = pdfParties.length > 0
? pdfParties.reduce((s, p) => s + p.totalRangs, 0)
: total;
const newProject = {
id: newId, name, rang: 0, total: realTotal,
colorIdx, image: null, projectType: "pdf", pdfId,
pdfParties, elapsedTime: 0,
createdAt: new Date().toISOString(), status: "en_cours"
};
addProjectToDB(newProject);
setShowImportModal(false);
}} />}
</div>
);
// ─── VUE PATRON EDITOR ────────────────────────────────────
const PatronEditorView = () => {
// Source : patron de bibliothèque OU projet
const source = currentPatron || currentProject;
const isPatronMode = !!currentPatron;
const draftMode = isPatronMode ? "patron" : "project";
const [patron, setPatron] = useState(() => {
const sourceSnapshot = {
nom: source?.name || "Nouveau patron",
laine: source?.laine || "",
technique: source?.type || "crochet",
outil: source?.outil || "",
notes: source?.notes || "",
parties: source?.parties || [],
};
const restoredDraft = loadPatronDraft({ sourceId: source?.id ?? null, mode: draftMode });
return restoredDraft && typeof restoredDraft === "object" ? { ...sourceSnapshot, ...restoredDraft } : sourceSnapshot;
});
const [isEditingNom, setIsEditingNom] = useState(false);
const [tempNom, setTempNom] = useState(patron.nom);
const totalRangsPatron = patron.parties.reduce(
(s, p) => s + p.rangs.filter(r => !r.isNote).length,
0
);
const updatePatronInfo = (field, value) => applyPatronUpdate("updatePatronInfo", prev => ({ ...prev, [field]: value }));
const handleSaveNom = () => { applyPatronUpdate("handleSaveNom", prev => ({ ...prev, nom: tempNom })); setIsEditingNom(false); };
const handleSave = () => {
const normalizedPatron = normalizePatron(patron);
const errors = validatePatron(normalizedPatron);
if (errors.length) {
alert("Impossible de sauvegarder: le patron est invalide.");
console.warn("[KALEIDO] handleSave: patron invalide", errors, normalizedPatron);
return;
}

  const totalRangsNormalized = normalizedPatron.parties.reduce(
    (s, p) => s + p.rangs.filter(r => !r.isNote).length,
    0
  );

  setPatron(normalizedPatron);
  backupPatronState("handleSave", normalizedPatron);
  clearPatronDraft({ sourceId: source?.id ?? null, mode: draftMode });

  if (isPatronMode) {
    updatePatron(currentPatron.id, { name: normalizedPatron.nom, laine: normalizedPatron.laine, type: normalizedPatron.technique, outil: normalizedPatron.outil, notes: normalizedPatron.notes, parties: normalizedPatron.parties, total: totalRangsNormalized });
    navigateToLibrary();
  } else {
    updateProject(currentProject.id, { name: normalizedPatron.nom, laine: normalizedPatron.laine, type: normalizedPatron.technique, outil: normalizedPatron.outil, notes: normalizedPatron.notes, parties: normalizedPatron.parties, total: Math.max(totalRangsNormalized, currentProject.total || 1) });
    navigateToHub();
  }
};
const makeId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const safeArray = (value) => Array.isArray(value) ? value : [];

const normalizePatron = (candidate) => {
  const base = candidate && typeof candidate === "object" ? candidate : {};
  const partieIds = new Set();
  const rangIds = new Set();
  const normalizedParties = safeArray(base.parties).map((partie, partieIndex) => {
    const rawPartie = partie && typeof partie === "object" ? partie : {};
    let partieId = rawPartie.id;
    if (partieId == null || partieIds.has(partieId)) {
      partieId = `partie-${partieIndex}-${makeId()}`;
    }
    partieIds.add(partieId);

    const normalizedRangs = safeArray(rawPartie.rangs).map((rang, rangIndex) => {
      const rawRang = rang && typeof rang === "object" ? rang : {};
      let rangId = rawRang.id;
      if (rangId == null || rangIds.has(rangId)) {
        rangId = `rang-${partieIndex}-${rangIndex}-${makeId()}`;
      }
      rangIds.add(rangId);
      return {
        ...rawRang,
        id: rangId,
        instruction: typeof rawRang.instruction === "string" ? rawRang.instruction : "",
        mailles: rawRang.mailles ?? null,
      };
    });

    return {
      ...rawPartie,
      id: partieId,
      nom: (typeof rawPartie.nom === "string" && rawPartie.nom.trim()) ? rawPartie.nom : "Nouvelle partie",
      colorIdx: Number.isInteger(rawPartie.colorIdx) ? rawPartie.colorIdx : (partieIndex % KALEIDOSCOPE_COLORS.length),
      rangs: normalizedRangs,
    };
  });

  return {
    nom: typeof base.nom === "string" ? base.nom : (source?.name || "Nouveau patron"),
    laine: typeof base.laine === "string" ? base.laine : "",
    technique: typeof base.technique === "string" ? base.technique : (source?.type || "crochet"),
    outil: typeof base.outil === "string" ? base.outil : "",
    notes: typeof base.notes === "string" ? base.notes : "",
    parties: normalizedParties,
  };
};

useEffect(() => {
  setPatron(prev => {
    const normalized = normalizePatron(prev);
    return JSON.stringify(prev) === JSON.stringify(normalized) ? prev : normalized;
  });
}, []);

useEffect(() => {
  backupPatronState("autosave", patron);
}, [patron]);

const backupPatronState = (label, state) => {
  try {
    savePatronDraft({
      label,
      mode: draftMode,
      sourceId: source?.id ?? null,
      patron: state
    });
  } catch (e) {
    console.warn("[KALEIDO] backupPatronState error:", e);
  }
};

const validatePatron = (candidate) => {
  const errors = [];
  if (!candidate || typeof candidate !== "object") {
    errors.push("Patron invalide: objet manquant.");
    return errors;
  }

  const parties = safeArray(candidate.parties);
  const partieIds = new Set();
  const rangIds = new Set();

  for (const partie of parties) {
    if (!partie || typeof partie !== "object") {
      errors.push("Partie invalide: entrée non valide.");
      continue;
    }

    if (partie.id == null) {
      errors.push("Partie invalide: id manquant.");
    } else if (partieIds.has(partie.id)) {
      errors.push(`Partie dupliquée: ${partie.id}`);
    } else {
      partieIds.add(partie.id);
    }

    const rangs = safeArray(partie.rangs);
    if (!Array.isArray(partie.rangs)) {
      errors.push(`Rangs invalides dans la partie ${partie.id ?? "sans-id"}.`);
    }

    for (const rang of rangs) {
      if (!rang || typeof rang !== "object") {
        errors.push(`Rang invalide dans la partie ${partie.id ?? "sans-id"}.`);
        continue;
      }

      if (rang.id == null) {
        errors.push(`Rang sans id dans la partie ${partie.id ?? "sans-id"}.`);
      } else if (rangIds.has(rang.id)) {
        errors.push(`Rang dupliqué: ${rang.id}`);
      } else {
        rangIds.add(rang.id);
      }
    }
  }

  return errors;
};

const applyPatronUpdate = (label, updater) => {
  setPatron(prev => {
    try {
      const next = updater(prev);

      if (!next || typeof next !== "object") {
        console.warn(`[KALEIDO] ${label}: état ignoré (valeur invalide).`);
        return prev;
      }

      const normalizedNext = normalizePatron(next);
      const errors = validatePatron(normalizedNext);
      if (errors.length) {
        console.warn(`[KALEIDO] ${label}: patron invalide`, errors, normalizedNext);
        return prev;
      }

      backupPatronState(label, prev);
      debug(`${label}: OK`);
      return normalizedNext;
    } catch (e) {
      console.warn(`[KALEIDO] ${label}: exception`, e);
      return prev;
    }
  });
};

const addPartie = () =>
  applyPatronUpdate("addPartie", prev => ({
    ...prev,
    parties: [
      ...safeArray(prev.parties),
      {
        id: makeId(),
        nom: "Nouvelle partie",
        colorIdx: Math.floor(Math.random() * KALEIDOSCOPE_COLORS.length),
        rangs: []
      }
    ]
  }));

const updatePartie = (id, updates) =>
  applyPatronUpdate("updatePartie", prev => ({
    ...prev,
    parties: safeArray(prev.parties).map(p => (p.id === id ? { ...p, ...updates } : p))
  }));

const deletePartie = (id) => {
  if (!confirm("Supprimer cette partie?")) return;
  applyPatronUpdate("deletePartie", prev => ({
    ...prev,
    parties: safeArray(prev.parties).filter(p => p.id !== id)
  }));
};

const duplicatePartie = (id) => {
  applyPatronUpdate("duplicatePartie", prev => {
    const parties = safeArray(prev.parties);
    const p = parties.find(x => x.id === id);
    if (!p) return prev;

    return {
      ...prev,
      parties: [
        ...parties,
        {
          ...p,
          id: makeId(),
          nom: `${p.nom} (copie)`,
          rangs: safeArray(p.rangs).map(r => ({
            ...r,
            id: makeId()
          }))
        }
      ]
    };
  });
};

const movePartie = (id, dir) =>
  applyPatronUpdate("movePartie", prev => {
    const arr = [...safeArray(prev.parties)];
    const i = arr.findIndex(p => p.id === id);
    const ni = dir === "up" ? i - 1 : i + 1;
    if (i === -1 || ni < 0 || ni >= arr.length) return prev;
    [arr[i], arr[ni]] = [arr[ni], arr[i]];
    return { ...prev, parties: arr };
  });

const addRang = (partieId) =>
  applyPatronUpdate("addRang", prev => ({
    ...prev,
    parties: safeArray(prev.parties).map(p =>
      p.id !== partieId
        ? p
        : {
            ...p,
            rangs: [
              ...safeArray(p.rangs),
              {
                id: makeId(),
                instruction: "Nouvelle instruction",
                mailles: null
              }
            ]
          }
    )
  }));

const updateRang = (partieId, rangId, updates) =>
  applyPatronUpdate("updateRang", prev => ({
    ...prev,
    parties: safeArray(prev.parties).map(p =>
      p.id !== partieId
        ? p
        : {
            ...p,
            rangs: safeArray(p.rangs).map(r =>
              r.id === rangId ? { ...r, ...updates } : r
            )
          }
    )
  }));

const deleteRang = (partieId, rangId) => {
  if (!confirm("Supprimer ce rang?")) return;

  applyPatronUpdate("deleteRang", prev => ({
    ...prev,
    parties: safeArray(prev.parties).map(p =>
      p.id !== partieId
        ? p
        : {
            ...p,
            rangs: safeArray(p.rangs).filter(r => r.id !== rangId)
          }
    )
  }));
};

const duplicateRang = (partieId, rangId) =>
  applyPatronUpdate("duplicateRang", prev => ({
    ...prev,
    parties: safeArray(prev.parties).map(p => {
      if (p.id !== partieId) return p;

      return {
        ...p,
        rangs: safeArray(p.rangs).reduce((acc, r) => {
          acc.push(r);
          if (r.id === rangId) {
            acc.push({
              ...r,
              id: makeId(),
              instruction: `${r.instruction} (copie)`
            });
          }
          return acc;
        }, [])
      };
    })
  }));

const moveRang = (partieId, rangId, dir) =>
  applyPatronUpdate("moveRang", prev => ({
    ...prev,
    parties: safeArray(prev.parties).map(p => {
      if (p.id !== partieId) return p;

      const arr = [...safeArray(p.rangs)];
      const i = arr.findIndex(r => r.id === rangId);
      const ni = dir === "up" ? i - 1 : i + 1;

      if (i === -1 || ni < 0 || ni >= arr.length) return p;

      [arr[i], arr[ni]] = [arr[ni], arr[i]];
      return { ...p, rangs: arr };
    })
  }));
return (
  <div style={{ background: "#0D0D1A", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", maxWidth: 430, margin: "0 auto" }}>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap'); ${GLOBAL_MOTION_CSS} ::-webkit-scrollbar{width:0} *{-webkit-tap-highlight-color:transparent} input,textarea,select{font-size:16px!important}`}</style>
    <div style={{ background: "linear-gradient(180deg, #1A0A2E 0%, #0D0D1A 100%)", padding: "44px 20px 20px", position: "sticky", top: 0, zIndex: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <button data-kaleido-back-button="true" onClick={isPatronMode ? navigateToLibrary : navigateToHub} style={{ background: "#1E1E32", border: "none", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", color: "#A78BFA", fontSize: 16, cursor: "pointer" }}>←</button>
        {isEditingNom
          ? <input value={tempNom} onChange={e => setTempNom(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSaveNom()} onBlur={handleSaveNom} onFocus={e => e.target.select()} autoFocus style={{ background: "none", border: "none", outline: "none", color: "#F1F0EE", fontSize: 18, fontWeight: 700, fontFamily: "'Syne', sans-serif", flex: 1 }} />
          : <h1 onClick={() => setIsEditingNom(true)} style={{ color: "#F1F0EE", margin: 0, fontSize: 18, fontWeight: 700, fontFamily: "'Syne', sans-serif", flex: 1, cursor: "pointer" }}>{patron.nom}</h1>
        }
        <button onClick={handleSave} style={{ background: "linear-gradient(135deg, #059669, #34D399)", border: "none", borderRadius: 10, padding: "8px 16px", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Sauvegarder</button>
      </div>
      <div style={{ color: "#A78BFA", fontSize: 13, fontFamily: "monospace" }}>{patron.parties.length} parties • {totalRangsPatron} rangs</div>
    </div>
    <div style={{ padding: "0 20px 16px" }}>
      <div style={{ background: "#1A1A2E", borderRadius: 16, padding: 16, border: "1px solid #ffffff0A" }}>
        <h3 style={{ color: "#F1F0EE", margin: "0 0 16px", fontSize: 14, fontWeight: 600 }}>Informations du patron</h3>
        <div style={{ marginBottom: 12 }}>
          <label style={{ color: "#A78BFA", fontSize: 12, fontFamily: "monospace", display: "block", marginBottom: 6 }}>TYPE DE LAINE</label>
          <input value={patron.laine} onChange={e => updatePatronInfo("laine", e.target.value)} placeholder="Ex: Coton peigné, Laine mérinos DK..."
            style={{ width: "100%", background: "#13131F", border: "1px solid #ffffff0A", borderRadius: 8, padding: "12px", color: "#F1F0EE", fontSize: 16, outline: "none", fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box" }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          <div>
            <label style={{ color: "#A78BFA", fontSize: 12, fontFamily: "monospace", display: "block", marginBottom: 6 }}>TECHNIQUE</label>
            <select value={patron.technique} onChange={e => updatePatronInfo("technique", e.target.value)}
              style={{ width: "100%", background: "#13131F", border: "1px solid #ffffff0A", borderRadius: 8, padding: "12px", color: "#F1F0EE", fontSize: 16, outline: "none", cursor: "pointer", boxSizing: "border-box" }}>
              <option value="crochet">Crochet</option>
              <option value="crochet-tunisien">Crochet tunisien</option>
              <option value="tricot">Tricot</option>
            </select>
          </div>
          <div>
            <label style={{ color: "#A78BFA", fontSize: 12, fontFamily: "monospace", display: "block", marginBottom: 6 }}>{patron.technique === "tricot" ? "AIGUILLES" : "CROCHET"}</label>
            <input value={patron.outil} onChange={e => updatePatronInfo("outil", e.target.value)} placeholder={patron.technique === "tricot" ? "Ex: 4.5mm circulaires" : "Ex: 4.5mm"}
              style={{ width: "100%", background: "#13131F", border: "1px solid #ffffff0A", borderRadius: 8, padding: "12px", color: "#F1F0EE", fontSize: 16, outline: "none", boxSizing: "border-box" }} />
          </div>
        </div>
        <div>
          <label style={{ color: "#A78BFA", fontSize: 12, fontFamily: "monospace", display: "block", marginBottom: 6 }}>NOTES & INFOS</label>
          <textarea value={patron.notes} onChange={e => updatePatronInfo("notes", e.target.value)} placeholder="Conseils, modifications, taille finale..." rows={3}
            style={{ width: "100%", background: "#13131F", border: "1px solid #ffffff0A", borderRadius: 8, padding: "12px", color: "#F1F0EE", fontSize: 16, outline: "none", resize: "vertical", boxSizing: "border-box" }} />
        </div>
      </div>
    </div>
    <div style={{ padding: "0 20px 100px" }}>
      {patron.parties.map((partie, index) => (
        <PartieSection key={partie.id} partie={partie}
          onUpdate={updatePartie} onDelete={deletePartie} onDuplicate={duplicatePartie}
          onMoveUp={id => movePartie(id, 'up')} onMoveDown={id => movePartie(id, 'down')}
          isFirst={index === 0} isLast={index === patron.parties.length - 1}
          onAddRang={addRang} onUpdateRang={updateRang} onDeleteRang={deleteRang}
          onDuplicateRang={duplicateRang} onMoveRangUp={(partieId, rangId) => moveRang(partieId, rangId, 'up')} onMoveRangDown={(partieId, rangId) => moveRang(partieId, rangId, 'down')} />
      ))}
      <button onClick={addPartie} style={{ width: "100%", padding: "16px", borderRadius: 16, background: "none", border: "2px dashed #7C3AED44", color: "#7C3AED", fontSize: 16, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        + Ajouter une partie
      </button>
    </div>
  </div>
);

};
// ─── RENDU CONDITIONNEL ───────────────────────────────────
// ── Splash Screen ──────────────────────────────────────────────
if (showSplash) {
// Extract logo base64 from HubView inline usage
const LOGO_SRC = "data:image/jpeg;base64,/9j/4QDKRXhpZgAATU0AKgAAAAgABgESAAMAAAABAAEAAAEaAAUAAAABAAAAVgEbAAUAAAABAAAAXgEoAAMAAAABAAIAAAITAAMAAAABAAEAAIdpAAQAAAABAAAAZgAAAAAAAABIAAAAAQAAAEgAAAABAAeQAAAHAAAABDAyMjGRAQAHAAAABAECAwCgAAAHAAAABDAxMDCgAQADAAAAAQABAACgAgAEAAAAAQAAAZSgAwAEAAAAAQAAAZSkBgADAAAAAQAAAAAAAAAAAAD/4gIoSUNDX1BST0ZJTEUAAQEAAAIYYXBwbAQAAABtbnRyUkdCIFhZWiAH5gABAAEAAAAAAABhY3NwQVBQTAAAAABBUFBMAAAAAAAAAAAAAAAAAAAAAAAA9tYAAQAAAADTLWFwcGzs/aOOOIVHw220vU962hgvAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAApkZXNjAAAA/AAAADBjcHJ0AAABLAAAAFB3dHB0AAABfAAAABRyWFlaAAABkAAAABRnWFlaAAABpAAAABRiWFlaAAABuAAAABRyVFJDAAABzAAAACBjaGFkAAAB7AAAACxiVFJDAAABzAAAACBnVFJDAAABzAAAACBtbHVjAAAAAAAAAAEAAAAMZW5VUwAAABQAAAAcAEQAaQBzAHAAbABhAHkAIABQADNtbHVjAAAAAAAAAAEAAAAMZW5VUwAAADQAAAAcAEMAbwBwAHkAcgBpAGcAaAB0ACAAQQBwAHAAbABlACAASQBuAGMALgAsACAAMgAwADIAMlhZWiAAAAAAAAD21QABAAAAANMsWFlaIAAAAAAAAIPfAAA9v////7tYWVogAAAAAAAASr8AALE3AAAKuVhZWiAAAAAAAAAoOAAAEQsAAMi5cGFyYQAAAAAAAwAAAAJmZgAA8qcAAA1ZAAAT0AAACltzZjMyAAAAAAABDEIAAAXe///zJgAAB5MAAP2Q///7ov///aMAAAPcAADAbv/bAIQAAQEBAQEBAgEBAgMCAgIDBAMDAwMEBQQEBAQEBQYFBQUFBQUGBgYGBgYGBgcHBwcHBwgICAgICQkJCQkJCQkJCQEBAQECAgIEAgIECQYFBgkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJ/90ABAAa/8AAEQgBlAGUAwEiAAIRAQMRAf/EAaIAAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKCxAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6AQADAQEBAQEBAQEBAAAAAAAAAQIDBAUGBwgJCgsRAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/aAAwDAQACEQMRAD8A/uo7Z9OMUhIxtpfb8KQ46dK+PPYAkfd9KRiAc0uCT0pQeNrcYpgJu5z7UHpg03cFHP5U7uAKQB93n9KQ57dqU4xgcUuVWgBPqMU3+nSnHA96Pk44/wA9KAE6fKSKccY5xTeBy3QdKcvPSgBv3cnoaAp69PpTiMHjgClGDwRQA08cAUo6e9J0HPSlPC+goAcx+XKimnpkCkPJpi/NnHPtRsFhzEgcUvTr0pkYafm3VpOx2KSB9cZr4w+PX/BRX9hP9mK7vNI+Onxd8J+HdU08gT6VJqcE+poT2/s61M12eMcCLuK7cFl2IxEuTDwcn2Sv+RjVr04K82kj7U24GOnpTcehr+fb4l/8HKP/AAT08HXr6f8ADnTvHHxBHl7ornSNC/s62JPT95rc1i+P9pYSBiviHxr/AMHRurMJLT4c/AVXjfd5NxrfitYjwMqXg07T7kcj+Hz6+2wfhTn9bbDterUfzaPBxHF2XUnaVRfI/rqCNj5R07UijcccfSv4ZPEP/By7/wAFArm8K+G/Bnwz0q14G+a11rU5FznBH+n2ansMEDn8q8d8T/8ABwB/wVH168abT/EvhLQY+ONP8Ko8a5wM/wCmXtwxI6YzX0NHwNzqWkuSPz/yTPJqeIeXR2b+4/v9Ji6ZA7dqassOMq6kdeDX+d3ff8Fxv+Cud/Owt/jELNUOdtl4X0FVVTx/y3s5sAdf61RT/gtv/wAFdoz+/wDjpcvtDNl/DnhshguMnA0leMcf547Y+Ama/wDP6n/5N/8AIHN/xEnA/wAsvuX+Z/opblKFlII9qMbsYr/PS0b/AILv/wDBVrQ5mku/idpWsfw7dS8L6URwCRkWa2p5wemfUcZx7/oH/ByX/wAFD9IiWDV9E+HOvYALmTSNSsJWAH3Ve31GVQcekXXpx05K/gZnMfglB+jf6pG9PxFy573XyP7sW+U4xnPSmqzEc/5xX8fHgb/g6H8e2wFv8S/gXYXYTl7nQ/FMseQOuy2v9P2k88Az9uuK+8vhp/wcp/sGeLbq3074iaD458DNIG825vdIh1S1RlAJAbR7i6nI5AH7gZ9BXzmN8Ks+oK7w9/8AC0/wTPVw3GGXVXZVEvXQ/oT96Dx/+qvzx+D/APwVl/4JsfHeWKx+HHxs8KtfTuscVhqt4NEv5HbgKllqq2s7HjoFP8q/Q0N/o4u+fKZQyyDmMqRkEOuVxjvnFfF47KsThXy4mm4PzTR79DE0qivTkn6D1OPpScflxTSfl39sdv8AOKVWyu7/ADiuFI6BR7Cnfw4/Sk46/wAqTooNIBWQY6cUY7+lOG0jmgMAoWgCPjZQDjg9qcwWjjtQAuRwD+FISOppMgjqKU8gY4oAO/8AKgdc9qT9KdjnjtQAnO2hRtAFByOlJ0BUc+lAARg/Sg8D2pWXd9KZ1GKAHfd6UHqaCMDBpW6+lAApwMCnbjSKpIyOKdsb1oA//9D+6cHHJ70m0dR2pc8U0kAZ54r5BHsDs8elJg9DxTs0me1IBvOadkYJNIcjG3tSsAvCigAOduO1KeOlNyByKMgdePSgA/h56U44oxnkUuQtADDj+KgHHWlJXOe9G5cDFACHGeaP4d1MLgD0Fc54q8ZeE/Avhe/8c+OdTs9E0PSYzPfajqFxFaWlrCv3pJ55mWONFHJLMKuEHKSjFaik0ldnTSYC7sdaRf3it5Q37euMYAx3PAXp3wK/mo/bA/4OSv2f/h6s/g/9irQ3+KOsnMX9uXxl0zwzbyfMuUkZBe6iVZQdttEkEiHK3Ir+Xz9rD9v39sr9uSe4sP2jfHOoahoFxJgeGdM/4k/h6GMv5iqdOt3DXIRh8j38l0/Hav1zhrwYzTGpVMV+5h5/F/4D0+dj4vNeOsFhvdg+aXlsf23ftL/8Fv8A/gnN+zLfXfha+8a/8J14lss+bofgmEa5cxFWKuk91GyadaujDDJcXcbD+7X4H/tFf8HLf7VHjFrnRf2ZvAuhfDzT9skY1LXZJPEWqnkFJY7WH7JYWzhM5VmvF479B/N7biO0tY9Jt4vs0Fvt228K7EyxGBHHjA5wMAYHHTpU9pEJJl+yxneQP7p2u3quctk/Lztx9MV+65J4P5Lg7OcPaSXWW33Ky++5+cZjx9jq75aXuLyPpH4/ftl/te/tRNdxftG/FbxT4qsLsIs2ly6i9hpLlfmUf2Zpi2llnIwN8LHHU9q+XdM0az8OWpi0CCOy88bxHbxrD8o24TCY3MP7zZPT6V6fb/CH4mxWJ1qbw/eMgdFWMQ5LFQV3BQBJjpg7QvGcmuEuUv7IOt/lJbfcTG4DvlcgFwAOVY5K4579q+3yTM8urQdLLakJRjuqbi0vVR29HY83iThzOsCoTzfD1KfP8PtISjzLpy8yV16EcoiN2EmRpdqLyTwVYjGeq8cZxjkcUtzI6O7D7gAdN+C2GPBPv64AGKg32pkS2tIQ4RV3uuQCO5wwLALzgA8Dgd69Q+HXxRTwhdsNS02y1G13ZIa3j86NiCMrKVZv4RwwYD0rux1arCm5UY8zXS9jHhTLsvxeOp4bNMR9XpS0c+Rz5fNxi07el35HnSWl7dsCgeSYkSRiNTkcdcKOgPHTOO/Wuoh+Hfjq4VLrTNGv5BKDKFhtZtu702bcEdAcjpX6XeDvGOj+MtBGteENQPl4XfGv7t4y3RZIhgJn+FgSpI4PYdbILpmAMxJP99i3boQc/wCfwr8rxfiRioz5PYKLXRv/AICP9JuGP2fOS4zCQxsc6danNJxlTpxUWvJ+0mn28rH5Zn4Z/E+GREt9B1MrD0YWEo2ZA+7uUA9Oh457U7/hT/xMgiE0fhzUs7NuxLeX58MTggdATzgdM9K/UJbUSQK67WKtjGSBx13egAx7dqbFaWvliWJRtAXOOG49OOmQcY/+tXK/EnFW/hx/r5n1Uf2dXD9rPH1v/JPy5D8lta0XUdGuv7M16CW0EoyIrqN0AH3CNrYJ4AHOM+9U5Zp3Imlkbku6tkjfuUjlM9W7qOcAAA84/VvxL4e0XxPo8nh3X4hcWkgIKPklR93cjH7jAdCMccEEHFfnT8U/hpqfw41oWjFmsbhd1rcYEbPGuNykY2iRCeQMjoRwwNfY8McZQx0vY1Vyz6dn6f5H8nfSM+iPmHBFBZrgarxGD0Tly2lTb0XOldcr0SmrK/utRvHm8vdVjmVGdhFMifNsAIw2AFbIIBB68c9PWmyt9+WVmeSIGEF8sDtx65255B7EDqKuWt6yXgu3RbmONlYpJHlCuQDgbSCPmOT7jsK+2PAfgX4OfFzwkutWOmGyvEURXcdrctuikIJUgOZE8uRRlGxjAweQa9nPM/jgIqpVg3Ha6tp2vsfkXg/4N4rjTE1MuyzE0oV4rmUKjlHnS35HGEk3HrF293VaKVvhCfyNRsTa6hbJdxJgiCZVuFOWHymOXg4CnHX616P8G/jF8Z/2dtVN5+zV428QeAJXdZ5h4c1S6sIJgm1VM1ojGylVeoEsLDb1Br6i8Qfst6Wwe48L6s0XABW8iEmWU5B82MqVweBiLPbpXhviD9nj4m6Gsiw2S6rAoUM9i3nN0248rKSjHunr7VyYbi3LMVH2cpq3aWi9NdGfUcV/Rd8QMgvVq5fOUV9qlapp3tTblFf4kj9avgJ/wcS/8FA/hTfwWfxoHh/4u6a0hMw1O2XQdXKqDtRNQ0mM2wAx/wAttNOcct3r93f2aP8Ag4l/YH+NBs9B+Ms+o/CHW7nZGR4kRZ9GaVzjEes2XmW6Rrx+8u0tfTAr+FfUo/smoHT75WtpIhs2yqq+XhRu3oy5OduPmHXAFU/tEspFzGWTzsBvkKqOSeHCnAbJ4Pfr1rwM58Lsix0eb2XI+8NPw+H8D8pwXGeZYSXs6jvbRqXTy8j/AFgfC3inwx428MWXjbwbqdnq2jalGstnqFhPHdWlxGx+V4p4S0bqexDc1unk4bt2xiv8sb4AftBftA/soeJ5fE/7LHjjWPh9fSSefKukzRmwu9ieWv2zTZhJYXeAwI82AsM8Fetf0sfsc/8AByzdm6tfA/7e3hCONU2Rv4u8GQySwoMKN9/osjSTIFAd5HsJpy3G21UcD8S4k8EMwwydTAP2se20vu2fyfyP0HKPEHCV/dr+4/wP648cE0vtxXjPwK/aD+B/7Tfw5tvi1+z14q0zxl4dusKt7pU6zpHIUV/JnXiS3mVWXfDOqSJnDKDxXsQIJ2+lfjFfDVKUnTqxs10eh95TqRlHmi9B/tSfLjJApAccfyp3H5ViWBwetJnBA6UcelGVI4pAO3AGkJx8p/Ck25GMUpAHP8qADoKQ4JpcfLkfSgeh6UAB/QUfxYx16UfL0xSOQOBTAUjHHSjj0xSj5enFM4+8uBSAXg+30owv+c05QWGadsoFY//R/umIA4xS9sE8UuBg7f8AOKRuvOPTivjz2BR06U3GB6U7gHOKb35oAXGBkfhRx90/ypOO/FISp5oAcRxg8ClyD83TFNPvSAYH0oAfk5pMjk4oJHWhtp+8aAFVd2M0mTwqjdnjA6/h/wDWrxr47/tD/BT9mH4Zaj8Y/j/4ktPCvhjTNqS314W+eVslYIIkDS3Fw4B8uCFHkc8IpPFfxCf8FH/+C4Px9/bSs9Q+FXwCGofDP4V3cbQSqkvk6/rUZPP265gcfYrZhtU2NtJvkUutxMVcwj7jg7w/x2cz/crlpreT2+Xd+S+dkeBnfEmGwEL1Xr0R/QV/wUG/4Lt/s3fsj3WofCn4Fww/Fb4l2cklpcafY3Ij0fSbhPkZdT1FA6+bGwbdZ2oknBQrL5AIav41v2sv20f2m/23/GEfir9qPxPLr0NqxudO0KCP7JoGnP5hCCy01C670DlBcXDTXLKuGl4xXzBYJaWiQ6fCiQwW7RiOGNIsKuWLbAuFUewxg9a7TwX4N8ZeNL1LDw7by3Bi3Dd8yxgNjaSWIAyVOCcdhX9U5DwZlHDuHeJlZcq96pOysvV6RX/DXZ+R1MzzXPsXDAYKnKUpu0acE25Pskld/JHISbi0kkyGSSYnBfAOeVG7GAeSMdOOldr4T+G3jfx5OV0KxmuVIc+bnbEpKY2tIxAB24425x2r7H+H37MXh3R9mq+NpBqN4FAEKFkto+mfu4aTBHJbC4bG019RWdglhbLZabEsMEe0RxBQiqMcbUXovYLwOnsK/n7xB+lngsNfDcPUvayWnPO6h/27HSUv/JPK6P7+8GP2cWZ45Qx3Gdf6vT39lTtKp/29LWEPRKb6PlZ8j+Fv2TdLsY1/4TK7F2oRWNvaZijGD180jcy44ICp9a+kfDngvw74V/0bQbG3ssIU3xrlmAOcNJyx6H14H5dkfLTzGX7jDYG74IxgAZHTBxjrTdrSnES4G4fKRwcdOMcj+E5zjnpX8fcXeJ+fZ7dZniXKL+ztD/wCNo/Nq/mf6a+GvgFwfwlFf2DgIU5r7bXNU/8AA5XkvRNR7JIhhtFWUuWwQPlVfTrg8/yYdOPblvEXgvwr4wtzb+JNOjnOGVXkB3r0+64wyjgdCPfPIrrfLDblbbnOVGcZDdj1OO/PIxzQuY8vvUKnYA9Bx+ftXxWExNXD1Y18PJxnHZxdmvRq1vkfqeZ5bhsbh54PGU41KctHGSUotecWmmvkfEXxF/ZmngtX1X4fP5qPz9jkPzDuQr5wQMjC4Bxx8x6/H2p6dqGn3rW2rB7Zx8uyVdu35Qq5Qj5SMc5zjoK/Z0tGMkfKwIX5j8vYcEDqMHjtmvJPit8I9J+JOnkyp5Gpw/LDc/7PeOT/AGeD7qTkcZVv638KPpQ4vC1I4HiV+0pPT2lvfj/iS+NLq/jSu/e0R/mz9In9n3luPoVM24FiqNdauh/y7n35L/w5dl/D2SVNXZ+a/hjxr4h8E63FrmgzrHJghlAwpQr/AKs7vlZCMcHPQEdBj9Gfhx8SdK+I+kNeWqiG6tkAurbOWjPQFehKN2JwV+6w6E/nF4m0LV/C2qzaDroNtdRuUMIQMpDcq427eCAORxjpT/B3ivVfA3iGLxHobtHJEpYpIvyPCdoKSKMDYRgdc/iOP7J4i4fw+aYdYnDNczV4yW0lbTVaNPo/uP4P+j59IPN/DzOJZdmMZfVXJqrSa96EtnKMXblnG1pR0U0uWVmoyj+sm8z9CCcdVAGD1wBzuxxxjpVhlWVRdMA338naB1HqB1PuMD6gCuT8JeLdM8ceH7TxLo77I5wcjJLRSx43xNxwVPIJAyNpxzXVSAAmOTA4Pzd+mO+OR/LpX4ZUpzpydOas1of7lZTmmGx2Fp4zBzU6c4qUZLZxaumvJogKZ28dQFPJ/iHPT6Vy3jLwro/i/wAPT+HtdHmW054baMo2PkkXPdfbGVyp4NdW0nmKcANkg84BwMH7w7cZ/Q5qOUiXmQgKuSCSMjHPf07/AMsVdKpKElOLs1+AZtlWHx2FqYPF01OnNOMovZxas012a0PyX8X+GNS8H6ze+HtTHl3FpIEZkJVdhGQVz1RhgqcDjrW78MPHl18PPFv9qWgZ7Zy0V3blC2+FsFgG6bgVDLzgEAkdq+vv2ifh/wD8JJ4XTxJYRbr/AEhPmI5L2pzkFdp/1RJIAIwu484r4BRCypPEmSu1kUKxVgCep4Ue/pX71kuYU81wNqy8pL+vw/4B/g34yeHuYeGfGajl1RxUGqtCf92+ielm4tOEla0rXtyySP2JtZ7a9jjubORZYZYleOQDGY2XcmMglQQfw6DFPmCy/KvlkqO2CVH14NfLv7Mvjx9X0CfwRqTHz9MzPAePmgdhuXIGPkcgjJJAbHAWvqhvlxGdw3fwk/pxwPl78V+IZpl9TCYiWHqdPxXQ/wBq/CfxEwvFnD2FzzCqyqR1j/LNaTj/ANuyTt3jaWzRla1pOk+I7cWHiO2g1JEDHbcIsu0Zx8pb5154yG/lXyb8XPgHo2g6RceL/AkVzGtpFm7sVZpAYG2gvHg78KVBdTu4PbBr7Fm2oFEu04yMHnC9eOoBGaUxRJDhNrx4xgjcvUkggdjk5HpjtVZTm+IwVRVKD07dH8tjzPFjwTyHjHAVcJmdGPtZRtGryr2kH0alo7KyvG/LJKz8vx1RSbVEDhXOxlcZyhXcCABgnOR97IHHOBVy5lmu8Ssu84CjLlzvDYPAPcD7u0DHoMV6h8YPhynw/wDGksVodljcMbiwLKWHlktmLJJH7pgVIz8wAPGa8kjSKafLKoVXVGITdtJyDwxG7ts6Ac9K/o7L8dTxFKNak9Gj/n84v4Sx2RZrXyfMY8tWjJxkul11T/las4vrFpnpnwk+MPxb/Zp+If8AwuP9nXxZqPgrxPHtB1HS5Fje4hQhvKuoXWS2vYi2Mw3MMsWVB2hhmv6sv2Dv+DjHwb4jW1+Gn/BQixtfBuojEUXjHSopP7CnO7Yp1G1/eTaa7fKDOhlsySzM1uuFr+Uvxl8MfFngbT4tRnjSfS7rZLb38St9lkjdVcdRlCWx8sgBBBxkc15vks+4FmbO7CD5lUn7oxngDg429/bPzWc8N5Vn+HUqqUu0lurefl1i9uyZ6VaWc8OYt4LGU5U5K14SXR7Nf3WtYyjo1qm0f6w2i61oviTQ7PxN4dvbfUdM1GCO5s7u0lWa3uIJVDxywyplJI3VgVZCVI6VrY2Hn9Olf5s37CH/AAUn/ak/4J368tv8Hb1Nc8EXV0JNQ8E6tIyaXNuf55LKRVeTS7p9+fOt0aKRipmglIXb/c3+wX/wUf8A2a/+CgvgOXX/AIPag9h4h0qMNrfhbVCker6Wc7d7xqSs9o5I8q7gLQtnaSkiyIn8t8b+GGNyhutH36P8y6f4l0/Lz6H6nw9xZh8euRaT7f5H34eDxxigbfypGBBIalGCMGvzM+rF+UdKMfh6UnAOKCeKAE3AZBOaXtSdsUDA74PagBenXpQadyelM79qAF2j8KTA7CnZUjIP04ptABz2H8qOfT+VBx3pPloA/9L+6fb3FLxikGM8CkLCvjz2Bcg/KKTr8vakGPanA9+lAB9DRgZ+tJ05GM0bxnNACEgf/WpcjjFHuKY5EY3+n6UAL5i5weDX56/8FCf+Ck3wB/4J2/DZfEHxJLa74s1aJv8AhH/CenyIuoak448x2O5bSxjI/f3ko2RgYRZJjHE3if8AwVP/AOCsHw3/AOCevg+Pwd4XgtfFXxb8QW3naH4cd/3FtCx8v+09YKMrRWMZyY4lZZrx1MUW1Vlmh/gZ+J3xT+I3xs8e6t8YvjZ4hufE/i7xEwl1HVb8/PN8+EWNEQR29tCM+TBCiwwxgbRkHP7P4b+Fc8ytjcd7tHousv8AKPn8l5fCcV8ZQwS9jQ1n+R69+1x+2R8fv26fi4Pi9+0drCXl1aF00nRrVnTSdFinIV4dPtix2lsIJrl8zzbVLsFCRp8zpLEzmSEZki3DG35vMGAioPTb3/lT55UhKyY+RAyt8vzANgE54I+YDGP4a9++FfjH4UeBEGs+ILS71HVo9r7hHE0MLYJVo1aTJIIGWxx8uBxX9JZ9mP8AZGXc2BwsqrjpGnBJfjtFd39yb0fwXBHDdPiDNo4bMcbTw1N6yq1HpFLtFayfSMVbzcVquv8AhT+zZrOsrDqvjpZLCBwNkAB86RQCMNuB2jpyRnr8oOCPuPRNA0Lw1pUem6DZi2hhAOyNOOB/EMZJ4GScngHrxXzgP2rfh4gkdrW/VDwcRRn09XAAz9MdelWB+1P8PppUgli1CJuAfMiiJUZwvSUtz/PpzX8A+JGT+IvEtb2mZYOapr4acV7sfkm7v+87vorRtFf7NeB3EXglwJhPYZLmdF1pK0q03+8l/wBvOKUI7e5G0dE3eScn9N+cH3mAMhK5JB5z6Y246D6D2NN3Q5ZsKdjHae/HAHUHr78HpnmvGLL4/wDwsvXU/wBrRwvLk4mimXk/xMQhX26mvQdP8Z+E9YYRaHqdreSMd0axTR7jtHHAb0OcgcV+FZpwXnGAjzY7CVKa7ypzivvaSP694e8T+Gs3kqeU5jQrSelqdWnN+loyf3HTq8Ko7rw3cY4xzjPpzipJAUYgJhuPw244yfc9elNhUwh3cbiOjMMfL7H155/DrTU/1m8K7ZxnAC5AHzA/d4zj+Qr5qLUl7p9zJOOjBhLbg4j2dDggHkHk44Oe/Bx2pJElwSPlYLxwCDtUenHOf5/ShBsywOWGQA3Izg/wsMZ46L6cY60zyY/9SUBQrjA6464C89vp1xyKaQD3YxSKFPKjnuxJ55PPPboOAKeERfkTaSB8u3kYX2wB9Pxpm9wwVkC54AI+7gdRnjjnsM0hkzAxAZhwWzkew57H0we/bsNIaZ4h8a/hXafEDQ/OsoD/AGpaxlrZ2HDbfmMJzjIc5KngK3O6vzJvoLmzkuVkTyZI1YSCQEbF2gHPAwOMc5/lX7RF13SDcCNrYwDjPXHAI96+Gv2nPhpbWOox+N9GjHl3rbLlNg2+cwyr5GNu/kZ9c8gmv7J+i74ryoV1wzjpe5K/sm/sy3cPJS3j2lpq56f5d/tBfo5U8Xg5ce5PTtVp2VdL7UNEqll9qGkZf3LPRU9eD+APxHPg7xSND1Fv+JTqjJGSflSGT/lnJzwo3fK+f4Dn5sAD9BNxjYQt8rLuJ4Bw3ocYzg4/p2r8fmwINrld8uFHmEEgbR8m4fqRzwK/Sb4LeO7jxz4Ggur1hLf6dizugSHLkKPKk65w6DBJPVTxX9LeImRck446mtHo/wBH+n3Hwn0A/GZ1adTgrHz1inOh6b1Ka9Pjiu3tHskj12GRnJTBLMvruH0/hHB/L26VJ5mRulXcx5AOCD3ABOeOpqBnESlTngYCnjpjcQBjoOMd6k2gDaNwCkIPlXkryCM46YHbofpX5qj/AE2K8ptii+YqSRtkENhkZTwytkdCPlI6Ee1fl58V/AreAvGtzojxebayPut5HzlraTmPAAAJH3WPQMpx6V+pQTMe8jC8k4GR078dTXzF+0r4RtdX8Fr4ot0xdaO48wjGWtpTjkYHCS7cdMBmNfX8F5t9WxihL4Z6f5f5fM/j36a/hXHiDg+eY0Y/v8HepH/Bb97H05Up/wDcNLqfIHw+8WT+CfG1n4ki2yR2r5dE58yNgyyovI6ruGOVXjt0/VtXtZAWtNr2z/MrqRh0cDDArnGQwPpzX45W7ZAlGCxPllsDdjvjIGO3rjjg9K/ST4C+Jv8AhJPhzbRXZC3Ol7rGVWOW2JnyTt9NmUwR0jGOK+n8RcsTjDFxW2j9Oh/Mf7PTxIdDHYvhWvL3ai9rTXaUbRml5yjyv0ps9wn3oic8ldvbPy+3qBg5z0qvNGrcxrklBjrjdkjjsTgDHTFLEy58lVwq8bQOq98ceh7enTvTtwVv3inLMueudwPPyjggKeg/XFflJ/q8eQfHDwP/AMJz8PJ4beFWvrHddWp+8cqP3sfQk5j7DGWRa/NAyxTTboZMBVKgcltzHcSNx/hHVQfQ9+P2KjcWcizxIBtbcD1Ud+nZe3FfmX8bPCE/gjxzcaXpg2WF1i7tE3cJFKM/Jt5XYwMfOc7T2xX6f4b5rrLBSfmv1X9eZ/lt+0F8K1CWG4xwkd/3VX7r05fcnBvpamj6q/ZX8arrnhe8+Geq7LkWSvNDG65WS1kYiRWUjBRWbof4XwPu5qx8Vv2WNI1F5tY+GpW0vV/emyJ/cOy9fKbgxZ5OGyuem2vjj4XeNj4B8bWPinMj/ZpQLlc+YzW7nbKBkKGJU/gelfsPOPM3yId6sV2lCMHIyOvbHOelfnviJWxvD2c/Xsulyxq6tdG18Sa+53310aP0H6LuDyHxP4B/1a4ooqrVwP7uMtqkactaUoS3ja0oW+FqmuZS2PxQ13R7jw3qcukavbSw3ETbZYpFCumW3DIHBHTke3Fbfgn4h/EP4W+PdK+LHwp1O98M+KPDs4utM1fTWMV1ayuWWXazKyvC4Ply28itDNGSkiMpxX6r+P8A4a+EfidoZsddGJl+WG6jUGaA9uOjJyfkPvjBwR+Y/wAU/hP4j+FmuJa63AHtnfzbe7QMYplQHbkEEAj7pRuUI7rsJ/UuB/EnB51H6vUXLVtrF7P/AA915bpd1qfxt9IX6J+ecBVP7Qw7dbBX0qpWcOyqRXwvopL3Hp8MnyH9pH/BKb/gt54D/a6l0z9nX9qCWw8J/Fl9lvp90h8nSfFBwQGsyfltdQyv7zT3Y7siS2aRd8cX9AkrY+8cnH5fXpgjpiv8l6WzgubX7HdfPAyjIYky742yrrt2hCu3KPHtZCoZSpr+t3/gkR/wXEvtUu9E/ZG/bz1ky6lO8Wm+GPHN6wBvy2I4LHXXOALwnEdvqH3LvKpcbLjD3H5l4keEXsk8wyiPu9YLp5x8vLp000X5jwjxuqzWFxj97o+/kf1i8Z44oyvSlYSI2yUbMcEHqKAex/Sv52P08O2DS9fmPFB3evFAJxnHSiwDegyaAOM+1K/TNN9ulABgDtxTww6AUg24wOlGCvTvQADP8JxS4b1pQYv4qXMH+f8A9dAH/9P+6XAXOTQRgbhR8v3hwPpTs7RyMCvkD2BOfTAxScZ6elHYUu3B7UgDcM8dB2pCwH/1qXocDtTS2ATnFABuwPbHOK/H7/grT/wVS8I/8E9fhzbeDvBItdb+Lniq2aXQdImBeCwtS/lHV9SVSrLaRuGWCLIa7nUxx4SOaSL2T/gpj/wUR+H3/BO/4Fx+N9RSDV/GviJpbLwj4elkKHUb2NVMks235ksbIMsl3KMAApCp86WNW/zvfiJ8TfH/AMYvibrXxk+MuuyeIfFPia6a91PVrttr3Mp2qEiVPljghQCG2hj2xwRKI0wMmv2jwq8Nv7Sn9exy/cx2X8zX6Lr9y62+D4z4rWDh7Ch8b/D+uhQ8V+KvF/xG8aa38R/iXrcut+J/EF2bzUdWv5Fa6vbmU4ZnKjagjThI1xHFHsSJVRQF5Lz3J8m3il2gANGmG6gZGG5y3AB4zjpgV6x8Cfg78RP2jvjBpvwg+FNj5usajiWe5nOLWwtIsfaLy7dQRHbwBuSMs77YkBd1Ff0w/D//AIJRfsWeEPC9hpvjLw3N4z1a3RftWp6rqGoRi4k2jzHWwtLiG3gi3cxRfOVUAMzMCa+m8dvpU8IeG7oYXPHOdaorxpUYwlNR2UpKU6cYwuuVe9d2fLFqMrfN8AeEOd8T89bBpKC3lNtK/ZWTu/w/A/k/Rbh2iZIHU8Ro+3Zh4+M9wcsSCMDjjjgCSZokuHVYRyo4ZVfaAcAd8ccFcDO32r+yzQv2GP2MNBiSG0+FHg6RIvmXz9MW9OPUtdvMTznOfauoP7J/7J0OyzsfhN4G8pDtXPh7T1IX8IhxgY9q/lWp+1L4TUrUstrtefs1/wC3tH7FD6ImbNK+Kpp+kv8AI/iuEolINispQZRwpLeWu7JJGWXBHXGCMNxTJIijFlhKI3O8lc8thepGcDoT0H+yAa/s31f9iT9kDW7R7W8+FHgtUyp3Jo8NuwK9P9QI/pgYz+NePah/wS4/YVuDJJZ/DiKykcuA9pq2sW4QkbchReugA5wNnHSvTyv9qJwLO/1zBYqH+GFGX51oW+45MZ9ErPY/wK9J+vMv/bWfyYQnyy6XMXlncSR1TZzzkjsDg4J9egAqSCeUW0bW4xlSJCny7BjgH3OQMZHSv6ZfE/8AwRx/ZV1dvO8O6p4r8OFeI447211KIZyflju7dpWXHYTfTpXyz42/4IkeNLLT2Pw2+I+lahJk7INc025syOflU3NrLdoMAdfLAz6dB+v8MfT/APC7MGlPHuhJ2sqtKovvdONSnG3dzS8z4TOfo4cV4Zf7uqi/uyi/wdn9yPx20P4g+PfCbQpoWq3VlCjgxRMxaLPJwItzLjnnIIzjvxXtXhn9qXxbaMV8SQxX1uitmRR5UpfqPugqAOf+WfArrPif/wAE5v20PhNBLcXngC71vT48xG+8PyRa1EyAcNstX+1RrkciS3U4HQV8Qz3ELajLptxzdxO4MEg8tojnJVo3wy88EFQQAAO+P2/C5BwTxrQljMFGhi49Z0pQk1/inSfNF+Tkmi+G/F/xC4KnGjgsbXw6jtCV3D/wXUTpv/wE/VTwd8e/h34u8pIL9bSV9v7q8ITq3y4fJjb2AYk+leuPMNvkE7JJP4crnkDbg4GeeAB7V+LNvdvBcSGZTB14CkAuQuANvBPPoAMdc5r0jwb8V/H/AIJULpF2yWg3ERuRNbqF+cjaQwXOByo7kDtX4Jxj9EKnLmrZDibf3Kmq+U4q6t0TjL/Ef3P4YftLq8OXD8YYHmX/AD8oaP505uz83GcUukD9apYGSDzUYbuXUD5efTjj6ZP0qHAVkQqSVXam0cgH7u0E4PHPfg18n+Bf2otD1K4jtvGkK2Er/engBaDOTx5ZO9RgY789gOa+mdL1TTvENouoaBJFc28w+V4mDoc+pXgEDO4Y7Y6V/JXGPh3nXD9X2ea4dwXR7wfpKPu/K911SP8AR7ww8a+F+MaDrcO4yNVpXcPhqR/xU5JSS6c1uV/ZbNYtEeVI3dAh5ABHBGTxxxnHPpXN+LfDtv4t8NXmg6kG2XkYh3MQ2zgFXxnBKOAQOhAxXRI0ZYLF8yA4UbRgD+EEfh9OO3SiUQ7MsqkHPCn2xnP4nHp6V8lhcVVoVYV6EuWUWmmujWzXp0P0rH5dh8Zh6mExcVKnOLjKL2cZKzT8mtGux+OXiTSZ/D+qXumXqeWbKYQthuMoQNoYDPGM8DpxxXrn7O/i4+GPiFBo942211hVtGyMjzFx5T8Af8tMA8YCk9ARXX/tT+Frew8Z2/izG1L+PDuSd2+D5DyMYyhTH8sV8uLG+mMHiyPM/eI/TJA45IBb5SvpjrzX+vHC2eUuJeHaONVl7aGqWyktJJf4Zppeh/zecRZdjvDDxFqUaDblgq143056ekop/wDXylJKVukmj9hSGMjR7uFKg52jbtHtgHr2IHbtint9nDNl1UL8pLemcAknoRgZ9eK5LwZ4lj8YeFdN8V5/4/YFY5xxLysgHfHmBiPY11zeVHalegwCuBgYB7YBJP3s4x7V+MypzhJwmrNafcf755PmuHx2EpY3CS5qdSMZRfeMknF/NNMQGQpuwRkjJBH8XU4A6fh6Vk6pYwaxYTeHb5sW93G9s+OTtkGzgjOCucjHTitJ0RWK/wABBxt4B+mOMjgH2x9KY0Zk2xMpXAIwucDI9Onf9enpN7ao68Rh4VabpVYpxas09mtreh+SOu6Te+H9Rn0DVG8ma0uJrZyzAYaMsCU6cfL8uDzxha+hf2XNflsvHV14bb5DqsDDaoP/AB8W6iRTux3G9Me/HpWb+0loJ034jRa3H8sepwLOX24AeP8AdyBNoH93ecn+L8/EPBWvy+FfEWn62iDzbe4iuBjgtsYHY2MDk8nk9xiv3ypbNMqut5R+5/8AAaP8CcE5+G/iUlNvlwdez7yot2b/AO36MvxP1ybcyRmNcgqpBx2HAHtzjPHGOPWmjyxIY0YZySCOAPccc+mM8U6NoJT51nhkYKFx02OoZWwB3GPwNTorusZHU89u/HDDnIPfHFfgSP8Af5q2hBL88QbkjIG1sEDsPX73bP4V8yftOeEl1TwJF4gTYJNJcmTOdqwXXylmwf4ZAOOnzntX0yixFFfHPJHzEFc8jkZH5f1rM8R6ND4m0W90DYr/ANoQNECyjbHI4BVvT5X2npxjgV3ZXj3hcTTrro193X8D838XuBFxLwxjsitd1abUf8a96n901F/I/IOK2wnl26hwuOAduMYYDHHbJ+lfq9+zv4vk8WfC+xMybZtNzps+MKCsAHk4A7+WVGe5BxxivylmsZLBZTcqSIyApIyFb7pAJ6OMYXAP58V9gfsheJBp/inVPB1y6L9ugSZCSWzJbHAx0U/uy5JAH3RntX6P4v5MsXksq0VrTtJemz/DX5I/yL+gxx68l4+o4Sq7U8VF0X6/FDTvzxUPJSZ+hW+4WU5y3GSOQQB0UjjGMfrWfr+i6V4j0mXQ/EdqlzazAeZG44HPylcfdb0YEY7GtV1JZUCtgZDAKRg/L1P4cADtUBWDy3xGBsG4L1GAOwA7duP6V/HVOpKElODs1tbSx/uxi8HRxNGVDERUoSVnFpNNPRpp6NNaNbWPy7+NfwR1L4YXqarbMbvQXOI5sESRnOfLn7bgBhSvyP1AHIHzwYor6ya31BYzBskQo/zJJH02OoU5yOOBjGc8dP3Hv7HTtUs59P1WJLi2lxHLFKMxuhXv/TGP4TxX5G/GvwG3w48bzaFDmSykH2i1x1+zyfdyM43L9w8AErmv6y8KPEipmi+o43+LFaP+ZL9V5b7rY/xO+mN9FWlwdUjxDkK/2KrLlcP+fUndpJ9YOztfWL91t3if0s/8EUP+CzN3p+oaD+xB+2BrJurW4li03wZ4tvJfNbcxEUGj6pMx3F9xEVndMSXO2CU7zE0n9ecjBWZT1UkEemK/yYNTt4dQ0ifTdWEc8M8TRSpOPkdcjI/3CTj/AMe4Nf2Lf8EMv+CuOu/F5tP/AGF/2sdXlv8Axfaxuvg3xJfMWm120tk3Np1/Kf8AWanaRqWhnzuvbdSz/wCkRyPL8t4seGSSlmuWx85xX/pUV+a+a0vb+cOCeL+dLB4p69H+h/UODleOM07oCenah1ZBgDpRwUya/m9H6mLjByaQ+1KcenSo+KAHtxjoBS59RS8ZB6U096AA7aT5PalO/uBSfN6CgD//1P7p84pO1IMbc04DA9q+PPYAYAGaG60dv8KQlfT8qAGtx9K8D/ag/aT+E/7IfwM8QftB/Gq8e00Dw5befIsAElzdTORHb2dpHlRJdXUpWKGMlQWIJKqCR78I3ZwIl3FjtAHvX+fp/wAFnf8Agoqf29v2hV8CfDS9+0/CT4b3MsOiNFIZLfWdWG+C71orGQrQIu+209iZP3PmzKR9oCr934e8GTznG+z2pw1k/LsvN/hv0PnuJc+hl+GdR/E9Ej8/v2sf2nvi1+2p8f8AXv2k/jbti1PVAttZ2KsZbXSNIhLtaaZbHo0cRYtJIAvnXDPJt+YAeKeDfBnjX4jeNtK+HHw406TVNd12eOCxsbdBukc5Yxsz4CJGvzyySYjhjUs7bRXMXN9cWixI/wC+deFRFLsxyQFUZBZmzjaB6DBr+rj/AIJ0/sM2H7Jvgq48efEKDPxH8TwBdQOQf7HspAHXS4m6eaSA164PzP8Aul+RPn/W/pHeP+U+GPDP16cFKtK8MPS255JLV21VOmmnNrXWME1KcWfn/hp4eYzivNfZXtBazl2XZdLvZffsj2j9jb9knwh+x78KR4S0SWHUfEWsGG48R6tGGxd3MJZUt4tyq32K1BKwqR8zFpSAzYr6/VY0JjjH38fLjueOD3OB0/TFJNO8EmVGW+6D1zjjoT6H8P0psiEZQbR/CpJ6HIwTjAx2/Ov+a/jTjPMuIs1r53nFV1K9aXNKT+5JLZRikoxirKMUoxSikj/UPh/I8JlmCp4DBw5acFZIjDTugSUD5h83cdMD5eB34+Xj1ofOQtxhlT5V2tj1/wD1Zz+mKcWmDKVX5XbGTggE4BGPTkbcUyF5XCoCBhODwBzwACB144/+tXzB7K7EokBdW+U7WBRjnG3BCkdAenGfT1quyQOhDKu1s5+XbwePYdiBx1+lWAY0uSlwQSozgEFSpwPyP4Cokyh2sSoO1icgc456jHPQDj6ChC80LhvMJI+ZiWYjP3s/U4x09O/tSeQA4WbjoORnjPt6/Xj0qUsPJP7on5AQucYUjJ4A6duOoHaozujUuyh8LgsPvEcHg9Rxnp+XoFRfYhSFTcqxBEg/5a8hsfVAD09MV5z8Uvgz8Jvjrpf9kfG3wvpfi218sxo2qQrLcQo+Axgu4wt1CcZw0Uit3zjr6cyrGfLLdDuUk/THoQPXkdQMVYI2nDZTAA5AA4PPoR6d/b0r0MqzjF4DEwxuAqyp1YfDKDcZR/wyVmvlY48dl9DE0nQxEFKL6NJr7j8Qvjh/wRh+HetQLrH7OXie48N3wYsmm68W1HTlDKAscF1GBdwKP+mi3B6Z9T+Nnx//AGRP2h/2YJWvPi74WubTSUdQms2JF5pLlSfJP22IFYsn7scwicenXH9pm9imc4wuc/3QAPQcf1FJ9njjyqYxKCkybQVkVhgh48FWVgTlWBBHFf3l4S/tG+OchcKGe2x9Ff8APz3atvKsldv+9VhVfofz1xl9GPIMwTqYC+Hn/d1j/wCA9F/haP4KUmkuLbfaqZA4BXGG/AfwbAMYYc9+K6zwp448V+DtZ/tjw1dPCAyJMqkMrMmV2shyD1IBK8dRzyP6X/2k/wDglF+zl8Xrq48WfC4p8NPEjsZd2mwF9HuOMBbjTlZBb9B89oydyYXr+fj9o39kr4+/sqa0LD4y6GsFheym2stbtGF3pF87tkCK5woRyVLGCdYpgBkriv8AWTwc+lJwL4k0f7PwVRKtNWlhqySm+6itYVV19xyairzhDY/kTifw14m4OxccxpOUfZu8atJtcvzVpQf3dk2fQ3w+/aa0TxJJHb+LI00y7B2+cIx9mcjIVcZ3Lng5OVGCcjpX05DMrRRmJicjcCpwqrt6qfTrg9xjrX4uB7UKVaQrLvZWRTkKW9sFuF7cAE8V7j8Ofjl4j8BFLGUfatKiyWhZidu45zE7EsvPU8LyePT4jxQ+ipQqKWN4Y92X/Ppv3X/gk/h9JPl7OKR/dH0ff2iOJoSp5Xx6uensq8I+9H/r5COkl/ehFT01jNu6+tf2k/DkusfDKe8t8sdNeO4GFLbkz5TKRxgfNnOcDANfmrbRr9oi+8c5BwfmLDJG0HgnGB9B+FfrFp3iLwt8WfCV1b6Hchlv7bypFbiaHzlKYkQE7cHPbB25FflHfWstvd/YyCJ4nMXkZdQC7YA4A6YHYHjHA6fQ/RRzDE0svxmR42DhUw9RPlkrNKa2t5OLf/b3ofG/tGMjwNfOcs4syucalHF0XFSi1KMnSa966/uzjH/tz1Ptz9lvX47vwvf+GBtd7CcTwlGDYjuBtYDBOdrqCT6vX1SQsB37gOjDb7dl47nqPboAK/Oz9mbWLnS/iimnuQseq200LA/dwyeam3PGd8ajpuHNfonHOfNBWMOHOAF9McAjHbH8hivsuNMH7DMZpbSs/v8A+GP63+hTxhLNuAcNCq7yw8pUX/27aUfupzhFf4RoEcUiAJhwPmHIIXsD6ev8uKgi2LEWnG7fndt+UFiOTkdOmeBzU8DwRAHeEDZXocc+3U45Ht6d6EUuzNEvl4JPCgE4PBH90A8Aentivlj+s7HzT+0/oyXvgK21pTul0y52uSNqrHdIU3YXsJI0wfU1+f6JEI9kcn3SV2ED7v8ADkHB29iemB61+sHxG0hNe+HutaOVWV7iymeNFH8cIEqAgY7oB6V+UcTXDqDaAqMByoPy7BhuRnPHv2Hev2Pw5xrlhJUP5X+D/wCDc/xu/aB8KRwfF9DNKassRSV33nTfI/up+yR+oPwb8Qx+I/hfpN9ncsEP2N9hOd1t+7VsHPHlbCa9O42iVT0Iw3cHaSx6c9MgYHcelfLX7L+syz+HNW0Yqga1uYrobuOLiMo+McceUvpnI4FfVCxGPkj5lXBOBx64xjpwOnQCvzLP8KqGNq0l0f4PVfgf6WfR54q/trgfK8wk7t0oxfnKn+6k/nKDYp8p0WTlNp6HGNuPT06enHemT5ZVTLAp0HXuNp47dMf4UpWcgRscu2QGHtwQTj24wMEZ5qV3TaxYAKH2nJxwPXnnnA/lXjyjdH7IfmX8efDUugfFDUzZIfKvH+2xbfl+WZVlx6ECQsoHHQiuf+D3i+Lwp8U9E11dsUUV1ErySAYEEuIn74BEbEe1fQv7VWghZNI8TlTho5LOUjhQI281eTjBIlY/hj0r5Ct1VE8uJljQx7lwxJxu27cdcf4fhX79kHJj8ojSrbSi4P8A9J/I/wACvHfLKvB/iVjKmDVnSrRr0+y5uWtFLyjdR+R+3pjgRjFN5ZKHJ2tgcAHrjIwfr09zT2JVn8ofKe5IAz/snr1H0A9q5/wJrk/ijwXpHiGVlabULK2ncAk/O0ID9h/y0yOldL5ZMixsQoA2sAeOc8EHGOOo4r+Fq9CdKbpT3Wj+Wh/0H5Zj6OKw1PFYf4JxUo+jV1+BGqRuxbJYgdOBj5QQpPfjv/KvjX9sfw1nQ9E8WoqO0Nw9q5z8+1gZI1GP4V2vwfp7V9lz+S0u7O5im4A4JBP1A4+o6jrzXz3+1XpsWo/By5vZBuisLy1m+UjAViYs9+fn/XOK+s8O8dLDZ5hakX9pR/8AAvd/U/CvpWcPxzPw7zWhJfDSdT09k1U/9s+7Q/LlUlQrGyrGZFICxsACrD5jtY9uvqOMcYqeK5v0nttZ0i5u9OvrCWG4tLyykNvdWtzA4ltrq3mQq0U0cqh4pIzuDgFcYxUcDK8YODGx7EhSW46LwWH6cdqvLDeWcdtLeWrRSXtutzbmRWj8+CSRlWaIkj5DJHKhZQw3KQMbcV/daP8AnXU7arQ/v7/4I6/8FObP9vr4NS+CPiddwxfGDwPBEniG2WIWw1O0Y7INbtYR8ojnI2XUcZ/0a5yhVI3gMn7J9fYjsK/y0f2dv2ivi9+yd8bvDf7RPwNuI4PEPhi5MkMMjE2t9bTYju9Nuwc/6NeRfI2PmjcJMmHiRh/pTfsn/tO/DP8AbE/Z68MftHfCRpP7H8R2vmfZp123NjdwsYruwuV7T2k6vDJj5SV3IWQhj/H3ixwF/ZmI+uYaP7mf/kr7enb7uh++cF8TLG0PZVPjj+K7n0UT2NJ8p60HqOMZ4pGbjnjFfjx9wPXbjI6GmEAZ/pQcjrQefrQANljkHFN2N60MGzwKT5/7op6Af//V/ulGAMmlwaXH+FNYMMA18eewLhRwKcUIGccUwdfavNfjH8W/h/8AAP4T+JPjd8WL1dN8M+E9NuNW1O5IBKWtqhkfYmcvI2AkaL8zuVVQSRWtGjKpONOmrt6JEzmormeyPwz/AODgX/goFdfs8/Au1/ZE+FGpNZ+O/ipayrf3Fu6rPpPhjJhu5wScxTag+bK2bGQv2iZGV4BX8PNtbwxx25ijEUC7ESIHYsUaDgLHgHCgYAHA246cD2z9pH9oj4k/ta/H3xX+0/8AFkNa674vvftK2e/emn2MQ2afp0ZVAClpbARswA3ymSRvmdq8Suopmi8gfIpSVAAAm0n/AGgO2SMjjPcGv7t4D4Tp5Pl8MMviesn5/wCS2X/BP5x4ozx4/FOS+FaL+vM/bP8A4I+fse6r438bzftW+NLB7uw8Ny+R4bheHzvtGqoVEmoEcgxWJxHCSpBuSzAgwmv23+JX7TX7OPwgne1+KHj7w/ossO0G0uNQimvflAH/AB5wmW4JH/XP1r+OvxN8dPjN448G6f8AD3XfFept4b0m2gsbDR4bhrHTkt4MhU+y2vlRu+TukkkDSSlizNuJavIYLGz0oGC2ihiUAcwYQcYwc/KTj0znk+lfxb4tfQjxPiDxPV4i4uzZxpr3KVCjDSFKPwpVZv4nrKf7i3PKVvdsl+28HePFLhvK45fk2ETlvKUnvL/Cui0S97ZH9W3jD/grf+xD4fXfouta54o3Rsc6Pok20MmFUeZfyWQ3ckfd24yMivDtf/4La/BWxjkk8IfDzxNflcAG8utN05COh3eU93gj0APav5wGR9486HMcahAEI/iHzcseCdvtgcj1qVXk8uQyoY5IspkAhV+U5U89OR834dCK9LJf2cnhdhEo1KVavb/n5Wf/ALhVH8Ejix30m+LKrfJOEP8ADBael7n75v8A8FxrWQBU+EEhiQHYG8TqGYAZwTHpZA7Djj1qO2/4LkRR3Ymn+EEoHys6r4mXK57Etpgz1xx61+Ak9zDGw8+aMMwXC71BUcKB97GMkHAPBAGMDJdFq2mJJHH5kB8o9FlQqMn5fu9SfQD19K+5h9AHwmassl/8r4v/AOXngv6QvGP/AEGf+SU//kD+jDQP+C3vwpuT5vjP4ca7YA7N5sdT0282EgfLiZLXd6Absn0Fe1+Hf+Cvv7GWuF4tVuvEXhxd339Q0ZpIyxUYQNpst0eP9wD8K/lmS7nZkFu6mPp5gTKqwCnJI3cHHHHy8Upa2tbgRnMjZO5Thdy7cfMo9PbHb618dnP7OfwvxacKWGq0P+vVWV1/4O9svwPdwH0mOLKFnOpGf+KC/wDbeU/s++G/7Zf7J3xSmFl4I+I/h26upcGK1lvVsrhiVztS3vltXY9BwD6DmvpxI7/7INTmt5nssApOEEkTqw6rImY8e+7HHXFfwWIkFxbeVet5qL8pDoCu7AQEq2ThV/L15roPAPjn4j/DO/lv/hV4k1PwxdcD/iSXtxZeZjBGREyow6k5UgDPoK/AeLP2VuW1LzyHN5w7Rq04z/8AKkJU7fKkz9HyX6XmIjaOY4NPzjK3/krT/M/u1hlSUDy2HQlR2546deOPxqTyUzsBySQo2ryOmeBkdeMfnX8pfws/4K3ftl+Ao7e18W3mlfEGwAQsmr2ghvVQjJ23th5Mhd93DTxyH0FfqX8Hf+Cvn7MHjydLD4mw3/w51FsEG/DajpbZwo2X9sm+IcfMZ7ZAo5Z+eP408S/oBeJPDilVpYRYukvtYZ+0/wDKbjCt6tUnFd7H7jwt9IrhnM2oSq+xk+k1b/ybWP4n63BmV8K24f3h0weMcAA8Hio8naCx2pn8Tk47n1I/Hiuf0DxRoPifwrB4y8N31nrGi3K7rfUdPuIrq2lUDGUnhZouxBBOe3HSuj2omNz4YA8MxyQvYdfp3GOnpX8ZV8POjN0qqtKLs09LNbq3S3boft9GtCpBTg7p9h6+YV/djYHJzjce3AAPv2P4VjatpGm69od54d1y1t9Q03UYnt7qzvYUnt7iLcBsmhcGORf95cjnBBrTkjAfMqqeevXjAI79d2PTkdKU7WTDDJ+o+9kAn3+XPH4VFGrKnNVKbs1t5W2t6CqUo1Ick1dM/Af9sD/gkIkbXXxC/Y5jJYhZJPCF5KA5IIUnS7mVv9rP2W4bJ5Ecp4jH4R6hbaloep3elavbzWWoafNJbXdvcxSQ3EEsTfPBLGy+ZE64OUbnrX96U8ETsVlX7+ct8uO+BjAJJOT7V8Tftg/sLfB/9sKwXVPEpOheL7JNll4ltIY2uRtC7YL6L5Rd2q7RhWPnRkZjkA3I3+qf0Y/2i+My508l8QZOtQ0UcQtasF09olrVj3kv3q1f733Yr+RPFf6M9HEqWP4eXJPrT+y/8P8AK/L4fQ/kr8K+Ldd8D6vFrmhTtbSkYBGF3DB+UhshyxVQVK9hVHXteHiTXJ/EChN97KZXjTHlAOxOVG5TsGQFyx+nevQv2hfgL8Yf2ZfiJJ8Ovi/pS2F2cyWk9u5ms9QteMXenzMF82HOMjaJIyAsio25R5E0Led59woIB4YqCNw+6SQBn5dvQe/av9jcoqZZj1TzrAShUVSC5akGmpQ3VpLRxTvbtrbqfxdjsfmVCh/Y2KlKNOEnL2b2jO1m+X7Lasnbeyvsrb3gbXzoni7R9fdDGLS4t522K/IidMnIAHKDpyME9e/60ywCB5LaU4KSso/AjtnqK/HT97I0cTt91NoGADgDcDkdMrjp14IFfr1pOrJrGk2Gq8Bb62gnAO1stLCjj2PJ6mvgvEnD2nRqLs1+Vv1P9L/2cWdp0s1y2T2dKcV6qcZf+kwNCRjt8xQ/O44b72zk88cYH144HpT8RLtxjylCjHHUepAxyB1x7U1Gmf8AeY+bp685+QZ/+sKepG1iowcZBHXPbPTHHP44r8zP9OEV0k8m4heT7olUbhkfKT04x2/DH5V+SPiXSP7E1e90i4ZpGsZpYJFLDAeGVoztx/Fjj7v3a/W+9Zpbby8llx68Zx688AdvT6V+Z/xssI7D4p63ZI+RJdvdjBGAJY0uDlRjJ+f8Riv0Xw3rWxNSl3V/uf8AwT/On9ovkaqZBl2ZW/h1ZQ/8GQ5v/cK9LHe/sp34s/G2o6XJJlbyxZ/L5A3wyRyjIHtv44wOwHA+/ZlbcylSyfMQSRwcHHzE8c+nHPavzW/Z0lYfGTTI5psCc3MBXODte3kHJGQDu7d6/SRUcY+YbsblJ42hv7vt6jHPvXncf0eTMb94p/mv0PvvoC5tLE8BujL/AJdVqkF6ctOp+dRiFYoSqqcDvuwCPlwfu43DH6+2Kk8wxxHYMkDI3cfTj0wOR2FKjTBskMCQWGDj5TwBjp2GOOn5VGsvBiOAQp44H0wOnQZ/+sK+LP7YR4X+0lpc2ofCq/nBBXTZreYZXjaf3J4I5/1gPPAAr86lYRrskKyt5mdzAhsHpwOMn64JHSv1W+JFnHqnw916CRNwOm3PHIbMcfnDrx1Qdf0r8o5n+ciP/VOGyQgHyjPAxkDr6HPA9DX6/wCG9e+GnS7P9F/kz/Hr9odkMaHFODzCH/L2jZ/4oTl/7bKC+R+pn7MWqwav8G9PtkYTNp09zas+CMbJvMQemNkgP0A6c178kiM4VeST0IX5uMHHUHdxj6du3x3+xzqs91oGt6K4VVsrm3mxGB8pngaP8AfJBwOnNfYmZVQHLHHzN04GMDpxwD7Y/Wv5h8QcD9XzvE07fav/AOBe9+p/pl9F7iD+0/D3KMV2pRh/4KvS/wDbA82VYl5XDDnGfr8uf89e+K8T/aRnhi+ButJJ9+U2SR4Y9ftSEgKMdAM+te2y4XCcrn5fmGMdeMdxx06V8r/teazb2nw7stH3BJbq/Q/wsoSGKTIKnj7zqcEHtnFYcD4R1s5wsV0nF/8AgLv+SOz6SebwwPAGcVp7OhUh/wCDI+zX4yR+c1uXiPmSDIjcKUEvKrnGQuMjliSozwQcDrX66eCf2Zm/aY/4J0fDuPw2oXxr4ftNYl0GfcEF5G+rXpk0yVjx5d15YMBziOdVYfKzivyKt0giaMIAscZyMEblG47uOOMYxz+Xb+kb9jXQ7jw5+yB8MLC9cxzSeHYrs+v+nXFzdr344l4Ir++cBRjUk4vax/zJcZY6eHoUqlN2kpL/ANJl+B/NiskcwWURTW4O9T5oVDGVJV1dP4XTayupAKsMGv3C/wCCF37fp/Y2/aXHwK+KF4IPht8WL2GymM0hMOmeI8JbWOoZyVSG9XZZXbbRgi1kZlWOTPzd/wAFJfgCPBPja1/aQ8J2ZGk+LLjyNbjACC21pkJjul8scLqCRndnj7TG5JzKBX5p6haWuo2Mllfwr9iurdklTGE8tztbd0xlfTBUgY9vF4gyKljsLUwGJXuyVv8AJr0PsOF+I7ezx2H+781/Xkz/AFmMMOHAXHBA9j/SjAzzX42/8ETP29b39tb9kaPR/iTqP9pfEj4ayQaB4kmY5lvovLLaXq7/ADvk31tGRM+cNdw3AVQoAr9k2IzX8B55k9XL8XPB1/ii7f5NeT6H9U4DGQxFGNans0BGR9Kcdo49KQDPXFGE/CvKOsOvcUuD6imfN2o+agD/1v7qSApxTDw1LxQckV8eewRuyIuX/L2/Cv5Lv+DlL9siS5Xwx/wT88FXX7q7W28W+MdudrQRykaJp0hUkYluIpL6WN0BAt7f+Fzn+qP4geO/CHwt8Ca38TviHerpvh7w5p11q2qXThmWCxsYWnuJGCfNhY0J+UE9MDtX+Xb8bfjV4z/am+OXjH9pj4gRywa1491ebV5bVmLtawN+7srDcAuFs7FILcFgOIzgZNft/ghwwsVj3j6q92lt/i6fctfLQ+A8Qc4+r4T2EH70/wAv60PMBFMMwjJlwCyDh3DAbtwzggDoABnOCCKu+H/DniDxx4ih8K+BdOvPEOovk/2dpkL38rbOf9RbrIwAbnBAxu9K+gP2O/2eJ/2s/j5o/wAHQ0sehqX1TXLiL5Xt9HsirXDq4LN5k5aO1iIzhpFOPlr+xrwj4S8J/D7RYfD3w50Wy8NaWpGLDSbeOyg+70McKx72x1Zyx459vnfpU/TPy/w1xNHKaOE+s4qpDn5efkjTjfli5Plldyal7iUXZX5knG+nhB4F4jienLF1KvsqMXa9rtvqktNtNfkfy0/Dr/glL+2T8RIluPE2j2HgSzkjDLN4gu44p9zKDxa2YuLndg8JIsVfcngb/giJ4QjuFm+KnxM1DUGccwaBpsFioxk4FzfvdMwPY+Qvf1xX7rQw21u2xFKk5HYHp7j0yf0pJTGETyRhVAxuP1HAz2zjHH4V/l7xn+0Y8TM1lJYKtTwkH0pUov8A8mq+1mn/AIZR9Ef1rkX0ZeF8Gk6sJVX/AHn+keVfgfmf4W/4JM/sO6FZ/Y9T8M6j4kZuRLrWu3p5PUNFp5soyOMdPbivdtG/YP8A2NNBwdM+E/hR1TGWvbJrttuOh+0vKc8DknJr64cqwwAR5a8bjxxwRx27jgipeMiRBjAA9PYDj+n9K/njOvpE8fZg74zO8VJdvb1eVekeblXokl5H6bgfDXh/Cq1DBU1/25H87HhFr+y1+ytZiOKy+FPgmKNBnCeHNL54HPzW5+779upzU3/DMv7LtzF9jT4X+CQmcYPh3Tc4OMDH2f7uR0xz+Fe3fJvO4ce38RwTnPfI4wKWVjIRHISDwOnGcnpnuO3I4r49+JHETd3j63/gyf8AmeuuE8q/6Bof+AR/yPkvxT+wn+xf4qYT6l8KvCcYAcOLaw+xZXH/AE6NDjv09vpXgviP/gkv+xH4h0sR6RoGraC+3dv0nWrxdu0AcR3hukHPPTvg8Yr9LfNWRCLZt2454yQuDkYH19j0od1O5s8/MoyepB9OOMAZ/oK+uyT6Q3HuXW+pZ1iYJdFXq8v/AIDzcr+aPJxvhtw/iVavgqb/AO3I/na6+R+GPjf/AIIieArlpv8AhWnxG1SwTa4EGtaZbX4xtyM3Fo9tKFOCf9WevQ8Z+N/iD/wSH/bI8LRfaPCaaF42gVSFj0nUhbXChjtKfZdUW15bAO1JGyMAV/Ut5Qxlsop9cjgY7H3GBSvZ20sBhkXjkgHIx1HckYOSPp9a/oHhL9ol4nZW4rE4mniYr7NWlC3zlS9lN/ObPzXO/oz8K4z+HSdJ/wByT/J3X3I/hX+JXw8+JXwj1NPD3xj8P6l4VvXJ8mLV7aS0SUJ1aN5R5MmDj5o5GHPGQK464iupZTBGNqs2M+4BHPA4xnAwOOcYAr+8nVdF0zxFodx4Y8RW8GpaXeoUmsbyFLm0lUjo8E4eIgdhtGc4r8vPjh/wSG/Zi+Jwm1T4Xfa/h1qz5P8AxLmN5pJYnJ8zTZ2zEMBh/otxEAD9w8V/cXhd+0+4czCUcNxZg5YSX/Pyn+9perjZVILsoqs/0/AeLfoo5nhk6uTVVVX8r92X3/C//JUfzb/Cn4sfFn4IeK/+Ey+C/iPUvC+ozlDM2nXGxbjBbAu7fEltc7QSdk8f8QwK/aH9nf8A4LR3YuofCP7U/h+N40CRDxB4di2ycKv7y80zO1u7s9rIu0fdtz0HwN8fv+CdX7U/7O8dx4l1DRI/EvhuMnzda8OK15DFEF8xnubUCO8tQqr8++IoD/y0OBXwxZtFPYi6SXzYpDthddgj44x8oweAAwPIA7Gv604q8NfDjxYyv6/iKdLGRaUVXpSXtYaaL2kPeTiv+XVS8V9qmfjuU8VcT8IYr2MZTpNfYkvdf/br0t5x+8/ue+GXxa+Gvxh8IJ8QvhJ4gsvEejySCMXlhIsipIcERSptWWCUBhmOZFdc8gV6OU2oscTbVACDAGRkE474A6H8ulfwtfCr4ufFb4E+NH8d/BfxBd6BrYLRyyWzqRPGpz5d1A4aC6hGOI5o2UEA8MK/oq/ZM/4K0/DD4uSW3gj9oeOz8B+J5pPJivo3ZdBvJP4QJJWMmnOeyTsYeOJVyiV/kp9Ib9nnxFwvGeacL3xuEWrSX7+ml/NBfHFL7VNXsm5U6cVc/sTw2+klluauOEzRKhW7/Yfo/s+j07M/X/y5iQkfcdByOAefw6AU0+SF+9h5MZA+YgAduo9h6UXUZtLnyL1fIaIYaOXggAZJIO3rt4AznHFOcSRFoDIWdcYxwAeTnHHt0Ff519D+lU+x4x8c/gJ8M/2ivh3P8LfjLpf2/SLiUTQNb4S7sLnbsS7spiD5Nyn+6UkX5JVeM7a/ky/aw/Y7+K/7IPi+30DxrjWNDv3l/snXbRTHBfLDhirRFiba6jV1M0Lfc6xs6fNX9lsyQLJs38dmOT16hemcAemK/E//AILbIzfBfwBf+UGC+Jb5GK5O7zdKYjjp/wAs+M8gD2r/AES/Z6+OmfZTxbh+D4VObBYpzvCX2JxpykpU/wCWTcVGX2ZR3XNGEo/zZ9JDw8y/GZPUznltWpJarqrpWffy7dNND+dMFJJImT5kkIJ4wHO75Tnj5g3TBHT6LX6jfCbVf7b+GOg3QXltPhjb5sf8e5eHnIB/g6fXpX5dwo+QVdS2/wCcZ3JF8uMY4VeentX6V/Ats/CPRZ9oGY7lcAel3N0JyRjPPNf7XeJNGP1WnPrzW/B/5Hk/s7MdOPFeOwy+F4dy/wDAatKK/CbPYQiSY/d+YQCeR0BBPbGTnI/pUSFnttrc4UZGCOnOOOnB/KnAswdIlEm3IQdfm7fKTjAx+lCMoC7GQqmMNn8hnjP4duOlfjp/sEhZ1iaLfDwm0EYAHP6fT0r87f2kbCWz+Jt1Kg3i8tbabaQSrbYVjxj1+UdSOO1foaqwjAdsKcEgjGM/3c/r9K+D/wBqVNnxA0eYL5iS6cg4bOW82Zc9h0H14Ar7LgKry5il3TX5P9D+LPp74FVeAvaP7FanL8Jw/wDbzyL4S6g+k/FXQDFH5H/EztB8gVgRJKEKngZKh+SOx9a/VV1RCQTs2/KPl43DoB2yB0r8mvASLYeOdL2sGePUbZgCoXISZckkE5P8vyz+s9ysKXU0KlQAzL1xg7m4yO2cfj6V6HiPFLFU3/d/U+A/Z1Ym+RZjR6Rqxf3wt/7aRy5VcQKPLcK2V4PoRzjjA78/0SRImYmQ7UOVBOBlfT0xz92pCwZi+ATuwQwBzs6jnbkHp9efaoolufMC/Mu5B785XIGTzj1r88P9EiRba3vtlpdR4WdWjkx6OvlnAJAxz06dq/HDyXgBjkVR03KBn/Z7DplRx+Xt+x8ZRrq1dcbi6nhR8uCBxxwBjpjFfkb4qsY4vEt7EQv+j3E8asAuQqyMOFPY/TkgDFfpvhnUtUrQ8o/qf5m/tIMuvhcoxS6SrR+9Umvu5WfWf7H2qwP4h1/R4Wz59nBLkcK3lybCex6yH/61foDOwSUyyc4+UcY7chfT/PPavzb/AGPFkj+J+qmXJ3aRMWx8px58HTk49hiv0dlZXcj/AGsnHJ5A6Z5/n9K/F/GKjGOe1JLqo/8ApKX6H9H/AEDMdKr4cYWk9oTqxX/gxy/9uYIqF9gAV2GMhehwflI6fQ8elfnX+2F4mgvvFVh4XRlkTTrfe4wAwluCHKjd/wBMkiIPTkj2r9Cb+4s7DT5dS1mUR2tqjy3DjI2xopZsr7BRgfhX4xeOvE2p+NvFd/4svTiS9eSdssMxKT8ijP8ACqBVUHA2gAV6/gfkbr5jLGte7SX4y0/K/wCB8D+0Q8RoYDhajw5Tl+8xc02v+ndJqXy9/wBnbvaVtjkruwvtSt5dK0ODz7u7AtbaNF+Z7m6dYYEPqDLIBwMYHFf1waN4a07wZplh4A0wp9l8PWVtpNuE+VPK0+CO2Xbjpnys/iK/ny/YK+Gp+Iv7Ufh+81GAtpvg+KTxPeBmJQvany9OjOBnL3skTAc/LGwxxX9C6nyYt27zF2Z3YOTnuQc5zg9cc1/YmVU7Jy+R/gT4gYy9Wnh19lX+/wDyt+JyPjr4f+Ffiv8ADvWvhF46Vn0bxHZyWN4I8b4Q3zRXEeR/rbeVUnjPPzxgdCa/mB8beCfF/wALPG+q/DH4gqIdc8P3psL0rnEgXa6zxccx3ERSWPsVbPHb+rFkwzM6LGFG1NvbHXntnnHpX5N/8FP/AIOR3WmaB+0bocR861MXhvXSvH7mTP8AZVw5/wBmRpLNmPXfD6VtmFFNc66HJwTm3sq/1aXwy29f+Dt9x4x/wSz/AG0f+GEP20vDvxX16+8jwVr+3w14x3krFFpF7MPLvmwCF/sy7Mdxu2ki3Nwikb6/0gyjITFNwV+XjpxX+TPPYw3CSw36f6O8X2eXKpsaJk2lVL9mXg89yOwr/QC/4IV/tdT/ALUX7AuhaB4vvRdeMvhc/wDwh2tl2BlnSxiU6XetuZnb7Vp5hLytgPcJMB0Nfy5468LqVKnmtJar3Zen2X8tvuP638Nc4+LBT9V/kfstzjH8qTAbt/hQB/FilxX8zH62LhR1FHyf3aXA9vyowPb8qQrH/9f+6bGcUhOME4p+cde1NIbb/L3r489g/nI/4OUv2lf+Fd/siaD+yzoz7dS+MGqlL0YKgeH9CMN5f4kU/KZ7prK1KkYeOSQdq/ihbMzZRFaRS4f5ecuOecrzzkA4Az17V+s//Bb39oKT9on/AIKReOV0mdLnR/hxb2/gXTdn3fM04m51aRl5Af8AtCd4D03C3Qc7cD81fhP8LtX+OPxb8P8AwS8Glra/8U6rBpSybdxt1lb99PIrfwwQCSVu5VSenNf2/wAA5fh8l4fjVxclCKi6tST2irczb8owWvoz+feKsRPMM09jQV9VGK89vzP6Jv8Agj58C18A/s/X/wAbtet/L1T4kTCS1Zxgpomns0Vrw2SPtU4kn64dBCeQBX62kgFSCCqqMKvAKg9unTt6jj2rL0nRPDvhbS7Pwz4Is00/SNLt7exsLdB8sFnaxCG2iBzyEiUe5+tXUnZsCLIGeAO2OnQ54HY/Sv8AmQ8aPE3E8ZcVY3iXE3Xt53in9mCtGnD/ALcpqMPPluf6p8BcKU8kyehllL7EdfN9X82AYqpRlwC2cZ6D72CfXgCpXUHbt4bOcYxj1z2OAfzFUftaxwebLtTKkjKlVK8dPqOxz0q1Ot4LX+0JIz9lUY80hY4Bk/xSNtQY6cmvzDlPq5zjFXk7EiTiNcv8oHU+nPy//W/lTcZA3nAxjpuAPTrx0r5j8bftl/sm/D5SfF/xP8LQy7whgh1GPUJkIAyDDY/aJB0444GM187av/wVZ/Yb0eJrmy8U6jrJj3HGlaJfuW29NhuFgXnORkqMflX65kH0fuOs0gquXZNiakX9qNCq4/8AgShy/ifHZj4j8P4TTE42nHy543+69z9I2aPzdqkbSVYAdhwAeB7jH07YpBP5GCQEHViOMKBnt7Y/+vX5Izf8Fk/2TbJlgGjeN5lGcyLpGnxoQOfuvqYYY65IAzSS/wDBZT9lCcBYNG8csATymk6fycbtv/ITyO3t2yBX3sfoceJtr/2NV+5fle/ysfO/8Rx4Svb6/D8f8j9czcfu/MdwWGMnkDHcjt26foKnckkbjljgD8DwSRxwfpxX5i6F/wAFX/2KdU2JqviDVtDOQUXUtCu0+UAc5tPtS8njr0H419PeCP2v/wBl34jzRReA/iR4cv55yvl27ajFa3L7x8gW3vPIlbPGBt6kDGa+B4k8AeN8nputmeT4ilBfalQqRj/4E48v4n0uWeIeQY1qODxlOT7Kcb/dv+B9KuPJJjGD378Hd/8AW/z2sozIhwMZ6K3TOOP8fTFULhrmzAuL+F7Zim9TICF5IJ2SEBWHYYYilaeHduiIOVxwwHAPGB9Djjr04GK/I0rrQ+vW2hoRyxoN4bKr0+bg47H8exqDywypDx8nIJHXgYO33Ix7VCJ1E7KjDJ+63GD7Dp7CrYjDEhR045OAp+vPT2GBSasOwkZaBo7lGaOWMAxurbXA6dVIPUDp9MV8G/tSf8E4f2b/ANqGWfxDqOm/8Ij4wnU/8T/Q0iiaWQBmD39gQttdrvYGRgIp2ACiYDAr704Kvx8pOz2P4cHH5VEcgZKoTjOAMZ4zyB2z0HbGK+y4D8Q884YzCOacP4qVCstLwdrr+WS2lHvGScX1R89xBwrl+a0Pq2YUlOHZ/p2+R/G1+1T+xJ8eP2SnGpfEPT4tW8ISTKlt4h0rfLpsn3URZx/rbGb5lRYrjaC2djyAbq+RBumhd7lQyNliSMbwyheBnHPvx1wCDmv74Z7a1vbae0vVWe3vInt7iCWNZY54m+VopUcMkiMOChUggkY6Afht+2D/AMEjNA8S/aPiH+x/bxaHqjLJJP4TnkVdNuX6j+zZpP8AjzlZh8sErtbnO1Ghwtf7G/Rx/aO5dm7p5Rx2o4avsq8dKMu3tF/y6f8AeV6V3dqjBH8R+Jv0Y8TglLG5BepD+T7SX93+ZeW/qfAv7G3/AAUd+LP7Lf2b4feJkn8YeAYJRH/ZkxK3unRkYzpM8x+QKCD9kmYwsAVQwsd9f0+fCv4z/DX47eBrf4j/AAq1aHWdHuHKGWNTG1tMEy1rdQt+8t54xjMThezKXQqx/hy1zSNc0PW77whrmn3el6xYXBtr2zuYXhuIJF5NvNDIB5W09QVx0IzmvVv2ff2ivi7+zN4+X4mfB3U2tbyVUW+tXRmsb+2iIItr6AYWRBnKsCrwsd0bqa/UvpSfQbyXjmnPPMh5cNmL15lpSr3V/wB4o7Se6qxV3f8AeKd1KHynhT49ZhkE44HMb1MOtLfah/h8l/K/lY/t3jkiuEjZTuVsZJz8u75RwPukjqPYnFfjV/wWy2x/AHwRFIpzL4vkIbGQWTSbnOBlQcjHBNfcv7KH7Y3wo/bA8KXGr+DFOja/pEUb634dvGVriwVhtMkciqi3FluJWOdU+UYEqI7Yr88f+C3F9b2nw1+HGj4yJPEWqXBjUHBkg0tI1B5J4MgwR/e9eK/zD+ihwJmuR+MuXZLnFCVGvSlU5oSWqtQqS0to4taxlG8ZRacW4tM/rDxc4iweYcE4nG4KopU5RVmv8SVvLtbofz5SNgvC0kO7cpJLgEb9wbK53ZYLgKB09K/Sn4CKU+EOiANxELtORgFftLk56YHOOhr81YZbOJxFazfvGRXZWA++cqVww+6TzjO0cDtX6VfAbcfhBogPAxdH1zuupVHtk464ya/3p8Rl/scP8S/9JkfnX7PH/ks8Z/2Cz/8AT2HPXUdGwNoKgYCjptHQf4Dj9KUDymHyl2wdqrgbcrnHt6D65pyRRrujYfK2Dj0H/wCzxTGAzGWYKrDGTjoOeFDDI5zkYIr8aP8AY9EQaRrcb227VQ/LuJB7HI7AZ5x6cYr4P/ayd/8AhNtIZULH7Agwe5FxMT8o65xx69Pp95W6qY9xI2/dPO3DZ68E9BgdCDXwh+1Vsh8W6aJmTedNT5ckAlriZu2TgZHbI7Z4r6/gX/kYx9H+R/Hn06p28Pqy/wCnlL/0r/gHzv4QaKPxJYGzAREuIn2x4xw65zjAHzDjoRwMV+wUqZumiY43SSA4wTw7Hgce/X8O1fkF4RtXfxDY2IjUB7mDMfG/dJKqcr3A+g4Nfr1cFZp5jL08xsn+HGTnp1+9j8K9rxI1rUvR/ofj37OOMv7NzXtz0v8A0mf/AACEeSF2M24ZIYbs4B7euOwPH50xxtKjjaODxt2rtGBz6HrkH6Z6SyFlztfy/bqF2+g6EHv7YpgIEoaTCDG0gYwp7Y4HTOBmvzY/0kJ7Vy1xCwPyM6/N3bDevfjpwOD68D8lPGZD+OdTiWMfJeXRO4YA/fMvUYJO0dPy9K/XCzCyXVvvU7hIinOABhsAYGMfQV+QWvSNqur3F0Nx+1yyOz5AwZJGJG3nn3yMA8e36N4aw/f1X5L9T/Nv9o3iYrK8qpPdzqteijBP80fS37HmyD4l3UFsWdf7HnJ2jO799CdzcnnsPbGK/RwyNFtZirfLwNxxkdR07ZPpxX5w/scwB/idqlxb4wukOeVK/wCsng24yMKOOnGMEdOn218S/iLpfwz8MvruqBHly0dpbDO6aYqcKOmAPvO3QAcckZ/KfFfB1MRxD7Cgryaikl6f1/SP1z6E+eYTKPC5ZnmNRU6NOdWUpPZRTt+miWreiVz50/at+JMenaGnw+0pg0s4jmveVOyIEPHGcqcb2Cs3IwoXqGr4EL+WkN07JjON5GY42ABb5umduc5zge2K19d1q/8AFGtS+IdTuPOmuy8kspbkbzncxI2gEgKFHyjGAK+j/wBj34Aj9oj4z2+ha5btL4U8PbNS8RleI5IQStvp4/27yZAjKOkSyseFr+juCuFYZTgYYKGst2+8nv8AJbLySP8AJ/6QvjRV4w4gxHEWK92kvdpx/kpxvyx7Xbbk+nPJ20sfqf8A8E8/gfN8LP2f08Y67EINd+IbQavOp+WSLTI0ZdMgY9U3q8l0y5+Uyqp6YH3cmxSGXgqfvsu3g9twwOB+nHpUs1413eS3UpG6RzwAcDttAHRV6AYwAMDioA0EfzlML6KDtPbPXH/1ulfqlGlyRUUfw3j8bPE1pV6m7/DsvktBY/LTH3nd9yDoowBnjHc+2PWvn/8Aax1Hw5pn7K3xMuPFlst7af8ACN3Mf2Vzs8y6nMUVkA3VWW7aJ0YcgqMV9AogwYVZkJGDnOdxAH58YFfmv/wVB8fHRPgnoPw0sk2T+LtZN3cc4IsdDRZvmA6h7uW3GP8Apnx0rPFSUaTZ05HhXWxlKmu6+5av8EfibCjoDGqGU48t28sdR97buGPnPQcA5x0r9rP+CAP7TDfAT/goDZ/DXVLvyPD/AMZdPbw3cxuyxxLrOniS+0WZ/l3biPtdmqjALToMHAr8TZcNEgnMe4oDmQg7SRw5OQTjjHBwe1aWj+IPFng3WLPxl8OrhrHX9DubfVtJn6mHUrC4S7s3P0uIk4z68V8RnmUU8fgqmCqbSVv8vuevyP6NyjMHhcTCuuj/AAP9YPcZAHPOenan4ANeP/AD40eGP2kfgX4O/aD8GR+TpXjjQ7DX7WJnV2iTUIEn8pyvG+JmaNx2ZSK9g6dfyr/PfEYedKbpVFZrT7j+o6c1KKkgy3ufpRub0NMwvelwnp+lYFn/0P7peenSvJ/j58ZPDn7OvwJ8aftB+Lk87TfAuhaj4guItwUyJp1s9x5an++7IqoO5IA9K9XwWHIxX4P/APBxj8XV8A/8E3L/AOHMBHnfEvxJo3hhsOyMtskj6teY29Q1tYNGwOBtfHcCvP4Vyn69mVDCdJSSfp1/A6c0xfsMNOt2R/CZb6p4n16B/EPjKdtQ1zV3fUNRnlQl5tRu5WurtmZQCztcSuflHGQOmcfsR/wRw+E8fif46eJ/jPqMatB4J0kWNiZFYFdR1vcjSRngZhs4plYEkr5wwRxX4+yrJcYM4MckrAKeScnnII/D5gefoK/fb9in4zfB39ij9gLTvib8Vbh4b3x3q2q6xpul2e1tR1FIWXTbf7LGQES3jS2y9zNiJc8b2cIf1n6Z2Y5pDgKvlORUZVMVjpRw1OMFd+/edRWX2XRp1IyeijF3dkrr888DMPg58RQx2ZTUaVBOpJvRaaL/AMmasfuja+ZfIp02JpTj5QiZIUDqQvQDOSx4C+lfnN+0J/wU7/ZY+Bu/SdJ1JvH2v2yFDp3h6VJLaKQj5VuNSYm2TPQrB57oRylfgl+1R+3d+0F+1k9zo3iO8Tw/4UYny/DumSOtqy7sI1/MuyS8fKAZlIiBGUjQfKfi+CSY4llGzEeV2KFRFweAm3YFIHQYr+QPBL9mLhKFOGP49xPPPf2FF2ivKdVay7SVJRSfw1ZI/a+PfpXVpylh+Hqdo/zz3/7dj08r3/wo/Uz4r/8ABXn9rDxrdTr8LF0r4d2HLIdPhXUNSKMACst9exkAk5GYLeLkHB4Ar84fiF8QvHXxW1NdU+KviHUvFM4HyS63dz3rx/3lUzu8aDoFCBR0HA64+g+H/EvjjxCPBvgXR77V9UZAyWWlW0l3cSCMAFhDbh22oOcsMDvX2lb/APBPj9ozQPAmrfE/4rppfgLw7o9s9/e3Wq3qvd+WQEVVtbIysZZCwjjidoy0pUHAYV/fWU5J4eeHHsaGBp4fA1Z2jBLlVepfRKLd8RWvey1m23Y/nnEYjiridTr1HUrQWrevJG3faEdvLY+FokGnzH7GiiEqQWjUIvGcrtj2gDI4xweMccVbaKS4WaN49xClt2W4Xghjgjbx3GOmD1qom2ZPJcKHOFQjKkAdMjBGVx3O3GcHHX6m/ZO/Z7k/aJ+K0Hhyd5B4d0lUvdbugMsltuwsCMBjzrhx5aYIcIHkx8pr9R4x4owOSZfiM5zSpyUqMXKUvJdF3bdoxXWTUVrY+R4c4exebY6lluAhzVKjUYr+tkt32SufMzicSMh+QNhyqD75BJzkY6HkYxgHoR0yhCYx56q7eUgO5wAoOP7wH5cDI4x0r+l2w/4J7fsYRAef4GNzIpX5m1jVG3bRkEAXKdAcccYAFWH/AOCen7FsjeaPA8kWCoxHq+rJgDpgm5ZemM8etfw5H9pHwCnZ4bGf+CqH/wA0n9Rr6FPFq/5fUP8AwKf/AMqP5nYDbuw8r5cgD5gQwC7V5OeB264xRf2ceqmM6giMzANl1DqMj5jz0GM5DdPpX9DOu/8ABNH9ljVJMaW3iHRCCuPsupRTAKMdVvbaVvl4wA3YDNfN3jP/AIJQ3Nqs9z4B8eKVGAsGr6ZtC54UNc2crgZ9Ps+ODyK+/wCGPp3+G+OqL2mMnh309pSnf76SqRXzkku6Pl86+iXxthFenh41bfyTj+UuV/K1/I/M34RfHH45/A2RLv4N+LtY8LfvBIttZXkn2NywG3fayF7Z/dWT8MZr9I/hR/wWQ+P3hO4gtPjJoOi+NrXa/mXlqp0LUn4wcmASWTkY+61snTkivgT48fs5eOv2ddbtNC8dT6dLNfwmeFdOvRM8kCOqh3iZI5I0Y8IZFCvhtu4q1eCtN+8SOSVd3AYkKc4+Yhwc54C9Tg9OM1+rcReGHAXiBgo5lj8FRxcKq0qpLnktVpWhy1bJ9FNK62PzKhxTxNwxi5YKNadGcNHBvRf9uv3dvLY/rO+Dv/BT/wDY4+L1zBpsniR/BeoykRi08VxrYLIRyfKv0aSydc8LukjfnO3pX6ET/aEli8+BwHXfFkblkjOMbCDh1bPG3rX8E5txgRXLf63G/JRo5N4HqvTPOPxHSvoj4A/tX/tJ/sw3cem/B3xHc2ukGX97ot4EvNImb5WYPZz5ETP91pIPKkwc7hnj+CPFj9l/lteMsRwVjnSn/wA+q/vQf+GpCPNBLZKUKjfWcT+g+DfpZ4mnannlBSX80NH/AOAvR/JryR/arlB+93EcB85yV6EoF/l+OKYO6o2WUAkfw/OQBn09/pX5K/s0f8FZ/gH8VFt/CPxyEHw58QyqqrPPMX0G5fao/d3hAeyLE8JdDylA2i4JPH6wyXDFVupVG2VBLH5W0gpt3B1IOChGdpHy4PBPb/KrxN8HuJODcf8A2dxJhJUZu/K3ZwmlpeE43hNLq4tpPR2eh/X3CnGuVZ5h/rOV1VOPXo15OO6+4vfaAULKzY4yBkkngADnj04FOkjEu1iA+3ruGVIxwOevfjpjj0qHygri2O0vgD5SBxyex456entT97RnYu1s89eoAz/n8q/NPQ+o9D47/a7/AGIvg/8AthaNCfG6Noviuyha303xLZxBrq3X7yxXSHH2y0yc+TKQyZbyXj3Gv5Ufj5+z58Yv2ZviO3ww+Mtj9hvNpktriFvMsb6BW2i7s5mAWWJ8cgjfETtlVGXFf23iNZE2RZLY4OCOwxx0J74rxj4+fAT4VftM/Da4+FvxYszc6fM3mW9zAVS8sLlBgXVnLg7JR3BzHKhKSqR93+8Pon/TYzXgWpTyXOm6+WPTl3nQ86V/s63dJ+63rHkk5OX87eMPgNhM+g8bgEqeJXyU/KXn2l99z+LX4f8Ajj4hfCrxpp/xS+HGrXGha/ozi4sL+3IZ4WZdjoQRskikG5JoXzHIhKspBNfdP7cP7aWj/tg+EPhhqQ0oaP4h8OprR1uziVnshd3YskinsmfJ+zzLBIfLfdJA37s7hsdvnv8Aai/Za+I/7IfxCPw5+Iqw3dneI9zo2qwKY7TVLVTjzYg2fLmh3qtzbZLwvyC0TIzfN5+1y2/mSINiquW/uFvx9vlGe30r/cShw3wxxNjMr43wnLVnRjN0K0OtOrTnTlF94+/J8js6dRP4Ze0jL+B6uaZrlNHE5HWvCMrKcH0cWmmvPS11o499LXmIjaOymLDcwbHPmfeyu7Hp2547+o/T74NWEmmfDPQbNPmkmtfNBOQoFxLLNjHXHzf/AF6/MGz2OrwEYc525XJXnPGT05yPUdu1frP4U00aX4c0vSrlNz21lbxODk+WyxIrenQ5yMc/Sp8SatqNKl53+5f8E/ur9nNlHPnmZY/l+ClGH/gc+b/3F+BvRzQNIs4xgNwDkDDexx0zj8PWgBQuJF2MgEnQIvTDHHqT/sjgc1NEWeQLu++AeCDnjqB7dv5VChDW6JAxKkBs5G7kYJ7/AI/kK/JT/WxLoRuyRDfJwWBUgdD8ueMf/XzX50/tL3c118S57Q/dtbO0t2BUYH7oSE4ORkFgBgV+iF0WeGSPaUfbgLkYAPAOMD06DpwK/Mv443qav8V9bnWN5Gjv3g2EnO23Cxcegwnr0z+P3nh3Rvj230i/zR/B37QnNfZcGYfDJ2c8RD/wFU6t/ufKYvwztYLv4n6LawsHb+07RMrjZtWcMcDpt/iH+QP1PiKSOxjIAlYsu3AZvmGACMHP09K/N39nyJLv4w6HDKv+qMkx+7y0Vu8qliuckbcD6V+k9uFkCn7udoVhzk9gOPXtnrV+I1RfXIQXSP5t/wCR5f7O7LXHhfG4zpKu4/8AgFOm/wD28tSo0mSf4h8pxg4OMY9Mn2qPZG+5Zscn95jsM4yfXt2/xpix5BIwAmTnHpjr6Dt1Ap8ufLCNxswVJ5+U5Hp1ByP0r8/P9BCKS7j061l1S6ZozbQNMw5GRGpfoBx0wPQdK/HKR1d1SYA42ruc7QAOQpOByAQR9fwH6tfE3UbfTvhxr2oXX3E06a3GDwPtH7oDA95AB6Y6V+UcihHd4R9zgFcZ3cngEZHA6jotfqvhlQ9ytU9F93/Dn+Uv7R7N1LMcqy/rCFSfyqShFf8Appn2L+yvrnh3wdpPivxj4jn2R2cFpHkYdj5peTYitjL5QAAk+vABx4X8T/iTr3xU8Tf2zd/6PbHMVvblm228OSAoOAS7McM+PmzjCjaB5zaytH/oUUzJBgP6jMfQ7R1K5PXHB78iqt/AVPkonmqxCJ5StvlYlEVY0xvaV2YIiKMlsYGSK+rwnCuHp5nWzSes5WS/upRSsvW2r+Xe/wDGmeeM2Z4vhPA8G0v3eGoczkl/y9nKpOacvKKklGO11zO75eXovDPhTxd8QvFGleB/BFidT1vWJUs9OtU+VrgkBmy2NscUSgvJI3yxorN14r+mH4AfA/wj+zj8LbX4Y+HJhdzRsbnVtTVdrahfyII3uOfm8qNVEdvGfuwgfxMTXz/+xH+yY/7Ofhx/HfxCgRfiB4ht/KuoT8w0exfa/wDZq8kee5Ae9deCwWFSUQl/uQMj4jTG7ou48EnjOPpxjt7V+i4DCcq55H8g8YcRLFT+r0X+7j+L/wAl0+/tYzHbgxZ4b5W56H+HPHHp9MVK/wA0wDKynG35j0xwCO4B9PT3qGPysN5fp2AUe/PPTHr1+tOUqG3qBycvjk4POMHkDjFemfFCRLJcsEsl82RtioAQdxbIwOo6+/HpX8737d3xa0v4s/tIaqNBdJ9I8IwJ4a0943+WY2blryZcbl/fXzvhgPmjiTHGK/X/APbD/aDb9nn4Mz61oUwg8U+IPM0rw+uQfJuZIsXF83Q+XYwtuBAIM7Qr34/m5tYJLSxFjbxhYIVEcZJ3F1CgFWLHPHMj4J6+teNmVZXVNH6TwHlXxYya02X6/wCX3ovpGru7RkFTE8kqorP+6iBlmlY4bIRF3SScbQuScVJmOym+0S48xChznoemO3Izx1LeuBX61f8ABNP9nDTPF/hfxd8RPGaj7H4wtL3wJpmRgC0u4zFq12hHABm8q2Q9P3cuM1+R62et6araZ4iVkvtKMlleBshhcWrGGX5uNoMqEY45OPavP5HFJvqfbYbMqdavUoR3hb8f8rWP7gv+Dbn442njb9hnV/gFNIPtvwo8TXthBB/y1TStZ/4m1i7f7KyT3NuvYeRjjGK/oT3Er84r+Gj/AINwvjTD8Of28fEXwbe58vTPiR4PmMUAXmbU/DM8d3bgHOP+PW8vs+yjoBx/cwCWGT3/AC/pX8TeLuUfVM8qtLSdpL57/jc/p/gvHe3y6DfTT7h4JXgCl3t6VGUPpSbD6fyr8yPqj//R/ui+Udf0r+PP/g57+KNtqnxh+CvwIsbjY2j6Prvii9tyRtZr6e20uykKnriOK9C/U9Oa/sOO0Dd0Ff5//wDwX88dzfEH/gqR4t8PXHTwL4a8NeHIwo53SW82ryY/2v8AiZL6cfQV9f4IYD22eKp/JFv/ANt/U8DxAxHs8tlHvZH4128UEEe3G4LtYx/dwu3aCCCcMR94YGM46Yq5q2r6/qxt7jWp3ujZWsFnbebKziK2tF8u3t03nakMS/dRMKOSRmswofL+ziNSSSM/w5ZQNox82D8u36etet/CL4NePfj/APEa1+FvwqsRdaldH7R5k5xa2tqhAku7txkQ26DnODIzYRFLsq1/WuaZlhcFh6mOxk4wp04tylJpKMVq229krXfofhuX4SviascLh4uUp2SS6vorHBeHvD2v+KfEth4X8J6fc6treoyGG2srWIy3M7bQxjjij6jaGJOcKASVFfsz+zr/AMEjGNlB4j/aivWHO/8A4RnSbkfL90bL7UUyemVMNrjH/PbrX6Tfsufsi/Cr9lLw9/Z/g5X1DxBfQCPUfEN1Gi3l2oI/dRL0trYsBiBGydqmVnI4+n1fyVVJ9sRBHQHj1wO/GP0Ff40/SJ/aG5nmNSeU8Bt0MOtHWtarP/Av+XUP5Xb22id6bbgf6E+Ev0U8FhIRx3Ei9pV/59/Yj/i/mf8A5L0s9zhPBPwz+H3wl8OJ4L+E2haf4Z0xUUmCwhEPm7QArTMh82eT5AC8juzHr61+FP8AwVH/AGm4vFnjKH9nDwLdZ0nw1OsmutExWOfVo/lW2JXIaOwjc7l+6Z2bI/dg1+rn7Zn7Rcf7NPwT1L4kaay/25eP/Zfh+FgZN2oTqSJmX7pjtY1adw2Eyip1YV/J7dLdGeXUppZbidgzNcSs0jyyycs7klsliSxyOua9/wDZ8+ClfOcyq+Ime3qezk40nJtuVW3v1W3q+RNRi9ffbaalSR5f0qvESjluCp8J5XaHOrzUUlaHSGn8zV35JLaRHaWl5drBpmnwvdSSMkKRwI0jTOW2qiAAlmY7VUdfTNf00/svfBKw/Z7+Edj4GuFj/tebbeazOPn8y8YfczjBjgX90nZgrNwWNfmr/wAE5vgA/iPxHN8f/FVuItN0KQR6PGycTagq/NcAHjbbKcL8rfvnyD+6NftB56YQuwk2DqTgY9Tn1/3vbrxXZ9P3xw+vY2HBOWzvTotSrNdalvdh2tTWsltztJpSpn2X0MvB/wCqYOXFOPh79VctLyh1l/289F/dV1pI6uJxFIjsBgbCdvPXoeMnj3Hp06VbS6TOGUg5HoCM44G3qRzxgYrlIZZWj3HnnggjJ9unYD2B6VKtw0UgkY4P3yCcjGfThee4HtX+Z0sOf3LLDnTTzJFNmQqnl8jcRnf2wDgj1/Cvj79rH9qXw7+zn4RiNsial4t1WNhpFgxPlgI3/H5dAEstvEeAvBmf5AQAxT0D46/HzwZ8Cfh9c+OPFQ8/yS0NnYxnY95dspaK3TjABGWkZs7EHQ5AP8zPxJ+Jnjn4s+MdV+I3j26W71fVJFMjISiIij93HBHkmOONfkjQg7QMkdz/AHB9Dn6LL4wxn9uZ5C2X0Xa23tpr7C/uR0dRrXaEdW5Q/k76S/jyuF8KsryuX+2VF/4Lj/M/7z+yv+3noknk+K/FHiPxpr954p8bXZ1fV9Xm+0Xd5c4MssmeQyKBtXoERMJHgKoCjA9A+BfwQ8cftC+Nk8IeA4wY4BHLeX8gzbWNvyPMkJGd+CVSIZeQDgfLuFv4EfBPxp8evG8Hgnww/wBlhTbNeX0gJisbTdsEjH+NiwIiT/lo/Awu4j+iX4ZfDLwL8IfCFn4B8A2n2bTrJd7vIytcXNw2Fe4uHA/ezSYOWG0IMIgCACv9BfpNfSdwXAOCjlGURjLGyiuSCS5KMLWjKUVZbW9nTVlbV2gkp/yH9Hv6PmL4zxTzTNXKOET96X2qkuqi/wD0qXyWt3H86fiF/wAEyrA6NG/wk8Vub+GFRLDrSBYp5RhXaKa3H+jgjlVdJApx83G6vzF+Kfwq+IHwb1ptB+Jui3WjzOD5RkbdbTHaNpguYv3cu3IBKOSoOPUV/Ukphz5Uu4O+cvnlepyqcY7cjPHFZ+oaZpOt2M+ga9BDf6Zfq3m2s0SXEUgJ6SQyh0PIU9AfQ1/D/hb9PrinKanseIoLGUe+lOpH/DKK5WutpQbeylFH9d+IX0LuG8yp+0yVvC1Fsvig/WLd1tvGWn8rP5QbhwI2SNtoQFWDjaW3ZwoTGAPQcj3r7n/ZR/4KB/HH9ktIfCkbxeK/BidPDmpTsi2+4bv+JZdEM1oSctsw1u+5sx7vmr6o+Ov/AATk8OazFceIv2f5k0q8HP8AYd3Nvs5di8La3L/vbaQ8nZIXjLEAGNRx+Tfirwf4g8C+Irnwh4v0y50m+tyFmtrtSjjGDkZB3oQPlKko2cjtX+j3DPHnAXirklTL7QxFNq86FVWqQ87J3i1fSrRk0r2jUUrpfwLxd4e8WcAZhGtXi6dvhqQ1hLyvb/ySaT/u2P7J/wBnH9p/4MftYeHbjxL8G9Te9bTz/wATDS7tVttTsVOQv2q3DMDG2VVJoTJCxGN2cgfQ4VjIyeZnPzJtBB5xg4I6jH5HHSv4RPBvizxf8OPGlh8QvAWqXGi67pDb7HUrOQpNA+1shTtbcjKSrxMGR1Yqy4Yiv6h/2B/+Cieh/tV2afDD4pCLw/8AEmCBmWCNPItdZjhG+SWxU8JPGg3XFrknb+8hym5I/wDJ76Vv0CsfwhRqcQ8LyeIwEdZxf8Wiu7srTprrNJOC+OPLF1H/AFT4QfSHw+czhlubWp13on9mf+UvLZ9Ox+mUrsF+f5iDkdgFH4jB6j07Ypk4kVn+XCbSCMkZPHJA68dB6dKcFVtsmdxbA7EEc46EDbnkDj8BUMocA7QFVST8xxy2CCByCM/lX+dKR/Tx478dPgf8Mv2jPhldfB74s25udJviJYriE7bqwvI8xxXls/Hl3MQ6HpIpMUgKMRX8ZnxQ8Bv8Kfij4m+FzX1tqh8Laxf6K11DC0SXBtpzGXRc/u87cOmSFYEBioUn+3nVNb0Tw4H1jVm+zabp0T3t67HKR29qhuXPqAVi9ic8V/Cdq3iXU/GOpXvjTxMxe/1ia41ORyMEveSPLLxgLljLxjB7cjBr/ZD9lhmGbVMPnGGlVf1Sn7JqD2VSp7S8o6ae7TtJJ2fuXTtFr+H/AKXWDwUJ4OpGCVaXNd/3VbR/N6fhbU6PwtpsviTxjpvhxCA19cxQKcltqyMFBUADjBPPtkgV+t0kpuJnnhPyyOcc5yMkjOdowFwPb8K/OD9nHSDqHxZtL2NVa3sI5r3GOcJGUR85GT5joPw55r9EWKRllj+YlB0Hz54HIP8A48Onav8AQLxExXNi4Uf5Y/m/+Aj+qv2d3DP1fhzG5s1Z1qqj6qlBWfpepNfJl8uy5KNweM4AP59OM5/AetLHiRDA7ry2xt/IGPQjqOAehFMkzuLBsSckHG0ZC8A9D34AGOmMcUsgKxhm6yDKqeAAM8dOmPrj0r4Gx/oTcjRE8y3f/lmxVm3D5UTgsRt7Y7Y5Ar8gtc1Nta1m91WZMPfyNOVbODJI5JA4LbjkdORjrX6h/FDU4dD+HmuaxJlRFYTIjbhu8yUCGNuvTMmPTpivypi/eSfLyWfHBY89CUGeOhBwvQYr9U8NMN/Frei/r8D/ACx/aOcR3xGV5RF/CqlRryk4xh93JM+lP2V4DdfES7uZ9+6GwlmO5stmQpb9cAg4k9B06V9+JG2coB85AJHIw3TIzgHgAfSvkr9lPSDDoGs6/cbNs9zBbKvX5oFLvgexeMc/0FfWspigTGcrGfnJ5K5x78D8MdK+V40r+0zKdull9yP6c+hVkDwHh9g5TVnWdSo16zcV98Ixa8h+0qu4R5VXznDbs4HGRx/npiq8jJlyzb85ZgWB6dAuMD9B/hYZJAFj2/PyqqnDD0OF5+n5V4F8Uvjz4b8B3E2l2AXVdVjDZiRv3MBA482QY3Nn/lkmMYwWXgH57BYKriaio0I3f9fcf0Dxxx7lHDeAlmedV1SpR6vq/wCWMVrKX92Kb62sip+0jrD6b8KvssLjGqXkUZ6YKIrStsHUhXVOnTgV+eokUGOOXjYjRnpuI4zz7AZGBz29K6bxH4s8SePNcOv+Jrx5brAVCcKgTdgBQgwic8AY9frzUUN/e3cGkWMN1dXN9KsNtawxNJPPcOfkiihRfMeRjkKB1x9cfvnC2SSwGF9jPdu7/ryt/wAA/wAJfpIeMNLjfiaWb4am4UoxVOCla/LFt3dtFdybsm7bXe5LcyzWtut3qJwc7i2Pl6bQCoB+ZiflXnOelftr+w/+xVN8KjZ/Hv4z6eB41YF9H0qZQp0WORNqzzJ8wGoyqTtBObWM4AEzHZe/ZA/YWT4ST2nxd+OttBceMoWEunaWSs9pojA/6yYruSfUB22hobUkBC0oLr+j6xyPGLrzTvyfvAEndzkk+/Tn3NfdYLA/bn9x/GnFHFaqJ4XCP3erXXyXl3fXZabiBmRnVvkC7ucZ24/Hjn6j8qTZcFiSNozg4Qk/MPXsOQPw6VEQ2C8OG4JA+8B78cH1pWgiRgpTYWJP6Aj0Hpn8q9dH54TbFbnOxWPoTy3XjAHQdPTArOv9V0jS9Ju9d8SXcWn6bpsEl3eXkvMVtbQJumkfHzYRe3UkhRyQK0IwJ7uOCBGlkYBAidWY8YXC9ST8v4DmvxF/4KF/tW2nxE1ib9nb4aX63Xh3RbsNr93Aw26pqFtzHaoy8PaWLgF9rYmuRgfJEuefE4hU43+49fJconjK6pR0XV9l/W3+R8g/tKftAan+0z8XLv4jTbrXSIkGn6FZTsA1ppcbF0aQf89rhi085GQCwTgIK5T4U/CfxR8b/iTonwm8HNHFqWsMImmZTttLRBvur6TgYjt4cyAdGfYuPmFeZTXcGnwST3L/AOjx7jI7s20BeTuG3j+EEDPQ4zzX9Av7Df7NF38CPhzJ4y8fWrW/jTxfBEbuKUfvNN0tSstvYsNvEjkLPdDghvLiP+rrwMPRlWnY/Xc4zCnluEXs1bpFf10XX7up9keG/C3hvwF4S0zwF8PrQWGj6FZw2GmQv95La3Xam8ngu7ZkkJ4MjFvev55f23fCf/CJftc+PbOxjLW2o6hFrdtgokYj1a3jvW6L/wA9WfHbHY9a/o0VmU4AyUDDaeM9ugHQ+nf2r8TP+Co/h46V8cPCXje1CP8A2z4c+zH5lw0ulXksQznpiC6iHH9K9jMIWpq3Q/P+CMU1jnF/aT+/R/ozyj/gnT8Vbn4Mf8FB/gb8U7GSKP7L4303TZpZjhFs/EBfRbk8gKB5V+X4AxgZ5AFf6ZAiMK+QvPlkp/3wdv8ASv8AJI8UXWoWHhPUdYsJTDe6dC9/byr8hjksz9piI3bcOHiXHckdOlf60GgeJNE8ZaLa+LvD0gk0/VIIb22dcENFcxJMjDHYhwa/k36QWAtPC4nupR+6zX5s/sHwwxN6VSl2ZtGNT94UnlR+1PAB+9S7E/ziv5yP1M//0v7oLhHaBlj6kYHHrxX+al/wUx+Ij/E3/gpT8efFYYSSp46vtK3OgyV0O2t9KUYOMhRZ4XqMAntiv9LKNS08IPTzIxj1G4D+Vf5ZP7QfigeMv2jvih49X5RrXjzxXqSE4O0XGu3zrhgPn4+Xj8ARmv1T6P1D/acTVttFL73f9D4rxOqWw1OPn+hwOg+HNe8Q+I9M8G+E9PfUNV124htrGyUJ5ss8jkRwjO3GSQM/KgUbmwBX9XX7Iv7MfhT9lz4Vx+CtK8i+1rU/KufEGrRL/wAfl2AdoTPItbfcUtoyMAbpSNzk1+FP/BLfw/FqX7aHhx0UBrDStcvl2fLsK2n2dWbnC4Fxjj7p6Hiv6cBGodYUXaWGAOcDjHU9OPb09BX8OftLvF3MVj8LwThpcuH9nGtUt9uTnOMIy/uw5OZLZyabV4Qa/pP6HnAeEeFq8QVlerzOEf7qSV2vN3t5JabsWKXKJAOm0RnGP9nLN69fZeap/vLlgtmrksVACDOGJ+XHAxnPp1zmnMCwV32jgYzgHhRjp05HQ5/CvmL9sL44T/s9fs4+IfiLYy+TrEsY0vRXBH/ISvFeKF0BGGaFPMuRnHEfav8AMrg7hTGZ5muGybLo3rV5xpxXS8moq/Za6voteh/aOfZ1h8swNbMcU7Qpxcn6Jf1ZH4X/APBST4/f8Lr/AGibvwvodxu0DwIJtKsvLy6y3W9DqNzll/jnVYVbO3y4FI+9z8RfDLwD4l+KHjbQvhv4I2rqGtXEdpAzFmSLI/ezSbVGY4Yw7ng8KTiuETzLHTEtrTttRCo5kIyTuOACWxuJPT8TX7N/8E0Pgn/ZuiX/AMfddjjb+0N2maSWyw8iFgt7OueCJXUQKRg4jfs9f9E/HGe5X4S+HShgEuXDU1SoppL2lV3tJrZuUuatVXVKpY/yo4G4dx3iFxnyYn/l7JzqNfZpx3S9FaEPPlP0s8H+C/Cnw88Kad4F8DwG00nSIRa2qsuGIxzLL8o/eyuTJIwGSxJ4JrqGLfIuCV6Doq89ATxjrj1qNmZwBAM/IBtHOVP1zkce2PyofbIm9jnP+1k7iOnQ4PPX8q/5/sdja2JrTxGJk5Tk223q23q233b1Z/tVg8FRw9GGHw8eWEUkktkkrJL0Q55/L3SfcBGUPG3pwASuegxn+WOM3XfEOi+HdKu/EOt3a2Vlp0T3l5cOWxBbwoTIxC9dqjoAcnAAJ4q80mZXxiIZHVRg4PT6eoHr+Ffkp/wUY+Pssrxfs3+GZceUy3uvsDyzKqzWlnnPK4Pny/LjcYxkbWFfqXgf4RYrjXiOhkeG92L96pL+SnG3NLtfaMVs5yinZM/PfFvxIw3CmRVs3rayWkI/zTfwx9OrttFPsfCP7Tf7QWp/tE/ERvFt0ktnotnut9Ds5M4htWkA83Cnb585AaY/7qZKoteafD3wB4n+J/jOx8CeC4ludU1GeSGHd8ke2PJd267YoVDOxGMADuK4dilnI9+ZDCqfN5kOCxyCN3J6DnC4wcnpwK/fr9ij9mOX4JeC38U+KbYDxRr8ANwrrhrGy+UxWKsejkBJLnBUeZtTB8ssf9qPGfxKyfws4QhDL6Si1H2WGpdG0t31cYX5qjveTdnJTqKR/lN4V8AZp4i8TzqY2bcW+etPsn0XRN25YLZJbWjY95+BPwT8J/s/eBbfwJ4aPnSrL599fFAkl9dOPnlYfwIFOIUyQkfy5LFifXAsZICkMg4GDjjP3QO3T1+vrVjYZEyQOhXHpn72ODz7ZP4VBNMuWeXPPAQd8Nwew9hxx24r/BniDiHG5tjquZZjUc61RuUpPq3+HolZJWSSSSP9lMjyTCZbg6eAwMFClTSjFLZJf1893qMQyufLkYqE65yevA6DP4enanOXEgMvVcDqDg+gA+pA6evFKxKt5jNhtoHryOv+z3PWuc8TeJfDHgvwxe+KvE93Hp1hpUBmvLmQZEMaYJbA5ZuiqoyzsQqgmvPwmEq16saFCLlKTSSSu23okktW3skt9kejWrU6UHVqyUYxV23oklu/JJHP/FH4m+C/hB4HvPHnji7Nrplpti2ookuJ5X5jgiibG+ZwNqgcKMu5CjI/nb+O/wAfvHP7RXjQeLfEuLe2gj8jTdOVy1vY2oYgIpOC8uFBndh8zYA2qERdr9pn9oTXP2jPHi+JblXstE0vMOlWDlV8mN2BMkmPlM8oUM7LwPljBwgJ8BtLK/vbqDRYLaSa6vHW3traBfMlmeTbsSGIAZdhhVAXOR6c1/uJ9FX6L2F4LwMc1zeClmNSOuzVGL/5dw6c1v4k1/gg+S7n/kP9JX6RNbirFPK8sly4Gm9OntGvty/u/wAsenxPWyjGGuXvYxsPmYbDSAMB8jDjkAAAHoMdOtSaJe6npmr2mq6TNPp1xaTRXNtc2kpt5oJYzujlikjw0UkZAKMpBXAHTFfqT8Hf2J/C2g6PPP8AGmJNX1i9gMQs7a4aNNNEg42yx4Et6uRmQboYuQqyDLV8O/HX4D+JfgN4mi03UgdQ0XUstpepk4jnRAd0M6jIS4jz86cAgB4/kyB/WGCzzDV6roQf+T9P69ND+L8r4twOKxLw2Gn70dul7b8r8vl3V0rn9D//AATy/wCCh9j+00sHwd+LksNj8SLSI+VOkQhh12GFSzTRopKJfBQWuIVwHwZYQAHSP9QJZvLbzJyFj+9gkcnAIG0ZJ79Og7V/Bvp93qmn6vDqOiXEtvPayrdW9xBKYZ4JYdrwyxSLzFJGQGDLzkKB0r+pv9h39ueL9qv4fSeHfGUkUHxD0KBTq0aJ5S6ha8KupQQfdUMzBbpECiGYhlCxyKB/i19OH6GVLh6c+MeE6VsHJ/vaUdqMm7c8LbUpOy5f+XcmlH3JKNP/AEc+j744PMuXJM3l++S9yX86XR/3kvvXmte2/wCCinxHt/h3+xr4/wBUsZkiv9Xt10C23Exu0mrSi1m2BQc7bXzWXoRtJAyK/kyby7LcMFrcSAAH7uxslGxxyB2zn6gcftj/AMFjvipvi8C/AjSRtMUM/ii8gbPO4nT9NPXOVH2p+45HUV+J7mBLhIbJQfKVMgnzM8bdzduB09CORX9qfs9vD+WS+HdLG1Y2ni6lSr5qCtSgvT925x8qh+G/Sc4h+u8Syw0X7tCKh8/if5pfI+xv2VvDUKWms+LJgMv5NlHNjBxgSzZGOOkWOK+xDLI8W5OByycDOemeDz16ZGQPYCvJ/g94al8KfDrStOmBWeSM3szE4JkusOpYEct5YTI6A8dK9Uicxjdj5m4UZxwDxyf0zjB4r9Z4jxixGOqVVtey9Fp+h/sV9HDg15BwTl2XTjaXs1OXdSqXqNPzi5cv/bqROobcjQbflPGeT/snCj6emeOlRhEiiEisVSNQEyehH3iv8gM9c+lWFOXAwdmPutgfMP0/TtxUTxz7UkzgvgcYyrMOPx6n9a8V6H7e2tmfO/7Sms/2V8NP7MTGzVb2GAqwA/dxZnY89PmVPb8K/PDf5e0SE8NvDZIPHPyg9DgngdsV9XftV6zFqPiDR/Ckar/osDzk7sqrzkEZ56hI0PPGDjivlu2gt4MzRgMevI+UnjHX7vHrgY/Cv3TgXCeyy+Musrv9F+CR/hf9NfiyOZ8f4mnTd44eMKS/7dXNJfKpOa+R+l/wK0aDQ/hNpWUWOSdXvZeerTuQp5yf9WidOnFdf4y8ZeFvBNslx4lu0tsL5kUKndNJkEfLGuDhiOC21c45718VeIf2kteFlbaB4FRNItobeKBZyRJdmJIgu7fIBGnygcqu4Hnd2rwG8uNc1S5mv9TkkuJJP3pkbhmPTJZ2GTn5skj9RXzFDgaviq8q+Mlyptuy31/Bfif0jn302cm4ayPDZDwfR+sTo04U/aTTjT9yCjdR92c721uqeut5Hv3xF/aG8SeLkm0jwsp0nTnD5w3+kSJ1Cu6cKGPBRQvB+YtXzfDE9yqqH4d8bQoZfm+bqewwQSQCCOKkvHMX2dJXJkuJVSHaWeR5ThcQoqlndhyI1U54HJzX6Q/s+f8ABN34j+O2g8UfH6S78FaI5WRNLRg+tXkRC4Mud8WnRnt5m+4xwIk+8P03KMmpYePssNC39dT/ADm8TPFrNM9xTzXiPFOpPZX2S/lhBWUV5RSXV9z4k+EnwZ+Jvx48ZDwJ8K9K+33sUateTyMI7XT4idomvZ8bIFAOQNpkkOBGp6j9+v2av2Rfhn+zAp8QaQ/9veMJk8m78Q3CCIxRN8rwafCSxs7Y/wATbvOl6u+PkHungXwJ4D+F/g+38AfDHSbXQdDtsvFZWykBnbrNNIS0txK2AWlldnP0wK6/aGQKOOf4sYwRk+nAx3IxwOlfW4bAKHvT1Z/Nef8AFdXGfuqfu0+3V+v+S09dCKGPC/LgEHnPPHvwf8/pKC2d+3ec55P8s+v5gelDZDHeN3YDI7Dr7D8+3HFOiOwD5QvPQYzxnk+34Z7dK7rHygoDDdI3zLn7pAxtPA9APw4pm1lAtgCBkD5V4x7AcH8evWljTdcBEjJ+UBQdxLEnGAvcnoPpX5p/to/tzwfCyS6+DXwMvlufGBDQ6lrEDK8ei8FZILd13CTUcHax/wBXadcmbCplWrRpx5mehlmWVcXVVGitfwS/r/JGV+3v+2JN4Ht9Q/Z0+EV5nxBKHt/Eep2786ZEV50+3lX5Tfyr/wAfEgP+jRfIMSsdn4t28VtaRxWtuFWGEbUiXZtVOPlUFRt+U5+pApISLGApE8e0bgVJZmzu3fMxIYuxJZixyWJ3da+tP2Rf2U9X/aa8XTy66JrHwPpEyxaxqMP7qWaXBl/s20Y5/wBIl4858bbeL5v9Y0a185UqTqzv1P2nB4PDZXhHd2S3ff8ArZI98/4J5/ssReNdXtv2lviPbxzaDod15fh61cZj1C9t3G66dRndaWTgBFIxLcjusTA/tw0u+TzpJy7OzM2CCXZskMfUngk/Sqen2emaTptvoWg20Wn6fYW8dnZ2luvlw28ECiOKGNT0RFAA/XnmrKyPF8iP8o+YqvB6dSTz1xX0OFw/s48p+O51m88ZXdWW3Rdl/W/+VhWHk4bHPQ57k4OSTxj3zx2r8rv+CqulTTeGPhp4pRubPUtZ0wYAwPtNrbXSFuOADbYC/wCFfqg5jZcQ7EJIVVC4GPcHnjqMZFfnd/wU8sHuf2efDd/Gvz23jK1Uuy8AT6ZfqcnG0chcHr6dqjHRvSZ0cLz5cwpS9fxTR+Gt3aQ6kjaTKWdLqN4nDdFRxsYnjBI3DjPGfav9LD/gmP4xT4gf8E6PgP4p3ebJcfD7w6kzHndPb2MdvKc8/wAcJr/NcsZl+0RyEZ2yh1B6cAdsDuB1yTz2r/QU/wCCD11Ndf8ABJb4MPNuBt7DVLIBuoWz1m+gUHnsqgY/l0r+b/HmhzZTSqP7M0vvT/yP698MqlsVOHeP5H674A4PajC0jDJ6U3Z/s1/Juh+2H//T/usgXdPCCcfvEIHrhga/yXLe6lurzVJ5JMSy6hfuH+7u339zkjj+8SME9vwr/Weh2rd27Hp5qY/76H5V/k1iCS11XULQIEEOp6pH84bJ8rULojGDjORjpnnpwDX7J9Hv4cX/ANuf+3H5/wCKPw0fn+h+ov8AwSHwf2sPEFwzbxb+DNTIJw2PNvdOGVLZ+UkkZ9McY4r+jO4nWSTLuMLhT03EbcdMdPb+Vfzlf8EhwYf2ofEj3IZUPge5KhuMf8TKwbO1jkADjHJA/Cv6Mpinms8JJUBlGPlBbBUAZPf07V/k9+0W/wCTkST6UaX5N/qf3T9EmK/1Ri1/PP8AQpzyRRZVCDtPBXJyB6dSSPQgfpX873/BWL42P4w+MunfBHR7rZY+DLVmvyoYA6jqESTSA/wMILbyY1bGVd5h04r9+vHHjfw78MvCer/EHxcM6Z4ZsZ9UuVTlnis4jI0a8gMXYLGo7k4r+MrxJ4p8WeOvE+qePfFMhbVtcvLm/vCDtDT3LmWTJ/3jhV9AOoFfo37NbwsWOz/FcWYmPuYWPJT/AOvtVNNrvyUlJNdHUgz5b6YXG7wmVUcjov3qzvL/AARtZfOVv/AWS+A/Cer/ABG8SaT4D8ObBf61PFYWYVGMYknbZk9cLGuXYhcKqk9q/qd8KeENA8BeENN8CeElZdL0a2hsrckAF44lwJG4QEyEb3YD5mJJya/Hn/gmd8M/7f8AiXrXxk1eLfF4ft1s7GU7gVvr5MPIjbcExWwcHI484e2f2j3RbgkbBRkKucnav4Z6dfT2r2/2hXic8fxFR4Yw8v3eFipT86tRJr15afLy9nOoj7D6Enh+sHklXiCtH38Q+WPlCDt8ryv8oxY3eV+SVtxblieBn15x049vbpTHdosiXC5JDAjK8cHGefw/IU1ZDtSdc/u+O/8Ad49evb3/AAqUyoMIAd5JT6/7J647dscDt0/z2sf25Y8X/aB+MOm/Az4Wat8TrlUkurZRa6bCxGLi/f8A1MZAKkqvMkgyMxqeRxX8zWs6rqOtXl/r+v3Bvry/kkmuLmVsSPPKd7Skg8lyScAEflivuL9vX43yfEv4tSeDNGu86H4S8yyQox2z3hO27nICjcqsBCnUbVLKcNXxR4Y0DW/F/iXTvBvhu1M2pardx21pATy8krBVXOMBVLFiTnaoPSv90/oc+D1Pg/hJZnmCUcRikqlRvTkppXhBt2taL557WlJxkvcR/kF9KLxSqcUcR/2bgLyoYd8kEvtTvaUklvdrlj5JNfFY+9P2Bf2f2+JfxFb4seJbdRovhaVIrRFI/f6mMPHwV/1dsMSPz98ouWG4V+40IBbKOXJwRwcgOc9W4I6jp/QV5t8JfhfoXwi+HmjfDPQwpttLgVDNhszzsd09xyScyzZIGcBcKMACvSVbzFEhyCQWwM889MY79sHv0xX+VX0kPGWrxvxNVzKL/wBnh7lGO1qa2dukp6yl2vy3tFW/0c8CfCylwlw9Sy9pe2laVR/32tr9o/Cuml+rLCrKI9sqD/pn+GM9h2PGPrUbjli+B8uWB7HPyggdueOOSKYfKJOEUlfmO0dh0HHXPcY/SmQyRxzCL/V7QMZ2nBB529Dx9MfmK/A7H7JCIxjucQA5eUqFAPzkkY4OR9O34V+GH7bv7TC/FXxC/wAMvh7eb/C2kSHz5rYhjqN3ENpl3E829v8AdhAyrtmTkbMfYP7ef7TH/CuPDI+Engi48vxBrVv/AKZNHw1hYSgglXHCXE4H7vJJSLc2BujNfiDEsE8Kq3mIsbBQAu5AqjIOAMZwcKCW447V/qr9Bb6Ovs4R44zmn7z/AN3i1stnWa/Cl5Xml/Dkf50fTF8deZvhHKJ6f8vpL8Ka9Pt/KP8AMiac/Z4/JRXLNgIh+b947HaNmASxYjCDksQByeP2B/Zi/ZtPwSs08aeMo4z4tvIjF5eFYaRBKP8Aj3jYZBuZFB+0yL93iKPgMT+XHwp+JGofCXx/onxL0y0h1CbQ7kTm1lClZIwhSaME42TeWf3UgGY5ArCv3p0rVNC1fT7PXfC9yt5pl/BFdWkygASW8w3xHBxtbAwQfukEHniv9CuL8bWhGNKOkX+Pl5fr8mf5M+JuZ4qjRhh6atTnu+/93yVtf722yd7hidlzLiRE2jD8ZbjjoNvtgj6VyvjnwZ4W+IfhO88AeN7VpdO1Ff3if8tYpUP7u4gJBCzRNzGRnn5TlSVPXKrKFWQgJgK0g4ycAnhu+Dnj1pslygCLPnau3Kjj5M4OBjp+XHr0r89hNxfNHRo/E6NWVOanB2a2t0sfgh8WPhb4t+CvjG5+H/ihvPYDzrG7CFYbu2I/d3MKZAGOFmj6pJlScbTWR8O/HvjH4RePtJ+Jvw0vJdP1nRpjcW11ECVjL/u2jkUjmOSLzIZI8EPGxB61+03xp+D3hv46+BpPB+uOtneQSNdaXfv/AMul22f9YBybeUAJMgHK8j5kWvwu1ew17QNbu/Dvia3ex1LSp3tb2CQqWgliOCA3I4GDu6Yww4NfqOW4+jmWGlh8TFSTTjKLScZRas01s4yV01t0asf0vwRxdLG01Vi+WtTte2mvSUbbfLZ9lY9t/aI+MupfHn4z6/8AFnULU6emsTQeTZ79y2kEESwQ2ysygMiImcgDJYnFebeDrHRtZ8S6bpWtukVrPcIs8s7mILE7BnUschflz7ZGBiuTyIwpiAk8wcMCQg2jOCcZBx1yMAenAqUsN5uFfkqrblC7c4BTrnnPDDHZdvSu3Kshw2Ay+llmXr2dOlCNOCX2YxioxWurskt3fufoKzmVTMVmONiqrc+eSeinrdp22T20WnQ/Vr/hYvw+ibzZte01AzYULdRsAqjH3UJ4CjgdfyrjLn48/CiAtHLrKzuv8MUE0mQoOMbkRegHQmvzZmuJJJiYYs43eYjMcDHO3sepPHUdvSo1QSyq7yrJ5aEnqQu0HdkgALz93dnP4V8ZT8NcNG3NUl8rL/M/vDM/2ifEs1/smAoR/wAXtJf+kzgfeN3+1F4JECJpenX99IuFCusVsh9s7pT3/ujsK8y8R/tS+JpZTBo9jZ2SMSFeQSTSrgc4aXEZ/wBkCP6cV843UEvmtIoLxuRyuTlsYwW2kHHAHQ/TrXPW+qaZdXp03Tpop79jGq21qvnSMSBwIYt7MwPYA9K93D8E5bT1cL+r/Tb8D8Z4l+mR4g5nF04432Me1KEYf+T2dRfKZ1HiPW/EfjDWpdb12b7XqNx5byMyAFti4wV4C4UY4UD09sTKx5xiBd253kPzIkQB+73xleufcV9P+A/2MP2rfiZDDPonge+03T5wSbzxEYtGtQCPvBbjbcPlT/yzgP5192fDP/glppcEyXvx08aTX+VI/s7wuhtoMdNrajeK0rLxz5VshPHzcV9hhcFJRUKcbJaLorH8mZ5xjQlWnicbX56km3J3c5OT1bk9XdvVuW5+OQ2tqMGhwxs15esRDbxKWuJg3ZIUEkr54+6pPr3FffHwe/4JyfHr4i+VqfxRig+H+kyIWP8AaMQuNWlQtlfL0xHXyc84a7khwCCEIwK/af4U/CL4TfAa1eD4LeGrTw6Zo8S3VvukvplwciW/mMlyw/2Q6L/sjpXoipE7DcNo53+mOnP1xivWo5V1qM/PMz49qS93CR5fN7/dsvxPA/gb+y98Cv2dQupfDPSvN8QBDG/iDVWW61Z0AwwSTYsVmh/5520cYPct1r38gsxkn4IJyN2fvc8EdSfvcgj8qFRN/wAmcKRjcD0z1x2GPb+lLvQoxUnbJ/FwAAecYxx6Ag9OK9SFNQXLFaHwmIxNStP2lWV35jRGySKrYyBkcfNwDg9OucDA9MGo5FZnGQQDySTngcEDoO/QdPyFTeUz8bNmcPxxwBwfbHY+lOhKSNwNgyuBkD5gBlceo59KsxAfulMeQozxtBGCB246cdMce3YjguJ5QixApySTIFCIoyzuzYG1VGWLYUAc8VyvjPxp4O+GXhS5+IPxF1a20TQ7Jgr3t2Sse8jiGJQrSTzt0WGJWkbPTAzX4P8A7WH7bXij9oi3u/BHgiG50DwCuC1m5AvNU2nKy6mFzth4BjsY/kyQZmcgBOXEYqNP1PcyTIK+OnamrRW76L/N+X5H0J+1h/wUKg1yK8+Fn7NGplbWQ/Z9Q8V2zmN5sAiSDSuhSMjKvffKx5WABcyH8mrK2jtreH7CiqiKVVEXK7eM7QcLx0OfXrmtLCTSqpUg7gqJt7sx4xkZx9NoH1r6m/ZN/ZA8VftNXSeKNTnl0HwNZSIt5rUUf7+9lQjzLTTVfiSQsMSTYMNt/tPhK8CdSVWXmfr2Gw2EyzDP7MVu+r/rol8kY/7Lf7L3jP8AaX8VSWVldzaR4U0iRBq+sqozASP+PO3DfLNfSIchfuQr+8l42q/9FnhHwf4Q+HnhTTvAfgSwj0zQdHh8mys0Jfy1+8zsxyZJXY+ZM5yzudx9BH4Y8H+EvAfhLT/BHgOwh0jQ9KQRWdhb/cjVvvMxPzPK7fNLM+XkYksT26Ro0TdGCdrMwyvYdxwM4B/+tXt4TBqnq9z8o4g4hqY6p2gtl+r8/wAtl3b024dY2wFwRsPP90EdgMc/4Ug6+Vjaq/NnG3nHI6ZwPX8qRf3hUyAM2NpxwBzg4P4c8ZqGdrYDcdhYYLMcgc9h246e3SuxHzhat4JryUWtkpnlYhIkwOW7DGemccnGOvFfgT+3N+07D8cviJH4B8AXZk8EeFJ3jt5YziHVdTCNFPfL0DQR5NvajnKeZJ/y1GPq7/gob+1Y/hCxvv2bfhzdeTr19AY/El/E219OtJlG3T4XXH+l3aH/AEgj5oYTs/1kh2fi5bxwRRx7AqRhcbVx8qrwcYG0MF4XHTpXjY7FJ+5HY/TODOHuVLG1l/hXl3/y8texfS5iVwxJjxJu+b5lyuQwAbAA5GMdq/0A/wDggOIof+CSfwrgjwFjvPFkY+i+JtRx9P6dK/z/AG3uLhZ45ASoc7UI+XORhOOc7cEcH2PAzX+gJ/wQIiMX/BJH4VE8ZvfFrY/3vE+pGvwnx0/5EkV/08j/AOkzP6J8NP8AfZf4f8j9isK3WjYlBiDnOM0n2cf3T/n8K/kE/cj/1P7p4xm4gx2mi/8AQxX+Vt8cfDEngz4/fEjwSrBf7I8Z+KLF4zgf6nXLyJQ+MMOg5PA/Sv8AVGmkWGLz8ZKfMP8AgPI/lX+ZX/wUJ8LXvw//AOCg3x88OatbL+4+IWtX6jJyItRlTVImUDBG5bkEejHI6V+rfR+rf7Riaf8AdT+52/U+I8T6f+z035/oe2f8Elr+G0/az1KyucI+peFNUiwWC7mintLk7c5/55seo+g5r+kVkDS7pdx5xtPXnvxnt04xgfhX8uf/AATTvT4f/bp8FWknyQ6lDrOmsynaHEmnXEijgt1kjUKR9M5r+oFZ7aaJRKx3HJYDnlQSSBnbjPGB0HTiv8x/2k+WOh4gUK3/AD8w1OX/AJUrQ/8AbD+0vofY32vC04dIVJL8Iv8AU/K7/grH8Vf+ER+AGm/CmyYw3HjbUB9pVAAP7P0dY7mUpzwZJzbgZPIB4xX87SrYwRtI/ltFFuZn/hZIzuYjGeevfjgV+gf/AAUz+J8vxE/at1fR9NlV7LwZbW3h+Bo3Lo08eZ71iBwCLiYxkDkeUvavmz9nj4YR/GH43+Fvh1eKgsby+V7sH5B9itVFxcjgYOYY2Rfl6nrX+kf0VeEsNwR4XYbE49cqdOWLrf8Ab0Pabd40I04td4P0P5I8bc5rcT8b1MLhNXzxoU/k+X8Zt/Jn7ufsjfDKP4UfAPw/4avozBfXkP8AaepbkZf9IvQr+W46ExR+XF6fIenNfSbswmCMPvA8AfjyCMct646emKlubgX1wNRKMPNKygbNoznpjOQBwOgxjjpVfY0K/ZWPY9D90j2461/h1xdxRis7zXE5xjn+8rzlOXk5O9l5LZLokkj/AGM4Z4fw+U5fQyvCq0KUYwXpFW/4LE27E2ryMgNtBIIwWIDY/P07dK+e/wBqL4vXXwP+BOs+N9Mcf2pMg0vS/UahdbkjdQVwWt41afbjny+eK+hkhjVGZSCIjvwP4Qo7569M59Pyr8Sf+Cj/AMS7nxP8T9O+EuhOGtvDEG+6U5/5CF4glYjG1W8m2EQUjBQswr9o+i14Xw4s40wuAxEOahT/AHtVdHTp291+U5clN9ufyPy76RPiE+GuFMRi6MrVZ/u6f+KXVf4YpyX+E/N5nFtB5NoRJDD9w4DiZhkDGTwQCck9c8etfqn/AME2/giJ7i++PmvRHZab9L0Xfk7ZCgF5dIWGcKjCBWUgZd1PQV+WXhrRNV8RazZ+HdDgNzqWp3UdjZq3yM88/wAiJz/CTIMEAdOeK/qR+HHgTw/8Lfh/pXw98M8WGh2q2kcmMGVkH72ZtvBeVyZW9z+Ff6R/Tu8W5ZLwvHIsLP8AfY28XbpSjb2npztxh2cXUXQ/g/6Gfhms24glnOIj+6wtmuzqP4P/AAFJy8moncTMn8C5H3gp9W4G3257UrKfnhBPyg7ie3TtxgdBTfMeTHmBeOBkE7cdAfVSD0H50BULL5fIHQE8DsMZ6EDHvjrmv8V0f6wkcjETKvQEg8/K3y5HBBx+XYD6V5R8a/i74a+Cfw01H4keIf8ASI9PVUtrTzlT7VeSnFvbIeT+8OTJgEqisxGBivWtjnapYhmP3WOTkYwQOcLzivwS/bs+O0XxP+K03gvSLsP4e8K+ZaxGJsJcXxHlXNwMFVOxl8qMkn5FYrgPX9EfRk8FJcb8TU8DWTWGpe/Wa09xP4E+kpv3VbVLmmvgZ+I/SA8WYcIcPzxlNr28/cpL+9/NbtBa9to9UfH/AIl8TeKvHWvX/i7xbei91TVLhrq7mk4Dys3AUHgKAAkYAwqgAAdK3vB3wm8d/EDwp4k8ZeGNP87T/B1pFPfkEiR9zoTDbj+KZIQ9xIn8MUZbuqnnNO8P674v1+y8I+GYRc6jrd0lpa2yltjvIcICfTjdI39wEnOK/e74WeAdK+CXhHSPAvhCXKaX881yy4N3ePjz7oqOf3xAVVOcRhU6Cv8AePNs0pZdQhSw8ErWUYpJJRWlklokkuWKWi6bWP8ABbjjjSeCXtpe/VqO+vXW8m357erb6H8/aTwPIiSSh0dVKuuGJXaD2XJ6fwjB6DOMV+j/AOwv8Yp/Ln+A3iCTY5aW+0I5IPUvdWC5yPlAM8QPVTKAPu181/tT/BZfg38RVt/DEDR+G9e3XulYGFt2jf8Af2ZOPvW7FdnQ+Syc8GvBdP1DVNG1Wz1rRbt9N1CxljurSdAS8FzCweNwcjOwgZxkEZU8V3YujSx+EtDZ6ryf9aP5o6cdhsNm+XcsX7s1eL7Nbfc9JfNH9ETq6vsQ+XwCx9AOuWAPG3n/ACKgZpfLTLMTgBgX4OTyPoOMYJ9x2rzr4S/EvSPjP8ObT4h6VGto91mC/sgdyWWoQhTNAM7TsG4Sw9jEy9WBA9HS4cyeYB0Y9wNvcYC4H/6q/I6tKVOTjNWaP5mxGFnQqSo1VaUdGvQrxbBKAIwDzk4IDY+UE8Y43ZXp6fT4L/ba+DC61oB+OXhWDzNR0aFLfWo1DH7Rp6AIlyAgzutThH65h5P+rr763TASfaVJIHzDIxjHqR69BjjNNj+y25BOJSweNo3VSjJjGx+m5ZASjDHTNdOAxs8NVVaHT8ux6OR5xUwGJjiaXTp3XVf1s7Poj+dETQSTP5n70RbQdp4U4BAyuV3EcgKeOD9Pp39kj4GfD79or4jXXwv8ceI9U8O3/wDZz3WltYQ2s/2xrc5u4m85lxNHCRNGqq29RLyNgB5T9o74Py/BX4hHw7YrIvh6+Q3eiSSgbFtvuyW/Usz2bfuiSclSjfxV5X4b8Q+Ifh/4s0vx34ElWy1zw9eQ6ppk5TC/aIWGzdk5aJ8eVMOjIzKeK/Z8LiYVIRqw1iz+mXXWKwvtMJO3Mvdf5d/Rrpqj9m7b/glf8BbcmS58deL7oKSqmOLSLcdiDxay8DpyMV2en/8ABM/9lDTWVtWPinWlGTi81mOFMgZ3FbO2gyAffpX158MPib4Y+Mvw30X4t+DFaLT9dtjOtszEm0uEby7qyfb/AB29wGTsCu0/xCu7zs+TZlcgknI+6p69+nX6Cvp4YOi0mkfjlfiHMYycJ1GmtLbbelj5o0j9iv8AY/0V47iy+GujXcqjIbVGu9Sk+X+I/ariRD06bce2DX0Z4bsNH8CQGw8BWFloVsF2+VpFtBp4IXoP9Fjj45OOT3q4vykZUHGD+fp0PTrxVYk5O4FsbQD7g5z6ce1dEKMI/DFHkV8ZWq/xZuXq2x5dJJ/MI3zMeS+SxAx354z3zipN6YOAML06gn9R0zTEbLt5g4Xfjnr07Z54+n5VKiSHhVwxyoByQFAIGGOOOxxgcVo2cwnmI6EKq5K4KrkL0GDz7/8A6xTxLtdiwKkcDJ9eOnOB09Bz0qNMSuEDADIwM4x/THHT07U2MSbFQgk45XPPrxjv+VAxByuVJPc7W6e/vnvx/hTvnZimAR0JPOfzH/6qsW0E2oSm3s4zLIQW2xpkjA6nGePc8DufT48+OH7cf7PvwRaXRl1EeMPEds3z6ToEscq27EjH2zUcNbW4HeNDLNj/AJZZrOpWjBXkdWEwNavP2dGN35f1ovwPsizinvXEUCeYxViUABIRScnOPugHOc4A64xXwD+0D/wUE+Evwiebwv8ADURePfE8TGArbSY0eyk44ubyPLXLA5xDaBuRtaWPt+VXx7/bD+N37R1tP4X8R3UWg+F8sDoWkGSK0cDKj7ZMQJb1mOMCRvKUD/VLXy2ptrWGKCIKyoF2qMoqZ42x7QMDn/Irxa+aN6U9D9HyfgSKtPGO/wDdW3zf+X3tHpfxV+LHxT+N3i5PH3xY1WbWryHctrEyLBa2SHJ8qytBiKBCv90GRsDzCx5rzO5a2sk+16tIqpEAQ0mRtY7lXa3ByCAuAOvHINeu/Bn4HfFb49+Jz4c+E+kf2zJZSBb2+mPk6dacg7rq7ZdkZzgiIb5Xx8qHAr9yP2Zf2JPhb+zY1t4wv3HivxvAu4axcRFLaxfGGGmWjlvKx/z8S7p2GSvlL8tc1DDzqvQ+izXPsJl8FT6raK/q0V/STPiP9lj/AIJ1654pitPiH+0xbXOk6FlZbXwy+6G+v14w+oFcNa2rdoARPKow3lofm/aK2gsrO1tdK0i3itbWwijtrS1tYxHBBbxgLFDFEgCRwqPuqoGOvXmpFZnG+QYdmyxLFjxySfXnsTz70itG3mI3TdvJ9hySVwecY9uOO1e9hsNGmrI/Ic3zqvjanPV2WyWy/r+uhNCFaTbCCEUHcynJyCeox047DHaohvZUaNC/QYYAA4wM4xx9OlEghYmNWHygbs9Pvdseg5//AFVFJIuPNuAyru3bXwNu30J6cHoeO9dFjyhGkg4L/vEA5P3QvfjjIU18QftoftcR/s8aX/wgfgKWK58f6pAssZZQ8ei2sgGy8nQ5D3Umc2cDcHHnSfIqh5f2xf2x9L/Zvtm8AeBDBqfxEvIN8UTqrw6KjruS7vUJ2yTMPmtrT+PiSXEYAf8AAy+udX1G/udX1K+uL7UtRlkury8uXD3FxdEhpJbgscuz9c/QAALgeTjcdy+5A+74V4W9vbE4le50Xf8A4H5+m9eOxuhcE3UklxNLNJJcTXL7p2lkJeWSV2y0krMdzO3Jzk9a3IfDHiOTwbJ45htv+JPFfLpS3LbQr3ssRuvIjY8sY4l3SFR8gwOpwfRfgH8Bde+PvjRvCmlP9g0nTsHV79lP+jRuNwjiJ+/dTbQIozwoy7/IlfaX7dtl4X8EfCD4e/DrwrZjTtMs9SvZIbSP+FLW0VAScEu7PdZdzhmZienT5KvmsYYiGFhq3+Ctf8tv+GPtcfxFTpY6ll0NZy3/ALqSb+920XbXtf8ANmCBku44EYpkmLaDlWVsZ2tzknnHHpiv9BP/AIIO2Nxpv/BJL4Mw3S7GubTV9QAJ/gvtavriM8eqODX+fKl62nOuq3LeUkWZWyx8v92N4yvtzkZz2HAFf6TH/BLTwX/wgH/BNr4B+G5IzFMvw+8P3E6Hqs13ZpdSqfcPMQa/KPHmvy5VSpd5r8E/8z9q8MKd8VUn2X9fkfewx6ZpcD0p67APmP6U7916n8q/ks/bT//V/ujlUyRFegIwPxFf58n/AAXi8Caj4N/4KqfEvV9WRDF4x0nw74ktVC7i0LaYukupHy/8ttNkPHPPUdv9B0Nk1/Gd/wAHPPwz/sL9or4O/G+GTA8TeGdW8M3GRhY20S9hv7YZ9Xjv7g49E9Aa+y8D8f7LOvZfzwa+60v/AG0+d8Q8Nz5c5L7LT/Q/n9/Zr8YxfD39pb4e+N3PkW9h4i0w3EwztSBpkhlXLc58uUjBYevav669c8Q6P4F0W/8AE3iMkWHh2G5vbt/l2+RYRs0mMf7CYBODlh26fxQ3loJUntYAOQY1Yc/Oo3DDKSN3GM+3HSv6Uf22vjja6n/wTz/4WVaTC1u/iPpWkW1vtYsd+rmOe7j44JEENwrd1yfpX4X9PfwjnxFxNwzCmtMTUeGlJfZi5wcX8lOtLyUWfrX0WuO4ZVkucc//AC6iqqXf3ZL81Fed0j+cXV/Euq+KtUufFWus323Upp765bhvNmupWnlYE/NkFsc9+Pav01/4Jh+Corvx94v+IU+7Zp2nW+k2+8ZXffS+exBbkGOG3AGP4X4OMV+XygPNtjiLsM4UKOGb7pXthRzhT1PHpX78/wDBPnwn/wAIp+zTY6wSu/xDe3WqZfG4RBhaQjnGAyW+9ccc8HFfvH03uLoZR4eYmhQSg8RKFGKXRN87SXb2dOUPR+h8Z9EfhueaccUcRV1VGMqj82lyr580k/l2PuRfJiHzDDctIv3gRtznP4/ke2KqfvVUh8Ptz8q4GQ3Yc/Qn8gcComwzcDIH8OzI4HIU/gOhpjARcEErtyNyg7jwOMHBPH5V/hNGJ/sPYxvEfibSPCXh3UfGevbvsGlW0t7dFeohto2kkwOpJCYGO5wOtfyueK/EOq/ETxRq/jLxKI31DV7uW9ux8uwTTv5jIgOCFwAqjgrjjA4r9yv+CivxAi8Ifs9v4VhcC78W38On7idrC1tcXVy6Afwho4om7fvPevwhkuzFcSRs7I/QxNwE+fOGXBBycHPB+tf7Dfs7+AVg+HsXxDVj7+JnyR/690uq8pVJSTXekj/L/wCnJxo8RnOGyKm/dox5pf4p7fdBK3+Jn6Df8E6fhqPFXxmvPiNMita+D7TzosqMNqN8ptrcFGHO2PzJOPusqc1+3sPlKgjYbVj4xkdBxx6jBxxxjn6/In7CfgBPBP7OGlX7x+Ve+KpZNakDZUrHNiK0C4x8v2aJXX/roeB3+xG89YwbhSHQk7eGB9BnHp2z0xX8MfS+8RHxFx5jJQf7rDv2EPSndSt3UqnPJPs0j+xvox8CxyLg3CwkrVKy9rL1mk0vK0OVW7omPlxkRSLxjPTgn7v6dv6dKj3g4CEEAbhgH9P5etRyCJEIDd177QVxj3zzz2HbtTpJU2PhCWUHCqc7yR1wM9+MentX8xn79Y+Yf2v/AI5t8DvgvqF/od15Gv6m76XpRjOWjmkQtLcYXtbxAlWwQJDGD14/nY05UsII1tT5ahcLIgOfmHzEdME8HB6ke9faP7dPxUvfiB8e7zw9pr50jwejaPb4b5ZLgENfz4GCN0oEGR2iTkdB8oeCfCGvfEjxPo/w+0AlL/XblLOOTkC3EmWaZlXIZYoFaVx2C84PT/eT6IHhVHhTgulVxEeWvikq1TyTj+7i/KENXH7M5zR/jL9KrxOXEHE9WNOf+z4a8I9tP4kvm1v/ACxifoB+wr8JJbTSLj46arGC9+j6do25R+6iBEV9d9DnzGT7LGf7qyEEhsV+hcfnKpi83JMYw/Gfm4AOMcDpjt+WMnSdK8O6BpVj4c8LW4tNK0y3isLGIrtdbW3jCxFiBjeUG5+m5ia2N++TEO5ogTz3O7gAAD8B7gHHYfoWY4+WJrOrL5eS6I/zF4hziePxc8TLZ7Lslsv8/O7PLPjR8KLD42fDm8+H8ixQ3+VudMupQF8i+RSICcrny5MmGXg/I2SDtGPwelin0+8l0/UbRrC7t5WguYZfkeF7d9skLcDBRwRx9a/oyMqAMMcLja4XGf8AZ+bPPHPPbtX5pftzfCBNMvI/j54diCpeOlnrixqoVbs7Utr7ABAEwCwyHHMiqT80ma+j4SzXkqfVZ7S29e3z/P1Pu/DTiD2dR5fV2l8Pk+3z6eaSS1PEP2UPjTB8IfiQ0WvXWfDXiQxWWpylflt58n7JebgeBCz7JO3ks3dVx+zkoeC5fT7pZI5YX2vGxUbGTqMDOMDgY7fr/OZcReYpt7nBRk2yLJ8qshUtsBIGflz0HQV+un7Inxlj+JXgaXwN4hujPr3hKOOLfK6s11p5wlrPlgGLQfLBLknpGx+9XXxdljf+1QXk/wAk/wBPuPT8S+HeeKzKktVZS9Nov/23/wAB7M+uWjV2KgLggDbtGASDxt7fUenFS8+WDPnaWxtBIxx698DtwOMCkGVZPMO3awwGXavygDjqOp7fgKSOMJGSAUQ/NnHUKecEcnPHT0r4TY/GDxX48/B5Pjd4AuPCtsBHrds/2/R5zhcXiLsMJfd8sdyq+Ux42/I+PkFfhq0LSb47y1eCaN9jwzqweJkYo0TA4IKtlW4yCO1f0deSJkETYCluWAzz908dOAMZHI7V+XH7bvwc/sPxFH8bfDg26drFykGqqnAg1HaRHcMB/DdqnzsT/rwSSN4r7ThPNeSX1Wb0e3r2+f5+p+seGnEXJN5dVej+HyfVfPp5rvI6z/gnJ8ev+EB+JsnwO8TXSRaF47eI2DO+2Kz1yJAsA3NjC6ggFsxwP3ywk9Sa/ccrcI0kci/Nk5G3ofQ9hjnrzmv5Fr2AXMJgtQUXl8q5jdSDvXy2HIZMZXbyCB2AFf0C/s1ftt/Dr4q/CeLWvjZ4n0fwz4q0d4rLWDq93DYpfyBf3eowCXaridR++RM+VMG42spr9Zy/FJLkke7xtkMnJYyjHfRpfg/0+7ufcbNHvQErlORtwNoHqc8cjpQjoB+5TIwc/KAMcdDwMZPr2r5b1f8AbZ/Y90Fvs1z8TdGuXAOBp0N7qDf8B+yWroOMcZHSvJvEf/BTD9mDTA//AAjyeJPEjxDKfZ9NTT49oPQzX88ZCgekBPTjtXovGUl1PjaWQ42e1GX3NL8dD76lcB2igOXGNhTJAB9Bjj2ParC23mSfYYFMk28ARqMtt4PQdfp/Wvxo8af8FU/HU6vb/C/wFpWmBQQLrXb641ORVXrm2s0tIQ/IwC8ij0r5G8f/ALZP7VnxDs303xD471DTbSRSBa6MItHgKuuNn+hLFKw4/ilbjoecVy1MzgvhPcwvAuNn/EtH53/9JuvxR/Q98QviH8PfhTEt38W/Emm+FlYfLFqd0kM8gHA2W/zXL5PQpCcV8AfE3/gp38JNFaW0+CegX/jC4Bwt9qIOi6Vg8Bgrh76dRx/yygX/AGq/ENbKKC8W8S32zuA8kxIMjEEs2+Q7pT8wUneck8CpHt/lLsjSBf32WP3SP4SCDgk/f5wD1riq5jOWi0PrMBwHhabvWk5/gvuWv4n0R8Yv2tP2ivjxBPo3jXxHPbaHLlDomjJ/ZmmbefleNG864JHH7+STPHHQV88IFhijtLWMW8UfyxxoERQW+bhflXvzkDHWu9+GXwn+KHx11SXRPg1oV94qkjO25ksk22sC7uTNfSMlpBnHXfnA6Hiv07+Dv/BL5Izb6v8AtE+IhLtQb/D/AIbkwp+XlLjVWVScjIZbSFe2Jq5IUp1Xpqe5icywWXU/ZtqNvspa/cvzdl5n5T+DPCXjT4l+KrbwN8PdKu/EOsFRKLCyQyTRL3d2BWOCPJU75nRAehr9Z/gR/wAEx9Ps47XxL+0xqAvpAf8AkXNGuCLbAAO281NQkkxGfmjtgiYGPOav0+8C+B/BXwv8NL8P/hfo1n4a0ZdrfYrBBGspUD55n+aWd+P9ZM7t0rejeIFHL4R+RyAMHjoO5HQV6tDLUtZ6n5/m3G9et7mGXJH8f+B8tfMq6HpGg+GdAtPCXhGxt9J0iwGLXT7CJbe0gBIJ8uNAArMTlm+8c/MTV8IVx127F5B64OMj/P6VGMnhhlm4AORzjnGMgcDHTFKdwkyirnHYAdBt7D/Ir00rKx8O227smw0pBiOACABwoPPr+vTIqshdhiZsL1we49sf5xUckiqVfaxORu28EAgfwjOOv9Kjv76w0zSrnWdcvLfT9PsovPu7q6mS3toIk+9JLNIVWOME4yTznaATxRewkuhetw88qhMuztgAcksegXAzzwBX53/teft2aL8G5L74Y/Ay4t9Q8c2+6K9v8LPaaG3IMarzHcagD0j5jtyQ0uW/d180/tQf8FF9T8WW9z8Pf2Z5p9J0qSNorjxMweDULyPHKadGwElnbsobNwyi4dfuCFeW/L/+z7WxQx2EeyJI/LQRj5Wzz8hG7uepzv68GvIxeYX9ymfpHDvBbuq2NXpH/P8Ay+/sWNRmu9QuZr7Vrhru5vJTNc3c7tLNPPKwaSWV3yXkPVnPJJ/L2j4JfAfxN+0F4qm0zRymm6VaKg1LUzEGS1jI+VE5HmXMvPkxZwB87kIOdr9nr9m7xZ8eNSkvI5P7I8L2cuy+1opkGRcA29mhG2e4weSR5cP8WWwrftZ4X8IeF/h14Xs/BXgKxTT9I09W8iDeWbey7pJJpTgyTSHDNIy56DAAAX4PO8/WH/dUfi/L/g/169XGPG9PAReGw+tX8I+vn2Xzelk6Xg3wb4V+Gvhmz8D+BrX+ztIsixiQNuleRlPmTzuVBkuJdoZ3P+yq4UBa/OX/AIKHa+s/xA8F+FwVVdO0e6vjtYA+Ze3QiA7gfLaHpwcdgBX6hqY0gdLdvm8s+XwM5zn3PBXoePevxa/bV8RHxJ+0z4ginYmHRILDRl8sDBe0tQ8waPp8s8z/AMWR9MGvnuF4OeN5uyb/AE/U/PfDinOvmzrz1cYyf3+7/wC3Hx14us9SufDd9punxm5u7+0NnbouWdpJ2FtAuMDne67fXOBX+sn4M8HaP8PfCemeAvDw2WGh2drp1uvpFaQRwIPwEeK/zSf+CfHww1H4w/t9/A/4aWdus51Dx1o+oXETdDYaLI2tXAYck4hsMY4AXjuK/wBNaNklBuEBUS5k57FzuIr81+kDj7ywuGXTmf32S/Jn9x+F+GtSqVX5ImOM9P0pOPT9Kf04yRij8T/n8a/nA/VD/9b+6I+3QV+An/ByD8JE8Y/8E+LT4tRKqyfDXxhpGsTSdH+xalv0O5VTjhAb6KV/+uQzwK/f4r82K+eP2tPgJp/7UX7MXxC/ZyvTFF/wnXhvUdDimlGUt7i7t3S2nxjrDP5ci+hUVxcI5r9RzOhintGSv6dfwNc4wnt8LUo90f5eUcEsEyRSqI2V9204GSmCOwOeCFJIJPHNfWnxX+Mn/CS/sZfCr4Nwzsv/AAi+o+I1vo2IJl8uWF9OfbgErHBezRjIBLK2OOnx3Z3F3daLFc61bmGZ4PLu4ZYgrxXEWFnR8jjEgeJuhHYZrRuELM8e9Wjj2LtTa3y7Rxxj5eBwo6ewxX9wZ1wzhcfXweIxKu8NUdSK/vOjVo/gqza81Htp/O2WZ5XwUK9Glp7WPI/TmjL/ANtS9CjK32e1lMPms0UTFM539geF2gfN06MT1xX9UvgPwofh54F0XwMjqw0LTbWxLI33vssCRsc9huBz6V/Nv8BPCMPjT45eCfBjxiaC91uyiuFx83lCZJ5QyvydsS88dOa/p5mlaaVrhk++3mYxhcMxK7QCezf4Zr/M79pLxH7+U5NHoqlSS9eWEPu5an3n+gn0C8itTzHM2t+SC+V5S/OA0R7jnqeSeowvbGOmOh9KSUyRLszluCGXg8dsdzkcY6fTigLId25VXPO0DGCCM8cfX0/QU5bdS32ZSB5n3c5znIAAxjYRn07Cv8uttz/Q5H4f/wDBTHxmNe+Kmi+BInEiaBpKs64GUudRkEz5wmf9QkQA68dhmvgTw34avfGfijTvAmkNtu9ZvrfT4N2f9ZdssanLDHG4EDj9K9l/ap8Tf8Jl+0f401+WMFRq0lukwOB5GnhLNMZOOfL6Ad8iu9/YJ8Jt4q/af0G/mijntdEt7zVptwDD9zGYYmTOR8txLHg+2eBX/QbwQ1wP4XUK1uWWFwntLafxPZurKPbWq2vVn+KXFafF3iNVpLVV8RyJ/wBxSUE/lTSfkkf0E2Om6XosNvoeiwJb2NiqW1vGoxtigRIkAUf7KjHfBqysMQUQsu3fwCV6dew6DB/kDUcHMayRYHTAGPbLY9j/AC7dpBsEahQ4xyG+8cj144r/AJ+Kk5Sd5O7P9radOMIqFNWS2Qse75GOcY6t/d6djxxkfXpXk/xl+Jdv8JPhb4h+Kc5jQ6HZPLDG5G1p22x2yf8AA5mjHAHAPWvWA6kq4zjoNvByBlen1z9fTpX5jf8ABTHxtPYfDvw38M4mZP7cvpL67KHg2+nrsjUqDlleeXeO37vOM1+s+A3AMeJ+MMvySqr06k1zr/p3BOdRf+C4yS87H5z4wcavh7hjG5rB2lCFo/45WjD/AMmaPxuj+2RIIb1jNdSElpOAznln3N1di5Y/NjGOe1fQ37KfxJ8P/DL4z2Wr+LY1hs9YtZ9Ja6kADWL3pTZcZxkoSgik44jcnOFr57nSby+N4jYbsbwA3G484z1H5de1V5khntLi2tk81cYZdw2kPgHIYgcHIGMbicjmv+izF0Y16coS2l/X9LY/wSx+DjiaUqFXaSsf0b3iyRSsl0mwxfu3RyBtO0jjt1GPl7+9KDumS4/i+XaGAJxxg844HYenpXzN+yf8X5/in8MV0/VpvM8QeFxHpt+rMfMntnG2yvDnGN6r5Ehx/rIiSRu5+l4fLcIA+BJhU+YBsdBlh0Ixg4AyfavxbE4aVGo6U90fyrmeXVMJXlhqu8dP+G8mtV5CRq7DfFhwV5JXBPYfd/D0qnr+laL4n0O/8L+LLX7dpuowSWt5C+NrwuAG6DCuOqN1VwGHQGraojokoHykk4/2gMHHGKePPRwCd6jp82CTtA4x+GOOM59KwXdHFCTjJSi7NH4E/FT4b6v8HvHt94B1eZrg2LCa2nzt+12L5a3nyM/62NRvHQSBkP3apfD3x/4i+Enjyy+I/h5t95YO7NE2Al1byKEmtZM84lQhc9mKN1AFfq7+1h8F3+KngBNc8OQ+Z4k8MCSe0UN89xaH5rmzBBXlQPPhHP7xGAAMlfjOjW88P24ZaIoH3S8sYx02Y6/3sYHTOBX6zk2Yxx2G99a7Nf10f/A6H9NcMZ3DNMFzVEm/hmvl27SX6rof0P8Ahnxd4Z8ZeHdO8ZeFp/O0zV7dLmylPB8o5DJID0kjZWjkA4DAr6VtoUgMhKbMEk8bTt9M8cZ445r8uv2J/jK3hzxafgn4rucaX4mnE2lucqkGpsozCN33I7sKDj/n4C4OHNfqaqmMjdhG3KDjgkhjgADj2xgV+c5tlssLWdN7dPT+tD8F4oyGWXYt4d/DvF910+7Z+a00I1+SWNY8OU2tnByACQB/ujjHGa5/XPC3h3xZoF94X8WwPcaXrNvJaXMeeXjfA3Rt2kjYB43A+RwD253WQKED5YKWXAZQu7dgf7Qxxx2zxx0mdY3cRttZtxB6LjHQZHI29Pz+leapNO6PAhUlBqUHZr9D8Avih8L/ABF8IvHV98OPEp8+WyZWtLwLtS7spc+Tdja33HXh1/hkVkPKmuFLKjC4uJRlDiJgucHp8pXd068+x46V+2X7R3wG0/46eAo7XSAp8Q6QrS6S5O3zt5zJZSNnhJxgx8YSYIfulq/Ep45QsySROk8TGGZWUo8TIdhSVeSjR8h1YZ+XtX65kObLFUbv4lo/8/Rn9M8J8SRzLDc7+OOkl+q8n+Gq6FkveM/2OUlvKcISzHAQ9V+93JzjHXNNje5dtjRCU7jE5kyDtwBzwGTkAn244rufhe/whX4kaWfj6uqQ+EpXMGo3GkXK291Zxy/duiTbzbooSd08ShXZMshJTa37xaP/AME+/wBjTRPKmk8JyeITcIskVzqms39/FNDKA6SxiGaCBkkjIZSEIIwRxxX0WHw8qmkTpzjiChgWlWi9drJW/NH86V9e6bYsEv7xIZD5ZSOVhGS2eBhiCOOij04Feu+A/gf8bviwjL8M/BWt67G+5TcwWLxWpUHIDXVyIrYbcjH7zGDx7f0veDvhP8JPhqQ3w18I6BoDqRtk03S7WCYkAYUy+WZS3yjDFua7u7vdQ1U+ZqNy10WIYGRnfBHTrnH+R2rvhlL+1I+TxPiF0o0vvf6L/M/DjwF/wS6+NGtyfa/itruh+D4dpkeC1Da3dj5du1o4mitUwT3uHAxkjHX7x+HP/BPT9lf4fPHd6vpN144u4jGySeJ5UmtVKjH7vTbVIrXacdJfN7ZNfaCm2I8k4ZBjlRnp6HGAOPpTz9obDsh3/wB0c4GepORxx/LFddLAU49D5jG8WY+vo52XaOn/AAfxJiBHpsGgWYVLC0QJBZwIlvbxBAPlit4wsUf4KAarM7LIHO0hgFAJBHHTcPTnr2PSlcBwMrkNj2GeiqARgcenp9Ka5HzMW5LH5lznHXJ46c+mPau1LQ+bHM0RG1cAIc44HHGd304xUyyFiyfKB/s/NgYx06r64IqPdtyTnrkdsAdv0BPbgY9KUMpXCnfg89funscDHXn/APVSQxWldU5YcLhUXjGevA7e1VfM+YjnBAzu5GCB9COg/wAcVleKvFPhjwJ4TufHnjzVbPQtDsvkuL/UJVgt1YgDapf5mckYEcYLk8YzX5MfHr/gpxeXpn8Ofsy2bW8OdjeJNYiAuHJOM6bp0mUiDbfkuLzc47QLjJ56uJhT+I9bKskxGMlajHTv0X9dt/I/RT4+ftD/AAt/Zq0SLVviRNLJqN3AZdP0OyKnUb9efmCMQtvbdmuJsJ0C+Y3y1+Bnx7/ah+K/7TmoIfH1zDpmi28nmWXh6xfbp9o+fklnLfPeXIGFE0mNv/LNI1rwfUr7UNZ1+68Q61dzalqmov591fXczS3V1JnOZZZGLucr/E2ABhQFwDN4X0LxH411yDw34NsZ9U1W9A+z2ttF5ksgXByQOFVeS8jFVUfe2gV4WJxznq3ZH6zknDGHwMfay1kur0S9Oi9fyWhltI/2V2klIiIZ2WRlG1ducsR09R+uBX3B+zh+x/rHxMlt/HnxRWbRvC+fNt7WPNvd6mOGwg6wWp43SbRI6/6oBfnH0f8AAL9i7w58O5IvG/xb+yeIfEETeZHaRnztNsGjAK5HlgXk64++wEMbfdWT79fdFzJPcO4uy0kkjfvN33jkcnce2O/oOK/P834m09nhfv8A8v8AP7u58JxZ4kKN8Plj9Z//ACP/AMl93SRU02w03RrG20jQ7KHTdPtYEgtrW1XyoIowARGqA4A3c9M5OSSQatIVMWzGCW5j75bHb07H/Jpnmb5CQ2V+6SmAecKPTkgcY6+3ShmG0wZ4BGB065z6cf4DFfFn4vJtu7Lttc6Ylx9t1x1S0tt09zM2YwkEKtLIWbttRT9BX83eteIL7xrruqfELVkKXOuXl1qMpCYJku5ml2gLj7ocAcKPyxX7YftaeMP+ER/Zs8SyWUxjvNcMWgW+C2D9u/4+DuAONtrHNz/tDnPFfiRuV4itp5YYqFCqD8yEDywzY3bVx29DxjFfe8HYb3J1e+n3f8P+B+3eFWA5MPVxL+01Ff8Abqu/k7r/AMBP3d/4Nzvgh/wsT/goHe/Fi/s2ey+GPhO/vIbhVwkOqa9MmmWwPubSLUNo64/ED+7HGBggLgYx/ntX85H/AAbR/AVfA/7IvjH9o3UYMXHxQ8UTJZTZX97pPhxf7Nhyq/d/0/7ewHdSG71/RztwTjvX8veMGbfWs8qRjtTtFfLf8bn9v8D4H2GXQut9fvDn+A0fP60oB7YpdrV+Xn1x/9f+6bJxx+FK7yAL5H3l5XPTI5H5Umedp7UmMDjivkEewf5yf/BXL9nhf2Y/+CjHxI8GWSSQ6P4mvU8baIXHy/ZPEZlmuECKAvlxail8ijqiBMZr80ZYkhhZ2QmH7vmbNoAXkIBt4C5B55wRziv7If8Ag5l/ZiHin4IeCP2wfD9vvu/Aupf8I9rMiqoH9keIJES2llclWYW+qR28aKOFW7kPAzX8cLiSSQTMDlMNgELjqBzwCAeOQCBxk1/dvh5nqzHKKNdv3kuV+sdPxVn8z+buLst+q4+cVs9V8z69/YH0pdQ/ao8OXkW0/YbbVboKBlSyWUka5J7h5Afr046f0JF1aYCJAoAQLgYIz05+bGMDsP6V+F//AATaSC5/aF1D97uEXhe/lixxybi1R+QuG446Y5HHOK/dG4UPc7Cd2P7w2nJ9s8fXpX+Qv7QrHSrceUqUtqeHhFenPUn/AO3WP9R/oSYJUuDpVF9urN/+Swj/AO2gsbOmCMkttUMMZz1Cj6nnnHGB0rI1DW7PQNIuvEWoKBaabby3srY6LbxtKecdAFHbOOPStF2aP5ZJDvGCTwNvy4OAPwwPevn/APar1mPwx+zf441SY5VtHktFXjKvfFLRBjIAP73vzzX8d8H8PPN83wuUx3r1IU1b+/JRVvvP6j4mzhZdlmJzCW1KEp/+Axb/AEP5tTcXt75M960zXV0DNIXznc7ZYnHB3H+HtyQcnFfqh/wTG0Czm1Xx34vuYz50MGm6fFKzZIFy0txOvQdoYs8Y7HNflRaxbpWjYo4UfcVxzywT7vGSFyMcZ4I4r9x/+CcXh+5sf2fpdWukwdZ1y8miZQE3R2iQW0eM9Tvjfj1z61/t79OXiOOC8PMZTjp7edOmraW99VGl/wBuU5K3Y/yR+h/kbxnHOHqS1VGM5v8A8BcF+MkfoApyN25myDyT3PQjjtnpin/vM72AK+XkEjpj5TgDGP6U7fndLHyzZOAPcYHouOnFPlKJLyR1yABt4HI54+70/wAiv8I2f7GXEnBhjC44QEkdD+I7+2Mf4fgT/wAFCfFb6/8AtH3ejx4ih8O6bY6SuCfvMpuZCOD0a42knA4HpX75xok8q2pACMyAdFHzMPbjjjk8dq/l2+LviU+LPir4n8XW7DZqurajcKWG1dsty4QEoQceVhfvZ6Y9v9DP2dPC6r8TY3NZrSjR5V5SqSVn/wCA05r0fkfxF9OjP3Q4dwuXRf8AFqXf+GEXp98ov5GT8PvCn/Cc/ELw58O7UOp17WNP01jEcsEuLhI5NgYY+VGLAnA6dunTfHf4T+IvgN8VvEHwj8SOJ5NHm/0W5RcJdWUhLWN3GOeJ4iHOPuSBozllNe9/8E+fC0fij9rjwpqW3fF4fh1PWnLDfuaytGSDcP7vmyx559Bz1r9Hf2//ANnb/hbvwsj8d+ErUy+JvA0MzIkSbp7/AEgHzLq2CgcyWw/0mDv/AK1V++K/uTjv6QVLh/xCwPDOMaWGr0lzS09ypOpKNNt9I+5Z9Eqim7KDP818Fkqr4GVeHxJ/glr/AF5WPxq+D3xQ1H4JfE+08eW6td2sK/ZtRtYQM3VjKR9oiClSpYbPNiK4IkVcY5r92LO9stRtbfWtGnS7sr6CG4s7iPcRcQTjfFIg/wBpT0YAggg9K/nRtHtbtRLasAJyrqqYKndjaC390sR83X+n6G/sOfGi4stQb4Ea1KTBcs934flLbUWb5nmss5YbJeZbdf8AnoGVQC4FftvF2UylD26XvR39P+B+XofiHiPw19YofXaK9+C184//AGu/pfskfpRsCSFtuDHlyBhcKM9OnB45wBjtSBGibYFHyDBAPVu3QdwMU3ZFJF8irIHw4ABOQehwcds8+np0qSVvmG0A8Ejbg8gqMfQZ6H27V+cH4ONXzLK5Sa32l4SrK4HQ8enAwPb2r8if2wPgLB8M/FyfEPwjAkXh7xDdMTHGhCafqJUySQLn5Vhn+aWE5AGXjx8or9c228Rkbtuef4lxgD2zgc8Cub8W+GvDPjzw5qPgXxfCLvSdVgMEwjx8mDujljPaSFtrRt/fHpkV62TZo8JW5/s7NeX/AAOn3bH0vCnEU8uxSq7wekl5f5rdbdtmfz2zLcSR5j3LjbgozKwPYgkDaVbBXptIGCMV+3X7N3xvj+N/gKO+16RF8T6MsVtralcNOx+SDUEwMBboK2/+7NuX5VK1+QnxO+HviD4WfES9+HXiZhcXNkVMNzGm2O4t5SWhuoi3UTLjIzlZAYzytHwj+Kfib4O+OtO8feG7bz2VfIubRDtW6s5MebakEDDMAroSDscKe3P6HnGWwxuHTp77xf8AXR/5H7nxRkFPNcClSa5lrB9NVt6SVu1nZ9LH793AzJGEbGQAGXg+gJ6c9Ppg04y7BiL7p+TBBG30AGR33dD0rn/Dninwv408L6f418LXIv8ASdXgFxa3H96PdtdHTJ2SxvuSVD91gfatqVHM+2TcWU4LZzwBgjPcd+OvavyeSs7M/mmdOUJOE1ZrS3a3+QTwxTjypFDY9AAMEjjGO2OMfoRX57/tn/AI60t18fPBNqX1C3jD6/bLz58KABL+IY5aMfLdAD512yY4ev0NWIBQr7jyTu55YgYIOPoBu6VEZZ7VorrT9kc2Q2CuScep5H4EEHnscV3Zdjp4aqqsP6XY9bIs8rZfiFiKPo10a7f1s7PofzlGNXiP2d12bV27DlTHweG4HBPbr14r9Hv2Hv2xrT4SLa/Aj4z3nleDbnJ0jVZ2JGhySsc29wx5/s2WQ8N/y6Snd/qWbb55+1P+y5D8P1u/i18MLUDw2z51DTkX5dMMjf66Id7Jn+U85gchSTHgr8RCNMhmUK1wv3Dt2nzDgn0A445xjtg1+v5ZmMK0FXo/8N5H9GU6mDzfBXjrB/fFr8mvut3iz+ueezl0yVradPKZSG2NgckZXBHDLjlSDtIOVOKEDltgxgAFGBxgs3H3v1x9elfhJ+x3+3Fd/BGytPhP8ZXnu/A0S7bG/IeW60LkAptGTPpwHLRY8y2+9CGTMY/du3u7fULS11zR7uK+sb2NLizu7V1uLe5t5ADHPFIuVkVgfldOOoOCMD67C4pVVofkOc5HWwNTkqbdH0f9dv0sx8hdGJ27RwVA6Ek8dM8enHSoUVYl2w4znAzgglR93PB2gjvSMYYWMKkcnIGACPl7d8EjGQB+VO1r7P4Y0V9c8Z3FvomnL9661KaOyt8beokuWjX8sjHauvZHjpbIfGsiQ4dugChQMgrnB5xx6Y44pv8AqG81fkC5JJIHy5754+uK+MvHf/BQP9k/wZI0eheIZ/GN0pKeT4ctHnj4YIQ15c+RaDGc/I8mMHivg74j/wDBT74w+JCbH4TaTp3gu0dVVLucDV9SOeh8y4jitICB/CltIR/f+XNcdTMKcT6HA8K4+vtT5V/e0/Df7kftL4u8Q+FPhx4Qfxv8RtRsvD+jxDyzfalMttCSCflR3w0rtn5ViVmPTbX5ofGb/gqN4R0i3udN/Z50b/hIbyJiqazriPbaeCAAWt7BSt3cY6Dz2t0z1Qivx48Y+MPE/wAQddHjT4gaxe+INXkDb7rVLh7qfJ/hR3JWLrwkSonHSsR2WG5FhcNIu4gMGbafkOPvBW64Xd+nNeZUzGUlaOh93lnAmHp+9iHzvtsv83+C8j0D4lfE74mfGHxLH45+LGqXfiTUIvkt5Ljb5VmvQLa26AQ2yZUcRRrkD5jXDyCWONp5n5R2LbwuzaFP38Nux3zkAL29fS/hl8Fvir8cLhofhxpL3tmjEXGpynydNTjDiS5YBGx18uIvJjJ29K/UL4O/sU/DH4ZPb6747kTxfrKOGR7mPZplsyEDdbWbf64oFwJJ844xGDzXy+YZ3Qw+k3d9l/Wh6ed8U4DK4ezqNcy2hG1/u2ivW3kmfCfwP/ZR+JXxkjh13UAfD3hq4ZW/tK4UeddIvaxt+GlA7Sy7IQo4L/dr9afhr8K/AXwW0OTQfh3Z/ZLe5Ci6ubl/OvL5kIINxMqrkDtEoRF6Kgxz6TNNJdzvNdt5zsoDM+HLqO3P8K9sEYHAFQ7Xj2qBghSvCdBxgdcjI4444Pevz/Ms4rYl+/pHstv+D/Vkj8J4j4zxeYvkn7tP+VbfPu/w7JEcDb4xb3BRi207lGDuHPQYAGOgx1z1xUgVWHmSAgleg5H49OR2xx+FWHaV93nJlTtLgfKfY4yRtGeOePSoFk/d7SOmF2g8ggYzxxjA59O3QV5SPkxFd33BdvO4DHyHPOQTwM+nbNOWJgXQAqjMvKkAKOmDtJO1Qe2OnpS+UYFcS/OcAMp+XhenAweO3PpVPUda0TwnpGoeLvE2+PTdDtpb26LAFhbwpvbb/tN91fVj2xVb7DjFt8sUfl1/wUD+IlrqnjvQ/hNpD/ufDVmb+6Me4r9s1NUaNGDD/llaBeP4TNxzXwhNa65c7dL8JWst7qt80dnp1qm6R7q+uXW3tokGOWmmZFA+mBitrxP4t1vx34m1fxv4pKrqmuyTahdR53CNp2LCMBt2Fhj2xoOBtjCjmv1j/wCCGX7M0v7R3/BRHw54i8QWaz+GvhNE3jS/3I+yS9hJttFh3AnbKLx2uYwe1mwx0r9Pr4inlOWutU2pxu/N9vm9Ef19wfw77OFDLo9LJ+u8vle9vI/uS/ZO+AGifsp/syeAv2b9AaOWHwRoVlpMs0a7VubqCIfarnH964uDJK3+0xr6EyByaOR1OSf5+tKB2/Sv4ExeJnWqyrVHrJ3fzP63o0lCChHZAAMUuB6/5/KkI5pMVzmh/9D+6XnHSk6nn8KfwvNNOM18eeweOftAfA/wP+0t8EPFv7P3xJjJ0LxnpF3o15IoUywx3cRjE8O8FUlgfbLE+PkdFYdK/wAvHxp8O/iB8JPGPiD4MfFe1W38UeEdRutD1aA7iv2/T32NLC2BmOYDzYWAw8UisODX+rcVO0joK/jS/wCDk/8AY9k8DfFzw3+3J4Otj/ZfjkReGvFQTjy9YtIcaVeHLH/j8s43s5H2hVNrbjO58V+8eBvFH1fFzy2q9Kmsf8S6fNfikfnXiLk/tsMsTBaw/L/gH4l/sWfFCz+GP7Rel6hqsWyz1+CbRLmcDAtxdPF5cm7I4WZIg+ThUJPOAK/ofeFzmDAZuFZOQASdpHTpz/Kv5L7m0Fw8MXkqUQ7VwdrKAB8oGdwIXuOfwGB/RN+yR8bD8dvg/bajqz+Zrmh4sdYXcSzSxqBBct3H2qMK/IH7wOBnFfzD+0O8JZv6rxphFdJKjVXbVunP01cJbJfu0tZM/qn6DniXDlr8K4h2f8Sn57KcflpJLtzdEfUgZBIQu1EA4wp4HTBHTjHIAxmvh/8A4KF6/DpH7L+q6VCof+27/S7Ha3BQCcznaMHP+qHbjmvtsSXDHzT8zjKll2/e49fu8cYHH8q/O7/gpkfJ/Z70mMnBfxNbqw4KnbZ3bfMAMHnOB6/p/FH0ZcBHEeIOTwntGtTl/wCC3zr/ANJP628fcS6HBeZyX/PqUf8AwJcr/Bn4grtuWSCIF2jZT8mBxksvzJ/tevB7etf0R/sV6a+l/speDYZMr5tpdXZUf3rm9uJOnbtn6cV/O1BG8RURZMZwzbNgOApOCAchhwBgdD9K/pj/AGc7WLT/ANnX4fx223P/AAjmlvnqCXgWQ8ntls9e1f6K/tF8xceFcDhOksQpf+A0qi/9vP4X+glgk+IsZiV9mjb/AMCnF/8Atp7WqJhJFwMYI4AOOPlH3RgA9elPCALndgKcFTz9BnPGTjinxoiBY5WJCYYbtoyMYwR059j9PSmwblRZZeOMADrkex49f5YNf47H+opg+JfEFp4U0K98TagWa30yzmvJmUklUghaZsdM9OD09elfyh6ai/2esDuu0+Why2QVZcMCOB94nGcHutf06/tBsYfgd43uJHCMnhrVwnGRk2jjkeh3YxwOnYV/MhGUeZLbySCsSY/jICqq44zxwSR04HQ1/rb+zbwMIZTmuKW850o/+ARm1/6cZ/ml9PXGylj8tw72jCo1/wBvOK/9sR+pH/BLDSLXUPir458ZXajbp/he3sfnONr3+ooTxgYylseM9Pav2ttriSwnW9tbpobm3YOro21kKOCpUZI/dnBOBt559B+SX/BKS3NtoHxS1aDesk13oFocktnbBfScn8QPc4IHOK/WVDO21AhfcckENndwSSp7qBjjjGeO1fzR9NPGe38RsdT+zCNGK9PYUpNf+BSkfy1w3G2Bh8/zZ/P/APt5fs0L8C/ihF408IWIh8GeMJ5ZLKOFd0en6ljzbvTQvQRnJuLcnAETeWMmNq+Fg1zuW6sJvs1xGVkhkiLLJFImXQx7ct+7ccHk9q/q2+I/w28DfGL4ea18KviJFI2i6zGUuJYv9bbSR4aG5i9JraTEif3l3RlSjYr+YD4rfDXxV8GfiTqnwo+IVuIdU0kiEsh8qK7t3Xdb3UBA/wBRcxMssZ6jJB+ZWA/vn6IfjyuKcn/sjMZ/7bhopO+9SmrKNTzlHSFTu3Gbd6jS+R4lyn2FRVqfwv8AB/1t93Q/Y34C/HDS/jn4Ii8RXixRa9p4SHXIMYBuZEJS7iX5f3V0AWC8BJN8fZRXtkYScLvKGP8AhCnAYDPy4zt4/A45+n4L/CP4q678FPiBaePNGi+0RDdDfWoKAX1mxHmwjHAcbQ8Lc7JFUnAJFfuloGu+HvEGgWfiTw1dC/0vUYftNtMowJkc4G9Tna6sNjr1VgVPSv2niDJ/qtTmgvce3l5f5eXofybxzwt/Z9f2lFfupbeT/l/y8vRmqsku8PKrr+8yCSFBZQOckH5Rnj14qLdDnKNjB+YAgDAwCOnygc8f4Yq06KQW3gbj8x+6w246AcHjjjA9aZJtRGlVdpzgfMeB6dB1zwORxXzx8LofP37SXwGt/jz8PUstJOPFGimR9GkGEE28ZlsZGBUeVO2PLJ4SXByAXr8S/Lnkk8m9jeCVHNu0MqiGSGZTtZWH/LOSNlKNnPIwRX9HBQrxJhs9MjnYOB1OMDjp/hXwB+2R+zz/AG7b3vx38AWhOp25H9t2EShmuolGP7RhUcPNEvFwMHzEAm/gYt9lwtnXs5fVau3Ty8vR/n+H6t4d8VqlJZfiX7r+F9m+no/wfrp81fsr/tDwfB3xDJ4f8VyOnhLXJ1a5LbnFhd4AS6wP+WZXCXYA5QLIMsnP7GjZFJ5UWwHCtvV8go3KkH7rArhlKnBXBHFfzjxXUMqxvabQLhWGeofHHJDYwwxjGOMCv0e/Yx/aJtkis/gP44uwAv7nw7dyudo3c/2dK7Yx3Fm56cwn/lnXocUZLzr61SWq3X6/109D2vEPhH2sXj8MveXxLul19V18temv6Rb3+ZofuH5gdhA7gAA9eM9Og6U10Dh/l2j5evsSAMZ9s8dR6YpNs6rjy5Ef7mFGGHTsCDxgDbx09iA5p7eJ2+XeofhfXA4UDI4wcjAr8+Pw70IJI/LQrsBEgwVZQV2sNhVlfhlZThlPGMgj1/KP9pz9lv8A4V8Lz4j/AAygaXwxuElzZrlm0o9WkUfx2GO/WIkKwMe1h+sRCyTBWjXcMpt7Ht267u3p9KZE8kcqzxEoU5zx24O7I2kMPlwRjafSvSyvM6mFqc9P5rv/AF/XY+h4c4kr5bW9pS1T3XRr/NdH09Lp/wA4zeQxjEcgboYmxnPK8nHC4HI28N2wK+ivgf8AtQfHn9nzRL/QvhfqVnHpGoSed/Z+p2a6hawXA5ee1id1W3mlX/W+WfLkPLLuCmvpv9oz9jtZpJ/iD8BbEmQ73vPD0QJRj95pNMhzgAEFmtSSM/6n/nlX5uWyQNF5aSbTjBfacDyyuRsHTDcMp+b6dv1jLM0pYiHtKL/zR/Q2XZlg81wvNT96PWLS09V+XTsfVPiP9uf9snxefssnxDutLhkGBDolpa6XHnOOHtYDcDk4P70Ak18teIJpfE2vDxH4tubnU9QdyPtWoTSX84Q5/wCWl08jYOT90/L24FTtF5g+z/LgFiocYXOCxAGfu9fXHYCvavgT8IPDPxm1dtD1Dx9pXhW/DRpb2uoW05nvRwQbaRpIbZzldoiMvmbukZB46sViFTg6lR6L5/kdb+q4GlKqoqEVvyx/SKPEFLXJQQKJI2G3cBk7cgcBsYAHY4GOaqLqMEN+tmJdzzgRxxfeYk/dKIpZiMZxge30/Yvw3/wT2+DWgXBi+I11rfiS8jcPNHM39lQAZwQ1vCpuPu8588DIyK+pvCXgP4f/AAyiY/DPw/p/h93Rf31lapHdMQNuXumEk7HHUM+D6V8vX4toL+Eub8F/XyPhcd4p5fT0w8XP/wAlX3vX/wAlPx4+G/7H/wAfPHcYvJ9JTw1pkh4u9fdoN43ceXahXvHzngmJFKj74HNfdHw4/Ya+CXgUR6r4pEvji/TOTqCfZ9OBUgjZYRs28cA5uJZFOPuivs+balxJKZA5BkYhvvMdv1xhh/F0/KqjR7fLGA2wAH5Qo2/wluOOMj04r5nGcRYmtpflXlp/wfyR+dZt4hZjivdhL2ce0dPx3+6y8iR9sUMNtGuxYMJbxoqpDEoXG2GJAI1QHAAVQvTtTFUkgTtvwwVvl3bBjnjoMcH36e9IFwD5QOQPLZcDnn1/3jjjj6Uu9g3noCrk8cgAH6jufQ/hXiHxCEMkbR+dKOJAFOD3zjkHOen+FIYlUk4CoEw29chsHpkY4z0HrxxiooRboVwdwYBvlKjBxjrj29OPXmrAHmyAMuSvyshwc/LwdvHXHT8aQbERQxowkwFOAw3YwpOR1HAzj6dKkO9BLGw27cls9fQbefrj2p275vNiO3lSDzu+f+6GHAwvYfyrE8T+IPC/grw7J4x8d39vpmi2p2y3lySse7IJjjC7nkc8bViDMfQ84pLokVTg5SUYrV9F+hv20M0lwbeyDSzFtiIB+9Mg/u8n1wfoTX5hftoftI+GvEXh+X4G/De6TULf7RHLrN9bPugkaBsx6fbuBtmRJAJJ5QShZRGmdrGuG/aF/bG8R/Em0vfBnwyjudB8Nyb1u5T+61LUo+h83bzbWzd4kbcw4d8fIPi7yII40tpXQZixFt2lVC8gKOUJx2yMY4zX3mQcOuEliMQtVsv8/wCtPwX7VwXwFKhOONx3xLWMe3m/NdF0666KyfNMSXF2xRR+8aUlMdSSTzgqeobPrX93H/Bvr+yZcfs+fsNwfGjxVZi28UfGeePxPPvTbNDoqxiHQrViCcr9l3XmCAyy3bgjIr+QH9gD9jm7/bv/AGt/CH7M7wMPD9zJJrPiq5Qshh8OWDRNfLxtZWu3aGxiZfuvPux8jV/pnW9va2kKWtpClvFGqqkUYCpGiqAqKo4CqoAUAYwK/M/HXidUqEMqpPWWsvRbL5vX5I/q3w1ya8pY2a02X6/5E3BJpoGOnFPYg9Kaf/rV/Lp+wi/P2TdR+8/55/pTh06/0pcn/P8A+qiwH//R/ulI/UUYPcYp/Y4pOBxXx57AmMdetfPn7WP7Nnw//bC/Zy8X/sx/FDcmjeMNPaye4jGZLSdWWWzvYQcDzbO5SK4iz8u5BkYyK+g85x7Uh98ZrowmKnQqxrUnaUWmvKxnVpxnFwktGf5T3xM+FnxJ+DvxG8QfBv4u6X9g8VeDL240fWIkj+Rbi3+9NCXCfuZ0dbi2fHzwSREcGvXf2Uvj23wC+Llvq2pytb+H9UjjtNVCM0gEOQY7lI8ZJtZMEgKfl3oucgj+k/8A4OOP2CP7T0C0/wCCiPw009ZLnQbeHSfHcEajM2khtljq5C4Zn0+R/JuWwzG1dWJVLav5KJY5LVzD8rujsIkfcd+8YOcDaw4YY43H9P7Tpxy3jHhypg8dDmpVoOFSPZ21tvZp2lB20fK90fhNDF43hjOqWOwL5Z0pKUH006Py6NdVof1bJLGQNoDru4ZCHQjH3gwzwRyP8K/O3/gpn5s/wG0O3QnY3iWNcjDL89hd4GT7rnp6Vjf8E/f2iLfxZ4eH7P8A4nm26poMB/siRm/4+rCMYNuMnG61Ayqgn9x0H7tq7v8A4KP6V/aH7O6X9urMNN8QWE7ADGRJHcW34n5wB061/j14c+HGN4J8YcBkWZ7xrJQlaynGd405ryldaXfLK8HrFn+qvHPHOE4s8Lsbm+X7SpO66wlGzlF/4beV1ZrRo/CQixgVk8xWEOW+XPAOACp2kZPYkE/liv6cv2f3Y/AT4enoX8OaRycdRaIMY/D0/pX8yckrTsJRmXaNgGAH5X72FGRjjGeMHHIr+k/9lbXIvEX7M/gLVrZiwTRLe02/c/49S8B/i45TBz39K/rb9o1hpvhvL61tFWt6Xpysv/JX9x/MH0D68FnWOpX1dJP7pL/NHvpkZI3lnbYSGPPHB9/bsOlSyMQ+w5UBtuGXoR2x7+g9KrwspxHJjG054BIHYdx1446Zp0chmbz1C7slSu0npwR/nofSv8grH+nVjxL9og+b+zx8Q8jH/FM6s2VX5A/2Yvt6jngnjtX800rh5/tHnKCzcFsgbehONo3ejdsHvX9Mfx6gnv8A4EePbEj97L4X1eILgbyBaP6+vHT+lfzLQmO4+aP92mU2hmYKScH7y9CclsADrj1r/Xv9nE1/YGYpdKq/GC/yP8xPp5J/2xgH/wBO5f8ApR+1H/BKe0b/AIVr48uW4in8Q6V8oI2jydNZjgE/3Wzgciv09tQ/lRxyk5YKqhVBOCc8EEjI7/hnGDX4uf8ABLv4x6b4f+IOtfALU2gjh8XhdT0py53NqtjCEe0B4A+02m8xjj95EFH3sV+0iiIIlpIxZSAu31XJIyw/Htz0r+VfpkZJi8H4hY2riY2jVVKcH/ND2cYXXpKEo+sX0sfzTw3OMsFDl6aDwsiLIRs2gbSygH7xG3G5gM5OAB+HpXxl+21+y+37RXw8TXPCFqsnjTwrFK+mJgq+o2RJebTGC/xOczWeRtE+5BxMa+y1Qs4uvKxgscgYAG3oPZR6nqOnNA/drsl2pIBglmUMvTkEZx+YJIHGOB+GcCcb5hw3m9DOsrly1aTuuzW0oySteMo3jJaaPRp2a9TE4eNam6U9mfyLW00MwE1js2yxrIh2heAxwuMcEEbCv8PQjOa+wf2RPj4vwu8Rt8NfGdx9n8K6xMHWVyypYag4wsoY8LDOwCzg8ISsvTcT9D/8FGf2WR4c1S8/aX+HcPl6Vqd0B4jtoRiLT7uY7I9QRAeIbt/lnG0LHOd+Qswx+XYUTjbtPlPlWXg7iQTjBxnrjaABxzX+8/h7x1lfGfD9LNsA/wB3UVnHTmpzVrwei96PouaLjJLlkj8U4k4ehKE8Dil7r/pNea/4G10f0atb3EF2bKaPymiYo5Ocqe4Pvz7gAZqNPnxNEDMcAbUb7uD8vXoBgY6cYxXwD+xx+0N/wlVlB8DviBcMdRtLcJoV7PJg3UESf8eUhwSbiBBmI/8ALWIGPO5FDffEJ85yxRJAMnBHOAN+QB2P04xyelfPY/AVMNVdGp0/r+vuP5SzzJa2AxDw9bps+jXRr+tHp0HqST+7yAnyrxwT0x6Yyf8A9VSQzS2s6zWrMkiHcu0D5NvcDjOemAOV9s4YROskaT/u3zs2vxyi9OfqOP64pSY8KmF4BypO0gAdFBOBtHsK4rHkWPyX/a2/ZrT4eXj/ABP+HtrnwrqU6pfW8fTS7lm+6q9rSdsFMkCKRvKOFMefiqYW81vLaXTRBdxV4iBjkcAkYOMjrkFcZHIFf0cXNraanb3NhqkUNzaXiNBNbzKJYprdxh0dDhSCPvLjpX46/tMfs53vwQ1eTxZ4O8658IahII7eWRt72Ez4VLS4fHK5H+jzH/WKNj4kBDfo3DfEHtEsNXfvdH38vX8/U/d+BOM/rMY4LFP94vhf83l/iX4+u/1T+yl+0vP8S/I+FfxTuVHidYlTT7yQ4OqIOBFPj/l+QLwc/wCkryP3obf9vC4SGMs7iNyAdzjvjBB5AGABz7YxX85Fxaboz9k3zgBdshDKRtbI5GGD5wQc8ZBGCBX6hfs0/tbN40ltfhl8Wr0DW5CYbDV93li+4BSC6wFWO75IV/u3GMHbJjf53EPDns74jDrTqu3p5eXT028jjbgW3NjcDH3ftRXTzj5d106e78P3681xK2UDA7vlAA4yMsM8bcjt09KiYqoKxMCJN20D5uvHQ+3agM0jMpO0oSBkbVBGBtKt0YYp5ISLb5mImK5O5TjPH3jkgCvi/Q/ICvKm+YYALJjbyQQyjHUduFxg+nTFfO3x1/Za8B/G7z/E6CLR/FeCP7VhiBjucDIS/gXHmc8iaPEy9PnA219Js0yISBlOgKYBHXHB465Ge3T3qCWIebtYCNscbhu6dDgEAY69fwrowuJnRmqlN2f9fh5Hdl2ZV8JVVbDS5Wu35W7eWx+CfxO+FXjz4MapBpHxCsRaR3LMba6ifzbK8K8fubjhcjr5bBZexQYrz25gt5YY7K6jQ27fJh13RgRg7SwxnnPIyegAwK/oq1CxsdT0a50LW7aG7sL9cXFtcQpNBIqgBd8UilCAfu557g8Zr4T+J/7CHg/W5ZtS+DGo/wDCOzyZH9n3zPPpvGUxb3GDcWygjIDLMin0Xgfe5dxfTlaOJXK+62/4H5eh+z5B4l4eraOOXJLuvh/zX4rzWx8cfDT9qH44/Ce3i0fQtakvtLtxsTS9bV762VOgSIsfPtxj7vkzKD6dK+7vBP8AwUC+GOtrFb+P9Hv/AAxI3ztPaf8AEysvmzkkRqLpUUYyGic9geAK/NL4l/Cr4q/B6Ro/iXoN1o9u5Pl3YHn2L9D+7uoS8J46BmUjI4HFedBoFdJEIKybSMDcBu5GSM8Y6YyPevZr5Pg8VH2ll6x/qx9LmPCeWZjD2zgtftQsvxXuv5pn9EPgz4sfCb4g4b4feKdG1MsciCG6jinBOcZtbnypsHP/ADzH0r0qbSNZtlWWWxuEyN3MchDDb1GQQDnOOgr+ZWa3ttQeP7TFFLIjDcZMNtbg9icDPGB2BrY8PeIvFfhXy08J61qel9BtstQu7dVA5BAifaOMj8M9iK8Krwav+XdT71/lb8j4fFeE1O/7ivZdnG/4pr/0k/o98zyn8gjYEXuxwCvQnJ5PB6U1ZY2dpQqkls79wX5c8AAYP0+uK/Bm2/aS/aT0+Hyrbx74j+VW/wCX5pRsQ7VOZVJVuOCeMcE9K0rv9qP9pyYfZ1+IuvuEBIUXCRk8cktEi5Un+9jp15rk/wBT8R/NH8f8jzP+ITYzpVh/5N/8ifvNZ6Xf6hGrwW0su7HyiNjkKOAcALg/dAJ/DFcH4y+KPwt+G9qI/iX4k0zQiVytvNP5l06qSAFtYQ8zHPACoRuxyO34FeIfH3xH8ZRGDxV4m13Woz/De6ncTI3IzuTzcZ45BUg5PoK4qKPTYbUR6KiRRXK7g6RhTkDp8o3dAPXt0rro8Ga/vKn3L9X/AJHpYTwlje+Ir6dox/Vv/wBtP1I+In/BQPSNNBtfgfoRu5hHgaprw8uGMfd/c6fExducYaZ1A/55mvz28f8AxE+InxF19PE/xE1a41+8jTCG52IkIfosMCgRRLkAAIi8fjXJPPBaia5umjtQ0pPLbVwDlgTjG4Ecgd8YxXVzfDjxzZeC7X4ia1ZNpelXkkdtY3V2htfts5AJFtEwEkypHh5JANiLj5iWAP0mCy3DYW3IrPbz/ryR+hZVw/gMuSdCCTel3u/K/wCkbLyOQExEr3shJ52mIsSeuQDjB2seh6Z49KlWW0tIXgmmjihiiMsrnHAiHm7sAFTsA3cY4GD6U8gE7GH7zlurAHv8xHI6kYxjHHav1q/4I7f8E+Zf26v2r7e+8f2P2r4X/Dh7XVvEfmqoiv7jPm6XoxV0O/7Q6efeLtKi1j2MR9pjJ6M2zShgsNPFYh2jFX/4b12R9VluX1MVXjh6S1f9fgf0pf8ABA79hm8/Zb/ZM/4XV8R9Naw8efF1bXV7y3nG2bTtGjVjo+nMu4hH2SvezrtjZZrkxOv7pcfu4WBJx04prl2cs5LFupPf/PYdhxRgdQK/gbiHPKuZYyeNrbyf3LovRKyR/TeXYCGGoxoU1okO4/8A1Umf4jxQMelGQODivEO0UID1pfLSmEZP0pNg/wA//qoA/9L+6cjH06elNBz+NOP92g4x6dhXx57Ap6YNMHTpj26U/PG000ZI9KAMjXdC0TxVoN94U8T2NvqelanBLZ3dndRrLb3FvOhjlgmjcMrxyRlkdSCCpwRX+cD/AMFK/wBgjxF/wTn/AGlJ/g7B5974H1xZ9T8C6hPk+dpsRRZLCZySrXeltIsMvUvD5E+AZXC/6S349K+JP+Cgn7EHw+/b/wD2atW+Avji4Ol3wcah4e1qNd0mkavAjpb3YX+OMh2huYsr5ts8ke5SQy/pfhnxw8nxlqv8KdlLy7S+X5HyvFnD0cfhrR+Nbf5H+a14Z13xH4T1u08Q+Gr6SyvrC6iubeaNBujkjHylQRhsNwykbWGVb0r9gfih8btH/aO/YX8V63ZiFNb0xNO/tOzWX/j1nS/hZpEABJhlRXeE8kKShO5Wr8nvil8NfHvwR+J/iH4NfGHR/wCwfFPg+8ksdV0+Yeb5c4CPvi3KC9vcxeXNbSg7ZIHEi9eKHhHxxrfgS9uF0KXfHq9hNpd9CwBEtncxqhjZONpcgOjD7rqrcYzX7h4r+EWC4lrZdnVKyxWCq0q1KX80YTjN0219maj7r+zKzVk5qXy3hp4n4rh+GNymv/u2Kpzpzj/K5RcVOPnG+veOm/LbgkZYSZYF8xIXBDEoWC7to5OMHP1PFf0H/sD6h9v/AGXdD0n/AKBV5qdmw5/5+nm5HJ6Sg/1r+fxrRbCNlmlWNjhfukMR6MfVfb5R6V+y/wDwTI10z+BvGHgmFAY9O1O11CPcCNwvrYxnO4/3rb07noK/Fvp7cPSxfh5UrR/5h6tKp+dH86qP1H6F+dxw3G0aL/5fU5wXytU/KB+nE7yNtkdPk6k7T/EcZ+hOeajIfeFk4HAyTjBXnHXHp04447VGIYA5KYY5Bzv5yQOQB0yB06H0qSEPIA74WNVJIBx7gDr39q/w9P8AXgxNf0SLxL4fv/DVzI0a39rdWpKjlRcQNFxycH5u69h9K/lIs5JHtIpF+bbCill5OQBkjIO3jGcjHXJAr+tC3H2e8tridP8AVzq67VGMDCjI6HHXB7fhX8r/AMRPDy+C/GfiLwS7iMaLqN9Y8vt+W2mK5A4wuCp4z2+lf6lfs183S/tjAPr7CSXp7VS/OB/nb9PfKnyZZjYrRe0i/wDyRxX4M5VLu/sZINW0e6e1u7GWO4tJoJNk8U8LhoZYSuR5kbqHGDjjriv6YP2Zf2iNF/aW+Fw8Y+Xb2viLTDHb+ItMgICw3hGUuokYb/sl6q748Dajh4OfLGf5oJwIppbe3VGDEDrgMUA+QEgYKkj5j2IxxxXqfwQ+OPjT9nD4p2XxO8CbNRWJTaXtjJKI49T06Uj7RZSOCdpOEaOQA+VKquM4IP8AXv0k/AmlxxknscPaOLo3lRb0T096nJ7KM7JXduWSjK/KpJ/wLkGbfValpfC9/wCvI/qYfBLfKrDaoPAG0bgNmPrg+hzUUMr+arkl8YYDJ+XccHgA5z9enNcr8PvH/gr4oeCNM+Jnw/ujf6Nqy+ZaTyoFlDIAsttOm391cQH5JkGfmG5SUINdlE0BTIIz8qbRtbHBIIAOAOOMAEcV/hpmGXV8JXnhcTBwnBuMotWcXF2cWujTVmumx+pwacVJbCTLpl7YXemaraR3NnewvbXFtOqGGeCZNkkMiYOUlUlTjJzyCCBj+cP9r/8AZZ1L9mDx7DJoIll8F62zvoF1NhmikC5fTLqQYAuLcY2Nn9/EA4AKuB/Rt5rSxFFyRjDAnnk46/NwcDOeTj6VyXj/AMA+Cfin4J1H4Y/EaxF/oWqxolzGpEUsbr80csEn8FxETuhcqeeCCrMp/ePo6eO+K4Gzj20k54WrZVYLstpw6c8NbX0km4NxupR8zOMqji6fLs1s/wBPQ/lHXfbML2zZ4JLaUSRywsySI0ZVkIK/caNhuRgwORX7CfsxftIxfGHT/wDhG/Gtwlv4w0+LzLlVwsWqW8XLXsSr8okTH+kQp93/AFifISE/Of4/fALxt+zf8RZvAnjF/t1vMjzaXrEaGGDU7RcoGUKT5cseB58JO6OT1jZGPjWlajqmh6lY+I/DMs1lqFhcR3FtcQNsmglH3WjYbuR0K8g8g/LxX+2EJYDPcupY3AVFOnNKUJx2afyXo00mmrNKSsvwfinheGOpPDV1yzjs+z/yfX5NbI/opWSVDHJHGu7HTg/cUA4ycDH69RUp3kmBysakY5+63I5JB4xwfYV8x/s5/tDad8a9MksL5ILHxXp8ZfULOHKQ3ca8fbLRTzs/57RD/UH5l+QjH02qQtJsdopfMwAF5I7bt3Bx/dI/lX51icNOjN06is0fzNmWW1sJWeHrxtJf1p5dixIGjC890+Y9eWwc9R/s/d5GKzr6w0vWtIm0XWLWC80++QxXdpKnmwzRvyUcY74DDGCpGVOQMWQ5xFcKwkJG3djC5OPm3KeP8inSLwonQpGcN2A9V+53GeKxTtscKbVmj8X/ANo79mLUPgvqf/CRaIZbnwddTiK0u5MvNZSycfZLwjGDgbYJsbJRtzhwRXyuI47pfsMrqYywWVWVgwxgqGVRt5wuCO+MAV/R5PaW+rWkumanbx3tveQtDdW9xGskMsZHzpJG3DqRjI7446V+VX7Q/wCxtq3gBJ/HXwgtptS8ODNzcacrNJfaUoHVASWubMA8NzJF0fK/PX6JkXEqq2oYh2l0ff8Ayf8AW+h+8cG8fQxHLhcbK1To+j/yl+D6a2T6f9nD9sn+yWg8D/Hi/aS2RNtlr8imWW0A+UQ6gw3NNChyFuB+8jHEm5fmX9OYVaFo5w+7esciSA5SSOQZR0ZdyuhHO5cjGOcZx/Nn5w8uO4jUNEwVkb7sZHRcYz8w7nB3DPSvpT4E/tN/EL4Eyp4eKnW/DTPl9JmcxmIHDSSWM+P9HdtxO0/uXycoD81Z51wwql6mFVn22Xy7fl6EcW+HkcQ3iMDaM+sdk/TpF/h6df20aFWUyR/vFUeUe/yqN2d4H3c4Hp+NLEjxv8gVc88j7o659h8vHHPSuB+GXxW+Hfxi8OT6/wDDjUUu0tFX7baSL5d5anHIngDZVRwRIhaFh0cdF7+MwyBdh4K5GQRnOeRk888jHrivgZ03BuMlZo/D8ThqlGbpVY2a6NWHq8kYAcYG8ZyeAcnGcfke1NdYS67VXzIiobJX73Uk9/m47DmkPlDbEw6Ljc2TyD2BHA6f5BqcpKvLoU2tnH8JPdeuD/gKkwLNrcyW9vLHCx8iYeXIhHmrIndXRsqy5xwwPSvnnxh+yj+zh4/LPqfhWLSruU83Wgytprlj1/dRZtWxjBHkfzNe9KDlwrHc2PlVRubq2B0HHHHb3qx+9fh5ODIcAN93Kj254PPf8BWtCvOk+anJr00/I68Hj8Rhp8+Gm4PybX5H5z+Iv+Cdmk3Ltc+BfHE8Ej8+XrFgk46Z5nsnjbG3HPkcV4lqn7Bv7RenwkaP/Y+rJLn/AI8tTSJmIHA23yW43YUBuuB1r9htweJHlbacZOORxyQRk8enHTHPWp43TJU/LImFVjwWBHqc5x1HBxnFe9h+KMbDRyT9Uv0sfXYfxIzWmrSkpesV/wC28p+HOpfsh/tR2jLt8AanKkZDmS3lsp05GCAIbvB+UAdMjOKzR+y5+1LMsgHw+1gBc481bVFK5C4YvcjIz2z0x6Gv3NSCyfbG0eExks3GOejD+E554PTgjFK8ZOY2VSxXgjbwNvYHtz97rXeuMcTbWMfuf+Z60fFjHJWdGn90v/kz8b9K/Yh/aS1K5EF7pVlp0aqQ0t/qdsAAQMhltDcS4O08BM8V7z4a/wCCdsErAfE3xlu+UlrbQLQBRjjat3e42Y7FLf8AWv0XSObyCEjCFkHQHgHkj06j8qt3AMvnXF5LHFEiOzmVvLiSIZZ5HLYVQi7txOFUAk9jXLX4oxk1o1H0X+dzzMX4lZrUVoOMP8Mf/kub8LHhPg/4F/s5fAmC78b6XpVnYR6Qv2ifXNXkOpXNrFEfmkR5l8tG5+QQQq7OAi5JAr8qP2g/jnrX7QHxFbxxd+fBplqGs9FsZXG+KyDcGbLDdPO/zzHquFjHyxrjvP2rP2nn+Nmqf8Ix4OkP/CHabL5sGFZDqVzH8v2ucNhvJTJFtEwyATKy72Gz5Gvr20sbSbUL2YJb24LPI2G2oPujuxwcD5fm6AAnivqsgyipD/acVrN7X6L/AD/LbufpPCPDden/ALdmLcq0lZX1cV216v8ABadz0X4YfC/4hfGn4keHvgr8GNJbWfFniu/j0/SLNGkAeaZS++R0BZbe3iElxcynCxwI8jdAD/pO/sLfsb/Dj9hD9mvQf2d/h24vfsIe61bVTEsU2r6tcBftd/MoLY8wqqRIWbyYEihU7YxX5a/8EMf+CXN7+yP4Am/af+P2mSWvxS8a2SwW2n3IAfw5osmyRbIr1W9umVZb3JygEVuMeU5k/oJd953KMf8A6q/nHxf49WPr/wBnYV/uob2+1L/JbL5+R/WfA/DP1Sl9Yqr35fghADQRjigY6CkI4weDX4mffihQ2T2pOR7UueOe1JxikAu/ZxxjtR5o9vzqNlHX+X/1qbtHv+tAH//T/un49qXA3DOKDzSd/avjz2BT8vOAaZ70pODSkkDAoAVuOlNJc9DS8bM+lIuQAR/9agD8Mf8AgtN/wSuf9uP4ZwfG34F2sS/GHwTZPBYwswhTX9LRmmbR5ZSQqTqzPJp8z/u45maJykU7uv8ABqY7hUutOminsri2mkSS3uY2gmgliZoXhnhdVdHjl3JLG21ldGQ47f6y7gMvzDOOBX8zH/BbT/gjpqXxxGo/to/sg6T9o8e28Jn8UeGrRAH8RRQIALyyQEKdVgjUKY8f6ZGAoImRN/8AQXhH4krDWyrHy9z7Eu391+Xbt6bfmnHHCft4/W8OveW67n8YbXkFx5klvtU7wjglRyc5ypGQSeONvAx9P0J/4JzeLhoXx61TQbm4aIa7os8SxsAQ1zZSRTxHpxiLzSB0xxxivzzhuLbULJbyzl89GjZgw+YHj/VsvybWBGMHDAghlBFeu/BT4lv8Gfi74e+JljB9pbSJ90kAbD+XOjwzRgsCFZo3O04ONwJPp+seM3Bk8/4UzHJqUbzq0pqC01mlzU1rov3kY69D5nwm4phkfE2BzSq7Qp1I83lBvln/AOSt6H9Ose1I1BO1gM7T3C8AAkYz9Me3FI+2PaAN4GRtGD0I4zn24HT+VcB8OPiR4O+J3hGDxl4Hu11GwumZFkK7Wj2rho5l3Hy5FBGUPPO4fLg13wKbxsG0x9H9NvsT7YA5zX/OJmeV4jBYieExdNwqQbjKLVnFrRpp2aa7WP8Ad7B42hiqEcThpKUJJNNapprRproV7lWkRrdAzfJlcE5wc4Iz2Pbhetfz7ftx+Gz4d/aX8TtDD5MGp/Z9ThZAfnF3boJj/FhDKrA/L65Ff0Hsi7HiiyhSTYu7OcBc/KM7R3x6YPFfkL/wU68INHqXhP4g2iSqJobvR7mZCSB5BFxbKcDuJJcEleFPoK/sr6A/Fay/jxYKW2JpTp+V42qr52pOK85W6n8r/TN4aeO4LliY74ecJ/J3pv5e+n8vI/LNEEt0kUxW0T92FdvkhiXIi+Zju2qpZdx5+XPHQ1r+MvDHiHwJ4s1bwD4qsJbLU9CvJ9PvrQkkw3Fu5BQ87OOqbSQwKleMVjajp0d9ZrbOB5rRmOXDoColBVdq/hzk/XHb9hf2gfgFdfta/s5+C/2rPhpZC+8bL4XsJtVtLZS0utW1jD9kuDGhGWvrOS3bb1M9uvl/ejjr/WvjvxMwnDmMwEMytHD4iUqTqPRQq2TpJ9FGaVRN/Zag3aHNJf5N4DL/AG9Obh8Udbd11+7Q+K/2Qv2oNT/Zh8eTLqckt54M1uRf7csIN0jxbRsj1G0Rj/x9QKTvQDE0QMfBEbL/AEXaff6ZrGlWniXw9cW+o6Ze2sc9ncWzBo7m3kw0csbNghWXGARuT7j7WDAfyLadLHcwx3kBE0EiAoyHIKEdO/f8B1Ir7/8A2Hv2xz8A9Tb4U/Ey6c/D/U33RztvZ9EuZm5u0X5j9klbi6iHK/65OQyv/NH0t/ox1OI6UuI8hpf7dTXvwS1rRiraL/n7BK0VvOKUF70YJ+7w7nfsf9nrP3enl/wPyP3yAnYFhkNGNxJ+/heMj64HTr+NXYyju0Lqo8peQG2AAMD90jr2+nHQVFJC8U4g2HD7ZUOVkRoXGY3jbkFWUoysDt2kEHBFEUs4hjREz5a/IAd23bt9ypz0PXHHAPFf5Aux+g2seb/Fv4PfDz47+Abn4Y/EaCWTTJ382K4hCfabC6VAq3lszgjzEHylPuzR7o345X+bT45fBDx9+z58RJPAHxItY5rh1a4sL6FWW21G03FFuLZgd2McPGcPDJlXH3S39SO+OQEOqsq8hVy25SylcdODnjOCa8u+NHwb+H/x18DXHw8+IkLbBJ5tldwIFu9OuwCv2q1OAu/gCSJj5c8XysMhWT+q/oz/AElMTwVi/qGPvPAVH70etN/8/IL7ueP2ktPeSPEzvJI4uF46TW3+R/LZpOs614b1yz8SeFrqTTL/AE+dJ7a7t8pPEy4AcZzkY4cYKuNwbKEiv2c/Z1/aU0b442Umga1HBp/iy3Tzbywj4hvI4sb7uwHHy4OZIOsedy7oz8v5c/HP4FePv2ePHcvw/wDiBAJPtAabTb+2B+yajag/8fFs5U5K5xLGfngbKtxgnyOyv57DVodd024ksr62lSaCeJ2SaCaL51kjcYcMvHzDGeQ3Hy1/sXJYDPMDSx2CqKcJq8Jx1TX+XRro9NHc/CuKuFKWPp+xrrlnHZ9vLzXl9x/Rn5iFWZ+VCMOAMMmegI452/l6cCpYAzRrI67lVtxzjoB0BPPcbc84HSvjb9mj9rPTfijc23w8+KZg03xfIpSC7iEcVrqmOQFziGG9YDBj4WXrF8x2D7EuhGLmSBlyysAGbqCjYbcpGAR6Y/kK/PMZgquHn7OqrP8ArbyP5tzfJ6+BrvD4mNn+DXdeX/DaNWICAINxGFXbgg5A287Qcg59eeOnIq3DFHG22IkSRngoSCD7YOe4z+tVmVxlGY4AwpY42906AcjB9eo7Hi2xD5CDA+6VHHXgD06c464/CuSx5jPiL9oH9kDRPiVJL48+EkNpo/iRsz3dkAsNhqLkFt2MYtLhuAWA8p/41QjfX5U6/wCH9c8J+ILrwt4o0+bSdW09x9rtLiPy5Yz83JAO0qwxsZcowPykiv6Lcr5371SGikyxXcT2A659AcYzya87+Jvwp+Gnxn0CHSviXYC5exHlWd7CfL1Cyy2P9GuMHaoY5MUgeI45X0+qyjiedBezrax/Ff8AA8v8rH6Zwv4iVcKlQxicobJ/aX+a8unR2Vj8FdG1XUPDuq2fivwnezWGq2hL213Zu0M0XVf3Trk4/vr91gSMEYr9CPhT+3mbfb4e+O1obkHaBrGmIFbBGPMurFcKW/iZ7fa3/TFjXh3xn/ZL+KXwkkn13RYpfFXh+NWaW9srf/SrdOxvbOPe0QVcETRb4zj5th4r5Vgu4bpBJFKku5Tt8shAOSTtdfl5PB9sDvX2tTD4TMKSlo13W6/y9H9x+r18BlucYdVHacejWjX6r/C16o/oh8I+KfCvj7QV8VeANVtda01AENxZSmTnbkLIMebE3IykoTHXvXTc5Ea4fPQ/xBSvAGevT36+tfzp+Htc1zwhr6+K/Dd9d6NqqgKtzau1vPu5BUMhGUXsrgg4GRt4r7R8A/t9/EvSTHb/ABO0208UWoUB7q3I06/BZSCzPGhtpcDnJhUnGSfX5DGcHVoa0HzL7n/l+Xofl+b+FuJheWBkprs9H/8AIv74+SP1eZUfIXAbchz3H4kYI4z68dKkVXYNBGEVeuDkrnJwBj7v+BGOK+YvBf7X/wCzl4t226a8+g3Mi4S3123+zLuGOFu42ktTjPeROOwr6j01P7X0z+2dBKX9i3P2iydb23kQd1lgZ0OfqelfNYjDVKWlWNvkfnGYZXicI+XE03D1Vvu7/Ih4xvi/dqvzHHOAuOp9h7dDikCvAxkjOejDhcoBxnPuBjp6UnmxtKyN+6CBt3mDaydNuQ3fB4wPqKn8ny/3k+Co4VlAycDGPTGc9PpkVkjhItsaxgAbOu4Hr2B9e3HQHJ9BS7cLygJABYbeAB1z2wPwp0sQlHlOxwjAEYyctk4yeMemenT0NVr6503T7W61fWLuCwsNOh865ubh1ihtYkB3yu+3CheP5DJwKpLogir6IvRWyOHSdVWMLvdpPljjjA3F2LYWNVGSScY28kCvyP8A2o/2oR8Wo7n4Z/DWXy/CiSrHd3edr6w6PgYDEMtguAyqVHnNh2GzYKyv2l/2qdR+McP/AAr/AMAxXFp4RkmCyM/y3OqsmDvlx/q7dMBktydz/elwQET5ILZET7GZuMgtgHPKb/mxjg85OMV+hcPcOeyarYhe90Xb18/y9dv3Tgngb6rbGY2P7z7Mf5fN/wB7t/L/AIrcsLyJal5Y8qF3bgzYCLyN+4bdi46dv1r+oH/gg9/wSm1Lx9rGif8ABQH9prSvI0DTpY77wDo11Hh7+5i/1PiG5ibhbeIjOmIyhpX/ANLwEW3dvnf/AIIyf8Eg7z9r7VtN/af/AGl9MdPhFYTCbStMuYwv/CV3MbZDSIRn+yImXD54vSNgzAG83+5tVVE8qJQFUYAA2gbeAABwAAMADoOK/MPFrxLjRjLKsvl7z0k10X8q8+/bbfb+pOB+D22sbil/hX6/5Eh+YfN/n/JoPqTSdRjpxjAp3JIHTtX8un7AJuXGKMgc0p9uO1N4HX/IoAXIBFKR60i8D0pxUGgBwzjGKXn0qPjvj8aPl/2aVwP/1P7qG4pOB7UnA5/KncdV47V8eeuNHuMCjmg9PpQfTtQMTPqMU78aaPXp0pfugUANI7jjFO6HO44H6Y9MdMe1IevGMUvSgD+Yj/gsr/wRQf41X+rftj/sY6So8dS7rzxN4Vt9scevlRmS908cJDquADLH8sd71O24y0v8bgZ3ubkypsKtJBIk0TLLFOhxNHNG+Hjkjb5TG4V0bgqCDX+sy2CM4wfb/wCtX4Tf8FVP+CKvw4/bZe5+PfwHlsvBnxhiRRPcyp5el+IVjH7uPVRErNHcoPliv4kMgXCTLNEsax/0J4a+LXsFHL80fubRl27J+Xn09NvzLizgdVr4jBr3uq7n8TnwV+NHxB+BHieXxL4DuAqyiOK8s7nL2t1GG+XzlUKwCdUdcOnbgkV+7vwD/aU+Hfx+0MTeDi9nqkcQa+0i6ZTdWwbb86cgTwcjEijgEb1QkCv58/if8MfiZ8FviHq/wh+NXh2/8J+K9BKw6hpWoDZPEMhQ6lGaKe2kPMM8DyQzAAoxB+XK0XVNc8Ma5B4n0Caewu7aUtb3ULeTLHIuAxjlz2BHGMAcHg4rXx++jBkXHuG+ufwsWo+5Wir8yS92NRac8baJ6SircrcVyP6PwV+kRnHBdb6pNe0wt/epPTl7uD+y/L4X2vqv6rbj5NxmbCEjBOfTAwe+Bx+NfKH7aXw9b4hfs4+IreGNJbzRlGr22AB81iCZF6dTbNNt7ZAFfNv7P/8AwUP0zWJrfwh8fXGn3oISLXYl2W0rHjN3GgxC5OP3kY8rDchMZr9KLS+0y9srfV4BDc2k8KzRPG2+O4gI+8jqzK6MvGUJBFf5B51wPxT4XcTYXGZph+WdGcZwktadTkadozWjTWko6SSdpRjsf6f5Nxbw/wCIXD9fDZdVUoVYOEouynDmVtY9LdGvdbXutn8p6QWs53K7rHsD5BUR56KSGzxjHynOepxiv3R/4Jj+PZNf+A+q/DproteeDNekkgVSFKWWqR/abdo3BJQR3MVxhhkBmGOTx+RXx8+FK/B34v678OJSxtdNuiLQkb/MtJsTWshYkZJhYI3GdwbDdRXvn/BPT4myeAf2nNJ0bVpxBpvjqNvDtwekX2uVkm06XJbB2XcYjy3RZD24P+vn0j+HcPxh4c16+We+uSOJpeaiufRd5UXOMV/NJI/xmwmEr5Xm08Di1yzhJ05Ls07NfJo+gf2//wBjtLJ9Q/aZ+D2nD7JIftXiXTYo1H2aV8GTVLSKPn7Oxx9riXIic+cPk37fyeVYnXbvVUK8YKhW808FvmPAP3cDmv684bvUdHlim08BJIududpXdgMuzgEYKg5B3AEHIzX4a/t0/sXR/Cd7346/BiwVvB7gPqumQLgaLJI+0zQxnLf2dK5/hJ+yudrbYtpH4B9EP6T6xkaPCHEdT96ko0Kj+2loqUm/tram/tq0P4ij7Tt4kyHlviaC9V+q/r/gL+w3+2va/Cj7B8D/AIy3Xl+DZZhFpWpt8x0WR2/1dw5XP9muzHBPNrkuN0W4D9xp4J7aRo5j5LheCdh4wpXaRwVOdwYEq4wwwDmv5DmWZA0TAtu4+91K47dwQ3Qnb+FfpP8AsV/t0QfCWwtPgt8bbvzfBcR2aXqmGefR8kfuZl5abTSW2jq9qeUzHlB3fSr+ihLNpVOKOFqV8Q9atKK/i9500v8Al5/NBfxfij+9uqs8PZ+opUMRt0fby/rY/cy3aGRQUX92QD8hyFA43HI5PJz0x6UrpJEh/dhNoLEDKjCnHO7r16k8DpxQN/7m5ik+WRBJG8bCSKSKVdyyRTAlXjkU/IyttK4IJ6CL5Y0aaFNpcEMDlcemcY9T/hX+UzWp90zivir8LPAHxw+Ht18N/ihpc2oafcuLiPa2y6tZyNi3dnPt3wSptxlQVdRtkUqa/nY/aP8A2XfH37MviaK28QONT8P6vMyaTrscYSC8PXyZI1yILxRkvbv9778e5Bkf0uvHbqc3Mm7Hyq6qMkA9SeCF5PTtisnxF4d8M+MvCl54L8cabFq+i6pF5F3Y3Y82C5XqhK9VeJhujkQpJG4DKwr+k/o+fSSzTgbEewadXBTfv0u39+n0jPuvhmtJWahOHiZzk9PFq+0ls/09PyP5Jns7WTdHcBXglXodzALnAXpu/hz0XHXrX6Cfs9ftoTeHDa+CPj3cz3enJiO213l7mBQNqx6gqpvuIk42zgeao+8GXJWP9q39gvxL8E4Lj4kfCWW58QeCISJJ0l/eapo8ZABF1tH+lWqjaoukAZBxOg+8fz7RFubIPbbmfmRGx+7IOAB8vBQDnk98HGMV/sfwrxZkXF2VRzHKaqq0X1WkoStrGS3hJdU91Zq8XFv8f4k4Yp1ofVcdD07rzi/6XRrof0fWTQtHb3MPlXlvPHFJBLE3mRSwt0eN1JV0x0ZMjn14Do9vk4hIYgYDHGDtHXnBG49PrgV+IXwR/aQ8f/Aqc6dpajWfC+4yXGkTSbIMkgs1rIuTbTc56NE38aHjH63fCn4u/D/43aTJe/D66kkubZf9M0662x6jbjAALxLnfGe0kZZD6g8V4Oa5HWwmr1j3/wA+35H858S8F4rLm6nxU/5l09V0/Ls+i9LmKNI0cpbjheAOHTJzgnAAOO38qeUkEZJ/c4AUHDKBgA/KuScEdS3JzxUbO2VVNhBO4nG4E9/u9MdR6GiFCcy4XkHBAC5C85yPXoP6dK8Q+QJl+1Wt3FNHlHRyY2XlhnG37vJ5HPcjrxXgHxO/ZU+DfxiRtUv7CTQvEEhYyalpSRqZX/6erZh5NxjP38JJjo+RX0GoZtzEFjjoeRjPBOSRj1z/ACoPlRmOIDhF2d8MF5AHH44Ax2rfDYipSlz0nZ+R1YDMcRhZqrhpuMvL+tV5bH42fEP9i342+AA914TtIvFmmgBln0lSbqNFO3dLYSkTKQP+eQmUj0xx8nSvHHLKltxJAGLRPmN1IOCHTbleOeQD14r+ktWkDxTKmduxg3QkDgcnj3+XB7YOK4Tx98Ofhn8VYVX4naDZa5MoCrdTRtFeAleAt5EUuFwvQbyuDwBX12C4ynFWrxv6afht+R+n5T4qVI+7jqd/OOj/APAdvu5V5H898rSQxM1vENpIIjJGeFOCOmD90E8Zx6DAmsZr/wAOXJ1rQZpdNulYAz2M72sqbeesLIc7scsfav1K8Zf8E/PAmpedP8PPEeo6GwXKWupxJqdr1wAJkMU6ADjkSkdea+dfE/7DX7QGjy7NHg0jXoFZW/0K+8hxkDP7i+jtsBlUDG9hnkelfTYfiLBVVbnt5PT/AIH4n6DguN8rrq0Kyj5S938/d+5s860j9qH9pnw87Q2Pj/V32qPlvZUvlwcYAF1G/QdRnoOnPPd2n7cv7SECr5+paJqGcFZbnRLbzDn7p/dGMDBXH3R16GvPrv8AZb/actZTby/D7W7h2JjSK0t4botnhceTI+cDAAH/ANevHNS0bVdH1efR/EVv9jv7YiC4t5l8uWJoxtZHHO1lIGcd66IYPAVvhjB+iRustyjE/BClL0UH+R9fS/t5ftDwMzXcPhuTnBJ0kjPQ4G25XGVH17ivIvjH+0J8S/jnFaaX48ubOx0uyKzRabpkEtvYmRDhbmZS7tLKcDYXcqgOFVea8WR2SRZoug+ZN2CBuUDoQAfkHIHqOlAgke7tNFtVllku5orWCC3jkknnnlbbFDDCgLzTSPgRRopYscAc1vQyjC05KcKaTXkdGD4fwNGoqlCjFSW1ktPQFnt1hfz3QBQZZZQwVAFGDzwuzPJbPAAPAOK/oc/4JE/8EWdY/apTSf2nv2udKn0v4Vy+Xe6L4fmV7e48UjhkublGxJb6QSA0akCS+Ugjba7DP9df8EsP+CCIs/7M/aN/4KH6Qkt4rJd6N8P5yskFuUYPFc69sJjnmyFZNPBeGIAeeZZD5cP9X0peWQzMck4/H+VfhXiT4uRpqWAyl+9s5rZeUf8APp07n7hwjwLticavSP8An/kVtPsLPStPttJ0uCO2tLSFIIIIVWOKKONQqJGiAKiIoAVVAAA4q42CxA/Cl78008iv5iv3P1wdztw1IeOegFLgH8KXA5GfpTAQNxg8Uh9+gpSMGjGeKQBxxS9PwpCeMH8KcTzn+VACHk0mB6fpTyBk4/pRt9v0H+FAH//V/umAGPegYUYbnFO246UzaDzXyB7ApwKPpSBevancEUgE4FLhT9aNozzQMfxigA27MD1oHIo4YewpAMdKAANzgc00r/eqTGOopDyeeKYHwz+3P/wTx/Zq/wCCgnw/g8IfHLTJItX0nc+h+I9NKQ6vpEjjDfZp2Vg8D9JbSYPby8Fk3KjL/Cb+31/wTH/aV/4J16ubr4s26674HlnMVh410+Fhpc5LqIor6MtI+k3TDYBFOWhkYkQTyYKr/pLHCnp0rL13RNC8T6JeeGPE1nBqOl6hbyWl5aXUSTW9xbzKVkhmhkDJJG6kqyMCpHGK/SuCPE7HZPak/fpfy9v8Pb8vI+W4g4Tw+PXM9J9z/J9jcs8qSjMbKRsQAbAwywHOTnbtw2CO1e1fBz9o/wCK/wADb0HwDqe/T5WUtpd1iexlYYUnyiQYSflUvCyNwASccf1Ift9f8G4vg/xSb34p/wDBPW8g8LaqzS3EvgrVp3OiXDHDbdLusPLpjk7tsDiWzy4RBbIM1/KD8WvhZ8WPgL8Rrz4N/HzQNU8HeLrMO0ulaqhilaFWZRNbupeC8hLqSs9tJNE2M7u1f0xQzHIeLMBPA14RrU5fFTnFPbvF6adJLZ6ppn5PCjm/D2MjjMJUlTnHacG1+K/FbPbY+jv2p/j38PP2jtK0DxnpVrNofjDSFfTL+ykL3EVzZtulgmgusKF+zuzjZIiPtlByyxg18QtDOoQ2jm2nYrIk0TnzEnTHlyqfVXVX4wD1zWy8cawvbxz/AGlIl+UmRc8cfN8pHuQdvA9KoGFIi0JUlZMNkjAUtyeFIGSVG3PpjjkV6vA/BmC4dy6nlOVpqjTvyKT5uVNuXKm/ecYt+7zOTStG9kkuPizi3FZ3j5Znjre1lbmaXLzNJLmaWibsr8qSvrY/qN+APxrt/wBoL4Q6L8VzsgvruNoNYiUhRDq1nhbqNBwNshb7REMZ8qZeeK9qgltba4BEn7hkePa6K0TRsfmBjwVZZOjqV2sMggjr/Nj+yX+1Fr/7MfjqebUYLnVfCGtSwprWmw7DKGjjKpf2fmYH2mFGKlD8s8X7tipCMn9GPhXxP4U8ZeFrLx74G1CDWPDepx7rTUbRzJby9DsBb5opF6PBIoePBDLxX+LX0m/ATF8GZ1Oph6f+w1pN0ZLaN9fZPtKG0b/HBKS15lH7XJc1hiqKu/eW/wDmfiv+2l+we/w5+0fGn4D2DR+FY90+raNb5km0lSNzXFqAS7af/E0R3vadx5A3J+Y8bRXcfmWpXHyOjL0bI++pGARtzgDPFf13xXUtpdRXWlyeVcW3zRt0IbnlcZ2ce2CODnFfkV+2F+wDDNd3nxe/Zh0khWL3OreGYI1zgZMl1pUWeVx801mCShy9uPLzGv8AWP0Y/peLEqnw5xhWtU0VOvJ6S7Rqt/a6Ko9JbTtP3p+DnvDbV6+GXy/y/wAj5k/ZD/bQ8Vfs3XEfgDxjHNrvw+nl2/Y48m70oyNlrnTvRCDulss+XLnKeXJ9799fDfiLw94z8OWHjTwbqsesaPqCySWmo2p3W84U9Bk71dCcNE6iRG4cDbX8k1mGmgFzbtlZOYxjjg8gKOenXuCOnWvo39nX9pj4lfsv+JbjWvBkianot9NGdT0G5cpZXwQKBIpXP2a9x9y4VODw6SJuWv0v6SX0SMNxS55zkSjSx/2o/DCs/wC90hU/v6KT/iWv7SPnZLxG6P7qt8P5f8A/pvgYuo8jhcL93lVGemcdOegHGPQcQ/vEhEgwmzJAj5z0GemSxAyOeOOa8o+Cfxx+HPx88LHxr8Krn7UtnIr6hp12dt7ppIbat3EpPyNghJk/cP8AdDbgUHqjlLbEm7EcRJ3k7QMjk9FI4x0646Cv8hM7yLGZZi6mAzCk6VWm7SjJWcX5r0s13VmtGj9FpyjOClDVFnM9vL9ssZXjniL+Wy/KOeOvG3PT09Qa/Nj9p3/gnV4U+Jv2zxz+z39n8PeJJGLzaM4jttH1CTdnfDtx9guXC9QptnbqI+p/SQv9kuHidyp7bcADJ+hDc84GMcimo8Y2A5XaGBbDAEfKCOOQCB0/WvqvDjxPzzhPMFmWRVuSWzW8Jx/lnHZrt1jvFxlZrkxeBpYiHs6q0P5L/FPhjxX4G8Q3ngrx1p91pGtaZmO6s7yMx3ECcFDt6FTjMbKXjdfunFZmnXeo6de2ur6RPJY6nYSh4bi2kaGeGVVBBilRtykZweQMDkHpX9SHxc+CHwp+O3hODw98U9FS+t7PItLyBvs2o2CNyTaXa7mhX+IxHfC2cmM9a/FT9oD9gD4vfCIT+IfAKP458NwvkzWkAGpWyAj5ruxiJLqBwZbUyLgZdI+g/wBavBb6XnD3FKhgcxawuKenLJ/u5vb93N6a9ITtLVRi6mrPz/NeGKtFc1L3o/l8jpfhN+3P5LR6D8d4PtSARqmt2EP78Lt+9eWS7S2BndJb4c4yYWzmv0T0HXNC8XeG4/F3hLULXWNIuVwl5auGiLpn5CfvK3T93IquMEEDFfzn+da6hDFcWbwtCynv8jMSdoz6JwOuQMcCu08GeMPGHw58Qt4i+Hes3OkajPGA0lswUsmPmWVGzHMoyAFkVhxnsK/ojNOE6VST9j7ku3T/AIH5eR+KcQeHGFxF6mEfs5dvs/d9n5adon9CHkMI2SbcdwHByrAHr243fTHY1PuWVUnYerBQD2459OPoDj2r8y/Af7fnie3P2H4r+HrfUY+pv9CItLn03G1mYW8h9RHJH3wM4r688G/tR/s6+NCINN8VWmlzSvkWmtI+mSludvzTgQMO4/e44OOK+PxWR4qiveh92q/Db52PyjNODMzwj9+k2u8feX4bfNI9zMeUIBO04G3oA2PvAYPPvwOuOacu9j50IDEjnAAPp0HUY9unpWtaaFqGoWUV/pUMl1Yyr5iS2+ya2KgbjtmjzGU6dG7c18yePf2ovgX8OIpbbUdYj1PU0Y50/RQL6TO/aVe4Ux2sZyMfPNwegNedhsPOrLkpRu/I8HA4GtiZ+zw0HJ9kr/lsfQPyRb2kxsIwT24H8IOWz06Y4FcV8Tfib8O/hDZpf/E3VI9NkukVraxjUz6jd4yB5FqgDHJH+sk2RDvIBX5rfEv9t/4reLEk0v4eWsHgu2lG0TQv9r1GUFfl/fyII7c4/wCeUW7srfLXxk8s8+oNrWrSyyXd+zme7uXee4lYgDMzvmRsnuePbjI+xy7g6pJc2IdvJb/5L8fkfpuS+F9WVp4+XKv5Y2b+/wCFfLm+R9XfGD9r74g/FC3vNC8FQ/8ACIaDcRESRwSFtQuYjji6uwF8tGHJjtwFx8rSOM18ii0sbWFZbYCPYqYTG0KoPYKvG0YBx1qa0jN9qFpotlDcSXup3SWtlYWsck91czTEBYLa3hVpJ5HZvliVGY547V/RT+wh/wAG8Pxx+Nj2nxF/bhu7z4a+FJ0SSPw7ZSxHxPfRlMhbqZfMg0qBty74wJbwqCh+zOM172ZZtlmS4fnryUI9ur9Or/TyR+5cNcIuSWHy+laP4fN9fxPxT/Zk/ZR/aE/bL+LP/Cnf2Z/D8viHWYPKa/nd/I07SIpi2261S8ZWS1XaCVUK1xMqkQwORgf3Ef8ABM//AII0fAf9gVbP4o+J5V8d/Fs27xyeJLqHbBpgnXZJb6JauWNpGU+R7h2e6mXdudY28pf0v+A/7P8A8F/2Yfhjp/wb+AHhuy8KeGNMyYLCyTCFyArTTSPuluJ3CgyTzu8rtyzE17GO5/ziv5e478W8XmieGwv7uj+L9X28lp6n71w5wXQwSVSp70/wXoG1U4XoBSjkEtSYbPFOwAAO1fkVj7QXvj/OKaQAPpSng8d6UDIoABt6HFNHvR04/Sj6UALnHApmcnIxSthTzRjA9RQA9unPemDoF6U4g/Sm7emewoAGJz8v9Kbl/wDOKc3B7n6U3PsaAP/W/un479qaeDkfhShhkZ4oz17dq+PPYHZGPlppx+BpMj8valyPu0AGT/SnDAHNNbg/ypBgCgA6Diggcg8UUpIUFqAADA5pe1IWXpnik+lACggH/Cg+1AFBIzuAoARlzjH8q8I/aH/Zd/Z2/a0+Hb/Cz9pXwhp3jPRAxkht7+LL20pG3zbS5QpcWk2OBNbujgE817z33UVvhsVUozVWjLla2toZ1KUZx5ZLQ/jZ/bO/4Nq/iP4Te58Z/sH+JR4t09WMv/CJ+KriODVV3ZPl2GsbVt7nHCxxX6RsFHzXTHr/ADa/E/4afE/4H+PpPhb8bfDmp+CfFaZZNO1y3eyuZo0JTfCH/d3MRO7bJbSSo/3gw5x/q3YUrtxk/TsK8s+MnwQ+DH7Q/gWT4Z/HrwnpHjTw/I+/+z9bs4b23WQAqsiJMjeXIqsdrxlWXPBr9w4Z8c8bh0qWZR9pHutJf5P8PU+Bzfw8wtb38O+R/gf5WYiElzlBHjcXMasc8c4GfmTLEjrgYyOwrvvhj8Xvi18Ftcn1v4ReI9Q8PTXQEtwLSRVt7nrzc20oe2mwTj54yRng9q/r8/aa/wCDaT4A+KzPrn7H3jLUfhzckNs0XWkfxFopKp+7jheWWPU7QM3Vhczoi/dh4wf59fj/AP8ABHD/AIKX/s3F7zxP8LZvGej2zqp1bwNOfEMBc9ZP7OSODU0UKBnNm4469x+1YHjHh7PMPLC1ZQlGWjp1ErNdnGXuyXlqj83xvCmZYOXMo7dYmh4J/wCCpnxR0jZZfFTwjo+voqgte6c82jXWFxvLp+/tCcD+FIgPTByfsTwV/wAFKP2UfERWHxFca34RmTjOp6cbiBCcFCt1prTtjIGD5C9umK/n0ttWspNVl0WOfdeWTus1hNuhuonRsFZLOVVljOPvAqOeO2KspG1vP9hgl3zDGS2VYbScHnByGOAPugHj2/HOLfoacAZreUMJLDyfWjNx+6MuelFf4aaMKHE+Mpe7N39V/wAMfsx8f/2cP2c/2t57v4i/sueNfC6+Nbs+bcaZHqdtZ2ertjqYZ2hls79j/wAtRB5Mxx5ioSZK/IDxR4Y8V+AvEl94M8d6TdaHremzfZrix1CAw3MMmeQ6v6qwAK53Kcq2CK5u7tIr1t+oQxSFFOGmj8w/IBgjfnIHfGQTxVy0eeOJI0wkNuu5Ed9wSNRwiq2QPmwNvAwTgZr9V8MPD/H8N4T+zKmYSxOHikqaqQXtKaW0faxklOK2jF0k4rRSUIxguHMsfSxD51Dlfk9H8joPBfjXxp8O/F9r49+G2qXGi6zYHy4L22kCuoYYKOrDbLA4BEkMitGy9V5r9tf2bv8Agol4C+LD2/gr42xWnhLxRdBYYLoSGHRNQfAwI2kJ+wzPxsikbyGLAI6ZCV+EMkcbRLGqxsdoRVx99f8AloFxhvlBAxxjFSLGL9ZbWUIqTtseORkCcqfkbP8ACewOT39q8zxf8CuH+NcKqWbU7VYq0KsdKkOyvtKH9yV1q+Xlk+ZGWZxWwsvcenbof183Fqba++x3KmF05MT/ACN8xBBKjGOORjjoRkVWRWlCsAcsOenRfUn/ACABxjOP5wfgb+2z+0B8CvDkfgjw/e2HiLQLSNWs9L8QwzX0VnlWBFo8c9vcxRcHdCJfKUj7ikkn1WX/AIKb/tMyrIkOn+DSWJ/5g87LgFfm2yXzYAzu4461/m5nH0CeMaOLlSwdWjUpL4Zc0o3XS8eWTi+6vJLpKS1PuY8WYRxvK6fY/eFlk2fvuDzHuTqobgsvBAGc/QL0zxSx6qkbfaorry54vuujKrluM7CrfK3GeOcY69v5+rz/AIKM/tg3UZNvrGh2bjI8208PWZkRRlQF88SgDkdemfy831r9tz9sHxC226+J+tRxEKjRaY9rpSsR8h4tLeDAHboewNdmX/s/eMKjX1jFYaK/xVW/u9hb8TKXGGFj8Kf3L/M/cX46fsLfCf8AaDgl8Ya/oF14c1qRS3/CSaPELcysVyXv4ZFWzu1yOp2yYz+8Ar8GPjt8Brz4C65/Y8Xirwz4qs95RLnQtSgupI24+S5sA73Fq2FI+XfFuG0SYrxnxTqviHxdf/avHup3mvuhJzql1c3TNuyd3795MZxzx0B69KxbayW0tgkaRRInGEjVFUbgSMKFG3uFPbpiv7s8D/BziHhOisNjs6eJoJWVKVLSHbkm6kppLpFJQX8lz5fNc1w+J1jRs+9/0tYmlZHRYQisRuBLnOzgfdLYHTP0/lJJNJscOg3bZASx6hOnHI2rn19RwwxQ0UsbMs52y4C7gzMc4J24A65AxnAGMUzU7rTdFU/21dwaZHIyqr3LpD5uwdeSobq3AJOD3zmv6NjrofO210I4y8MMljZeZBb3Ay8ELSRRMCd3zxq+x+u35s9O1TFrcWo0+2JEQVSgjAA+XlOQPwI9jj3+xf2ff+Cef7dn7WUVtcfA34T+ItS0yRI7hNb1WD+wtI8knYJEv9W+z/aUVTytrFM2M7Rgc/vz+zR/wbGXkoTxB+2j8T/vHc+g+BIzEnGNqya1qERmdCPlYQWcDDtJ0x8rnvHGVZan9ZrK/wDKtX9y2+dj6PL+GMwxXwQ089EfymadYyazrdh4V0m2ubzVNZeKDTtM063efULuSQLtS2tYQ1xO7EDiJG/I1+6X7Hv/AAb9/tq/tBy2vij4++T8FfCVwySlL9FvvEtxCUU7Y9MjkNvZ7huXfezGSIn5rVq/sX/Zf/Yh/ZM/Ys0WbRv2X/AemeETeLsvL2FXuNTu13bgt1qd0017cBW5USSkL2Ar6n2c8V+GcR+PFad6WV0+VfzSs38lsvxP0TJ/DejTtLFy5vLZHwN+xX/wTK/Y3/YFsWuvgF4WB8SXEAgu/FGryfb9eu0wAwa8dQII3wC0FokEGQCI6+/WOTuxj6UjbmOW6Un8PIr8IzHM8Ri6rr4qblJ9WfpGHw1OlHkpRSXkOJB6fhQenNHGKRkweBiuE2E4z9Kf1wBQVw3pQCO/UUAOxnnAAHFRrjvSkjtj0oPPA4NAAfXt0p3IA+lM6jHSnj+XpQAnv3po5GCAfagdP0pxI6L+VACjO0Y4+lJnsOlGQoAFIyHPWgAPJ5bb9KMD/noaXdt6UeYfT9aAP//X/um/h9qRuDwfb8KcAQOKTPODXx57Ag65B9qaeOKcAM8cCkwdoNAC5wPfGPpSMOxHHb2pcj7vQ9qU8CgBBSHGOO1LnAFLgZ5oAQtg56UnQe30p2Acmk5PA49KAAdhjpSYx07dqRVIB3fhS5I4HWgA60/HHTkU3kdKTGKAHDn/APVRnPTtTS2acuCmO1AAMChj3U7cdCOo/EdKTOTilx3oFY8D+PH7Lf7Nn7UGlx6T+0b4A8PeOYoI2ih/t3Tba9kgVuvkTSJ50J9GjkUg1+QHxe/4Nv8A/gnn44nN38JpvFvwwmiUiKPQdYN5abyPlzaa1HfIEB52RPF1OMcY/fp/TimE5PPavo8p4tzPArlwteUV2vp92x5+LyjC1/4tNP5H8ZvxR/4Nhf2h9GRW+Cfxg8NeJwxK/Z/Emj3misqnbhWubCbUIm6f8+yCvhzx5/wQW/4Ks+CNT+x6B4B0jxtCxLNP4d8T6fhj1z5WqrpsnXj7x4HTmv8AQVC56D2pZAH4dQR6ECvv8F4453SVqnJP1jb/ANJ5T5nEeH2XT2i16M/zLfG//BOr/go54EuzY+KfgL8QWLNl3tdG/taI/wCzu0qW8wu7nI7cdK+dvGnwd+MHw2VYviN4D8V6AhG0nWfDes2a7AexnskTaCehO3vx0r/VbhQQAeSAmDn5fl/lVgz3AHEsox/00fH86+lw/wBILEr+Nho/Jtf5nkVfDDDv4KjX3H+RpceOvCOnytDe39ra5HAmuAkrZxldrorKuM/McHAA6k1GvxB+Hg2qdas0XJAj+0IflJyANqjI6ckHrX+ust/equ3zWP8An6U59TvyhRpT/wCOj8sLXp/8TB0/+gT/AMn/APtDk/4hcv8An9+H/BP8knRNSPiPbb+D4Z9TYqF22lpd3fAOdoFtA+4ZyBnn6V9H6B+yZ+2H42tYbzwX8GviJq8E23bJbeENa8hgx6rLPbRw7ckcbsY5J54/1HJLi8ZstPJ/wFiP5YpJGkk/1ru+OzOxH5VxVvpAz/5d4W3rK/8A7ajal4X0l8dV/cf5w3gX/gjb/wAFTvHdst/ofwQ1fTbdxt8/XtQ0bSggyDlo571rkDHOBCcdPSvvD4Yf8G1f7cniq7s7j4qeOPA/guxmVRK9o+o+I72EL/AIY4tNt+Dx/wAfDD0OK/t9+zRI+UCDj06VYCgf57V87jPHbN5q1KEIeib/ADdvwPXw/h3gIayuz+aL4Pf8Gx37LXhuK1uPj98QPFfj25gkBkt9PNt4a02eMfwNHaLPfgHgHbfK3HWv2D/Z5/4JvfsKfsrXcWsfAP4VeHdA1aA7o9Xe1/tHV1wAMf2nqBubzHH/AD17V9s9xnmlBBHFfA5vx1m+OusTiJNdlovuVl+B9LgshweH/g00hCGdt8hZmXjcxLEf4fhS4PBB/OgkDjpTuh/kK+TZ64zHO5uKdgjjFLwAOeB0pD146UgH5z7Zpmc9KaeOhp2fbHagAwBntRkDr6UHG3JGKTcAcUALx2/LHFOPTPpSHC00gAbvSgB56Uw46nNOJGDjtSZ/ioAQ89OtOyOwpCPlx0pxAI6UAN4LYx2pOMYPSg/7WKd0Of8APFAAWzxSZ54owckUY49qAHAb+eaXy/rSfd4xmlz7UAf/0P7pScR/SlYBRuHcU1v9X+FPk+5+Br489gMDaT7UKoz9c0v8H4UqfeH40ARsOQaUYwfahu1A6N/n0oAF5Xce2KQgLIVA6Z/SlT/Vn8KH/wBc340AMPCkinAADGKa3+rNPoENb0obrig/eFDfe/CgY3Pzfh/hTl6H2ph+9+A/pTl6GgBw4OBSHoPel/ipD0WgAHzRhv8APWpMdPeo0/1I/wA96l9KAIwTjOaa3DEf54pw+6Ka/wB8/wCe9AAOUyf88VJnkr6VGv8Aq/y/lUn8ZoAYzFQSKVmI4pj/AHTSvQA8k7j7ZpzgI20elMPU/jUk3+sP0oAgLEEYqXaAP8+1QN1H+e1WT0/L+lADFOX2+lIeGIFCf6w/57UrfeP0oAZnHOKeQAcfhUZ6flUp+9+NAA4xj3qMNkn2/pUsnRfpUCdW/GqeyAlCheRSgcD8BS0L90fhUgMYneAOKNoOe3akb/WCnjv9f6CgCEtzkAdKlHJwagP+fyqdfvfhT6Cew3rz6g0ufkzSDoPoaP8AlnQxiyHbIVHQUgbINE3+takXoaQCbiefw/SpFOc9sVCP6n+QqVO/1oARsL27UA8fpRJ0/A0g6D60AOJ+Q07FMP3GqSgB6oOR6U7YKVep/wA9qdQB/9k=";
return (
<div style={{
position: 'fixed', inset: 0, zIndex: 9999,
background: '#0D0D1A',
display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
gap: 20,
opacity: splashFading ? 0 : 1,
transition: 'opacity 0.4s ease',
}}>
<style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&display=swap'); @keyframes splashPulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.06); } } @keyframes splashGlow { 0%,100% { box-shadow: 0 0 30px #7C3AED88; } 50% { box-shadow: 0 0 60px #7C3AED, 0 0 80px #EC489966; } } .splash-logo { animation: splashPulse 1.8s ease-in-out infinite, splashGlow 1.8s ease-in-out infinite; }`}</style>
<img
className="splash-logo"
src={LOGO_SRC}
alt="Kaleido"
style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', border: '3px solid #7C3AED44' }}
onError={(e) => { e.target.style.display='none'; }}
/>
<span style={{
fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 36,
background: 'linear-gradient(135deg, #A78BFA, #F472B6)',
WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
}}>Kaleido</span>
<div style={{
width: 40, height: 3, borderRadius: 2,
background: 'linear-gradient(90deg, #7C3AED, #EC4899)',
animation: 'splashPulse 1.8s ease-in-out infinite'
}} />
</div>
);
}

const viewWrapStyle = (trans) => getViewMotionStyle(trans);
const interactiveBackPreview = edgeSwipeActive && currentView !== VIEWS.HUB;
const activeScreenInteractiveStyle = interactiveBackPreview ? {
transform: `translate3d(${(edgeSwipeProgress * 100).toFixed(3)}vw, 0, 0)`,
transition: edgeSwipeDragging ? "none" : "transform 220ms cubic-bezier(0.22, 1, 0.36, 1)",
willChange: "transform",
position: "relative",
zIndex: 2,
boxShadow: "-18px 0 36px rgba(0,0,0,0.26)"
} : {};
const previewHubStyle = interactiveBackPreview ? {
display: "block",
position: "absolute",
inset: 0,
minHeight: "100vh",
zIndex: 0,
transform: `translate3d(${(-12 + edgeSwipeProgress * 12).toFixed(2)}px, 0, 0) scale(${(0.985 + edgeSwipeProgress * 0.015).toFixed(4)})`,
transformOrigin: "left center",
opacity: Math.min(1, 0.92 + edgeSwipeProgress * 0.08),
transition: edgeSwipeDragging ? "none" : "transform 220ms cubic-bezier(0.22, 1, 0.36, 1), opacity 220ms ease",
pointerEvents: "none"
} : {
display: currentView === VIEWS.HUB ? "block" : "none",
minHeight: "100vh",
position: currentView === VIEWS.HUB ? "relative" : "absolute",
inset: 0,
zIndex: 0
};
const keepHubMounted = currentView === VIEWS.HUB || currentView === VIEWS.PDF_VIEWER || interactiveBackPreview;

return (
<div data-kaleido-screen="true" style={{ ...viewWrapStyle(viewTransition), position: "relative", minHeight: "100vh", background: "#0D0D1A", overflowX: "hidden" }}>
<style>{GLOBAL_MOTION_CSS}</style>

{keepHubMounted && (
<div
style={previewHubStyle}
aria-hidden={currentView !== VIEWS.HUB}
>
{HubView()}
</div>
)}

{currentView === VIEWS.LIBRARY && (
<div data-kaleido-screen="true" style={{ ...viewWrapStyle(viewTransition), ...activeScreenInteractiveStyle }}>
<LibraryView
database={database}
onNavigateHub={navigateToHub}
onEditPatron={(patron) => { setCurrentPatron(patron); setCurrentView(VIEWS.PATRON_EDITOR); }}
onNewCustomPatron={handleNewCustomPatron}
onNewPdfPatron={handleNewPdfPatron}
onDeletePatron={(id) => { deletePatronFromDB(id); }}
onRenamePatron={(id, name) => updatePatron(id, { name })}
onChangePatronColor={(id, idx) => updatePatron(id, { colorIdx: idx })}
onUpdatePatron={(id, updates) => updatePatron(id, updates)}
onChangePatronPhoto={(id) => setPhotoTarget({ id, context: "patron" })}
editingPdfPatron={editingPdfPatron}
setEditingPdfPatron={(p) => {
// Toujours prendre la version fraîche de database
if (p) { const fresh = (database.patrons||[]).find(x => x.id === p.id); setEditingPdfPatron(fresh ? {...fresh} : {...p}); }
else setEditingPdfPatron(null);
}}
/>
{showLibraryImportModal && <ImportPdfModal onClose={() => setShowLibraryImportModal(false)} onCreate={async (name, pdfData, total, partiesConfig) => {
const newId = (database.settings.lastPatronId || 0) + 1;
const colorIdx = Math.floor(Math.random() * KALEIDOSCOPE_COLORS.length);
const pdfId = `patron_pdf_${newId}`;
const saved = await savePdf(pdfId, pdfData);
if (!saved) { alert("Erreur: impossible de sauvegarder le PDF."); return; }
const pdfParties = partiesConfig.filter(p => p.nom.trim()).map((p, i) => ({ id: i+1, nom: p.nom.trim(), totalRangs: parseInt(p.rangs)||0, colorIdx: i % KALEIDOSCOPE_COLORS.length }));
const newPatron = { id: newId, name, colorIdx, image: null, projectType: "pdf", pdfId, total, pdfParties, createdAt: new Date().toISOString() };
addPatron(newPatron);
setShowLibraryImportModal(false);
}} />}
{/* Photo modal pour la bibliothèque */}
{photoTarget && photoTarget.context === 'patron' && (
<PhotoCropModal
existingImage={(database.patrons||[]).find(p => p.id === photoTarget.id)?.image}
onClose={() => setPhotoTarget(null)}
onConfirm={(imgData) => { updatePatron(photoTarget.id, { image: imgData }); setPhotoTarget(null); }}
/>
)}
{/* Modale édition patron PDF — dans KaleidoHub pour accès direct à database */}
{editingPdfPatron && (
<EditPdfPatronModal
key={editingPdfPatron.id + '-' + (editingPdfPatron.pdfParties||[]).length}
patron={editingPdfPatron}
onClose={() => setEditingPdfPatron(null)}
onSave={(updates) => { updatePatron(editingPdfPatron.id, updates); setEditingPdfPatron(null); }}
/>
)}
</div>
)}

{currentView === VIEWS.PATRON_EDITOR && (
<div data-kaleido-screen="true" style={{ ...viewWrapStyle(viewTransition), ...activeScreenInteractiveStyle }}><PatronEditorView /></div>
)}

{currentView === VIEWS.ROW_COUNTER && (
<div data-kaleido-screen="true" style={{ ...viewWrapStyle(viewTransition), ...activeScreenInteractiveStyle }}>
<CompteurRangsView
project={currentProject}
onNavigateHub={navigateToHub}
onNavigateEditor={navigateToPatronEditor}
onSaveProgress={(rang, total, elapsed) => updateProject(currentProject.id, { rang, total, elapsedTime: elapsed })}
/>
</div>
)}

{currentView === VIEWS.PDF_VIEWER && (
<div data-kaleido-screen="true" style={{ ...viewWrapStyle(viewTransition), ...activeScreenInteractiveStyle }}>
<PdfViewerView
project={currentProject}
onNavigateHub={navigateToHub}
onSaveProgress={(rang, total, elapsed) => updateProject(currentProject.id, { rang, total, elapsedTime: elapsed })}
/>
</div>
)}

{currentView === VIEWS.HUB && !keepHubMounted && HubView()}
</div>
);
}

