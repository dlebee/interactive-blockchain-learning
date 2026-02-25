import { useState, useEffect } from 'react'
import './ConsensusVerifyDemo.css'

const NODES = ['A', 'B', 'C', 'D', 'E', 'F']
const CONFIRMED_BLOCKS = 4
const CONFIRMED_HASHES = ['a1b2…', 'c3d4…', 'e5f6…', '8f2a…']
const PROPOSED_HASH = '7a3f…'
// Author (A) finishes first; others at different times
const VERIFY_DELAYS_MS = [400, 900, 1200, 1500, 1800, 2100]
const CYCLE_MS = 4500

function runCycle(
  setHasBlock: (fn: (h: Record<number, boolean>) => Record<number, boolean>) => void,
  setVerified: (fn: (v: Record<number, boolean>) => Record<number, boolean>) => void
) {
  setHasBlock(() => ({}))
  setVerified(() => ({}))

  const timers: ReturnType<typeof setTimeout>[] = []
  NODES.forEach((_, i) => {
    timers.push(
      setTimeout(() => setHasBlock((h) => ({ ...h, [i]: true })), i * 180)
    )
    timers.push(
      setTimeout(() => setVerified((v) => ({ ...v, [i]: true })), VERIFY_DELAYS_MS[i])
    )
  })
  return () => timers.forEach(clearTimeout)
}

export function ConsensusVerifyDemo() {
  const [verified, setVerified] = useState<Record<number, boolean>>({})
  const [hasBlock, setHasBlock] = useState<Record<number, boolean>>({})

  useEffect(() => {
    let cleanup: (() => void) | undefined
    const tick = () => {
      cleanup?.()
      cleanup = runCycle(setHasBlock, setVerified)
    }
    tick()
    const restart = setInterval(tick, CYCLE_MS)
    return () => {
      cleanup?.()
      clearInterval(restart)
    }
  }, [])

  return (
    <div className="consensus-verify-demo">
      <div className="verify-grid">
        <div className="verify-grid-header">
          <span className="verify-row-label" />
          {NODES.map((label, i) => (
            <span key={label} className={`verify-col-label ${i === 0 ? 'author' : ''}`}>
              {i === 0 ? `${label} (author)` : label}
            </span>
          ))}
        </div>
        {Array.from({ length: CONFIRMED_BLOCKS }, (_, row) => (
          <div key={row} className="verify-grid-row">
            <span className="verify-row-label">{row}</span>
            {NODES.map((_, col) => (
              <span key={`${row}-${col}`} className="verify-cell confirmed">
                {CONFIRMED_HASHES[row]}
              </span>
            ))}
          </div>
        ))}
        <div className="verify-grid-row proposed">
          <span className="verify-row-label">{CONFIRMED_BLOCKS}</span>
          {NODES.map((_, i) => (
            <span
              key={i}
              className={`verify-cell pending ${hasBlock[i] ? 'received' : ''} ${verified[i] ? 'verified' : ''}`}
            >
              {!hasBlock[i] && '…'}
              {hasBlock[i] && !verified[i] && <span className="verify-computing">…</span>}
              {verified[i] && (
                <span className="verify-hash">{PROPOSED_HASH} ✓</span>
              )}
            </span>
          ))}
        </div>
      </div>
      <p className="verify-caption">
        Block chains as rows, nodes as columns. All nodes execute the proposed block and reach agreement on the hash.
      </p>
    </div>
  )
}
