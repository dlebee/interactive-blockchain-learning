import './OraclesDemo.css'

const W = 480
const H = 180

function DataFlowDot({ path, dur, begin = 0 }: { path: string; dur: number; begin?: number }) {
  return (
    <circle r="4" fill="rgba(6, 182, 212, 0.9)">
      <animateMotion dur={`${dur}s`} repeatCount="indefinite" begin={`${begin}s`} path={path} />
    </circle>
  )
}

export function CentralizedOracleDiagram() {
  return (
    <section className="oracle-diagram-section">
        <svg viewBox={`0 0 ${W} ${H}`} className="oracle-diagram-svg" aria-label="Centralized oracle: single source">
          <defs>
            <marker id="oracle-centralized-arrow" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto">
              <path d="M0,0 L12,6 L0,12" fill="rgba(6, 182, 212, 0.9)" />
            </marker>
          </defs>

          {/* Data sources */}
          <g transform="translate(40, 90)">
            <rect x="-30" y="-25" width="60" height="30" rx="4" fill="rgba(51, 65, 85, 0.8)" stroke="rgba(148, 163, 184, 0.4)" />
            <text x="0" y="-5" fill="#94a3b8" fontSize="10" textAnchor="middle">API</text>
          </g>
          <g transform="translate(40, 140)">
            <rect x="-30" y="-12" width="60" height="24" rx="4" fill="rgba(51, 65, 85, 0.8)" stroke="rgba(148, 163, 184, 0.4)" />
            <text x="0" y="4" fill="#94a3b8" fontSize="9" textAnchor="middle">Feed</text>
          </g>

          {/* Flow: sources to oracle */}
          <line x1="70" y1="90" x2="140" y2="90" stroke="rgba(6, 182, 212, 0.5)" strokeWidth="2" markerEnd="url(#oracle-centralized-arrow)" />
          <line x1="70" y1="140" x2="140" y2="90" stroke="rgba(6, 182, 212, 0.5)" strokeWidth="2" markerEnd="url(#oracle-centralized-arrow)" />
          <DataFlowDot path="M 75 90 L 135 90" dur={1.8} />
          <DataFlowDot path="M 75 140 L 135 90" dur={2.2} begin={0.3} />

          {/* Oracle (single) */}
          <g transform="translate(180, 70)">
            <rect x="-50" y="-30" width="100" height="60" rx="8" fill="rgba(30, 41, 59, 0.95)" stroke="rgba(249, 115, 22, 0.6)" strokeWidth="2" />
            <text x="0" y="-5" fill="#fdba74" fontSize="12" textAnchor="middle">Oracle</text>
            <text x="0" y="12" fill="#94a3b8" fontSize="9" textAnchor="middle">(single)</text>
          </g>

          {/* Flow: oracle to chain */}
          <line x1="230" y1="90" x2="340" y2="90" stroke="rgba(6, 182, 212, 0.85)" strokeWidth="3" markerEnd="url(#oracle-centralized-arrow)" />
          <DataFlowDot path="M 235 90 L 335 90" dur={1.5} begin={0.6} />

          {/* Blockchain */}
          <g transform="translate(380, 70)">
            <rect x="-40" y="-30" width="80" height="60" rx="6" fill="rgba(51, 65, 85, 0.6)" stroke="rgba(34, 197, 94, 0.5)" strokeWidth="2" />
            <text x="0" y="5" fill="#86efac" fontSize="11" textAnchor="middle">Chain</text>
          </g>
        </svg>
        <p className="oracle-diagram-caption">One entity. Simple, but a single point of failure.</p>
    </section>
  )
}

export function DelegatedOracleDiagram() {
  return (
    <section className="oracle-diagram-section">
        <svg viewBox={`0 0 ${W} ${H}`} className="oracle-diagram-svg" aria-label="Delegated oracles: multiple trusted reporters">
          <defs>
            <marker id="oracle-delegated-arrow" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
              <path d="M0,0 L10,5 L0,10" fill="rgba(6, 182, 212, 0.9)" />
            </marker>
          </defs>

          {/* Data sources: center 30,90; rect -25 to +25 x, right edge 55 */}
          <g transform="translate(30, 90)">
            <rect x="-25" y="-20" width="50" height="40" rx="4" fill="rgba(51, 65, 85, 0.8)" stroke="rgba(148, 163, 184, 0.4)" />
            <text x="0" y="5" fill="#94a3b8" fontSize="9" textAnchor="middle">Sources</text>
          </g>

          {/* Oracles A, B, C: center 120; circle r=22, left edge 98, right edge 142 */}
          <g transform="translate(120, 50)">
            <circle cx="0" cy="0" r="22" fill="rgba(30, 41, 59, 0.95)" stroke="rgba(6, 182, 212, 0.6)" strokeWidth="2" />
            <text x="0" y="5" fill="#67e8f9" fontSize="11" textAnchor="middle">A</text>
          </g>
          <g transform="translate(120, 90)">
            <circle cx="0" cy="0" r="22" fill="rgba(30, 41, 59, 0.95)" stroke="rgba(6, 182, 212, 0.6)" strokeWidth="2" />
            <text x="0" y="5" fill="#67e8f9" fontSize="11" textAnchor="middle">B</text>
          </g>
          <g transform="translate(120, 130)">
            <circle cx="0" cy="0" r="22" fill="rgba(30, 41, 59, 0.95)" stroke="rgba(6, 182, 212, 0.6)" strokeWidth="2" />
            <text x="0" y="5" fill="#67e8f9" fontSize="11" textAnchor="middle">C</text>
          </g>

          {/* Flow: sources (right 55) to oracles (left 98) */}
          <line x1="55" y1="90" x2="98" y2="50" stroke="rgba(6, 182, 212, 0.7)" strokeWidth="2" markerEnd="url(#oracle-delegated-arrow)" />
          <line x1="55" y1="90" x2="98" y2="90" stroke="rgba(6, 182, 212, 0.7)" strokeWidth="2" markerEnd="url(#oracle-delegated-arrow)" />
          <line x1="55" y1="90" x2="98" y2="130" stroke="rgba(6, 182, 212, 0.7)" strokeWidth="2" markerEnd="url(#oracle-delegated-arrow)" />
          <DataFlowDot path="M 60 90 L 93 55" dur={1.6} />
          <DataFlowDot path="M 60 90 L 93 90" dur={1.4} begin={0.2} />
          <DataFlowDot path="M 60 90 L 93 125" dur={1.7} begin={0.4} />

          {/* Aggregate: center 220,90; rect -35 to +35 x, left edge 185, right edge 255 */}
          <g transform="translate(220, 90)">
            <rect x="-35" y="-22" width="70" height="44" rx="6" fill="rgba(30, 41, 59, 0.95)" stroke="rgba(134, 239, 172, 0.5)" strokeWidth="2" />
            <text x="0" y="5" fill="#86efac" fontSize="10" textAnchor="middle">Aggregate</text>
          </g>

          {/* Flow: oracles (right 142) to aggregate (left 185) */}
          <line x1="142" y1="50" x2="185" y2="90" stroke="rgba(6, 182, 212, 0.7)" strokeWidth="2" markerEnd="url(#oracle-delegated-arrow)" />
          <line x1="142" y1="90" x2="185" y2="90" stroke="rgba(6, 182, 212, 0.7)" strokeWidth="2" markerEnd="url(#oracle-delegated-arrow)" />
          <line x1="142" y1="130" x2="185" y2="90" stroke="rgba(6, 182, 212, 0.7)" strokeWidth="2" markerEnd="url(#oracle-delegated-arrow)" />
          <DataFlowDot path="M 147 55 L 180 90" dur={1.5} begin={0.1} />
          <DataFlowDot path="M 147 90 L 180 90" dur={1.3} begin={0.3} />
          <DataFlowDot path="M 147 125 L 180 90" dur={1.6} begin={0.5} />

          {/* Flow: aggregate (right 255) to chain (left 365) */}
          <line x1="255" y1="90" x2="365" y2="90" stroke="rgba(6, 182, 212, 0.85)" strokeWidth="3" markerEnd="url(#oracle-delegated-arrow)" />
          <DataFlowDot path="M 260 90 L 360 90" dur={1.4} begin={0.4} />

          {/* Blockchain: center 400,90; rect -35 to +35 x, left edge 365 */}
          <g transform="translate(400, 90)">
            <rect x="-35" y="-25" width="70" height="50" rx="6" fill="rgba(51, 65, 85, 0.6)" stroke="rgba(34, 197, 94, 0.5)" strokeWidth="2" />
            <text x="0" y="5" fill="#86efac" fontSize="11" textAnchor="middle">Chain</text>
          </g>
        </svg>
        <p className="oracle-diagram-caption">Trusted set. Aggregate and hold each accountable.</p>
    </section>
  )
}

export function PermissionlessOracleDiagram() {
  return (
    <section className="oracle-diagram-section">
        <svg viewBox={`0 0 ${W} ${H}`} className="oracle-diagram-svg" aria-label="Permissionless oracle: anyone can join, hard to incentivize">
          <defs>
            <marker id="oracle-perm-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8" fill="rgba(6, 182, 212, 0.6)" />
            </marker>
          </defs>

          {/* Data sources */}
          <g transform="translate(30, 90)">
            <rect x="-25" y="-20" width="50" height="40" rx="4" fill="rgba(51, 65, 85, 0.8)" stroke="rgba(148, 163, 184, 0.4)" />
            <text x="0" y="5" fill="#94a3b8" fontSize="9" textAnchor="middle">Sources</text>
          </g>

          {/* Many anonymous nodes - scattered */}
          {[
            [130, 40],
            [150, 75],
            [120, 110],
            [170, 130],
            [140, 155],
            [190, 60],
            [200, 100],
          ].map(([x, y], i) => (
            <g key={i} transform={`translate(${x}, ${y})`}>
              <circle cx="0" cy="0" r="14" fill="rgba(30, 41, 59, 0.9)" stroke="rgba(148, 163, 184, 0.5)" strokeWidth="1" />
              <text x="0" y="4" fill="#64748b" fontSize="8" textAnchor="middle">?</text>
            </g>
          ))}

          {/* Chaotic flows from sources */}
          <DataFlowDot path="M 55 90 L 115 45" dur={1.8} />
          <DataFlowDot path="M 55 90 L 105 110" dur={2} begin={0.2} />
          <DataFlowDot path="M 55 90 L 155 125" dur={2.2} begin={0.4} />
          <DataFlowDot path="M 55 90 L 175 55" dur={1.7} begin={0.6} />

          {/* Conflicting flows toward chain - some cross */}
          <line x1="200" y1="60" x2="320" y2="75" stroke="rgba(6, 182, 212, 0.3)" strokeWidth="1" markerEnd="url(#oracle-perm-arrow)" strokeDasharray="4 3" />
          <line x1="170" y1="130" x2="320" y2="105" stroke="rgba(6, 182, 212, 0.3)" strokeWidth="1" markerEnd="url(#oracle-perm-arrow)" strokeDasharray="4 3" />
          <line x1="140" y1="155" x2="320" y2="90" stroke="rgba(249, 115, 22, 0.4)" strokeWidth="1" markerEnd="url(#oracle-perm-arrow)" strokeDasharray="4 3" />
          <DataFlowDot path="M 205 62 L 315 78" dur={2.5} begin={0.5} />
          <DataFlowDot path="M 175 128 L 315 108" dur={2.3} begin={0.8} />
          <DataFlowDot path="M 145 153 L 315 92" dur={2.8} begin={1} />

          {/* Chain with question mark - uncertain outcome */}
          <g transform="translate(380, 90)">
            <rect x="-40" y="-30" width="80" height="60" rx="6" fill="rgba(51, 65, 85, 0.5)" stroke="rgba(148, 163, 184, 0.4)" strokeWidth="1.5" strokeDasharray="6 4" />
            <text x="0" y="-5" fill="#94a3b8" fontSize="10" textAnchor="middle">Chain</text>
            <text x="0" y="12" fill="#64748b" fontSize="9" textAnchor="middle">?</text>
          </g>

          {/* Warning / chaos indicator */}
          <text x="240" y="170" fill="#f87171" fontSize="10" textAnchor="middle">Hard to incentivize, punish, or trust</text>
        </svg>
        <p className="oracle-diagram-caption">Anyone joins. Incentives and punishment are hard to design.</p>
    </section>
  )
}
