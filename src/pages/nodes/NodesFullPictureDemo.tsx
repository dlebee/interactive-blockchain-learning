import * as React from 'react'
import './NodesFullPictureDemo.css'

const NODES = 5
const BLOCK_W = 16
const BLOCK_H = 20
const BLOCK_GAP = 3
const NODE_R = 18
const RADIUS = 150
const CENTER_Y = 160
const WIDTH = 550
const HEIGHT = 380

function polarToCart(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) }
}

// Most have same 3 blocks; two have different pending blocks
const CHAIN_CONFIGS: Array<
  | { type: 'canonical' }
  | { type: 'pending'; label: string }
> = [
  { type: 'canonical' },
  { type: 'canonical' },
  { type: 'pending', label: 'A' },
  { type: 'canonical' },
  { type: 'pending', label: 'B' },
]

const CANONICAL_BLOCKS = 3

function renderChain(
  baseX: number,
  baseY: number,
  config: (typeof CHAIN_CONFIGS)[number]
) {
  const elements: React.ReactNode[] = []

  // Shared canonical blocks 0, 1, 2
  for (let i = 0; i < CANONICAL_BLOCKS; i++) {
    const x = baseX + i * (BLOCK_W + BLOCK_GAP)
    elements.push(
      <g key={i}>
        <rect
          x={x}
          y={baseY - BLOCK_H / 2}
          width={BLOCK_W}
          height={BLOCK_H}
          className="chain-block"
        />
        <text x={x + BLOCK_W / 2} y={baseY + 2} className="chain-block-id">
          {i}
        </text>
      </g>
    )
  }

  // Pending block (different for two nodes)
  if (config.type === 'pending') {
    const x = baseX + CANONICAL_BLOCKS * (BLOCK_W + BLOCK_GAP)
    elements.push(
      <g key="pending">
        <rect
          x={x}
          y={baseY - BLOCK_H / 2}
          width={BLOCK_W}
          height={BLOCK_H}
          className="chain-block chain-block-pending"
        />
        <text x={x + BLOCK_W / 2} y={baseY + 2} className="chain-block-id">
          {config.label}
        </text>
      </g>
    )
  }

  return elements
}

export function NodesFullPictureDemo() {
  const centerX = WIDTH / 2
  const positions = Array.from({ length: NODES }, (_, i) =>
    polarToCart(centerX, CENTER_Y, RADIUS, (360 / NODES) * i - 90)
  )

  return (
    <div className="nodes-full-picture-demo">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="nodes-full-picture-svg"
        aria-label="Many nodes each keeping a copy of the blockchain, gossiping messages between them"
      >
        {/* Message flows between nodes */}
        {[
          [0, 1],
          [1, 2],
          [2, 3],
          [3, 4],
          [4, 0],
          [0, 2],
          [1, 3],
        ].flatMap(([a, b], i) => {
          const p1 = positions[a]
          const p2 = positions[b]
          const dur = 2 + i * 0.15
          return [0, 0.8].map((offset, j) => (
            <circle
              key={`msg-${i}-${j}`}
              r="3"
              fill="#06b6d4"
              opacity="0.7"
              className="gossip-dot"
            >
              <animateMotion
                dur={`${dur}s`}
                repeatCount="indefinite"
                begin={`${offset + i * 0.2}s`}
                path={`M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`}
              />
            </circle>
          ))
        })}

        {/* Edges between nodes */}
        {[
          [0, 1],
          [1, 2],
          [2, 3],
          [3, 4],
          [4, 0],
        ].map(([a, b]) => {
          const p1 = positions[a]
          const p2 = positions[b]
          return (
            <line
              key={`edge-${a}-${b}`}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              className="node-edge"
            />
          )
        })}

        {/* Node circles and chains */}
        {positions.map((pos, i) => {
          const config = CHAIN_CONFIGS[i]
          const blockCount =
            config.type === 'canonical' ? CANONICAL_BLOCKS : CANONICAL_BLOCKS + 1
          const chainWidth = blockCount * (BLOCK_W + BLOCK_GAP) - BLOCK_GAP
          const chainX = pos.x - chainWidth / 2
          const chainY = pos.y + NODE_R + 22

          return (
            <g key={`node-${i}`}>
              <circle cx={pos.x} cy={pos.y} r={NODE_R} className="node-circle" />
              <circle
                cx={pos.x}
                cy={pos.y}
                r={NODE_R - 4}
                className="node-inner"
              />
              <g transform={`translate(${chainX}, ${chainY})`}>
                {renderChain(0, 0, config)}
              </g>
            </g>
          )
        })}

        {/* Labels */}
        <text x={centerX} y={CENTER_Y - RADIUS - 25} className="demo-label-header">
          Nodes
        </text>
        <text x={centerX} y={CENTER_Y - RADIUS - 8} className="demo-label-sub">
          each keeps a copy of the chain
        </text>
        <text x={centerX} y={HEIGHT - 15} className="demo-label-footer">
          gossiping · two see different pending blocks
        </text>
      </svg>
    </div>
  )
}
