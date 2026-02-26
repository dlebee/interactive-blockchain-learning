import { useState } from 'react'
import './BroadcastingStoryboard.css'

const STEPS = [
  {
    title: 'Build & sign',
    text: 'You have built the transaction (to, value, data, nonce, gas) and signed it with your private key. It is ready to send.',
    stepIndex: 0,
  },
  {
    title: 'Broadcast',
    text: 'You send the signed transaction to a node (e.g. via RPC). The node accepts it and propagates it to the network. Your wallet or app typically does this when you confirm.',
    stepIndex: 1,
  },
  {
    title: 'Transaction hash',
    text: 'The blockchain returns a transaction hash. It is derived from the content of your transaction and is unique to this transaction. You use this hash to track inclusion.',
    stepIndex: 2,
  },
  {
    title: 'Check inclusion',
    text: 'You (or your app) can repeatedly query the chain using the transaction hash to see if the transaction has been included in a block. Until then, it is pending.',
    stepIndex: 3,
  },
  {
    title: 'Receipt',
    text: 'When the transaction is included, the chain returns a receipt. The receipt tells you whether the transaction succeeded or failed, the block number, gas used, logs, and other relevant information.',
    stepIndex: 4,
  },
]

const SAMPLE_TX_HASH = '0x7f3b2a1c9e8d4f6a5b0c8e7d6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f'

export function BroadcastingStoryboard() {
  const [step, setStep] = useState(0)
  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  return (
    <div className="broadcasting-storyboard" aria-label="Interactive storyboard: broadcasting a transaction">
      <div className="broadcasting-storyboard-card">
        <div className="broadcasting-storyboard-step-indicator">
          {STEPS.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`step-dot ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}
              onClick={() => setStep(i)}
              aria-label={`Go to step ${i + 1}`}
            />
          ))}
        </div>

        <h3>{current.title}</h3>
        <p className="broadcasting-storyboard-text">{current.text}</p>

        <div className="broadcasting-storyboard-timeline">
          <div className="broadcasting-storyboard-timeline-row">
            <div className={`timeline-stage ${step >= 0 ? 'active' : ''} ${step === 0 ? 'current' : ''}`}>
              <div className="timeline-icon timeline-build" title="Build & sign">
                <span className="timeline-label">&#9998;</span>
              </div>
              <span className="timeline-name">Build & sign</span>
            </div>
            <div className={`timeline-arrow ${step >= 1 ? 'active' : ''}`} />
            <div className={`timeline-stage ${step >= 1 ? 'active' : ''} ${step === 1 ? 'current' : ''}`}>
              <div className={`timeline-icon timeline-broadcast ${step === 1 ? 'working' : ''}`} title="Broadcast">
                <span className="timeline-label">&#8593;</span>
              </div>
              <span className="timeline-name">Broadcast</span>
            </div>
            <div className={`timeline-arrow ${step >= 2 ? 'active' : ''}`} />
            <div className={`timeline-stage ${step >= 2 ? 'active' : ''} ${step === 2 ? 'current' : ''}`}>
              <div className="timeline-icon timeline-hash" title="Transaction hash">
                <span className="timeline-label">#</span>
              </div>
              <span className="timeline-name">Tx hash</span>
            </div>
            <div className={`timeline-arrow ${step >= 3 ? 'active' : ''}`} />
            <div className={`timeline-stage ${step >= 3 ? 'active' : ''} ${step === 3 ? 'current' : ''}`}>
              <div className={`timeline-icon timeline-check ${step === 3 ? 'working' : ''}`} title="Check inclusion">
                <span className="timeline-label">&#8635;</span>
              </div>
              <span className="timeline-name">Check</span>
            </div>
            <div className={`timeline-arrow ${step >= 4 ? 'active' : ''}`} />
            <div className={`timeline-stage ${step >= 4 ? 'active' : ''} ${step === 4 ? 'current' : ''}`}>
              <div className="timeline-icon timeline-receipt" title="Receipt">
                <span className="timeline-label">&#10003;</span>
              </div>
              <span className="timeline-name">Receipt</span>
            </div>
          </div>
          {step >= 2 && step < 4 ? (
            <div className="broadcasting-storyboard-hash-preview">
              <span className="hash-label">Transaction hash (returned)</span>
              <code className="hash-value">{SAMPLE_TX_HASH}</code>
            </div>
          ) : null}
          {step >= 4 ? (
            <div className="broadcasting-storyboard-receipt-preview">
              <span className="receipt-detail"><strong>Status</strong>: success</span>
              <span className="receipt-detail"><strong>Block</strong>: 18,450,221</span>
              <span className="receipt-detail"><strong>Gas used</strong>: 21,000</span>
            </div>
          ) : null}
        </div>

        <div className="broadcasting-storyboard-actions">
          {isLast ? (
            <span className="broadcasting-storyboard-completed">Done</span>
          ) : (
            <button
              type="button"
              className="broadcasting-next-btn"
              onClick={() => setStep((s) => Math.min(s + 1, STEPS.length - 1))}
            >
              Next
            </button>
          )}
          <button
            type="button"
            className="broadcasting-start-over-btn"
            onClick={() => setStep(0)}
          >
            Start over
          </button>
        </div>
      </div>
    </div>
  )
}
