"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Trash2, Copy, Send, HelpCircle } from "lucide-react";
import toast from "react-hot-toast";

export type Mode =
  | "Ask Workflow"
  | "Generate PRD"
  | "Breakdown Tasks"
  | "QA Test Cases"
  | "Tool Prompt"
  | "Review Website"
  | "Lead to PRD"
  | "CEO / Adrian";

const MODES: Mode[] = [
  "Ask Workflow",
  "Generate PRD",
  "Breakdown Tasks",
  "QA Test Cases",
  "Tool Prompt",
  "Review Website",
  "Lead to PRD",
  "CEO / Adrian",
];

const MODE_PLACEHOLDERS: Record<Mode, string> = {
  "Ask Workflow":    "Tanyakan sesuatu tentang workflow build WL-STUDIO...",
  "Generate PRD":    "Paste Google Maps listing, brief klien, atau deskripsi bisnis...",
  "Breakdown Tasks": "Tuliskan fitur atau modul yang ingin dipecah menjadi task...",
  "QA Test Cases":   "Tuliskan fitur atau flow yang ingin dibuatkan test cases-nya...",
  "Tool Prompt":     "Jelaskan target tool: Antigravity, Claude, Codex, Stitch, AI Studio, atau TestSprite...",
  "Review Website":  "Masukkan URL atau paste isi landing page untuk audit conversion...",
  "Lead to PRD":     "Paste data lead dari Lead Finder AI atau Google Maps listing...",
  "CEO / Adrian":    "Tulis brain dump tugas hari ini untuk disusun menjadi prioritas harian...",
};

const MODE_HINTS: Record<Mode, string> = {
  "Ask Workflow":    "Tanya tentang proses build, tools, atau urutan kerja.",
  "Generate PRD":    "Paste brief klien, Google Maps listing, atau deskripsi bisnis.",
  "Breakdown Tasks": "Paste PRD atau fitur yang mau dipecah jadi task.",
  "QA Test Cases":   "Paste fitur/flow untuk dibuatkan checklist testing.",
  "Tool Prompt":     "Jelaskan target tool: Antigravity, Claude, Codex, Stitch, AI Studio, atau TestSprite.",
  "Review Website":  "Masukkan URL atau paste isi landing page untuk audit conversion.",
  "Lead to PRD":     "Paste data lead dari Lead Finder AI/Google Maps untuk jadi PRD awal.",
  "CEO / Adrian":    "Mengubah brain dump pikiran menjadi prioritas harian, ACC list, & parking lot.",
};

interface ChatMessage {
  id: string;
  sender: "user" | "agent";
  text: string;
  mode?: Mode;
  timestamp: string;
}

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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize and load chat history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem("wb:pipeline_chat_history");
    if (savedHistory) {
      try {
        setMessages(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse chat history:", e);
      }
    } else {
      // Set default welcome message
      setMessages([
        {
          id: "welcome",
          sender: "agent",
          text: "Halo Adrian! Saya adalah Pipeline Architect. Silakan pilih mode di bawah dan kirimkan instruksi untuk memulai analisis PRD, breakdown task, QA test cases, website review, atau integrasi Hermes.",
          timestamp: new Date().toISOString()
        }
      ]);
    }
  }, []);

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages, isLoading, isOpen]);

  const saveChatHistory = (history: ChatMessage[]) => {
    setMessages(history);
    localStorage.setItem("wb:pipeline_chat_history", JSON.stringify(history));
  };

  const handleSubmit = async () => {
    if (!message.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}_u`,
      sender: "user",
      text: message.trim(),
      mode,
      timestamp: new Date().toISOString(),
    };

    const newHistory = [...messages, userMsg];
    saveChatHistory(newHistory);
    setMessage(""); // Clear textarea
    setIsLoading(true);

    try {
      const res = await fetch("/api/pipeline-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, message: userMsg.text }),
      });
      const data = await res.json();
      
      let replyText = "";
      if (res.ok) {
        replyText = data.output || "No output returned.";
        onNewOutput(replyText);
      } else {
        replyText = `Error: ${data.error}\n\n${data.output || ""}`;
        onNewOutput(replyText);
      }

      const agentMsg: ChatMessage = {
        id: `msg_${Date.now()}_a`,
        sender: "agent",
        text: replyText,
        mode,
        timestamp: new Date().toISOString(),
      };
      
      saveChatHistory([...newHistory, agentMsg]);
    } catch (error) {
      const err = error as Error;
      const errorMsg = `Error: Failed to connect to Pipeline Architect.\n\n${err.message}`;
      onNewOutput(errorMsg);

      const agentMsg: ChatMessage = {
        id: `msg_${Date.now()}_a`,
        sender: "agent",
        text: errorMsg,
        mode,
        timestamp: new Date().toISOString(),
      };
      saveChatHistory([...newHistory, agentMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (confirm("Hapus seluruh riwayat chat?")) {
      const welcome: ChatMessage[] = [
        {
          id: "welcome",
          sender: "agent",
          text: "Halo Adrian! Saya adalah Pipeline Architect. Silakan pilih mode di bawah dan kirimkan instruksi untuk memulai analisis PRD, breakdown task, QA test cases, website review, atau integrasi Hermes.",
          timestamp: new Date().toISOString()
        }
      ];
      saveChatHistory(welcome);
      toast.success("Riwayat chat dibersihkan.");
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => toast.success("Pesan disalin ke clipboard!"))
      .catch(() => toast.error("Gagal menyalin pesan."));
  };

  return (
    <div className="pipeline-workspace">
      {/* Backdrop — visible on mobile only */}
      {isOpen && (
        <div
          className="pa-backdrop"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* FAB — toggle panel */}
      <button
        id="pipeline-architect-fab"
        className={`pa-fab${isOpen ? " pa-fab--open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close Pipeline Architect" : "Open Pipeline Architect"}
      >
        {isOpen ? (
          <X size={20} />
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>

      {/* Panel */}
      {isOpen && (
        <div id="pipeline-architect-panel" className="pa-panel flex flex-col h-[80vh] sm:h-auto overflow-hidden">

          {/* ── Context Bar ── */}
          <div className="pa-context-bar shrink-0">
            <div className="w-full max-w-4xl mx-auto flex items-center flex-wrap gap-4">
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
            </div>
          </div>

          {/* ── Header ── */}
          <div className="pa-header flex justify-between items-center shrink-0">
            <div className="w-full max-w-4xl mx-auto flex justify-between items-center">
              <div className="pa-header-info">
                <span className="pa-header-kicker">Hermes Agent Chatbot</span>
                <span className="pa-header-title">Pipeline Architect &ndash; {mode}</span>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 1 && (
                  <button
                    onClick={handleClearHistory}
                    className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-white/5 rounded-lg transition-all"
                    title="Clear Chat History"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
                <button
                  className="pa-close-btn"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close panel"
                >
                  <X size={15} />
                </button>
              </div>
            </div>
          </div>

          {/* ── Mode tab selector ── */}
          <div className="pa-modes shrink-0" role="tablist" aria-label="Agent modes">
            <div className="w-full max-w-4xl mx-auto flex gap-2 overflow-x-auto scrollbar-none py-1">
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
          </div>

          {/* ── Mode Hint ── */}
          <div className="pa-hint flex items-center gap-1.5 shrink-0 text-gray-400">
            <div className="w-full max-w-4xl mx-auto flex items-center gap-1.5">
              <HelpCircle size={10} className="text-violet-400" />
              <span>{MODE_HINTS[mode]}</span>
            </div>
          </div>

          {/* ── Chat Messages Container ── */}
          <div 
            className="pa-response flex-1 overflow-y-auto p-4 bg-[#050608]/40"
            id="chat-messages-container"
          >
            <div className="w-full max-w-4xl mx-auto flex flex-col gap-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col gap-1 max-w-[85%] ${
                    msg.sender === "user" ? "self-end items-end" : "self-start items-start"
                  }`}
                >
                  {/* Mode label tag */}
                  {msg.mode && (
                    <span className="text-[8px] font-mono font-bold text-gray-500 uppercase tracking-wider mb-0.5">
                      #{msg.mode}
                    </span>
                  )}
                  
                  {/* Bubble */}
                  <div
                    className={`relative p-3 rounded-2xl text-[11px] leading-relaxed transition-all group ${
                      msg.sender === "user"
                        ? "bg-violet-600/20 border border-violet-500/30 text-white rounded-tr-none shadow-[0_4px_16px_rgba(124,58,237,0.08)]"
                        : "bg-[#111]/80 border border-white/5 text-[#e2e8f0] rounded-tl-none font-mono whitespace-pre-wrap shadow-[0_4px_16px_rgba(0,0,0,0.15)]"
                    }`}
                  >
                    {/* Message Content */}
                    <span className="break-words select-text">{msg.text}</span>

                    {/* Copy Button */}
                    {msg.id !== "welcome" && (
                      <button
                        onClick={() => handleCopyText(msg.text)}
                        className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 p-1 bg-black/80 border border-white/10 text-gray-400 hover:text-white rounded transition-all"
                        title="Salin pesan"
                      >
                        <Copy size={10} />
                      </button>
                    )}
                  </div>

                  {/* Timestamp */}
                  <span className="text-[8px] font-mono text-gray-600">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}

              {/* Typing Indicator */}
              {isLoading && (
                <div className="flex flex-col gap-1 max-w-[85%] self-start items-start">
                  <span className="text-[8px] font-mono font-bold text-gray-500 uppercase tracking-wider mb-0.5">
                    #{mode}
                  </span>
                  <div className="bg-[#111]/80 border border-white/5 text-white rounded-2xl rounded-tl-none px-4 py-3 shadow-[0_4px_16px_rgba(0,0,0,0.15)]">
                    <div className="pa-loading flex items-center gap-1" aria-label="Processing..." role="status">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 inline-block animate-bounce"
                          style={{ animationDelay: `${i * 0.2}s` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Scroll Anchor */}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* ── Input Area ── */}
          <div className="pa-input-area border-t border-white/5 bg-[#08090d] p-3 shrink-0 flex flex-col gap-2">
            <div className="w-full max-w-4xl mx-auto flex flex-col gap-2">
              <div className="flex items-end gap-2">
                <textarea
                  id="pa-textarea"
                  className="flex-1 min-h-[50px] max-h-[120px] bg-white/[0.03] border border-white/10 rounded-xl text-white font-mono text-xs p-2.5 outline-none resize-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all placeholder-gray-600"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                  placeholder={MODE_PLACEHOLDERS[mode]}
                  rows={1}
                />
                <button
                  className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white transition-all disabled:opacity-40 disabled:pointer-events-none shrink-0"
                  onClick={handleSubmit}
                  disabled={isLoading || !message.trim()}
                  title={`Kirim ke ${mode}`}
                >
                  <Send size={14} />
                </button>
              </div>
              <p className="text-[8px] text-gray-600 text-center font-mono">Tekan Enter untuk kirim, Shift+Enter untuk baris baru</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
