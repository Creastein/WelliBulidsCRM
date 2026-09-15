"use client";

import { useState } from "react";

interface OutputCenterProps {
  latestOutput: string | null;
  onClear: () => void;
}

export default function OutputCenter({ latestOutput, onClear }: OutputCenterProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!latestOutput) return;
    navigator.clipboard.writeText(latestOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!latestOutput) return;
    const timestamp = new Date().toISOString().slice(0, 16).replace("T", "-").replace(":", "");
    const filename = `wl-studio-output-${timestamp}.md`;
    const blob = new Blob([latestOutput], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="output-center">
      <div className="output-header">
        <div className="output-title-group">
          <span className="output-kicker">Workspace Logs</span>
          <h3 className="output-title" style={{ fontSize: "15px", fontWeight: "700", fontFamily: "var(--font-syne), sans-serif", color: "#F1F5F9" }}>Output Center</h3>
        </div>
        {latestOutput ? (
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", justifyContent: "flex-end" }}>
            <button onClick={onClear} className="output-clear-btn" id="output-clear-btn">
              Clear
            </button>
            <button onClick={handleCopy} className="output-copy-btn" id="output-copy-btn">
              {copied ? "✓ Copied" : "Copy"}
            </button>
            <button onClick={handleDownload} className="output-download-btn" id="output-download-btn">
              ↓ .md
            </button>
          </div>
        ) : null}
      </div>

      <div className="output-body">
        {latestOutput ? (
          <pre className="output-pre">
            <code>{latestOutput}</code>
          </pre>
        ) : (
          <div className="output-placeholder">
            <div style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.05)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "12px",
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(100,116,139,0.35)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <p style={{ color: "#334155", marginBottom: "4px" }}>Output belum tersedia</p>
            <p style={{ color: "#1E293B", fontSize: "10px" }}>
              Kirim perintah ke Pipeline Architect untuk melihat hasil di sini.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
