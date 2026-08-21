import React from "react";

const nodes = [
  { label: "INBOX", value: "24", x: 70, y: 72 },
  { label: "TASKS", value: "12", x: 330, y: 52 },
  { label: "DOCS", value: "15", x: 360, y: 250 },
  { label: "TEAM", value: "08", x: 76, y: 244 },
] as const;

export function LandingSystemVisual() {
  return (
    <div className="editorial-float relative mx-auto aspect-[4/3] w-full max-w-[560px]" aria-hidden="true">
      <svg viewBox="0 0 440 330" className="h-full w-full overflow-visible">
        <defs>
          <linearGradient id="systemCore" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--brand-primary)" />
            <stop offset="1" stopColor="var(--brand-primary-active)" />
          </linearGradient>
        </defs>

        {nodes.map((node) => (
          <path
            key={node.label}
            d={`M220 165 L${node.x + 28} ${node.y + 28}`}
            pathLength="1"
            className="editorial-system-line"
            stroke="var(--border)"
            strokeWidth="1.25"
            fill="none"
          />
        ))}

        <circle cx="220" cy="165" r="62" fill="var(--card)" stroke="var(--foreground)" strokeWidth="1.5" />
        <circle cx="220" cy="165" r="48" fill="url(#systemCore)" />
        <text x="220" y="157" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="700" letterSpacing="2">
          AI CORE
        </text>
        <text x="220" y="179" textAnchor="middle" fill="#fff" fontSize="22" fontWeight="700">
          LIVE
        </text>

        {nodes.map((node, index) => (
          <g key={node.label} transform={`translate(${node.x} ${node.y})`}>
            <rect width="94" height="58" rx="2" fill="var(--card)" stroke="var(--border)" />
            <circle cx="14" cy="16" r="3" fill={index === 0 ? "var(--brand-primary)" : "var(--muted-foreground)"} />
            <text x="24" y="19" fill="var(--muted-foreground)" fontSize="8" fontWeight="700" letterSpacing="1.3">
              {node.label}
            </text>
            <text x="14" y="46" fill="var(--foreground)" fontSize="20" fontWeight="650">
              {node.value}
            </text>
          </g>
        ))}

        <text x="220" y="322" textAnchor="middle" fill="var(--muted-foreground)" fontSize="8" fontWeight="700" letterSpacing="1.8">
          ONE TENANT · ONE OPERATIONAL VIEW
        </text>
      </svg>
    </div>
  );
}
