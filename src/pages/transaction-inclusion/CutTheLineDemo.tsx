import { useState, useEffect, useRef } from 'react'
import './CutTheLineDemo.css'

type Tx = { id: string; fee: number; label: string }

const makeTxs = (n: number): Tx[] =>
  Array.from({ length: n }, (_, i) => ({
    id: `t${i}`,
    fee: 0.01 + Math.random() * 0.09,
    label: `tx ${String.fromCharCode(65 + (i % 26))}${i > 25 ? String(i) : ''}`.trim(),
  }))

const SLOTS_PER_BLOCK = 4
const FULL_BLOCKS = 2
const PENDING_SLOTS = 2
const TOTAL_PICKS = FULL_BLOCKS * SLOTS_PER_BLOCK + PENDING_SLOTS
const MEMPOOL_SIZE = 14
const PICK_INTERVAL_MS = 850
const PAUSE_AFTER_MS = 3000

type Block = Tx[]
type ChainState = { confirmed: Block[]; pending: Block }

function pickHighest(queue: Tx[]): Tx | null {
  return [...queue].sort((a, b) => b.fee - a.fee)[0] ?? null
}

function doReset(
  setMempool: (v: Tx[] | ((p: Tx[]) => Tx[])) => void,
  setChainState: (v: ChainState | ((p: ChainState) => ChainState)) => void,
  setPhase: (v: 'filling' | 'paused') => void,
  pickCountRef: { current: number }
) {
  pickCountRef.current = 0
  setChainState({ confirmed: [], pending: [] })
  setMempool(makeTxs(MEMPOOL_SIZE))
  setPhase('filling')
}

export function CutTheLineDemo() {
  const [mempool, setMempool] = useState<Tx[]>(() => makeTxs(MEMPOOL_SIZE))
  const [chainState, setChainState] = useState<ChainState>(() => ({
    confirmed: [],
    pending: [],
  }))
  const [cuttingTx, setCuttingTx] = useState<Tx | null>(null)
  const [phase, setPhase] = useState<'filling' | 'paused'>('filling')
  const pickCountRef = useRef(0)
  const pauseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mempoolRef = useRef(mempool)
  mempoolRef.current = mempool

  const handleReset = () => {
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current)
      pauseTimeoutRef.current = null
    }
    doReset(setMempool, setChainState, setPhase, pickCountRef)
  }

  useEffect(() => {
    if (phase === 'paused') return

    const nextTx = pickHighest(mempool)
    const totalPicked = pickCountRef.current

    if (totalPicked >= TOTAL_PICKS || !nextTx) {
      setPhase('paused')
      pauseTimeoutRef.current = setTimeout(() => {
        doReset(setMempool, setChainState, setPhase, pickCountRef)
        pauseTimeoutRef.current = null
      }, PAUSE_AFTER_MS)
      return () => {
        if (pauseTimeoutRef.current) {
          clearTimeout(pauseTimeoutRef.current)
          pauseTimeoutRef.current = null
        }
      }
    }

    const id = setInterval(() => {
      if (pickCountRef.current >= TOTAL_PICKS) return
      const tx = pickHighest(mempoolRef.current)
      if (!tx) return

      setCuttingTx(tx)

      setTimeout(() => {
        setMempool((q) => q.filter((t) => t.id !== tx.id))
        pickCountRef.current += 1

        setChainState((s) => {
          const next = [...s.pending, tx]
          if (next.length >= SLOTS_PER_BLOCK) {
            return { confirmed: [...s.confirmed, next], pending: [] }
          }
          return { ...s, pending: next }
        })
        setCuttingTx(null)
      }, 420)
    }, PICK_INTERVAL_MS)

    return () => clearInterval(id)
  }, [mempool, chainState.pending, phase])

  return (
    <div className="cut-demo">
      <div className="cut-layout">
        {/* Blockchain on top */}
        <div className="cut-chain-section">
          <span className="cut-chain-label">Blockchain</span>
          <div className="cut-chain">
            {chainState.confirmed.map((block, i) => (
              <div key={i} className="cut-chain-link">
                {i > 0 && <span className="cut-block-arrow" aria-hidden>←</span>}
                <div className="cut-block-item cut-block-confirmed">
                  <span className="cut-block-num">Block {i + 1}</span>
                  <div className="cut-block-slots">
                    {block.map((tx) => (
                      <div key={tx.id} className="cut-slot">
                        <span className="cut-slot-tx prev-tx">
                          {tx.label}{' '}
                          <span className="cut-slot-fee">{tx.fee.toFixed(2)}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            <div className="cut-chain-link">
              {chainState.confirmed.length > 0 && (
                <span className="cut-block-arrow" aria-hidden>←</span>
              )}
              <div
                className={`cut-block-item cut-block-pending ${cuttingTx ? 'receiving' : ''}`}
              >
                <span className="cut-block-num">Pending</span>
                <div className="cut-block-slots">
                  {Array.from({ length: SLOTS_PER_BLOCK }, (_, slotIdx) => (
                    <div key={slotIdx} className="cut-slot">
                      {chainState.pending[slotIdx] ? (
                        <span className="cut-slot-tx">
                          {chainState.pending[slotIdx]!.label}{' '}
                          <span className="cut-slot-fee">
                            {chainState.pending[slotIdx]!.fee.toFixed(2)}
                          </span>
                        </span>
                      ) : (
                        <span className="cut-slot-empty">—</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Flow arrow: mempool → block */}
        <div className="cut-flow-zone" aria-hidden>
          {cuttingTx && (
            <span className="cut-flying-tx" key={cuttingTx.id}>
              {cuttingTx.label} {cuttingTx.fee.toFixed(2)}
            </span>
          )}
          <span className="cut-flow-arrow">↑</span>
        </div>

        {/* Mempool at bottom */}
        <div className="cut-mempool-section">
          <span className="cut-queue-label">Mempool (arrival order)</span>
          <div className="cut-mempool">
            {mempool.map((tx) => (
              <div
                key={tx.id}
                className={`cut-tx ${cuttingTx?.id === tx.id ? 'cutting' : ''}`}
              >
                <span className="cut-tx-label">{tx.label}</span>
                <span className="cut-tx-fee">{tx.fee.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="cut-footer">
        <p className="cut-caption">
          Two blocks fill, pending block starts. Mempool drains but some txs wait.
        </p>
        <button type="button" className="cut-reset-btn" onClick={handleReset}>
          Reset
        </button>
      </div>
    </div>
  )
}
