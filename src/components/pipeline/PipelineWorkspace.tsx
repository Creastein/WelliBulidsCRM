"use client";

import { useEffect, useState } from "react";
import PipelineArchitect, { Mode } from "./PipelineArchitect";
import WorkspaceHeader from "./WorkspaceHeader";
import QuickActions from "./QuickActions";
import BuildPipeline from "./BuildPipeline";
import OutputCenter from "./OutputCenter";

export default function PipelineWorkspace() {
  const [isAgentOpen, setIsAgentOpen] = useState(false);
  const [agentMode, setAgentMode] = useState<Mode>("Ask Workflow");
  const [latestOutput, setLatestOutput] = useState<string | null>(null);

  // On desktop (≥1024px): add padding-right to body so main content
  // shifts left to make room for the 420px docked agent panel.
  useEffect(() => {
    if (isAgentOpen) {
      document.body.classList.add("agent-open");
    } else {
      document.body.classList.remove("agent-open");
    }
    return () => {
      document.body.classList.remove("agent-open");
    };
  }, [isAgentOpen]);

  const openAgentWithMode = (mode: Mode) => {
    setAgentMode(mode);
    setIsAgentOpen(true);
  };

  return (
    <div className="pipeline-workspace workspace-layout h-full">
      <div className="main-content p-4 md:p-8 overflow-y-auto">
        <WorkspaceHeader />

        <QuickActions
          onOpenAgent={() => setIsAgentOpen(true)}
          onSelectMode={openAgentWithMode}
        />

        <BuildPipeline />

        <OutputCenter
          latestOutput={latestOutput}
          onClear={() => setLatestOutput(null)}
        />

        <div className="pipeline-foot mt-12 text-center text-xs font-mono opacity-50 uppercase tracking-widest pb-8">
          wellibuilds.com · full-stack dev pipeline · 2025
        </div>
      </div>

      {/* PipelineArchitect renders its own FAB + panel.
          CSS determines: floating modal (mobile) vs docked sidebar (desktop). */}
      <PipelineArchitect
        isOpen={isAgentOpen}
        setIsOpen={setIsAgentOpen}
        mode={agentMode}
        setMode={setAgentMode}
        onNewOutput={setLatestOutput}
      />
    </div>
  );
}
