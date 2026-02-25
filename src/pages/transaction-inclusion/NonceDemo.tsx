import { useState, useEffect } from 'react'
import './NonceDemo.css'

type Tx = { nonce: number; label: string }

/* Arrive out of order: 2,3 go to future; 0,1 go to mempool; 4 goes to future */
const SEQ: Tx[] = [
  { nonce: 2, label: 'tx A' },
  { nonce: 3, label: 'tx B' },
  { nonce: 0, label: 'tx C' },
  { nonce: 1, label: 'tx D' },
  { nonce: 4, label: 'tx E' },
]

const TOTAL = 5

export function NonceDemo() {
  const [idx, setIdx] = useState(0)
  const [nextNonce, setNextNonce] = useState(0)
  const [mempool, setMempool] = useState<Tx[]>([])
  const [futureQueue, setFutureQueue] = useState<Tx[]>([])
  const [activeTx, setActiveTx] = useState<Tx | null>(null)

  useEffect(() => {
    if (idx >= TOTAL) return

    const tx = SEQ[idx]!
    setActiveTx(tx)

    const t = setTimeout(() => {
      if (tx.nonce === nextNonce) {
        setMempool((m) => [...m, tx])
        setNextNonce((n) => n + 1)
      } else {
        setFutureQueue((f) => [...f, tx].sort((a, b) => a.nonce - b.nonce))
      }
      setActiveTx(null)
      setIdx((i) => i + 1)
    }, 800)

    return () => clearTimeout(t)
  }, [idx, nextNonce])

  return (
    <div className="nonce-demo">
      <div className="nonce-layout">
        <div className="nonce-account">
          <span className="nonce-label">Account</span>
          <span className="nonce-next">next nonce: {nextNonce}</span>
        </div>
        <div className="nonce-arrow" aria-hidden>
          {activeTx && (
            <span className="nonce-flying">
              {activeTx.label} (nonce {activeTx.nonce})
            </span>
          )}
          →
        </div>
        <div className="nonce-targets">
          <div className="nonce-target mempool-target">
            <span className="nonce-target-label">Mempool</span>
            <span className="nonce-target-hint">correct next nonce</span>
            <div className="nonce-list">
              {mempool.map((t) => (
                <div key={`${t.nonce}-${t.label}`} className="nonce-tx mempool-tx">
                  {t.label} <span className="nonce-num">n={t.nonce}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="nonce-target future-target">
            <span className="nonce-target-label">Future queue</span>
            <span className="nonce-target-hint">waiting for earlier nonces</span>
            <div className="nonce-list">
              {futureQueue.map((t) => (
                <div key={`${t.nonce}-${t.label}`} className="nonce-tx future-tx">
                  {t.label} <span className="nonce-num">n={t.nonce}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <p className="nonce-caption">
        Transactions with the correct next nonce go to the mempool. Others wait in the future queue.
      </p>
      {idx >= TOTAL && (
        <button
          type="button"
          className="nonce-reset"
          onClick={() => {
            setIdx(0)
            setNextNonce(0)
            setMempool([])
            setFutureQueue([])
          }}
        >
          Replay
        </button>
      )}
    </div>
  )
}
