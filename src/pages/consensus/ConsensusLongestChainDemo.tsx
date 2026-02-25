import { useState, useEffect } from 'react'
import './ConsensusLongestChainDemo.css'

const CHAINS = [
  [1, 2, 3, 4],
  [1, 2, 3, 4, 5, 6],
  [1, 2, 3],
]
const LONGEST_INDEX = 1

export function ConsensusLongestChainDemo() {
  const [choosing, setChoosing] = useState(false)
  const [chosen, setChosen] = useState(false)

  useEffect(() => {
    let t1: ReturnType<typeof setTimeout> | undefined
    let t2: ReturnType<typeof setTimeout> | undefined
    const id = setInterval(() => {
      setChoosing(true)
      setChosen(false)
      t1 = setTimeout(() => setChosen(true), 400)
      t2 = setTimeout(() => {
        setChoosing(false)
        setChosen(false)
      }, 1600)
    }, 2400)
    return () => {
      clearInterval(id)
      if (t1) clearTimeout(t1)
      if (t2) clearTimeout(t2)
    }
  }, [])

  return (
    <div className="longest-chain-demo">
      <div className="longest-chains">
        {CHAINS.map((blocks, chainIndex) => (
          <div
            key={chainIndex}
            className={`longest-chain-row ${chainIndex === LONGEST_INDEX && chosen ? 'selected' : ''}`}
          >
            <span className="longest-chain-label">
              chain {chainIndex + 1} ({blocks.length})
            </span>
            <div className="longest-chain-blocks">
              {blocks.map((_, j) => (
                <span key={j} className="longest-chain-segment">
                  {j > 0 && <span className="longest-arrow" aria-hidden>←</span>}
                  <span className="longest-block">■</span>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="longest-node-join">
        {choosing && (
          <div className="new-node-choosing">
            <span className="new-node-label">new node</span>
            <span className="new-node-arrow">→</span>
            <span className="new-node-target">
              chooses longest
            </span>
          </div>
        )}
      </div>
      <p className="longest-caption">
        New nodes join and pick the chain with the most blocks.
      </p>
    </div>
  )
}
