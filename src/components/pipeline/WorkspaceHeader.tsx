"use client";

export default function WorkspaceHeader() {
  return (
    <div className="pipeline-header">
      {/* Badge row */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
        <span style={{
          fontFamily: "var(--font-jetbrains-mono), monospace",
          fontSize: "9px",
          letterSpacing: "0.22em",
          color: "rgba(255,255,255,0.25)",
          textTransform: "uppercase",
        }}>
          WelliBuilds · Dev Command Center
        </span>
        {/* Live indicator */}
        <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <span style={{
            display: "inline-block",
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: "#10B981",
            boxShadow: "0 0 6px #10B981",
            animation: "statusPulse 2s ease-in-out infinite",
          }} />
          <span style={{
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: "9px",
            letterSpacing: "0.1em",
            color: "#10B981",
          }}>Active</span>
        </span>
      </div>

      {/* Main title */}
      <h2 style={{ marginBottom: "10px", fontSize: "36px", fontWeight: "700", fontFamily: "var(--font-syne), sans-serif", letterSpacing: "-0.035em" }}>
        WelliBuilds <span className="g" style={{ background: "linear-gradient(120deg, #7C3AED 0%, #3B82F6 48%, #06B6D4 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Workspace</span>
      </h2>

      {/* Subtitle */}
      <p className="pipeline-subtitle">
        AI-assisted command center untuk PRD, lead planning, build workflow, dan QA.
      </p>

      {/* Gradient separator */}
      <div style={{
        marginTop: "24px",
        height: "1px",
        background: "linear-gradient(90deg, transparent 0%, rgba(124,58,237,0.5) 30%, rgba(6,182,212,0.5) 70%, transparent 100%)",
      }} />
    </div>
  );
}
