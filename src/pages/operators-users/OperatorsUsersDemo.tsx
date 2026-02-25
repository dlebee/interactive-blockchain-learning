import './OperatorsUsersDemo.css'

const CENTER_X = 300
const CENTER_Y = 300
const OPERATOR_RADIUS = 175
const USER_RADIUS = 270
const NODES = 6

const BLOCK_WIDTH = 34
const BLOCK_HEIGHT = 40
const BLOCK_GAP = 10
const CANONICAL_COUNT = 4
const CHAIN_Y = CENTER_Y
const PENDING_GAP = 8
const chainSpanToPending = (CANONICAL_COUNT - 1) * (BLOCK_WIDTH + BLOCK_GAP) + BLOCK_GAP * PENDING_GAP
const CHAIN_START_X = CENTER_X - chainSpanToPending / 2
const PENDING_BLOCK_X = CHAIN_START_X + chainSpanToPending
const PENDING_BLOCK_Y = CHAIN_Y

function polarToCart(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) }
}

const operatorPositions = Array.from({ length: NODES }, (_, i) =>
  polarToCart(CENTER_X, CENTER_Y, OPERATOR_RADIUS, (360 / NODES) * i)
)

const userPositions = Array.from({ length: NODES }, (_, i) =>
  polarToCart(CENTER_X, CENTER_Y, USER_RADIUS, (360 / NODES) * i)
)

export function OperatorsUsersDemo() {
  return (
    <div className="operators-users-demo">
      <svg
        viewBox="0 0 600 600"
        className="operators-users-svg"
        aria-label="Network diagram: operators in a mesh, users submitting transactions, canonical blocks and pending block"
      >
        <defs>
          <linearGradient id="txGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="p2pGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#22c55e" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* Operator mesh edges */}
        {operatorPositions.map((_, i) => {
          const next = (i + 1) % NODES
          const p1 = operatorPositions[i]
          const p2 = operatorPositions[next]
          return (
            <line
              key={`op-${i}-${next}`}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              className="mesh-edge"
            />
          )
        })}

        {/* User to operator edges */}
        {userPositions.map((_, i) => {
          const user = userPositions[i]
          const operator = operatorPositions[i]
          return (
            <line
              key={`user-op-${i}`}
              x1={user.x}
              y1={user.y}
              x2={operator.x}
              y2={operator.y}
              className="user-edge"
            />
          )
        })}

        {/* Canonical blocks */}
        {Array.from({ length: CANONICAL_COUNT }, (_, i) => {
          const x = CHAIN_START_X + i * (BLOCK_WIDTH + BLOCK_GAP)
          return (
            <g key={`canonical-${i}`}>
              <rect
                x={x - BLOCK_WIDTH / 2}
                y={CHAIN_Y - BLOCK_HEIGHT / 2}
                width={BLOCK_WIDTH}
                height={BLOCK_HEIGHT}
                className="block-canonical"
              />
              <text x={x} y={CHAIN_Y} className="block-id">{i}</text>
              {i > 0 && (
                <line
                  x1={x - BLOCK_WIDTH / 2 - BLOCK_GAP}
                  y1={CHAIN_Y}
                  x2={x - BLOCK_WIDTH / 2}
                  y2={CHAIN_Y}
                  className="block-connector"
                />
              )}
            </g>
          )
        })}

        {/* Connector from last canonical to pending */}
        <line
          x1={CHAIN_START_X + (CANONICAL_COUNT - 1) * (BLOCK_WIDTH + BLOCK_GAP) + BLOCK_WIDTH / 2}
          y1={CHAIN_Y}
          x2={PENDING_BLOCK_X - BLOCK_WIDTH / 2 - BLOCK_GAP}
          y2={PENDING_BLOCK_Y}
          className="block-connector"
        />

        {/* Pending block: unauthored, collecting transactions */}
        <rect
          x={PENDING_BLOCK_X - BLOCK_WIDTH / 2}
          y={PENDING_BLOCK_Y - BLOCK_HEIGHT / 2}
          width={BLOCK_WIDTH}
          height={BLOCK_HEIGHT}
          className="block-pending"
        />
        {/* Tiny transaction dots inside pending block */}
        {[
          [-6, -4],
          [0, 4],
          [6, -2],
        ].map(([dx, dy], idx) => (
          <circle
            key={`pending-tx-${idx}`}
            cx={PENDING_BLOCK_X + dx}
            cy={PENDING_BLOCK_Y + dy}
            r="2"
            fill="#06b6d4"
            opacity="0.6"
            className="pending-tx-dot"
          />
        ))}
        <text x={PENDING_BLOCK_X} y={PENDING_BLOCK_Y} className="block-id block-id-pending">?</text>

        {/* Animated transaction flows: user to operator */}
        {userPositions.flatMap((_, i) => {
          const user = userPositions[i]
          const operator = operatorPositions[i]
          const dur = 1.4 + i * 0.2
          return [0, 0.6, 1.2].map((offset, j) => (
            <circle
              key={`tx-user-op-${i}-${j}`}
              r="4"
              fill="#06b6d4"
              opacity="0.9"
              className="tx-dot"
            >
              <animateMotion
                dur={`${dur}s`}
                repeatCount="indefinite"
                begin={`${offset}s`}
                path={`M ${user.x} ${user.y} L ${operator.x} ${operator.y}`}
              />
              <animate
                attributeName="opacity"
                values="0.4;1;0.4"
                dur={`${dur}s`}
                repeatCount="indefinite"
                begin={`${offset}s`}
              />
            </circle>
          ))
        })}

        {/* Thin P2P lines inside hexagon, many directions */}
        {[
          [0, 2],
          [0, 3],
          [0, 4],
          [1, 3],
          [1, 4],
          [1, 5],
          [2, 4],
          [2, 5],
          [3, 5],
        ].map(([a, b]) => {
          const p1 = operatorPositions[a]
          const p2 = operatorPositions[b]
          return (
            <line
              key={`p2p-inner-${a}-${b}`}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              className="p2p-inner-line"
            />
          )
        })}

        {/* Green P2P messages along inner lines (various directions) */}
        {[
          [0, 3],
          [1, 4],
          [2, 5],
          [3, 0],
          [4, 1],
          [5, 2],
          [0, 2],
          [0, 4],
          [1, 3],
          [1, 5],
          [2, 4],
          [2, 5],
          [3, 5],
        ].flatMap(([a, b], i) => {
          const p1 = operatorPositions[a]
          const p2 = operatorPositions[b]
          const dur = 2.2 + i * 0.1
          return [0, 0.8].map((offset, j) => (
            <circle key={`p2p-msg-${i}-${j}`} r="2" fill="#22c55e" opacity="0.5" className="p2p-dot">
              <animateMotion
                dur={`${dur}s`}
                repeatCount="indefinite"
                begin={`${offset + i * 0.15}s`}
                path={`M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`}
              />
            </circle>
          ))
        })}

        {/* Cyan transactions converge toward block-producing operator (0) along mesh */}
        {[
          [2, 0],
          [3, 0],
          [4, 0],
        ].flatMap(([a, b], i) => {
          const p1 = operatorPositions[a]
          const p2 = operatorPositions[b]
          const dur = 1.8 + i * 0.15
          return [0, 0.5, 1].map((offset, j) => (
            <circle
              key={`tx-converge-${i}-${j}`}
              r="3"
              fill="#06b6d4"
              opacity="0.85"
              className="tx-dot"
            >
              <animateMotion
                dur={`${dur}s`}
                repeatCount="indefinite"
                begin={`${offset + i * 0.25}s`}
                path={`M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`}
              />
              <animate
                attributeName="opacity"
                values="0.4;0.9;0.4"
                dur={`${dur}s`}
                repeatCount="indefinite"
                begin={`${offset + i * 0.25}s`}
              />
            </circle>
          ))
        })}

        {/* Single operator sends transactions to pending block */}
        {[0, 0.4, 0.8, 1.2].map((offset, j) => {
          const operator = operatorPositions[0]
          return (
            <circle
              key={`tx-op-pending-${j}`}
              r="4"
              fill="#06b6d4"
              opacity="0.9"
              className="tx-dot"
            >
              <animateMotion
                dur="1.8s"
                repeatCount="indefinite"
                begin={`${offset}s`}
                path={`M ${operator.x} ${operator.y} L ${PENDING_BLOCK_X} ${PENDING_BLOCK_Y}`}
              />
              <animate
                attributeName="opacity"
                values="0.4;1;0.4"
                dur="1.8s"
                repeatCount="indefinite"
                begin={`${offset}s`}
              />
            </circle>
          )
        })}

        {/* Operator nodes */}
        {operatorPositions.map((pos, i) => {
          const isProducer = i === 0
          return (
            <g key={`op-node-${i}`}>
              <circle
                cx={pos.x}
                cy={pos.y}
                r="12"
                className={isProducer ? 'operator-node operator-node-producer' : 'operator-node'}
              />
              <circle
                cx={pos.x}
                cy={pos.y}
                r="8"
                className="operator-node-inner"
              />
            </g>
          )
        })}

        {/* User nodes */}
        {userPositions.map((pos, i) => (
          <g key={`user-node-${i}`}>
            <circle cx={pos.x} cy={pos.y} r="14" className="user-node" />
            <circle cx={pos.x} cy={pos.y} r="8" className="user-node-inner" />
          </g>
        ))}

        {/* Labels */}
        <text x={CENTER_X} y={CENTER_Y - OPERATOR_RADIUS - 18} className="mesh-label">
          Operators (P2P mesh)
        </text>
        <text x={CENTER_X} y={CENTER_Y + USER_RADIUS + 18} className="user-label">
          Users (submit transactions)
        </text>
        <text x={CENTER_X} y={CHAIN_Y - BLOCK_HEIGHT / 2 - 8} className="chain-label">
          Canonical chain
        </text>
        <text x={PENDING_BLOCK_X} y={PENDING_BLOCK_Y - BLOCK_HEIGHT / 2 - 8} className="pending-label">
          Pending
        </text>
      </svg>
      <p className="operators-users-legend">
        <span className="legend-dot operator-dot" /> Operators ·{' '}
        <span className="legend-dot producer-dot" /> Block producer ·{' '}
        <span className="legend-dot user-dot" /> Users ·{' '}
        <span className="legend-dot tx-dot" /> Transactions
      </p>
    </div>
  )
}
