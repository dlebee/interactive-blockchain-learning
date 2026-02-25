import { useState } from 'react'
import './GossipInOutDemo.css'

// Directed edges: from -> to. Node i has out-peers and in-peers.
const EDGES: [number, number][] = [
  [0, 1], [0, 2], [1, 2], [1, 3], [2, 3], [2, 4], [3, 4], [3, 0], [4, 0],
]

const NODES = 5
const LABELS = ['A', 'B', 'C', 'D', 'E']
const RADIUS = 140
const CENTER_X = 300
const CENTER_Y = 180
const VIEW_W = 600
const VIEW_H = 420

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) }
}

const positions = Array.from({ length: NODES }, (_, i) =>
  polar(CENTER_X, CENTER_Y, RADIUS, (360 / NODES) * i - 90)
)

function getInOut(node: number) {
  const inPeers = EDGES.filter(([, to]) => to === node).map(([f]) => f)
  const outPeers = EDGES.filter(([from]) => from === node).map(([, t]) => t)
  return { inPeers, outPeers }
}

export function GossipInOutDemo() {
  const [focus, setFocus] = useState<number | null>(2) // Default C
  const focusData = focus !== null ? getInOut(focus) : null

  return (
    <div
      className="gossip-inout-demo"
      onMouseLeave={() => setFocus(2)}
    >
      <div className="gossip-inout-container">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="gossip-inout-svg"
          aria-label="P2P graph with in-peers and out-peers for each node"
        >
          <defs>
            <marker id="arrow-in" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8" fill="rgba(34, 197, 94, 0.9)" />
            </marker>
            <marker id="arrow-out" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8" fill="rgba(249, 115, 22, 0.9)" />
            </marker>
            <marker id="arrow-neutral" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8" fill="rgba(6, 182, 212, 0.5)" />
            </marker>
          </defs>

          {/* Edges: color by role when a node is focused */}
          {EDGES.map(([from, to]) => {
            const p1 = positions[from]
            const p2 = positions[to]
            const dx = p2.x - p1.x
            const dy = p2.y - p1.y
            const len = Math.sqrt(dx * dx + dy * dy)
            const ux = dx / len
            const uy = dy / len
            const endOffset = 20
            const endX = p2.x - ux * endOffset
            const endY = p2.y - uy * endOffset

            let edgeClass = 'peer-edge peer-edge-neutral'
            let marker = 'url(#arrow-neutral)'
            if (focus !== null) {
              if (to === focus) {
                edgeClass = 'peer-edge peer-edge-in'
                marker = 'url(#arrow-in)'
              } else if (from === focus) {
                edgeClass = 'peer-edge peer-edge-out'
                marker = 'url(#arrow-out)'
              } else {
                edgeClass = 'peer-edge peer-edge-dim'
                marker = 'url(#arrow-neutral)'
              }
            }

            return (
              <line
                key={`edge-${from}-${to}`}
                x1={p1.x}
                y1={p1.y}
                x2={endX}
                y2={endY}
                className={edgeClass}
                markerEnd={marker}
              />
            )
          })}

          {/* Message dots (only on highlighted edges when focused, or all when not) */}
          {EDGES.flatMap(([from, to], ei) => {
            const show = focus === null || from === focus || to === focus
            if (!show) return []
            const p1 = positions[from]
            const p2 = positions[to]
            const dur = 2.5 + ei * 0.2
            return [0, 0.8].map((offset, ji) => (
              <circle key={`msg-${ei}-${ji}`} r="4" fill="#06b6d4" opacity="0.85">
                <animateMotion
                  dur={`${dur}s`}
                  repeatCount="indefinite"
                  begin={`${offset + ei * 0.12}s`}
                  path={`M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`}
                />
              </circle>
            ))
          })}

          {/* Nodes */}
          {positions.map((pos, i) => (
            <g key={i}>
              <circle
                cx={pos.x}
                cy={pos.y}
                r="24"
                className={`peer-node ${focus === i ? 'peer-node-focus' : ''}`}
                onMouseEnter={() => setFocus(i)}
                onFocus={() => setFocus(i)}
                tabIndex={0}
              />
              <text x={pos.x} y={pos.y + 6} className="peer-label">
                {LABELS[i]}
              </text>
            </g>
          ))}

          {/* Legend */}
          <text x={CENTER_X} y={VIEW_H - 24} className="gossip-legend">
            Hover a node to see its in-peers (green) and out-peers (orange)
          </text>
        </svg>

        {/* Callout panel */}
        <div className="gossip-inout-callout">
          {focusData ? (
            <>
              <h4>Node {LABELS[focus!]}</h4>
              <div className="callout-row callout-in">
                <span className="callout-label">In-peers (receive from)</span>
                <span className="callout-peers">
                  {focusData.inPeers.length ? focusData.inPeers.map((i) => LABELS[i]).join(', ') : 'none'}
                </span>
                <span className="callout-hint">Arrows pointing to this node</span>
              </div>
              <div className="callout-row callout-out">
                <span className="callout-label">Out-peers (send to)</span>
                <span className="callout-peers">
                  {focusData.outPeers.length ? focusData.outPeers.map((i) => LABELS[i]).join(', ') : 'none'}
                </span>
                <span className="callout-hint">Arrows pointing away</span>
              </div>
            </>
          ) : (
            <p className="callout-placeholder">Hover a node to see its in-peers and out-peers</p>
          )}
        </div>
      </div>
    </div>
  )
}
