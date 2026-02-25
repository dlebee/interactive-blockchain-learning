import './PoWHashPuzzleDemo.css'


const GPU_COUNT = 8
const TARGET_HASH = '0000…'

export function PoWHashPuzzleDemo() {
  return (
    <div className="pow-hash-puzzle-demo">
      <div className="pow-gpu-grid">
        {Array.from({ length: GPU_COUNT }, (_, i) => (
          <div key={i} className="pow-gpu-card">
            <div className="pow-gpu-icon">
              <svg viewBox="0 0 40 30" className="pow-gpu-svg">
                <rect x="2" y="4" width="36" height="22" rx="2" fill="rgba(51,65,85,0.8)" stroke="#64748b" strokeWidth="1" />
                <rect x="6" y="8" width="28" height="14" rx="1" fill="rgba(30,41,59,0.6)" />
                {[0, 1, 2].map((j) => (
                  <rect
                    key={j}
                    x={10 + j * 10}
                    y="12"
                    width="6"
                    height="6"
                    rx="1"
                    fill="rgba(6,182,212,0.4)"
                    className="pow-gpu-core"
                  />
                ))}
                <rect x="6" y="24" width="12" height="2" rx="1" fill="rgba(148,163,184,0.4)" />
              </svg>
            </div>
            <span className="pow-gpu-label">GPU {i + 1}</span>
            <span className="pow-gpu-hash">trying nonces…</span>
          </div>
        ))}
      </div>
      <div className="pow-target-row">
        <span className="pow-target-label">Target:</span>
        <code className="pow-target-hash">{TARGET_HASH}</code>
        <span className="pow-target-hint">hash must start with zeros</span>
      </div>
      <p className="pow-hash-caption">
        Miners run hardware (GPUs, ASICs) that try countless nonces. First to find a hash below the target wins.
      </p>
    </div>
  )
}
