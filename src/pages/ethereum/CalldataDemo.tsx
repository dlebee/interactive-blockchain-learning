import { useState } from 'react'
import './CalldataDemo.css'

const STEPS = [
  { title: 'The Solidity function', text: 'We want to call deposit() on WETH9. It is a payable function with no parameters. The ABI and contract address tell us how to build the transaction.', stepIndex: 0 },
  { title: 'Function selector', text: 'The first 4 bytes of the data field are the function selector. It is the first 4 bytes of Keccak-256("deposit()"). That gives us 0xd0e30db0.', stepIndex: 1 },
  { title: 'Encoded arguments', text: 'deposit() has no parameters, so there are no encoded arguments. The data field is just the selector: 0xd0e30db0.', stepIndex: 2 },
  { title: 'The data field', text: 'The complete data field for this call is 0xd0e30db0. That is all the chain needs to know which function to run.', stepIndex: 3 },
  { title: 'Full transaction', text: 'The transaction sends ETH (value) to the WETH9 contract (to), with data 0xd0e30db0. The chain executes deposit() and mints WETH to the sender.', stepIndex: 4 },
]

const SOLIDITY_FUNCTION = 'function deposit() public payable {\n    balanceOf[msg.sender] += msg.value;\n    Deposit(msg.sender, msg.value);\n}'

const SELECTOR_DERIVATION = '"deposit()" -> Keccak-256 -> first 4 bytes -> 0xd0e30db0'

const TX_JSON = '{\n  "to": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",\n  "value": "0x186cc6acd4b0000",\n  "data": "0xd0e30db0"\n}'

const ETHERSCAN_URL = 'https://etherscan.io/tx/0x6f84640d341a626f6ddbbe6ce7d85bdcf482b55be574ea8625ca44a4db7089d3'

export function CalldataDemo() {
  const [step, setStep] = useState(0)
  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  return (
    <div className="calldata-demo" aria-label="Interactive: building calldata for WETH9 deposit">
      <div className="calldata-demo-card">
        <div className="calldata-demo-step-indicator">
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
        <p className="calldata-demo-text">{current.text}</p>

        <div className="calldata-demo-pipeline">
          <div className={`calldata-stage ${step >= 0 ? 'active' : ''} ${step === 0 ? 'current' : ''}`}>
            <div className="calldata-icon calldata-solidity" title="Solidity">
              <span className="calldata-icon-label">fn</span>
            </div>
            <span className="calldata-stage-name">Function</span>
          </div>
          <div className={`calldata-arrow ${step >= 1 ? 'active' : ''}`} />
          <div className={`calldata-stage ${step >= 1 ? 'active' : ''} ${step === 1 ? 'current' : ''}`}>
            <div className={`calldata-icon calldata-selector ${step === 1 ? 'working' : ''}`} title="Selector">
              <span className="calldata-icon-label">#</span>
            </div>
            <span className="calldata-stage-name">Selector</span>
          </div>
          <div className={`calldata-arrow ${step >= 2 ? 'active' : ''}`} />
          <div className={`calldata-stage ${step >= 2 ? 'active' : ''} ${step === 2 ? 'current' : ''}`}>
            <div className="calldata-icon calldata-args" title="Args">
              <span className="calldata-icon-label">[]</span>
            </div>
            <span className="calldata-stage-name">Args</span>
          </div>
          <div className={`calldata-arrow ${step >= 3 ? 'active' : ''}`} />
          <div className={`calldata-stage ${step >= 3 ? 'active' : ''} ${step === 3 ? 'current' : ''}`}>
            <div className="calldata-icon calldata-data" title="Data">
              <span className="calldata-icon-label">0x</span>
            </div>
            <span className="calldata-stage-name">Data</span>
          </div>
          <div className={`calldata-arrow ${step >= 4 ? 'active' : ''}`} />
          <div className={`calldata-stage ${step >= 4 ? 'active' : ''} ${step === 4 ? 'current' : ''}`}>
            <div className="calldata-icon calldata-tx" title="Transaction">
              <span className="calldata-icon-label">tx</span>
            </div>
            <span className="calldata-stage-name">Transaction</span>
          </div>
        </div>

        {current.stepIndex === 0 && (
          <div className="calldata-demo-preview">
            <span className="calldata-preview-label">WETH9 deposit function</span>
            <pre className="calldata-demo-code">{SOLIDITY_FUNCTION}</pre>
          </div>
        )}
        {current.stepIndex === 1 && (
          <div className="calldata-demo-preview calldata-selector-preview">
            <div className="calldata-derivation-formula">{SELECTOR_DERIVATION}</div>
            <div className="calldata-selector-result">
              <span className="calldata-selector-label">Function selector (4 bytes)</span>
              <code className="calldata-selector-value">0xd0e30db0</code>
            </div>
          </div>
        )}
        {current.stepIndex === 2 && (
          <div className="calldata-demo-preview">
            <span className="calldata-preview-label">Encoded arguments</span>
            <p className="calldata-empty-args">None. deposit() has no parameters.</p>
          </div>
        )}
        {current.stepIndex === 3 && (
          <div className="calldata-demo-preview calldata-data-preview">
            <span className="calldata-preview-label">Data field</span>
            <code className="calldata-data-value">0xd0e30db0</code>
          </div>
        )}
        {current.stepIndex === 4 && (
          <div className="calldata-demo-preview calldata-tx-preview">
            <span className="calldata-preview-label">Transaction (to, value, data)</span>
            <pre className="calldata-demo-code">{TX_JSON}</pre>
            <a href={ETHERSCAN_URL} target="_blank" rel="noopener noreferrer" className="calldata-etherscan-link">
              View on Etherscan
            </a>
          </div>
        )}

        <div className="calldata-demo-actions">
          {isLast ? (
            <span className="calldata-demo-completed">Done</span>
          ) : (
            <button type="button" className="calldata-next-btn" onClick={() => setStep((s) => Math.min(s + 1, STEPS.length - 1))}>
              Next
            </button>
          )}
          <button type="button" className="calldata-reset-btn" onClick={() => setStep(0)}>
            Start over
          </button>
        </div>
      </div>
    </div>
  )
}
