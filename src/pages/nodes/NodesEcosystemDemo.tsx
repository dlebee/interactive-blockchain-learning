import './NodesEcosystemDemo.css'

const CENTER_X = 270
const CENTER_Y = 250
const P2P_RADIUS = 75
const RPC_RADIUS = 170
const USER_RADIUS = 245
const P2P_NODES = 6
const RPC_NODES = 6
const USER_NODES = 6
const WIDTH = 680
const HEIGHT = 500

function polarToCart(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) }
}

const p2pPositions = Array.from({ length: P2P_NODES }, (_, i) =>
  polarToCart(CENTER_X, CENTER_Y, P2P_RADIUS, (360 / P2P_NODES) * i)
)
const rpcPositions = Array.from({ length: RPC_NODES }, (_, i) =>
  polarToCart(CENTER_X, CENTER_Y, RPC_RADIUS, (360 / RPC_NODES) * i)
)
const userPositions = Array.from({ length: USER_NODES }, (_, i) =>
  polarToCart(CENTER_X, CENTER_Y, USER_RADIUS, (360 / USER_NODES) * i)
)

// Explorer flow positions (right side)
const DEDICATED_RPC = { x: 440, y: 100 }
const EXPLORER = { x: 520, y: 100 }
const WEB = { x: 520, y: 210 }

// P2P inner pairs for gossip (block authors)
const p2pPairs: [number, number][] = [
  [0, 2], [0, 3], [1, 3], [1, 4], [2, 4], [2, 5], [3, 5], [0, 4], [1, 5],
]
// RPC ring pairs (RPC nodes gossip with each other)
const rpcPairs: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0],
  [0, 2], [1, 3], [2, 4], [3, 5], [4, 0], [5, 1],
]

// Block authors: 5 full, 1 archive (index 2)
const P2P_ARCHIVE_INDEX = 2
// RPC ring: 4 full, 2 archive (indices 1 and 4)
const RPC_ARCHIVE_INDICES = new Set([1, 4])

export function NodesEcosystemDemo() {
  return (
    <div className="nodes-ecosystem-demo">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="nodes-ecosystem-svg"
        aria-label="Blockchain ecosystem: block authors in P2P center, RPC nodes, users, explorers and web"
      >
        {/* P2P mesh edges (center: block authors) */}
        {p2pPositions.map((_, i) => {
          const next = (i + 1) % P2P_NODES
          const p1 = p2pPositions[i]
          const p2 = p2pPositions[next]
          return (
            <line
              key={`p2p-edge-${i}`}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              className="ecosystem-mesh-edge"
            />
          )
        })}
        {p2pPairs.map(([a, b]) => {
          const p1 = p2pPositions[a]
          const p2 = p2pPositions[b]
          return (
            <line
              key={`p2p-inner-${a}-${b}`}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              className="ecosystem-p2p-inner"
            />
          )
        })}

        {/* RPC to P2P mesh connections (RPC is part of P2P, same mesh style) */}
        {rpcPositions.map((_, i) => {
          const rpc = rpcPositions[i]
          const p2p = p2pPositions[i % P2P_NODES]
          return (
            <line
              key={`rpc-p2p-${i}`}
              x1={rpc.x}
              y1={rpc.y}
              x2={p2p.x}
              y2={p2p.y}
              className="ecosystem-p2p-mesh-edge"
            />
          )
        })}

        {/* RPC ring mesh (RPC nodes gossip with each other) */}
        {rpcPairs.map(([a, b]) => {
          const p1 = rpcPositions[a]
          const p2 = rpcPositions[b]
          return (
            <line
              key={`rpc-mesh-${a}-${b}`}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              className="ecosystem-rpc-mesh-edge"
            />
          )
        })}

        {/* User to RPC connections */}
        {userPositions.map((_, i) => {
          const user = userPositions[i]
          const rpc = rpcPositions[i % RPC_NODES]
          return (
            <line
              key={`user-rpc-${i}`}
              x1={user.x}
              y1={user.y}
              x2={rpc.x}
              y2={rpc.y}
              className="ecosystem-user-rpc-edge"
            />
          )
        })}

        {/* Explorer flow: P2P to Dedicated RPC (Explorer pulls data from P2P) */}
        <line
          x1={CENTER_X + P2P_RADIUS * 0.6}
          y1={CENTER_Y - P2P_RADIUS * 0.5}
          x2={DEDICATED_RPC.x}
          y2={DEDICATED_RPC.y}
          className="ecosystem-dedicated-p2p-edge"
        />
        {/* Dedicated RPC to Explorer */}
        <line
          x1={DEDICATED_RPC.x}
          y1={DEDICATED_RPC.y}
          x2={EXPLORER.x}
          y2={EXPLORER.y}
          className="ecosystem-explorer-edge"
        />
        {/* Explorer to Web */}
        <line
          x1={EXPLORER.x}
          y1={EXPLORER.y}
          x2={WEB.x}
          y2={WEB.y}
          className="ecosystem-explorer-edge"
        />
        {/* Web to Users */}
        <line
          x1={WEB.x}
          y1={WEB.y}
          x2={userPositions[0].x}
          y2={userPositions[0].y}
          className="ecosystem-web-user-edge"
        />
        <line
          x1={WEB.x}
          y1={WEB.y}
          x2={userPositions[5].x}
          y2={userPositions[5].y}
          className="ecosystem-web-user-edge"
        />

        {/* P2P gossip animation (block authors) */}
        {p2pPairs.flatMap(([a, b], i) => {
          const p1 = p2pPositions[a]
          const p2 = p2pPositions[b]
          const dur = 2 + i * 0.12
          return [0, 0.7].map((offset, j) => (
            <circle key={`p2p-msg-${i}-${j}`} r="2" fill="#22c55e" opacity="0.6">
              <animateMotion
                dur={`${dur}s`}
                repeatCount="indefinite"
                begin={`${offset + i * 0.15}s`}
                path={`M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`}
              />
            </circle>
          ))
        })}

        {/* RPC to P2P gossip (RPC nodes gossip with block authors, same style) */}
        {rpcPositions.map((_, i) => {
          const rpc = rpcPositions[i]
          const p2p = p2pPositions[i % P2P_NODES]
          const dur = 2 + i * 0.1
          return [0, 0.7].map((offset, j) => (
            <circle key={`rpc-p2p-gossip-${i}-${j}`} r="2" fill="#22c55e" opacity="0.6">
              <animateMotion
                dur={`${dur}s`}
                repeatCount="indefinite"
                begin={`${offset + i * 0.12}s`}
                path={`M ${rpc.x} ${rpc.y} L ${p2p.x} ${p2p.y}`}
              />
            </circle>
          ))
        })}

        {/* RPC ring gossip (RPC nodes gossip with each other) */}
        {rpcPairs.flatMap(([a, b], i) => {
          const p1 = rpcPositions[a]
          const p2 = rpcPositions[b]
          const dur = 2.2 + i * 0.1
          return [0, 0.8].map((offset, j) => (
            <circle key={`rpc-gossip-${i}-${j}`} r="2" fill="#22c55e" opacity="0.6">
              <animateMotion
                dur={`${dur}s`}
                repeatCount="indefinite"
                begin={`${offset + i * 0.1}s`}
                path={`M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`}
              />
            </circle>
          ))
        })}

        {/* User to RPC: tx/submit flow */}
        {userPositions.map((_, i) => {
          const user = userPositions[i]
          const rpc = rpcPositions[i % RPC_NODES]
          const dur = 1.6 + i * 0.18
          return [0, 0.5, 1].map((offset, j) => (
            <circle key={`user-rpc-flow-${i}-${j}`} r="3" fill="#f59e0b" opacity="0.85">
              <animateMotion
                dur={`${dur}s`}
                repeatCount="indefinite"
                begin={`${offset}s`}
                path={`M ${user.x} ${user.y} L ${rpc.x} ${rpc.y}`}
              />
              <animate
                attributeName="opacity"
                values="0.4;0.95;0.4"
                dur={`${dur}s`}
                repeatCount="indefinite"
                begin={`${offset}s`}
              />
            </circle>
          ))
        })}

        {/* Explorer flow: P2P to Dedicated RPC (data flows from P2P to Explorer) */}
        {[0, 0.8, 1.6].map((offset, j) => (
          <circle key={`dedicated-p2p-${j}`} r="2" fill="#22c55e" opacity="0.6">
            <animateMotion
              dur="2.2s"
              repeatCount="indefinite"
              begin={`${offset}s`}
              path={`M ${CENTER_X + P2P_RADIUS * 0.6} ${CENTER_Y - P2P_RADIUS * 0.5} L ${DEDICATED_RPC.x} ${DEDICATED_RPC.y}`}
            />
          </circle>
        ))}

        {/* Explorer flow: P2P → Dedicated RPC → Explorer → Web (data pulled to users) */}
        {[0, 1.2].map((offset, j) => (
          <circle key={`explorer-flow-${j}`} r="3" fill="#8b5cf6" opacity="0.85">
            <animateMotion
              dur="3s"
              repeatCount="indefinite"
              begin={`${offset}s`}
              path={`M ${DEDICATED_RPC.x} ${DEDICATED_RPC.y} L ${EXPLORER.x} ${EXPLORER.y} L ${WEB.x} ${WEB.y}`}
            />
          </circle>
        ))}

        {/* Web to Users (visit flow) */}
        {[0, 1.5].map((offset, j) => (
          <circle key={`web-user-0-${j}`} r="3" fill="#8b5cf6" opacity="0.7">
            <animateMotion
              dur="2.5s"
              repeatCount="indefinite"
              begin={`${offset}s`}
              path={`M ${WEB.x} ${WEB.y} L ${userPositions[0].x} ${userPositions[0].y}`}
            />
          </circle>
        ))}
        {[0.3, 1.8].map((offset, j) => (
          <circle key={`web-user-5-${j}`} r="3" fill="#8b5cf6" opacity="0.7">
            <animateMotion
              dur="2.5s"
              repeatCount="indefinite"
              begin={`${offset}s`}
              path={`M ${WEB.x} ${WEB.y} L ${userPositions[5].x} ${userPositions[5].y}`}
            />
          </circle>
        ))}

        {/* Block author nodes (center P2P): most full, one archive */}
        {p2pPositions.map((pos, i) => {
          const isArchive = i === P2P_ARCHIVE_INDEX
          return (
            <g key={`p2p-${i}`}>
              <circle
                cx={pos.x}
                cy={pos.y}
                r="10"
                className={
                  isArchive ? 'ecosystem-p2p-node ecosystem-p2p-node-archive' : 'ecosystem-p2p-node'
                }
              />
              <circle
                cx={pos.x}
                cy={pos.y}
                r="6"
                className={
                  isArchive ? 'ecosystem-p2p-node-inner ecosystem-p2p-node-inner-archive' : 'ecosystem-p2p-node-inner'
                }
              />
              {isArchive && (
                <text x={pos.x} y={pos.y + 20} className="ecosystem-archive-badge">
                  archive
                </text>
              )}
            </g>
          )
        })}

        {/* RPC nodes: some archive, some full */}
        {rpcPositions.map((pos, i) => {
          const isArchive = RPC_ARCHIVE_INDICES.has(i)
          return (
            <g key={`rpc-${i}`}>
              <circle
                cx={pos.x}
                cy={pos.y}
                r="11"
                className={
                  isArchive ? 'ecosystem-rpc-node ecosystem-rpc-node-archive' : 'ecosystem-rpc-node'
                }
              />
              <circle
                cx={pos.x}
                cy={pos.y}
                r="7"
                className={
                  isArchive ? 'ecosystem-rpc-node-inner ecosystem-rpc-node-inner-archive' : 'ecosystem-rpc-node-inner'
                }
              />
              {isArchive && (
                <text x={pos.x} y={pos.y + 18} className="ecosystem-archive-badge">
                  archive
                </text>
              )}
            </g>
          )
        })}

        {/* User nodes */}
        {userPositions.map((pos, i) => (
          <g key={`user-${i}`}>
            <circle cx={pos.x} cy={pos.y} r="10" className="ecosystem-user-node" />
            <circle cx={pos.x} cy={pos.y} r="6" className="ecosystem-user-node-inner" />
          </g>
        ))}

        {/* Explorer flow nodes */}
        <g>
          <rect
            x={DEDICATED_RPC.x - 36}
            y={DEDICATED_RPC.y - 18}
            width="72"
            height="36"
            rx="4"
            className="ecosystem-box ecosystem-dedicated-rpc"
          />
          <text x={DEDICATED_RPC.x} y={DEDICATED_RPC.y - 4} className="ecosystem-box-label">
            Dedicated RPC
          </text>
          <text x={DEDICATED_RPC.x} y={DEDICATED_RPC.y + 8} className="ecosystem-box-label ecosystem-archive-label">
            (archive)
          </text>
        </g>
        <g>
          <rect
            x={EXPLORER.x - 28}
            y={EXPLORER.y - 12}
            width="56"
            height="24"
            rx="4"
            className="ecosystem-box ecosystem-explorer"
          />
          <text x={EXPLORER.x} y={EXPLORER.y + 2} className="ecosystem-box-label">
            Explorer
          </text>
        </g>
        <g>
          <rect
            x={WEB.x - 24}
            y={WEB.y - 12}
            width="48"
            height="24"
            rx="4"
            className="ecosystem-box ecosystem-web"
          />
          <text x={WEB.x} y={WEB.y + 2} className="ecosystem-box-label">
            Web
          </text>
        </g>

        {/* Labels */}
        <text x={CENTER_X} y={CENTER_Y - P2P_RADIUS - 18} className="ecosystem-label-header">
          Block authors
        </text>
        <text x={CENTER_X} y={CENTER_Y - P2P_RADIUS - 4} className="ecosystem-label-sub">
          P2P mesh, consensus
        </text>
        <text x={CENTER_X} y={CENTER_Y + RPC_RADIUS + 12} className="ecosystem-label-mid">
          RPC nodes (P2P peers, outer layer)
        </text>
        <text x={CENTER_X} y={CENTER_Y + USER_RADIUS + 20} className="ecosystem-label-header">
          Users
        </text>
        <text x={CENTER_X} y={CENTER_Y + USER_RADIUS + 34} className="ecosystem-label-sub">
          Wallets, dApps
        </text>
      </svg>
      <p className="nodes-ecosystem-legend">
        <span className="legend-dot p2p-dot" /> Block authors (most full) ·{' '}
        <span className="legend-dot p2p-archive-dot" /> Archive validator ·{' '}
        <span className="legend-dot rpc-dot" /> RPC full ·{' '}
        <span className="legend-dot rpc-archive-dot" /> RPC archive
        <br />
        <span className="legend-dot user-dot" /> Users ·{' '}
        <span className="legend-dot tx-dot" /> Tx ·{' '}
        <span className="legend-dot explorer-dot" /> Explorer → Web
      </p>
    </div>
  )
}
