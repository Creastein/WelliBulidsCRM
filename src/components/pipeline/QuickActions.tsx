"use client";

import { Mode } from "./PipelineArchitect";

interface QuickActionsProps {
  onOpenAgent: () => void;
  onSelectMode: (mode: Mode) => void;
}

interface ActionCard {
  id: string;
  title: string;
  desc: string;
  badge: string;
  accent: string;
  accentBg: string;
  accentBorder: string;
  badgeColor: string;
  icon: React.ReactNode;
  primary: () => void;
  secondary?: { label: string; action: () => void };
}

export default function QuickActions({ onOpenAgent, onSelectMode }: QuickActionsProps) {
  const cards: ActionCard[] = [
    {
      id: "qa-pipeline-architect",
      title: "Pipeline Architect",
      desc: "Ask workflow, PRD, tasks, QA, dan prompt generation via Hermes AI.",
      badge: "AI",
      accent: "#7C3AED",
      accentBg: "rgba(124,58,237,0.08)",
      accentBorder: "rgba(124,58,237,0.2)",
      badgeColor: "#A78BFA",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
      primary: () => onOpenAgent(),
    },
    {
      id: "qa-generate-prd",
      title: "Generate PRD",
      desc: "Convert client brief, Google Maps listing, atau business idea menjadi PRD.",
      badge: "AI",
      accent: "#3B82F6",
      accentBg: "rgba(59,130,246,0.08)",
      accentBorder: "rgba(59,130,246,0.2)",
      badgeColor: "#93C5FD",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      ),
      primary: () => onSelectMode("Generate PRD"),
    },
    {
      id: "qa-lead-finder",
      title: "Lead Finder AI",
      desc: "Temukan dan inspeksi leads bisnis potensial dari berbagai sumber.",
      badge: "External",
      accent: "#F59E0B",
      accentBg: "rgba(245,158,11,0.08)",
      accentBorder: "rgba(245,158,11,0.2)",
      badgeColor: "#FCD34D",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FCD34D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
          <line x1="11" y1="8" x2="11" y2="14" />
          <line x1="8" y1="11" x2="14" y2="11" />
        </svg>
      ),
      primary: () => window.open("https://lead-finder-ai-lilac.vercel.app/", "_blank"),
      secondary: {
        label: "Convert Lead → PRD",
        action: () => onSelectMode("Lead to PRD"),
      },
    },
    {
      id: "qa-wl-studio-website",
      title: "WL-STUDIO Website",
      desc: "Buka website publik WL-STUDIO — portfolio dan landing page klien.",
      badge: "Web",
      accent: "#10B981",
      accentBg: "rgba(16,185,129,0.08)",
      accentBorder: "rgba(16,185,129,0.2)",
      badgeColor: "#6EE7B7",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6EE7B7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      ),
      primary: () => window.open("https://welli-builds.vercel.app/", "_blank"),
      secondary: {
        label: "Review Website",
        action: () => onSelectMode("Review Website"),
      },
    },
  ];

  return (
    <div className="quick-actions-grid">
      {cards.map((card) => (
        <div
          key={card.id}
          className="qa-card-new"
          style={{
            "--card-accent": card.accent,
            "--card-accent-bg": card.accentBg,
            "--card-accent-border": card.accentBorder,
          } as React.CSSProperties}
        >
          {/* Top glow accent line */}
          <div style={{
            position: "absolute",
            top: 0,
            left: "20%",
            right: "20%",
            height: "1px",
            background: card.accent,
            boxShadow: `0 0 12px 2px ${card.accent}`,
            opacity: 0.7,
          }} />

          {/* Badge */}
          <span style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: "8px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: card.badgeColor,
            background: card.accentBg,
            border: `1px solid ${card.accentBorder}`,
            padding: "2px 6px",
            borderRadius: "4px",
          }}>
            {card.badge}
          </span>

          {/* Primary button area */}
          <button
            id={card.id}
            onClick={card.primary}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              textAlign: "left",
              display: "flex",
              flexDirection: "column",
              width: "100%",
            }}
          >
            {/* Icon */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "38px",
              height: "38px",
              background: card.accentBg,
              border: `1px solid ${card.accentBorder}`,
              borderRadius: "10px",
              marginBottom: "12px",
              flexShrink: 0,
            }}>
              {card.icon}
            </div>

            {/* Title */}
            <span style={{
              fontFamily: "var(--font-syne), sans-serif",
              fontWeight: 700,
              fontSize: "14px",
              color: "#F1F5F9",
              letterSpacing: "-0.02em",
              display: "block",
              marginBottom: "6px",
            }}>
              {card.title}
            </span>

            {/* Desc */}
            <p style={{
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: "10px",
              color: "#64748B",
              lineHeight: 1.5,
              margin: 0,
              marginBottom: card.secondary ? "12px" : "0",
            }}>
              {card.desc}
            </p>
          </button>

          {/* Secondary action */}
          {card.secondary && (
            <button
              onClick={card.secondary.action}
              style={{
                marginTop: "auto",
                padding: "5px 0",
                background: "none",
                border: "none",
                borderTop: `1px solid ${card.accentBorder}`,
                cursor: "pointer",
                fontFamily: "var(--font-jetbrains-mono), monospace",
                fontSize: "9px",
                letterSpacing: "0.06em",
                color: card.badgeColor,
                textAlign: "left",
                transition: "opacity 0.15s",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                width: "100%",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.7"; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              {card.secondary.label}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
