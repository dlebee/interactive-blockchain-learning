import { useState, useEffect } from 'react'
import { ConsensusLeaderlessDemo } from './ConsensusLeaderlessDemo'
import './ConsensusWhoDemo.css'

const NODES = ['A', 'B', 'C']
const SLOT_COUNT = 8

export function ConsensusWhoDemo() {
  const [slotIndex, setSlotIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setSlotIndex((i) => (i + 1) % SLOT_COUNT)
    }, 1200)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="consensus-who-demo">
      <div className="who-section">
        <ConsensusLeaderlessDemo />
      </div>

      <div className="who-section">
        <h4 className="who-section-title">Leader election (turns)</h4>
        <p className="who-caption">
          One node is chosen per slot; they take turns.
        </p>
        <div className="turns-row">
          {NODES.map((node, i) => (
            <div
              key={node}
              className={`turns-node ${i === slotIndex % NODES.length ? 'leader' : ''}`}
            >
              <span className="turns-label">{node}</span>
              {i === slotIndex % NODES.length && (
                <span className="turns-badge">produces</span>
              )}
            </div>
          ))}
        </div>
        <div className="turns-chain">
          {Array.from({ length: Math.max(1, slotIndex + 1) }, (_, j) => (
            <span key={j} className="turns-chain-segment">
              {j > 0 && <span className="turns-chain-arrow" aria-hidden>←</span>}
              <span className="turns-chain-block">■</span>
            </span>
          ))}
        </div>
        <div className="turns-slots">
          {Array.from({ length: SLOT_COUNT }, (_, i) => {
            const producer = NODES[i % NODES.length]
            const isCurrent = i === slotIndex
            return (
              <div
                key={i}
                className={`turns-slot ${isCurrent ? 'current' : ''}`}
              >
                <span className="turns-slot-num">slot {i + 1}</span>
                <span className="turns-slot-leader">{producer}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
