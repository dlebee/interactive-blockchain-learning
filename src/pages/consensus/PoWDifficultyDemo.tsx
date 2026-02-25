import { useState, useEffect } from 'react'
import './PoWDifficultyDemo.css'


const BLOCKS_PER_ADJUSTMENT = 5
const MAX_BLOCKS = 25

export function PoWDifficultyDemo() {
  const [blockCount, setBlockCount] = useState(0)
  const [difficulty, setDifficulty] = useState(3)
  const [lastAdjustment, setLastAdjustment] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setBlockCount((c) => {
        const next = c + 1
        if (next >= MAX_BLOCKS) return 0
        return next
      })
    }, 600)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const adjustments = Math.floor(blockCount / BLOCKS_PER_ADJUSTMENT)
    if (adjustments > lastAdjustment) {
      setLastAdjustment(adjustments)
      setDifficulty((d) => {
        if (adjustments % 2 === 1) return Math.min(6, d + 1)
        return Math.max(1, d - 1)
      })
    }
    if (blockCount === 0) {
      setLastAdjustment(0)
      setDifficulty(3)
    }
  }, [blockCount, lastAdjustment])

  const isAdjustmentBlock = blockCount > 0 && blockCount % BLOCKS_PER_ADJUSTMENT === 0

  return (
    <div className="pow-difficulty-demo">
      <div className="pow-diff-blocks">
        {Array.from({ length: blockCount }, (_, i) => (
          <span key={i} className="pow-diff-block-wrap">
            {i > 0 && <span className="pow-diff-arrow" aria-hidden>←</span>}
            <span
              className={`pow-diff-block ${(i + 1) % BLOCKS_PER_ADJUSTMENT === 0 && i > 0 ? 'adjustment' : ''}`}
            >
              {i + 1}
            </span>
          </span>
        ))}
      </div>
      <div className="pow-diff-indicator">
        <span className="pow-diff-label">Difficulty:</span>
        <span className="pow-diff-value">{'▮'.repeat(difficulty)}</span>
        {isAdjustmentBlock && (
          <span className="pow-diff-adjusting">adjusting…</span>
        )}
      </div>
      <p className="pow-diff-caption">
        Every {BLOCKS_PER_ADJUSTMENT} blocks, the network recalculates difficulty so block time stays stable.
      </p>
    </div>
  )
}
