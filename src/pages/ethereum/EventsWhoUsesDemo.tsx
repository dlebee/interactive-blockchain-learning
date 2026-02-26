import './EventsWhoUsesDemo.css'

const VIEW_W = 920
const VIEW_H = 420

// Left: Contracts container
const CONTRACT_BOX = { x: 30, y: 40, w: 210, h: 200 }
const CONTRACTS = [
  { x: 82, y: 102, label: 'ERC-20 A' },
  { x: 165, y: 102, label: 'ERC-20 B' },
  { x: 82, y: 160, label: 'DEX' },
  { x: 165, y: 160, label: 'Cross-chain' },
]

// Public RPC (left, for users to call contracts)
const PUBLIC_RPC = { x: 120, y: 265 }

// Users (left, call contracts via public RPC)
const USERS_LEFT = [
  { x: 55, y: 320 },
  { x: 120, y: 335 },
  { x: 185, y: 320 },
]

// Right: RPCs stacked
const RPC_X = 350
const RPCS = [
  { x: RPC_X, y: 100 },
  { x: RPC_X, y: 200 },
]

// Each indexer has own DB and Website; grouped as DEX and Explorer (layers: Index -> DB -> Web)
const STACK_BOX_W = 300
const STACK_1 = {
  label: 'DEX',
  box: { x: 450, y: 38, w: STACK_BOX_W, h: 112 },
  indexer: { x: 502, y: 98 },
  db: { x: 595, y: 98 },
  web: { x: 688, y: 98 },
}
const STACK_2 = {
  label: 'Explorer',
  box: { x: 450, y: 157, w: STACK_BOX_W, h: 112 },
  indexer: { x: 502, y: 217 },
  db: { x: 595, y: 217 },
  web: { x: 688, y: 217 },
}

// Users use websites (not DB)
const USERS_WEB = [
  { x: 828, y: 78 },
  { x: 858, y: 212 },
]

// Flows: users -> public RPC -> contracts (calls)
const CALL_FLOWS: Array<{ from: [number, number]; to: [number, number]; dur: number }> = [
  { from: [55, 320], to: [120, 265], dur: 2 },
  { from: [120, 335], to: [120, 265], dur: 2.2 },
  { from: [185, 320], to: [120, 265], dur: 2.1 },
  { from: [120, 265], to: [135, 240], dur: 1.8 },  // Public RPC to contracts (center bottom of box)
]

// Flows: contracts -> RPCs -> indexers -> DB (events)
const EVENT_FLOWS: Array<{ from: [number, number]; to: [number, number]; dur: number }> = [
  { from: [82, 102], to: [RPC_X, 100], dur: 2 },
  { from: [165, 102], to: [RPC_X, 100], dur: 2.1 },
  { from: [82, 160], to: [RPC_X, 200], dur: 2.2 },
  { from: [165, 160], to: [RPC_X, 200], dur: 2.3 },
  { from: [RPC_X, 100], to: [502, 98], dur: 1.8 },
  { from: [RPC_X, 200], to: [502, 217], dur: 1.9 },
  { from: [502, 98], to: [STACK_1.db.x, STACK_1.db.y], dur: 1.7 },
  { from: [502, 217], to: [STACK_2.db.x, STACK_2.db.y], dur: 1.8 },
]

// Flows: DB -> Web (layer flow, website reads from DB)
const DB_TO_WEB: Array<{ from: [number, number]; to: [number, number]; dur: number }> = [
  { from: [STACK_1.db.x, STACK_1.db.y], to: [STACK_1.web.x, STACK_1.web.y], dur: 1.6 },
  { from: [STACK_2.db.x, STACK_2.db.y], to: [STACK_2.web.x, STACK_2.web.y], dur: 1.7 },
]

// Flows: users <-> websites (bidirectional)
const USER_WEB_BIDIR: Array<{ web: [number, number]; user: [number, number]; dur: number }> = [
  { web: [STACK_1.web.x, STACK_1.web.y], user: [828, 78], dur: 1.5 },
  { web: [STACK_2.web.x, STACK_2.web.y], user: [858, 212], dur: 1.6 },
]

const ALL_FLOWS = [...CALL_FLOWS, ...EVENT_FLOWS, ...DB_TO_WEB]

export function EventsWhoUsesDemo() {
  return (
    <div className="events-who-uses-demo">
      <h4 className="events-who-uses-title">
        Who uses events: users call via public RPC, events flow to indexers, users read via websites
      </h4>
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="events-who-uses-svg"
        aria-label="Animation: users call contracts via public RPC, events flow through RPCs and indexers to DBs, users read data via websites"
      >
        <defs>
          <marker
            id="events-arrow"
            markerWidth="8"
            markerHeight="8"
            refX="7"
            refY="4"
            orient="auto"
          >
            <path d="M0,0 L8,4 L0,8" fill="rgba(6, 182, 212, 0.7)" />
          </marker>
          <marker
            id="events-arrow-call"
            markerWidth="8"
            markerHeight="8"
            refX="7"
            refY="4"
            orient="auto"
          >
            <path d="M0,0 L8,4 L0,8" fill="rgba(34, 197, 94, 0.7)" />
          </marker>
        </defs>

        {/* Static connection lines - event flows */}
        {EVENT_FLOWS.concat(DB_TO_WEB).map((f, i) => (
          <line
            key={`line-evt-${i}`}
            x1={f.from[0]}
            y1={f.from[1]}
            x2={f.to[0]}
            y2={f.to[1]}
            className="events-flow-line"
            markerEnd="url(#events-arrow)"
          />
        ))}

        {/* Bidirectional lines: web <-> user */}
        {USER_WEB_BIDIR.map((f, i) => (
          <g key={`bidir-${i}`}>
            <line
              x1={f.web[0]}
              y1={f.web[1]}
              x2={f.user[0]}
              y2={f.user[1]}
              className="events-flow-line events-flow-call"
              markerEnd="url(#events-arrow-call)"
            />
            <line
              x1={f.user[0]}
              y1={f.user[1]}
              x2={f.web[0]}
              y2={f.web[1]}
              className="events-flow-line events-flow-call"
              markerEnd="url(#events-arrow-call)"
            />
          </g>
        ))}

        {/* Static connection lines - call flows (user -> RPC -> contracts) */}
        {CALL_FLOWS.map((f, i) => (
          <line
            key={`line-call-${i}`}
            x1={f.from[0]}
            y1={f.from[1]}
            x2={f.to[0]}
            y2={f.to[1]}
            className="events-flow-line events-flow-call"
            markerEnd="url(#events-arrow-call)"
          />
        ))}

        {/* Moving event dots */}
        {ALL_FLOWS.flatMap((f, i) =>
          [0, 0.5, 1, 1.5].map((offset, j) => (
            <circle
              key={`dot-${i}-${j}`}
              r="4"
              fill={CALL_FLOWS.includes(f) ? '#22c55e' : '#06b6d4'}
              opacity="0.85"
              className="events-flow-dot"
            >
              <animateMotion
                dur={`${f.dur}s`}
                repeatCount="indefinite"
                begin={`${offset + i * 0.1}s`}
                path={`M ${f.from[0]} ${f.from[1]} L ${f.to[0]} ${f.to[1]}`}
              />
              <animate
                attributeName="opacity"
                values="0.4;0.9;0.4"
                dur={`${f.dur}s`}
                repeatCount="indefinite"
                begin={`${offset + i * 0.1}s`}
              />
            </circle>
          ))
        )}
        {/* Bidirectional dots: web <-> user */}
        {USER_WEB_BIDIR.flatMap((f, i) => [
          ...[0, 0.5, 1].map((offset, j) => (
            <circle key={`dot-bidir-a-${i}-${j}`} r="4" fill="#22c55e" opacity="0.85" className="events-flow-dot">
              <animateMotion dur={`${f.dur}s`} repeatCount="indefinite" begin={`${offset + i * 0.15}s`} path={`M ${f.web[0]} ${f.web[1]} L ${f.user[0]} ${f.user[1]}`} />
              <animate attributeName="opacity" values="0.4;0.9;0.4" dur={`${f.dur}s`} repeatCount="indefinite" begin={`${offset + i * 0.15}s`} />
            </circle>
          )),
          ...[0, 0.5, 1].map((offset, j) => (
            <circle key={`dot-bidir-b-${i}-${j}`} r="4" fill="#22c55e" opacity="0.85" className="events-flow-dot">
              <animateMotion dur={`${f.dur}s`} repeatCount="indefinite" begin={`${offset + 0.25 + i * 0.15}s`} path={`M ${f.user[0]} ${f.user[1]} L ${f.web[0]} ${f.web[1]}`} />
              <animate attributeName="opacity" values="0.4;0.9;0.4" dur={`${f.dur}s`} repeatCount="indefinite" begin={`${offset + 0.25 + i * 0.15}s`} />
            </circle>
          )),
        ])}

        {/* Contracts container */}
        <rect
          x={CONTRACT_BOX.x}
          y={CONTRACT_BOX.y}
          width={CONTRACT_BOX.w}
          height={CONTRACT_BOX.h}
          rx="8"
          className="events-container events-contracts-box"
        />
        <text x={CONTRACT_BOX.x + CONTRACT_BOX.w / 2} y={CONTRACT_BOX.y + 22} className="events-container-label">
          Contracts
        </text>
        {CONTRACTS.map((c, i) => (
          <g key={i}>
            <rect
              x={c.x - 38}
              y={c.y - 14}
              width={76}
              height={28}
              rx="6"
              className="events-node events-contract"
            />
            <text x={c.x} y={c.y + 4} className="events-node-label">
              {c.label}
            </text>
          </g>
        ))}

        {/* Public RPC */}
        <text x={120} y={235} className="events-stage-label">
          Public RPC
        </text>
        <circle cx={PUBLIC_RPC.x} cy={PUBLIC_RPC.y} r="24" className="events-node events-rpc events-rpc-public" />
        <text x={PUBLIC_RPC.x} y={PUBLIC_RPC.y + 5} className="events-node-label events-node-label-sm">
          RPC
        </text>

        {/* Users (left, call contracts) */}
        {USERS_LEFT.map((u, i) => (
          <g key={i}>
            <circle cx={u.x} cy={u.y} r="16" className="events-node events-user" />
            <text x={u.x} y={u.y + 5} className="events-node-label events-node-label-xs">
              User
            </text>
          </g>
        ))}

        {/* RPCs stacked */}
        <text x={RPC_X} y={55} className="events-stage-label">
          RPC
        </text>
        {RPCS.map((r, i) => (
          <g key={i}>
            <circle cx={r.x} cy={r.y} r="20" className="events-node events-rpc" />
            <text x={r.x} y={r.y + 5} className="events-node-label events-node-label-sm">
              RPC
            </text>
          </g>
        ))}

        {/* DEX stack: Indexer + DB + Website */}
        <rect
          x={STACK_1.box.x}
          y={STACK_1.box.y}
          width={STACK_1.box.w}
          height={STACK_1.box.h}
          rx="8"
          className="events-container events-stack-box"
        />
        <text
          x={STACK_1.box.x + STACK_1.box.w / 2}
          y={STACK_1.box.y + 20}
          className="events-stack-label events-stack-label-center"
        >
          DEX
        </text>
        {/* Layer separators */}
        <line x1={548} y1={STACK_1.box.y + 36} x2={548} y2={STACK_1.box.y + STACK_1.box.h - 12} className="events-layer-sep" />
        <line x1={641} y1={STACK_1.box.y + 36} x2={641} y2={STACK_1.box.y + STACK_1.box.h - 12} className="events-layer-sep" />
        <rect
          x={STACK_1.indexer.x - 34}
          y={STACK_1.indexer.y - 15}
          width={68}
          height={30}
          rx="6"
          className="events-node events-indexer"
        />
        <text x={STACK_1.indexer.x} y={STACK_1.indexer.y + 5} className="events-node-label events-node-label-sm">
          Index
        </text>
        <rect
          x={STACK_1.db.x - 25}
          y={STACK_1.db.y - 13}
          width={50}
          height={26}
          rx="4"
          className="events-node events-db"
        />
        <text x={STACK_1.db.x} y={STACK_1.db.y + 5} className="events-node-label events-node-label-sm">
          DB
        </text>
        <rect
          x={STACK_1.web.x - 36}
          y={STACK_1.web.y - 15}
          width={72}
          height={30}
          rx="6"
          className="events-node events-web"
        />
        <text x={STACK_1.web.x} y={STACK_1.web.y + 5} className="events-node-label events-node-label-sm">
          Web
        </text>

        {/* Explorer stack: Indexer + DB + Website */}
        <rect
          x={STACK_2.box.x}
          y={STACK_2.box.y}
          width={STACK_2.box.w}
          height={STACK_2.box.h}
          rx="8"
          className="events-container events-stack-box"
        />
        <text
          x={STACK_2.box.x + STACK_2.box.w / 2}
          y={STACK_2.box.y + 20}
          className="events-stack-label events-stack-label-center"
        >
          Explorer
        </text>
        {/* Layer separators */}
        <line x1={548} y1={STACK_2.box.y + 36} x2={548} y2={STACK_2.box.y + STACK_2.box.h - 12} className="events-layer-sep" />
        <line x1={641} y1={STACK_2.box.y + 36} x2={641} y2={STACK_2.box.y + STACK_2.box.h - 12} className="events-layer-sep" />
        <rect
          x={STACK_2.indexer.x - 34}
          y={STACK_2.indexer.y - 15}
          width={68}
          height={30}
          rx="6"
          className="events-node events-indexer"
        />
        <text x={STACK_2.indexer.x} y={STACK_2.indexer.y + 5} className="events-node-label events-node-label-sm">
          Index
        </text>
        <rect
          x={STACK_2.db.x - 25}
          y={STACK_2.db.y - 13}
          width={50}
          height={26}
          rx="4"
          className="events-node events-db"
        />
        <text x={STACK_2.db.x} y={STACK_2.db.y + 5} className="events-node-label events-node-label-sm">
          DB
        </text>
        <rect
          x={STACK_2.web.x - 36}
          y={STACK_2.web.y - 15}
          width={72}
          height={30}
          rx="6"
          className="events-node events-web"
        />
        <text x={STACK_2.web.x} y={STACK_2.web.y + 5} className="events-node-label events-node-label-sm">
          Web
        </text>

        {/* Users (right, use websites) */}
        {USERS_WEB.map((u, i) => (
          <g key={i}>
            <circle cx={u.x} cy={u.y} r="14" className="events-node events-user" />
            <text x={u.x} y={u.y + 4} className="events-node-label events-node-label-xs">
              User
            </text>
          </g>
        ))}
      </svg>
      <p className="events-who-uses-caption">
        Users call contracts via a public RPC. Events flow through RPC nodes to indexers. A DEX
        (e.g. Uniswap) and a block explorer (e.g. Etherscan) each run their own indexer, DB, and
        website. Users read data through the website, not directly from the database.
      </p>
    </div>
  )
}
