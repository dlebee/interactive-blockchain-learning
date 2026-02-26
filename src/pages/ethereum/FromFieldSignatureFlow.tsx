import { useState } from 'react'
import './FromFieldSignatureFlow.css'

const STEPS = [
  {
    title: 'Private key',
    text: 'You hold the private key. It never leaves your device. You use it to sign the transaction.',
    stepIndex: 0,
  },
  {
    title: 'Sign',
    text: 'You sign the transaction with your private key. ECDSA produces a signature (R, S, V) that is attached to the transaction.',
    stepIndex: 1,
  },
  {
    title: 'R, S, V',
    text: 'The signature is three values: R, S (32 bytes each), and V (recovery id). You send the transaction with this signature; the chain receives it.',
    stepIndex: 2,
  },
  {
    title: 'Recover',
    text: 'The chain recovers the public key from R, S, V using the elliptic curve recovery algorithm (ECDSA). The chain does this during verification.',
    stepIndex: 3,
  },
  {
    title: 'Public key to address',
    text: 'From the recovered public key, the chain derives the address: Keccak-256 hash of the public key, last 20 bytes. That value is the from address.',
    stepIndex: 4,
  },
  {
    title: 'from',
    text: 'The chain now knows who signed the transaction. The from field is set to this address. It was never sent; the chain derived it from your signature.',
    stepIndex: 5,
  },
]

export function FromFieldSignatureFlow() {
  const [step, setStep] = useState(0)
  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  return (
    <div className="from-signature-flow" aria-label="Who does what: you sign, the chain recovers the from address">
      <div className="from-signature-flow-card">
        <div className="from-signature-flow-step-indicator">
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
        <p className="from-signature-flow-text">{current.text}</p>

        <div className="from-signature-flow-pipeline-wrapper">
          <div className="pipeline-row">
            <span className="pipeline-row-label">You</span>
            <div className="from-signature-flow-pipeline">
              <div className={`pipeline-stage ${step >= 0 ? 'active' : ''} ${step === 0 ? 'current' : ''}`}>
                <div className="stage-icon stage-private-key" title="Private key">
                  <span className="stage-label">key</span>
                </div>
                <span className="stage-name">Private key</span>
              </div>
              <div className={`pipeline-arrow ${step >= 1 ? 'active' : ''}`} />
              <div className={`pipeline-stage ${step >= 1 ? 'active' : ''} ${step === 1 ? 'current' : ''}`}>
                <div className={`stage-icon stage-sign ${step === 1 ? 'working' : ''}`} title="Sign">
                  <span className="stage-label">✎</span>
                </div>
                <span className="stage-name">Sign</span>
              </div>
              <div className={`pipeline-arrow ${step >= 2 ? 'active' : ''}`} />
              <div className={`pipeline-stage ${step >= 2 ? 'active' : ''} ${step === 2 ? 'current' : ''}`}>
                <div className="stage-icon stage-rsv" title="R, S, V">
                  <span className="stage-label">R,S,V</span>
                </div>
                <span className="stage-name">R, S, V</span>
              </div>
            </div>
          </div>
          <div className="pipeline-row pipeline-row-chain">
            <span className="pipeline-row-label">Chain</span>
            <div className="from-signature-flow-pipeline">
              <div className={`pipeline-stage ${step >= 3 ? 'active' : ''} ${step === 3 ? 'current' : ''}`}>
                <div className={`stage-icon stage-recover ${step === 3 ? 'working' : ''}`} title="Recover">
                  <span className="stage-label">⟳</span>
                </div>
                <span className="stage-name">Recover</span>
              </div>
              <div className={`pipeline-arrow ${step >= 4 ? 'active' : ''}`} />
              <div className={`pipeline-stage ${step >= 4 ? 'active' : ''} ${step === 4 ? 'current' : ''}`}>
                <div className="stage-icon stage-pubkey" title="Public key">
                  <span className="stage-label">pub</span>
                </div>
                <span className="stage-name">Public key</span>
              </div>
              <div className={`pipeline-arrow ${step >= 5 ? 'active' : ''}`} />
              <div className={`pipeline-stage ${step >= 5 ? 'active' : ''} ${step === 5 ? 'current' : ''}`}>
                <div className="stage-icon stage-from" title="from">
                  <span className="stage-label">from</span>
                </div>
                <span className="stage-name">from</span>
              </div>
            </div>
          </div>
        </div>

        <div className="from-signature-flow-actions">
          {isLast ? (
            <span className="from-signature-flow-completed">Done</span>
          ) : (
            <button
              type="button"
              className="from-signature-next-btn"
              onClick={() => setStep((s) => Math.min(s + 1, STEPS.length - 1))}
            >
              Next
            </button>
          )}
          <button
            type="button"
            className="from-signature-start-over-btn"
            onClick={() => setStep(0)}
          >
            Start over
          </button>
        </div>
      </div>
    </div>
  )
}
