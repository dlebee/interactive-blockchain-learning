import { useState, useEffect } from 'react'
import './ConsensusWhoDemo.css'

const NODES = ['A', 'B', 'C']
const RACE_TARGET = 16
const SPEEDS = [0.4, 0.55, 0.3] // Blocks per tick, different per node

const SLOT_COUNT = 8

export function ConsensusWhoDemo() {
  const [chainProgress, setChainProgress] = useState([1, 1, 1])
  const [slotIndex, setSlotIndex] = useState(0)

  const chainLengths = chainProgress.map((p) =>
    Math.min(Math.max(1, Math.floor(p)), RACE_TARGET)
  )

  // Leaderless: each node builds a chain at different speed (start with 1 block)
  useEffect(() => {
    const id = setInterval(() => {
      setChainProgress((prev) => {
        if (prev.some((p) => p >= RACE_TARGET)) return [1, 1, 1]
        return prev.map((p, i) => p + SPEEDS[i])
      })
    }, 180)
    return () => clearInterval(id)
  }, [])

  // Turns: highlight rotates through A, B, C (10 slots, start with 1 block)
  useEffect(() => {
    const id = setInterval(() => {
      setSlotIndex((i) => (i + 1) % SLOT_COUNT)
    }, 1200)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="consensus-who-demo">
      <div className="who-section">
        <h4 className="who-section-title">Leaderless (race)</h4>
        <p className="who-caption">
          Nodes compete; each builds a chain at different speed. The protocol
          picks a winner when one reaches the goal.
        </p>
        <div className="race-chains">
          {NODES.map((node, i) => (
            <div key={node} className="race-chain-row">
              <span className="race-node-label">{node}</span>
              <div className="race-chain">
                {Array.from({ length: chainLengths[i] }, (_, j) => (
                  <span key={j} className="race-chain-segment">
                    {j > 0 && <span className="race-arrow" aria-hidden>←</span>}
                    <span className="race-block">■</span>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
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
