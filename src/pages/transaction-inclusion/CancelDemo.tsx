import { useState, useEffect } from 'react'
import './CancelDemo.css'

export function CancelDemo() {
  const [phase, setPhase] = useState<'stuck' | 'replacing' | 'done'>('stuck')

  useEffect(() => {
    if (phase === 'stuck') {
      const t = setTimeout(() => setPhase('replacing'), 2000)
      return () => clearTimeout(t)
    }
    if (phase === 'replacing') {
      const t = setTimeout(() => setPhase('done'), 1200)
      return () => clearTimeout(t)
    }
  }, [phase])

  return (
    <div className="cancel-demo">
      <div className="cancel-layout">
        <div className="cancel-slot-card">
          <span className="cancel-slot-label">Nonce slot</span>
          <div className="cancel-slot-content">
            {phase === 'stuck' && (
              <div className="cancel-tx cancel-stuck">
                <span className="cancel-tx-op">swap ETH</span>
                <span className="cancel-tx-fee">fee 0.02</span>
              </div>
            )}
            {phase === 'replacing' && (
              <div className="cancel-tx-row">
                <div className="cancel-tx cancel-stuck cancel-fading">
                  <span className="cancel-tx-op">swap ETH</span>
                  <span className="cancel-tx-fee cancel-fee-old">0.02</span>
                </div>
                <div className="cancel-tx cancel-new cancel-slide-in">
                  <span className="cancel-tx-op">0 → self</span>
                  <span className="cancel-tx-fee">fee 0.03</span>
                </div>
              </div>
            )}
            {phase === 'done' && (
              <div className="cancel-tx cancel-new">
                <span className="cancel-tx-op">0 → self</span>
                <span className="cancel-tx-fee">fee 0.03</span>
              </div>
            )}
          </div>
        </div>

        <div className="cancel-flow">
          <span className="cancel-arrow">→</span>
          <span className="cancel-status">
            {phase === 'stuck' && 'Waiting…'}
            {phase === 'replacing' && 'Replacing…'}
            {phase === 'done' && 'Slot freed ✓'}
          </span>
        </div>
      </div>

      <p className="cancel-caption">
        Cancel: same nonce, 0 transfer to yourself. You pay the fee to free the slot.
      </p>

      {phase === 'done' && (
        <button type="button" className="cancel-reset" onClick={() => setPhase('stuck')}>
          Replay
        </button>
      )}
    </div>
  )
}
