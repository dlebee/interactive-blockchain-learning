import { useState, useEffect } from 'react'
import './ConsensusLeaderlessDemo.css'

const NODES = ['A', 'B', 'C']
const RACE_TARGET = 16
const SPEEDS = [0.4, 0.55, 0.3]

export interface ConsensusLeaderlessDemoProps {
  title?: string
  caption?: string
}

export function ConsensusLeaderlessDemo({
  title = 'Leaderless (race)',
  caption = 'Nodes compete; each builds a chain at different speed. The protocol picks a winner when one reaches the goal.',
}: ConsensusLeaderlessDemoProps) {
  const [chainProgress, setChainProgress] = useState([1, 1, 1])

  const chainLengths = chainProgress.map((p) =>
    Math.min(Math.max(1, Math.floor(p)), RACE_TARGET)
  )

  useEffect(() => {
    const id = setInterval(() => {
      setChainProgress((prev) => {
        if (prev.some((p) => p >= RACE_TARGET)) return [1, 1, 1]
        return prev.map((p, i) => p + SPEEDS[i])
      })
    }, 180)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="consensus-leaderless-demo">
      <h4 className="leaderless-title">{title}</h4>
      <p className="leaderless-caption">{caption}</p>
      <div className="leaderless-race-chains">
        {NODES.map((node, i) => (
          <div key={node} className="leaderless-chain-row">
            <span className="leaderless-node-label">{node}</span>
            <div className="leaderless-chain">
              {Array.from({ length: chainLengths[i] }, (_, j) => (
                <span key={j} className="leaderless-chain-segment">
                  {j > 0 && <span className="leaderless-arrow" aria-hidden>←</span>}
                  <span className="leaderless-block">■</span>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
