"use client";

import { useState } from "react";

export type Mode =
  | "Ask Workflow"
  | "Generate PRD"
  | "Breakdown Tasks"
  | "QA Test Cases"
  | "Tool Prompt"
  | "Review Website"
  | "Lead to PRD";

const MODES: Mode[] = [
  "Ask Workflow",
  "Generate PRD",
  "Breakdown Tasks",
  "QA Test Cases",
  "Tool Prompt",
  "Review Website",
  "Lead to PRD",
];

const MODE_PLACEHOLDERS: Record<Mode, string> = {
  "Ask Workflow":    "Tanyakan sesuatu tentang workflow build WelliBuilds...",
  "Generate PRD":    "Paste Google Maps listing, brief klien, atau deskripsi bisnis...",
  "Breakdown Tasks": "Tuliskan fitur atau modul yang ingin dipecah menjadi task...",
  "QA Test Cases":   "Tuliskan fitur atau flow yang ingin dibuatkan test cases-nya...",
  "Tool Prompt":     "Jelaskan target tool: Antigravity, Claude, Codex, Stitch, AI Studio, atau TestSprite...",
  "Review Website":  "Masukkan URL atau paste isi landing page untuk audit conversion...",
  "Lead to PRD":     "Paste data lead dari Lead Finder AI atau Google Maps listing...",
};

const MODE_HINTS: Record<Mode, string> = {
  "Ask Workflow":    "Tanya tentang proses build, tools, atau urutan kerja.",
  "Generate PRD":    "Paste brief klien, Google Maps listing, atau deskripsi bisnis.",
  "Breakdown Tasks": "Paste PRD atau fitur yang mau dipecah jadi task.",
  "QA Test Cases":   "Paste fitur/flow untuk dibuatkan checklist testing.",
  "Tool Prompt":     "Jelaskan target tool: Antigravity, Claude, Codex, Stitch, AI Studio, atau TestSprite.",
  "Review Website":  "Masukkan URL atau paste isi landing page untuk audit conversion.",
  "Lead to PRD":     "Paste data lead dari Lead Finder AI/Google Maps untuk jadi PRD awal.",
};

interface PipelineArchitectProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  mode: Mode;
  setMode: (mode: Mode) => void;
  onNewOutput: (output: string) => void;
}

export default function PipelineArchitect({
  isOpen,
  setIsOpen,
  mode,
  setMode,
  onNewOutput,
}: PipelineArchitectProps) {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);

  // Reset message and response when mode changes
  const [prevMode, setPrevMode] = useState(mode);
  if (mode !== prevMode) {
    setPrevMode(mode);
    setResponse(null);
    setMessage("");
  }

  const handleSubmit = async () => {
    if (!message.trim()) return;
    setIsLoading(true);
    setResponse(null);
    try {
      const res = await fetch("/api/pipeline-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, message }),
      });
      const data = await res.json();
      if (res.ok) {
        const outputText = data.output || "No output returned.";
        setResponse(outputText);
        onNewOutput(outputText);
      } else {
        const errorText = `Error: ${data.error}\n\n${data.output || ""}`;
        setResponse(errorText);
        onNewOutput(errorText);
      }
    } catch (error) {
      const err = error as Error;
      const errorMsg = `Error: Failed to connect to Pipeline Architect.\n\n${err.message}`;
      setResponse(errorMsg);
      onNewOutput(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pipeline-workspace">
      {/* Backdrop — visible on mobile only (CSS handles display:none on desktop) */}
      {isOpen && (
        <div
          className="pa-backdrop"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* FAB — opens/closes panel on both desktop and mobile */}
      <button
        id="pipeline-architect-fab"
        className={`pa-fab${isOpen ? " pa-fab--open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close Pipeline Architect" : "Open Pipeline Architect"}
      >
        {isOpen ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>

      {/* Panel — floating modal on mobile, docked sidebar on desktop (CSS handles) */}
      {isOpen && (
        <div id="pipeline-architect-panel" className="pa-panel">

          {/* ── Current Work Context ── */}
          <div className="pa-context-bar">
            <span className="pa-context-item">
              Mode: <span className="pa-context-value">{mode}</span>
            </span>
            <span className="pa-context-sep">·</span>
            <span className="pa-context-item">
              Agent: <span className="pa-context-value">Pipeline Architect</span>
            </span>
            <span className="pa-context-sep">·</span>
            <span className="pa-context-item">
              Profile: <span className="pa-context-value">pipeline</span>
            </span>
            <span className="pa-context-sep">·</span>
            <span className="pa-context-item">
              Tools: <span className="pa-context-value">safe</span>
            </span>
          </div>

          {/* ── Header ── */}
          <div className="pa-header">
            <div className="pa-header-info">
              <span className="pa-header-kicker">Hermes Agent</span>
              <span className="pa-header-title">Pipeline Architect</span>
            </div>
            <button
              className="pa-close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Close panel"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* ── Mode pill selector ── */}
          <div className="pa-modes" role="tablist" aria-label="Agent modes">
            {MODES.map((m) => (
              <button
                key={m}
                role="tab"
                aria-selected={mode === m}
                className={`pa-mode-btn${mode === m ? " pa-mode-btn--active" : ""}`}
                onClick={() => setMode(m)}
              >
                {m}
              </button>
            ))}
          </div>

          {/* ── Mode hint / preset helper ── */}
          <div className="pa-hint" aria-live="polite">
            {MODE_HINTS[mode]}
          </div>

          {/* ── Response / empty / loading ── */}
          <div className="pa-response">
            {response && (
              <div className="pa-response-block">
                <span className="pa-response-label">Output — {mode}</span>
                <p className="pa-response-text">{response}</p>
              </div>
            )}

            {!response && !isLoading && (
              <div className="pa-empty">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(100,116,139,0.35)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <p className="pa-empty-text">
                  <span className="pa-empty-mode">{mode}</span>
                  <br />
                  Masukkan brief dan kirim.
                </p>
              </div>
            )}

            {isLoading && (
              <div className="pa-loading" aria-label="Processing..." role="status">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="pa-dot"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ── Input area ── */}
          <div className="pa-input-area">
            <textarea
              id="pa-textarea"
              className="pa-textarea"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder={MODE_PLACEHOLDERS[mode]}
              aria-label={`Input for ${mode}`}
            />
            <button
              className="pa-submit-btn"
              onClick={handleSubmit}
              disabled={isLoading || !message.trim()}
              aria-busy={isLoading}
            >
              {isLoading ? "Processing..." : `Send → ${mode}`}
            </button>
            <p className="pa-shortcut-hint">Ctrl+Enter to send</p>
          </div>
        </div>
      )}
    </div>
  );
}
