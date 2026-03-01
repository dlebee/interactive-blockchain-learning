import { useState } from 'react'
import './RollupsDemo.css'

type RollupMode = 'optimistic' | 'zk'

interface Tx {
  id: number
  label: string
}

interface BatchPost {
  id: number
  txCount: number
  stateRoot: string
  mode: RollupMode
}

const TX_LABELS = ['Transfer', 'Swap', 'Mint', 'Approve', 'Stake', 'Bridge', 'Vote', 'Burn']
const INITIAL_TXS: Tx[] = TX_LABELS.slice(0, 5).map((label, i) => ({ id: i, label }))

function shortHash(seed: number): string {
  const chars = '0123456789abcdef'
  let h = '0x'
  for (let i = 0; i < 8; i++) {
    h += chars[((seed * 31 + i * 17) >>> 0) % 16]
  }
  return h + '...'
}

export function RollupsDemo() {
  const [mode, setMode] = useState<RollupMode>('optimistic')
  const [pendingTxs, setPendingTxs] = useState<Tx[]>(INITIAL_TXS)
  const [l1Posts, setL1Posts] = useState<BatchPost[]>([])
  const [nextId, setNextId] = useState(INITIAL_TXS.length)

  function addTx() {
    setNextId((id) => {
      const label = TX_LABELS[id % TX_LABELS.length]
      setPendingTxs((txs) => [...txs, { id, label }])
      return id + 1
    })
  }

  function batchAndPost() {
    if (pendingTxs.length === 0) return
    const count = pendingTxs.length
    setL1Posts((posts) => [
      ...posts,
      {
        id: posts.length,
        txCount: count,
        stateRoot: shortHash(nextId + posts.length),
        mode,
      },
    ])
    setPendingTxs([])
  }

  function reset() {
    setPendingTxs(INITIAL_TXS)
    setL1Posts([])
    setNextId(INITIAL_TXS.length)
  }

  const batchedTxCount = l1Posts.reduce((sum, p) => sum + p.txCount, 0)

  return (
    <div className="rollups-demo">
      <div className="rollups-mode-toggle">
        <button
          className={`rollups-mode-btn ${mode === 'optimistic' ? 'active' : ''}`}
          onClick={() => setMode('optimistic')}
        >
          Optimistic
        </button>
        <button
          className={`rollups-mode-btn ${mode === 'zk' ? 'active' : ''}`}
          onClick={() => setMode('zk')}
        >
          ZK
        </button>
      </div>

      <div className="rollups-zones">
        <div className="rollups-zone">
          <div className="rollups-zone-title">L2 Pending</div>
          <div className="rollups-tx-list">
            {pendingTxs.length === 0 && (
              <span className="rollups-empty">No pending transactions</span>
            )}
            {pendingTxs.map((tx) => (
              <div key={tx.id} className="rollups-tx">
                {tx.label}
              </div>
            ))}
          </div>
          <div className="rollups-zone-actions">
            <button className="rollups-btn" onClick={addTx}>
              + Add tx
            </button>
            <button
              className="rollups-btn rollups-btn-primary"
              onClick={batchAndPost}
              disabled={pendingTxs.length === 0}
            >
              Batch & Post to L1
            </button>
          </div>
        </div>

        <div className="rollups-arrow" aria-hidden="true">
          →
        </div>

        <div className="rollups-zone rollups-zone-l1">
          <div className="rollups-zone-title">L1 Chain</div>
          <div className="rollups-post-list">
            {l1Posts.length === 0 && (
              <span className="rollups-empty">No batches posted yet</span>
            )}
            {l1Posts.map((post) => (
              <div
                key={post.id}
                className={`rollups-post rollups-post-${post.mode}`}
              >
                <div className="rollups-post-header">
                  <span className="rollups-post-count">{post.txCount} txs</span>
                  <span className={`rollups-finality-badge rollups-finality-${post.mode}`}>
                    {post.mode === 'zk' ? 'Instant finality' : '~7 day window'}
                  </span>
                </div>
                <div className="rollups-post-root">State root: {post.stateRoot}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {batchedTxCount > 0 && (
        <div className="rollups-stat">
          {batchedTxCount} transaction{batchedTxCount !== 1 ? 's' : ''} → {l1Posts.length} L1
          post{l1Posts.length !== 1 ? 's' : ''}
        </div>
      )}

      <div className="rollups-controls">
        <button className="rollups-btn" onClick={reset}>
          Reset
        </button>
      </div>

      <p className="rollups-caption">
        {mode === 'optimistic'
          ? 'Optimistic: batches are assumed valid. A 7-day challenge window allows fraud proofs before finality.'
          : 'ZK: a validity proof is generated for each batch. The L1 verifies it instantly, with no waiting period needed.'}
      </p>
    </div>
  )
}
