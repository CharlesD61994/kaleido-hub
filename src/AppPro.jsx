import React, { useMemo, useState, useEffect, useRef } from "react";

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

function Icon({ name, size = 20, stroke = 1.9, color = "currentColor", style = {} }) {
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
    case "camera":
      return (
        <svg {...common}>
          <path d="M4.5 8.5h3l1.2-2h6.6l1.2 2h3a1.8 1.8 0 0 1 1.8 1.8v7.2a1.8 1.8 0 0 1-1.8 1.8h-15a1.8 1.8 0 0 1-1.8-1.8v-7.2A1.8 1.8 0 0 1 4.5 8.5Z" />
          <circle cx="12" cy="13" r="3.2" />
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
    case "search":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="6.5" />
          <path d="m16 16 4 4" />
        </svg>
      );
    default:
      return null;
  }
}

function ContextMenu({ project, position, onClose, onRename, onDelete, onChangePhoto, onChangeColor }) {
  if (!project) return null;
  const color = KALEIDOSCOPE_COLORS[project.colorIdx % KALEIDOSCOPE_COLORS.length];
  const [showColors, setShowColors] = useState(false);

  return (
    <>
      <div onClick={(e) => { e.stopPropagation(); onClose(); }} style={{ position: "fixed", inset: 0, zIndex: 100 }} />
      <div
        style={{
          position: "fixed",
          top: Math.min(position.y, window.innerHeight - 260),
          left: Math.min(position.x - 10, window.innerWidth - 200),
          zIndex: 101,
          background: "#1A1A2E",
          border: `1px solid ${color.light}44`,
          borderRadius: 16,
          padding: "8px 0",
          minWidth: 200,
          boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
        }}
      >
        <div style={{ padding: "8px 16px 6px", borderBottom: `1px solid ${color.light}22`, marginBottom: 4 }}>
          <div style={{ color: color.light, fontSize: 11, fontFamily: "monospace", textTransform: "uppercase" }}>
            {project.name}
          </div>
        </div>

        {[
          { icon: <Icon name="edit" size={21} color="#E2E0DC" />, label: "Renommer", action: onRename },
          { icon: <Icon name="image" size={21} color="#E2E0DC" />, label: "Changer la photo", action: onChangePhoto },
        ].map((item) => (
          <button
            key={item.label}
            onClick={item.action}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              width: "100%",
              padding: "12px 16px",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#E2E0DC",
              fontSize: 14,
              fontFamily: "'DM Sans', sans-serif",
              textAlign: "left",
            }}
          >
            <span>{item.icon}</span><span>{item.label}</span>
          </button>
        ))}

        <button
          onClick={() => setShowColors((s) => !s)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            width: "100%",
            padding: "12px 16px",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#E2E0DC",
            fontSize: 14,
            fontFamily: "'DM Sans', sans-serif",
            textAlign: "left",
          }}
        >
          <div style={{ width: 18, height: 18, borderRadius: "50%", background: `linear-gradient(135deg, ${color.bg}, ${color.light})`, flexShrink: 0 }} />
          <span>Couleur de la bulle</span>
        </button>

        {showColors && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: "8px 16px 10px" }}>
            {KALEIDOSCOPE_COLORS.map((c, i) => (
              <div
                key={i}
                onClick={() => { onChangeColor(i); onClose(); }}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${c.bg}, ${c.light})`,
                  cursor: "pointer",
                  border: project.colorIdx === i ? "3px solid #fff" : "2px solid transparent",
                  boxSizing: "border-box",
                }}
              />
            ))}
          </div>
        )}

        <button
          onClick={onDelete}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            width: "100%",
            padding: "12px 16px",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#F87171",
            fontSize: 14,
            fontFamily: "'DM Sans', sans-serif",
            textAlign: "left",
          }}
        >
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
      <div style={{ position: "fixed", top: cardTop ?? "18vh", left: "50%", transform: "translateX(-50%)", width: "calc(100% - 40px)", maxWidth: 340 }}>
        <div
          ref={cardRef}
          onClick={(e) => e.stopPropagation()}
          data-kaleido-modal-card="true"
          style={{ background: "#1A1A2E", borderRadius: 18, padding: 24, width: "100%", boxSizing: "border-box" }}
        >
          <h3 style={{ color: "#F1F0EE", fontFamily: "'DM Sans', sans-serif", margin: "0 0 16px" }}>Renommer le projet</h3>
          <input
            ref={inputRef}
            autoFocus
            value={val}
            onFocus={(e) => e.target.select()}
            onChange={(e) => setVal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onConfirm(val)}
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 10,
              border: `1px solid ${color.light}44`,
              background: "#0D0D1A",
              color: "#F1F0EE",
              fontSize: 16,
              outline: "none",
              boxSizing: "border-box",
            }}
          />
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
      <div onClick={(e) => e.stopPropagation()} data-kaleido-modal-card="true" style={{ background: "#1A1A2E", borderRadius: 18, padding: 24, width: "100%", maxWidth: 340 }}>
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

function PhotoCropModal({ onClose, onConfirm, existingImage }) {
  const [imgSrc, setImgSrc] = useState(existingImage?.src || existingImage?.preview || existingImage || null);
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

  const onTouchEnd = () => {
    setIsDragging(false);
    lastTouch.current = null;
  };

  const previewBaseScale = naturalSize.width && naturalSize.height
    ? Math.max(CROP_SIZE / naturalSize.width, CROP_SIZE / naturalSize.height)
    : 1;

  const handleConfirm = () => {
    if (!imgSrc) return;
    const img = new Image();
    img.onload = () => {
      const OUT = 220;
      const canvas = document.createElement("canvas");
      canvas.width = OUT;
      canvas.height = OUT;
      const ctx = canvas.getContext("2d");
      ctx.beginPath();
      ctx.arc(OUT / 2, OUT / 2, OUT / 2, 0, Math.PI * 2);
      ctx.clip();

      const baseScale = Math.max(CROP_SIZE / img.width, CROP_SIZE / img.height);
      const finalScale = baseScale * scale;
      const w = img.width * finalScale * (OUT / CROP_SIZE);
      const h = img.height * finalScale * (OUT / CROP_SIZE);

      ctx.drawImage(
        img,
        (OUT - w) / 2 + pos.x * (OUT / CROP_SIZE),
        (OUT - h) / 2 + pos.y * (OUT / CROP_SIZE),
        w,
        h
      );

      const compactPreview = canvas.toDataURL("image/jpeg", 0.82);
      onConfirm({
        preview: compactPreview,
      });
    };
    img.src = imgSrc;
  };

  return (
    <div data-kaleido-modal-backdrop="true" style={{ position: "fixed", inset: 0, zIndex: 300, background: "#000", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif" }}>
      {!imgSrc ? (
        <div style={{ textAlign: "center", padding: 32 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: "linear-gradient(135deg, #DB2777, #F472B6)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12), 0 10px 24px rgba(0,0,0,0.22)" }}>
              <Icon name="camera" size={28} color="#fff" />
            </div>
          </div>
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
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 0 }} />
          <div style={{ position: "relative", zIndex: 2, marginTop: 60, marginBottom: 20 }}>
            <p style={{ color: "#fff", fontSize: 14, margin: 0, textAlign: "center" }}>Déplace et zoome pour recadrer</p>
          </div>

          <div
            style={{ position: "relative", zIndex: 2, width: CROP_SIZE, height: CROP_SIZE, borderRadius: "50%", overflow: "hidden", border: "3px solid #A78BFA", cursor: "grab", touchAction: "none", flexShrink: 0 }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <img
              src={imgSrc}
              alt="crop"
              onLoad={(e) => {
                const { naturalWidth, naturalHeight } = e.currentTarget;
                if (naturalWidth && naturalHeight && (naturalWidth !== naturalSize.width || naturalHeight !== naturalSize.height)) {
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
                pointerEvents: "none",
              }}
              draggable={false}
            />
          </div>

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

function ProBubble({ project, onOpen, onMenuOpen }) {
  const color = KALEIDOSCOPE_COLORS[(project?.colorIdx || 0) % KALEIDOSCOPE_COLORS.length];
  const progress = computeProgress(project);
  const size = "clamp(94px, 27vw, 108px)";

  const handleOpen = () => {
    if (typeof onOpen === "function") onOpen(project);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "10px 4px 14px" }}>
      <div
        style={{
          position: "relative",
          width: size,
          height: size,
          overflow: "visible",
          isolation: "isolate",
        }}
      >
        <button
          onClick={handleOpen}
          style={{
            position: "absolute",
            inset: 0,
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
              boxShadow: `0 2px 21px rgba(0,0,0,0.20), 0 0 0 1px ${color.light}22, inset 0 1px 2px rgba(255,255,255,0.08)`,
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

          <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 2 }} viewBox="0 0 110 110">
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
        </button>

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
      </div>

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
        <div style={{ color: "#F1F0EE", fontSize: "clamp(10px, 2.8vw, 12px)", fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>
          {project?.name || "Projet sans nom"}
        </div>

        {project?.client ? (
          <div style={{ color: color.light, fontSize: 10, marginTop: 1, fontFamily: "monospace" }}>
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
  onRenameProProject,
  onDeleteProProject,
  onChangeProProjectPhoto,
  onChangeProProjectColor,
}) {
  const [menuProject, setMenuProject] = useState(null);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const [renameProject, setRenameProject] = useState(null);
  const [deleteProject, setDeleteProject] = useState(null);
  const [photoTarget, setPhotoTarget] = useState(null);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("Tous");

  const projects = [...(projectsPro || [])]
    .filter((p) => p && p.id != null)
    .sort((a, b) => a.id - b.id);

  const projectCountLabel = useMemo(() => {
    return `${projects.length} projet${projects.length > 1 ? "s" : ""}`;
  }, [projects.length]);

  const totalRangs = useMemo(() => {
    return projects.reduce((sum, project) => sum + (Number(project?.rang) || 0), 0);
  }, [projects]);

  const termines = useMemo(() => {
    return projects.filter((project) => {
      const total = Number(project?.total) || 0;
      const rang = Number(project?.rang) || 0;
      return total > 0 && rang >= total;
    }).length;
  }, [projects]);

  const filteredProjects = useMemo(() => {
    const term = search.trim().toLowerCase();
    return projects.filter((project) => {
      const matchesSearch =
        !term ||
        (project?.name || "").toLowerCase().includes(term) ||
        (project?.client || "").toLowerCase().includes(term);

      if (!matchesSearch) return false;

      switch (activeFilter) {
        case "En cours": {
          const total = Number(project?.total) || 0;
          const rang = Number(project?.rang) || 0;
          return total <= 0 || rang < total;
        }
        case "Terminés": {
          const total = Number(project?.total) || 0;
          const rang = Number(project?.rang) || 0;
          return total > 0 && rang >= total;
        }
        case "PDF":
          return project?.projectType === "pdf";
        case "Crochet":
          return (project?.type || "").toLowerCase() === "crochet";
        case "Tricot":
          return (project?.type || "").toLowerCase() === "tricot";
        default:
          return true;
      }
    });
  }, [projects, search, activeFilter]);

  const handleMenuOpen = (project, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPos({ x: rect.right, y: rect.bottom });
    setMenuProject(project);
  };

  const handleRename = (newName) => {
    if (renameProject && typeof onRenameProProject === "function") {
      onRenameProProject(renameProject.id, newName);
    }
    setRenameProject(null);
  };

  const handleDelete = () => {
    if (deleteProject && typeof onDeleteProProject === "function") {
      onDeleteProProject(deleteProject.id);
    }
    setDeleteProject(null);
  };

  return (
    <>
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        {[
          { label: "PROJETS", value: projects.length, icon: <Icon name="projects" size={28} stroke={2.2} color="#A78BFA" />, border: "#7C3AED", glow: "#7C3AED" },
          { label: "RANGS", value: totalRangs > 999 ? `${(totalRangs / 1000).toFixed(1)}k` : totalRangs, icon: <Icon name="chart" size={28} stroke={2.2} color="#22D3EE" />, border: "#0891B2", glow: "#0891B2" },
          { label: "TERMINÉS", value: termines, icon: <Icon name="checkBadge" size={28} stroke={2.2} color="#34D399" />, border: "#059669", glow: "#059669" },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              flex: 1,
              background: "#111128",
              borderRadius: 14,
              padding: "12px 8px",
              textAlign: "center",
              border: `1px solid ${stat.border}88`,
              boxShadow: `0 0 14px ${stat.glow}44, inset 0 0 12px ${stat.glow}11`,
            }}
          >
            <div style={{ height: 28, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 4 }}>
              {stat.icon}
            </div>
            <div style={{ color: "#F1F0EE", fontWeight: 700, fontSize: 20 }}>{stat.value}</div>
            <div style={{ color: "#6B6A7A", fontSize: 10, marginTop: 2, fontFamily: "monospace", letterSpacing: 0.5 }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "#1A1A2E",
          borderRadius: 14,
          padding: "12px 14px",
          marginBottom: 8,
          border: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        <span style={{ color: "#6B6A7A", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="search" size={16} color="#6B6A7A" />
        </span>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un projet..."
          style={{
            background: "none",
            border: "none",
            outline: "none",
            color: "#F1F0EE",
            flex: 1,
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 15,
          }}
        />
      </div>

      <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2 }}>
        {["Tous", "En cours", "Terminés", "PDF", "Crochet", "Tricot"].map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            style={{
              padding: "5px 12px",
              borderRadius: 9999,
              border: `1px solid ${activeFilter === f ? "#A78BFA" : "#333"}`,
              background: activeFilter === f ? "#7C3AED33" : "none",
              color: activeFilter === f ? "#A78BFA" : "#6B6A7A",
              fontSize: 11,
              cursor: "pointer",
              whiteSpace: "nowrap",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      <div style={{ padding: "18px 16px 116px" }}>
        {filteredProjects.length === 0 ? (
          <div style={{ textAlign: "center", color: "#6B6A7A", padding: "40px 0", fontSize: 14 }}>
            Aucun projet trouvé
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 112px)",
              rowGap: 16,
              columnGap: 14,
              justifyContent: "center",
              justifyItems: "center",
              alignItems: "start",
              width: "100%",
            }}
          >
            {filteredProjects.map((project) => (
              <div key={project.id || project.name}>
                <ProBubble project={project} onOpen={onProjectOpen} onMenuOpen={handleMenuOpen} />
              </div>
            ))}
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

      <ContextMenu
        project={menuProject}
        position={menuPos}
        onClose={() => setMenuProject(null)}
        onRename={() => { setRenameProject(menuProject); setMenuProject(null); }}
        onDelete={() => { setDeleteProject(menuProject); setMenuProject(null); }}
        onChangePhoto={() => { setPhotoTarget(menuProject); setMenuProject(null); }}
        onChangeColor={(idx) => {
          if (menuProject && typeof onChangeProProjectColor === "function") {
            onChangeProProjectColor(menuProject.id, idx);
          }
        }}
      />

      <RenameModal project={renameProject} onConfirm={handleRename} onClose={() => setRenameProject(null)} />
      <DeleteModal project={deleteProject} onConfirm={handleDelete} onClose={() => setDeleteProject(null)} />

      {photoTarget && (
        <PhotoCropModal
          existingImage={projects.find((p) => p.id === photoTarget.id)?.image}
          onClose={() => setPhotoTarget(null)}
          onConfirm={(imgData) => {
            if (typeof onChangeProProjectPhoto === "function") {
              onChangeProProjectPhoto(photoTarget.id, imgData);
            }
            setPhotoTarget(null);
          }}
        />
      )}
    </>
  );
}
