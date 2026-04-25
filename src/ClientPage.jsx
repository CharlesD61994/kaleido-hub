import React from "react";
import { computeProgress } from "./services/progressStore";

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

function InfoRow({ label, value }) {
  return (
    <div style={{
      padding: "12px 0",
      borderBottom: "1px solid rgba(255,255,255,0.06)"
    }}>
      <div style={{
        color: "#6B6A7A",
        fontSize: 11,
        fontFamily: "monospace",
        textTransform: "uppercase",
        letterSpacing: 0.8,
        marginBottom: 5
      }}>
        {label}
      </div>
      <div style={{
        color: value ? "#F1F0EE" : "#77758A",
        fontSize: 15,
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 600,
        overflowWrap: "anywhere"
      }}>
        {value || "Non renseigné"}
      </div>
    </div>
  );
}

function SectionCard({ title, subtitle, right, children }) {
  return (
    <section style={{
      background: "linear-gradient(135deg, rgba(30,30,50,0.96), rgba(20,20,36,0.94))",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 22,
      padding: 18,
      marginBottom: 14,
      boxShadow: "0 18px 52px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.055)",
      backdropFilter: "blur(14px)"
    }}>
      <div style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 12,
        marginBottom: children ? 12 : 0
      }}>
        <div style={{ minWidth: 0 }}>
          <div style={{
            color: "#F1F0EE",
            fontSize: 16,
            fontWeight: 800,
            fontFamily: "'DM Sans', sans-serif",
            lineHeight: 1.15
          }}>
            {title}
          </div>
          {subtitle && (
            <div style={{
              color: "#77758A",
              fontSize: 12,
              marginTop: 3,
              lineHeight: 1.35
            }}>
              {subtitle}
            </div>
          )}
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

export default function ClientPage({ project, onBack, onEditClient }) {
  const progress = computeProgress(project);
  const color = KALEIDOSCOPE_COLORS[(project?.colorIdx || 0) % KALEIDOSCOPE_COLORS.length];
  const projectTypeLabel = project?.projectType === "pdf" ? "Patron PDF" : "Patron custom";
  const statusLabel = project?.status === "termine" ? "Terminé" : "En cours";
  const clientInitial = (project?.client || "?").trim().charAt(0).toUpperCase() || "?";

  return (
    <div style={{
      background: "#0D0D1A",
      minHeight: "100vh",
      fontFamily: "'DM Sans', sans-serif",
      maxWidth: 430,
      margin: "0 auto",
      color: "#F1F0EE",
      position: "relative",
      overflow: "hidden"
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Syne:wght@700;800&display=swap'); * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; } input, textarea, select { font-size: 16px !important; }`}</style>

      <div style={{
        position: "absolute",
        inset: 0,
        background: `radial-gradient(circle at 18% 0%, ${color.bg}40, transparent 34%), radial-gradient(circle at 92% 8%, rgba(236,72,153,0.18), transparent 32%), radial-gradient(circle at 50% 100%, rgba(6,182,212,0.10), transparent 36%), #0D0D1A`
      }} />

      <div style={{ position: "relative", zIndex: 2, padding: "44px 20px 28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
          <button
            data-kaleido-back-button="true"
            onClick={onBack}
            style={{
              background: "#1E1E32",
              border: "none",
              borderRadius: 10,
              width: 36,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#A78BFA",
              fontSize: 16,
              cursor: "pointer",
              flexShrink: 0,
              boxShadow: "0 8px 22px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.06)"
            }}
            aria-label="Retour au projet"
          >
            ←
          </button>

          <div style={{ minWidth: 0, flex: 1 }}>
            <h1 style={{
              color: "#F1F0EE",
              margin: 0,
              fontSize: 24,
              lineHeight: 1.05,
              fontWeight: 800,
              fontFamily: "'Syne', sans-serif",
              letterSpacing: "-0.025em"
            }}>
              Fiche client
            </h1>
            <div style={{
              color: color.light,
              fontSize: 11,
              fontFamily: "monospace",
              marginTop: 4,
              letterSpacing: 0.5,
              textTransform: "uppercase",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap"
            }}>
              {project?.name || "Projet"}
            </div>
          </div>
        </div>

        <section style={{
          background: `linear-gradient(135deg, ${color.bg}30, rgba(26,26,46,0.98) 46%, rgba(30,30,50,0.96))`,
          border: `1px solid ${color.light}33`,
          borderRadius: 26,
          padding: 18,
          marginBottom: 14,
          boxShadow: `0 22px 70px rgba(0,0,0,0.36), 0 0 34px ${color.bg}18, inset 0 1px 0 rgba(255,255,255,0.07)`,
          overflow: "hidden",
          position: "relative"
        }}>
          <div style={{
            position: "absolute",
            right: -34,
            top: -36,
            width: 118,
            height: 118,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${color.light}2E, transparent 68%)`,
            pointerEvents: "none"
          }} />

          <div style={{ display: "flex", alignItems: "center", gap: 14, position: "relative", zIndex: 1 }}>
            <div style={{
              width: 58,
              height: 58,
              borderRadius: 19,
              background: `linear-gradient(135deg, ${color.bg}, ${color.light})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 24,
              fontWeight: 800,
              fontFamily: "'Syne', sans-serif",
              boxShadow: `0 14px 36px ${color.bg}66`,
              flexShrink: 0
            }}>
              {clientInitial}
            </div>

            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{
                color: "#F1F0EE",
                fontSize: 21,
                fontWeight: 800,
                fontFamily: "'Syne', sans-serif",
                lineHeight: 1.06,
                overflowWrap: "anywhere"
              }}>
                {project?.client || "Client sans nom"}
              </div>
              <div style={{
                color: "#A8A6B8",
                fontSize: 13,
                marginTop: 5,
                overflowWrap: "anywhere"
              }}>
                {project?.email || "Aucun courriel"}
              </div>
            </div>

            <button
              onClick={() => onEditClient(project)}
              style={{
                border: `1px solid ${color.light}2E`,
                borderRadius: 13,
                background: "rgba(255,255,255,0.07)",
                color: "#F1F0EE",
                padding: "10px 13px",
                fontSize: 13,
                fontWeight: 800,
                cursor: "pointer",
                flexShrink: 0,
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)"
              }}
            >
              Modifier
            </button>
          </div>
        </section>

        <SectionCard
          title="Informations client"
          subtitle="Données utilisées pour le suivi du projet et le futur espace client."
        >
          <InfoRow label="Nom" value={project?.client} />
          <InfoRow label="Courriel" value={project?.email} />
          <InfoRow label="Projet associé" value={project?.name} />
        </SectionCard>

        <SectionCard
          title="Suivi du projet"
          subtitle={`${projectTypeLabel} • ${statusLabel}`}
          right={
            <div style={{
              color: color.light,
              fontSize: 15,
              fontWeight: 800,
              fontFamily: "monospace",
              background: `${color.bg}22`,
              border: `1px solid ${color.light}22`,
              borderRadius: 999,
              padding: "7px 10px",
              flexShrink: 0
            }}>
              {progress}%
            </div>
          }
        >
          <div style={{ height: 9, borderRadius: 999, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
            <div style={{
              width: `${progress}%`,
              height: "100%",
              borderRadius: 999,
              background: `linear-gradient(90deg, ${color.bg}, ${color.light})`,
              boxShadow: `0 0 14px ${color.light}55`,
              transition: "width 260ms cubic-bezier(0.22, 1, 0.36, 1)"
            }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 13 }}>
            <div style={{ background: "rgba(13,13,26,0.54)", borderRadius: 14, padding: 12, border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ color: "#6B6A7A", fontSize: 11, marginBottom: 3 }}>Type</div>
              <div style={{ color: "#F1F0EE", fontSize: 13, fontWeight: 700 }}>{projectTypeLabel}</div>
            </div>
            <div style={{ background: "rgba(13,13,26,0.54)", borderRadius: 14, padding: 12, border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ color: "#6B6A7A", fontSize: 11, marginBottom: 3 }}>Statut</div>
              <div style={{ color: "#F1F0EE", fontSize: 13, fontWeight: 700 }}>{statusLabel}</div>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Chat client"
          subtitle="Espace prévu pour les messages et le suivi envoyé au client."
          right={
            <div style={{
              background: "rgba(167,139,250,0.12)",
              color: "#C4B5FD",
              borderRadius: 999,
              padding: "6px 10px",
              fontSize: 11,
              fontWeight: 800,
              border: "1px solid rgba(167,139,250,0.16)",
              flexShrink: 0
            }}>
              Bientôt
            </div>
          }
        >
          <div style={{
            borderRadius: 18,
            background: "rgba(13,13,26,0.68)",
            border: "1px dashed rgba(167,139,250,0.24)",
            padding: "24px 16px",
            textAlign: "center",
            color: "#A8A6B8",
            fontSize: 13,
            lineHeight: 1.45
          }}>
            <div style={{ fontSize: 24, marginBottom: 7 }}>💬</div>
            Le chat sera ajouté ici : historique des messages, zone d’écriture, photos et suivi client.
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
