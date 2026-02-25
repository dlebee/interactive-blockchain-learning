import { useState, useEffect, useRef, useCallback } from 'react'
import './ReplaceCancelDemo.css'

type Tx = { id: string; fee: number; label: string }

const BLOCK_DELAY = 2200
const REPLACE_DISPLAY_MS = 1000

const BLOCKS_DATA: Tx[][] = [
  [
    { id: 'a', fee: 0.09, label: 'tx A' },
    { id: 'b', fee: 0.08, label: 'tx B' },
    { id: 'c', fee: 0.07, label: 'tx C' },
  ],
  [
    { id: 'd', fee: 0.06, label: 'tx D' },
    { id: 'e', fee: 0.05, label: 'tx E' },
    { id: 'f', fee: 0.04, label: 'tx F' },
  ],
  [
    { id: 'g', fee: 0.035, label: 'tx G' },
    { id: 'h', fee: 0.033, label: 'tx H' },
    { id: 'i', fee: 0.031, label: 'tx I' },
  ],
  [
    { id: 'j', fee: 0.03, label: 'tx J' },
    { id: 'k', fee: 0.029, label: 'tx K' },
    { id: 'l', fee: 0.028, label: 'tx L' },
  ],
]

const YOURS = { id: 'mine', fee: 0.02, label: 'yours' }
const STAY_IN_MEMPOOL: Tx[] = [
  { id: 'm', fee: 0.018, label: 'tx M' },
  { id: 'n', fee: 0.015, label: 'tx N' },
  { id: 'o', fee: 0.012, label: 'tx O' },
]
const ALL_MEMPOOL: Tx[] = [...BLOCKS_DATA.flat(), ...STAY_IN_MEMPOOL]

type Phase = 'filling' | 'replacing' | 'done'

export function ReplaceCancelDemo() {
  const [blocks, setBlocks] = useState<Tx[][]>([])
  const [mempool, setMempool] = useState<Tx[]>(() => [...ALL_MEMPOOL, { ...YOURS }])
  const [phase, setPhase] = useState<Phase>('filling')
  const runIdRef = useRef(0)
  const cleanupRef = useRef<() => void>(() => {})

  const startDemo = useCallback(() => {
    cleanupRef.current()
    runIdRef.current += 1
    const currentRun = runIdRef.current
    const timeouts: ReturnType<typeof setTimeout>[] = []

    setBlocks([])
    setMempool([...ALL_MEMPOOL, { ...YOURS }])
    setPhase('filling')

    const schedule = (fn: () => void, ms: number) => {
      timeouts.push(
        setTimeout(() => {
          if (currentRun !== runIdRef.current) return
          fn()
        }, ms)
      )
    }

    let delay = 600

    for (let i = 0; i < BLOCKS_DATA.length; i++) {
      const block = BLOCKS_DATA[i]
      const isBlock4 = i === 3

      schedule(() => {
        setBlocks((prev) => [...prev, block])
        setMempool((prev) =>
          prev.filter((t) => !block.some((b) => b.id === t.id))
        )
        if (isBlock4) {
          setPhase('replacing')
        }
      }, delay)

      if (isBlock4) {
        delay += REPLACE_DISPLAY_MS
        schedule(() => {
          setPhase('done')
          setMempool((prev) => prev.filter((t) => t.id !== 'mine'))
        }, delay)
      }
      delay += BLOCK_DELAY
    }

    const cleanup = () => timeouts.forEach(clearTimeout)
    cleanupRef.current = cleanup
    return cleanup
  }, [])

  useEffect(() => {
    const cleanup = startDemo()
    return cleanup
  }, [startDemo])

  const chainBlocks = [...blocks]
  if (phase === 'done') {
    chainBlocks.push([
      { id: 'mine', fee: 0.1, label: 'yours' },
    ])
  }

  const others = mempool.filter((t) => t.id !== 'mine')
  const showYours = mempool.some((t) => t.id === 'mine') && phase !== 'replacing' && phase !== 'done'
  const showReplacement = phase === 'replacing'

  return (
    <div className="replace-demo">
      <div className="replace-layout">
        <div className="replace-chain-section">
          <span className="replace-chain-label">Blockchain</span>
          <div className="replace-chain">
            {chainBlocks.map((block, i) => (
              <div key={i} className="replace-chain-link">
                {i > 0 && <span className="replace-block-arrow" aria-hidden>←</span>}
                <div className="replace-block-item">
                  <span className="replace-block-num">Block {i + 1}</span>
                  <div className="replace-block-slots">
                    {block.map((tx) => (
                      <div key={tx.id} className="replace-slot">
                        <span className="replace-slot-tx">
                          {tx.label}{' '}
                          <span className="replace-fee">{tx.fee.toFixed(2)}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="replace-flow-zone" aria-hidden>
          <span className="replace-flow-arrow">↑</span>
        </div>

        <div className="replace-mempool-section">
          <span className="replace-label">Mempool</span>
          <div className="replace-yours-row">
            {showYours && (
              <div className="replace-tx replace-mine">
                <span>{YOURS.label}</span>
                <span className="replace-fee">{YOURS.fee.toFixed(2)}</span>
              </div>
            )}
            {showReplacement && (
              <div className="replace-tx replace-mine replace-mempool-replace">
                <span>yours</span>
                <span className="replace-fee-transition">
                  <span className="replace-fee-old">0.02</span>
                  <span className="replace-arrow"> → </span>
                  <span className="replace-fee">0.10</span>
                </span>
              </div>
            )}
          </div>
          <div className="replace-mempool-list">
            {others.map((tx) => (
              <div key={tx.id} className="replace-tx">
                <span>{tx.label}</span>
                <span className="replace-fee">{tx.fee.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className="replace-caption">
        Four blocks fill while yours stays deprioritized. During Block 4, replace in the mempool
        with a higher fee (0.02 → 0.10); yours gets included in Block 5.
      </p>
      <button type="button" className="replace-reset" onClick={startDemo}>
        Replay
      </button>
    </div>
  )
}
