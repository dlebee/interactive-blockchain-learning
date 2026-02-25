import { useState } from 'react'
import './NodeMessageAuthDemo.css'

const STEPS = [
  {
    title: 'Same as user transactions',
    text: 'Nodes authenticate messages the same way users sign transactions. Each node has a keypair: a private key to sign, and a public key that others use to verify. The public key is often used as the node\'s peer identifier on the network.',
    visual: 'keypair',
  },
  {
    title: 'Sign before sending',
    text: 'When a node sends a gossip message (e.g. a transaction or block proposal), it signs the message with its private key. Only that node can produce a valid signature.',
    visual: 'sign',
  },
  {
    title: 'Others verify',
    text: 'Receiving nodes verify the signature using the sender\'s public key. If it checks out, they know the message came from that node and was not tampered with. They can then forward it.',
    visual: 'verify',
  },
  {
    title: 'Original sender and peer auth',
    text: 'Authentication happens between peers at each hop. The message can also include the original sender\'s signature (e.g. from A) so the final receiver (e.g. C) knows who it came from, even after it was relayed. The same applies to transactions: the user signs, and that signature stays in the tx so any node can verify the origin.',
    visual: 'original-sig',
  },
]

export function NodeMessageAuthDemo() {
  const [step, setStep] = useState(0)
  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  return (
    <div className="node-auth-demo">
      <div className="node-auth-demo-card">
        <div className="node-auth-step-indicator">
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
        <p className="node-auth-demo-text">{current.text}</p>

        <div className={`node-auth-visual node-auth-visual-${current.visual}`}>
          {current.visual === 'keypair' && (
            <div className="auth-diagram">
              <div className="auth-node">
                <span className="auth-node-label">Node</span>
                <div className="auth-key private">Private key (sign)</div>
                <div className="auth-key public">Public key (verify)</div>
              </div>
            </div>
          )}
          {current.visual === 'sign' && (
            <div className="auth-flow">
              <div className="flow-step">
                <span className="flow-label">Message</span>
                <code>some information a node wants to transfer</code>
              </div>
              <div className="flow-arrow">+ private key →</div>
              <div className="flow-step signed">
                <span className="flow-label">Signed message</span>
                <code>msg + signature</code>
              </div>
            </div>
          )}
          {current.visual === 'verify' && (
            <div className="auth-flow">
              <div className="flow-step signed">
                <span className="flow-label">Signed message</span>
                <code>msg + signature</code>
              </div>
              <div className="flow-arrow">+ public key →</div>
              <div className="flow-step verified">
                <span className="flow-label">Verified</span>
                <span className="verify-check">✓</span>
              </div>
            </div>
          )}
          {current.visual === 'original-sig' && (
            <div className="auth-original">
              <div className="original-row">
                <span className="original-label">Peer auth:</span>
                <span>each hop verifies</span>
              </div>
              <div className="original-row">
                <span className="original-label">Original sig:</span>
                <span>in the message, receiver verifies origin</span>
              </div>
              <div className="original-row tx-note">
                <span className="original-label">Transactions:</span>
                <span>user signs, signature travels with tx</span>
              </div>
            </div>
          )}
        </div>

        <div className="node-auth-demo-actions">
          {isLast ? (
            <span className="node-auth-completed">Completed!</span>
          ) : (
            <button
              type="button"
              className="next-btn"
              onClick={() => setStep((s) => Math.min(s + 1, STEPS.length - 1))}
            >
              Next
            </button>
          )}
          <button type="button" className="start-over-btn" onClick={() => setStep(0)}>
            Start over
          </button>
        </div>
      </div>

    </div>
  )
}
