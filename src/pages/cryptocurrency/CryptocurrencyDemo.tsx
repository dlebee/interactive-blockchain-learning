import { useState } from 'react'
import { Link } from 'react-router-dom'
import './CryptocurrencyDemo.css'

const STEPS = [
  {
    title: 'Blockchains need incentives',
    text: 'Operators run the network. Why would anyone do that for free? Blockchains assume people respond to incentives, not altruism. So the protocol rewards them.',
    visual: 'incentives',
  },
  {
    title: 'The reward: native currency',
    text: 'Users pay fees when they send transactions. Those fees go to operators. Plus, the protocol can mint new tokens as block rewards. Together, this currency keeps the system running.',
    visual: 'currency-flow',
  },
  {
    title: 'Why "crypto" currency?',
    text: 'The name comes from two pieces: cryptography secures the chain (as you saw in Accounts), and currency rewards operators. Put them together.',
    visual: 'equation',
  },
  {
    title: 'Cryptography + Currency',
    text: 'Asymmetric encryption, hashing, and signatures keep everything secure. The native token pays the people who maintain it. That is cryptocurrency.',
    visual: 'equation-highlight',
  },
]

export function CryptocurrencyDemo() {
  const [step, setStep] = useState(0)
  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  return (
    <div className="crypto-demo">
      <div className="crypto-demo-card">
        <div className="crypto-demo-step-indicator">
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
        <p className="crypto-demo-text">{current.text}</p>

        <div className={`crypto-demo-visual crypto-demo-visual-${current.visual}`}>
          {current.visual === 'incentives' && (
            <div className="incentive-diagram">
              <div className="diagram-node user-node">
                <span className="node-label">User</span>
                <span className="node-detail">pays fees</span>
              </div>
              <div className="diagram-arrow">
                <span className="arrow-label">fee</span>
                <div className="arrow-line" />
              </div>
              <div className="diagram-node operator-node">
                <span className="node-label">Operator</span>
                <span className="node-detail">earns crypto</span>
              </div>
            </div>
          )}

          {current.visual === 'currency-flow' && (
            <div className="flow-diagram">
              <div className="flow-row">
                <div className="flow-box user-box">User sends tx + fee</div>
                <div className="flow-coin">+0.001</div>
                <div className="flow-box operator-box">Operator includes it</div>
              </div>
              <div className="flow-result">
                Operator balance: <strong>+0.001</strong> crypto
              </div>
            </div>
          )}

          {(current.visual === 'equation' || current.visual === 'equation-highlight') && (
            <div className={`crypto-equation ${current.visual === 'equation-highlight' ? 'highlight' : ''}`}>
              <div className="equation-part crypto-part">Cryptography</div>
              <div className="equation-plus">+</div>
              <div className="equation-part currency-part">Currency</div>
              <div className="equation-equals">=</div>
              <div className="equation-result">Cryptocurrency</div>
            </div>
          )}
        </div>

        <div className="crypto-demo-actions">
          {isLast ? (
            <span className="crypto-demo-completed">Completed!</span>
          ) : (
            <button
              type="button"
              className="next-btn"
              onClick={() => setStep((s) => Math.min(s + 1, STEPS.length - 1))}
            >
              Next
            </button>
          )}
          <button
            type="button"
            className="start-over-btn"
            onClick={() => setStep(0)}
          >
            Start over
          </button>
        </div>
      </div>

      <p className="crypto-demo-note">
        Want to revisit the cryptography behind it?{' '}
        <Link to="/wallet">Accounts</Link>
      </p>
    </div>
  )
}
