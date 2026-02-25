import { useState, useEffect } from 'react'
import './PosFinalityDemo.css'

const BLOCK_COUNT = 12
const TICK_MS = 400
const FINALITY_LAG = 3

export function PosFinalityNposDemo() {
  const [blockIndex, setBlockIndex] = useState(0)

  useEffect(() => {
    const cycleLen = BLOCK_COUNT + FINALITY_LAG + 4
    const id = setInterval(() => {
      setBlockIndex((i) => (i + 1) % cycleLen)
    }, TICK_MS)
    return () => clearInterval(id)
  }, [])

  const visibleBlocks = Math.min(blockIndex + 1, BLOCK_COUNT)
  const finalityUpTo = Math.max(0, Math.min(blockIndex - FINALITY_LAG + 1, BLOCK_COUNT))

  return (
    <div className="pos-finality-demo pos-finality-npos">
      <h4 className="pos-finality-subtitle">NPoS-style: One validator authors, all vote on finality (slightly behind)</h4>
      <div className="pos-npos-layout">
        <div className="pos-npos-authorship">
          <span className="pos-npos-section-label">Block authorship</span>
          <div className="pos-npos-blocks">
            {Array.from({ length: BLOCK_COUNT }, (_, i) => (
              <div
                key={i}
                className={`pos-npos-block ${i < visibleBlocks ? 'filled' : ''} ${i === visibleBlocks - 1 && blockIndex < BLOCK_COUNT ? 'latest' : ''}`}
              >
                {i < visibleBlocks ? '■' : '○'}
              </div>
            ))}
          </div>
          <span className="pos-npos-author-hint">V1 authors</span>
        </div>
        <div className="pos-npos-votes">
          <span className="pos-npos-section-label">Voting / finality</span>
          <div className="pos-npos-blocks">
            {Array.from({ length: BLOCK_COUNT }, (_, i) => (
              <div
                key={i}
                className={`pos-npos-block ${i < finalityUpTo ? 'finalized' : i < visibleBlocks ? 'voting' : ''}`}
              >
                {i < finalityUpTo ? '✓' : i < visibleBlocks ? '…' : '○'}
              </div>
            ))}
          </div>
          <span className="pos-npos-vote-hint">All validators vote</span>
        </div>
      </div>
    </div>
  )
}
