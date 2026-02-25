import './NodesP2PDemo.css'

const CENTER_X = 300
const CENTER_Y = 300
const NODE_RADIUS = 175
const NODES = 10

function polarToCart(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) }
}

const nodePositions = Array.from({ length: NODES }, (_, i) =>
  polarToCart(CENTER_X, CENTER_Y, NODE_RADIUS, (360 / NODES) * i)
)

function getDiagonalPairs(n: number, steps: number[]) {
  const pairs: [number, number][] = []
  const seen = new Set<string>()
  for (let i = 0; i < n; i++) {
    for (const k of steps) {
      const j = (i + k) % n
      const key = i < j ? `${i}-${j}` : `${j}-${i}`
      if (!seen.has(key)) {
        seen.add(key)
        pairs.push([i, j])
      }
    }
  }
  return pairs
}

const innerPairs = getDiagonalPairs(NODES, [2, 3])
const messagePairs = [
  ...innerPairs,
  ...innerPairs.map(([a, b]) => [b, a] as [number, number]),
]

export function NodesP2PDemo() {
  return (
    <div className="nodes-p2p-demo">
      <svg
        viewBox="0 0 600 600"
        className="nodes-p2p-svg"
        aria-label="P2P network: nodes connected in a mesh, messages flowing between them"
      >
        {/* Polygon mesh edges */}
        {nodePositions.map((_, i) => {
          const next = (i + 1) % NODES
          const p1 = nodePositions[i]
          const p2 = nodePositions[next]
          return (
            <line
              key={`edge-${i}-${next}`}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              className="mesh-edge"
            />
          )
        })}

        {/* Thin inner lines */}
        {innerPairs.map(([a, b]) => {
          const p1 = nodePositions[a]
          const p2 = nodePositions[b]
          return (
            <line
              key={`inner-${a}-${b}`}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              className="p2p-inner-line"
            />
          )
        })}

        {/* Messages flowing in many directions */}
        {messagePairs.flatMap(([a, b], i) => {
          const p1 = nodePositions[a]
          const p2 = nodePositions[b]
          const dur = 2.2 + i * 0.1
          return [0, 1].map((offset, j) => (
            <circle
              key={`msg-${i}-${j}`}
              r="3"
              fill="#06b6d4"
              opacity="0.6"
              className="p2p-message"
            >
              <animateMotion
                dur={`${dur}s`}
                repeatCount="indefinite"
                begin={`${offset + i * 0.12}s`}
                path={`M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`}
              />
              <animate
                attributeName="opacity"
                values="0.3;0.7;0.3"
                dur={`${dur}s`}
                repeatCount="indefinite"
                begin={`${offset + i * 0.12}s`}
              />
            </circle>
          ))
        })}

        {/* Node circles */}
        {nodePositions.map((pos, i) => (
          <g key={`node-${i}`}>
            <circle cx={pos.x} cy={pos.y} r="14" className="node-outer" />
            <circle cx={pos.x} cy={pos.y} r="9" className="node-inner" />
          </g>
        ))}

        {/* Labels */}
        <text
          x={CENTER_X}
          y={CENTER_Y - NODE_RADIUS - 30}
          className="nodes-p2p-label nodes-p2p-label-header"
        >
          Nodes
        </text>
        <text
          x={CENTER_X}
          y={CENTER_Y - NODE_RADIUS - 14}
          className="nodes-p2p-label nodes-p2p-label-sub"
        >
          P2P mesh, gossip messages
        </text>
      </svg>
      <p className="nodes-p2p-legend">
        <span className="legend-dot node-dot" /> Nodes ·{' '}
        <span className="legend-dot msg-dot" /> Messages
      </p>
    </div>
  )
}
