import { useState, useEffect } from 'react'
import './SkippedNonceDemo.css'

const STUCK_NONCES = [4, 5, 6]
const ANIMATE_INTERVAL = 1200

export function SkippedNonceDemo() {
  const [shown, setShown] = useState(0)
  const [pulse, setPulse] = useState(false)

  useEffect(() => {
    if (shown >= STUCK_NONCES.length) return
    const t = setTimeout(() => setShown((s) => s + 1), ANIMATE_INTERVAL)
    return () => clearTimeout(t)
  }, [shown])

  useEffect(() => {
    const id = setInterval(() => setPulse((p) => !p), 1500)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="skipped-demo">
      <div className="skipped-layout">
        <div className="skipped-account">
          <span className="skipped-label">Account</span>
          <div className="skipped-confirmed">
            <span className="skipped-sublabel">Confirmed</span>
            <span className="skipped-nonces">0, 1, 2</span>
          </div>
          <div className={`skipped-gap ${pulse ? 'pulse' : ''}`}>
            <span className="skipped-sublabel">Skipped</span>
            <span className="skipped-missing">nonce 3</span>
          </div>
        </div>
        <div className="skipped-arrow">→</div>
        <div className="skipped-future">
          <span className="skipped-future-label">Future queue</span>
          <span className="skipped-future-hint">stuck until nonce 3 is submitted</span>
          <div className="skipped-list">
            {STUCK_NONCES.slice(0, shown).map((n) => (
              <div key={n} className="skipped-tx">
                tx <span className="skipped-num">n={n}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className="skipped-caption">
        Nonce 3 was never sent. Transactions with nonce 4, 5, 6 stay stuck until you submit nonce 3.
      </p>
      {shown >= STUCK_NONCES.length && (
        <button
          type="button"
          className="skipped-reset"
          onClick={() => setShown(0)}
        >
          Replay
        </button>
      )}
    </div>
  )
}
