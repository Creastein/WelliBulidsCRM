"use client";

import { useEffect, useRef } from "react";

export default function BuildPipeline() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const c3Ref = useRef<HTMLDivElement>(null);
  const c4Ref = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    function drawConnector() {
      const wrapper = wrapperRef.current;
      const c3 = c3Ref.current;
      const c4 = c4Ref.current;
      const svg = svgRef.current;
      const path = pathRef.current;

      if (!wrapper || !c3 || !c4 || !svg || !path) return;

      const wR = wrapper.getBoundingClientRect();
      const bR = c3.getBoundingClientRect();
      const iR = c4.getBoundingClientRect();

      const sx = bR.left + bR.width / 2 - wR.left;
      const sy = bR.bottom - wR.top;
      const ex = iR.left + iR.width / 2 - wR.left;
      const ey = iR.top - wR.top;
      const my = (sy + ey) / 2;
      const r = 10;

      const d = [
        `M ${sx} ${sy}`,
        `L ${sx} ${my - r}`,
        `Q ${sx} ${my} ${sx - r} ${my}`,
        `L ${ex + r} ${my}`,
        `Q ${ex} ${my} ${ex} ${my + r}`,
        `L ${ex} ${ey}`,
      ].join(" ");

      path.setAttribute("d", d);
      svg.setAttribute("width", wR.width.toString());
      svg.setAttribute("height", wR.height.toString());

      const len = path.getTotalLength();
      path.style.transition = "none";
      path.style.strokeDasharray = len.toString();
      path.style.strokeDashoffset = len.toString();

      path.getBoundingClientRect();
      path.style.transition = "stroke-dashoffset 0.75s cubic-bezier(0.4,0,0.2,1) 0.38s";
      path.style.strokeDashoffset = "0";
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(drawConnector);
    });

    window.addEventListener("resize", drawConnector);
    return () => window.removeEventListener("resize", drawConnector);
  }, []);

  return (
    <div className="pipeline-wrapper" id="wrapper" ref={wrapperRef}>
      {/* Connector SVG overlay */}
      <svg id="conn-svg" xmlns="http://www.w3.org/2000/svg" ref={svgRef}>
        <defs>
          <marker
            id="ah"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto"
          >
            <path
              d="M2 1 L8 5 L2 9"
              fill="none"
              stroke="#334155"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </marker>
        </defs>
        <path
          id="conn"
          fill="none"
          stroke="#1E3A4C"
          strokeWidth="1.5"
          markerEnd="url(#ah)"
          ref={pathRef}
        />
      </svg>

      {/* Section header */}
      <div className="pipeline-header">
        <span className="pipeline-eyebrow">WelliBuilds · Dev Workflow</span>
        <h2 className="pipeline-h2">
          Build <span className="g">Pipeline</span>
        </h2>
      </div>

      {/* Row 1 */}
      <div className="pipeline-row-grid" id="row1">
        <div className="pipeline-card cp" id="c1">
          <span className="num">01</span>
          <div className="pills">
            <span className="pill">Claude.ai</span>
          </div>
          <div className="name">Planning</div>
          <div className="out">
            <span className="arr">→</span> PRD
          </div>
        </div>

        <div className="rarr">
          <svg viewBox="0 0 22 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="0" y1="6" x2="17" y2="6" />
            <polyline points="12,2 18,6 12,10" />
          </svg>
        </div>

        <div className="pipeline-card cf" id="c2">
          <span className="num">02</span>
          <div className="pills">
            <span className="pill">Stitch</span>
            <span className="pill">AI Studio</span>
            <span className="pill">Antigravity</span>
          </div>
          <div className="name">Frontend dev</div>
          <div className="out">
            <span className="arr">→</span> Next.js + UI design
          </div>
        </div>

        <div className="rarr">
          <svg viewBox="0 0 22 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="0" y1="6" x2="17" y2="6" />
            <polyline points="12,2 18,6 12,10" />
          </svg>
        </div>

        <div className="pipeline-card cb" id="c3" ref={c3Ref}>
          <span className="num">03</span>
          <div className="pills">
            <span className="pill">Supabase</span>
          </div>
          <div className="name">Backend dev</div>
          <div className="out">
            <span className="arr">→</span> Database + API layer
          </div>
        </div>
      </div>

      {/* Row 2 */}
      <div className="pipeline-row-grid" id="row2">
        <div className="pipeline-card ci dashed" id="c4" ref={c4Ref}>
          <span className="num">04</span>
          <div className="pills">
            <span className="pill">QA Manual</span>
            <span className="pill">Antigravity</span>
            <span className="pill">Codex</span>
          </div>
          <div className="name">Integration</div>
          <div className="out">
            <span className="arr">→</span> Functional frontend
          </div>
        </div>

        <div className="rarr">
          <svg viewBox="0 0 22 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="0" y1="6" x2="17" y2="6" />
            <polyline points="12,2 18,6 12,10" />
          </svg>
        </div>

        <div className="pipeline-card cd" id="c5">
          <span className="num">05</span>
          <div className="pills">
            <span className="pill">GitHub</span>
            <span className="pill">Vercel</span>
          </div>
          <div className="name">Deploy</div>
          <div className="out">
            <span className="arr">→</span> App preview
          </div>
        </div>

        <div className="rarr">
          <svg viewBox="0 0 22 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="0" y1="6" x2="17" y2="6" />
            <polyline points="12,2 18,6 12,10" />
          </svg>
        </div>

        <div className="pipeline-card ct" id="c6">
          <span className="num">06</span>
          <div className="pills">
            <span className="pill">TestSprite</span>
          </div>
          <div className="name">Testing</div>
          <div className="out">
            <span className="arr">→</span> Test cases
          </div>
        </div>
      </div>
    </div>
  );
}
