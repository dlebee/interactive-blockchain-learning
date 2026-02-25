import './FeeModelDemo.css'

const FIXED_TXS = [
  { id: 1, fee: '0.01', label: 'tx 1' },
  { id: 2, fee: '0.01', label: 'tx 2' },
  { id: 3, fee: '0.01', label: 'tx 3' },
]

const COMPETITIVE_TXS = [
  { id: 1, fee: '0.02', label: 'tx A' },
  { id: 2, fee: '0.08', label: 'tx B' },
  { id: 3, fee: '0.05', label: 'tx C' },
]
const COMPETITIVE_SORTED = [...COMPETITIVE_TXS].sort(
  (a, b) => parseFloat(b.fee) - parseFloat(a.fee)
)

const MIXED_BASE = '0.01'
const MIXED_TXS = [
  { id: 1, tip: '0.01', label: 'tx X' },
  { id: 2, tip: '0.04', label: 'tx Y' },
  { id: 3, tip: '0.02', label: 'tx Z' },
]
const MIXED_SORTED = [...MIXED_TXS].sort(
  (a, b) => parseFloat(b.tip) - parseFloat(a.tip)
)

export function FeeModelDemo() {
  return (
    <div className="fee-model-demo">
      <section className="fee-model-section">
        <h3 className="fee-model-subtitle">Fixed fee</h3>
        <div className="fee-model-panel fee-animate-in" style={{ animationDelay: '0ms' }}>
          <div className="fee-queue">
            <span className="fee-queue-label">Mempool (FIFO)</span>
            {FIXED_TXS.map((tx, i) => (
              <div key={tx.id} className="fee-tx fixed-tx fee-tx-stagger" style={{ animationDelay: `${i * 80}ms` }}>
                <span className="tx-label">{tx.label}</span>
                <span className="tx-fee">{tx.fee}</span>
              </div>
            ))}
          </div>
          <div className="fee-arrow fee-arrow-pulse">→</div>
          <div className="fee-block">
            <span className="fee-block-label">Block</span>
            <div className="fee-block-txs">
              {FIXED_TXS.map((tx, i) => (
                <span key={tx.id} className="block-tx fee-tx-stagger" style={{ animationDelay: `${150 + i * 80}ms` }}>{tx.label}</span>
              ))}
            </div>
            <span className="fee-block-hint">Same fee, first come first served</span>
          </div>
        </div>
      </section>

      <section className="fee-model-section">
        <h3 className="fee-model-subtitle">Competitive</h3>
        <div className="fee-model-panel fee-animate-in" style={{ animationDelay: '120ms' }}>
          <div className="fee-queue">
            <span className="fee-queue-label">Mempool (by fee)</span>
            {COMPETITIVE_TXS.map((tx, i) => (
              <div key={tx.id} className="fee-tx competitive-tx fee-tx-stagger" style={{ animationDelay: `${i * 80}ms` }}>
                <span className="tx-label">{tx.label}</span>
                <span className="tx-fee">{tx.fee}</span>
              </div>
            ))}
          </div>
          <div className="fee-arrow fee-arrow-pulse">→</div>
          <div className="fee-block">
            <span className="fee-block-label">Block (highest first)</span>
            <div className="fee-block-txs fee-ordered">
              {COMPETITIVE_SORTED.map((tx, i) => (
                <span key={tx.id} className="block-tx fee-tx-stagger" style={{ animationDelay: `${150 + i * 80}ms` }}>
                  {tx.label} <span className="block-tx-fee">({tx.fee})</span>
                </span>
              ))}
            </div>
            <span className="fee-block-hint">You bid for priority</span>
          </div>
        </div>
      </section>

      <section className="fee-model-section">
        <h3 className="fee-model-subtitle">Base + competition</h3>
        <div className="fee-model-panel fee-animate-in" style={{ animationDelay: '240ms' }}>
          <div className="fee-mixed-base fee-base-animate">
            <span className="base-label">Base fee</span>
            <span className="base-value">{MIXED_BASE}</span>
            <span className="base-hint">(protocol adjusts)</span>
          </div>
          <div className="fee-queue">
            <span className="fee-queue-label">Tip (you compete)</span>
            {MIXED_TXS.map((tx, i) => (
              <div key={tx.id} className="fee-tx mixed-tx fee-tx-stagger" style={{ animationDelay: `${i * 80}ms` }}>
                <span className="tx-label">{tx.label}</span>
                <span className="tx-fee">+{tx.tip}</span>
              </div>
            ))}
          </div>
          <div className="fee-arrow fee-arrow-pulse">→</div>
          <div className="fee-block">
            <span className="fee-block-label">Block</span>
            <div className="fee-block-txs fee-ordered">
              {MIXED_SORTED.map((tx, i) => (
                <span key={tx.id} className="block-tx fee-tx-stagger" style={{ animationDelay: `${150 + i * 80}ms` }}>
                  {tx.label}{' '}
                  <span className="block-tx-fee">
                    ({MIXED_BASE}+{tx.tip})
                  </span>
                </span>
              ))}
            </div>
            <span className="fee-block-hint">Base set by protocol, you bid on tip</span>
          </div>
        </div>
      </section>
    </div>
  )
}
