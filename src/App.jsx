import React, { useState, useEffect, useRef } from “react”;
const VIEWS = { HUB: ‘hub’, LIBRARY: ‘library’, PATRON_EDITOR: ‘patron_editor’, ROW_COUNTER: ‘row_counter’, PDF_VIEWER: ‘pdf_viewer’ };
const KALEIDOSCOPE_COLORS = [
{ bg: “#7C3AED”, light: “#A78BFA” }, // violet
{ bg: “#EC4899”, light: “#F9A8D4” }, // rose vif
{ bg: “#F97316”, light: “#FDBA74” }, // orange vif
{ bg: “#06B6D4”, light: “#67E8F9” }, // cyan
{ bg: “#10B981”, light: “#6EE7B7” }, // vert menthe
{ bg: “#EAB308”, light: “#FDE68A” }, // jaune doré
{ bg: “#3B82F6”, light: “#93C5FD” }, // bleu clair
{ bg: “#EF4444”, light: “#FCA5A5” }, // corail rouge
];

const GLOBAL_MOTION_CSS = `button, [data-kaleido-pressable="true"] { transition: transform 140ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 220ms ease, filter 180ms ease, opacity 180ms ease; will-change: transform, filter; } button:active, [data-kaleido-pressable="true"]:active { transform: scale(0.94) translateY(1px); filter: brightness(1.08); } [data-kaleido-modal-backdrop="true"] { animation: kaleidoFadeIn 220ms ease both; backdrop-filter: blur(3px); } [data-kaleido-modal-card="true"] { animation: kaleidoModalIn 260ms cubic-bezier(0.22, 1, 0.36, 1) both; transform-origin: center center; } [data-kaleido-screen="true"] { min-height: 100vh; } @keyframes kaleidoFadeIn { from { opacity: 0; } to { opacity: 1; } } @keyframes kaleidoModalIn { from { opacity: 0; transform: translateY(14px) scale(0.975); } to { opacity: 1; transform: translateY(0) scale(1); } } @keyframes kaleidoScreenInRight { from { opacity: 1; transform: translate3d(0, 0, 0); } to { opacity: 1; transform: translate3d(0, 0, 0); } } @keyframes kaleidoScreenInLeft { from { opacity: 1; transform: translate3d(0, 0, 0); } to { opacity: 1; transform: translate3d(0, 0, 0); } } @keyframes kaleidoScreenFade { from { opacity: 1; transform: translate3d(0, 0, 0); } to { opacity: 1; transform: translate3d(0, 0, 0); } } @keyframes kaleidoParallaxFloat { 0%, 100% { transform: translate3d(var(--kx, 0px), var(--ky, 0px), 0); } 50% { transform: translate3d(calc(var(--kx, 0px) * 1.35), calc(var(--ky, 0px) * 1.35 - 2px), 0); } } @keyframes kaleidoProgressBreath { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.018); } } @keyframes kaleidoProgressPulse { 0% { transform: scale(0.965); filter: brightness(0.98); } 55% { transform: scale(1.085); filter: brightness(1.1); } 100% { transform: scale(1); filter: brightness(1); } } @keyframes kaleidoProgressArcNudge { 0% { stroke-dashoffset: var(--ring-final); } 44% { stroke-dashoffset: var(--ring-overshoot); } 100% { stroke-dashoffset: var(--ring-final); } } @keyframes kaleidoProgressCleanPulse { 0%, 100% { transform: scale(1); } 42% { transform: scale(1.012); } } @keyframes kaleidoProgressCleanGlow { 0%, 100% { filter: drop-shadow(0 0 0 rgba(255,255,255,0)); } 42% { filter: drop-shadow(0 0 5px currentColor) drop-shadow(0 0 9px currentColor); } } @keyframes kaleidoBarCleanPulse { 0%, 100% { transform: scaleX(1); } 42% { transform: scaleX(1.0045); } } @keyframes kaleidoBarCleanGlow { 0%, 100% { box-shadow: 0 0 0 rgba(255,255,255,0); } 42% { box-shadow: 0 0 7px rgba(255,255,255,0.10), 0 0 12px currentColor; } }`;

const getViewMotionStyle = (transitionName) => {
return { animation: ‘none’ };
};

const Icon = ({ name, size = 20, stroke = 1.9, color = “currentColor”, style = {} }) => {
const common = {
width: size,
height: size,
viewBox: “0 0 24 24”,
fill: “none”,
stroke: color,
strokeWidth: stroke,
strokeLinecap: “round”,
strokeLinejoin: “round”,
style,
“aria-hidden”: true,
};

switch (name) {
case “library”:
return (
<svg {…common}>
<rect x="4" y="4" width="6.5" height="6.5" rx="1.5" />
<rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" />
<rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" />
<rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" />
</svg>
);
case “book”:
return (
<svg {…common}>
<path d="M6.5 5.5A2.5 2.5 0 0 1 9 3h8.5v17H9a2.5 2.5 0 0 0-2.5 2" />
<path d="M6.5 5.5v15" />
<path d="M9.5 7.5h5.5" />
<path d="M9.5 11h5.5" />
</svg>
);
case “bookOpen”:
return (
<svg {…common}>
<path d="M12 6.5c-1.5-1.2-3.4-1.8-5.5-1.8H4.5V18h2c2.1 0 4 .6 5.5 1.8" />
<path d="M12 6.5c1.5-1.2 3.4-1.8 5.5-1.8h2V18h-2c-2.1 0-4 .6-5.5 1.8" />
<path d="M12 6.5V19.8" />
</svg>
);
case “settings”:
return (
<svg {…common}>
<circle cx="12" cy="12" r="3.2" />
<path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a2 2 0 1 1-4 0v-.2a1 1 0 0 0-.7-.9 1 1 0 0 0-1.1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a2 2 0 1 1 0-4h.2a1 1 0 0 0 .9-.7 1 1 0 0 0-.2-1.1l-.1-.1a2 2 0 0 1 2.8-2.8l.1.1a1 1 0 0 0 1.1.2 1 1 0 0 0 .6-.9V4a2 2 0 1 1 4 0v.2a1 1 0 0 0 .7.9 1 1 0 0 0 1.1-.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1 1 0 0 0-.2 1.1 1 1 0 0 0 .9.6h.2a2 2 0 1 1 0 4h-.2a1 1 0 0 0-.9.7Z" />
</svg>
);
case “search”:
return (
<svg {…common}>
<circle cx="11" cy="11" r="6.5" />
<path d="m16 16 4 4" />
</svg>
);
case “edit”:
return (
<svg {…common}>
<path d="M12 20h9" />
<path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L8 18l-4 1 1-4 11.5-11.5Z" />
</svg>
);
case “image”:
return (
<svg {…common}>
<rect x="3.5" y="5" width="17" height="14" rx="2.5" />
<circle cx="9" cy="10" r="1.3" />
<path d="m20.5 16-4.5-4.5L7 20" />
</svg>
);
case “trash”:
return (
<svg {…common}>
<path d="M3 6h18" />
<path d="M8 6V4.8A1.8 1.8 0 0 1 9.8 3h4.4A1.8 1.8 0 0 1 16 4.8V6" />
<path d="M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14" />
<path d="M10 10v7" />
<path d="M14 10v7" />
</svg>
);
case “yarn”:
return (
<svg {…common}>
<circle cx="12" cy="11.5" r="6.8" />
<path d="M7.8 8.8c1.1-.9 2.6-1.4 4.2-1.4 1.8 0 3.4.6 4.5 1.7" />
<path d="M6.8 11.7c1.4-1.2 3.2-1.9 5.2-1.9 2 0 3.7.7 5.1 2" />
<path d="M7.6 14.7c1.2-.8 2.7-1.3 4.4-1.3 1.7 0 3.2.4 4.5 1.3" />
<path d="M8 18.2c1.2-.7 2.5-1 4-1" />
<path d="M5.6 17.9c1.9.1 3.5.9 4.9 2.6" />
</svg>
);
case “note”:
return (
<svg {…common}>
<path d="M7 3.5h7l4 4V20a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 20V5A1.5 1.5 0 0 1 7.5 3.5Z" />
<path d="M14 3.5V8h4" />
<path d="M9 12h6" />
<path d="M9 15.5h6" />
</svg>
);
case “file”:
return (
<svg {…common}>
<path d="M8 3.5h6l4 4V20a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 20V5A1.5 1.5 0 0 1 7.5 3.5Z" />
<path d="M14 3.5V8h4" />
</svg>
);
case “checkCircle”:
return (
<svg {…common}>
<circle cx="12" cy="12" r="8.5" />
<path d="m8.7 12 2.2 2.3 4.5-4.8" />
</svg>
);
case “square”:
return (
<svg {…common}>
<rect x="4.5" y="4.5" width="15" height="15" rx="3" />
</svg>
);
case “download”:
return (
<svg {…common}>
<path d="M12 3v12" />
<path d="M7 10l5 5 5-5" />
<path d="M5 21h14" />
</svg>
);
case “upload”:
return (
<svg {…common}>
<path d="M12 21V9" />
<path d="M17 14l-5-5-5 5" />
<path d="M5 3h14" />
</svg>
);
case “sparkles”:
return (
<svg {…common}>
<path d="m12 3 1.1 3.3L16.5 7.5l-3.4 1.2L12 12l-1.1-3.3L7.5 7.5l3.4-1.2L12 3Z" />
<path d="m18.5 13.5.7 2.1 2.1.7-2.1.7-.7 2.1-.7-2.1-2.1-.7 2.1-.7.7-2.1Z" />
<path d="m5.5 14.5.7 2.1 2.1.7-2.1.7-.7 2.1-.7-2.1-2.1-.7 2.1-.7.7-2.1Z" />
</svg>
);
case “grid”:
return (
<svg {…common}>
<rect x="4" y="4" width="6.5" height="6.5" rx="1.5" />
<rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" />
<rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" />
<rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" />
</svg>
);
case “projects”:
return (
<svg {…common}>
<rect x="4.5" y="5" width="11" height="14" rx="2.2" />
<path d="M8 9h4" />
<path d="M8 12.5h4.5" />
<path d="M16.5 8.5h3" />
<path d="M16.5 12h3" />
<path d="M16.5 15.5h3" />
</svg>
);
case “chart”:
return (
<svg {…common}>
<path d="M5 19.5h14" />
<path d="M7.5 16V11" />
<path d="M12 16V7.5" />
<path d="M16.5 16v-5" />
</svg>
);
case “checkBadge”:
return (
<svg {…common}>
<path d="M12 3.5 9.8 5 7 4.6l-.8 2.7L4 9l1.5 2.4-.2 2.8 2.7.8L9.7 17l2.3 1.5 2.3-1.5 2.7.4.8-2.7L20 15l-.4-2.7L21 9.9l-2.1-1.6-.8-2.7-2.8.4L12 3.5Z" />
<path d="m9.3 12 1.7 1.8 3.7-4" />
</svg>
);
case “camera”:
return (
<svg {…common}>
<path d="M4.5 8.5h3l1.2-2h6.6l1.2 2h3a1.8 1.8 0 0 1 1.8 1.8v7.2a1.8 1.8 0 0 1-1.8 1.8h-15a1.8 1.8 0 0 1-1.8-1.8v-7.2A1.8 1.8 0 0 1 4.5 8.5Z" />
<circle cx="12" cy="13" r="3.2" />
</svg>
);
case “undo”:
return (
<svg {…common}>
<path d="M9 9 5.5 12.5 9 16" />
<path d="M6 12.5h7a4.5 4.5 0 1 1 0 9h-2.5" />
</svg>
);
case “alert”:
return (
<svg {…common}>
<path d="M12 4 4.5 18h15L12 4Z" />
<path d="M12 9v4.5" />
<path d="M12 17h.01" />
</svg>
);
default:
return null;
}
};

const IconBadge = ({ name, size = 18, tone = “violet”, background, color, badgeSize = 44 }) => {
const tones = {
violet: { background: “linear-gradient(135deg, #7C3AED, #A78BFA)”, color: “#fff” },
pink: { background: “linear-gradient(135deg, #DB2777, #F472B6)”, color: “#fff” },
blue: { background: “linear-gradient(135deg, #0891B2, #22D3EE)”, color: “#fff” },
green: { background: “linear-gradient(135deg, #059669, #34D399)”, color: “#fff” },
amber: { background: “linear-gradient(135deg, #D97706, #FCD34D)”, color: “#fff” },
slate: { background: “linear-gradient(135deg, #2A2A3E, #4C4C6A)”, color: “#fff” },
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

const DB_KEY = ‘kaleido_database’;
const DB_BACKUP_KEY = ‘kaleido_database_backup’;
const PATRON_BACKUP_KEY = ‘kaleido_patron_backup’;
const debug = (…args) => {
if (typeof window !== “undefined” && window.KALEIDO_DEBUG) {
console.log(”[KALEIDO]”, …args);
}
};
const canUseStorage = () => {
try {
return typeof window !== “undefined” && typeof localStorage !== “undefined”;
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
console.warn(”[KALEIDO] writeStorageJSON error:”, e);
return false;
}
};
const clearStorageKey = (key) => {
if (!canUseStorage()) return false;
try {
localStorage.removeItem(key);
return true;
} catch (e) {
console.warn(”[KALEIDO] clearStorageKey error:”, e);
return false;
}
};
const isValidDatabase = (data) => {
if (!data || typeof data !== “object”) return false;
return Array.isArray(data.projectsPersonal)
&& Array.isArray(data.projectsPro)
&& Array.isArray(data.patrons)
&& data.settings
&& typeof data.settings === “object”;
};
const getDefaultDatabase = () => ({
projectsPersonal: [
{ id: 1, name: “Écharpe hiver”, rang: 42, total: 80, colorIdx: 0, image: null, type: “tricot”, laine: “”, outil: “”, notes: “”, parties: [] },
{ id: 2, name: “Tuque Noël”, rang: 15, total: 30, colorIdx: 1, image: null, type: “crochet”, laine: “”, outil: “”, notes: “”, parties: [] },
{ id: 3, name: “Mitaines bébé”, rang: 8, total: 20, colorIdx: 2, image: null, type: “tricot”, laine: “”, outil: “”, notes: “”, parties: [] },
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
debug(“Base principale invalide, restauration depuis le backup.”);
writeStorageJSON(DB_KEY, backup);
return backup;
}

} catch(e) {
console.warn(”[KALEIDO] initDatabase error:”, e);
}
return getDefaultDatabase();
};
const saveToDatabase = (data) => {
try {
if (!canUseStorage()) return false;
if (!isValidDatabase(data)) {
console.warn(”[KALEIDO] saveToDatabase ignoré: base invalide.”);
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
console.warn(”[KALEIDO] saveToDatabase error:”, e);
return false;
}
};
const loadPatronDraft = ({ sourceId, mode }) => {
const payload = readStorageJSON(PATRON_BACKUP_KEY);
if (!payload || typeof payload !== “object”) return null;
if ((payload.mode || null) !== mode) return null;
if ((payload.sourceId ?? null) !== (sourceId ?? null)) return null;
return payload.patron && typeof payload.patron === “object” ? payload.patron : null;
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
if (!payload || typeof payload !== “object”) return false;
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
const req = indexedDB.open(‘kaleido_pdfs’, 1);
req.onupgradeneeded = e => e.target.result.createObjectStore(‘pdfs’, { keyPath: ‘id’ });
req.onsuccess = e => { db = e.target.result; resolve(db); };
req.onerror = () => reject(req.error);
});
})();
const savePdf = async (id, data) => {
try {
const db = await _pdfDb();
await new Promise((resolve, reject) => {
const tx = db.transaction(‘pdfs’, ‘readwrite’);
tx.objectStore(‘pdfs’).put({ id, data });
tx.oncomplete = resolve;
tx.onerror = () => reject(tx.error);
});
return true;
} catch(e) {
console.error(‘savePdf error:’, e);
return false;
}
};
const loadPdf = async (id) => {
try {
if (!id) return null;
const db = await _pdfDb();
return await new Promise((resolve, reject) => {
const tx = db.transaction(‘pdfs’, ‘readonly’);
const req = tx.objectStore(‘pdfs’).get(id);
req.onsuccess = () => {
const data = req.result?.data || null;
if (!data || typeof data !== “string”) {
resolve(null);
return;
}
resolve(data);
};
req.onerror = () => reject(req.error);
});
} catch(e) {
console.error(‘loadPdf error:’, e);
return null;
}
};
const deletePdf = async (id) => {
try {
const db = await _pdfDb();
await new Promise((resolve) => {
const tx = db.transaction(‘pdfs’, ‘readwrite’);
tx.objectStore(‘pdfs’).delete(id);
tx.oncomplete = resolve;
});
} catch(e) {}
};
// ═══════════════════════════════════════════════════════════════
// COMPOSANTS HUB
// ═══════════════════════════════════════════════════════════════
function ProjectBubble({ project, onMenuOpen, onProjectClick, mode }) {
const color = KALEIDOSCOPE_COLORS[project.colorIdx % KALEIDOSCOPE_COLORS.length];
const isLibrary = mode === “library”;
const size = isLibrary ? “clamp(96px, 28vw, 110px)” : “clamp(94px, 27vw, 108px)”;
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
if (!project) return null;
const color = KALEIDOSCOPE_COLORS[project.colorIdx % KALEIDOSCOPE_COLORS.length];
return (
<div data-kaleido-modal-backdrop="true" style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
<div onClick={e => e.stopPropagation()} data-kaleido-modal-card="true" style={{ background: "#1A1A2E", borderRadius: 9999, padding: 24, width: "100%", maxWidth: 340 }}>
<h3 style={{ color: "#F1F0EE", fontFamily: "'DM Sans', sans-serif", margin: "0 0 16px" }}>Renommer le projet</h3>
<input autoFocus value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => e.key === "Enter" && onConfirm(val)}
style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: `1px solid ${color.light}44`, background: "#0D0D1A", color: "#F1F0EE", fontSize: 16, outline: "none", boxSizing: "border-box" }} />
<div style={{ display: "flex", gap: 10, marginTop: 16, justifyContent: "flex-end" }}>
<button onClick={onClose} style={{ padding: "8px 18px", borderRadius: 10, border: "1px solid #333", background: "none", color: "#999", cursor: "pointer" }}>Annuler</button>
<button onClick={() => onConfirm(val)} style={{ padding: "8px 18px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #7C3AED, #DB2777)", color: "#fff", cursor: "pointer", fontWeight: 600 }}>Confirmer</button>
</div>
</div>
</div>
);
}
function DeleteModal({ project, onConfirm, onClose }) {
if (!project) return null;
return (
<div data-kaleido-modal-backdrop="true" style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
<div onClick={e => e.stopPropagation()} data-kaleido-modal-card="true" style={{ background: "#1A1A2E", borderRadius: 9999, padding: 24, width: "100%", maxWidth: 340 }}>
<h3 style={{ color: "#F1F0EE", fontFamily: "'DM Sans', sans-serif", margin: "0 0 10px" }}>Supprimer "{project.name}" ?</h3>
<p style={{ color: "#999", fontSize: 13, margin: "0 0 20px" }}>Cette action est irréversible.</p>
<div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
<button onClick={onClose} style={{ padding: "8px 18px", borderRadius: 10, border: "1px solid #333", background: "none", color: "#999", cursor: "pointer" }}>Annuler</button>
<button onClick={onConfirm} style={{ padding: "8px 18px", borderRadius: 10, border: "none", background: "#EF4444", color: "#fff", cursor: "pointer", fontWeight: 600 }}>Supprimer</button>
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
<textarea value={tempInstruction} onChange={e => setTempInstruction(e.target.value)} rows={3} autoFocus
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
<textarea value={tempInstruction} onChange={e => setTempInstruction(e.target.value)} placeholder="Instruction du rang..." rows={3} autoFocus
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
? <input value={tempNom} onChange={e => { const nextNom = e.target.value; setTempNom(nextNom); setDisplayNom(nextNom || "Nouvelle partie"); }} onKeyDown={e => { e.stopPropagation(); if (e.key === "Enter") handleSaveNom(); if (e.key === "Escape") { const fallbackNom = partie.nom || "Nouvelle partie"; setTempNom(fallbackNom); setDisplayNom(fallbackNom); setIsEditingNom(false); } }} onBlur={handleSaveNom} onClick={e => e.stopPropagation()} onFocus={e => e.stopPropagation()} autoFocus style={{ background: "none", border: "none", outline: "none", color: "#F1F0EE", fontSize: 15, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", textAlign: "center", width: "100%" }} />
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
autoFocus style={{ background: "rgba(0,0,0,0.5)", border: `1px solid ${col.light}44`, borderRadius: 6, padding: "4px 8px", color: "#F1F0EE", fontSize: 16, outline: "none", textAlign: "center", fontFamily: "'DM Sans', sans-serif", width: "100%", fontWeight: 600 }} />
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
autoFocus type="number" min="2" max="20"
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
nom: project?.name || “Projet”,
technique: project?.type || “crochet”,
outil: project?.outil || “”,
parties: project?.parties || [],
};
const hasParties = patron.parties.length > 0 && patron.parties.some(p => p.rangs.length > 0);
const allRangs = patron.parties.flatMap((p, pi) => p.rangs.map((r, ri) => ({ …r, partieId: p.id, globalId: `${pi}-${ri}` })));
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
if (typeof onSaveProgress === “function”) onSaveProgress(allRangs.slice(0, liveIndex + 2).filter(r => !r.isNote).length, totalRangsForCount, elapsedTime);
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
if (typeof onSaveProgress === “function”) onSaveProgress(allRangs.slice(0, Math.max(0, currentIndexRef.current) + 1).filter(r => !r.isNote).length, totalRangsForCount, elapsedTime);
}
setShowNextPartieModal(false);
setCounters(prev => prev.map(c => ({ …c, value: 1 })));
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
if (typeof onSaveProgress === “function”) onSaveProgress(allRangs.slice(0, liveIndex).filter(r => !r.isNote).length, totalRangsForCount, elapsedTime);
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
if (typeof onSaveProgress === “function”) onSaveProgress(allRangs.slice(0, liveIndex).filter(r => !r.isNote).length, totalRangsForCount, elapsedTime);
}
setShowPrevPartieModal(false);
setCounters(prev => prev.map(c => ({ …c, value: 1 })));
if (navigator.vibrate) navigator.vibrate(20);
};
const goToPartie = (partieId) => {
const targetGlobalId = getPartieFirstCountableGlobalId(partieId);
if (targetGlobalId) {
currentRangIdRef.current = targetGlobalId;
currentIndexRef.current = allRangs.findIndex(r => r.globalId === targetGlobalId);
setCurrentRangId(targetGlobalId);
if (typeof onSaveProgress === “function”) onSaveProgress(allRangs.slice(0, Math.max(0, currentIndexRef.current) + 1).filter(r => !r.isNote).length, totalRangsForCount, elapsedTime);
}
setCounters(prev => prev.map(c => ({ …c, value: 1 })));
};
const addCounter = () => setCounters(prev => […prev, { id: Date.now(), name: `Compteur ${prev.length + 1}`, value: 1, maxRepeats: 4, syncWithGlobal: false, colorIdx: Math.floor(Math.random() * KALEIDOSCOPE_COLORS.length) }]);
const updateCounter = (id, updates) => setCounters(prev => prev.map(c => c.id === id ? { …c, …updates } : c));
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
<div data-kaleido-modal-card="true" style={{ background: "#1A1A2E", borderRadius: 24, padding: 28, width: "100%", maxWidth: 360, textAlign: "center", border: `1px solid ${currentPartieColor.light}33` }}>
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
<div data-kaleido-modal-card="true" style={{ background: "#1A1A2E", borderRadius: 24, padding: 28, width: "100%", maxWidth: 360, textAlign: "center", border: `1px solid ${currentPartieColor.light}33` }}>
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
          <button data-kaleido-back-button="true" onClick={() => { if (typeof onSaveProgress === "function") { try { onSaveProgress(typeof rang !== "undefined" ? rang : allRangs.slice(0, currentIndex + 1).filter(r => !r.isNote).length, typeof total !== "undefined" ? total : totalRangsForCount, typeof elapsedTime !== "undefined" ? elapsedTime : undefined); } catch (e) {} } goBackToHub(); }} style={{ background: "#1E1E32", border: "none", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", color: "#A78BFA", fontSize: 16, cursor: "pointer", flexShrink: 0 }}>←</button>
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

```
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
```

}, []);
// Splash screen effect
useEffect(() => {
const t1 = setTimeout(() => setSplashFading(true), 1800);
const t2 = setTimeout(() => setShowSplash(false), 2200);
return () => { clearTimeout(t1); clearTimeout(t2); };
}, []);

const projectsKey = mode === ‘pro’ ? ‘projectsPro’ : ‘projectsPersonal’;
const projects = database[projectsKey] || [];
const updateProject = (projectId, updates) => {
setDatabase(prev => {
const prevProjectsKey = mode === ‘pro’ ? ‘projectsPro’ : ‘projectsPersonal’;
const nextDb = {
…prev,
[prevProjectsKey]: (prev[prevProjectsKey] || []).map(p => p.id === projectId ? { …p, …updates } : p)
};
saveToDatabase(nextDb);
return nextDb;
});
};
const deleteProjectFromDB = (projectId) => {
setDatabase(prev => {
const prevProjectsKey = mode === ‘pro’ ? ‘projectsPro’ : ‘projectsPersonal’;
const nextDb = {
…prev,
[prevProjectsKey]: (prev[prevProjectsKey] || []).filter(p => p.id !== projectId)
};
saveToDatabase(nextDb);
return nextDb;
});
};
const addProjectToDB = (project) => {
let createdDb = null;
setDatabase(prev => {
const prevProjectsKey = mode === ‘pro’ ? ‘projectsPro’ : ‘projectsPersonal’;
const nextDb = {
…prev,
[prevProjectsKey]: […(prev[prevProjectsKey] || []), project],
settings: { …prev.settings, lastProjectId: project.id }
};
createdDb = nextDb;
saveToDatabase(nextDb);
return nextDb;
});
return createdDb;
};
const filtered = projects.filter(p => {
if (!p.name.toLowerCase().includes(search.toLowerCase())) return false;
if (activeFilter === “Tous”) return true;
if (activeFilter === “En cours”) return p.rang < p.total;
if (activeFilter === “Termin\u00e9s”) return p.rang >= p.total && p.total > 0;
if (activeFilter === “PDF”) return p.projectType === “pdf”;
if (activeFilter === “Crochet”) return p.type === “crochet”;
if (activeFilter === “Tricot”) return p.type === “tricot”;
return true;
});
const totalRangs = projects.reduce((s, p) => s + p.rang, 0);
const termines = projects.filter(p => p.rang >= p.total).length;
// ─── PATRONS CRUD ─────────────────────────────────────────────
const addPatron = (patron) => {
const newDb = { …database, patrons: […(database.patrons || []), patron], settings: { …database.settings, lastPatronId: patron.id } };
setDatabase(newDb); saveToDatabase(newDb);
};
const updatePatron = (patronId, updates) => {
const updatedPatrons = (database.patrons || []).map(p => p.id === patronId ? { …p, …updates } : p);
const updatedPatron = updatedPatrons.find(p => p.id === patronId);

const computeCustomTotal = (patron) => Math.max(
1,
(patron?.parties || []).reduce(
(sum, partie) => sum + ((partie?.rangs || []).filter(r => !r?.isNote).length),
0
)
);

const syncProjectFromPatron = (project) => {
if (project.patronId !== patronId || !updatedPatron) return project;

if (updatedPatron.projectType === ‘custom’) {
return {
…project,
name: updatedPatron.name,
colorIdx: updatedPatron.colorIdx,
image: updatedPatron.image || null,
projectType: ‘custom’,
type: updatedPatron.type,
laine: updatedPatron.laine,
outil: updatedPatron.outil,
notes: updatedPatron.notes,
parties: updatedPatron.parties || [],
total: computeCustomTotal(updatedPatron),
};
}

return {
…project,
name: updatedPatron.name,
colorIdx: updatedPatron.colorIdx,
image: updatedPatron.image || null,
projectType: ‘pdf’,
pdfId: updatedPatron.pdfId,
pdfParties: updatedPatron.pdfParties || [],
total: updatedPatron.total || 1,
};
};

const newDb = {
…database,
patrons: updatedPatrons,
projectsPersonal: (database.projectsPersonal || []).map(syncProjectFromPatron),
projectsPro: (database.projectsPro || []).map(syncProjectFromPatron),
};
setDatabase(newDb); saveToDatabase(newDb);

};
const deletePatronFromDB = (patronId) => {
const newDb = { …database, patrons: (database.patrons || []).filter(p => p.id !== patronId) };
setDatabase(newDb); saveToDatabase(newDb);
};
const navigateToHub = () => {
setPrevView(currentView);
setViewTransition(‘slide-out’);
setTimeout(() => { setCurrentView(VIEWS.HUB); setCurrentProject(null); setViewTransition(‘slide-in’); setTimeout(() => setViewTransition(‘none’), 350); }, 0);
};
const navigateToLibrary = () => {
setPrevView(currentView);
setViewTransition(‘slide-in-right’);
setTimeout(() => setViewTransition(‘none’), 350);
setCurrentView(VIEWS.LIBRARY);
};
const navigateToPatronEditor = (project) => {
if (!project) {
console.warn(”[KALEIDO] navigateToPatronEditor ignoré: projet manquant.”);
return;
}
setViewTransition(‘slide-in-right’);
setTimeout(() => setViewTransition(‘none’), 350);
setCurrentProject(project); setCurrentView(VIEWS.PATRON_EDITOR);
};
const navigateToRowCounter = (project) => {
if (!project) {
console.warn(”[KALEIDO] navigateToRowCounter ignoré: projet manquant.”);
return;
}
setViewTransition(‘slide-in-right’);
setTimeout(() => setViewTransition(‘none’), 350);
setCurrentProject(project); setCurrentView(VIEWS.ROW_COUNTER);
};
const navigateToPdfViewer = async (project) => {
if (!project) {
console.warn(”[KALEIDO] navigateToPdfViewer ignoré: projet manquant.”);
return;
}
if (!project.pdfId) {
alert(“Ce PDF est introuvable pour ce projet.”);
return;
}
const data = await loadPdf(project.pdfId);
if (!data) {
alert(“Impossible d’ouvrir ce PDF. Le fichier semble manquant ou corrompu.”);
return;
}
setCurrentProject(project);
setCurrentView(VIEWS.PDF_VIEWER);
};
const handleNewProject = () => setShowNewMenu(true);
const handleNewCustomPatron = () => {
const newId = (database.settings.lastPatronId || 0) + 1;
const colorIdx = Math.floor(Math.random() * KALEIDOSCOPE_COLORS.length);
const newPatron = { id: newId, name: “Nouveau patron”, colorIdx, image: null, projectType: “custom”, type: “crochet”, laine: “”, outil: “”, notes: “”, parties: [], createdAt: new Date().toISOString() };
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
const newProject = { id: newId, name: “Nouveau projet”, rang: 0, total: 20, colorIdx, image: null, projectType: “custom”, type: “crochet”, laine: “”, outil: “”, notes: “”, parties: [], createdAt: new Date().toISOString(), status: “en_cours” };
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
window.addEventListener(‘pointermove’, handlePointerMove, { passive: true });
window.addEventListener(‘pointerleave’, resetParallax);
window.addEventListener(‘blur’, resetParallax);
return () => {
window.removeEventListener(‘pointermove’, handlePointerMove);
window.removeEventListener(‘pointerleave’, resetParallax);
window.removeEventListener(‘blur’, resetParallax);
};
}, [currentView]);

useEffect(() => {
if (currentView === VIEWS.HUB) return undefined;

let startX = 0;
let startY = 0;
let tracking = false;
let consumed = false;

const isInteractiveTarget = (target) => {
if (!(target instanceof Element)) return false;
return Boolean(
target.closest(‘input, textarea, select, button, a, [contenteditable=“true”], [data-kaleido-no-edge-back=“true”]’)
);
};

const findVisibleBackButton = () => {
const buttons = Array.from(document.querySelectorAll(’[data-kaleido-back-button=“true”]’));
return buttons.find((btn) => {
const style = window.getComputedStyle(btn);
const rect = btn.getBoundingClientRect();
return style.display !== ‘none’
&& style.visibility !== ‘hidden’
&& rect.width > 0
&& rect.height > 0
&& btn.offsetParent !== null;
}) || null;
};

const onTouchStart = (e) => {
if (!e.touches || e.touches.length !== 1) return;
if (isInteractiveTarget(e.target)) return;

```
const touch = e.touches[0];
if (touch.clientX > 26) return;

startX = touch.clientX;
startY = touch.clientY;
tracking = true;
consumed = false;
```

};

const onTouchMove = (e) => {
if (!tracking || !e.touches || e.touches.length !== 1) return;

```
const touch = e.touches[0];
const dx = touch.clientX - startX;
const dy = Math.abs(touch.clientY - startY);

if (dx > 56 && dy < 42 && !consumed) {
  const backButton = findVisibleBackButton();
  if (backButton) {
    consumed = true;
    tracking = false;
    backButton.click();
  }
}
```

};

const onTouchEnd = () => {
tracking = false;
consumed = false;
};

window.addEventListener(‘touchstart’, onTouchStart, { passive: true });
window.addEventListener(‘touchmove’, onTouchMove, { passive: true });
window.addEventListener(‘touchend’, onTouchEnd, { passive: true });
window.addEventListener(‘touchcancel’, onTouchEnd, { passive: true });

return () => {
window.removeEventListener(‘touchstart’, onTouchStart);
window.removeEventListener(‘touchmove’, onTouchMove);
window.removeEventListener(‘touchend’, onTouchEnd);
window.removeEventListener(‘touchcancel’, onTouchEnd);
};
}, [currentView]);
// ─── VUE HUB ──────────────────────────────────────────────
const HubView = () => (

<div data-kaleido-screen="true" style={{ background: "#0D0D1A", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>
<style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap'); ${GLOBAL_MOTION_CSS} @keyframes fadeIn { from { opacity:1; transform:none; } to { opacity:1; transform:none; } } ::-webkit-scrollbar { width: 0; } * { -webkit-tap-highlight-color: transparent; } input, textarea, select { font-size: 16px !important; }`}</style>
<div style={{ padding: "44px 20px 12px", background: "linear-gradient(180deg, #1A0A2E 0%, #0D0D1A 100%)" }}>
{/* Header : logo + titre + boutons */}
<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
<div style={{ display: "flex", alignItems: "center", gap: 10 }}>
<img src="data:image/svg+xml,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20viewBox%3D'0%200%2096%2096'%3E%3Ccircle%20cx%3D'48'%20cy%3D'48'%20r%3D'48'%20fill%3D'%231A0A2E'%2F%3E%3Ccircle%20cx%3D'48'%20cy%3D'48'%20r%3D'32'%20fill%3D'none'%20stroke%3D'%237C3AED'%20stroke-width%3D'3'%2F%3E%3Ccircle%20cx%3D'48'%20cy%3D'48'%20r%3D'10'%20fill%3D'%23EC4899'%2F%3E%3C%2Fsvg%3E" alt="Kaleido" style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }} />
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
<div onClick={() => setShowDataImportModal(false)} style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
<div onClick={e => e.stopPropagation()} data-kaleido-modal-card="true" style={{ background: "#1A1A2E", borderRadius: 9999, padding: 20, width: "100%", maxWidth: 390, maxHeight: "85vh", display: "flex", flexDirection: "column" }}>
<h3 style={{ color: "#F1F0EE", fontFamily: "'Syne', sans-serif", margin: "0 0 6px", fontSize: 16 }}>
Importer tes projets</h3>
<p style={{ color: "#6B6A7A", fontSize: 12, margin: "0 0 12px" }}>Colle ici le texte copié depuis l'export. <span style={{ color: "#F87171" }}>Attention : tes projets actuels seront remplacés.</span></p>
<textarea value={importText} onChange={e => setImportText(e.target.value)}
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
}} style={{ flex: 1, padding: "12px", borderRadius: 12, background: "linear-gradient(135deg, #059669, #34D399)", border: "none", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
Restaurer</button>
<button onClick={() => setShowDataImportModal(false)}
style={{ padding: "12px 20px", borderRadius: 12, background: "#333", border: "none", color: "#999", fontSize: 14, cursor: "pointer" }}>Annuler</button>
</div>
</div>
</div>
)}
{/* Modale données export */}
{showExportData && (
<div onClick={() => setShowExportData(false)} style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
<div onClick={e => e.stopPropagation()} data-kaleido-modal-card="true" style={{ background: "#1A1A2E", borderRadius: 9999, padding: 20, width: "100%", maxWidth: 390, maxHeight: "85vh", display: "flex", flexDirection: "column" }}>
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
}} style={{ flex: 1, padding: "12px", borderRadius: 12, background: "linear-gradient(135deg, #7C3AED, #A78BFA)", border: "none", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
Copier</button>
<button onClick={() => setShowExportData(false)}
style={{ padding: "12px 20px", borderRadius: 12, background: "#333", border: "none", color: "#999", fontSize: 14, cursor: "pointer" }}>Fermer</button>
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
projectType: patron.projectType, patronId: patron.id,
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
backupPatronState(“handleSave”, normalizedPatron);
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
typeof crypto !== “undefined” && crypto.randomUUID
? crypto.randomUUID()
: `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const safeArray = (value) => Array.isArray(value) ? value : [];

const normalizePatron = (candidate) => {
const base = candidate && typeof candidate === “object” ? candidate : {};
const partieIds = new Set();
const rangIds = new Set();
const normalizedParties = safeArray(base.parties).map((partie, partieIndex) => {
const rawPartie = partie && typeof partie === “object” ? partie : {};
let partieId = rawPartie.id;
if (partieId == null || partieIds.has(partieId)) {
partieId = `partie-${partieIndex}-${makeId()}`;
}
partieIds.add(partieId);

```
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
```

});

return {
nom: typeof base.nom === “string” ? base.nom : (source?.name || “Nouveau patron”),
laine: typeof base.laine === “string” ? base.laine : “”,
technique: typeof base.technique === “string” ? base.technique : (source?.type || “crochet”),
outil: typeof base.outil === “string” ? base.outil : “”,
notes: typeof base.notes === “string” ? base.notes : “”,
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
backupPatronState(“autosave”, patron);
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
console.warn(”[KALEIDO] backupPatronState error:”, e);
}
};

const validatePatron = (candidate) => {
const errors = [];
if (!candidate || typeof candidate !== “object”) {
errors.push(“Patron invalide: objet manquant.”);
return errors;
}

const parties = safeArray(candidate.parties);
const partieIds = new Set();
const rangIds = new Set();

for (const partie of parties) {
if (!partie || typeof partie !== “object”) {
errors.push(“Partie invalide: entrée non valide.”);
continue;
}

```
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
```

}

return errors;
};

const applyPatronUpdate = (label, updater) => {
setPatron(prev => {
try {
const next = updater(prev);

```
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
```

});
};

const addPartie = () =>
applyPatronUpdate(“addPartie”, prev => ({
…prev,
parties: [
…safeArray(prev.parties),
{
id: makeId(),
nom: “Nouvelle partie”,
colorIdx: Math.floor(Math.random() * KALEIDOSCOPE_COLORS.length),
rangs: []
}
]
}));

const updatePartie = (id, updates) =>
applyPatronUpdate(“updatePartie”, prev => ({
…prev,
parties: safeArray(prev.parties).map(p => (p.id === id ? { …p, …updates } : p))
}));

const deletePartie = (id) => {
if (!confirm(“Supprimer cette partie?”)) return;
applyPatronUpdate(“deletePartie”, prev => ({
…prev,
parties: safeArray(prev.parties).filter(p => p.id !== id)
}));
};

const duplicatePartie = (id) => {
applyPatronUpdate(“duplicatePartie”, prev => {
const parties = safeArray(prev.parties);
const p = parties.find(x => x.id === id);
if (!p) return prev;

```
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
```

});
};

const movePartie = (id, dir) =>
applyPatronUpdate(“movePartie”, prev => {
const arr = […safeArray(prev.parties)];
const i = arr.findIndex(p => p.id === id);
const ni = dir === “up” ? i - 1 : i + 1;
if (i === -1 || ni < 0 || ni >= arr.length) return prev;
[arr[i], arr[ni]] = [arr[ni], arr[i]];
return { …prev, parties: arr };
});

const addRang = (partieId) =>
applyPatronUpdate(“addRang”, prev => ({
…prev,
parties: safeArray(prev.parties).map(p =>
p.id !== partieId
? p
: {
…p,
rangs: [
…safeArray(p.rangs),
{
id: makeId(),
instruction: “Nouvelle instruction”,
mailles: null
}
]
}
)
}));

const updateRang = (partieId, rangId, updates) =>
applyPatronUpdate(“updateRang”, prev => ({
…prev,
parties: safeArray(prev.parties).map(p =>
p.id !== partieId
? p
: {
…p,
rangs: safeArray(p.rangs).map(r =>
r.id === rangId ? { …r, …updates } : r
)
}
)
}));

const deleteRang = (partieId, rangId) => {
if (!confirm(“Supprimer ce rang?”)) return;

applyPatronUpdate(“deleteRang”, prev => ({
…prev,
parties: safeArray(prev.parties).map(p =>
p.id !== partieId
? p
: {
…p,
rangs: safeArray(p.rangs).filter(r => r.id !== rangId)
}
)
}));
};

const duplicateRang = (partieId, rangId) =>
applyPatronUpdate(“duplicateRang”, prev => ({
…prev,
parties: safeArray(prev.parties).map(p => {
if (p.id !== partieId) return p;

```
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
```

}));

const moveRang = (partieId, rangId, dir) =>
applyPatronUpdate(“moveRang”, prev => ({
…prev,
parties: safeArray(prev.parties).map(p => {
if (p.id !== partieId) return p;

```
  const arr = [...safeArray(p.rangs)];
  const i = arr.findIndex(r => r.id === rangId);
  const ni = dir === "up" ? i - 1 : i + 1;

  if (i === -1 || ni < 0 || ni >= arr.length) return p;

  [arr[i], arr[ni]] = [arr[ni], arr[i]];
  return { ...p, rangs: arr };
})
```

}));
return (

  <div style={{ background: "#0D0D1A", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", maxWidth: 430, margin: "0 auto" }}>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap'); ${GLOBAL_MOTION_CSS} ::-webkit-scrollbar{width:0} *{-webkit-tap-highlight-color:transparent} input,textarea,select{font-size:16px!important}`}</style>
    <div style={{ background: "linear-gradient(180deg, #1A0A2E 0%, #0D0D1A 100%)", padding: "44px 20px 20px", position: "sticky", top: 0, zIndex: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <button data-kaleido-back-button="true" onClick={isPatronMode ? navigateToLibrary : navigateToHub} style={{ background: "#1E1E32", border: "none", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", color: "#A78BFA", fontSize: 16, cursor: "pointer" }}>←</button>
        {isEditingNom
          ? <input value={tempNom} onChange={e => setTempNom(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSaveNom()} onBlur={handleSaveNom} autoFocus style={{ background: "none", border: "none", outline: "none", color: "#F1F0EE", fontSize: 18, fontWeight: 700, fontFamily: "'Syne', sans-serif", flex: 1 }} />
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
const LOGO_SRC = “data:image/svg+xml,%3Csvg%20xmlns%3D’http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg’%20viewBox%3D’0%200%2096%2096’%3E%3Ccircle%20cx%3D’48’%20cy%3D’48’%20r%3D’48’%20fill%3D’%231A0A2E’%2F%3E%3Ccircle%20cx%3D’48’%20cy%3D’48’%20r%3D’32’%20fill%3D’none’%20stroke%3D’%237C3AED’%20stroke-width%3D’3’%2F%3E%3Ccircle%20cx%3D’48’%20cy%3D’48’%20r%3D’10’%20fill%3D’%23EC4899’%2F%3E%3C%2Fsvg%3E”;
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
const keepHubMounted = currentView === VIEWS.HUB || currentView === VIEWS.PDF_VIEWER;

return (

<div data-kaleido-screen="true" style={{ ...viewWrapStyle(viewTransition), position: "relative", minHeight: "100vh", background: "#0D0D1A" }}>
<style>{GLOBAL_MOTION_CSS}</style>

{keepHubMounted && (

<div
style={{
display: currentView === VIEWS.HUB ? "block" : "none",
minHeight: "100vh",
}}
aria-hidden={currentView !== VIEWS.HUB}
>
{HubView()}
</div>
)}

{currentView === VIEWS.LIBRARY && (

<div data-kaleido-screen="true" style={viewWrapStyle(viewTransition)}>
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

<div data-kaleido-screen="true" style={viewWrapStyle(viewTransition)}><PatronEditorView /></div>
)}

{currentView === VIEWS.ROW_COUNTER && (

<div data-kaleido-screen="true" style={viewWrapStyle(viewTransition)}>
<CompteurRangsView
project={currentProject}
onNavigateHub={navigateToHub}
onNavigateEditor={navigateToPatronEditor}
onSaveProgress={(rang, total, elapsed) => updateProject(currentProject.id, { rang, total, elapsedTime: elapsed })}
/>
</div>
)}

{currentView === VIEWS.PDF_VIEWER && (

<div data-kaleido-screen="true" style={viewWrapStyle(viewTransition)}>
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