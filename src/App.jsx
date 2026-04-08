import React, { useState, useEffect, useRef } from "react";

const VIEWS = { HUB: 'hub', PATRON_EDITOR: 'patron_editor', ROW_COUNTER: 'row_counter', PDF_VIEWER: 'pdf_viewer' };

const KALEIDOSCOPE_COLORS = [
  { bg: "#7C3AED", light: "#A78BFA" },
  { bg: "#DB2777", light: "#F472B6" },
  { bg: "#EA580C", light: "#FB923C" },
  { bg: "#0891B2", light: "#22D3EE" },
  { bg: "#059669", light: "#34D399" },
  { bg: "#D97706", light: "#FCD34D" },
  { bg: "#7C3AED", light: "#C4B5FD" },
  { bg: "#BE185D", light: "#F9A8D4" },
];

const DB_KEY = 'kaleido_database';
const initDatabase = () => {
  try {
    const saved = localStorage.getItem(DB_KEY);
    if (saved) return JSON.parse(saved);
  } catch(e) {}
  return {
    projects: [
      { id: 1, name: "Écharpe hiver", rang: 42, total: 80, colorIdx: 0, image: null, type: "tricot", laine: "", outil: "", notes: "", parties: [] },
      { id: 2, name: "Tuque Noël", rang: 15, total: 30, colorIdx: 1, image: null, type: "crochet", laine: "", outil: "", notes: "", parties: [] },
      { id: 3, name: "Mitaines bébé", rang: 8, total: 20, colorIdx: 2, image: null, type: "tricot", laine: "", outil: "", notes: "", parties: [] },
      { id: 4, name: "Couverture laine", rang: 67, total: 120, colorIdx: 3, image: null, type: "tricot", laine: "", outil: "", notes: "", parties: [] },
      { id: 5, name: "Chaussettes douces", rang: 3, total: 40, colorIdx: 4, image: null, type: "tricot", laine: "", outil: "", notes: "", parties: [] },
      { id: 6, name: "Bonnet pompom", rang: 22, total: 25, colorIdx: 5, image: null, type: "crochet", laine: "", outil: "", notes: "", parties: [] },
    ],
    settings: { lastProjectId: 6 }
  };
};
const saveToDatabase = (data) => {
  try { localStorage.setItem(DB_KEY, JSON.stringify(data)); } catch(e) {}
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
    const db = await _pdfDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction('pdfs', 'readonly');
      const req = tx.objectStore('pdfs').get(id);
      req.onsuccess = () => resolve(req.result?.data || null);
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
  const size = "min(30vw, 115px)";
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "8px 4px", cursor: "pointer" }}
      onClick={() => onProjectClick && onProjectClick(project)}>
      <div style={{ position: "relative", width: size, height: size }}>
        <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: `radial-gradient(circle at 35% 35%, ${color.light}33, ${color.bg}cc)`, border: `2px solid ${color.light}44`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", boxShadow: `0 4px 18px ${color.bg}66` }}>
          {project.image ? <img src={project.image} alt={project.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: "clamp(24px, 8vw, 34px)" }}>🧶</span>}
        </div>
        <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }} viewBox="0 0 110 110">
          <circle cx="55" cy="55" r="51" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4.5" />
          <circle cx="55" cy="55" r="51" fill="none" stroke={color.light} strokeWidth="4.5"
            strokeDasharray={2 * Math.PI * 51}
            strokeDashoffset={2 * Math.PI * 51 * (1 - Math.min(project.rang / project.total, 1))}
            strokeLinecap="round" transform="rotate(-90 55 55)"
            style={{ transition: "stroke-dashoffset 0.6s ease" }} />
        </svg>
        <button onClick={(e) => { e.stopPropagation(); onMenuOpen(project, e); }}
          style={{ position: "absolute", top: -4, right: -4, width: 22, height: 22, borderRadius: "50%", background: `linear-gradient(135deg, ${color.light}, ${color.bg})`, border: "2.5px solid #0D0D1A", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontStyle: "italic", fontWeight: 700, color: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.5)", zIndex: 10 }}>i</button>
      </div>
      <div style={{ textAlign: "center", width: size, maxWidth: 115 }}>
        <div style={{ color: "#F1F0EE", fontSize: "clamp(10px, 2.8vw, 12px)", fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>{project.name}</div>
        {mode === "pro" && project.client && <div style={{ color: color.light, fontSize: 10, marginTop: 1, fontFamily: "monospace" }}>{project.client}</div>}
      </div>
    </div>
  );
}

function ContextMenu({ project, position, onClose, onRename, onDelete, onChangePhoto }) {
  if (!project) return null;
  const color = KALEIDOSCOPE_COLORS[project.colorIdx % KALEIDOSCOPE_COLORS.length];
  return (
    <>
      <div onClick={e => { e.stopPropagation(); onClose(); }} style={{ position: "fixed", inset: 0, zIndex: 100 }} />
      <div style={{ position: "fixed", top: Math.min(position.y, window.innerHeight - 200), left: Math.min(position.x - 10, window.innerWidth - 200), zIndex: 101, background: "#1A1A2E", border: `1px solid ${color.light}44`, borderRadius: 16, padding: "8px 0", minWidth: 190, boxShadow: "0 8px 40px rgba(0,0,0,0.6)" }}>
        <div style={{ padding: "8px 16px 6px", borderBottom: `1px solid ${color.light}22`, marginBottom: 4 }}>
          <div style={{ color: color.light, fontSize: 11, fontFamily: "monospace", textTransform: "uppercase" }}>{project.name}</div>
        </div>
        {[
          { icon: "✏️", label: "Renommer", action: onRename },
          { icon: "📷", label: "Changer la photo", action: onChangePhoto },
          { icon: "🗑️", label: "Supprimer", action: onDelete, danger: true },
        ].map(item => (
          <button key={item.label} onClick={item.action} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 16px", background: "none", border: "none", cursor: "pointer", color: item.danger ? "#F87171" : "#E2E0DC", fontSize: 14, fontFamily: "'DM Sans', sans-serif", textAlign: "left" }}>
            <span>{item.icon}</span><span>{item.label}</span>
          </button>
        ))}
      </div>
    </>
  );
}

function RenameModal({ project, onConfirm, onClose }) {
  const [val, setVal] = useState(project?.name || "");
  if (!project) return null;
  const color = KALEIDOSCOPE_COLORS[project.colorIdx % KALEIDOSCOPE_COLORS.length];
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#1A1A2E", borderRadius: 20, padding: 24, width: "100%", maxWidth: 340 }}>
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
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#1A1A2E", borderRadius: 20, padding: 24, width: "100%", maxWidth: 340 }}>
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
            <span style={{ fontSize: 16 }}>📝</span>
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
          <button onClick={e => handleActionClick(e, () => onUpdate(rang.id, { isNote: false }))} style={{ background: "#7C3AED", border: "none", borderRadius: 6, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, cursor: "pointer" }}>↩</button>
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
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, transform: isSwipedOpen ? "translateX(-80px)" : "translateX(0)", transition: "transform 0.3s ease" }}>
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
      <div style={{ position: "absolute", top: 12, right: isSwipedOpen ? 12 : -80, display: "flex", flexDirection: "column", gap: 4, transition: "right 0.3s ease", zIndex: 10 }}>
        <button onClick={(e) => handleActionClick(e, () => onUpdate(rang.id, { isNote: true }))} style={{ background: "#D97706", border: "none", borderRadius: 6, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14, cursor: "pointer" }}>📝</button>
        <button onClick={(e) => handleActionClick(e, () => onDuplicate(rang.id))} style={{ background: "#0891B2", border: "none", borderRadius: 6, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, cursor: "pointer" }}>⧉</button>
        <button onClick={(e) => handleActionClick(e, () => onDelete(rang.id))} style={{ background: "#DC2626", border: "none", borderRadius: 6, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, cursor: "pointer" }}>✗</button>
      </div>
    </div>
  );
}

function PartieSection({ partie, onUpdate, onDelete, onDuplicate, onMoveUp, onMoveDown, isFirst, isLast, onAddRang, onUpdateRang, onDeleteRang, onDuplicateRang, onMoveRangUp, onMoveRangDown }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isEditingNom, setIsEditingNom] = useState(false);
  const [tempNom, setTempNom] = useState(partie.nom);
  const color = KALEIDOSCOPE_COLORS[partie.colorIdx % KALEIDOSCOPE_COLORS.length];
  const handleSaveNom = () => { onUpdate(partie.id, { nom: tempNom }); setIsEditingNom(false); };
  const act = (e, fn) => { e.preventDefault(); e.stopPropagation(); fn(); };

  return (
    <div style={{ background: "#1A1A2E", border: `1px solid ${color.light}22`, borderRadius: 16, padding: 16, marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: isCollapsed ? 0 : 12 }}>
        <div style={{ width: 16, height: 16, borderRadius: "50%", background: `linear-gradient(135deg, ${color.bg}, ${color.light})`, flexShrink: 0 }} />
        {isEditingNom
          ? <input value={tempNom} onChange={e => setTempNom(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSaveNom()} onBlur={handleSaveNom} autoFocus style={{ background: "none", border: "none", outline: "none", color: "#F1F0EE", fontSize: 16, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", flex: 1 }} />
          : <h3 onClick={() => setIsEditingNom(true)} style={{ color: "#F1F0EE", margin: 0, fontSize: 16, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", flex: 1, cursor: "pointer" }}>{partie.nom}</h3>
        }
        <span style={{ color: color.light, fontSize: 12, fontFamily: "monospace" }}>{partie.rangs.length} rangs</span>
        <button onClick={() => setIsCollapsed(!isCollapsed)} style={{ background: "none", border: "none", color: color.light, fontSize: 16, cursor: "pointer", padding: 4 }}>{isCollapsed ? "▼" : "▲"}</button>
        <div style={{ display: "flex", gap: 4 }}>
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
                    onUpdate={onUpdateRang} onDelete={onDeleteRang} onDuplicate={onDuplicateRang}
                    onMoveUp={onMoveRangUp} onMoveDown={onMoveRangDown}
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
            style={{ background: counter.syncWithGlobal ? "#333" : col.bg, border: "none", borderRadius: "50%", width: 32, height: 32, color: "#fff", fontSize: 16, cursor: counter.syncWithGlobal ? "not-allowed" : "pointer", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
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
          <div style={{ position: "relative", width: 95, height: 95 }}>
            <svg width="95" height="95" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="47.5" cy="47.5" r={circ_r} stroke="rgba(255,255,255,0.1)" strokeWidth="4" fill="none" />
              <circle cx="47.5" cy="47.5" r={circ_r} stroke="url(#kg)" strokeWidth="4" fill="none"
                strokeDasharray={circ_c} strokeDashoffset={circ_c * (1 - Math.max(0, currentCountIndex + 1) / totalRangs)}
                strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.5s ease" }} />
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
            <div style={{ background: `linear-gradient(90deg, ${currentPartieColor.bg}, ${currentPartieColor.light})`, width: `${(currentPartieRangIndex + 1) / currentPartieTotal * 100}%`, height: "100%", transition: "width 0.5s ease" }} />
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

  const savedIndex = Math.max(0, Math.min((project?.rang || 1) - 1, allRangs.length - 1));
  const [currentRangId, setCurrentRangId] = useState(allRangs[savedIndex]?.globalId ?? null);
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
    if (currentIndex >= allRangs.length - 1) return;
    if (isLastRangOfPartie()) {
      setShowNextPartieModal(true);
    } else {
      setCurrentRangId(allRangs[currentIndex + 1].globalId);
      if (navigator.vibrate) navigator.vibrate(15);
    }
  };
  const confirmNextPartie = () => {
    setCurrentRangId(allRangs[currentIndex + 1].globalId);
    setShowNextPartieModal(false);
    setCounters(prev => prev.map(c => ({ ...c, value: 1 })));
    if (navigator.vibrate) navigator.vibrate(20);
  };
  const prevRang = () => {
    if (currentIndex <= 0) return;
    if (isFirstRangOfPartie()) {
      setShowPrevPartieModal(true);
    } else {
      setCurrentRangId(allRangs[currentIndex - 1].globalId);
      if (navigator.vibrate) navigator.vibrate(15);
    }
  };
  const confirmPrevPartie = () => {
    setCurrentRangId(allRangs[currentIndex - 1].globalId);
    setShowPrevPartieModal(false);
    setCounters(prev => prev.map(c => ({ ...c, value: 1 })));
    if (navigator.vibrate) navigator.vibrate(20);
  };
  const goToPartie = (partieId) => { const pi = patron.parties.findIndex(x => x.id === partieId); if (pi !== -1 && patron.parties[pi].rangs.length > 0) setCurrentRangId(`${pi}-0`); };

  const addCounter = () => setCounters(prev => [...prev, { id: Date.now(), name: `Compteur ${prev.length + 1}`, value: 1, maxRepeats: 4, syncWithGlobal: false, colorIdx: Math.floor(Math.random() * KALEIDOSCOPE_COLORS.length) }]);
  const updateCounter = (id, updates) => setCounters(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  const deleteCounter = (id) => setCounters(prev => prev.filter(c => c.id !== id));

  if (!hasParties) return (
    <div style={{ background: "#0D0D1A", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", color: "#F1F0EE", maxWidth: 430, margin: "0 auto", padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 30 }}>
        <button onClick={onNavigateHub} style={{ background: "#1E1E32", border: "none", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", color: "#A78BFA", fontSize: 16, cursor: "pointer" }}>←</button>
        <h1 style={{ color: "#F1F0EE", margin: 0, fontSize: 18, fontFamily: "'Syne', sans-serif" }}>{patron.nom}</h1>
      </div>
      <div style={{ textAlign: "center", padding: "60px 20px", color: "#6B6A7A" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🧶</div>
        <div style={{ fontSize: 16, marginBottom: 8, color: "#F1F0EE" }}>Aucun patron créé</div>
        <div style={{ fontSize: 13, marginBottom: 24 }}>Crée d'abord tes parties et rangs dans l'éditeur de patron</div>
        <button onClick={() => onNavigateEditor(project)} style={{ background: "linear-gradient(135deg, #7C3AED, #EC4899)", border: "none", borderRadius: 12, padding: "12px 24px", color: "#fff", fontSize: 14, cursor: "pointer", fontWeight: 600 }}>Ouvrir l'éditeur</button>
      </div>
    </div>
  );

  const circ_r = 43.5, circ_c = 2 * Math.PI * circ_r;

  return (
    <div style={{ background: "#0D0D1A", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", maxWidth: 430, margin: "0 auto", position: "relative", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        ::-webkit-scrollbar { width: 0; }
        * { -webkit-tap-highlight-color: transparent; }
        input, textarea, select { font-size: 16px !important; }
        @keyframes gradientShift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        .kgbg { background: linear-gradient(-45deg, #0D0D1A, #1A0A2E, #0D0D1A, #1E1E32); background-size: 400% 400%; animation: gradientShift 8s ease infinite; }
        @keyframes float { 0%,100%{transform:translateY(0) rotate(0deg);opacity:0.1} 50%{transform:translateY(-20px) rotate(180deg);opacity:0.3} }
      `}</style>
      <div className="kgbg" style={{ position: "absolute", top:0, left:0, right:0, bottom:0 }} />
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} style={{ position: "absolute", top: `${20+i*15}%`, left: `${10+i*12}%`, width: 20, height: 20, borderRadius: "50%", background: `${currentPartieColor.light}22`, animation: `float ${3+i*0.5}s ease-in-out infinite`, animationDelay: `${i*0.3}s` }} />
      ))}

      {/* Header */}
      <div style={{ position: "relative", zIndex: 10, padding: "44px 20px 0", background: "rgba(13,13,26,0.95)", backdropFilter: "blur(10px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <button onClick={() => { onSaveProgress(allRangs.slice(0, currentIndex + 1).filter(r => !r.isNote).length, totalRangsForCount, elapsedTime); onNavigateHub(); }} style={{ background: "#1E1E32", border: "none", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", color: "#A78BFA", fontSize: 16, cursor: "pointer" }}>←</button>
          <div style={{ flex: 1 }}>
            <h1 style={{ color: "#F1F0EE", margin: 0, fontSize: 16, fontWeight: 700, fontFamily: "'Syne', sans-serif" }}>{patron.nom}</h1>
            <div style={{ color: "#A78BFA", fontSize: 11, fontFamily: "monospace", marginTop: 2 }}>{patron.technique}{patron.outil ? ` • ${patron.outil}` : ""}</div>
          </div>
          <div style={{ background: "linear-gradient(135deg, #1E1E32, #2A2A3E)", border: "2px solid #7C3AED44", borderRadius: 16, padding: "12px 16px", boxShadow: "0 6px 20px rgba(124,58,237,0.4)", minWidth: 140 }}>
            <div style={{ color: "#F1F0EE", fontSize: 22, fontFamily: "monospace", fontWeight: 700, textAlign: "center", marginBottom: 4 }}>{formatTime(elapsedTime)}</div>
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              <button onClick={toggleTimer} style={{ background: isTimerRunning ? "#DC2626" : "#059669", border: "none", borderRadius: 8, padding: "4px 10px", color: "#fff", fontSize: 11, cursor: "pointer", fontWeight: 600 }}>{isTimerRunning ? "PAUSE" : "PLAY"}</button>
              <button onClick={resetTimer} style={{ background: "#7C3AED", border: "none", borderRadius: 8, padding: "4px 10px", color: "#fff", fontSize: 11, cursor: "pointer", fontWeight: 600 }}>RESET</button>
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
        <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 }}>
          {patron.parties.map(p => {
            const col = KALEIDOSCOPE_COLORS[p.colorIdx % KALEIDOSCOPE_COLORS.length];
            const isActive = currentPartie?.id === p.id;
            return (
              <button key={p.id} onClick={() => goToPartie(p.id)}
                style={{ background: isActive ? `linear-gradient(135deg, ${col.bg}, ${col.light})` : "#1E1E32", border: "none", borderRadius: 14, padding: "6px 18px", color: isActive ? "#fff" : col.light, fontSize: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, cursor: "pointer", transition: "all 0.2s ease", transform: isActive ? "scale(1.05)" : "scale(1)", textTransform: "uppercase", letterSpacing: 0.5, boxShadow: isActive ? `0 4px 12px ${col.bg}44` : "none", minWidth: 75, height: 32, whiteSpace: "nowrap", flexShrink: 0 }}>
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
            <span style={{ color: "#fff", fontSize: 15, fontWeight: 700, fontFamily: "'Syne', sans-serif" }}>{currentRang?.isNote ? "Note" : `Rang ${currentCountIndex + 1}`}</span>
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
        <div style={{ display: "flex", gap: 16, alignItems: "center", justifyContent: "center" }}>
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
          <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <div style={{ background: "#1A1A2E", borderRadius: 24, padding: 28, width: "100%", maxWidth: 360, textAlign: "center", border: `1px solid ${currentPartieColor.light}33` }}>
              <div style={{ fontSize: 42, marginBottom: 12 }}>🎉</div>
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
          <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <div style={{ background: "#1A1A2E", borderRadius: 24, padding: 28, width: "100%", maxWidth: 360, textAlign: "center", border: `1px solid ${currentPartieColor.light}33` }}>
              <div style={{ fontSize: 42, marginBottom: 12 }}>↩️</div>
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
            <span style={{ fontSize: 22 }}>{loading ? "⏳" : pdfData ? "✅" : "📄"}</span>
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
            <span>{configRangs ? "✅" : "⬜"}</span>
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
              <div key={p.id} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
                <div style={{ width: 20, height: 20, borderRadius: "50%", background: `linear-gradient(135deg, ${KALEIDOSCOPE_COLORS[i % KALEIDOSCOPE_COLORS.length].bg}, ${KALEIDOSCOPE_COLORS[i % KALEIDOSCOPE_COLORS.length].light})`, flexShrink: 0 }} />
                <input value={p.nom} onChange={e => updatePartie(p.id, "nom", e.target.value)} placeholder={`Partie ${i + 1}`}
                  style={{ flex: 1, background: "#1A1A2E", border: "1px solid #0891B233", borderRadius: 8, padding: "9px 12px", color: "#F1F0EE", fontSize: 15, outline: "none" }} />
                <input value={p.rangs} onChange={e => updatePartie(p.id, "rangs", e.target.value)} placeholder="Rangs" type="number"
                  style={{ width: 70, background: "#1A1A2E", border: "1px solid #0891B233", borderRadius: 8, padding: "9px 10px", color: "#F1F0EE", fontSize: 15, outline: "none", textAlign: "center" }} />
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
            <div style={{ fontSize: 48 }}>⚠️</div>
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
          <div style={{ position: "relative", width: 64, height: 64 }}>
            <svg width="64" height="64" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="32" cy="32" r="27" stroke="rgba(255,255,255,0.08)" strokeWidth="3.5" fill="none" />
              <circle cx="32" cy="32" r="27" stroke="url(#pgc)" strokeWidth="3.5" fill="none"
                strokeDasharray={2 * Math.PI * 27}
                strokeDashoffset={2 * Math.PI * 27 * (total > 0 ? 1 - rang / total : 1)}
                strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.4s ease" }} />
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

  // Rangs
  const pdfParties = project?.pdfParties || [];
  const hasParties = pdfParties.length > 0;
  const [currentPartieIdx, setCurrentPartieIdx] = useState(0);
  const [rang, setRang] = useState(project?.rang || 0);
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
    // Bloquer si on est au maximum global
    if (total > 0 && rang >= total) return;
    const newRang = rang + 1;
    setRang(newRang);
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
    if (rang <= 0) return;
    const newRang = rang - 1;
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
  };

  const [showNextPartieModal, setShowNextPartieModal] = useState(false);
  const [showPrevPartieModal, setShowPrevPartieModal] = useState(false);
  const [showFinModal, setShowFinModal] = useState(false);

  // Sauvegarde en quittant
  const handleBack = () => {
    onSaveProgress(rang, project?.total || 0, elapsedTime);
    onNavigateHub();
  };

  // Chargement PDF
  useEffect(() => {
    if (!project?.pdfId) { setLoadError(true); setLoading(false); return; }
    loadPdf(project.pdfId).then(async (data) => {
      if (!data) { setLoadError(true); setLoading(false); return; }
      try {
        if (!window.pdfjsLib) {
          await new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
            s.onload = resolve; s.onerror = reject;
            document.head.appendChild(s);
          });
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }
        const base64 = data.includes(',') ? data.split(',')[1] : data;
        const binary = atob(base64);
        const arr = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
        const pdf = await window.pdfjsLib.getDocument({ data: arr }).promise;
        const rendered = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const dpr = window.devicePixelRatio || 2;
          const viewport = page.getViewport({ scale: dpr * 2.5 });
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width; canvas.height = viewport.height;
          canvas.style.width = (viewport.width / dpr) + 'px';
          canvas.style.height = (viewport.height / dpr) + 'px';
          await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
          rendered.push(canvas.toDataURL());
        }
        setPages(rendered); setLoading(false);
      } catch(e) { setLoadError(true); setLoading(false); }
    }).catch(() => { setLoadError(true); setLoading(false); });
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
          <button onClick={handleBack} style={{ background: "#1E1E32", border: "none", borderRadius: 10, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", color: color.light, fontSize: 15, cursor: "pointer", flexShrink: 0 }}>←</button>
          <h1 style={{ color: "#F1F0EE", margin: 0, fontSize: 15, fontWeight: 700, fontFamily: "'Syne', sans-serif", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{project?.name}</h1>
          <div style={{ background: "linear-gradient(135deg, #1E1E32, #2A2A3E)", border: "2px solid #7C3AED44", borderRadius: 14, padding: "8px 12px", display: "flex", alignItems: "center", gap: 8, flexShrink: 0, boxShadow: "0 4px 14px rgba(124,58,237,0.3)" }}>
            <span style={{ color: "#F1F0EE", fontSize: 20, fontFamily: "monospace", fontWeight: 700 }}>{formatTime(elapsedTime)}</span>
            <button onClick={toggleTimer} style={{ background: isTimerRunning ? "#DC2626" : "#059669", border: "none", borderRadius: 7, padding: "4px 8px", color: "#fff", fontSize: 11, cursor: "pointer", fontWeight: 700 }}>{isTimerRunning ? "PAUSE" : "PLAY"}</button>
            <button onClick={resetTimer} style={{ background: "#7C3AED", border: "none", borderRadius: 7, padding: "4px 8px", color: "#fff", fontSize: 11, cursor: "pointer", fontWeight: 700 }}>RESET</button>
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
            <div style={{ fontSize: 36 }}>⏳</div>
            <div style={{ fontSize: 14, color: "#A78BFA" }}>Rendu du PDF en cours...</div>
            <div style={{ fontSize: 11, color: "#6B6A7A" }}>Cela peut prendre quelques secondes</div>
          </div>
        ) : loadError ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "50vh", gap: 12 }}>
            <div style={{ fontSize: 44 }}>⚠️</div>
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
              <div style={{ fontSize: 42, marginBottom: 12 }}>🎉</div>
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
              <div style={{ fontSize: 42, marginBottom: 12 }}>↩️</div>
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
            <div style={{ fontSize: 52, marginBottom: 12 }}>🏆</div>
            <div style={{ color: color.light, fontSize: 13, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Projet terminé !</div>
            <h2 style={{ color: "#F1F0EE", fontSize: 20, fontFamily: "'Syne', sans-serif", margin: "0 0 8px" }}>{project?.name}</h2>
            <p style={{ color: "#6B6A7A", fontSize: 14, margin: "0 0 24px" }}>Félicitations, tu as complété tous les rangs ! 🎊</p>
            <button onClick={() => setShowFinModal(false)}
              style={{ width: "100%", padding: "14px", borderRadius: 14, border: "none", background: `linear-gradient(135deg, ${color.bg}, ${color.light})`, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
              Super ! 🎉
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function KaleidoHub() {
  const [currentView, setCurrentView] = useState(VIEWS.HUB);
  const [currentProject, setCurrentProject] = useState(null);
  const [database, setDatabase] = useState(() => initDatabase());
  const [mode, setMode] = useState("personal");
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [exportData, setExportData] = useState('');
  const [showExportData, setShowExportData] = useState(false);
  const [showDataImportModal, setShowDataImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [search, setSearch] = useState("");
  const [menuProject, setMenuProject] = useState(null);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const [renameProject, setRenameProject] = useState(null);
  const [deleteProject, setDeleteProject] = useState(null);
  const [showNewMenu, setShowNewMenu] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const projects = database.projects;

  const updateProject = (projectId, updates) => {
    const newDb = { ...database, projects: database.projects.map(p => p.id === projectId ? { ...p, ...updates } : p) };
    setDatabase(newDb); saveToDatabase(newDb);
  };
  const deleteProjectFromDB = (projectId) => {
    const newDb = { ...database, projects: database.projects.filter(p => p.id !== projectId) };
    setDatabase(newDb); saveToDatabase(newDb);
  };

  const filtered = projects.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  const totalRangs = projects.reduce((s, p) => s + p.rang, 0);
  const termines = projects.filter(p => p.rang >= p.total).length;

  const navigateToHub = () => { setCurrentView(VIEWS.HUB); setCurrentProject(null); };
  const navigateToPatronEditor = (project) => { setCurrentProject(project); setCurrentView(VIEWS.PATRON_EDITOR); };
  const navigateToRowCounter = (project) => { setCurrentProject(project); setCurrentView(VIEWS.ROW_COUNTER); };
  const navigateToPdfViewer = (project) => { setCurrentProject(project); setCurrentView(VIEWS.PDF_VIEWER); };

  const handleNewProject = () => setShowNewMenu(true);

  const handleCreateCustom = () => {
    const newId = database.settings.lastProjectId + 1;
    const colorIdx = Math.floor(Math.random() * KALEIDOSCOPE_COLORS.length);
    const newProject = { id: newId, name: "Nouveau projet", rang: 0, total: 20, colorIdx, image: null, projectType: "custom", type: "crochet", laine: "", outil: "", notes: "", parties: [], createdAt: new Date().toISOString(), status: "en_cours" };
    const newDb = { ...database, projects: [...database.projects, newProject], settings: { ...database.settings, lastProjectId: newId } };
    setDatabase(newDb); saveToDatabase(newDb);
    setShowNewMenu(false);
    navigateToPatronEditor(newProject);
  };

  const handleMenuOpen = (project, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPos({ x: rect.right, y: rect.bottom }); setMenuProject(project);
  };
  const handleRename = (newName) => { updateProject(renameProject.id, { name: newName }); setRenameProject(null); };
  const handleDelete = () => { deleteProjectFromDB(deleteProject.id); setDeleteProject(null); };

  // ─── VUE HUB ──────────────────────────────────────────────
  const HubView = () => (
    <div style={{ background: "#0D0D1A", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        ::-webkit-scrollbar { width: 0; }
        * { -webkit-tap-highlight-color: transparent; }
        input, textarea, select { font-size: 16px !important; }
      `}</style>
      <div style={{ padding: "52px 20px 20px", background: "linear-gradient(180deg, #1A0A2E 0%, #0D0D1A 100%)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 28 }}>🧶</span>
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 22, background: "linear-gradient(135deg, #A78BFA, #F472B6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>KaleidoHub</span>
          </div>
          <button onClick={() => setShowSettingsModal(true)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22 }}>⚙️</button>
        </div>
        <div style={{ display: "flex", background: "#1E1E32", borderRadius: 14, padding: 4, marginBottom: 16 }}>
          {["personal", "pro"].map(m => (
            <button key={m} onClick={() => setMode(m)} style={{ flex: 1, padding: "9px 0", borderRadius: 11, border: "none", background: mode === m ? "linear-gradient(135deg, #7C3AED, #DB2777)" : "none", color: mode === m ? "#fff" : "#6B6A7A", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "all 0.2s ease" }}>
              {m === "personal" ? "🧵 Personnel" : "💼 Professionnel"}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {[
            { label: "Projets", value: projects.length, icon: "📋" },
            { label: "Rangs", value: totalRangs > 999 ? `${(totalRangs/1000).toFixed(1)}k` : totalRangs, icon: "📊" },
            { label: "Terminés", value: termines, icon: "✅" },
          ].map(stat => (
            <div key={stat.label} style={{ flex: 1, background: "#1E1E3288", borderRadius: 12, padding: "10px 8px", textAlign: "center" }}>
              <div style={{ fontSize: 16 }}>{stat.icon}</div>
              <div style={{ color: "#F1F0EE", fontWeight: 700, fontSize: 15, marginTop: 2 }}>{stat.value}</div>
              <div style={{ color: "#6B6A7A", fontSize: 10, marginTop: 1 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: "14px 20px 6px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#1E1E32", borderRadius: 12, padding: "10px 14px" }}>
          <span style={{ color: "#6B6A7A" }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un projet..."
            style={{ background: "none", border: "none", outline: "none", color: "#F1F0EE", flex: 1, fontFamily: "'DM Sans', sans-serif" }} />
        </div>
      </div>
      <div style={{ padding: "12px 6px 100px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", rowGap: 4, columnGap: 0 }}>
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
        onChangePhoto={() => { alert("📷 Sélecteur de photo"); setMenuProject(null); }} />
      <RenameModal project={renameProject} onConfirm={handleRename} onClose={() => setRenameProject(null)} />
      <DeleteModal project={deleteProject} onConfirm={handleDelete} onClose={() => setDeleteProject(null)} />

      {/* Modale import */}
      {showDataImportModal && (
        <div onClick={() => setShowDataImportModal(false)} style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#1A1A2E", borderRadius: 20, padding: 20, width: "100%", maxWidth: 390, maxHeight: "85vh", display: "flex", flexDirection: "column" }}>
            <h3 style={{ color: "#F1F0EE", fontFamily: "'Syne', sans-serif", margin: "0 0 6px", fontSize: 16 }}>📥 Importer tes projets</h3>
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
                    alert("✅ Projets restaurés !" + (pdfCount > 0 ? `\n\n📄 ${pdfCount} projet(s) PDF — tu devras réimporter les fichiers PDF manuellement depuis ton téléphone.` : ""));
                  } else {
                    alert("❌ Texte invalide — assure-toi de coller une sauvegarde Kaleido.");
                  }
                } catch { alert("❌ Erreur — le texte ne semble pas valide."); }
              }} style={{ flex: 1, padding: "12px", borderRadius: 12, background: "linear-gradient(135deg, #059669, #34D399)", border: "none", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>✅ Restaurer</button>
              <button onClick={() => setShowDataImportModal(false)}
                style={{ padding: "12px 20px", borderRadius: 12, background: "#333", border: "none", color: "#999", fontSize: 14, cursor: "pointer" }}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      {/* Modale données export */}
      {showExportData && (
        <div onClick={() => setShowExportData(false)} style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#1A1A2E", borderRadius: 20, padding: 20, width: "100%", maxWidth: 390, maxHeight: "85vh", display: "flex", flexDirection: "column" }}>
            <h3 style={{ color: "#F1F0EE", fontFamily: "'Syne', sans-serif", margin: "0 0 6px", fontSize: 16 }}>📤 Sauvegarde de tes projets</h3>
            <p style={{ color: "#6B6A7A", fontSize: 12, margin: "0 0 4px" }}>Ce texte contient <span style={{ color: "#A78BFA", fontWeight: 700 }}>tous tes projets, rangs et données</span>.</p>
            <p style={{ color: "#6B6A7A", fontSize: 12, margin: "0 0 12px" }}>1. Appuie sur <strong style={{ color: "#F1F0EE" }}>Copier</strong> → 2. Ouvre <strong style={{ color: "#F1F0EE" }}>Notes</strong> → 3. Colle et sauvegarde. Pour restaurer, copie ce texte et utilise <strong style={{ color: "#F1F0EE" }}>Importer</strong> dans ⚙️.</p>
            <textarea readOnly value={exportData} onClick={e => { e.target.select(); }}
              style={{ flex: 1, minHeight: 160, background: "#0D0D1A", border: "1px solid #7C3AED44", borderRadius: 10, padding: 12, color: "#A78BFA", fontSize: 11, fontFamily: "monospace", outline: "none", resize: "none" }} />
            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              <button onClick={() => {
                if (navigator.clipboard?.writeText) {
                  navigator.clipboard.writeText(exportData).then(() => alert("✅ Copié dans le presse-papier !")).catch(() => alert("Sélectionne le texte manuellement et copie-le."));
                } else { alert("Sélectionne le texte dans le champ et copie-le manuellement."); }
              }} style={{ flex: 1, padding: "12px", borderRadius: 12, background: "linear-gradient(135deg, #7C3AED, #A78BFA)", border: "none", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>📋 Copier</button>
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
            <h2 style={{ color: "#F1F0EE", fontFamily: "'Syne', sans-serif", fontSize: 18, margin: "0 0 20px", textAlign: "center" }}>⚙️ Paramètres</h2>

            {/* Export — télécharge un fichier .json */}
            <button onClick={async () => {
              try {
                const pdfProjects = database.projects.filter(p => p.projectType === 'pdf' && p.pdfId);
                const pdfs = {};
                for (const p of pdfProjects) {
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
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg, #7C3AED, #A78BFA)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>📤</div>
              <div style={{ textAlign: "left" }}>
                <div style={{ color: "#F1F0EE", fontSize: 16, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", marginBottom: 2 }}>Exporter mes données</div>
                <div style={{ color: "#6B6A7A", fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}>Télécharge un fichier <strong style={{ color: "#A78BFA" }}>.json</strong> avec tous tes projets et PDFs</div>
              </div>
            </button>

            {/* Import — charge depuis un fichier .json */}
            <label style={{ width: "100%", padding: "16px", borderRadius: 14, background: "linear-gradient(135deg, #05966922, #34D39922)", border: "1px solid #05966944", cursor: "pointer", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg, #059669, #34D399)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>📥</div>
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
              <button onClick={handleCreateCustom} style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 20px", borderRadius: 16, background: "linear-gradient(135deg, #7C3AED22, #DB277722)", border: "1px solid #7C3AED44", cursor: "pointer", textAlign: "left" }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg, #7C3AED, #DB2777)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>✏️</div>
                <div>
                  <div style={{ color: "#F1F0EE", fontSize: 16, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", marginBottom: 4 }}>Créer un patron</div>
                  <div style={{ color: "#6B6A7A", fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>Saisis tes parties et rangs manuellement</div>
                </div>
              </button>
              <button onClick={() => { setShowNewMenu(false); setShowImportModal(true); }} style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 20px", borderRadius: 16, background: "linear-gradient(135deg, #0891B222, #22D3EE22)", border: "1px solid #0891B244", cursor: "pointer", textAlign: "left" }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg, #0891B2, #22D3EE)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>📄</div>
                <div>
                  <div style={{ color: "#F1F0EE", fontSize: 16, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", marginBottom: 4 }}>Importer un patron PDF</div>
                  <div style={{ color: "#6B6A7A", fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>Télécharge un PDF et donne un nom</div>
                </div>
              </button>
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
        const newDb = { ...database, projects: [...database.projects, newProject], settings: { ...database.settings, lastProjectId: newId } };
        setDatabase(newDb); saveToDatabase(newDb);
        setShowImportModal(false);
      }} />}
    </div>
  );

  // ─── VUE PATRON EDITOR ────────────────────────────────────
  const PatronEditorView = () => {
    const [patron, setPatron] = useState(() => ({
      nom: currentProject?.name || "Nouveau projet",
      laine: currentProject?.laine || "",
      technique: currentProject?.type || "crochet",
      outil: currentProject?.outil || "",
      notes: currentProject?.notes || "",
      parties: currentProject?.parties || [],
    }));
    const [isEditingNom, setIsEditingNom] = useState(false);
    const [tempNom, setTempNom] = useState(patron.nom);
    const totalRangsPatron = patron.parties.reduce((s, p) => s + p.rangs.length, 0);

    const updatePatronInfo = (field, value) => setPatron(prev => ({ ...prev, [field]: value }));
    const handleSaveNom = () => { setPatron(prev => ({ ...prev, nom: tempNom })); setIsEditingNom(false); };
    const handleSave = () => {
      updateProject(currentProject.id, { name: patron.nom, laine: patron.laine, type: patron.technique, outil: patron.outil, notes: patron.notes, parties: patron.parties, total: Math.max(totalRangsPatron, currentProject.total || 1) });
      navigateToHub();
    };

    const renumber = (parties) => parties.map(p => ({ ...p, rangs: p.rangs.map((r, i) => ({ ...r, id: i + 1 })) }));
    const addPartie = () => setPatron(prev => ({ ...prev, parties: [...prev.parties, { id: Date.now(), nom: "Nouvelle partie", colorIdx: Math.floor(Math.random() * KALEIDOSCOPE_COLORS.length), rangs: [] }] }));
    const updatePartie = (id, updates) => setPatron(prev => ({ ...prev, parties: prev.parties.map(p => p.id === id ? { ...p, ...updates } : p) }));
    const deletePartie = (id) => { if (confirm("Supprimer cette partie?")) setPatron(prev => ({ ...prev, parties: prev.parties.filter(p => p.id !== id) })); };
    const duplicatePartie = (id) => { const p = patron.parties.find(x => x.id === id); if (p) setPatron(prev => ({ ...prev, parties: [...prev.parties, { ...p, id: Date.now(), nom: `${p.nom} (copie)`, rangs: p.rangs.map((r, i) => ({ ...r, id: i + 1 })) }] })); };
    const movePartie = (id, dir) => setPatron(prev => { const arr = [...prev.parties], i = arr.findIndex(p => p.id === id), ni = dir === 'up' ? i - 1 : i + 1; if (i === -1 || ni < 0 || ni >= arr.length) return prev; [arr[i], arr[ni]] = [arr[ni], arr[i]]; return { ...prev, parties: arr }; });
    const addRang = (partieId) => { const p = patron.parties.find(x => x.id === partieId); if (p) updatePartie(partieId, { rangs: [...p.rangs, { id: p.rangs.length + 1, instruction: "Nouvelle instruction", mailles: null }] }); };
    const updateRang = (rangId, updates) => setPatron(prev => ({ ...prev, parties: prev.parties.map(p => ({ ...p, rangs: p.rangs.map(r => r.id === rangId ? { ...r, ...updates } : r) })) }));
    const deleteRang = (rangId) => { if (confirm("Supprimer ce rang?")) setPatron(prev => { const np = { ...prev, parties: prev.parties.map(p => ({ ...p, rangs: p.rangs.filter(r => r.id !== rangId) })) }; return { ...np, parties: renumber(np.parties) }; }); };
    const duplicateRang = (rangId) => setPatron(prev => { const np = { ...prev, parties: prev.parties.map(p => ({ ...p, rangs: p.rangs.reduce((acc, r) => { acc.push(r); if (r.id === rangId) acc.push({ ...r, id: r.id + 0.5, instruction: `${r.instruction} (copie)` }); return acc; }, []) })) }; return { ...np, parties: renumber(np.parties) }; });
    const moveRang = (rangId, dir) => setPatron(prev => { const np = { ...prev, parties: prev.parties.map(p => { const arr = [...p.rangs], i = arr.findIndex(r => r.id === rangId), ni = dir === 'up' ? i - 1 : i + 1; if (i === -1 || ni < 0 || ni >= arr.length) return p; [arr[i], arr[ni]] = [arr[ni], arr[i]]; return { ...p, rangs: arr }; }) }; return { ...np, parties: renumber(np.parties) }; });

    return (
      <div style={{ background: "#0D0D1A", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", maxWidth: 430, margin: "0 auto" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap'); ::-webkit-scrollbar{width:0} *{-webkit-tap-highlight-color:transparent} input,textarea,select{font-size:16px!important}`}</style>
        <div style={{ background: "linear-gradient(180deg, #1A0A2E 0%, #0D0D1A 100%)", padding: "44px 20px 20px", position: "sticky", top: 0, zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <button onClick={navigateToHub} style={{ background: "#1E1E32", border: "none", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", color: "#A78BFA", fontSize: 16, cursor: "pointer" }}>←</button>
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
              onDuplicateRang={duplicateRang} onMoveRangUp={id => moveRang(id, 'up')} onMoveRangDown={id => moveRang(id, 'down')} />
          ))}
          <button onClick={addPartie} style={{ width: "100%", padding: "16px", borderRadius: 16, background: "none", border: "2px dashed #7C3AED44", color: "#7C3AED", fontSize: 16, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            + Ajouter une partie
          </button>
        </div>
      </div>
    );
  };

  // ─── RENDU CONDITIONNEL ───────────────────────────────────
  if (currentView === VIEWS.PATRON_EDITOR) return <PatronEditorView />;
  if (currentView === VIEWS.ROW_COUNTER) return (
    <CompteurRangsView project={currentProject} onNavigateHub={navigateToHub} onNavigateEditor={navigateToPatronEditor} onSaveProgress={(rang, total, elapsed) => updateProject(currentProject.id, { rang, total, elapsedTime: elapsed })} />
  );
  if (currentView === VIEWS.PDF_VIEWER) return (
    <PdfViewerView project={currentProject} onNavigateHub={navigateToHub} onSaveProgress={(rang, total, elapsed) => updateProject(currentProject.id, { rang, total, elapsedTime: elapsed })} />
  );
  return <HubView />;
}
